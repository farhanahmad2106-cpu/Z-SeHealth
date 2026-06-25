from fastapi import FastAPI, HTTPException, Query, Depends
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
import os
import json
import base64
from pydantic import BaseModel
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from google import genai
from google.genai import types
import asyncio
import httpx
import firebase_admin
from firebase_admin import credentials, auth as firebase_auth
from datetime import datetime, timezone, timedelta
from fastapi import Header, Request

# Load environment variables
load_dotenv()
# Trigger reload to load updated .env keys

app = FastAPI(title="Z-SeHealth API")

# --- CORS SETUP ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://z-sehealth.vercel.app"
    ],
    allow_origin_regex=r"https://z-sehealth-.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- GEMINI CLIENT SETUP ---
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
client = genai.Client(
    api_key=GEMINI_API_KEY,
    http_options={'api_version': 'v1beta'}
)
MODEL_NAME = "gemini-2.0-flash" 

# --- DATABASE SETUP ---
MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
mongo_client = AsyncIOMotorClient(MONGODB_URI)
db = mongo_client["Z-sehealth"]
foods_collection = db["foods"]
users_collection = db["users"]

# --- FIREBASE SETUP ---
try:
    firebase_creds_json = os.getenv("FIREBASE_CREDENTIALS")
    if firebase_creds_json:
        cred_dict = json.loads(firebase_creds_json)
        cred = credentials.Certificate(cred_dict)
    else:
        cred_path = os.path.join(os.path.dirname(__file__), "firebase-admin-key.json")
        cred = credentials.Certificate(cred_path)
        
    firebase_admin.initialize_app(cred)
    print("Firebase Admin initialized successfully.")
except Exception as e:
    print(f"Warning: Failed to initialize Firebase Admin SDK. {e}")

@app.on_event("startup")
async def startup_event():
    try:
        count = await foods_collection.count_documents({})
        if count == 0:
            print("Database is empty. Automatically seeding items...")
            try:
                from seed_1000 import generate_1000_items
                await generate_1000_items()
                print("Database successfully seeded with 1,000 items.")
            except Exception as e:
                print(f"Failed to run seed_1000 generator: {e}. Falling back to mock_foods.json.")
                mock_file = os.path.join(os.path.dirname(__file__), "mock_foods.json")
                if os.path.exists(mock_file):
                    with open(mock_file, "r", encoding="utf-8") as f:
                        foods = json.load(f)
                    for food in foods:
                        if "_id" in food:
                            del food["_id"]
                    if foods:
                        await foods_collection.insert_many(foods)
                        print(f"Successfully auto-seeded database with {len(foods)} items from mock_foods.json.")
                else:
                    print("mock_foods.json not found. Auto-seeding skipped.")
    except Exception as e:
        print(f"Error during auto-seeding check: {e}")

# --- HELPER: CLEAN JSON RESPONSE ---
def clean_json_response(text: str):
    """Removes markdown code blocks and extracts JSON safely."""
    s = text.strip()
    
    # Try finding markdown code block
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
        # Fallback: extract the outermost JSON braces
        try:
            first = s.find("{")
            last = s.rfind("}")
            if first != -1 and last != -1 and last > first:
                return json.loads(s[first:last + 1])
        except Exception:
            pass
        raise
# --- API ROUTES ---

def get_local_mock_foods(search: str = "") -> List[dict]:
    mock_file = os.path.join(os.path.dirname(__file__), "mock_foods.json")
    if not os.path.exists(mock_file):
        print(f"Mock file not found: {mock_file}")
        return []
    try:
        with open(mock_file, "r", encoding="utf-8") as f:
            foods = json.load(f)
        if not search:
            return foods[:50]
        search_lower = search.lower()
        matched = []
        for f in foods:
            if search_lower in f.get("name", "").lower() or search_lower in f.get("brand", "").lower():
                matched.append(f)
        return matched[:50]
    except Exception as e:
        print(f"Error reading mock_foods.json: {e}")
        return []

@app.get("/api/foods")
async def get_foods(search: str = ""):
    results = []
    db_error = False
    try:
        query = {"name": {"$regex": search, "$options": "i"}} if search else {}
        cursor = foods_collection.find(query).limit(50)
        results = await cursor.to_list(length=50)
        for doc in results:
            doc["_id"] = str(doc["_id"])
    except Exception as e:
        print(f"Database query failed, using local mock: {e}")
        db_error = True

    if db_error or not results:
        results = get_local_mock_foods(search)

    if len(results) == 0 and search:
        fallback = await get_ai_fallback_food(search)
        if fallback: return [fallback]
    return results

