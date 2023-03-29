import datetime
import json
import time
import uuid

import flask
from flask import Response, jsonify, request, Blueprint

import constants
from api import helpers, models
from api.app import db

client = Blueprint("client", __name__, url_prefix="/api")


###################################################################################
#                               Client API Routes                                 #
###################################################################################
@client.route("/", methods=["GET"], strict_slashes=False)
def index():
    """Index route for the API"""
    return Response("Hello, world!", status=200)


########################################
#                Signup                #
########################################
@client.route("/signup", methods=["POST"], strict_slashes=False)
def signup():
    """
    Route for signing up a new user

    Form body:

    - ``request``::

        {
            "email": "name@domain.com",
            "password": "secure_password",
            "motion_pattern": ["direction", "direction", "direction", ...],
            "auth_methods": {
                "password": boolean,
                "motion_pattern": boolean,
                "face_recognition": boolean,
            },
        }

    - ``photo``: A photo of the user's face

    Notes:

    - ``auth_methods``: is a dictionary of the authentication methods the user wants to use.
    - The password and motion pattern fields are only required if the corresponding auth method is enabled.

    :return: A success message or an error message
    """
    # Validate that the request is "multipart/form-data"
    if "multipart/form-data" not in request.content_type:
        return jsonify(msg="Error: The request is not \"multipart/form-data\". User not created.", success=0), 400
    request_data: dict = json.loads(request.form.get('request', None))

    # Check if a photo was submitted
    file = request.files.get('photo', None)

    # Create the user and return an error message if it fails
    try:
        helpers.create_user_from_dict(request_data, file)
        return jsonify(msg='User successfully created.', success=1), 200
    except AssertionError as exception_message:
        return jsonify(msg='Error: {}. User not created.'.format(exception_message), success=0), 400


########################################
#             Login Routes             #
########################################
@client.route("/login/email", methods=["POST"], strict_slashes=False)
def init():
    """
    Route for initializing a login session

    JSON body::

        {
            "data": "name@domain.com",
        }

    :return: The session ID for the login session
    """
    # Validate that the request is JSON
    try:
        request_data = helpers.json_validate(request)
    except AssertionError as exception_message:
        return jsonify(msg='Error: {}. Login not initialized.'.format(exception_message), success=0), 400

    # Get the user from the email and check if they exist
    email: str = request_data.get('data', None)
    user: models.User = helpers.get_user_from_email(email)

    if user is None:
        return jsonify(msg="Email not found, please try again.", success=0), 401

    # Create a login session and return the session ID
    try:
        session = helpers.create_login_session(user)
        next_stage = helpers.get_next_auth_stage(session)
        return jsonify(msg='Login sequence initialized.', session_id=session.session_id, next=next_stage,
                       success=1), 200
    except AssertionError as exception_message:
        return jsonify(msg='Error: {}. Login not initialized.'.format(exception_message), success=0), 400


@client.route("/login/password", methods=["POST"], strict_slashes=False)
def login_password():
    """
    Route for logging in with a password

    JSON body::

        {
            "session_id": "uuid",
            "data": "secure_password",
        }

    :return: The next stage of the login sequence or an error message
    """
    # Perform standard validation on the request
    validate_out = helpers.input_validate_login(request, "session_id", "password")
    if isinstance(validate_out[0], flask.Response):
        return validate_out
    else:
        user: models.User = validate_out[0]
        session: models.LoginSession = validate_out[1]
        request_data: dict = validate_out[2]

    # Validate the password
    if not request_data.get('data', None) or not user.check_password(request_data.get('data', None)):
        helpers.create_failed_login_event(session, text="Invalid password entered.")
        return jsonify(msg="Invalid password, please try again.", success=0), 401
    else:
        # If the password is valid, move to the next stage of the login sequence
        helpers.progress_to_next_auth_stage(session, "password")
        next_stage = helpers.get_next_auth_stage(session)
        auth_id = None
        if next_stage is None:
            auth_session = helpers.create_auth_session(user)
            auth_id = auth_session.session_id
        return jsonify(msg="Password validated.", next=next_stage, auth_session_id=auth_id, success=1), 200


@client.route("/login/motion_pattern/unique", methods=["POST"], strict_slashes=False)
def login_motion_pattern_unique():
    """
    Route for validating whether a pico_id is unique

    JSON body::

        {
            "pico_id": "uuid",
        }

    :return: Whether the pico_id is unique or not
    """
    # Validate that the request is JSON
    try:
        request_data = helpers.json_validate(request)
    except AssertionError as exception_message:
        return jsonify(msg='Error: {}.'.format(exception_message), success=0), 400

    # Check that the pico_id is unique
    if helpers.check_pico_id_unique(request_data.get('pico_id', None)):
        return jsonify(msg="Pico ID is unique.", success=1), 200
    else:
        return jsonify(msg="Pico ID is not unique.", success=0), 400


