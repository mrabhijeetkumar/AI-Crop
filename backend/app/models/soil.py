from datetime import datetime, timezone
from typing import Optional, Dict, List
from pydantic import BaseModel, Field

class SoilModel(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")
    user_id: str
    field_id: Optional[str] = None
    field_name: Optional[str] = None
    soil_type: str
    nitrogen: float
    phosphorus: float
    potassium: float
    ph: float
    organic_carbon_percent: float = 0.65
    moisture_percent: float = 35.0
    electrical_conductivity: float = 0.45
    health_score: int = 80
    health_status: str = "Good"
    tested_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Config:
        populate_by_name = True
