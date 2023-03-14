from flask import Response, jsonify, request
import time
import uuid

from api.app import create_app, db
from api import helpers, models

app = create_app()


@app.route("/api/", methods=["GET"])
def index():
    """Index route for the API"""
    return Response("Hello, world!", status=200)


@app.route("/api/signup/", methods=["POST"])
def signup():
    """
    Route for signing up a new user

    JSON body:
    :param email: The email of the user to sign up
    :param password: The password of the user to sign up
    :param motion_pattern: The motion pattern of the user to sign up
    """
    if not request.is_json:
        return jsonify(msg="Missing JSON in request", success=0), 400

    request_data = request.get_json()

    try:
        helpers.create_user_from_dict(request_data)
        return jsonify(msg='User successfully created.', success=1), 200
    except AssertionError as exception_message:
        return jsonify(msg='Error: {}. User not created'.format(exception_message), success=0), 400


@app.route("/api/login/initialize/", methods=["POST"])
def init():
    """
    Route for initializing a login session

    JSON body:
    :param email: The email of the user to log in
    :return: The session ID for the login session
    """
    if not request.is_json:
        return jsonify(msg="Missing JSON in request", success=0), 400

    request_data = request.get_json()
    email = request_data.get('email', None)
    user: models.User = helpers.get_user_from_email(email)

    if user is None:
        return jsonify(msg="Invalid email, please try again", success=0), 401

    try:
        session = helpers.create_login_session(user)
        return jsonify(msg='Login sequence initialized.', session_id=session.session_id, success=1), 200
    except AssertionError as exception_message:
        return jsonify(msg='Error: {}. Login not initialized'.format(exception_message), success=0), 400


@app.route("/api/login/password/", methods=["POST"])
def login_password():
    """
    Route for logging in with a password

    JSON body:
    :param session_id: The session ID for the login session
    :param password: The password of the user to log in
    :return: The next stage of the login sequence or an error message
    """
    if not request.is_json:
        return jsonify(msg="Missing JSON in request", success=0), 400

    request_data = request.get_json()
    session: models.LoginSession = helpers.get_login_session_from_id(uuid.UUID(request_data.get('session_id', None)))

    if session is None:
        return jsonify(msg="Invalid session_id, please try again", success=0), 400

    user: models.User = helpers.get_user_from_id(session.id)

    if user is None:
        return jsonify(msg="No affiliated user found, please try again", success=0), 400

    if not request_data.get('password', None) or not user.check_password(request_data.get('password', None)):
        helpers.create_fail_event(session, text="Invalid password entered.")
        return jsonify(msg="Invalid password, please try again", success=0), 401
    else:
        helpers.progress_to_next_auth_stage(session, "password")
        next_stage = helpers.get_next_auth_stage(session)
        return jsonify(msg="Password validated.", next=next_stage, success=1), 200


@app.route("/api/login/motion_pattern/initialize/", methods=["POST"])
def login_motion_pattern():
    """
    Route for initializing a motion pattern login

    JSON body:
    :param session_id: The session ID of the login session
    :param pico_id: The ID of the pico to use for the motion pattern
    :param motion_added_sequence: The added moves to the motion pattern
    :return: The next stage of the login sequence or an error message
    """
    if not request.is_json:
        return jsonify(msg="Missing JSON in request", success=0), 400

    request_data = request.get_json()
    session: models.LoginSession = helpers.get_login_session_from_id(uuid.UUID(request_data.get('session_id', None)))

    if session is None:
        return jsonify(msg="Invalid session_id, please try again", success=0), 400

    helpers.add_pico_to_session(session, request_data)
    helpers.retry_motion_pattern(session, False)

    while not session.motion_pattern_completed and not session.motion_pattern_retry:
        time.sleep(3)
        db.session.expire_all()
        session = helpers.get_login_session_from_id(uuid.UUID(request_data.get('session_id', None)))

    if session.motion_pattern_retry:
        helpers.clear_pico_from_session(session)
        return jsonify(msg="Motion pattern incorrect, please retry", success=0), 401
    if session.motion_pattern_completed:
        helpers.progress_to_next_auth_stage(session, "motion_pattern")
        next_stage = helpers.get_next_auth_stage(session)
        return jsonify(msg="Motion pattern validated.", next=next_stage, success=1), 200


@app.route("/api/login/motion_pattern/validate/", methods=["POST"])
def login_motion_pattern_validate():
    """
    Route for validating a motion pattern login

    JSON body:
    :param pico_id: The ID of the pico submitting the motion pattern
    :param motion_pattern: The motion pattern to validate
    :return: The next stage of the login sequence or an error message
    """
    if not request.is_json:
        return jsonify(msg="Missing JSON in request", success=0), 400

    request_data = request.get_json()
    session: models.LoginSession = helpers.get_login_session_from_pico_id(request_data.get('pico_id', None))

    if session is None:
        return jsonify(msg="Invalid pico_id, please try again", success=0), 400

    user: models.User = helpers.get_user_from_id(session.id)

    if request_data.get('motion_pattern', None) is None:
        return jsonify(msg="Invalid motion pattern, please try again", success=0), 401

    split_pattern = helpers.split_motion_pattern(session, request_data.get('motion_pattern', None))

    if not request_data.get('motion_pattern', None)\
            or not user.check_motion_pattern(str(split_pattern[0]))\
            or not session.motion_added_sequence.strip('][').replace('"', '').split(', ') == split_pattern[1]:
        helpers.retry_motion_pattern(session, True)
        helpers.create_fail_event(session, text="Invalid motion pattern entered.")
        return jsonify(msg="Invalid motion pattern, please try again", success=0), 401
    else:
        helpers.complete_motion_pattern(session, True)
        return jsonify(msg="Motion pattern validated.", success=1), 200


@app.route("/health/")
def health():
    """Health check route for the backend server"""
    return Response("OK", status=200)