@client.route("/login/motion_pattern/initialize", methods=["POST"], strict_slashes=False)
def login_motion_pattern():
    """
    Route for initializing a motion pattern login

    JSON body::

        {
            "session_id": "uuid",
            "pico_id": "uuid",
            "data": ["direction", "direction", "direction", ...],
        }

    - ``pico_id``: The ID of the pico to use for the motion pattern
    - ``data``: The added moves to the motion pattern (must be valid as defined in ``constants.py``)

    :return: The next stage of the login sequence or an error message
    """
    # Perform standard validation on the request
    validate_out = helpers.input_validate_login(request, "session_id", "motion_pattern")
    if isinstance(validate_out[0], flask.Response):
        return validate_out
    else:
        user: models.User = validate_out[0]
        session: models.LoginSession = validate_out[1]
        request_data: dict = validate_out[2]

    # Add the pico_id and added sequence to the session
    try:
        helpers.add_pico_to_session(session, request_data)
    except AssertionError as exception_message:
        # If any of the moves are invalid, return an error
        return jsonify(msg='Error: {}.'.format(exception_message), success=0), 400
    session = helpers.retry_motion_pattern(session, False)

    # Repeatedly check the session for completion of the motion pattern or a retry
    count = 0
    poll_seconds = 3

    while not session.motion_pattern_completed and not session.motion_pattern_retry:
        db.session.expire_all()
        session = helpers.get_login_session_from_id(uuid.UUID(request_data.get('session_id', None)))
        count += 1
        if count > constants.MOTION_PATTERN_TIMEOUT_SECONDS / poll_seconds:
            helpers.create_failed_login_event(session, text="Motion pattern timed out.")
            return jsonify(msg="Motion pattern timed out, please retry.", success=0), 401
        time.sleep(poll_seconds)

    # If the motion needs to be retried, clear the pico from the session and return
    if session.motion_pattern_retry:
        helpers.clear_pico_from_session(session)
        return jsonify(msg="Motion pattern incorrect, please retry.", success=0), 401
    if session.motion_pattern_completed:
        # If the password is valid, move to the next stage of the login sequence
        helpers.progress_to_next_auth_stage(session, "motion_pattern")
        next_stage = helpers.get_next_auth_stage(session)
        auth_id = None
        if next_stage is None:
            auth_session = helpers.create_auth_session(user)
            auth_id = auth_session.session_id
        return jsonify(msg="Motion pattern validated.", next=next_stage, auth_session_id=auth_id, success=1), 200


@client.route("/login/motion_pattern/validate", methods=["POST"], strict_slashes=False)
def login_motion_pattern_validate():
    """
    Route for validating a motion pattern login

    JSON body::

        {
            "pico_id": "uuid",
            "data": ["direction", "direction", "direction", ...],

    - ``data``: The motion pattern to validate (user pattern + added moves)

    :return: The next stage of the login sequence or an error message
    """
    # Perform standard validation on the request
    validate_out = helpers.input_validate_login(request, "pico_id", "motion_pattern", session_method="pico_id")
    if isinstance(validate_out[0], flask.Response):
        return validate_out
    else:
        user: models.User = validate_out[0]
        session: models.LoginSession = validate_out[1]
        request_data: dict = validate_out[2]

    # Validate the motion pattern
    if not request_data.get('data', None):
        helpers.retry_motion_pattern(session, True)
        helpers.create_failed_login_event(session, text="No motion pattern field entered.")
        return jsonify(msg="No motion pattern field entered, please try again.", success=0), 400

    try:
        models.check_valid_moves(request_data.get('data', None))
    except AssertionError as exception_message:
        # If any of the moves are invalid, return an error
        return jsonify(msg='Error: {}.'.format(exception_message), success=0), 400

    # Split the motion pattern into the base pattern and the added sequence
    split_pattern = helpers.split_motion_pattern(session, request_data.get('data', None))

    # Check if the base pattern and added sequence are correct
    if (not user.check_motion_pattern(str(split_pattern[0]))
            or not session.motion_added_sequence.strip('][').replace('"', '').split(', ') == split_pattern[1]):
        helpers.retry_motion_pattern(session, True)
        if not user.check_motion_pattern(str(split_pattern[0])):
            helpers.create_failed_login_event(session, text="Incorrect base motion pattern entered.")
        else:
            helpers.create_failed_login_event(session, text="Incorrect added motion sequence entered.")
        return jsonify(msg="Incorrect motion pattern, please try again.", success=0), 401
    else:
        # If the motion pattern is valid, move to the next stage of the login sequence
        helpers.complete_motion_pattern(session, True)
        return jsonify(msg="Motion pattern validated.", success=1), 200


