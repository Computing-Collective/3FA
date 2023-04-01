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
@pytest.mark.parametrize("endpoint", [
    "/api/signup",
    "/api/login/email",
    "/api/login/password",
    "/api/login/motion_pattern/unique",
    "/api/login/motion_pattern/initialize",
    "/api/login/motion_pattern/validate",
    "/api/login/face_recognition",
    "/api/client/validate",
    "/api/client/logout",
    "/api/client/files/upload",
    "/api/client/files/list",
    "/api/client/files/download",
    "/api/client/files/delete",
    "/api/dashboard/login",
    "/api/dashboard/login_sessions",
    "/api/dashboard/failed_events",
])
def test_not_json(test_client, endpoint):
    """
    Tests that the server returns a 400 error when the request is not the expected format (JSON or form data)
    """
    response = test_client.post(endpoint, data={"data": "data"})
    assert response.status_code == 400
