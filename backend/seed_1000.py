import os
import random
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

# Load the variables from .env
load_dotenv()
MONGODB_URI = os.getenv("MONGODB_URI")

# --- DATA POOLS ---
HEALTHY_INGREDIENTS = [
    {"name": "Whole Wheat Flour (Atta)", "safety": "Safe", "description": "Fiber-rich whole grain providing complex carbohydrates."},
    {"name": "Fresh Cottage Cheese (Paneer)", "safety": "Safe", "description": "High-quality dairy protein and calcium source."},
    {"name": "Green Tea Extract", "safety": "Safe", "description": "Rich in organic catechins and antioxidants."},
    {"name": "Split Yellow Moong Dal", "safety": "Safe", "description": "Easy-to-digest plant protein packed with dietary fiber."},
    {"name": "Almonds", "safety": "Safe", "description": "Nutrient-dense nut supplying heart-healthy monounsaturated fats."},
    {"name": "Spinach Leaves", "safety": "Safe", "description": "Iron and Vitamin K-dense dark leafy green vegetable."},
    {"name": "Turmeric (Haldi)", "safety": "Safe", "description": "Active curcumin compound carrying strong anti-inflammatory profiles."},
    {"name": "Ginger Extract", "safety": "Safe", "description": "Natural root spice known to aid digestion."},
    {"name": "Raw Coconut Water", "safety": "Safe", "description": "Pure hydrating liquid loaded with natural potassium."},
    {"name": "Ragi (Finger Millet)", "safety": "Safe", "description": "Gluten-free ancient grain rich in calcium."}
]

MODERATE_INGREDIENTS = [
    {"name": "Refined Wheat Flour (Maida)", "safety": "Moderate", "description": "Processed starchy flour stripped of natural grain fiber."},
    {"name": "Sugar Crystalline", "safety": "Moderate", "description": "Refined sweetening agent; elevates blood glucose rapidly."},
    {"name": "Common Salt", "safety": "Safe", "description": "Essential dietary sodium mineral used for flavor preservation."},
    {"name": "Yeast", "safety": "Safe", "description": "Natural leavening agent used for fermenting dough textures."},
    {"name": "Acidity Regulator (INS 330)", "safety": "Safe", "description": "Citric acid used to balance tangy flavor profiles."}
]

UNHEALTHY_INGREDIENTS = [
    {"name": "Refined Palm Oil", "safety": "Unhealthy", "description": "Highly refined vegetable fat with high saturated fatty acids."},
    {"name": "Monosodium Glutamate (MSG)", "safety": "Moderate", "description": "Chemical flavor enhancer that can trigger sensitivities."},
    {"name": "Sodium Benzoate (INS 211)", "safety": "Moderate", "description": "Synthetic chemical preservative."},
    {"name": "Aspartame", "safety": "Unhealthy", "description": "Intense artificial sweetener linked to metabolic disruptions."},
    {"name": "Artificial Vanilla Flavoring", "safety": "Moderate", "description": "Synthesized chemical compounds designed to mimic real vanilla."},
    {"name": "Synthetic Color (INS 150d)", "safety": "Moderate", "description": "Sulfite ammonia caramel coloring; highly processed visual additive."},
    {"name": "Emulsifier (INS 452)", "safety": "Moderate", "description": "Polyphosphates used to chemically stabilize water-fat binding."}
]

BRANDS = ["Amul", "Britannia", "Tata Sampann", "Aashirvaad", "Haldiram's", "Mother Dairy", "Saffola", "MTR", "Organic Tattva", "Lay's"]

