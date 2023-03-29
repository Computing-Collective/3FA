from api.app import create_app


def test_config():
    """
    Test that the app is not in testing mode by default
    """
    assert not create_app().testing
    assert create_app({
        'TESTING': True,
        'SQLALCHEMY_DATABASE_URI': "sqlite:///no-database.db",
        'SQLALCHEMY_TRACK_MODIFICATIONS': False
    }).testing
