from fastapi import APIRouter, Depends, Query, Request, Body
from app.services.user_service import UserService
from app.security.dependencies import get_current_user, get_current_user_optional

router = APIRouter(prefix="/user", tags=["User Profile & Settings"])

@router.get("/profile")
@router.get("/me")
async def get_profile(
    userId: str | None = Query(None),
    current_user: dict | None = Depends(get_current_user_optional)
):
    uid = str(current_user["id"]) if current_user else (userId or "usr_active")
    return await UserService.get_profile(uid)

@router.post("/profile")
@router.put("/profile")
async def update_profile(
    body: dict = Body(...),
    current_user: dict | None = Depends(get_current_user_optional)
):
    uid = str(current_user["id"]) if current_user else (body.get("userId") or "usr_active")
    return await UserService.update_profile(uid, body)

@router.post("/avatar")
async def update_avatar(
    body: dict = Body(...),
    current_user: dict | None = Depends(get_current_user_optional)
):
    uid = str(current_user["id"]) if current_user else (body.get("userId") or "usr_active")
    avatar = body.get("avatar", "")
    return await UserService.update_avatar(uid, avatar)

@router.get("/settings")
async def get_settings(
    userId: str | None = Query(None),
    current_user: dict | None = Depends(get_current_user_optional)
):
    uid = str(current_user["id"]) if current_user else (userId or "usr_active")
    return await UserService.get_settings(uid)

@router.post("/settings")
async def update_settings(
    body: dict = Body(...),
    current_user: dict | None = Depends(get_current_user_optional)
):
    uid = str(current_user["id"]) if current_user else (body.get("userId") or "usr_active")
    return await UserService.update_settings(uid, body)

@router.get("/farm-profile")
async def get_farm_profile(
    userId: str | None = Query(None),
    current_user: dict | None = Depends(get_current_user_optional)
):
    uid = str(current_user["id"]) if current_user else (userId or "usr_active")
    return await UserService.get_farm_profile(uid)

@router.post("/farm-profile")
async def update_farm_profile(
    body: dict = Body(...),
    current_user: dict | None = Depends(get_current_user_optional)
):
    uid = str(current_user["id"]) if current_user else (body.get("userId") or "usr_active")
    return await UserService.update_farm_profile(uid, body)

@router.post("/security/password")
async def update_password(
    body: dict = Body(...),
    current_user: dict | None = Depends(get_current_user_optional)
):
    uid = str(current_user["id"]) if current_user else (body.get("userId") or "usr_active")
    current_pw = body.get("currentPassword", "")
    new_pw = body.get("newPassword", "")
    return await UserService.update_password(uid, current_pw, new_pw)

@router.post("/security/2fa")
async def set_two_factor(
    body: dict = Body(...),
    current_user: dict | None = Depends(get_current_user_optional)
):
    uid = str(current_user["id"]) if current_user else (body.get("userId") or "usr_active")
    enabled = bool(body.get("enabled", False))
    return await UserService.set_two_factor(uid, enabled)

@router.get("/sessions")
async def get_sessions(
    userId: str | None = Query(None),
    current_user: dict | None = Depends(get_current_user_optional)
):
    uid = str(current_user["id"]) if current_user else (userId or "usr_active")
    return await UserService.get_sessions(uid)

@router.delete("/sessions/{session_id}")
async def delete_session(
    session_id: str,
    current_user: dict | None = Depends(get_current_user_optional)
):
    uid = str(current_user["id"]) if current_user else "usr_active"
    return await UserService.delete_session(uid, session_id)

@router.get("/audit-logs")
async def get_audit_logs(
    userId: str | None = Query(None),
    limit: int = Query(50),
    current_user: dict | None = Depends(get_current_user_optional)
):
    uid = str(current_user["id"]) if current_user else (userId or "usr_active")
    return await UserService.get_audit_logs(uid, limit)

@router.delete("/account")
@router.delete("/delete")
async def delete_account(
    userId: str | None = Query(None),
    body: dict | None = Body(None),
    current_user: dict | None = Depends(get_current_user_optional)
):
    uid = str(current_user["id"]) if current_user else (userId or (body.get("userId") if body else None) or "usr_active")
    return await UserService.delete_account(uid)
