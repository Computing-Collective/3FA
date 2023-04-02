import io

import torch
from PIL import Image
from torch import nn
from torchvision.transforms import ToTensor, Compose, Resize


# ----------------------------------------------------------------- #
# ----------------------- Model Definitions ----------------------- #
# ----------------------------------------------------------------- #
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


# Initialize Machine Learning model
model = SiameseNetwork()


# ---------------------------------------------------------------- #
# ----------------------- Image Evaluation ----------------------- #
# ---------------------------------------------------------------- #
def evaluate_images(user_image, login_image) -> bool:
    """
    Compare two images and return whether they are a match or not.

    :param user_image: input image upon signup (from database)
    :param login_image: target image (from webcam)
    :return: result of the evaluation
    """

    # Image loading

    anchor_image = Image.open(io.BytesIO(user_image))
    eval_image = Image.open(login_image)

    # Resize images to 105x105 and convert to tensor
    img_transforms = Compose([
        ToTensor(),
        Resize((105, 105)),
    ])

    eval_image = img_transforms(eval_image)
    anchor_tensor = img_transforms(anchor_image)

    # Add a dummy dimension to the tensors
    eval_tensor = eval_image.unsqueeze(0)
    anchor_tensor = anchor_tensor.unsqueeze(0)

    # Image evaluation

    # Get prediction from model
    with torch.no_grad():
        pred = model(anchor_tensor, eval_tensor)
        predicted = bool(pred[0].argmax(0))
        return predicted
