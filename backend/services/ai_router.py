"""
AI Router by Tier — Z-SeHealth
Routes scan requests to different AI models based on the user's subscription tier.

Tier routing:
  elite   (₹998): Sarvam AI Vision → NVIDIA Vision → Gemini Flash
  pro     (₹732): NVIDIA Advanced Vision → Gemini Flash
  starter (₹366): NVIDIA LLaMA Vision → Gemini Flash
  free    (₹0):   NVIDIA LLaMA Vision → Gemini Flash  (20 scans/month)
"""
import os
import json
import base64
import asyncio
from typing import Optional
import httpx


# ---- Helpers from main.py (re-imported here to avoid circular deps) ----

def clean_json_response(text: str):
    """Removes markdown code blocks and extracts JSON safely."""
    s = text.strip()
    if "```" in s:
        try:
            if "```json" in s:
                start = s.find("```json") + 7
            else:
                start = s.find("```") + 3
            end = s.find("```", start)
            if end != -1:
                s = s[start:end]
        except Exception:
            pass
    s = s.strip()
    try:
        return json.loads(s)
    except json.JSONDecodeError:
        try:
            first = s.find("{")
            last = s.rfind("}")
            if first != -1 and last != -1 and last > first:
                return json.loads(s[first:last + 1])
        except Exception:
            pass
        raise


def get_nvidia_keys():
    keys = []
    for key_name in ["NVIDIA_API_KEY", "NVIDIA_API_KEY_1", "NVIDIA_API_KEY_2",
                      "NVIDIA_API_KEY_3", "NVIDIA_API_KEY_4", "NVIDIA_API_KEY_5"]:
        val = os.getenv(key_name)
        if val and val not in keys:
            keys.append(val)
    return keys


# ---- NVIDIA Vision Scan ----

async def _try_nvidia_vision(image_data: str, prompt: str, nvidia_key: str, model: Optional[str] = None) -> Optional[dict]:
    """Call NVIDIA vision model with a given API key."""
    if not nvidia_key:
        return None
    vision_model = model or os.getenv("NVIDIA_VISION_MODEL", "meta/llama-3.2-11b-vision-instruct")
    try:
        async with httpx.AsyncClient(timeout=60.0) as http_client:
            headers = {
                "Authorization": f"Bearer {nvidia_key}",
                "Content-Type": "application/json",
            }
            payload = {
                "model": vision_model,
                "messages": [
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": prompt},
                            {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{image_data}"}},
                        ],
                    }
                ],
                "temperature": 0.1,
                "max_tokens": 1024,
            }
            resp = await http_client.post(
                "https://integrate.api.nvidia.com/v1/chat/completions",
                headers=headers,
                json=payload,
            )
            if resp.status_code == 200:
                content = resp.json().get("choices", [{}])[0].get("message", {}).get("content", "")
                return clean_json_response(content)
    except Exception as e:
        print(f"NVIDIA vision ({vision_model}) failed: {e}")
    return None


# ---- Gemini Flash Vision Scan ----

async def _try_gemini_vision(image_data: str, prompt: str) -> Optional[dict]:
    """Call Gemini 2.0 Flash vision as the last-resort fallback."""
    try:
        from google import genai
        from google.genai import types
        gemini_key = os.getenv("GEMINI_API_KEY")
        if not gemini_key:
            return None
        gemini_client = genai.Client(
            api_key=gemini_key,
            http_options={"api_version": "v1beta"}
        )
        image_bytes = base64.b64decode(image_data)
        loop = asyncio.get_event_loop()

        def call_gemini():
            return gemini_client.models.generate_content(
                model="gemini-2.0-flash",
                contents=[
                    types.Part.from_bytes(data=image_bytes, mime_type="image/jpeg"),
                    prompt,
                ],
            )

        response = await loop.run_in_executor(None, call_gemini)
        return clean_json_response(response.text)
    except Exception as e:
        print(f"Gemini vision fallback failed: {e}")
    return None


# ---- Sarvam Vision Scan (Elite only) ----

async def _try_sarvam_vision(image_data: str, prompt: str) -> Optional[dict]:
    """Call Sarvam AI Vision — only for Z-Elite tier."""
    try:
        from services.sarvam_client import sarvam_scan
        result = await sarvam_scan(image_data, prompt)
        return result
    except Exception as e:
        print(f"Sarvam vision failed: {e}")
    return None


# ---- Main Tier Router ----

async def route_scan_by_tier(image_data: str, prompt: str, tier: str) -> Optional[dict]:
    """
    Routes AI scan request based on the user's subscription tier.

    elite   → Sarvam AI → NVIDIA (any key) → Gemini Flash
    pro     → NVIDIA (any key) → Gemini Flash
    starter → NVIDIA (any key) → Gemini Flash
    free    → NVIDIA (any key) → Gemini Flash  (quota enforced separately)
    """
    nvidia_keys = get_nvidia_keys()

    if tier == "elite":
        # 1st: Sarvam AI Vision (India-first, Indic language optimized)
        print("[AI Router] Elite tier: trying Sarvam AI Vision...")
        result = await _try_sarvam_vision(image_data, prompt)
        if result:
            print("[AI Router] Sarvam AI success.")
            return result

        # 2nd: NVIDIA Vision (any available key)
        print("[AI Router] Sarvam failed. Trying NVIDIA Vision...")
        for key in nvidia_keys:
            result = await _try_nvidia_vision(image_data, prompt, key)
            if result:
                print("[AI Router] NVIDIA Vision success (Elite fallback).")
                return result

        # 3rd: Gemini Flash
        print("[AI Router] NVIDIA failed. Trying Gemini Flash...")
        return await _try_gemini_vision(image_data, prompt)

    elif tier == "pro":
        # 1st: NVIDIA Vision (advanced model)
        print("[AI Router] Pro tier: trying NVIDIA Advanced Vision...")
        advanced_model = os.getenv("NVIDIA_VISION_MODEL_PRO", os.getenv("NVIDIA_VISION_MODEL", "meta/llama-3.2-11b-vision-instruct"))
        for key in nvidia_keys:
            result = await _try_nvidia_vision(image_data, prompt, key, model=advanced_model)
            if result:
                print("[AI Router] NVIDIA Vision success (Pro tier).")
                return result

        # 2nd: Gemini Flash
        print("[AI Router] NVIDIA failed. Trying Gemini Flash...")
        return await _try_gemini_vision(image_data, prompt)

    elif tier == "starter":
        # 1st: NVIDIA LLaMA Vision
        print("[AI Router] Starter tier: trying NVIDIA LLaMA Vision...")
        for key in nvidia_keys:
            result = await _try_nvidia_vision(image_data, prompt, key)
            if result:
                print("[AI Router] NVIDIA Vision success (Starter tier).")
                return result

        # 2nd: Gemini Flash
        print("[AI Router] NVIDIA failed. Trying Gemini Flash...")
        return await _try_gemini_vision(image_data, prompt)

    else:
        # free tier: NVIDIA → Gemini Flash (quota enforced by middleware)
        print("[AI Router] Free tier: trying NVIDIA LLaMA Vision...")
        for key in nvidia_keys:
            result = await _try_nvidia_vision(image_data, prompt, key)
            if result:
                print("[AI Router] NVIDIA Vision success (Free tier).")
                return result

        print("[AI Router] NVIDIA failed. Trying Gemini Flash (free fallback)...")
        return await _try_gemini_vision(image_data, prompt)
