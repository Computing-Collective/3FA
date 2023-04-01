import os

from api.machine_learning_eval import evaluate_images


def test_machine_learning_eval():
    """Test the machine learning evaluation function."""
    # Load the images
    path = os.path.abspath(os.path.join(os.curdir, "tests", "data", "user1.png"))

    with open(path, 'rb') as f:
        # Evaluate the images
        result = evaluate_images(f.read(), f)

    # Check the result
    assert isinstance(result, bool)
