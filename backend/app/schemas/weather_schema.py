from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class WeatherCurrent(BaseModel):
    temperature: float
    feels_like: float
    humidity: int
    wind_speed: float
    condition: str
    icon: str
    uv_index: float
    precipitation_prob: int
    pressure: int

class ForecastDay(BaseModel):
    date: str
    day_name: str
    temp_max: float
    temp_min: float
    condition: str
    icon: str
    rain_probability: int
    spray_favorable: bool

class AgriculturalAdvisory(BaseModel):
    category: str # Irrigation, Spraying, Sowing, Harvesting
    status: str # Favorable, Caution, Unfavorable
    recommendation: str

class WeatherResponse(BaseModel):
    location: str
    latitude: float
    longitude: float
    current: WeatherCurrent
    forecast: List[ForecastDay]
    agricultural_advisories: List[AgriculturalAdvisory]
    alerts: List[Dict[str, Any]]
