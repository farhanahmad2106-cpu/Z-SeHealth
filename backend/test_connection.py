import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI")
print("Connecting with URI:", MONGODB_URI)

try:
    client = MongoClient(MONGODB_URI)
    
    # 1. List all database names in your cluster
    db_names = client.list_database_names()
    print("\n--- DATABASES FOUND IN YOUR ATLAS CLUSTER ---")
    for name in db_names:
        print(f" Database: {name}")
        # List collections inside each database
        collections = client[name].list_collection_names()
        for col in collections:
            print(f"   └─ Collection: {col}")
            
except Exception as e:
    print("\nError occurred:", e)