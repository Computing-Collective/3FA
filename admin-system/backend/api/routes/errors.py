from flask import Blueprint, jsonify

errors = Blueprint("errors", __name__)


@errors.app_errorhandler(Exception)
def server_error(error):
    """Format error messages"""
    return jsonify(msg=f"Error! {error}", success=0), 500
