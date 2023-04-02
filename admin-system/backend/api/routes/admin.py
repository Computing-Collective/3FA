import uuid

import flask
from flask import jsonify, request, Blueprint

import constants
from api import helpers

admin = Blueprint("admin", __name__, url_prefix="/api/dashboard")


###################################################################################
#                             Admin Dashboard Routes                              #
###################################################################################
@admin.route("/login", methods=["POST"], strict_slashes=False)
def login():
    """
    Route for logging into the dashboard

    JSON body::

        {
            "email": "name@domain.com"
            "password": "secure_password"
        }

    :return: The authenticated session ID or an error message
    """
    # Validate that the request is JSON
    try:
        request_data = helpers.json_validate(request)
    except AssertionError as exception_message:
        return jsonify(msg='Error: {}. Login not initialized.'.format(exception_message), success=0), 400

    email: str = request_data.get('email', None)
    password: str = request_data.get('password', None)

    if email is None or password is None:
        return jsonify(msg="Invalid email or password, please try again.", success=0), 401

    user = helpers.get_user_from_email(email)
    if user is None:
        return jsonify(msg="Invalid email or password, please try again.", success=0), 401
    elif user.admin is False:
        return jsonify(msg="You do not have permission to access the dashboard.", success=0), 403

    if not user.check_password(password):
        return jsonify(msg="Invalid email or password, please try again.", success=0), 401

    auth_session = helpers.get_latest_valid_auth_session(user)

    if auth_session is None:
        return jsonify(msg="No active authentication session found. Please first login on the client app.",
                       success=1), 401

    return jsonify(msg="Login successful.", success=1, auth_session_id=auth_session.session_id), 200


@admin.route("/login_sessions", methods=["POST"], strict_slashes=False)
def get_login_session():
    """
    Route for getting all past login sessions

    JSON body::

        {
            "auth_session_id": "session_id"
        }

    Query params:

    - ``count``: The number of sessions to return (optional) - defaults to the number set in ``constants.py``

    :return: The login sessions as a list of dicts or an error message
    """
    # Perform standard validation on the request
    validate_out = helpers.input_validate_auth(request, admin_check=True)
    if isinstance(validate_out[0], flask.Response):
        return validate_out

    count = request.args.get('count', constants.DEFAULT_LOGIN_SESSION_LIST_LENGTH)

    out = helpers.get_login_sessions_as_dict(count)

    return jsonify(msg="Login sessions retrieved.", success=1, sessions=out), 200


@admin.route("/failed_events", methods=["POST"], strict_slashes=False)
def get_failed_events():
    """
    Route for getting failed login events

    If both email and session_id are provided, the email will be used.

    JSON body::

        {
            "auth_session_id": "session_id"
        }

    Query params:

    - ``email``: The email of the user to get failed events for (optional)
    - ``session_id``: The session ID of the login session (optional)

    :return: The failed events for the user
    """
    # Perform standard validation on the request
    validate_out = helpers.input_validate_auth(request, admin_check=True)
    if isinstance(validate_out[0], flask.Response):
        return validate_out

    email: str = request.args.get('email', None)
    session_id: str = request.args.get('session_id', None)

    user = None
    session = None

    if email is not None:
        user = helpers.get_user_from_email(email)
        if user is None:
            return jsonify(msg="Invalid email, please try again.", success=0), 401
    elif session_id is not None:
        session = helpers.get_login_session_from_id(uuid.UUID(session_id))
        if session is None:
            return jsonify(msg="Invalid session_id, please try again.", success=0), 401

    events = helpers.get_failed_login_events_as_dict(user, session)

    return jsonify(msg="Failed events retrieved.", success=1, events=events), 200
