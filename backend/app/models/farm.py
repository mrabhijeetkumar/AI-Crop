from datetime import datetime, timezone
from typing import Optional, List
from pydantic import BaseModel, Field

class FarmModel(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")
    user_id: str
    name: str
    location: str
    state: str = "Punjab"
    country: str = "India"
    total_acres: float
    description: Optional[str] = ""
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Config:
        populate_by_name = True

class FieldModel(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")
    farm_id: str
    user_id: str
    name: str
    area_acres: float
    soil_type: str = "Alluvial Soil"
    current_crop: Optional[str] = None
    growth_stage: Optional[str] = "Sowing"
    sowing_date: Optional[str] = None
    expected_harvest: Optional[str] = None
    health_status: str = "Good" # Excellent, Good, Moderate, Needs Attention
    irrigation_source: str = "Borewell / Drip"
    moisture_percentage: float = 45.0
    ndvi_index: float = 0.75
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Config:
        populate_by_name = True
