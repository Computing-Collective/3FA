from flask_bcrypt import generate_password_hash, check_password_hash
from sqlalchemy.orm import validates
import json
import uuid
import re

from api.app import db
from api import helpers


class User(db.Model):
    """
    User model for the database.

    This is the main table for the database, and all other tables are connected to this one.
    :param id: A unique ID
    :param email: The user's email address
    :param pwd: The user's password (hashed)
    :param motion_pattern: The user's motion pattern (hashed)
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

    @validates('id')
    def validate_id(self, key, identifier):
        while User.query.filter(User.id == identifier).first():
            identifier = uuid.uuid4()

        return helpers.validate_id(self, key, identifier)

    @validates('email')
    def validate_username(self, key, email):
        if not email:
            raise AssertionError('No username provided')

        is_string = isinstance(email, str)
        is_unique = not db.session.execute(db.select(User).filter(User.email == email)).scalars().first()
        is_less_than_120_characters = len(email) <= 120

        if not is_string:
            raise AssertionError('Provided email is invalid')

        if not is_unique:
            raise AssertionError('Provided email is already in use')

        if not is_less_than_120_characters:
            raise AssertionError('Provided email is too long')

        if not re.fullmatch(r"^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:["
                            r"a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$", email):
            raise AssertionError('Provided email is not an email address')

        return email

    def set_password(self, password):
        if not password:
            raise AssertionError('Password not provided')

        if not re.match(r'\d.*[A-Z]|[A-Z].*\d', password):
            raise AssertionError('Password must contain 1 capital letter and 1 number')

        if len(password) < 8 or len(password) > 50:
            raise AssertionError('Password must be between 8 and 50 characters')

        self.pwd = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.pwd, password)

    def set_motion_pattern(self, motion_pattern):
        if not motion_pattern:
            raise AssertionError('Motion pattern not provided')

        self.motion_pattern = generate_password_hash(motion_pattern)

    def check_motion_pattern(self, motion_pattern):
        return check_password_hash(self.motion_pattern, motion_pattern)

    def check_face_recognition(self, file):
        # TODO: load the ML model and check the image against the output classification (email preferred)
        # Preview the received image - testing only
        # file.save('instance/' + self.email + '.jpg')
        return True


class UserFiles(db.Model):
    """The table of files attached to each user"""
    __tablename__ = "user_files"

    id = db.Column(db.Uuid, primary_key=True, unique=True, nullable=False)
    user_id = db.Column(db.Uuid, db.ForeignKey('user.id'), nullable=False)
    file_name = db.Column(db.String, nullable=False)
    file_data = db.Column(db.LargeBinary, nullable=False)

    @validates('id')
    def validate_id(self, key, identifier):
        while UserFiles.query.filter(UserFiles.id == identifier).first():
            identifier = uuid.uuid4()

        return helpers.validate_id(self, key, identifier)


class UserAuthMethods(db.Model):
    """The table indicating what authentication methods each user has enabled"""
    __tablename__ = "user_auth_methods"

    # Identifier information
    id = db.Column(db.Uuid, primary_key=True, unique=True, nullable=False)
    user_id = db.Column(db.Uuid, db.ForeignKey('user.id'), nullable=False)
    # Authentication method configuration
    password = db.Column(db.Boolean, nullable=False)
    motion_pattern = db.Column(db.Boolean, nullable=False)
    face_recognition = db.Column(db.Boolean, nullable=False)

    @validates('id')
    def validate_id(self, key, identifier):
        while UserAuthMethods.query.filter(UserAuthMethods.id == identifier).first():
            identifier = uuid.uuid4()

        return helpers.validate_id(self, key, identifier)


class LoginSession(db.Model):
    """The table of current and past login sessions

    This table is used to log all past successful and failed login attempts. It also tracks
    current login sessions and what stage they are at.
    """
    __tablename__ = "login_session"

    session_id = db.Column(db.Uuid, unique=True, nullable=False, primary_key=True)
    id = db.Column(db.Uuid, db.ForeignKey('user.id'), primary_key=True)
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

    @validates('session_id')
    def validate_id(self, key, identifier):
        while LoginSession.query.filter(LoginSession.session_id == identifier).first():
            identifier = uuid.uuid4()

        return helpers.validate_id(self, key, identifier)

    @validates('pico_id')
    def validate_pico_id(self, key, pico_id):
        is_unique = not db.session.execute(db.select(LoginSession)
                                           .filter(LoginSession.pico_id == pico_id)).scalars().first()

        if not pico_id:
            raise AssertionError('No pico_id provided')
        if not is_unique:
            raise AssertionError('Provided pico_id is not unique')
        return pico_id

    @validates('motion_added_sequence')
    def validate_motion_added_sequence(self, key, motion_added_sequence):
        if not motion_added_sequence:
            raise AssertionError('No motion added sequence provided')
        try:
            json.loads(motion_added_sequence)
        except json.JSONDecodeError:
            raise AssertionError('Motion added sequence is not a valid dictionary')

        return motion_added_sequence


class FailedEvent(db.Model):
    """The table of failed login events

    Events are linked to a login session, and are used to track what went wrong during a login.
    A failed event does not necessarily mean that the login failed, but it does mean that the
    user make a mistake during the login process and would have to try again.
    """
    __tablename__ = "failed_event"

    id = db.Column(db.Uuid, unique=True, nullable=False, primary_key=True)
    session_id = db.Column(db.Uuid, db.ForeignKey('login_session.session_id'), primary_key=True)
    date = db.Column(db.DateTime, nullable=False)
    event = db.Column(db.String, nullable=False)
    photo = db.Column(db.LargeBinary, nullable=True)

    @validates('id')
    def validate_id(self, key, identifier):
        while FailedEvent.query.filter(FailedEvent.id == identifier).first():
            identifier = uuid.uuid4()

        return helpers.validate_id(self, key, identifier)


class AuthSession(db.Model):
    __tablename__ = "auth_session"

    session_id = db.Column(db.Uuid, unique=True, nullable=False, primary_key=True)
    id = db.Column(db.Uuid, db.ForeignKey('user.id'), primary_key=True)
    date = db.Column(db.DateTime, nullable=False)

    @validates('id')
    def validate_id(self, key, identifier):
        while AuthSession.query.filter(AuthSession.id == identifier).first():
            identifier = uuid.uuid4()

        return helpers.validate_id(self, key, identifier)