async def get_ai_fallback_food(food_query: str) -> Optional[dict]:
    prompt = f"Analyze nutritional properties of: {food_query}. Return ONLY a raw JSON object with: name, brand, safety_score, status, ingredients (name, safety, description), warnings. No markdown."
    try:
        response = client.models.generate_content(model=MODEL_NAME, contents=prompt)
        ai_data = clean_json_response(response.text)
        ai_data["_id"] = f"ai-{base64.b64encode(food_query.encode()).decode()[:8]}"
        return ai_data
    except Exception as e:
        print(f"AI Fallback error: {e}")
        return None

async def try_gemini_translate(text_items: List[str], target_lang: str) -> Optional[List[str]]:
    """Attempts translation using the Gemini API."""
    print("Attempting translation using Gemini API...")
    prompt = f"Translate this list to {target_lang}: {text_items}. Return ONLY a JSON list of strings. No markdown."
    try:
        loop = asyncio.get_event_loop()
        def call_gemini():
            return client.models.generate_content(
                model=MODEL_NAME,
                contents=prompt
            )
        response = await loop.run_in_executor(None, call_gemini)
        return clean_json_response(response.text)
    except Exception as e:
        raise e

async def try_ollama_translate(text_items: List[str], target_lang: str) -> Optional[List[str]]:
    """Attempts translation using a local Ollama model."""
    print("Checking for local Ollama models for translation...")
    try:
        async with httpx.AsyncClient(timeout=30.0) as http_client:
            try:
                tags_resp = await http_client.get("http://localhost:11434/api/tags")
                if tags_resp.status_code == 200:
                    models_info = tags_resp.json().get("models", [])
                    installed_models = [m.get("name") for m in models_info]
                else:
                    installed_models = []
            except Exception as tags_err:
                print(f"Ollama local service is not running or tags fetch failed: {tags_err}")
                return None

            if not installed_models:
                return None
            
            selected_model = installed_models[0]
            for m in installed_models:
                if "llama3" in m or "mistral" in m or "gemma" in m or "qwen" in m:
                    selected_model = m
                    break
            
            print(f"Attempting local translation using Ollama model: {selected_model}")
            prompt = f"Translate this JSON list of strings to {target_lang}: {text_items}. Return ONLY a raw JSON list of strings. No markdown, explanation, or notes."
            payload = {
                "model": selected_model,
                "messages": [
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                "stream": False,
                "options": {
                    "temperature": 0.1
                }
            }
            resp = await http_client.post("http://localhost:11434/api/chat", json=payload)
            if resp.status_code == 200:
                result = resp.json()
                message_content = result.get("message", {}).get("content", "")
                print(f"Ollama translation response received: {message_content[:200]}...")
                return clean_json_response(message_content)
    except Exception as e:
        print(f"Ollama translation failed: {e}")
    return None

async def try_nvidia_translate(text_items: List[str], target_lang: str) -> Optional[List[str]]:
    """Attempts translation using the NVIDIA API."""
    nvidia_key = os.getenv("NVIDIA_API_KEY")
    if not nvidia_key:
        print("NVIDIA_API_KEY not found in environment variables.")
        return None
    
    print("Attempting translation using NVIDIA API...")
    prompt = f"Translate this JSON list of strings to {target_lang}: {text_items}. Return ONLY a raw JSON list of strings. No markdown, explanation, or notes."
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as http_client:
            headers = {
                "Authorization": f"Bearer {nvidia_key}",
                "Content-Type": "application/json"
            }
            payload = {
                "model": "meta/llama-3.1-8b-instruct",
                "messages": [
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                "temperature": 0.1
            }
            resp = await http_client.post(
                "https://integrate.api.nvidia.com/v1/chat/completions",
                headers=headers,
                json=payload
            )
            if resp.status_code == 200:
                result = resp.json()
                content = result.get("choices", [{}])[0].get("message", {}).get("content", "")
                print(f"NVIDIA translation response received: {content[:200]}...")
                return clean_json_response(content)
            else:
                print(f"NVIDIA API returned status code {resp.status_code}: {resp.text}")
    except Exception as e:
        print(f"NVIDIA API translation failed: {e}")
    return None

@app.post("/api/translate")
async def translate_text(request: dict):
    text_items = request.get("text_items", [])
    target_lang = request.get("target_language", "Hindi")
    if not text_items: 
        return {"translations": []}
        
    errors = []
    
    # 1. Try Ollama (Primary)
    try:
        result = await try_ollama_translate(text_items, target_lang)
        if result:
            print("Successfully translated using Local Ollama model.")
            return {"translations": result}
    except Exception as e:
        print(f"Ollama translation fallback failed: {e}")
        errors.append(f"Ollama: {str(e)}")

    # 2. Try NVIDIA (Secondary)
    try:
        result = await try_nvidia_translate(text_items, target_lang)
        if result:
            print("Successfully translated using NVIDIA API.")
            return {"translations": result}
    except Exception as e:
        print(f"NVIDIA translation fallback failed: {e}")
        errors.append(f"NVIDIA: {str(e)}")

    # 3. Try Gemini (Tertiary)
    try:
        result = await try_gemini_translate(text_items, target_lang)
        if result:
            print("Successfully translated using Gemini API.")
            return {"translations": result}
    except Exception as e:
        print(f"Gemini API translation failed: {e}")
        errors.append(f"Gemini: {str(e)}")

    # Fallback to returning original untranslated text items
    print(f"All translation methods failed. Returning original texts. Errors: {errors}")
    return {"translations": text_items}

async def try_gemini_scan(image_data: str, prompt: str) -> Optional[dict]:
    """Attempts to analyze the image using the Gemini API."""
    print("Attempting scan using Gemini API...")
    try:
        loop = asyncio.get_event_loop()
        def call_gemini():
            return client.models.generate_content(
                model=MODEL_NAME,
                contents=[
                    types.Part.from_bytes(data=base64.b64decode(image_data), mime_type="image/jpeg"),
                    prompt
                ]
            )
        response = await loop.run_in_executor(None, call_gemini)
        return clean_json_response(response.text)
    except Exception as e:
        raise e

async def try_ollama_scan(image_data: str, prompt: str) -> Optional[dict]:
    """Attempts to analyze the image using a local Ollama vision model."""
    print("Checking for local Ollama vision models...")
    try:
        async with httpx.AsyncClient(timeout=60.0) as http_client:
            # 1. Fetch installed models to automatically find a vision model
            try:
                tags_resp = await http_client.get("http://localhost:11434/api/tags")
                if tags_resp.status_code == 200:
                    models_info = tags_resp.json().get("models", [])
                    installed_models = [m.get("name") for m in models_info]
                else:
                    installed_models = []
            except Exception as tags_err:
                print(f"Ollama local service is not running or tags fetch failed: {tags_err}")
                return None

            # 2. Select a model (prefer llama3.2-vision, then any model with vision/llava/moondream, default to llama3.2-vision)
            selected_model = "llama3.2-vision"
            if installed_models:
                vision_keywords = ["vision", "llava", "moondream", "bakllava", "minicpm"]
                for model in installed_models:
                    if any(kw in model.lower() for kw in vision_keywords):
                        selected_model = model
                        break
                else:
                    selected_model = installed_models[0]
            
            print(f"Attempting local scan using Ollama model: {selected_model}")
            
            payload = {
                "model": selected_model,
                "messages": [
                    {
                        "role": "user",
                        "content": prompt,
                        "images": [image_data]
                    }
                ],
                "stream": False,
                "options": {
                    "temperature": 0.1
                }
            }
            
            resp = await http_client.post("http://localhost:11434/api/chat", json=payload)
            if resp.status_code == 200:
                result = resp.json()
                message_content = result.get("message", {}).get("content", "")
                print(f"Ollama response received: {message_content[:200]}...")
                return clean_json_response(message_content)
            else:
                print(f"Ollama returned status code: {resp.status_code}")
    except Exception as e:
        print(f"Ollama scan failed: {e}")
    return None

async def try_nvidia_scan(image_data: str, prompt: str) -> Optional[dict]:
    """Attempts to analyze the image using NVIDIA API."""
    nvidia_key = os.getenv("NVIDIA_API_KEY")
    if not nvidia_key:
        print("NVIDIA_API_KEY not found in environment variables.")
        return None
    
    print("Attempting scan using NVIDIA API...")
    try:
        async with httpx.AsyncClient(timeout=60.0) as http_client:
            headers = {
                "Authorization": f"Bearer {nvidia_key}",
                "Content-Type": "application/json"
            }
            payload = {
                "model": "nvidia/nemotron-nano-12b-v2-vl",
                "messages": [
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": prompt},
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:image/jpeg;base64,{image_data}"
                                }
                            }
                        ]
                    }
                ],
                "max_tokens": 1024,
                "temperature": 0.1
            }
            
            resp = await http_client.post(
                "https://integrate.api.nvidia.com/v1/chat/completions",
                headers=headers,
                json=payload
            )
            if resp.status_code == 200:
                result = resp.json()
                content = result.get("choices", [{}])[0].get("message", {}).get("content", "")
                print(f"NVIDIA API response received: {content[:200]}...")
                return clean_json_response(content)
            else:
                print(f"NVIDIA API returned status code {resp.status_code}: {resp.text}")
    except Exception as e:
        print(f"NVIDIA API scan failed: {e}")
    return None

