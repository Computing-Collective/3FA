import json
import re
import uuid

from flask_bcrypt import generate_password_hash, check_password_hash
from sqlalchemy.orm import validates

from api.app import db
from api.machine_learning_eval import evaluate_images
from constants import ValidMoves


def validate_id(identifier) -> uuid.UUID:
    """
    Validate an ID by checking that it is a unique UUID and is not null.

    :param identifier: The ID to validate
    :return: The ID if it is valid
    :raises AssertionError: The ID is invalid
    """
    if not identifier:
        raise AssertionError('No ID provided')

    is_uuid = isinstance(identifier, uuid.UUID)

    if not is_uuid:
        raise AssertionError('Provided ID is invalid')

    return identifier


def check_valid_moves(motion_pattern: list[str]):
    """
    Check that every element in the motion pattern is a valid move.

    :param motion_pattern: The motion pattern to check
    :raises AssertionError: The motion pattern is invalid
    """
    valid_moves = set(item.value for item in ValidMoves)

    if not motion_pattern:
        raise AssertionError("No motion pattern provided")

    for move in motion_pattern:
        if move not in valid_moves:
            raise AssertionError("Invalid motion pattern")


class User(db.Model):
    """
    User model for the database.

    This is the main table for the database, most other tables use user ID as a foreign key.
    See the tables diagram in the README for an overview.

    :param id: A unique ID
    :param email: The user's email address
    :param pwd: The user's password (hashed)
    :param motion_pattern: The user's motion pattern (hashed)
    :param photo: The user's facial recognition reference photo
    """
    __tablename__ = "user"

    # Primary unique identifier for the user (all connected tables use this as a foreign key)
    id = db.Column(db.Uuid, primary_key=True, unique=True, nullable=False)
    # User's email to find their account internally
    email = db.Column(db.String(120), unique=True, nullable=False)
    # User's password (hashed) - only used if the user has enabled password authentication
    pwd = db.Column(db.String(300), nullable=True)
    # User's motion pattern (hashed) - only used if the user has enabled pico authentication
    motion_pattern = db.Column(db.String, nullable=True)
    # User's facial recognition reference photo - only used if the user has enabled facial recognition authentication
    photo = db.Column(db.LargeBinary, nullable=True)
    # Whether the user has admin privileges
    admin = db.Column(db.Boolean, nullable=False, default=False)

    # Ensures that the ID is a unique UUID and is not null
    @validates('id')
    def validate_id(self, key, identifier):
        validate_id(identifier)
        while User.query.filter(User.id == identifier).first():
            identifier = uuid.uuid4()

        return validate_id(identifier)

    # Ensures that the email is not null, is a valid email address, is unique, and is less than 120 characters
    @validates('email')
    def validate_email(self, key, email):
        if email == "none":
            raise AssertionError('No email provided')

        is_unique = not db.session.execute(db.select(User).filter(User.email == email)).scalars().first()
        is_less_than_120_characters = len(email) <= 120

        if not is_unique:
            raise AssertionError('Provided email is already in use')

        if not is_less_than_120_characters:
            raise AssertionError('Provided email is too long')

        if not re.fullmatch(r"^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:["
                            r"a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$", email):
            raise AssertionError('Provided email is not an email address')

        return email

    # Ensures that the password is not null, is between 8 and 50 characters, and contains 1 capital letter and 1 number
    def set_password(self, password):
        if not password:
            raise AssertionError('Password not provided')

        if not re.search(r'\d.*[A-Z]|[A-Z].*\d', password):
            raise AssertionError('Password must contain 1 capital letter and 1 number')

        if len(password) < 8 or len(password) > 50:
            raise AssertionError('Password must be between 8 and 50 characters')

        self.pwd = generate_password_hash(password)

    # Checks the provided password against the stored password hash
    def check_password(self, password):
        return check_password_hash(self.pwd, password)

    # Ensures that the motion pattern is not null
    def set_motion_pattern(self, motion_pattern: list[str]):
        if motion_pattern == "None" or motion_pattern is None:
            raise AssertionError('Motion pattern not provided')

        # Check that every element in the motion pattern is a valid move
        check_valid_moves(motion_pattern)

        self.motion_pattern = generate_password_hash(str(motion_pattern))

    # Checks the provided motion pattern against the stored motion pattern hash
    def check_motion_pattern(self, motion_pattern):
        return check_password_hash(self.motion_pattern, motion_pattern)

    # Saves the provided photo as the facial recognition reference photo
    def set_face_recognition(self, file):
        if file is None:
            raise AssertionError("No photo submitted")

        self.photo = file.read()

    # Checks the provided photo against the stored facial recognition model
    def check_face_recognition(self, file):
        return evaluate_images(self.photo, file)


