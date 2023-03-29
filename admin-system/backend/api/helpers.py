import json
import uuid
from datetime import datetime, timedelta

import flask
from flask import jsonify

import constants
from api import models
from api.app import db


###################################################################################
#                               Request Validation                                #
###################################################################################
def json_validate(request: flask.Request) -> dict:
    """
    Validate that a request is JSON

    :param request: The request object
    :return: The request data if the request is JSON
    :raises AssertionError: The request is not JSON
    """
    if request.is_json:
        return request.get_json()
    else:
        raise AssertionError('Request is not JSON')


def input_validate_login(request: flask.Request, param: str, curr_stage: str,
                         request_type: str = "json",
                         session_method: str = "session_id"
                         ) -> tuple[models.User, models.LoginSession, dict] | tuple[flask.Response, int]:
    """
    Validate that a request has the correct parameters

    This performs the following checks:

    - The request is of the correct type (JSON or multipart/form-data)
    - The session ID or pico ID is valid
    - The session is not expired
    - The user is in the correct stage of the login sequence

    :param request: The request object
    :param param: The name of the parameter containing the session ID (if ``session_method`` is not "pico_id")
    :param curr_stage: The current stage of the login sequence to check against
    :param request_type: The type of request to validate (JSON or multipart/form-data)
    :param session_method: The method of session validation ("session_id" or "pico_id")
    :return: A tuple containing the user, login session, and request data if the request is valid. Otherwise, a tuple
             containing a response object and status code
    """
    if request_type == "multipart/form-data":
        # Check that the request is multipart/form-data
        if "multipart/form-data" not in request.content_type:
            return jsonify(msg="Missing multipart form data in request.", success=0), 400
        # Load the request data and get the login session
        request_data: dict = json.loads(request.form.get('request', None))
    else:
        # Validate that the request is JSON
        try:
            request_data = json_validate(request)
        except AssertionError as exception_message:
            return jsonify(msg='Error: {}.'.format(exception_message), success=0), 400

    # Validate the session ID
    if session_method == "pico_id":
        session: models.LoginSession = get_login_session_from_pico_id(request_data.get('pico_id', None))
    else:
        session: models.LoginSession = get_login_session_from_id(uuid.UUID(request_data.get(param, None)))

    if session is None:
        return jsonify(msg="Invalid {}, please try again.".format(session_method), success=0), 400
    elif (datetime.now() - timedelta(minutes=float(constants.LOGIN_SESSION_EXPIRY_MINUTES))
          > session.date):
        return jsonify(msg="Session expired, please start a new login session.", next="email", success=0), 401

    # Validate that the user is in the correct stage of the login sequence
    expected_next = get_next_auth_stage(session)
    if expected_next is None:
        return jsonify(msg="Login sequence already completed, please start a new login session.", success=0), 400
    elif expected_next != curr_stage:
        return jsonify(msg="Wrong stage of login sequence, please go to specified stage.",
                       next=expected_next, success=0), 400

    # Validate the user attached to the session
    user: models.User = get_user_from_id(session.id)

    if user is None:
        return jsonify(msg="No affiliated user found, please try again.", success=0), 400

    return user, session, request_data


###################################################################################
#                               Database Fetching                                 #
###################################################################################

########################################
#                 Users                #
########################################
def get_user_from_email(email: str) -> models.User | None:
    """Get a user from their email (if they exist)

    :param email: The email of the user to get
    :return: The user object
    """
    return db.session.execute(db.select(models.User).filter(models.User.email == email)).scalars().first()


def get_user_from_id(user_id: uuid.UUID) -> models.User | None:
    """
    Get a user from their ID (if they exist)

    :param user_id: The ID of the user to get
    :return: The user object
    """
    return db.session.execute(db.select(models.User).filter(models.User.id == user_id)).scalars().first()


