from datetime import datetime, timezone
from typing import Optional
from pydantic import BaseModel, Field, EmailStr

class UserModel(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")
    full_name: str
    email: EmailStr
    hashed_password: str
    phone: Optional[str] = None
    role: str = "farmer" # farmer, agronomist, admin
    location: Optional[str] = None
    farm_name: Optional[str] = None
    state: Optional[str] = None
    district: Optional[str] = None
    village: Optional[str] = None
    farm_area: Optional[float] = None
    farm_area_unit: Optional[str] = None
    is_email_verified: bool = False
    account_status: str = "active"
    preferred_language: str = "en"
    measurement_unit: str = "Acres"
    temperature_unit: str = "Celsius"
    currency: str = "INR"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Config:
        populate_by_name = True
