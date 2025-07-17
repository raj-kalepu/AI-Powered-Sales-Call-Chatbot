from flask import Flask
from flask_cors import CORS
from pymongo import MongoClient
import os
from dotenv import load_dotenv
from routes.chat_routes import chat_bp, init_chat_routes

load_dotenv()

app = Flask(__name__)

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")
FLASK_RUN_PORT = int(os.getenv("FLASK_RUN_PORT", 5000))

CORS(app, resources={r"/api/*": {"origins": FRONTEND_URL}})

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
DB_NAME = os.getenv("DB_NAME", "sales_chatbot_db")

client = None
db = None
sessions_collection = None

try:
    client = MongoClient(MONGO_URI)
    db = client[DB_NAME]
    sessions_collection = db.sessions
    client.admin.command('ping')
    print("Successfully connected to MongoDB!")
except Exception as e:
    print(f"ERROR: Could not connect to MongoDB. Please check your MONGO_URI and ensure MongoDB is running. Error: {e}")
    

from backend.routes.chat_routes import chat_bp, init_chat_routes
from backend.routes.session_routes import session_bp, init_session_routes

if sessions_collection:
    init_chat_routes(db, sessions_collection)
    init_session_routes(sessions_collection)
else:
    print("WARNING: Database connection failed. Chat and session routes will not function correctly.")

app.register_blueprint(chat_bp)
app.register_blueprint(session_bp)

@app.route('/')
def index():
    return "AI Sales Chatbot Backend is running!"
