from flask import Blueprint, request, jsonify
from datetime import datetime
from bson.objectid import ObjectId
import openai
import os

chat_bp = Blueprint('chat_bp', __name__)

db = None
sessions_collection = None

def init_chat_routes(database, collection):
    """Initializes the chat routes with the database and collection objects."""
    global db, sessions_collection
    db = database
    sessions_collection = collection

def get_openai_response(conversation_history):
    """
    Calls the OpenAI API with the given conversation history.
    `conversation_history` is a list of dicts with "role" and "content".
    """
    if not openai.api_key:
        raise ValueError("OPENAI_API_KEY is not set.")

    messages_for_openai = [
        {"role": "system", "content": "You are an AI sales assistant. Your goal is to help users practice sales calls. Be helpful, engaging, and guide the conversation towards a sale, handling objections professionally. Keep responses concise and focused on sales interactions."}
    ]
    messages_for_openai.extend(conversation_history)

    try:
        response = openai.chat.completions.create(
            model="gpt-4o",
            messages=messages_for_openai,
            temperature=0.7, 
            max_tokens=200 
        )
        return response.choices[0].message.content
    except openai.APIError as e:
        print(f"OpenAI API error: {e}")
        raise
    except Exception as e:
        print(f"An unexpected error occurred with OpenAI API: {e}")
        raise

@chat_bp.route('/api/chat', methods=['POST'])
def chat():
    if not sessions_collection:
        return jsonify({"error": "Database connection not established."}), 500

    data = request.json
    user_message = data.get('message')
    session_id_str = data.get('sessionId')

    if not user_message:
        return jsonify({"error": "No message provided"}), 400

    current_time = datetime.now()
    session = None
    messages_in_session = []

    if session_id_str:
        try:
            session_id_obj = ObjectId(session_id_str)
            session = sessions_collection.find_one({"_id": session_id_obj})
            if session:
                messages_in_session = session.get("messages", [])
            else:
                session_id_str = None 
        except Exception: 
            session_id_str = None

    if not session_id_str:
        new_session_data = {
            "start_time": current_time,
            "last_active": current_time,
            "messages": [],
            "summary": "New Chat Session"
        }
        inserted_result = sessions_collection.insert_one(new_session_data)
        session_id_obj = inserted_result.inserted_id
        session_id_str = str(session_id_obj)
        session = new_session_data 
        session["_id"] = session_id_obj 

    conversation_for_openai = []
    for msg in messages_in_session:
        if msg['role'] in ['user', 'assistant']:
            conversation_for_openai.append({"role": msg['role'], "content": msg['text']})
    conversation_for_openai.append({"role": "user", "content": user_message})

    ai_response = "I'm sorry, I couldn't get a response from the AI."
    try:
        ai_response = get_openai_response(conversation_for_openai)
    except Exception as e:
        print(f"Error getting AI response: {e}")

    user_message_doc = {
        "role": "user",
        "text": user_message,
        "timestamp": current_time
    }
    ai_message_doc = {
        "role": "assistant",
        "text": ai_response,
        "timestamp": datetime.now() 
    }

    sessions_collection.update_one(
        {"_id": ObjectId(session_id_str)},
        {
            "$push": {
                "messages": {"$each": [user_message_doc, ai_message_doc]}
            },
            "$set": {"last_active": datetime.now()}
        }
    )

    return jsonify({"ai_response": ai_response, "sessionId": session_id_str})