import os
import uuid
from unittest.mock import patch

import pytest

import api.helpers
import api.models
from constants import ValidMoves


@pytest.mark.database
@pytest.mark.parametrize("request_data, expected_result", [
    (["name@domain.com", "Valid53flksj", [ValidMoves.FLIP.value], True, True, True, "user1.png"], True),  # Valid
    (["a@d.co", None, [ValidMoves.UP.value, ValidMoves.DOWN.value], False, True, False, "user1.png"], True),  # Valid
    (["lkjl@lkj.as", "lkjA2fsfsd", None, True, False, False, "user1.png"], True),  # Valid
    (["lslkwu@x.lw", None, None, False, False, True, "user1.png"], True),  # Valid
    (["lxns@lc.ca", None, None, False, False, False, "user1.png"], AssertionError),  # Need at least one auth method
    (["name@domain.com", "Valid53flksj", [ValidMoves.FLIP.value], True, True, True, "user1.png"], AssertionError),  #
    # Duplicate user
    (["notarealemail@.co", "Valid53flksj", [ValidMoves.FLIP.value], True, True, True, "user1.png"], AssertionError),
    # Invalid Email
    ([1, "Valid53flksj", [ValidMoves.FLIP.value], True, True, True, "user1.png"], AssertionError),
    # Invalid Email (not a string)
    ([
         "lsdjalksjlksjdflaksjfaalslwoizjnlkdjvoiwenlknwelkjvoijlkajqlwkjlakjvoijwlkjadalkjdwoijvkdjfaslkdfjslkjf@llkjvowlklkjv.clajk",
         "Valid53flksj", [ValidMoves.FLIP.value], True, True, True, "user1.png"], AssertionError),
    # Invalid Email (too long)
    ([None, "Valid53flksj", [ValidMoves.FLIP.value], True, True, True, "user1.png"], AssertionError),
    # Invalid Email (not provided)
    (["slkdj@ldkjs.cl", "lkjA2", [ValidMoves.FLIP.value], True, True, True, "user1.png"], AssertionError),
    # Invalid password (too short)
    (["eroiwu@oijle.lkj", "adlfkjsld", [ValidMoves.UP.value, ValidMoves.DOWN.value], True, True, True, "user1.png"],
     AssertionError),  # Invalid password (no capital or number)
    (["lenvlksj@lsad.sklj", None, [ValidMoves.UP.value, ValidMoves.DOWN.value], True, True, True, "user1.png"],
     AssertionError),  # Invalid password (not provided)
    (["lenvlksj@lsad.sklj", "lkjA2fsfsd", None, True, True, True, "user1.png"], AssertionError),
    # Invalid motion pattern (not provided)
    (["slawo@lva.alc", "lkjA2fsfsd", [ValidMoves.UP.value, "not_a_move"], True, True, True, "user1.png"],
     AssertionError),  # Invalid motion pattern (invalid move)
])
@patch("api.models.User.check_face_recognition")
def test_user_create_fetch(mock_face, test_client, request_data, expected_result):
    """
    Tests creating a user and fetching it from the database.

    Many of the tests are testing the User model's validation methods.
    """
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
    path = os.path.abspath(os.path.join(os.curdir, "tests", "images", request_data[6]))

    mock_face.return_value = True
    if expected_result is True:
        with open(path, 'rb') as photo:
            user = api.helpers.create_user_from_dict(data, photo)
        assert user.email == data.get("email", None)
        if user.pwd is not None:
            assert user.check_password(data.get("password", None))
        if user.motion_pattern is not None:
            assert user.check_motion_pattern(str(data.get("motion_pattern", None)))
        if user.photo is not None:
            with open(path, 'rb') as photo:
                assert user.check_face_recognition(photo)

        # Check that the user was added to the database and test fetching
        assert api.helpers.get_user_from_email(data.get("email", None)) == user
        assert api.helpers.get_user_from_id(user.id) == user

    else:
        with pytest.raises(expected_result):
            with open(path, 'rb') as photo:
                api.helpers.create_user_from_dict(data, photo)


@pytest.mark.database
def test_user_create_no_auth(test_client):
    """
    Tests creating a user with no authentication methods
    """
    data = {
        "email": "emailsldkj@slkdj.cal",
        "password": "AveryVal1dPassw0rd",
        "motion_pattern": ["UP", "DOWN"],
    }
    with pytest.raises(AssertionError):
        api.helpers.create_user_from_dict(data, None)


