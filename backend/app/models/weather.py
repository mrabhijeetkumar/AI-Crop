from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

class WeatherModel(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")
    location: str
    temperature: float
    humidity: int
    wind_speed: float
    condition: str
    icon: str
    forecast_data: List[Dict[str, Any]] = []
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class MarketPriceModel(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")
    crop_name: str
    mandi_name: str
    state: str
    modal_price: float
    min_price: float
    max_price: float
    daily_change_percent: float = 0.0
    price_trend: str = "Stable"
    recorded_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class TaskModel(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")
    user_id: str
    title: str
    field_name: str
    due_date: str
    priority: str = "Medium"
    status: str = "Pending"
    category: str = "General"
    notes: Optional[str] = ""
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class NotificationModel(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")
    user_id: str
    title: str
    message: str
    type: str = "info"
    read: bool = False
    action_url: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class PredictionModel(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")
    user_id: str
    model_name: str
    input_features: Dict[str, Any]
    output_result: Dict[str, Any]
    confidence_score: float
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