def create_user_from_dict(request_data: dict, file) -> models.User:
    """
    Create a user from a dictionary

    Request data should be in the following format::

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

    Note that the password and motion pattern fields are only required if the corresponding auth method is enabled.

    :param request_data: The dictionary containing the user's data
    :param file: The file containing the user's face image
    :return: The created user
    :raises AssertionError: The request data doesn't contain ``auth_methods`` or no auth methods are enabled
    """
    # Validate that the request data contains auth methods and that at least one is enabled
    auth_methods = request_data.get('auth_methods', None)
    if auth_methods is None:
        raise AssertionError("No auth methods provided")
    elif not any(auth_methods.values()):
        raise AssertionError("At least one auth method must be enabled")

    user: models.User = models.User(
        id=uuid.uuid4(),
        email=str(request_data.get('email', None)).lower())

    if request_data.get('auth_methods', None).get('password', None):
        user.set_password(request_data.get('password', None))
    if request_data.get('auth_methods', None).get('motion_pattern', None):
        user.set_motion_pattern(request_data.get('motion_pattern', None))
    if request_data.get('auth_methods', None).get('face_recognition', None):
        user.set_face_recognition(file)

    create_auth_methods_from_dict(request_data, user)

    db.session.add(user)
    db.session.commit()

    return user


########################################
#             Auth Methods             #
########################################
def create_auth_methods_from_dict(request_data: dict, user: models.User) -> models.UserAuthMethods:
    """
    Create a user auth methods table entry from a dictionary

    ``request_data`` needs to contain::

        "auth_methods": {
            "password": boolean,
            "motion_pattern": boolean,
            "face_recognition": boolean,
        }

    :param request_data: The dictionary containing the user's data
    :param user: The user to create the auth methods for
    :return: The created auth methods object
    """
    auth_method: models.UserAuthMethods = models.UserAuthMethods(
        id=uuid.uuid4(),
        user_id=user.id,
        password=request_data.get("auth_methods", None).get('password', None),
        motion_pattern=request_data.get("auth_methods", None).get('motion_pattern', None),
        face_recognition=request_data.get("auth_methods", None).get('face_recognition', None),
    )

    db.session.add(auth_method)
    db.session.commit()

    return auth_method


def get_auth_methods_as_dict(user: models.User) -> dict:
    """
    Get a user's auth methods as a dictionary

    :param user: The user to get the auth methods for
    :return: A dictionary with the keys of enabled auth methods and the values set to False
    """
    auth_method: models.UserAuthMethods = db.session.execute(db.select(models.UserAuthMethods).filter(
        models.UserAuthMethods.user_id == user.id)).scalars().first()

    output = {}

    if auth_method.password:
        output["password"] = False
    if auth_method.motion_pattern:
        output["motion_pattern"] = False
    if auth_method.face_recognition:
        output["face_recognition"] = False

    return output


########################################
#            Login Session             #
########################################
def create_login_session(user: models.User) -> models.LoginSession:
    """
    Create a login session for a user
    
    :param user: The user to create the login session for
    :return: The created login session
    """
    session: models.LoginSession = models.LoginSession(
        session_id=uuid.uuid4(),
        id=user.id,
        date=datetime.now(),
        auth_stage=json.dumps(get_auth_methods_as_dict(user)),
        motion_pattern_completed=False,
        motion_pattern_retry=False,
    )

    db.session.add(session)
    db.session.commit()

    return session


def get_login_session_from_id(session_id: uuid.UUID) -> models.LoginSession | None:
    """
    Get a login session from its ID (if it exists)
    
    :param session_id: The ID of the login session to get
    :return: The login session object
    """
    return (db.session.execute(db.select(models.LoginSession).filter(models.LoginSession.session_id == session_id))
            .scalars().first())


def get_login_session_from_pico_id(pico_id: str) -> models.LoginSession | None:
    """
    Get a login session from its pico ID (if it exists)
    
    :param pico_id: The pico ID of the login session to get
    :return: The login session object
    """
    return (db.session.execute(db.select(models.LoginSession).filter(models.LoginSession.pico_id == pico_id))
            .scalars().first())


