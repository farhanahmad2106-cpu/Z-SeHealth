from fastapi import APIRouter
from pydantic import BaseModel
from typing import List

router = APIRouter()

class TranslationRequest(BaseModel):
    text_items: List[str]
    target_language: str

@router.post("/translate")
async def translate_text(request: TranslationRequest):
    # This is where your AI/Google Translate logic goes
    # For now, returning a mock response to prevent frontend errors
    return {"translations": [f"[{request.target_language}] {text}" for text in request.text_items]}