class ScanRequest(BaseModel):
    image: str

class TokenRequest(BaseModel):
    token: str

@app.post("/api/auth/sync")
async def sync_user(req: TokenRequest):
    try:
        # Verify the Firebase ID token
        decoded_token = firebase_auth.verify_id_token(req.token)
        uid = decoded_token.get("uid")
        email = decoded_token.get("email")
        name = decoded_token.get("name", "")
        picture = decoded_token.get("picture", "")

        now = datetime.now(timezone.utc)
        today_str = now.strftime("%Y-%m-%d")

        # Check if user exists in our DB
        existing_user = await users_collection.find_one({"uid": uid})
        
        if existing_user:
            last_login_date = existing_user.get("last_login_date")
            streak = existing_user.get("streak", 0)
            
            if last_login_date != today_str:
                # Check if missed a day
                if last_login_date:
                    last_date = datetime.strptime(last_login_date, "%Y-%m-%d").date()
                    if (now.date() - last_date).days == 1:
                        streak += 1
                    else:
                        streak = 1 # reset
                else:
                    streak = 1
            
            user_data = {
                "uid": uid,
                "email": email,
                "name": name,
                "picture": picture,
                "last_login_date": today_str,
                "streak": streak
            }
            await users_collection.update_one({"uid": uid}, {"$set": user_data})
        else:
            user_data = {
                "uid": uid,
                "email": email,
                "name": name,
                "picture": picture,
                "last_login_date": today_str,
                "streak": 1,
                "stats": {
                    "calories": 0, "protein": 0, "carbs": 0, "fat": 0, "last_updated": today_str
                }
            }
            await users_collection.insert_one(user_data)

        return {"status": "success", "user_id": uid}
    except Exception as e:
        print(f"Token verification error: {e}")
        raise HTTPException(status_code=401, detail="Invalid authentication token")

