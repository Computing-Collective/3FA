import os

import torch
from torch import nn
from torchvision import transforms
from torchvision.transforms import ToTensor, Compose, Resize

from PIL import Image

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

""" --------------- MODEL LOADING --------------- """

model = SiameseNetwork()
model.load_state_dict(torch.load("machine-learning/model.pth", map_location=torch.device('cpu')))

model.eval()

""" --------------- IMAGE LOADING --------------- """
pos_image = Image.open(os.path.join("machine-learning", "data", "positive", "0adb6779-c43b-11ed-ba19-40ec9985096b.jpg"))
neg_image = Image.open(os.path.join("machine-learning", "data", "negative", "Aaron_Eckhart_0001.jpg"))
anchor_image = Image.open(os.path.join("machine-learning", "data", "anchor", "0a2aae88-c43b-11ed-96ee-40ec9985096b.jpg"))

img_transforms = Compose([
    ToTensor(),
    Resize((105, 105)),
])

pos_tensor = img_transforms(pos_image)
neg_tensor = img_transforms(neg_image)
anchor_tensor = img_transforms(anchor_image)

# add a dummy dimension to the tensors
pos_tensor = pos_tensor.unsqueeze(0)
neg_tensor = neg_tensor.unsqueeze(0)
anchor_tensor = anchor_tensor.unsqueeze(0)

""" --------------- IMAGE EVALUATION --------------- """
classes = [
    'negative',
    'positive'
]

with torch.no_grad():
    pred = model(anchor_tensor, neg_tensor)
    predicted = classes[pred[0].argmax(0)]
    print(f'Predicted: "{predicted}"')