class UserFiles(db.Model):
    """
    The table of files attached to each user

    This table is used to store files that are attached to each user,
    which would be anything that they upload to their personal vault.

    :param id: A unique ID
    :param user_id: The ID of the user that the file is attached to
    :param file_name: The name of the file
    :param file_data: The data of the file
    """
    __tablename__ = "user_files"

    id = db.Column(db.Uuid, primary_key=True, unique=True, nullable=False)
    user_id = db.Column(db.Uuid, db.ForeignKey('user.id'), nullable=False)
    file_name = db.Column(db.String, nullable=False)
    file_data = db.Column(db.LargeBinary, nullable=False)

    # Ensures that the ID is a unique UUID and is not null
    @validates('id')
    def validate_id(self, key, identifier):
        validate_id(identifier)
        while UserFiles.query.filter(UserFiles.id == identifier).first():
            identifier = uuid.uuid4()

        return validate_id(identifier)


class UserAuthMethods(db.Model):
    """
    The table indicating what authentication methods each user has enabled.

    There are parameters for each authentication method and for a given user each will be set as on or off.
    Additional authentication methods can be added in the future by adding a new parameter for the method
    and setting the default for all users to false.

    :param id: A unique ID
    :param user_id: The ID of the user that the file is attached to
    :param password: Whether the user has enabled password authentication
    :param motion_pattern: Whether the user has enabled motion pattern authentication
    :param face_recognition: Whether the user has enabled facial recognition
    """
    __tablename__ = "user_auth_methods"

    # Identifier information
    id = db.Column(db.Uuid, primary_key=True, unique=True, nullable=False)
    user_id = db.Column(db.Uuid, db.ForeignKey('user.id'), unique=True, nullable=False)
    # Authentication method configuration
    password = db.Column(db.Boolean, nullable=False)
    motion_pattern = db.Column(db.Boolean, nullable=False)
    face_recognition = db.Column(db.Boolean, nullable=False)

    # Ensures that the ID is a unique UUID and is not null
    @validates('id')
    def validate_id(self, key, identifier):
        validate_id(identifier)
        while UserAuthMethods.query.filter(UserAuthMethods.id == identifier).first():
            identifier = uuid.uuid4()

        return validate_id(identifier)