FOOD_TYPES = [
    {"base_name": "Paneer", "category": "Dairy", "base_score": 95, "status": "Safe"},
    {"base_name": "Potato Chips", "category": "Snacks", "base_score": 42, "status": "Unhealthy"},
    {"base_name": "Ghee", "category": "Dairy", "base_score": 88, "status": "Safe"},
    {"base_name": "Atta", "category": "Staples", "base_score": 96, "status": "Safe"},
    {"base_name": "Biscuits", "category": "Snacks", "base_score": 52, "status": "Unhealthy"},
    {"base_name": "Moong Dal", "category": "Staples", "base_score": 94, "status": "Safe"},
    {"base_name": "Masala Oats", "category": "Breakfast", "base_score": 78, "status": "Safe"},
    {"base_name": "Roti", "category": "Staples", "base_score": 98, "status": "Safe"},
    {"base_name": "Ketchup", "category": "Condiments", "base_score": 45, "status": "Unhealthy"},
    {"base_name": "Butter", "category": "Dairy", "base_score": 75, "status": "Safe"},
    {"base_name": "Instant Noodles", "category": "Snacks", "base_score": 35, "status": "Unhealthy"},
    {"base_name": "Diet Soda", "category": "Beverages", "base_score": 40, "status": "Unhealthy"},
    {"base_name": "Makhana", "category": "Snacks", "base_score": 94, "status": "Safe"}
]

FLAVORS_VARIETIES = [
    "Classic", "Spicy", "Masala", "Pudina", "Salted", "Premium", "Organic", "Roasted", "Baked", 
    "Tangy", "Tomato", "Chili", "Sweet", "Garlic", "Ginger", "Pepper", "Diet", "Lite", "Gold"
]

# --- MAIN GENERATION FUNCTION ---
async def generate_1000_items():
    client = AsyncIOMotorClient(MONGODB_URI)
    db = client["Z-sehealth"] # Ensure this matches your Atlas DB name exactly
    collection = db["foods"]

    # Clear existing data to start fresh
    print("Clearing old data...")
    await collection.delete_many({})
    
    food_batch = []
    generated_names = set()
    total_needed = 1000
    batch_size = 50

    print(f"Generating {total_needed} items in batches of {batch_size}...")

    while len(generated_names) < total_needed:
        food_type = random.choice(FOOD_TYPES)
        flavor = random.choice(FLAVORS_VARIETIES)
        brand = random.choice(BRANDS)

        # High-range random suffix to avoid the "stuck loop" name conflict
        num_suffix = f" {random.randint(1, 10000)}" 
        unique_name = f"{flavor} {food_type['base_name']}{num_suffix}"

        if unique_name in generated_names:
            continue
        
        generated_names.add(unique_name)

        # Logic for score and status
        score = food_type["base_score"] + random.randint(-6, 4)
        score = max(min(score, 100), 12)

        ingredients = []
        warnings = []

        if score >= 75:
            ingredients.extend(random.sample(HEALTHY_INGREDIENTS, k=random.randint(2, 3)))
            if score < 85:
                ingredients.append(random.choice(MODERATE_INGREDIENTS))
            status = "Safe"
        else:
            ingredients.append(random.choice(MODERATE_INGREDIENTS))
            ingredients.extend(random.sample(UNHEALTHY_INGREDIENTS, k=random.randint(2, 3)))
            status = "Unhealthy"

            # Auto-generate warnings based on ingredients
            if any(ing["name"] in ["Refined Palm Oil", "Emulsifier (INS 452)"] for ing in ingredients):
                warnings.append("CONTAINS HIGH SATURATED INDUSTRIAL FATS")
            if any(ing["name"] in ["Monosodium Glutamate (MSG)"] for ing in ingredients):
                warnings.append("CONTAINS ARTIFICIAL FLAVOR ENHANCERS (MSG)")
            if score < 45:
                warnings.append("ULTRA-PROCESSED DIET PRODUCT")

        # Add to the current batch
        food_batch.append({
            "name": unique_name,
            "brand": brand,
            "safety_score": score,
            "status": status,
            "ingredients": ingredients,
            "warnings": warnings
        })

        # --- SAVE TO ATLAS EVERY 50 ITEMS ---
        if len(food_batch) == batch_size:
            await collection.insert_many(food_batch)
            print(f"✅ Successfully inserted {batch_size} items. Total progress: {len(generated_names)}/1000")
            food_batch = [] # Reset batch list

    print("\n🎉 DONE! Your database is now populated with 1,000 items.")
    client.close()

if __name__ == "__main__":
    asyncio.run(generate_1000_items())