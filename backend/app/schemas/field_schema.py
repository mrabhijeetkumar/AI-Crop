from pydantic import BaseModel
from typing import Optional, List, Dict, Any

class FieldDetail(BaseModel):
    id: str
    farm_id: str
    name: str
    area_acres: float
    soil_type: str
    current_crop: Optional[str] = None
    growth_stage: Optional[str] = None
    sowing_date: Optional[str] = None
    expected_harvest: Optional[str] = None
    health_status: str
    irrigation_source: str
    moisture_percentage: float = 45.0
    ndvi_index: float = 0.72
    recent_activities: List[Dict[str, Any]] = []
