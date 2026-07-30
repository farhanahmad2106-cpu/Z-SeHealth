"""
Sarvam AI Client — Z-SeHealth
Reserved for Z-Elite (₹998/month) tier only.
Handles vision scan and translation via Sarvam's India-first AI APIs.

⚠️ IMPORTANT: This client is ONLY called by the ai_router when the user's tier is "elite".
   Never call these functions directly for free/starter/pro users.
   API Key: Set SARVAM_API_KEY in backend/.env — never hardcode here.
"""
import os
import httpx
from typing import Optional

SARVAM_API_KEY = os.getenv("SARVAM_API_KEY", "")
SARVAM_BASE = "https://api.sarvam.ai"


async def sarvam_scan(image_data: str, prompt: str) -> Optional[dict]:
    """
    Calls Sarvam AI Vision API for food ingredient scanning.
    Only available to Z-Elite tier users.
    Returns parsed dict on success, None on any failure.
    """
    if not SARVAM_API_KEY:
        print("Sarvam AI: SARVAM_API_KEY not set. Skipping.")
        return None

    try:
        headers = {
            "Authorization": f"Bearer {SARVAM_API_KEY}",
            "Content-Type": "application/json",
        }
        payload = {
            "image": image_data,
            "prompt": prompt,
        }
        async with httpx.AsyncClient(timeout=60.0) as client:
            resp = await client.post(
                f"{SARVAM_BASE}/v1/vision",
                headers=headers,
                json=payload
            )
            if resp.status_code == 200:
                return resp.json()
            else:
                print(f"Sarvam Vision API error: {resp.status_code} — {resp.text}")
                return None
    except Exception as e:
        print(f"Sarvam scan failed: {e}")
        return None


async def sarvam_translate(texts: list, target_lang: str) -> list:
    """
    Calls Sarvam AI Translation API for ingredient name translation.
    Only available to Z-Elite tier users (50+ Indian languages).
    Returns translated list on success, original list on failure.
    """
    if not SARVAM_API_KEY:
        print("Sarvam AI: SARVAM_API_KEY not set. Returning original texts.")
        return texts

    try:
        headers = {
            "Authorization": f"Bearer {SARVAM_API_KEY}",
            "Content-Type": "application/json",
        }
        payload = {
            "texts": texts,
            "target_language_code": target_lang,
        }
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(
                f"{SARVAM_BASE}/v1/translate",
                headers=headers,
                json=payload
            )
            if resp.status_code == 200:
                return resp.json().get("translations", texts)
            else:
                print(f"Sarvam Translate API error: {resp.status_code} — {resp.text}")
                return texts
    except Exception as e:
        print(f"Sarvam translate failed: {e}")
        return texts
