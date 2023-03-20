import pytest

from api.app import create_app, db
import api.helpers


@pytest.fixture(scope='session', autouse=True)
def test_client():
    app = create_app({
        'TESTING': True,
        'SQLALCHEMY_DATABASE_URI': "sqlite:///test-database.db",
        'SQLALCHEMY_TRACK_MODIFICATIONS': False,
    })

    # Establish an application context
    with app.app_context():
        # Create a test client using the Flask application configured for testing
        yield app.test_client()
        db.drop_all()
        db.session.remove()


@pytest.mark.database
@pytest.fixture(scope='session', autouse=True)
def list_of_users() -> list[list]:
    """
    Returns a list of lists with valid user data
    """
    return [
        ["nevlezayubyet@emaill.app", "x*8#5YLSG9%E", "[\"left\", \"right\"]", True, True, True],
        ["rajuhka@ogvoice.com", None, "[\"up\", \"down\", \"clockwise\"]", False, True, False],
        ["ad1723@xgod.cf", "2q5#KO2d*ym5", "[\"left\"]", True, True, False],
        ["doubleupmike21@rjostre.com", None,
         "[\"up\", \"down\", \"clockwise\", \"left\", \"right\", \"counter-clockwise\"]", False, True, True],
    ]


@pytest.mark.database
@pytest.fixture(scope='session', autouse=True)
def users(list_of_users):
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
        out.append(api.helpers.create_user_from_dict(data))

    return out
