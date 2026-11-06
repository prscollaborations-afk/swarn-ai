IN_MEMORY_USERS = []
import uuid
import time
from typing import Optional
from pydantic import BaseModel, EmailStr
from fastapi import APIRouter, HTTPException, Depends, Request
from app.core.mongodb import get_db
from app.core.smtp import send_access_granted_email

router = APIRouter(prefix="/auth", tags=["auth"])

BASE_WAITLIST_NUMBER = 3234

class UserRegisterRequest(BaseModel):
    name: str
    email: str
    referral_code: Optional[str] = None
    phone: Optional[str] = None
    shop_name: Optional[str] = None

class AdminLoginRequest(BaseModel):
    email: str
    password: str

class GrantAccessRequest(BaseModel):
    user_id: str
    credits_to_add: int = 5

def get_waitlist_position(created_at: float) -> int:
    # Lifetime continuously increasing mock waitlist: base 3234 + 1 for every 5 minutes since launch
    launch_time = 1762140000.0  # reference epoch
    elapsed_minutes = max(0, int((created_at - launch_time) / 300))
    return BASE_WAITLIST_NUMBER + elapsed_minutes

@router.post("/register")
async def register_user(payload: UserRegisterRequest):
    db = get_db()
    now = time.time()
    
    # Check if user already exists
    existing = db.users.find_one({"email": payload.email.lower()}) if db is not None else None
    if existing:
        return {
            "success": True,
            "data": {
                "user_id": str(existing.get("_id", existing.get("id"))),
                "name": existing["name"],
                "email": existing["email"],
                "status": existing.get("status", "waitlisted"),
                "waitlist_position": existing.get("waitlist_position", BASE_WAITLIST_NUMBER),
                "credits": existing.get("credits", 0),
                "referral_code": existing.get("referral_code", "")
            }
        }
        
    user_id = str(uuid.uuid4())
    waitlist_num = get_waitlist_position(now)
    new_user = {
        "id": user_id,
        "name": payload.name,
        "email": payload.email.lower(),
        "phone": payload.phone or "",
        "shop_name": payload.shop_name or "",
        "referral_used": payload.referral_code or "",
        "referral_code": f"AABH-{user_id[:6].upper()}",
        "status": "waitlisted",  # 'waitlisted' or 'active'
        "waitlist_position": waitlist_num,
        "credits": 0,
        "role": "user",
        "created_at": now
    }
    
    if db is not None:
        db.users.insert_one(new_user)
        
    return {
        "success": True,
        "data": {
            "user_id": user_id,
            "name": new_user["name"],
            "email": new_user["email"],
            "status": "waitlisted",
            "waitlist_position": waitlist_num,
            "credits": 0,
            "referral_code": new_user["referral_code"],
            "message": f"Access for platform is requested! You are #{waitlist_num} in waitlist."
        }
    }

@router.post("/google-oauth")
async def google_oauth_callback(payload: dict):
    # Simulated Google OAuth token exchange
    email = payload.get("email") or "partner@jewellery.in"
    name = payload.get("name") or "Indian Retailer Partner"
    referral = payload.get("referral_code")
    
    return await register_user(UserRegisterRequest(
        name=name,
        email=email,
        referral_code=referral
    ))

@router.post("/admin/login")
async def admin_login(payload: AdminLoginRequest):
    # Secure admin login credentials
    if payload.email.strip().lower() == "admin@aabhushan.ai" and payload.password == "AabhushanAdmin@2026!":
        return {
            "success": True,
            "data": {
                "admin_id": "admin-super-01",
                "email": "admin@aabhushan.ai",
                "role": "super_admin",
                "token": "aabhushan_admin_session_token_xyz987"
            }
        }
    raise HTTPException(status_code=401, detail="Invalid admin credentials")

@router.get("/admin/waitlist")
async def get_waitlist():
    db = get_db()
    users = []
    if db is not None:
        for u in db.users.find().sort("created_at", -1):
            users.append({
                "id": u.get("id", str(u.get("_id"))),
                "name": u.get("name"),
                "email": u.get("email"),
                "shop_name": u.get("shop_name", "Local Jewellers"),
                "status": u.get("status", "waitlisted"),
                "waitlist_position": u.get("waitlist_position", BASE_WAITLIST_NUMBER),
                "credits": u.get("credits", 0),
                "created_at": u.get("created_at")
            })
    return {"success": True, "data": users}

