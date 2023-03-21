import os

from dotenv import load_dotenv
from flask import Flask
from flask_bcrypt import Bcrypt
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy

from api.errors import errors

# Load environment variables from .env file
load_dotenv(".env")

# Initialize extensions
db: SQLAlchemy = SQLAlchemy()  # Database
bcrypt = Bcrypt()  # Encryption


def create_app(test_config=None):
    # Create the Flask app
    app = Flask(__name__)
    CORS(app)
    # Register the error handling endpoint
    app.register_blueprint(errors)
    # Register the API endpoints
    from api.routes import api
    app.register_blueprint(api)

    # Load the configuration
    app.secret_key = os.getenv("SECRET_KEY")
    app.config['SQLALCHEMY_DATABASE_URI'] = "sqlite:///database.db"
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = True

    if test_config is not None:
        # Load the test config if passed in
        app.config.from_mapping(test_config)

    # Initialize the database and create the tables
    db.init_app(app)
    with app.app_context():
        # Clear the test database if testing
        if test_config is not None:
            db.drop_all()

        db.create_all()

    # Initialize the encryption extension
    bcrypt.init_app(app)

    return app
