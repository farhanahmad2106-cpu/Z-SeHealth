# Z-SeHealth Project Features

This document outlines the features currently implemented in the Z-SeHealth application, as well as exciting ideas for future development.

## Core Features (Previously Built)
* **Authentication & Authorization:** Secure user login and registration system.
* **Dashboard UI:** A sleek, modern dashboard displaying daily health statistics and recent logs.
* **Food Scanning & AI Analysis:** Upload photos of food/ingredients to be analyzed by advanced AI vision models (Ollama & NVIDIA) to identify the item.
* **Text & Manual Search:** Ability to manually search for foods if a photo isn't available or if the AI needs a hint.
* **Ingredient Translation:** Automatic translation of food items and ingredients to the user's preferred language using AI.
* **Macro Estimation:** Intelligent estimation of calories, protein, carbs, and fats based on the scanned or searched food.
* **Meal Logging:** Save analyzed foods directly to the user's daily meal log.

## Features Built Today
* **User Profile Menu:** A dedicated, stylish profile dropdown menu for managing user settings and account details.
* **Dashboard Quick Scan (Camera Integration):** A live camera container built directly into the Dashboard. Users can click to capture a photo of ingredients and are seamlessly redirected to the Scan page with the image ready for analysis.
* **Robust API Fallback Pipeline:** A highly resilient backend AI chain. If the local Ollama instance fails or is turned off, the system automatically fails over to the NVIDIA API.
* **Multiple NVIDIA API Key Support:** The backend now supports 5+ NVIDIA API keys (e.g., `NVIDIA_API_KEY_1`, `NVIDIA_API_KEY_2`). If one key hits a rate limit, the system gracefully shifts to the next key before finally resorting to the Gemini API as a last resort.
* **Configurable AI Models:** Vision and text models are now fully configurable via `.env` variables (`NVIDIA_VISION_MODEL` and `NVIDIA_TEXT_MODEL`), allowing for instant upgrades when new models (like Llama 3.2 Vision) are released.

## Future Feature Ideas (Coming Next)
* **Smart Meal Planning:** Generate weekly meal plans and automated grocery lists based on the foods you frequently scan.
* **Dietary Restriction Filters:** Automatically flag scanned ingredients if they conflict with user-set diets (e.g., Keto, Vegan, Gluten-Free, Halal).
* **Advanced Analytics & Charts:** Visual graphs showing macro trends over weeks or months to better track progress.
* **Wearable Integration:** Sync calorie and macro data with Google Fit or Apple Health.
* **Barcode Scanner Mode:** In addition to AI image recognition, add a traditional barcode scanner for packaged foods using an open food database.
* **Community Challenges:** Social features allowing users to share their healthy meals or participate in health challenges together.
