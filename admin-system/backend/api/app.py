import os
import shutil

import torch
from dotenv import load_dotenv
from flask import Flask
from flask_bcrypt import Bcrypt
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy

from api.routes.errors import errors

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
    from api.routes.base import base
    app.register_blueprint(base)
    from api.routes.client import client
    app.register_blueprint(client)
    from api.routes.admin import admin
    app.register_blueprint(admin)

    # Load the configuration
    app.secret_key = os.getenv("SECRET_KEY")
    app.config['SQLALCHEMY_DATABASE_URI'] = "sqlite:///database.db"
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['DATA_FOLDER'] = "data"

    if test_config is not None:
        # Load the test config if passed in
        app.config.from_mapping(test_config)

    # Initialize the database and create the tables
    db.init_app(app)
    with app.app_context():
        # Clear the test database and data files if testing
        if test_config is not None:
            db.drop_all()
            shutil.rmtree(os.path.join(app.instance_path, app.config['DATA_FOLDER']), ignore_errors=True)

        db.create_all()
        from api.machine_learning_eval import model
        model.load_state_dict(torch.load(os.path.join(app.instance_path, "model.pth"),
                                         map_location=torch.device('cpu')))
        model.eval()

    # Create the data directory for user files
    os.makedirs(os.path.join(app.instance_path, app.config['DATA_FOLDER']), exist_ok=True)

    # Initialize the encryption extension
    bcrypt.init_app(app)

    return app