def add_pico_to_session(session: models.LoginSession, request_data: dict) -> models.LoginSession:
    """
    Add a pico ID and additional motions to a login session
    
    ``request_data`` needs to contain::
    
        "pico_id": "uuid",
        "data": ["direction", "direction", "direction", ...],
    
    :param session: The login session to add the pico ID and motions to
    :param request_data: The request data containing the pico ID and motions
    :return: The updated login session
    :raises AssertionError: If any of the moves are invalid
    """

    models.check_valid_moves(request_data.get('data', None))

    session.pico_id = request_data.get('pico_id', None)
    session.motion_added_sequence = json.dumps(request_data.get('data', None))

    db.session.commit()

    return session


def check_pico_id_unique(pico_id: str) -> bool:
    """
    Check if a Pico ID is unique

    :param pico_id: The Pico ID to check
    :return: True if the Pico ID is unique, False if it is not
    """
    return (db.session.execute(db.select(models.LoginSession).filter(models.LoginSession.pico_id == pico_id))
            .scalars().first() is None)


def clear_pico_from_session(session: models.LoginSession) -> models.LoginSession:
    """
    Clear a pico ID from a login session by setting it to a new random UUID

    :param session: The login session to clear the pico ID from
    :return: The updated login session
    """
    identifier = uuid.uuid4()

    while models.LoginSession.query.filter(models.LoginSession.pico_id == identifier).first():
        identifier = uuid.uuid4()

    session.pico_id = str(identifier)

    db.session.commit()

    return session


def split_motion_pattern(session: models.LoginSession, motion_pattern: list) -> tuple[list[str], list[str]]:
    """
    Split a motion pattern string into two lists. One for the motion pattern and one for the additional motions.

    :param session: The login session to get the additional motions from
    :param motion_pattern: The motion pattern to split
    :return: A tuple containing the motion pattern list and the additional motions list
    """
    pattern_list = motion_pattern

    if session.motion_added_sequence is not None and session.motion_added_sequence != 'null':
        num_additional_motions = len(session.motion_added_sequence.strip('][').replace('"', '').split(', '))
    else:
        num_additional_motions = -1
    additional_motions = []

    for i in range(num_additional_motions):
        if len(pattern_list) > 0:
            additional_motions.insert(0, pattern_list.pop())

    return pattern_list, additional_motions


def retry_motion_pattern(session: models.LoginSession, val: bool) -> models.LoginSession:
    """
    Set a login session to retry the motion pattern

    :param session: The login session to set the retry value for
    :param val: The value to set the retry value to
    :return: The updated login session
    """
    session.motion_pattern_retry = val

    db.session.commit()

    return session


def complete_motion_pattern(session: models.LoginSession, val: bool) -> models.LoginSession:
    """
    Set a login session to complete the motion pattern

    :param session: The login session to set the complete value for
    :param val: The value to set the complete value to
    :return: The updated login session
    """
    session.motion_pattern_completed = val

    db.session.commit()

    return session


def save_face_recognition_photo(session: models.LoginSession, file) -> models.LoginSession:
    """
    Save a successful face recognition photo to a login session

    :param session: The login session to save the photo to
    :param file: The file to save
    :return: The updated login session
    """
    session.login_photo = file.read()

    db.session.commit()

    return session


def progress_to_next_auth_stage(session: models.LoginSession, current_stage: str) -> models.LoginSession:
    """
    Progress a login session to the next auth stage

    :param session: The login session to progress
    :param current_stage: The current auth stage
    :return: The updated login session
    """
    auth_dict = json.loads(session.auth_stage)

    # Set the current stage to True
    for key in auth_dict:
        if key == current_stage:
            auth_dict[key] = True
            break

    session.auth_stage = json.dumps(auth_dict)

    db.session.commit()

    return session