@client.route("/login/face_recognition", methods=["POST"], strict_slashes=False)
def login_face_recognition():
    """
    Route for logging in with face recognition

    Form body:

    - ``request``::

        {
            "session_id": The session ID of the login session
        }

    - ``photo``: The photo to use for face recognition

    :return: The next stage of the login sequence or an error message
    """
    # Perform standard validation on the request
    validate_out = helpers.input_validate_login(request, "session_id", "face_recognition", "multipart/form-data")
    if isinstance(validate_out[0], flask.Response):
        return validate_out
    else:
        user: models.User = validate_out[0]
        session: models.LoginSession = validate_out[1]

    # Check if a photo was submitted
    file = request.files.get('photo', None)

    if file is None:
        helpers.create_failed_login_event(session, text="No photo submitted.")
        return jsonify(msg="No photo submitted, please try again.", success=0), 400

    # Check if the facial recognition passes
    if not user.check_face_recognition(file):
        helpers.create_failed_login_event(session, text="Face recognition match failed.", photo=file)
        return jsonify(msg="Face recognition match failed, please try again.", success=0), 401
    else:
        # If the facial recognition passes, move to the next stage of the login sequence
        helpers.save_face_recognition_photo(session, file)
        helpers.progress_to_next_auth_stage(session, "face_recognition")
        next_stage = helpers.get_next_auth_stage(session)
        auth_id = None
        if next_stage is None:
            auth_session = helpers.create_auth_session(user)
            auth_id = auth_session.session_id
        return jsonify(msg="Face recognition validated.", next=next_stage, auth_session_id=auth_id, success=1), 200


########################################
#             Validate Auth            #
########################################
@client.route("/client/validate", methods=["POST"], strict_slashes=False)
def client_validate():
    """
    Route for a client to check that their ``auth_session_id`` is valid

    JSON body::

        {
            "auth_session_id": "uuid"
        }

    :return: Whether the ``auth_session_id`` is valid or not
    """
    # Validate that the request is JSON
    try:
        request_data = helpers.json_validate(request)
    except AssertionError as exception_message:
        return jsonify(msg='Error: {}.'.format(exception_message), success=0), 400

    if not request_data.get('auth_session_id', None):
        return jsonify(msg="Missing auth_session_id in request.", success=0), 400

    auth_session: models.AuthSession = helpers.get_auth_session_from_id(
        uuid.UUID(request_data.get('auth_session_id', None)))

    if auth_session is None:
        return jsonify(msg="Invalid auth_session_id, please try again.", success=0), 401
    elif (datetime.datetime.now() - datetime.timedelta(minutes=float(constants.AUTH_SESSION_EXPIRY_MINUTES))
          > auth_session.date) or not auth_session.enabled:
        return jsonify(msg="Session expired, please start a new login session.", next="email", success=0), 401

    return jsonify(msg="Auth session ID is valid.", success=1), 200


########################################
#                Logout                #
########################################
@client.route("/client/logout", methods=["POST"], strict_slashes=False)
def client_logout():
    """
    Route for a client to log out

    JSON body::

        {
            "auth_session_id": "uuid"
        }

    :return: Whether the logout was successful or not
    """
    # Validate that the request is JSON
    try:
        request_data = helpers.json_validate(request)
    except AssertionError as exception_message:
        return jsonify(msg='Error: {}.'.format(exception_message), success=0), 400

    if not request_data.get('auth_session_id', None):
        return jsonify(msg="Missing auth_session_id in request.", success=0), 400

    auth_session: models.AuthSession = helpers.get_auth_session_from_id(
        uuid.UUID(request_data.get('auth_session_id', None)))

    if auth_session is None:
        return jsonify(msg="Invalid auth_session_id, please try again.", success=0), 401

    helpers.disable_auth_session(auth_session)

    return jsonify(msg="Logout successful.", success=1), 200


########################################
#           File Interaction           #
########################################
@client.route("/client/file", methods=["POST"], strict_slashes=False)
def client_file():
    pass
