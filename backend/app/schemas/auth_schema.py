from pydantic import BaseModel, EmailStr, Field
from typing import Optional, Dict, Any, Literal

class TokenSchema(BaseModel):
    success: bool = True
    access_token: str
    token: Optional[str] = None
    token_type: str = "bearer"
    user: Dict[str, Any]
    settings: Optional[Dict[str, Any]] = None
    farmProfile: Optional[Dict[str, Any]] = None

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class RegisterRequest(BaseModel):
    full_name: Optional[str] = None
    name: Optional[str] = None
    email: EmailStr
    password: str = Field(min_length=8)
    phone: Optional[str] = None
    role: Literal["Farmer", "Farm Manager", "Agronomist / Agriculture Expert", "Agri Business Owner", "Other"] = "Farmer"
    farm_name: Optional[str] = None
    location: Optional[str] = None
    farmName: Optional[str] = None
    state: Optional[str] = None
    district: Optional[str] = None
    village: Optional[str] = None
    farmArea: Optional[float] = Field(default=None, ge=0)
    farmAreaUnit: Literal["Acres", "Hectares", "Bigha"] = "Acres"

class ChangePasswordRequest(BaseModel):
    currentPassword: str
    newPassword: str = Field(min_length=6)
