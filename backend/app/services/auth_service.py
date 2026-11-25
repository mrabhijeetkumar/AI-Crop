from datetime import timedelta
from fastapi import HTTPException, status
from app.repositories.user_repository import UserRepository
from app.repositories.farm_repository import FarmRepository
from app.security.password import verify_password, get_password_hash
from app.security.jwt import create_access_token
from app.schemas.auth_schema import LoginRequest, RegisterRequest, ChangePasswordRequest
from pymongo.errors import DuplicateKeyError
from app.config.settings import settings

DEFAULT_SETTINGS = {
    "theme": "dark",
    "language": "en",
    "voiceSpeed": 1.0,
    "voicePitch": 1.0,
    "offlineSync": True,
    "autoSave": True,
    "highContrast": False,
    "compactView": False,
    "weatherAlerts": True,
    "priceAlerts": True,
    "diseaseAlerts": True,
    "twoFactorAuth": False,
    "currency": "INR",
    "areaUnit": "Acres",
}

class AuthService:
    @staticmethod
    def _role_value(role: str) -> str:
        role_map = {
            "Farmer": "farmer",
            "Farm Manager": "farm_manager",
            "Agronomist / Agriculture Expert": "agronomist",
            "Agri Business Owner": "agri_business_owner",
            "Other": "other",
        }
        return role_map.get(role, "farmer")

    @staticmethod
    async def login(credentials: LoginRequest) -> dict:
        user = await UserRepository.find_by_email(credentials.email)
        if not user or not verify_password(credentials.password, user.get("hashed_password", "")):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
            
        token_data = {
            "sub": str(user["id"]),
            "email": user["email"],
            "name": user.get("full_name") or user.get("name", "Farmer"),
            "role": user.get("role", "farmer")
        }
        token = create_access_token(token_data)
        user_resp = {
            "id": str(user["id"]),
            "name": user.get("full_name") or user.get("name", "Farmer"),
            "full_name": user.get("full_name") or user.get("name", "Farmer"),
            "email": user["email"],
            "phone": user.get("phone", ""),
            "role": user.get("role", "farmer"),
            "location": user.get("location", ""),
            "farm_name": user.get("farm_name", ""),
            "avatar": user.get("avatar", ""),
        }
        farm = await FarmRepository.get_by_user(str(user["id"]))
        farm_profile = farm or {}
        settings = user.get("settings", DEFAULT_SETTINGS)
        
        return {
            "success": True,
            "access_token": token,
            "token": token,
            "token_type": "bearer",
            "user": user_resp,
            "settings": settings,
            "farmProfile": farm_profile,
        }

    @staticmethod
    async def register(user_data: RegisterRequest) -> dict:
        name = (user_data.full_name or user_data.name or "").strip()
        existing = await UserRepository.find_by_email(user_data.email)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A user with this email already exists."
            )
            
        doc = {
            "full_name": name,
            "name": name,
            "email": user_data.email.lower(),
            "hashed_password": get_password_hash(user_data.password),
            "phone": user_data.phone or "",
            "role": AuthService._role_value(user_data.role),
            "farm_name": (user_data.farm_name or user_data.farmName or "").strip(),
            "location": user_data.location or "",
            "state": user_data.state,
            "district": user_data.district,
            "village": user_data.village,
            "farm_area": user_data.farmArea,
            "farm_area_unit": user_data.farmAreaUnit,
            "is_email_verified": False,
            "account_status": "active",
            "settings": DEFAULT_SETTINGS,
            "preferred_language": "en",
            "measurement_unit": "Acres",
            "temperature_unit": "Celsius",
            "currency": "INR"
        }
        
        try:
            created = await UserRepository.create(doc)
        except DuplicateKeyError:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="An account with this email already exists.")
        token_data = {
            "sub": str(created["id"]),
            "email": created["email"],
            "name": created["full_name"],
            "role": created["role"]
        }
        token = create_access_token(token_data)
        user_resp = {
            "id": str(created["id"]),
            "name": created["full_name"],
            "full_name": created["full_name"],
            "email": created["email"],
            "phone": created.get("phone", ""),
            "role": created["role"],
            "location": created.get("location", ""),
            "farm_name": created.get("farm_name", ""),
            "avatar": "",
        }
        farm_profile = {
            "userId": str(created["id"]),
            "farmName": created.get("farm_name", ""),
            "ownerName": created.get("full_name", ""),
            "location": created.get("location", ""),
            "state": created.get("state"),
            "district": created.get("district"),
            "village": created.get("village"),
            "totalAreaAcres": created.get("farm_area"),
            "landUnit": created.get("farm_area_unit", "Acres"),
        }
        if any(value for key, value in farm_profile.items() if key not in {"userId"}):
            await FarmRepository.save_farm(str(created["id"]), farm_profile)
        
        return {
            "success": True,
            "access_token": token,
            "token": token,
            "token_type": "bearer",
            "user": user_resp,
            "settings": DEFAULT_SETTINGS,
            "farmProfile": farm_profile,
            "verificationRequired": settings.EMAIL_VERIFICATION_ENABLED,
            "verificationConfigured": bool(settings.SMTP_HOST and settings.SMTP_FROM_EMAIL),
        }

    @staticmethod
    async def get_me(user_id: str) -> dict:
        user = await UserRepository.find_by_id(user_id)
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        
        user_resp = {
            "id": str(user["id"]),
            "name": user.get("full_name") or user.get("name", "Farmer"),
            "full_name": user.get("full_name") or user.get("name", "Farmer"),
            "email": user["email"],
            "phone": user.get("phone", ""),
            "role": user.get("role", "farmer"),
            "location": user.get("location", ""),
            "farm_name": user.get("farm_name", ""),
            "avatar": user.get("avatar", ""),
        }
        farm = await FarmRepository.get_by_user(str(user["id"]))
        farm_profile = farm or {}
        settings = user.get("settings", DEFAULT_SETTINGS)
        
        return {
            "success": True,
            "user": user_resp,
            "settings": settings,
            "farmProfile": farm_profile,
        }

    @staticmethod
    async def change_password(user_id: str, current_password: str, new_password: str) -> dict:
        user = await UserRepository.find_by_id(user_id)
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        
        if not verify_password(current_password, user.get("hashed_password", "")):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Current password does not match.")
        
        await UserRepository.update(user_id, {"hashed_password": get_password_hash(new_password)})
        return {"success": True, "message": "Password changed successfully."}
