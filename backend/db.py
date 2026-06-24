# db.py - Refined
import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")

try:
    client = MongoClient(MONGODB_URI)
    db = client["Z-sehealth"]
    # Trigger a connection check
    client.admin.command('ping') 
    print("Successfully connected to MongoDB")
except Exception as e:
    print(f"MongoDB Connection Error: {e}")

foods_collection = db["foods"]