class LoginSession(db.Model):
    """
    The table of current and past login sessions

    This table is used to log all past successful and failed login attempts. It also tracks
    current login sessions and what stage they are at. Note that failed events (incorrect password
    attempts, motion pattern failure, etc.) are stored in separate table but incomplete login attempts
    (fails) are stored as login session with the auth_stage being a dictionary of booleans containing
    at least one false value. A login session times out after the timeout period
    ``LOGIN_SESSION_EXPIRY_MINUTES`` specified in the ``constants.py`` file.

    :param session_id: A unique ID for the session
    :param id: The ID of the user that the session is for
    :param date: The date and time of the session creation
    :param auth_stage: A string cast dictionary of booleans indicating which authentication methods have been completed
    :param pico_id: A unique pico ID passed upon each motion password attempt
    :param motion_added_sequence: The sequence of moves to be added to the user's motion pattern
    :param motion_pattern_completed: A flag to indicate whether the motion pattern has been successfully completed
    :param motion_pattern_retry: A flag to indicate whether the motion pattern needs to be retried
    :param login_photo: The successful login photo (if applicable)
    """
    __tablename__ = "login_session"

    session_id = db.Column(db.Uuid, unique=True, nullable=False, primary_key=True)
    id = db.Column(db.Uuid, db.ForeignKey('user.id'), nullable=False)
    date = db.Column(db.DateTime, nullable=False)
    # A string of booleans indicating which authentication methods have been completed
    auth_stage = db.Column(db.String, nullable=False)
    # The user's pico_id (if applicable)
    pico_id = db.Column(db.String, unique=True, nullable=True)
    # The sequence of moves to be added to the user's motion pattern
    motion_added_sequence = db.Column(db.String, nullable=True)
    # A flag to indicate whether the motion pattern has been successfully completed
    motion_pattern_completed = db.Column(db.Boolean, nullable=False)
    # A flag to indicate whether the motion pattern needs to be retried
    motion_pattern_retry = db.Column(db.Boolean, nullable=False)
    # The successful login photo (if applicable)
    login_photo = db.Column(db.LargeBinary, nullable=True)

    # Ensures that the session ID is a unique UUID and is not null
    @validates('session_id')
    def validate_id(self, key, identifier):
        validate_id(identifier)
        while LoginSession.query.filter(LoginSession.session_id == identifier).first():
            identifier = uuid.uuid4()

        return validate_id(identifier)

    # Ensures that the pico ID is a unique UUID and is not null
    @validates('pico_id')
    def validate_pico_id(self, key, pico_id):
        is_unique = not db.session.execute(db.select(LoginSession)
                                           .filter(LoginSession.pico_id == pico_id)).scalars().first()
        if not pico_id:
            raise AssertionError('No pico_id provided')
        if not is_unique:
            raise AssertionError('Provided pico_id is not unique')
        return pico_id

    # Ensures that the auth_stage is a valid dictionary and is not null
    @validates('auth_stage')
    def validate_auth_stage(self, key, auth_stage):
        if not auth_stage:
            raise AssertionError('No auth_stage provided')
        try:
            json.loads(auth_stage)
        except json.JSONDecodeError:
            raise AssertionError('Auth_stage is not a valid dictionary')

        return auth_stage

    # Ensures that the motion added sequence is a valid dictionary and is not null
    @validates('motion_added_sequence')
    def validate_motion_added_sequence(self, key, motion_added_sequence):
        if not motion_added_sequence:
            raise AssertionError('No motion added sequence provided')
        try:
            json.loads(motion_added_sequence)
        except json.JSONDecodeError:
            raise AssertionError('Motion added sequence is not a valid dictionary')

        return motion_added_sequence


class FailedLoginEvent(db.Model):
    """
    The table of failed login events

    Events are linked to a login session, and are used to track what went wrong during a login.
    A failed event does not necessarily mean that the login failed, but it does mean that the
    user make a mistake during the login process and would have to try again.

    :param id: A unique ID for the event
    :param session_id: The ID of the session that the event is for
    :param date: The date and time of the event
    :param event: Details of the event
    :param photo: The photo relevant to the event (from failed face recognition if applicable)
    """
    __tablename__ = "failed_login_event"

    id = db.Column(db.Uuid, unique=True, nullable=False, primary_key=True)
    session_id = db.Column(db.Uuid, db.ForeignKey('login_session.session_id'), nullable=False)
    date = db.Column(db.DateTime, nullable=False)
    event = db.Column(db.String, nullable=False)
    photo = db.Column(db.LargeBinary, nullable=True)

    # Ensures that the session ID is a unique UUID and is not null
    @validates('id')
    def validate_id(self, key, identifier):
        validate_id(identifier)
        while FailedLoginEvent.query.filter(FailedLoginEvent.id == identifier).first():
            identifier = uuid.uuid4()

        return validate_id(identifier)


class AuthSession(db.Model):
    """
    The table of current and past authentication sessions

    This table stores all authentication sessions to manage user access to restricted endpoints.
    An authentication id times out after the timeout period ``AUTH_SESSION_EXPIRY_MINUTES``
    specified in the ``constants.py`` file.

    :param session_id: A unique ID for the session
    :param id: The ID of the user that the session is for
    :param date: The date and time of the session creation
    """
    __tablename__ = "auth_session"

    session_id = db.Column(db.Uuid, unique=True, nullable=False, primary_key=True)
    id = db.Column(db.Uuid, db.ForeignKey('user.id'), nullable=False)
    date = db.Column(db.DateTime, nullable=False)
    enabled = db.Column(db.Boolean, nullable=False)

    # Ensures that the session ID is a unique UUID and is not null
    @validates('id')
    def validate_id(self, key, identifier):
        validate_id(identifier)
        while AuthSession.query.filter(AuthSession.id == identifier).first():
            identifier = uuid.uuid4()

        return validate_id(identifier)