@router.post("/admin/grant-access")
async def grant_user_access(payload: GrantAccessRequest):
    db = get_db()
    if db is not None:
        user = db.users.find_one({"id": payload.user_id})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        new_credits = user.get("credits", 0) + payload.credits_to_add
        db.users.update_one(
            {"id": payload.user_id},
            {"$set": {"status": "active", "credits": new_credits}}
        )
        
        # Trigger SMTP email notification
        send_access_granted_email(
            to_email=user["email"],
            recipient_name=user.get("name", "Retailer"),
            credits_granted=payload.credits_to_add
        )
        
        return {
            "success": True,
            "data": {
                "user_id": payload.user_id,
                "status": "active",
                "credits": new_credits,
                "message": f"Access granted! {payload.credits_to_add} credits added and email dispatched."
            }
        }
    raise HTTPException(status_code=500, detail="Database unavailable")

@router.get("/status/{user_id}")
async def check_user_status(user_id: str):
    db = get_db()
    if db is not None:
        user = db.users.find_one({"id": user_id})
        if user:
            return {
                "success": True,
                "data": {
                    "user_id": user["id"],
                    "name": user["name"],
                    "email": user["email"],
                    "status": user.get("status", "waitlisted"),
                    "credits": user.get("credits", 0),
                    "waitlist_position": user.get("waitlist_position", BASE_WAITLIST_NUMBER),
                    "referral_code": user.get("referral_code", "")
                }
            }
    raise HTTPException(status_code=404, detail="User not found")


class VerificationApplyRequest(BaseModel):
    user_id: str
    full_name: str
    email: str
    phone: str
    business_name: str
    business_type: str = "retailer"
    license_type: str = "gst_dcl"
    license_number: str
    doc_filename: Optional[str] = None
    notes: Optional[str] = None

VERIFICATIONS_DB = []

@router.post("/verification/apply")
async def apply_verification(req: VerificationApplyRequest):
    app_id = f"APP-VERIFY-{uuid.uuid4().hex[:6].upper()}"
    record = {
        "application_id": app_id,
        "user_id": req.user_id,
        "full_name": req.full_name,
        "email": req.email,
        "phone": req.phone,
        "business_name": req.business_name,
        "business_type": req.business_type,
        "license_type": req.license_type,
        "license_number": req.license_number,
        "doc_filename": req.doc_filename,
        "notes": req.notes,
        "status": "under_review",
        "created_at": time.time()
    }
    VERIFICATIONS_DB.append(record)
    
    # Save to MongoDB Atlas if available
    db = get_db()
    if db is not None:
        try:
            await db["verifications"].insert_one(record.copy())
        except Exception:
            pass

    return {
        "success": True,
        "data": {
            "application_id": app_id,
            "status": "under_review",
            "business_name": req.business_name,
            "email": req.email,
            "message": "Document verification application submitted successfully."
        }
    }


class SimpleLoginRequest(BaseModel):
    email: str
    password: Optional[str] = ""

@router.post("/login")
async def simple_user_login(payload: SimpleLoginRequest):
    email = payload.email.lower().strip()
    
    # 1. Admin login fallback
    if email == "admin@aabhushan.ai":
        if payload.password == "AabhushanAdmin@2026!":
            return {
                "success": True,
                "data": {
                    "user_id": "admin_root",
                    "email": email,
                    "role": "superadmin",
                    "status": "active",
                    "credits": 9999,
                    "redirect": "/manage-portal-2026-secure"
                }
            }
        raise HTTPException(status_code=401, detail="Invalid admin password")

    # 2. Check in-memory waitlist DB
    for u in IN_MEMORY_USERS:
        if u.get("email", "").lower() == email:
            return {"success": True, "data": u}
            
    # 3. Check MongoDB
    db = get_db()
    if db is not None:
        try:
            user = await db["waitlist"].find_one({"email": email})
            if user:
                user["_id"] = str(user["_id"])
                return {"success": True, "data": user}
        except Exception:
            pass

    # 4. If not found, create instant active guest account
    guest_user = {
        "user_id": f"usr_{uuid.uuid4().hex[:8]}",
        "name": email.split("@")[0].capitalize(),
        "email": email,
        "status": "active",
        "credits": 5,
        "waitlist_position": 0,
        "created_at": time.time()
    }
    IN_MEMORY_USERS.append(guest_user)
    return {"success": True, "data": guest_user}
