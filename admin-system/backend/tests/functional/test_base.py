import pytest


@pytest.mark.get_request
def test_index(test_client):
    response = test_client.get("/api")
    assert response.status_code == 200
    response = test_client.get("/")
    assert response.status_code == 200


@pytest.mark.get_request
def test_health(test_client):
    response = test_client.get("/health")
    assert response.status_code == 200


@pytest.mark.get_request
def test_server_error(test_client):
    response = test_client.get("/api/doesnt_exist")
    assert response.status_code == 500


@pytest.mark.post_request
@pytest.mark.parametrize("endpoint, request_type", [
    ("/api/signup", "POST"),
    ("/api/login/email", "POST"),
    ("/api/login/password", "POST"),
    ("/api/login/motion_pattern/unique", "POST"),
    ("/api/login/motion_pattern/initialize", "POST"),
    ("/api/login/motion_pattern/validate", "POST"),
    ("/api/login/face_recognition", "POST"),
    ("/api/client/validate", "POST"),
    ("/api/client/logout", "POST"),
    ("/api/client/files/upload", "POST"),
    ("/api/client/files/list", "GET"),
    ("/api/client/files/download", "GET"),
    ("/api/client/files/delete", "POST"),
    ("/api/dashboard/login", "POST"),
    ("/api/dashboard/login_sessions", "GET"),
    ("/api/dashboard/failed_events", "GET"),
])
def test_not_json(test_client, endpoint, request_type):
    """
    Tests that the server returns a 400 error when the request is not the expected format (JSON or form data)
    """
    if request_type == "POST":
        response = test_client.post(endpoint, data={"data": "data"})
    elif request_type == "GET":
        response = test_client.get(endpoint, data={"data": "data"})
    else:
        raise ValueError("Invalid type")
    assert response.status_code == 400
