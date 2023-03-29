from flask import Response, Blueprint

base = Blueprint("base", __name__)


@base.route("/", strict_slashes=False)
def index():
    """Index route for the backend server"""
    return Response("OK", status=200)


@base.route("/health", strict_slashes=False)
def health():
    """Health check route for the backend server"""
    return Response("OK", status=200)
