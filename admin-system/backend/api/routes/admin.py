import uuid

from flask import Response, jsonify, request, Blueprint

from api import helpers

admin = Blueprint("admin", __name__, url_prefix="/api/dashboard")


###################################################################################
#                             Admin Dashboard Routes                              #
###################################################################################
@admin.route("/failed_events", methods=["GET"], strict_slashes=False)
def get_failed_events():
    """
    Route for getting failed login events

    If both email and session_id are provided, the email will be used.

    Query params:

    - ``email``: The email of the user to get failed events for (optional)
    - ``session_id``: The session ID of the login session (optional)

    :return: The failed events for the user
    """
    email: str = request.args.get('email', None)
    session_id: str = request.args.get('session_id', None)

    user = None
    session = None

    if email is not None:
        user = helpers.get_user_from_email(email)
        if user is None:
            return jsonify(msg="Invalid email, please try again.", success=0), 401
    elif session_id is not None:
        session = helpers.get_login_session_from_id(uuid.UUID(session_id))
        if session is None:
            return jsonify(msg="Invalid session_id, please try again.", success=0), 401

    events = helpers.get_failed_login_events_as_dict(user, session)

    return jsonify(msg="Failed events retrieved.", success=1, events=events), 200