async def get_current_user_id(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid token")
    token = authorization.split(" ")[1]
    try:
        decoded_token = firebase_auth.verify_id_token(token)
        return decoded_token.get("uid")
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid token")

@app.get("/api/user/stats")
async def get_user_stats(uid: str = Depends(get_current_user_id)):
    user = await users_collection.find_one({"uid": uid})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    now = datetime.now(timezone.utc)
    today_str = now.strftime("%Y-%m-%d")
    
    stats = user.get("stats", {})
    if stats.get("last_updated") != today_str:
        stats = {"calories": 0, "protein": 0, "carbs": 0, "fat": 0, "last_updated": today_str}
        await users_collection.update_one({"uid": uid}, {"$set": {"stats": stats}})
        
    return {
        "streak": user.get("streak", 0),
        "stats": stats
    }

async def try_ollama_estimate_macros(prompt: str) -> Optional[dict]:
    try:
        async with httpx.AsyncClient(timeout=30.0) as http_client:
            tags_resp = await http_client.get("http://localhost:11434/api/tags")
            if tags_resp.status_code == 200:
                installed_models = [m.get("name") for m in tags_resp.json().get("models", [])]
            else: return None
            if not installed_models: return None
            selected_model = next((m for m in installed_models if any(kw in m for kw in ["llama3", "mistral", "gemma"])), installed_models[0])
            payload = {"model": selected_model, "messages": [{"role": "user", "content": prompt}], "stream": False, "options": {"temperature": 0.1}}
            resp = await http_client.post("http://localhost:11434/api/chat", json=payload)
            if resp.status_code == 200:
                return clean_json_response(resp.json().get("message", {}).get("content", ""))
    except Exception as e:
        print(f"Ollama macro estimation failed: {e}")
    return None

async def try_nvidia_estimate_macros(prompt: str) -> Optional[dict]:
    nvidia_key = os.getenv("NVIDIA_API_KEY")
    if not nvidia_key: return None
    try:
        async with httpx.AsyncClient(timeout=30.0) as http_client:
            headers = {"Authorization": f"Bearer {nvidia_key}", "Content-Type": "application/json"}
            payload = {"model": "meta/llama-3.1-8b-instruct", "messages": [{"role": "user", "content": prompt}], "temperature": 0.1}
            resp = await http_client.post("https://integrate.api.nvidia.com/v1/chat/completions", headers=headers, json=payload)
            if resp.status_code == 200:
                content = resp.json().get("choices", [{}])[0].get("message", {}).get("content", "")
                return clean_json_response(content)
    except Exception as e:
        print(f"NVIDIA macro estimation failed: {e}")
    return None

async def try_gemini_estimate_macros(prompt: str) -> Optional[dict]:
    try:
        loop = asyncio.get_event_loop()
        def call_gemini():
            return client.models.generate_content(model=MODEL_NAME, contents=prompt)
        response = await loop.run_in_executor(None, call_gemini)
        return clean_json_response(response.text)
    except Exception as e:
        print(f"Gemini macro estimation failed: {e}")
    return None

@app.post("/api/user/log_meal")
async def log_meal(request: dict, uid: str = Depends(get_current_user_id)):
    food_name = request.get("name", "Unknown Food")
    ingredients = request.get("ingredients", [])
    
    prompt = f"Estimate the nutritional macros for 1 serving of '{food_name}' containing these ingredients: {ingredients}. Return ONLY a JSON object with integer values for: calories, protein, carbs, fat. No markdown."
    
    macros = None
    try:
        macros = await try_ollama_estimate_macros(prompt)
        if not macros: macros = await try_nvidia_estimate_macros(prompt)
        if not macros: macros = await try_gemini_estimate_macros(prompt)
    except Exception as e:
        print(f"Macro estimation failed: {e}")
        
    if not macros or "calories" not in macros:
        # Fallback generic mock if AI fails entirely
        macros = {"calories": 250, "protein": 10, "carbs": 30, "fat": 10}
        
    user = await users_collection.find_one({"uid": uid})
    if not user: raise HTTPException(status_code=404, detail="User not found")
    
    now = datetime.now(timezone.utc)
    today_str = now.strftime("%Y-%m-%d")
    
    stats = user.get("stats", {})
    if stats.get("last_updated") != today_str:
        stats = {"calories": 0, "protein": 0, "carbs": 0, "fat": 0, "last_updated": today_str}
        
    stats["calories"] += int(macros.get("calories", 0))
    stats["protein"] += int(macros.get("protein", 0))
    stats["carbs"] += int(macros.get("carbs", 0))
    stats["fat"] += int(macros.get("fat", 0))
    stats["last_updated"] = today_str
    
    await users_collection.update_one({"uid": uid}, {"$set": {"stats": stats}})
    return {"status": "success", "added_macros": macros, "new_stats": stats}

@app.post("/api/scan")
async def scan_ingredients(request: dict):
    image_data = request.get("image")
    if not image_data: 
        raise HTTPException(status_code=400, detail="No image data")
    
    if "," in image_data: 
        image_data = image_data.split(",")[1]
    
    prompt = (
        "Analyze this image. First, determine if it clearly contains a food item, food packaging, or an ingredients list. "
        "If it DOES NOT contain any of those (e.g., it is a person, random object, dark room, etc.), you MUST return EXACTLY this JSON: "
        '{"has_ingredients": false, "error_message": "Ingredients list not Detected, Scan Again."}. '
        "If it DOES contain food/ingredients, analyze it and return ONLY a JSON object with: "
        "{name, safety_score, ingredients: [{name, safety, description}], warnings}. No markdown."
    )    
    errors = []
    
    # 1. Try Ollama (Primary)
    try:
        result = await try_ollama_scan(image_data, prompt)
        if result:
            print("Successfully processed using Local Ollama model.")
            return result
    except Exception as e:
        print(f"Ollama fallback failed: {e}")
        errors.append(f"Ollama: {str(e)}")

    # 2. Try NVIDIA (Secondary)
    try:
        result = await try_nvidia_scan(image_data, prompt)
        if result:
            print("Successfully processed using NVIDIA API.")
            return result
    except Exception as e:
        print(f"NVIDIA fallback failed: {e}")
        errors.append(f"NVIDIA: {str(e)}")

    # 3. Try Gemini (Tertiary)
    try:
        result = await try_gemini_scan(image_data, prompt)
        if result:
            print("Successfully processed using Gemini API.")
            return result
    except Exception as e:
        err_msg = str(e)
        print(f"Gemini API scan failed: {err_msg}")
        errors.append(f"Gemini: {err_msg}")
        
    # If all options failed, determine error type and raise appropriate code
    is_gemini_429 = any("429" in err or "ResourceExhausted" in err for err in errors)
    if is_gemini_429:
        raise HTTPException(
            status_code=429,
            detail="Gemini API rate limit exceeded, and local Ollama or NVIDIA fallbacks were not available/configured."
        )
        
    raise HTTPException(
        status_code=500,
        detail=f"All analysis methods failed. Errors: {'; '.join(errors)}"
    )

@app.get("/")
def root():
    return {"status": "online"}