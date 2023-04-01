import datetime
import json
import os
import uuid

import pytest

from api.app import db
from api.helpers import get_auth_methods_as_dict
from api.models import User, LoginSession


@pytest.mark.model
@pytest.mark.parametrize("user_id, email, pwd, motion_pattern, photo, expected_result", [
    (uuid.uuid4(), "lkjl@domljlkain.com", "Valid53flksj", "[\"direction\"]", "user1.png", True),
    ("not a uuid", "klkj@sllkjk.jas", "98sdlkjfA", "[\"direction\"]", "user1.png", AssertionError),
    (None, "klkj@sllkjk.jas", "98sdlkjfA", "[\"direction\"]", "user1.png", AssertionError),
])
def test_user_create(user_id, email, pwd, motion_pattern, photo, expected_result):
    """
    Tests the creation of a user object manually (with no active database connection)

    This allows for id validation to be checked as usually this is handled by the helper methods.
    """
    path = os.path.abspath(os.path.join(os.curdir, "tests", "data", photo))

    if expected_result is True:
        user = User(id=user_id, email=email, pwd=pwd, motion_pattern=motion_pattern)
        with open(path, 'rb') as photo:
            user.set_face_recognition(photo)
        assert user.id == user_id
        assert user.email == email
        assert user.pwd == pwd
        assert user.motion_pattern == motion_pattern
        with open(path, 'rb') as photo:
            assert user.photo == photo.read()

    else:
        with pytest.raises(expected_result):
            with open(path, 'rb') as photo:
                User(id=user_id, email=email, pwd=pwd, motion_pattern=motion_pattern, photo=photo)


@pytest.mark.model
def test_login_session_create_fail(test_client, users):
    """
    Tests creating a login session with invalid parameters
    """
    session_real = LoginSession(
        session_id=uuid.uuid4(),
        id=users[0].id,
        date=datetime.datetime.now(),
        auth_stage=json.dumps(get_auth_methods_as_dict(users[0])),
        motion_pattern_completed=False,
        motion_pattern_retry=False,
        pico_id=str(uuid.uuid4()),
    )
    db.session.add(session_real)
    db.session.commit()

    session = LoginSession()

    with pytest.raises(AssertionError):
        session.pico_id = None

    with pytest.raises(AssertionError):
        session.pico_id = session_real.pico_id

    # Make sure the session id is auto generated to something unique
    session.session_id = session_real.session_id
    assert session.session_id != session_real.session_id

    with pytest.raises(AssertionError):
        session.session_id = None

    with pytest.raises(AssertionError):
        session.motion_added_sequence = None

    with pytest.raises(AssertionError):
        session.motion_added_sequence = "{not_dict: 'hi'}"

    with pytest.raises(AssertionError):
        session.auth_stage = None

    with pytest.raises(AssertionError):
        session.auth_stage = "{not_dict: 'hi'}"
