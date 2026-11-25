from pydantic import BaseModel, EmailStr
from datetime import datetime

class UserBase(BaseModel):
    full_name: str
    email: EmailStr
    phone: str | None = None
    role: str = "farmer"
    location: str | None = None
    preferred_language: str = "en"
    measurement_unit: str = "Acres"
    temperature_unit: str = "Celsius"
    currency: str = "INR"

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    full_name: str | None = None
    phone: str | None = None
    location: str | None = None
    preferred_language: str | None = None
    measurement_unit: str | None = None
    temperature_unit: str | None = None
    currency: str | None = None

class UserResponse(UserBase):
    id: str
    created_at: datetime | None = None
    
    class Config:
        from_attributes = True
