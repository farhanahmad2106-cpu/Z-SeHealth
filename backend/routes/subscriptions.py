"""
Subscription Routes — Z-SeHealth
Handles all subscription management: plan listing, create, cancel, and status.
"""
import os
import hashlib
import hmac
from fastapi import APIRouter, Depends, HTTPException, Header
from typing import Optional
from datetime import datetime, timezone
import httpx

# Razorpay credentials from .env
RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID", "")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET", "")

RAZORPAY_PLAN_IDS = {
    "starter": os.getenv("RAZORPAY_PLAN_ID_STARTER", ""),
    "pro":     os.getenv("RAZORPAY_PLAN_ID_PRO", ""),
    "elite":   os.getenv("RAZORPAY_PLAN_ID_ELITE", ""),
}

# Tier feature matrix (shown on PricingPage and /api/subscription/plans)
PLANS = [
    {
        "id": "free",
        "name": "Z-Free",
        "price": 0,
        "currency": "INR",
        "scan_limit": 20,
        "ai_model": "NVIDIA + Gemini Flash",
        "accuracy": "Basic",
        "translation_languages": 5,
        "features": {
            "food_search": True,
            "meal_logging": True,
            "daily_stats": True,
            "multi_meal_batch": True,
            "dietary_filters": False,
            "smart_meal_planning": False,
            "advanced_analytics": False,
            "barcode_scanner": False,
            "priority_ai": False,
            "voice_input": False,
            "premium_badge": False,
            "email_support": False,
            "priority_support": False,
        },
        "razorpay_plan_id": None,
    },
    {
        "id": "starter",
        "name": "Z-Starter",
        "price": 36600,  # in paise (₹366)
        "currency": "INR",
        "scan_limit": 80,
        "ai_model": "NVIDIA LLaMA + Gemini",
        "accuracy": "Better",
        "translation_languages": 15,
        "features": {
            "food_search": True,
            "meal_logging": True,
            "daily_stats": True,
            "multi_meal_batch": True,
            "dietary_filters": True,
            "smart_meal_planning": False,
            "advanced_analytics": False,
            "barcode_scanner": False,
            "priority_ai": False,
            "voice_input": False,
            "premium_badge": True,
            "email_support": True,
            "priority_support": False,
        },
        "razorpay_plan_id": RAZORPAY_PLAN_IDS["starter"],
    },
    {
        "id": "pro",
        "name": "Z-Pro",
        "price": 73200,  # in paise (₹732)
        "currency": "INR",
        "scan_limit": 200,
        "ai_model": "NVIDIA Advanced + Gemini Pro",
        "accuracy": "High",
        "translation_languages": 30,
        "features": {
            "food_search": True,
            "meal_logging": True,
            "daily_stats": True,
            "multi_meal_batch": True,
            "dietary_filters": True,
            "smart_meal_planning": True,
            "advanced_analytics": True,
            "barcode_scanner": True,
            "priority_ai": False,
            "voice_input": False,
            "premium_badge": True,
            "email_support": True,
            "priority_support": False,
        },
        "razorpay_plan_id": RAZORPAY_PLAN_IDS["pro"],
    },
    {
        "id": "elite",
        "name": "Z-Elite",
        "price": 99800,  # in paise (₹998)
        "currency": "INR",
        "scan_limit": 500,
        "ai_model": "Sarvam AI + NVIDIA",
        "accuracy": "Highest (Indian DB)",
        "translation_languages": 50,
        "features": {
            "food_search": True,
            "meal_logging": True,
            "daily_stats": True,
            "multi_meal_batch": True,
            "dietary_filters": True,
            "smart_meal_planning": True,
            "advanced_analytics": True,
            "barcode_scanner": True,
            "priority_ai": True,
            "voice_input": True,
            "premium_badge": True,
            "email_support": True,
            "priority_support": True,
        },
        "razorpay_plan_id": RAZORPAY_PLAN_IDS["elite"],
    },
]

TIER_LIMITS = {p["id"]: p["scan_limit"] for p in PLANS}

router = APIRouter(prefix="/api/subscription", tags=["Subscription"])


def _get_users_collection():
    """Lazy import to avoid circular dependency with main.py."""
    import sys
    main_module = sys.modules.get("main") or sys.modules.get("__main__")
    if main_module and hasattr(main_module, "users_collection"):
        return main_module.users_collection
    raise RuntimeError("users_collection not available")


async def _get_current_user_id(authorization: str = Header(None)) -> str:
    from firebase_admin import auth as firebase_auth
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid token")
    token = authorization.split(" ")[1]
    try:
        decoded_token = firebase_auth.verify_id_token(token)
        return decoded_token.get("uid")
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")


@router.get("/plans")
async def list_plans():
    """Returns all subscription plans with features and pricing."""
    return {"plans": PLANS}


