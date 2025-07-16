from flask import Blueprint, jsonify
from bson.objectid import ObjectId
from datetime import datetime

session_bp = Blueprint('session_bp', __name__)

# Global variables for DB (will be set by app.py)
sessions_collection = None

def init_session_routes(collection):
    """Initializes the session routes with the sessions collection object."""
    global sessions_collection
    sessions_collection = collection

@session_bp.route('/api/sessions', methods=['GET'])
def get_sessions():
    if not sessions_collection:
        return jsonify({"error": "Database connection not established."}), 500

    sessions = []
    try:
        # Fetch all sessions, excluding the 'messages' array for lighter load
        # Sort by last_active to show most recent first
        for session in sessions_collection.find({}, {"messages": 0}).sort("last_active", -1):
            sessions.append({
                "id": str(session["_id"]),
                "start_time": session["start_time"].isoformat() if isinstance(session["start_time"], datetime) else str(session["start_time"]),
                "last_active": session["last_active"].isoformat() if isinstance(session["last_active"], datetime) else str(session["last_active"]),
                "summary": session.get("summary", "No summary available")
            })
        return jsonify(sessions)
    except Exception as e:
        print(f"Error fetching sessions: {e}")
        return jsonify({"error": "Failed to retrieve sessions."}), 500

@session_bp.route('/api/sessions/<id>', methods=['GET'])
def get_session_transcript(id):
    if not sessions_collection:
        return jsonify({"error": "Database connection not established."}), 500

    try:
        session_id_obj = ObjectId(id)
        session = sessions_collection.find_one({"_id": session_id_obj})

        if session:
            # Convert ObjectId to string for JSON serialization
            session['_id'] = str(session['_id'])
            # Convert datetime objects to ISO format strings
            if 'start_time' in session and isinstance(session['start_time'], datetime):
                session['start_time'] = session['start_time'].isoformat()
            if 'last_active' in session and isinstance(session['last_active'], datetime):
                session['last_active'] = session['last_active'].isoformat()

            for msg in session.get('messages', []):
                if 'timestamp' in msg and isinstance(msg['timestamp'], datetime):
                    msg['timestamp'] = msg['timestamp'].isoformat()
            return jsonify(session)
        else:
            return jsonify({"error": "Session not found"}), 404
    except Exception as e:
        print(f"Error fetching session transcript for ID {id}: {e}")
        return jsonify({"error": f"Invalid session ID or database error: {e}"}), 400