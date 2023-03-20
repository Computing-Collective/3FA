import pytest
import uuid

from api.models import User


@pytest.mark.model
@pytest.mark.parametrize("user_id, email, pwd, motion_pattern, expected_result", [
    (uuid.uuid4(), "lkjl@domljlkain.com", "Valid53flksj", "[\"direction\"]", True),
    ("not a uuid", "klkj@sllkjk.jas", "98sdlkjfA", "[\"direction\"]", AssertionError),
    (None, "klkj@sllkjk.jas", "98sdlkjfA", "[\"direction\"]", AssertionError),
])
def test_user_create(user_id, email, pwd, motion_pattern, expected_result):
    """
    Tests the creation of a user object manually (with no active database connection)

    This allows for id validation to be checked as usually this is handled by the helper methods.
    """
    if expected_result is True:
        user = User(id=user_id, email=email, pwd=pwd, motion_pattern=motion_pattern)
        assert user.id == user_id
        assert user.email == email
        assert user.pwd == pwd
        assert user.motion_pattern == motion_pattern

    else:
        with pytest.raises(expected_result):
            User(id=user_id, email=email, pwd=pwd, motion_pattern=motion_pattern)
