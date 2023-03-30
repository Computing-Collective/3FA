import os

import numpy as np
import torch
from torch import nn
from torch.utils.data import DataLoader
from torch.utils.data import random_split
from torch.utils.data import Subset
from torchdata.datapipes.iter import Zipper, IterableWrapper
from torchvision import datasets
from torchvision.transforms import ToTensor, Compose, RandomHorizontalFlip, Resize

DATA_PATH = os.path.join("data")
PEOPLE = tuple([name for name in os.listdir(DATA_PATH) if os.path.isdir(os.path.join(DATA_PATH, name))])

img_transforms = Compose([
    RandomHorizontalFlip(),
    ToTensor(),
    Resize((105, 105)),
])


##################################################################
#####                    Data Organization                   #####
##################################################################

# maps: "person" -> datasets.ImageFolder
full_dataset = {}

for person in PEOPLE:
    full_dataset[person] = datasets.ImageFolder(root=os.path.join('data', person), transform=img_transforms)

# maps "person" -> array of booleans of where the anchor, positive, and negative images are in the dataset
is_anchor = {}
is_positive = {}

for person in PEOPLE:
    is_anchor[person] = torch.tensor(full_dataset[person].targets) == 0
    is_positive[person] = torch.tensor(full_dataset[person].targets) == 1

# extract the anchor, positive, and negative img indices
anchor_indices = {}
positive_indices = {}

for person in PEOPLE:
    anchor_indices[person] = is_anchor[person].nonzero().flatten()
    positive_indices[person] = is_positive[person].nonzero().flatten()

# create the anchor, positive, and negative datasets
anchor_dataset = {}
positive_dataset = {}

for person in PEOPLE:
    anchor_dataset[person] = Subset(full_dataset[person], anchor_indices[person])
    positive_dataset[person] = Subset(full_dataset[person], positive_indices[person])

# Now, the datasets are [(img, label), (img, label), (img, label), ...]. We need them to be [img, img, img, ...] only, no label needed since they are already split by label.
# WARNING: this takes about 2 minutes to run, please only run it once
for person in PEOPLE:
    anchor_dataset[person] = [sublist[0] for sublist in list(anchor_dataset[person])]
    positive_dataset[person] = [sublist[0] for sublist in list(positive_dataset[person])]

# Zip other people's positives to make each negative
negative_dataset = {}

for person in PEOPLE:
    negative_dataset[person] = []
    for other_person in PEOPLE:
        if other_person == person:
            continue
        negative_dataset[person].extend(positive_dataset[other_person])

zipped_pos_dataset = {}
zipped_neg_dataset = {}

for person in PEOPLE:
    zipped_pos_dataset[person] = Zipper(IterableWrapper(anchor_dataset[person]), IterableWrapper(positive_dataset[person]), IterableWrapper(torch.ones(len(anchor_dataset[person]))))
    zipped_neg_dataset[person] = Zipper(IterableWrapper(anchor_dataset[person]), IterableWrapper(negative_dataset[person]), IterableWrapper(torch.zeros(len(anchor_dataset[person]))))

    zipped_pos_dataset[person] = list(zipped_pos_dataset[person])
    zipped_neg_dataset[person] = list(zipped_neg_dataset[person])

# Combine the positive and negative datasets and shuffle them
final_dataset = []
for person in PEOPLE:
    final_dataset += zipped_pos_dataset[person] + zipped_neg_dataset[person]

np.random.shuffle(final_dataset)

#############################################################
#####                    Data Loading                   #####
#############################################################

batch_size = 16

# split between training and testing 80-20
train_set, test_set = random_split(final_dataset, [int(len(final_dataset) * 0.8), len(final_dataset) - int(len(final_dataset) * 0.8)])
train_dataloader : DataLoader = DataLoader(train_set, batch_size=batch_size, shuffle=True)
test_dataloader : DataLoader = DataLoader(test_set, batch_size=batch_size, shuffle=True)

# Get cpu or gpu device for training.
device = "cuda" if torch.cuda.is_available() else "cpu"


######################################################
#####                    Model                   #####
######################################################

