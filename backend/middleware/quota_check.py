"""
Quota Check Middleware — Z-SeHealth
Enforces monthly scan limits per subscription tier.
Also handles the Option-B monthly reset: resets scan counter when reset_date < today.
"""
from fastapi import HTTPException
from datetime import datetime, timezone, date as date_type
from calendar import monthrange

# Tier scan limits
TIER_SCAN_LIMITS = {
    "free": 20,
    "starter": 80,
    "pro": 200,
    "elite": 500,
}


def get_next_reset_date() -> str:
    """Returns the 1st day of next month as YYYY-MM-DD string."""
    today = datetime.now(timezone.utc)
    if today.month == 12:
        next_month = date_type(today.year + 1, 1, 1)
    else:
        next_month = date_type(today.year, today.month + 1, 1)
    return next_month.strftime("%Y-%m-%d")


async def check_scan_quota(uid: str, users_collection) -> None:
    """
    Checks if the user has remaining scan quota.
    - Resets monthly counter if reset_date has passed (Option B strategy).
    - Increments scans_used_this_month on success.
    - Raises HTTP 429 if quota exceeded.
    """
    user = await users_collection.find_one({"uid": uid})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    tier = user.get("tier", "free")
    limit = TIER_SCAN_LIMITS.get(tier, 20)

    usage = user.get("usage", {})
    scans_used = usage.get("scans_used_this_month", 0)
    reset_date_str = usage.get("reset_date", "")

    today_str = datetime.now(timezone.utc).strftime("%Y-%m-%d")

    # Option B: Reset counter if reset_date has passed
    if reset_date_str and reset_date_str <= today_str:
        scans_used = 0
        new_reset_date = get_next_reset_date()
        await users_collection.update_one(
            {"uid": uid},
            {"$set": {
                "usage.scans_used_this_month": 0,
                "usage.reset_date": new_reset_date,
                "usage.scan_limit": limit,
            }}
        )

    # Check limit
    if scans_used >= limit:
        raise HTTPException(
            status_code=429,
            detail=f"Monthly scan quota exceeded ({scans_used}/{limit}). Upgrade your plan to continue scanning."
        )

    # Increment usage counter
    await users_collection.update_one(
        {"uid": uid},
        {"$inc": {"usage.scans_used_this_month": 1}}
    )


async def get_user_quota_status(uid: str, users_collection) -> dict:
    """
    Returns current quota status for a user without consuming a scan.
    Used by /api/subscription/status endpoint.
    """
    user = await users_collection.find_one({"uid": uid})
    if not user:
        return {"scans_used": 0, "scan_limit": 20, "tier": "free"}

    tier = user.get("tier", "free")
    limit = TIER_SCAN_LIMITS.get(tier, 20)
    usage = user.get("usage", {})
    scans_used = usage.get("scans_used_this_month", 0)
    reset_date = usage.get("reset_date", get_next_reset_date())

    # Option B: Also reset here if needed
    today_str = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    if reset_date and reset_date <= today_str:
        scans_used = 0
        new_reset_date = get_next_reset_date()
        await users_collection.update_one(
            {"uid": uid},
            {"$set": {
                "usage.scans_used_this_month": 0,
                "usage.reset_date": new_reset_date,
                "usage.scan_limit": limit,
            }}
        )
        reset_date = new_reset_date

    return {
        "scans_used": scans_used,
        "scan_limit": limit,
        "tier": tier,
        "reset_date": reset_date,
    }