@pytest.mark.database
@pytest.mark.parametrize("user_email, expected_result", [
    ("name@domain.com", [False, False, False]),
    ("a@d.co", [None, False, None]),
    ("lkjl@lkj.as", [False, None, None]),
    ("lslkwu@x.lw", [None, None, False]),
])
def test_user_auth_methods(test_client, user_email, expected_result):
    """
    Tests the get_auth_methods_as_dict method
    """
    user = api.helpers.get_user_from_email(user_email)

    out_dict = api.helpers.get_auth_methods_as_dict(user)
    assert out_dict.get("password", None) == expected_result[0]
    assert out_dict.get("motion_pattern", None) == expected_result[1]
    assert out_dict.get("face_recognition", None) == expected_result[2]


@pytest.mark.database
@pytest.mark.parametrize("user, expected_result", [
    (0, api.models.LoginSession),
    (1, api.models.LoginSession),
    (2, api.models.LoginSession),
    (3, api.models.LoginSession),
])
def test_login_session_create_fetch(test_client, users, user, expected_result):
    """
    Tests creating a login session and fetching it from the database
    """
    session = api.helpers.create_login_session(users[user])
    assert isinstance(session, expected_result)
    assert api.helpers.get_login_session_from_id(session.session_id) == session


@pytest.mark.database
@pytest.mark.parametrize("user, expected_result", [
    ([0, uuid.uuid5(uuid.uuid4(), "&M8n;24h'=U,%<QS"), [ValidMoves.LEFT.value, ValidMoves.RIGHT.value,
                                                        ValidMoves.DOWN.value],
      [ValidMoves.LEFT.value, ValidMoves.RIGHT.value, ValidMoves.DOWN.value]],
     [api.models.LoginSession, True, [], [ValidMoves.LEFT.value, ValidMoves.RIGHT.value, ValidMoves.DOWN.value]]),
    ([1, uuid.uuid5(uuid.uuid4(), "9,S<vGs^`k`}D+q"), [ValidMoves.LEFT.value, ValidMoves.RIGHT.value,
                                                       ValidMoves.DOWN.value],
      [ValidMoves.RIGHT.value, ValidMoves.DOWN.value]],
     [api.models.LoginSession, True, [], [ValidMoves.RIGHT.value, ValidMoves.DOWN.value]]),
    ([2, uuid.uuid5(uuid.uuid4(), "Xg4$q=gLVf&S{PR["), [ValidMoves.LEFT.value, ValidMoves.RIGHT.value,
                                                        ValidMoves.DOWN.value],
      [ValidMoves.LEFT.value, ValidMoves.RIGHT.value, ValidMoves.DOWN.value, ValidMoves.FLIP.value]],
     [api.models.LoginSession, True, [ValidMoves.LEFT.value], [ValidMoves.RIGHT.value, ValidMoves.DOWN.value,
                                                               ValidMoves.FLIP.value]]),
    ([3, uuid.uuid5(uuid.uuid4(), "hX=tJ5a@@>Kmf(j`"), [ValidMoves.LEFT.value, ValidMoves.RIGHT.value,
                                                        ValidMoves.DOWN.value],
      [ValidMoves.UP.value, ValidMoves.DOWN.value, ValidMoves.LEFT.value, ValidMoves.RIGHT.value,
       ValidMoves.DOWN.value]], [api.models.LoginSession, True, [ValidMoves.UP.value, ValidMoves.DOWN.value],
                                 [ValidMoves.LEFT.value, ValidMoves.RIGHT.value, ValidMoves.DOWN.value]]),
    ([3, uuid.uuid5(uuid.uuid4(), "/2<$w3,LkE%Zm!Wc"), None, [ValidMoves.LEFT.value, ValidMoves.RIGHT.value,
                                                              ValidMoves.DOWN.value]],
     [api.models.LoginSession, True, [ValidMoves.LEFT.value, ValidMoves.RIGHT.value, ValidMoves.DOWN.value], []]),
])
def test_login_session_pico(test_client, users, user, expected_result):
    """
    Tests pico related methods for login sessions
    """
    session = api.helpers.create_login_session(users[user[0]])
    if expected_result[0] == api.models.LoginSession:
        assert isinstance(session, api.models.LoginSession)
    else:
        assert False

    request_data = {
        "pico_id": str(user[1]),
        "data": user[2],
    }

    assert api.helpers.check_pico_id_unique(str(user[1])) == expected_result[1]

    # Test pico creation failure
    if user[2] is None:
        with pytest.raises(AssertionError):
            api.helpers.add_pico_to_session(session, request_data)
        return

    # Test pico creation and fetching
    pico = api.helpers.add_pico_to_session(session, request_data)
    assert api.helpers.check_pico_id_unique(str(user[1])) is not expected_result[1]
    if expected_result[0] == api.models.LoginSession:
        assert isinstance(pico, api.models.LoginSession)
    else:
        assert False

    assert api.helpers.get_login_session_from_pico_id(pico.pico_id) == pico

    api.helpers.clear_pico_from_session(pico)

    assert api.helpers.check_pico_id_unique(str(user[1])) == expected_result[1]

    spit_pattern = api.helpers.split_motion_pattern(session, user[3])

    assert spit_pattern[0] == expected_result[2]
    assert spit_pattern[1] == expected_result[3]

    api.helpers.retry_motion_pattern(session, True)
    api.helpers.complete_motion_pattern(session, True)

    session = api.helpers.get_login_session_from_id(session.session_id)
    assert session.motion_pattern_retry is True
    assert session.motion_pattern_completed is True

    api.helpers.retry_motion_pattern(session, False)
    api.helpers.complete_motion_pattern(session, False)

    session = api.helpers.get_login_session_from_id(session.session_id)
    assert session.motion_pattern_retry is False
    assert session.motion_pattern_completed is False


