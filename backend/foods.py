from fastapi import APIRouter, HTTPException, Query
from db import foods_collection

router = APIRouter()

# 1. Get all foods (This is what is currently returning 200 OK)
# foods.py - Refined Route
@router.get("/foods")
def get_foods(search: str = Query(None)): # Make search optional
    if search:
        # Fuzzy search using regex
        results = list(foods_collection.find(
            {"name": {"$regex": search, "$options": "i"}}, 
            {"_id": 1, "name": 1, "brand": 1, "safety_score": 1, "ingredients": 1}
        ))
    else:
        # Return initial list (limited to 50 for performance)
        results = list(foods_collection.find({}, {}).limit(50))
    
    # Convert MongoDB ObjectId to string so JSON can handle it
    for item in results:
        item["_id"] = str(item["_id"])
    return results