from api.app import create_app


def test_config():
    """
    Test that the app is not in testing mode by default
    """
    assert not create_app().testing
    assert create_app({'TESTING': True}).testing