@pytest.mark.database
def test_save_face_recognition_photo(test_client, users):
    """
    Tests saving a face recognition photo to the database
    """
    user = users[0]
    session = api.helpers.create_login_session(user)

    path = os.path.abspath(os.path.join(os.curdir, "tests", "images", "user1.png"))

    with open(path, 'rb') as photo:
        session = api.helpers.save_face_recognition_photo(session, photo)
    with open(path, 'rb') as photo:
        assert session.login_photo == photo.read()


@pytest.mark.database
@pytest.mark.parametrize("user, expected_result", [
    (0, ["password", "motion_pattern", "face_recognition"]),
    (1, ["motion_pattern", None, None]),
    (2, ["password", "motion_pattern", None]),
    (3, ["motion_pattern", "face_recognition", None]),
])
def test_next_auth_stages(test_client, users, user, expected_result):
    """
    Tests the ``progress_to_next_auth_stage`` ``get_next_auth_stage`` and methods
    """
    session = api.helpers.create_login_session(users[user])

    for stage in expected_result:
        assert api.helpers.get_next_auth_stage(session) == stage
        api.helpers.progress_to_next_auth_stage(session, stage)


@pytest.mark.database
@pytest.mark.parametrize("user, expected_result", [
    (0, api.models.AuthSession),
    (1, api.models.AuthSession),
    (2, api.models.AuthSession),
    (3, api.models.AuthSession),
])
def test_auth_session_create_fetch(test_client, users, user, expected_result):
    """
    Tests creating an auth session and fetching it from the database
    """
    session = api.helpers.create_auth_session(users[user])
    assert isinstance(session, expected_result)
    assert api.helpers.get_auth_session_from_id(session.session_id) == session

    session = api.helpers.disable_auth_session(session)
    assert session.enabled is False
    assert api.helpers.get_auth_session_from_id(session.session_id) == session


@pytest.mark.database
@pytest.mark.parametrize("user", [
    ([0, "Some text", None]),
    ([1, Exception("Some exception"), None]),
    ([2, "Some text", "user1.png"]),
    ([3, Exception("Some exception"), "user1.png"]),
])
def test_fail_events(test_client, users, user):
    """
    Tests the fail events
    """
    all_events_count = len(api.helpers.get_failed_login_events())

    session = api.helpers.create_login_session(users[user[0]])

    text = user[1]
    exception = None
    if isinstance(text, Exception):
        exception = text
        text = None

    if user[2] is not None:
        path = os.path.abspath(os.path.join(os.curdir, "tests", "images", user[2]))
        with open(path, 'rb') as photo:
            event = api.helpers.create_failed_login_event(session, text=text, exception=exception, photo=photo)
        with open(path, 'rb') as photo:
            assert event.photo == photo.read()
    else:
        event = api.helpers.create_failed_login_event(session, text=text, exception=exception)

    assert event.event == str(user[1])

    events_session = api.helpers.get_failed_login_events(session=session)
    assert events_session[0] == event

    events_user = api.helpers.get_failed_login_events(users[user[0]])
    assert events_user[0] == event

    event_dict = api.helpers.get_failed_login_events_as_dict(users[user[0]])

    assert event_dict[0]["event"] == str(user[1])
    assert event_dict[0]["session_id"] == str(session.session_id)
    if user[2] is not None:
        path = os.path.abspath(os.path.join(os.curdir, "tests", "images", user[2]))
        with open(path, 'rb') as photo:
            assert event_dict[0]["photo"] == str(photo.read())
    else:
        assert event_dict[0]["photo"] == str(str(user[2]))

    all_events = api.helpers.get_failed_login_events()
    assert len(all_events) == all_events_count + 1
