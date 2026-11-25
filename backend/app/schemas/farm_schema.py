from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class FieldCreate(BaseModel):
    name: str
    area_acres: float
    soil_type: str = "Alluvial Soil"
    current_crop: Optional[str] = None
    growth_stage: Optional[str] = "Sowing"
    sowing_date: Optional[str] = None
    expected_harvest: Optional[str] = None
    health_status: str = "Good" # Excellent, Good, Moderate, Needs Attention
    irrigation_source: str = "Borewell / Drip"
    coordinates: Optional[List[List[float]]] = None

class FieldUpdate(BaseModel):
    name: Optional[str] = None
    area_acres: Optional[float] = None
    soil_type: Optional[str] = None
    current_crop: Optional[str] = None
    growth_stage: Optional[str] = None
    sowing_date: Optional[str] = None
    expected_harvest: Optional[str] = None
    health_status: Optional[str] = None
    irrigation_source: Optional[str] = None

class FieldResponse(FieldCreate):
    id: str
    farm_id: Optional[str] = None
    created_at: Optional[datetime] = None

class FarmCreate(BaseModel):
    name: str
    location: str
    state: str = "Punjab"
    country: str = "India"
    total_acres: float
    description: Optional[str] = ""

class FarmUpdate(BaseModel):
    name: Optional[str] = None
    location: Optional[str] = None
    state: Optional[str] = None
    total_acres: Optional[float] = None
    description: Optional[str] = None

class FarmResponse(FarmCreate):
    id: str
    user_id: str
    fields_count: int = 0
    created_at: Optional[datetime] = None
