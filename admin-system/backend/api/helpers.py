import json
from datetime import datetime
import uuid

from api.app import db
from api import models


def validate_id(self, key, identifier):
    """Validate a user ID. If a matching ID is found, a new one is generated and returned."""
    if not identifier:
        raise AssertionError('No ID provided')

    is_uuid = isinstance(identifier, uuid.UUID)

    if not is_uuid:
        raise AssertionError('Provided ID is invalid')

    return identifier


def get_user_from_email(email: str) -> models.User:
    """Get a user from their email (if they exist)"""
    return db.session.execute(db.select(models.User).filter(models.User.email == email)).scalars().first()


def get_user_from_id(user_id: uuid.UUID) -> models.User:
    """Get a user from their ID (if they exist)"""
    return db.session.execute(db.select(models.User).filter(models.User.id == user_id)).scalars().first()


def create_user_from_dict(request_data) -> models.User:
    """Create a user from a dictionary"""
    user: models.User = models.User(
        id=uuid.uuid4(),
        email=request_data.get('email', None).lower())

    user.set_password(request_data.get('password', None))
    user.set_motion_pattern(str(request_data.get('motion_pattern', None)))

    create_auth_methods_from_dict(request_data, user)

    db.session.add(user)
    db.session.commit()

    return user


def create_auth_methods_from_dict(request_data, user: models.User) -> models.UserAuthMethods:
    """Create a user auth method table entry from a dictionary"""
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


def create_login_session(user: models.User) -> models.LoginSession:
    """Create a login session for a user"""
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


def get_login_session_from_id(session_id: uuid.UUID) -> models.LoginSession:
    """Get a login session from its ID (if it exists)"""
    return db.session.execute(db.select(models.LoginSession).filter(models.LoginSession.session_id == session_id))\
        .scalars().first()


def get_login_session_from_pico_id(pico_id: str) -> models.LoginSession:
    """Get a login session from its pico ID (if it exists)"""
    return db.session.execute(db.select(models.LoginSession).filter(models.LoginSession.pico_id == pico_id))\
        .scalars().first()


def add_pico_to_session(session: models.LoginSession, request_data) -> models.LoginSession:
    """Add a pico ID and additional motions to a login session"""
    session.pico_id = request_data.get('pico_id', None)
    session.motion_added_sequence = json.dumps(request_data.get('motion_added_sequence', None))

    db.session.commit()

    return session


def clear_pico_from_session(session: models.LoginSession) -> models.LoginSession:
    """Clear a pico ID from a login session by setting it to a new random UUID"""
    session.pico_id = str(uuid.uuid4())

    db.session.commit()

    return session


def split_motion_pattern(session: models.LoginSession, motion_pattern: str) -> list:
    """
    Split a motion pattern string into two lists.
    One for the motion pattern and one for the additional motions.
    """
    pattern_list = list(motion_pattern)
    if session.motion_added_sequence is not None:
        num_additional_motions = len(session.motion_added_sequence.strip('][').replace('"', '').split(', '))
    else:
        num_additional_motions = 0
    additional_motions = []

    for i in range(num_additional_motions):
        if len(pattern_list) > 0:
            additional_motions.insert(0, pattern_list.pop())

    return [pattern_list, additional_motions]


def retry_motion_pattern(session: models.LoginSession, val: bool) -> models.LoginSession:
    """Set a login session to retry the motion pattern"""
    session.motion_pattern_retry = val

    db.session.commit()

    return session


def complete_motion_pattern(session: models.LoginSession, val: bool) -> models.LoginSession:
    """Set a login session to complete the motion pattern"""
    session.motion_pattern_completed = val

    db.session.commit()

    return session


def progress_to_next_auth_stage(session: models.LoginSession, current_stage: str) -> models.LoginSession:
    """Progress a login session to the next auth stage"""
    auth_dict = json.loads(session.auth_stage)
    for key in auth_dict:
        if not auth_dict[key] or key == current_stage:
            auth_dict[key] = True
            break

    session.auth_stage = json.dumps(auth_dict)

    db.session.commit()

    return session


def get_next_auth_stage(session: models.LoginSession) -> str:
    """Get the next auth stage for a login session"""
    auth_dict = json.loads(session.auth_stage)

    for key in auth_dict:
        if not auth_dict[key]:
            return key


def create_auth_session(user: models.User) -> models.AuthSession:
    """Create an auth session for a user"""
    auth_session: models.AuthSession = models.AuthSession(
        session_id=uuid.uuid4(),
        id=user.id,
        date=datetime.now(),
    )

    db.session.add(auth_session)
    db.session.commit()

    return auth_session


def create_fail_event(session: models.LoginSession,
                      text: str = None,
                      exception: Exception = None,
                      photo=None) -> models.FailedEvent:
    """Create a fail event for a login session"""
    fail_event: models.FailedEvent = models.FailedEvent(
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


def get_failed_events_as_dict(user: models.User, session: models.LoginSession) -> list[dict]:
    """
    Get a list of failed events as a dictionary.

    If a user is provided, only get the failed events for that user.
    If a session is provided, only get the failed events for that session.
    """
    failed_events = get_failed_events(user, session)

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


def get_failed_events(user: models.User, session: models.LoginSession) -> list[models.FailedEvent]:
    """
    Get a list of failed events.

    If a user is provided, only get the failed events for that user.
    If a session is provided, only get the failed events for that session.
    """
    if user:
        return db.session.execute(db.select(models.FailedEvent)
                                  .filter(models.FailedEvent.session_id == models.LoginSession.session_id
                                          and models.LoginSession.id == user.id)).scalars().all()
    elif session:
        return db.session.execute(db.select(models.FailedEvent)
                                  .filter(models.FailedEvent.session_id == session.session_id)).scalars().all()

    return db.session.execute(db.select(models.FailedEvent)).scalars().all()
