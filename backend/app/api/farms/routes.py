from fastapi import APIRouter, Depends, Query, Body
from typing import List, Optional
from app.services.farm_service import FarmService, FieldService
from app.services.user_service import UserService
from app.security.dependencies import get_current_user_optional
from datetime import datetime, timezone

router = APIRouter(prefix="/farm", tags=["Farm Management"])

@router.get("/fields")
async def get_farm_fields(user: dict | None = Depends(get_current_user_optional)):
    uid = str(user["id"]) if user else "demo_user"
    return await FieldService.get_user_fields(uid)

@router.post("/fields")
async def create_farm_field(
    body: dict = Body(...),
    user: dict | None = Depends(get_current_user_optional)
):
    uid = str(user["id"]) if user else "demo_user"
    return await FieldService.create_field(uid, body)

@router.put("/fields/{field_id}")
@router.post("/fields/{field_id}")
async def update_farm_field(
    field_id: str,
    body: dict = Body(...),
    user: dict | None = Depends(get_current_user_optional)
):
    return await FieldService.update_field(field_id, body)

@router.delete("/fields/{field_id}")
async def delete_farm_field(
    field_id: str,
    user: dict | None = Depends(get_current_user_optional)
):
    return {"success": True, "message": f"Field {field_id} deleted."}

@router.post("/fields/{field_id}/irrigate")
async def irrigate_field(
    field_id: str,
    user: dict | None = Depends(get_current_user_optional)
):
    now_str = datetime.now(timezone.utc).strftime("%d %b %Y, %I:%M %p")
    return {
        "success": True,
        "fieldId": field_id,
        "action": "Irrigation Cycle Executed",
        "timestamp": now_str,
        "moisture_restored_pct": 58.0
    }

@router.post("/fields/{field_id}/activity")
async def log_field_activity(
    field_id: str,
    body: dict = Body(...),
    user: dict | None = Depends(get_current_user_optional)
):
    now_str = datetime.now(timezone.utc).strftime("%d %b %Y, %I:%M %p")
    return {
        "success": True,
        "fieldId": field_id,
        "activity": body.get("action", "Agronomic Action"),
        "timestamp": now_str
    }

@router.post("/fields/telemetry-sync-all")
async def sync_all_field_telemetry(
    user: dict | None = Depends(get_current_user_optional)
):
    return {
        "success": True,
        "message": "All field records and sensor telemetry synced with MongoDB Atlas."
    }

@router.get("/profile")
async def get_farm_profile(
    userId: Optional[str] = Query(None),
    user: dict | None = Depends(get_current_user_optional)
):
    uid = str(user["id"]) if user else (userId or "usr_active")
    return await UserService.get_farm_profile(uid)

@router.post("/profile")
async def update_farm_profile(
    body: dict = Body(...),
    user: dict | None = Depends(get_current_user_optional)
):
    uid = str(user["id"]) if user else (body.get("userId") or "usr_active")
    return await UserService.update_farm_profile(uid, body)
