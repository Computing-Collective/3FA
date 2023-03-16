from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from dotenv import load_dotenv
import os

from api.errors import errors

# Load environment variables from .env file
load_dotenv(".env")

# Initialize extensions
db = SQLAlchemy()
bcrypt = Bcrypt()


def create_app():
    # Create the Flask app
    app = Flask(__name__)
    # Register the error handling endpoint
    app.register_blueprint(errors)

    # Load the configuration
    app.secret_key = os.getenv("SECRET_KEY")
    app.config['SQLALCHEMY_DATABASE_URI'] = "sqlite:///database.db"
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = True

    # Initialize the database and create the tables
    db.init_app(app)
    with app.app_context():
        db.create_all()

    # Initialize the encryption extension
    bcrypt.init_app(app)

    return app
