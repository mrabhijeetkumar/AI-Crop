from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

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
    health_status: str = "Good"
    irrigation_source: str = "Borewell / Drip"
    moisture_percentage: float = 45.0
    ndvi_index: float = 0.75
    coordinates: Optional[List[List[float]]] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Config:
        populate_by_name = True
