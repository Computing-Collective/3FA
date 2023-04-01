import uuid

import pytest

import api.helpers


@pytest.mark.database
@pytest.mark.post_request
@pytest.mark.parametrize("email, password, admin, session, keys, expected_result", [
    ("nevlezayubyet@emaill.app", "x*8#5YLSG9%E", True, False, ["email", "password"], 401),  # No active session
    ("nevlezayubyet@emaill.app", "x*8#5YLSG9%E", True, True, ["email", "password"], 200),  # Valid user
    ("fake_email", "x*8#5YLSG9%E", False, False, ["email", "password"], 401),  # Invalid email
    ("nevlezayubyet@emaill.app", "wrong_password", True, True, ["email", "password"], 401),  # Wrong password
    ("ad1723@xgod.cf", "2q5#KO2d*ym5", False, True, ["email", "password"], 403),  # Not authorized (not an admin)
    ("nevlezayubyet@emaill.app", "x*8#5YLSG9%E", True, True, ["email", "data"], 401),  # Missing password key
    ("nevlezayubyet@emaill.app", "x*8#5YLSG9%E", True, True, ["data", "password"], 401),  # Missing email key
])
def test_dashboard_login(test_client, email, password, admin, session, keys, expected_result):
    """
    Tests the dashboard login endpoint
    """
    if session:
        api.helpers.create_auth_session(api.helpers.get_user_from_email(email))
    if admin:
        api.helpers.make_user_admin(api.helpers.get_user_from_email(email))

    data = {
        keys[0]: email,
        keys[1]: password,
    }

    response = test_client.post("/api/dashboard/login", json=data)
    assert response.status_code == expected_result


@pytest.mark.database
@pytest.mark.get_request
@pytest.mark.parametrize("email, session, expected_result", [
    ("nevlezayubyet@emaill.app", True, 200),  # Valid user
])
def test_get_login_events(test_client, email, session, expected_result):
    """
    Tests the get login events endpoint
    """
    if session:
        session_id = api.helpers.create_auth_session(api.helpers.get_user_from_email(email))
        data = {
            "auth_session_id": str(session_id.session_id),
        }
    else:
        data = {}

    response = test_client.get("/api/dashboard/login_sessions", json=data)
    assert response.status_code == expected_result


@pytest.mark.database
@pytest.mark.get_request
@pytest.mark.parametrize("admin_email, email, session_id, expected_result", [
    ("nevlezayubyet@emaill.app", None, None, 200),  # All events
    ("nevlezayubyet@emaill.app", "nevlezayubyet@emaill.app", None, 200),  # Valid email
    ("nevlezayubyet@emaill.app", "noemail@email.com", None, 401),  # Invalid email
    ("nevlezayubyet@emaill.app", None, uuid.uuid5(namespace=uuid.uuid4(), name="no_session"), 401),  # Invalid session
    (None, None, None, 400),  # No admin
])
def test_get_failed_events(test_client, admin_email, email, session_id, expected_result):
    """
    Tests the get failed events endpoint
    """
    if admin_email is not None:
        session = api.helpers.create_auth_session(api.helpers.get_user_from_email(admin_email))
        json_data = {
            "auth_session_id": str(session.session_id),
        }
    else:
        json_data = {}

    data = {
        "email": email,
        "session_id": session_id,
    }

    response = test_client.get("/api/dashboard/failed_events", query_string=data, json=json_data)
    assert response.status_code == expected_result
