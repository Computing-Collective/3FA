import os
import shutil

import pytest
from werkzeug.datastructures import FileStorage

import api.helpers
import api.models
from api.app import create_app, db
from constants import ValidMoves


@pytest.fixture(scope='session', autouse=True)
def test_client():
    """
    Creates and runs a test version of the Flask app
    """
    app = create_app({
        'TESTING': True,
        'SQLALCHEMY_DATABASE_URI': "sqlite:///test-database.db",
        'SQLALCHEMY_TRACK_MODIFICATIONS': False,
        'DATA_FOLDER': "test-data",
    })

    # Establish an application context
    with app.app_context():
        # Create a test client using the Flask application configured for testing
        yield app.test_client()
        db.drop_all()
        db.session.remove()
        shutil.rmtree(os.path.join(app.instance_path, app.config['DATA_FOLDER']), ignore_errors=True)


@pytest.fixture(scope='session', autouse=True)
def list_of_users() -> list[list]:
    """
    Returns a list of lists with valid user data
    """
    return [
        ["nevlezayubyet@emaill.app", "x*8#5YLSG9%E", [ValidMoves.LEFT.value, ValidMoves.RIGHT.value],
         True, True, True, "user1.png"],
        ["rajuhka@ogvoice.com", None, [ValidMoves.UP.value, ValidMoves.DOWN.value, ValidMoves.FLIP.value], False, True,
         False, "user1.png"],
        ["ad1723@xgod.cf", "2q5#KO2d*ym5", [ValidMoves.LEFT.value], True, True, False, "user1.png"],
        ["doubleupmike21@rjostre.com", None,
         [ValidMoves.UP.value, ValidMoves.DOWN.value, ValidMoves.FLIP.value, ValidMoves.LEFT.value,
          ValidMoves.RIGHT.value, ValidMoves.FLIP.value], False, True, True, "user1.png"],
    ]


@pytest.mark.database
@pytest.fixture(scope='session', autouse=True)
def users(list_of_users) -> list[api.models.User]:
    """
    Creates a list of users from a list of lists of valid user data

    :param list_of_users: from list_of_users fixture
    :return: A list of user objects
    """
    out = []
    for request_data in list_of_users:
        data = {
            "email": request_data[0],
            "password": request_data[1],
            "motion_pattern": request_data[2],
            "auth_methods": {
                "password": request_data[3],
                "motion_pattern": request_data[4],
                "face_recognition": request_data[5],
            }
        }
        path = os.path.abspath(os.path.join(os.curdir, "tests", "data", request_data[6]))
        with open(path, 'rb') as photo:
            file = FileStorage(photo, content_type="image/png", filename=request_data[6])
            out.append(api.helpers.create_user_from_dict(data, file))

    return out


@pytest.fixture(scope='session')
def list_of_files() -> list[list]:
    """
    Returns a list of lists with valid file data
    """
    return [
        [0, "mock_data.txt", "file1.txt"],
        [0, "mock_data.txt", "file2.txt"],
        [1, "mock_data.txt", "file3.txt"],
        [2, "mock_data.txt", "file4.txt"],
        [3, "mock_data.txt", "file5.txt"],
    ]


@pytest.mark.database
@pytest.fixture(scope='session')
def files(users, list_of_files) -> list[api.models.UserFiles]:
    """
    Creates a list of files from a list of lists of valid file data

    :return: A list of file objects
    """
    out = []
    for request_data in list_of_files:
        path = os.path.abspath(os.path.join(os.curdir, "tests", "data", request_data[1]))
        with open(path, 'rb') as file:
            file_storage = FileStorage(file, content_type="text/plain", filename=request_data[1])
            out.append(api.helpers.add_user_file(users[request_data[0]], request_data[2], file_storage))

    return out
