from pydantic import BaseModel
from typing import List, Dict, Any

class MetricCard(BaseModel):
    title: str
    value: str | float | int
    unit: str = ""
    trend: str | None = None
    trend_type: str = "neutral" # positive, negative, neutral
    icon: str = ""
    description: str = ""

class DashboardOverview(BaseModel):
    total_area_acres: float
    active_crops_count: int
    fields_count: int
    soil_health_score: int
    weather_summary: Dict[str, Any]
    metrics: List[MetricCard]
    active_crops: List[Dict[str, Any]]
    recent_tasks: List[Dict[str, Any]]
    ai_recommendations: List[Dict[str, Any]]
    market_highlights: List[Dict[str, Any]]
