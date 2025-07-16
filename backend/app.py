from flask import Flask
from flask_cors import CORS
from pymongo import MongoClient
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)

# --- Configuration ---
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")
FLASK_RUN_PORT = int(os.getenv("FLASK_RUN_PORT", 5000))

# Configure CORS to allow requests from the Next.js frontend
CORS(app, resources={r"/api/*": {"origins": FRONTEND_URL}})

# --- Database Connection ---
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
DB_NAME = os.getenv("DB_NAME", "sales_chatbot_db")

client = None
db = None
sessions_collection = None

try:
    client = MongoClient(MONGO_URI)
    db = client[DB_NAME]
    sessions_collection = db.sessions
    # Ping the database to ensure connection
    client.admin.command('ping')
    print("Successfully connected to MongoDB!")
except Exception as e:
    print(f"ERROR: Could not connect to MongoDB. Please check your MONGO_URI and ensure MongoDB is running. Error: {e}")
    # In a real production app, you might want to exit or log this more severely.

# --- Register Blueprints (Routes) ---
from backend.routes.chat_routes import chat_bp, init_chat_routes
from backend.routes.session_routes import session_bp, init_session_routes

# Initialize blueprints with database objects
if sessions_collection:
    init_chat_routes(db, sessions_collection)
    init_session_routes(sessions_collection)
else:
    print("WARNING: Database connection failed. Chat and session routes will not function correctly.")

app.register_blueprint(chat_bp)
app.register_blueprint(session_bp)

# --- Root Route (Optional, for testing if backend is up) ---
@app.route('/')
def index():
    return "AI Sales Chatbot Backend is running!"

if __name__ == '__main__':
    # Ensure the database connection is established before running the app
    if sessions_collection is None:
        print("Exiting: Cannot start Flask app without a MongoDB connection.")
        exit(1) # Exit if DB connection failed

    print(f"Flask app running on http://localhost:{FLASK_RUN_PORT}")
    app.run(debug=True, port=FLASK_RUN_PORT)