class EmbeddingNetwork(nn.Module):
    def __init__(self):
        super(EmbeddingNetwork, self).__init__()
        
        # layers
        # first layer: 3 input channels, 64 output channels
        self.l1 = nn.Conv2d(3, 64, 10, padding=1)
        self.a1 = nn.ReLU()
        self.p1 = nn.MaxPool2d(2)
        
        # second layer: 64 input channels, 128 output channels
        self.l2 = nn.Conv2d(64, 128, 7, padding=1)
        self.a2 = nn.ReLU()
        self.p2 = nn.MaxPool2d(2)
        
        # third layer: 128 input channels, 128 output channels
        self.l3 = nn.Conv2d(128, 128, 4, padding=1)
        self.a3 = nn.ReLU()
        self.p3 = nn.MaxPool2d(2)
        
        # fourth layer: 128 input channels, 256 output channels
        self.l4 = nn.Conv2d(128, 256, 4, padding=1)
        self.a4 = nn.ReLU()
        self.p4 = nn.Flatten()

    def forward(self, x):
        """Pass the input tensor through the embeddding network.

        Args:
            x: input tensor, 3 channels, 105x105 pixels

        Returns:
            torch.Tensor: output tensor, 4096 channels
        """
        x = self.l1(x)
        x = self.a1(x)
        x = self.p1(x)
        
        x = self.l2(x)
        x = self.a2(x)
        x = self.p2(x)
        
        x = self.l3(x)
        x = self.a3(x)
        x = self.p3(x)
        
        x = self.l4(x)
        x = self.a4(x)
        x = self.p4(x)
        
        return x

class SiameseNetwork(nn.Module):
    def __init__(self):
        super(SiameseNetwork, self).__init__()
        
        # embedding layer
        self.embedding_layer = EmbeddingNetwork()
        
        # fully connected classification layer
        # 2 classes: 0 (negative) and 1 (positive)
        self.feature_vector = nn.Linear(20736, 4096)
        self.classification_layer = nn.Linear(4096, 2)
        
    def forward(self, anchor, db_image):
        """Pass the input tensor through the siamese network.

        Args:
            anchor (torch.Tensor): input image (from webcam), 3 channels, 105x105 pixels
            db_image (torch.Tensor): target image (from database), 3 channels, 105x105 pixels

        Returns:
            torch.Tensor: output tensor, 1 channel
        """
        # pass through embedding layer
        anchor = self.embedding_layer(anchor)
        db_image = self.embedding_layer(db_image)
        
        # calculate the absolute difference between the two embeddings
        dist = torch.abs(anchor - db_image)
        
        # pass through fully connected classification layer
        x = self.feature_vector(dist)
        x = self.classification_layer(x)
        
        return x

model = SiameseNetwork().to(device)

# using cross entropy loss function and adam optimizer
loss_fn = nn.CrossEntropyLoss()
optimizer = torch.optim.Adam(model.parameters(), lr=0.00001)

def train(dataloader, model, loss_fn, optimizer):
    # Get the size of the dataset
    size = len(dataloader.dataset)
    # Put the model in training mode
    model.train()
    # Loop over the dataset
    for batch, (X, Y, z) in enumerate(dataloader):
        X, Y, z = X.to(device), Y.to(device), z.to(device)
        
        z = z.type(torch.LongTensor)

        pred = model(X, Y)
        loss = loss_fn(pred, z)

        # Backpropagation
        # Disable the gradient calculation for the model parameters
        optimizer.zero_grad()
        # Compute the gradient of the loss with respect to the model parameters
        loss.backward()
        # Update the model parameters
        optimizer.step()

def test(dataloader, model, loss_fn):
    # Get the size of the dataset
    size = len(dataloader.dataset)
    # Get the number of batches
    num_batches = len(dataloader)
    # Put the model in evaluation mode
    model.eval()
    test_loss, correct = 0, 0
    with torch.no_grad(): # for memory efficiency when testing
        # Loop over the dataset
        for X, Y, z in dataloader:
            X, Y, z = X.to(device), Y.to(device), z.to(device)
            z = z.type(torch.LongTensor)
            pred = model(X, Y)
            test_loss += loss_fn(pred, z).item()
            # Add the output value (1 or 0) to the correct variable
            correct += (pred.argmax(1) == z).type(torch.float).sum().item()
    # Compute the average loss and accuracy
    test_loss /= num_batches
    correct /= size

epochs = 5
for t in range(epochs):
    # print(f"Epoch {t+1}: -------------------------------")
    # Train the model
    train(train_dataloader, model, loss_fn, optimizer)
    # Test the model
    test(test_dataloader, model, loss_fn)
# print("Done!")


# Saving the model in a file, we will use it in the next cell
torch.save(model.state_dict(), "model.pth")
# print("Saved PyTorch Model State to model.pth")