@router.get("/status")
async def get_subscription_status(uid: str = Depends(_get_current_user_id)):
    """Returns the user's current tier, scans used, scan limit, and subscription details."""
    users_collection = _get_users_collection()
    user = await users_collection.find_one({"uid": uid})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    tier = user.get("tier", "free")
    usage = user.get("usage", {})
    subscription = user.get("subscription", {})

    from middleware.quota_check import get_user_quota_status
    quota = await get_user_quota_status(uid, users_collection)

    return {
        "tier": tier,
        "scans_used": quota["scans_used"],
        "scan_limit": quota["scan_limit"],
        "reset_date": quota["reset_date"],
        "subscription": {
            "plan": subscription.get("plan", "free"),
            "status": subscription.get("status", "active"),
            "start_date": subscription.get("start_date"),
            "end_date": subscription.get("end_date"),
            "auto_renew": subscription.get("auto_renew", False),
            "razorpay_subscription_id": subscription.get("razorpay_subscription_id"),
        }
    }


@router.post("/create")
async def create_subscription(request: dict, uid: str = Depends(_get_current_user_id)):
    """
    Creates a Razorpay subscription for the requested plan.
    Returns the subscription_id for the frontend to open Razorpay Checkout.
    """
    plan_id = request.get("plan_id")  # e.g., "starter", "pro", "elite"

    if plan_id not in ["starter", "pro", "elite"]:
        raise HTTPException(status_code=400, detail="Invalid plan. Must be: starter, pro, or elite")

    razorpay_plan_id = RAZORPAY_PLAN_IDS.get(plan_id)
    if not razorpay_plan_id:
        raise HTTPException(
            status_code=503,
            detail="Razorpay plan not configured. Please add RAZORPAY_PLAN_ID_* to your .env and try again."
        )

    if not RAZORPAY_KEY_ID or not RAZORPAY_KEY_SECRET:
        raise HTTPException(
            status_code=503,
            detail="Payment gateway not configured. Please contact support."
        )

    try:
        async with httpx.AsyncClient(timeout=30.0) as http_client:
            resp = await http_client.post(
                "https://api.razorpay.com/v1/subscriptions",
                auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET),
                json={
                    "plan_id": razorpay_plan_id,
                    "total_count": 12,  # 12-month subscription
                    "quantity": 1,
                    "customer_notify": 1,
                },
            )
            if resp.status_code not in (200, 201):
                raise HTTPException(status_code=502, detail=f"Razorpay error: {resp.text}")

            subscription_data = resp.json()
            subscription_id = subscription_data.get("id")

            # Store pending subscription in MongoDB
            users_collection = _get_users_collection()
            await users_collection.update_one(
                {"uid": uid},
                {"$set": {
                    "subscription.razorpay_subscription_id": subscription_id,
                    "subscription.plan": plan_id,
                    "subscription.status": "pending",
                }}
            )

            return {
                "subscription_id": subscription_id,
                "plan": plan_id,
                "razorpay_key_id": RAZORPAY_KEY_ID,
            }

    except HTTPException:
        raise
    except Exception as e:
        print(f"Subscription creation error: {e}")
        raise HTTPException(status_code=500, detail="Failed to create subscription. Please try again.")


@router.post("/cancel")
async def cancel_subscription(uid: str = Depends(_get_current_user_id)):
    """
    Cancels the user's active Razorpay subscription.
    Sets status to 'cancelled' but keeps premium access until end_date (grace period).
    """
    users_collection = _get_users_collection()
    user = await users_collection.find_one({"uid": uid})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    subscription = user.get("subscription", {})
    sub_id = subscription.get("razorpay_subscription_id")

    if not sub_id:
        raise HTTPException(status_code=400, detail="No active subscription to cancel")

    if not RAZORPAY_KEY_ID or not RAZORPAY_KEY_SECRET:
        raise HTTPException(status_code=503, detail="Payment gateway not configured")

    try:
        async with httpx.AsyncClient(timeout=30.0) as http_client:
            resp = await http_client.post(
                f"https://api.razorpay.com/v1/subscriptions/{sub_id}/cancel",
                auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET),
                json={"cancel_at_cycle_end": 1},  # Cancel at end of billing period
            )

            if resp.status_code not in (200, 201):
                raise HTTPException(status_code=502, detail=f"Razorpay cancel error: {resp.text}")

        # Mark as cancellation requested — tier stays until Webhook fires
        await users_collection.update_one(
            {"uid": uid},
            {"$set": {"subscription.status": "cancellation_requested"}}
        )

        return {"status": "success", "message": "Subscription will be cancelled at the end of the billing period. You retain premium access until then."}

    except HTTPException:
        raise
    except Exception as e:
        print(f"Subscription cancel error: {e}")
        raise HTTPException(status_code=500, detail="Failed to cancel subscription. Please try again.")
