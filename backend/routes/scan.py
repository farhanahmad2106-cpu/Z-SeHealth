from fastapi import APIRouter, UploadFile, File

router = APIRouter()

@router.post("/scan")
async def scan_food(file: UploadFile = File(...)):
    # Simulated AI response (Gemini placeholder)
    return {
        "name": "Paneer Butter Masala",
        "calories": 320,
        "protein": 12,
        "carbs": 18,
        "fat": 22,
        "ingredients": ["Paneer", "Butter", "Tomato", "Spices"],
        "insight": "High fat dish. Consume in moderation."
    }

