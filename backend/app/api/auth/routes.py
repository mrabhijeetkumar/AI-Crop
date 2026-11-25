from fastapi import APIRouter, Depends, Query, Request, HTTPException, status
from time import monotonic
from app.schemas.auth_schema import LoginRequest, RegisterRequest, TokenSchema, ChangePasswordRequest
from app.services.auth_service import AuthService
from app.security.dependencies import get_current_user, get_current_user_optional

router = APIRouter(prefix="/auth", tags=["Authentication"])
_attempt_window: dict[str, list[float]] = {}

def _check_rate_limit(request: Request, bucket: str) -> None:
    key = f"{bucket}:{request.client.host if request.client else 'unknown'}"
    now = monotonic()
    recent = [timestamp for timestamp in _attempt_window.get(key, []) if now - timestamp < 300]
    if len(recent) >= 10:
        raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail="Too many authentication attempts. Try again later.")
    recent.append(now)
    _attempt_window[key] = recent

@router.post("/login")
async def login(req: LoginRequest, request: Request):
    _check_rate_limit(request, "login")
    return await AuthService.login(req)

@router.post("/register")
async def register(req: RegisterRequest, request: Request):
    _check_rate_limit(request, "register")
    return await AuthService.register(req)

@router.post("/signup")
async def signup(req: RegisterRequest, request: Request):
    _check_rate_limit(request, "register")
    return await AuthService.register(req)

@router.post("/logout")
async def logout():
    return {"success": True, "message": "Logged out successfully."}

@router.get("/me")
async def get_me(
    userId: str | None = Query(None),
    current_user: dict | None = Depends(get_current_user_optional)
):
    # Extract authentic identity from token if available, fallback to query for seamless transition
    uid = str(current_user["id"]) if current_user else (userId or "usr_active")
    return await AuthService.get_me(uid)

@router.post("/change-password")
async def change_password(
    req: ChangePasswordRequest,
    current_user: dict = Depends(get_current_user)
):
    return await AuthService.change_password(
        user_id=str(current_user["id"]),
        current_password=req.currentPassword,
        new_password=req.newPassword
    )
