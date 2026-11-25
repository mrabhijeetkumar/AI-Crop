from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

class CropModel(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")
    name: str
    botanical_name: Optional[str] = None
    category: str # Cereal, Pulses, Oilseeds, Commercial, Vegetable, Fruit
    optimal_temperature_min: float
    optimal_temperature_max: float
    optimal_rainfall_min: float
    optimal_rainfall_max: float
    optimal_ph_min: float
    optimal_ph_max: float
    optimal_npk: Dict[str, float]
    growing_season: str # Kharif, Rabi, Zaid
    duration_days: int
    water_requirement: str
    expected_yield_per_acre: str
    market_value_tier: str # High, Moderate, Standard

    class Config:
        populate_by_name = True

class SoilTestModel(BaseModel):
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
    health_score: int = 85
    health_status: str = "Optimal"
    tested_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Config:
        populate_by_name = True