def get_next_auth_stage(session: models.LoginSession) -> str | None:
    """
    Get the next auth stage for a login session

    :param session: The login session to get the next auth stage for
    :return: The next auth stage or None if all auth stages are complete
    """
    auth_dict = json.loads(session.auth_stage)

    for key in auth_dict:
        if not auth_dict[key]:
            return key


########################################
#             Auth Session             #
########################################
def create_auth_session(user: models.User) -> models.AuthSession:
    """
    Create an auth session for a user

    :param user: The user to create the auth session for
    :return: The auth session object
    """
    auth_session: models.AuthSession = models.AuthSession(
        session_id=uuid.uuid4(),
        id=user.id,
        date=datetime.now(),
        enabled=True,
    )

    db.session.add(auth_session)
    db.session.commit()

    return auth_session


def get_auth_session_from_id(session_id: uuid.UUID) -> models.AuthSession | None:
    """
    Get an auth session from its ID (if it exists)

    :param session_id: The ID of the auth session to get
    :return: The auth session object or None if it does not exist
    """
    return (db.session.execute(db.select(models.AuthSession).filter(models.AuthSession.session_id == session_id))
            .scalars().first())


def disable_auth_session(session: models.AuthSession) -> models.AuthSession:
    """
    Disable an auth session (logging out)

    :param session: The auth session to disable
    :return: The updated auth session
    """
    session.enabled = False

    db.session.commit()

    return session


########################################
#          Failed Login Event          #
########################################
def create_failed_login_event(session: models.LoginSession,
                              text: str = None,
                              exception: Exception = None,
                              photo=None) -> models.FailedLoginEvent:
    """
    Create a fail event for a login session

    :param session: The login session to create the fail event for
    :param text: The description of the fail event
    :param exception: The exception message of the fail event
    :param photo: The photo of the fail event (for facial recognition)
    :return: The failed login event object
    """
    fail_event: models.FailedLoginEvent = models.FailedLoginEvent(
        id=uuid.uuid4(),
        session_id=session.session_id,
        date=datetime.now(),
    )
    if text:
        fail_event.event = str(text)
    if exception:
        fail_event.event = str(exception)
    if photo:
        fail_event.photo = photo.read()

    db.session.add(fail_event)
    db.session.commit()

    return fail_event


def get_failed_login_events_as_dict(user: models.User = None, session: models.LoginSession = None) -> list[dict]:
    """
    Get a list of failed events as a dictionary.

    If a user is provided, only get the failed events for that user.
    If a session is provided, only get the failed events for that session.

    :param user: The user to get the failed events for
    :param session: The session to get the failed events for
    :return: A list of dictionaries containing the failed events
    """
    failed_events = get_failed_login_events(user, session)

    output = []

    for event in failed_events:
        output.append({
            "id": str(event.id),
            "session_id": str(event.session_id),
            "date": event.date.strftime("%d/%m/%Y %H:%M:%S"),
            "event": event.event,
            "photo": str(event.photo)
        })

    return output


def get_failed_login_events(user: models.User = None,
                            session: models.LoginSession = None) -> list[models.FailedLoginEvent]:
    """
    Get a list of failed events.

    If a user is provided, only get the failed events for that user.
    If a session is provided, only get the failed events for that session.

    :param user: The user to get the failed events for
    :param session: The session to get the failed events for
    :return: A list of failed events
    """
    if user:
        return db.session.execute(db.select(models.FailedLoginEvent)
                                  .join(models.LoginSession)
                                  .filter(models.FailedLoginEvent.session_id == models.LoginSession.session_id)
                                  .filter(user.id == models.LoginSession.id)).scalars().all()
    elif session:
        return db.session.execute(db.select(models.FailedLoginEvent)
                                  .filter(models.FailedLoginEvent.session_id == session.session_id)).scalars().all()

    return db.session.execute(db.select(models.FailedLoginEvent)).scalars().all()
