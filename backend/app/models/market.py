from datetime import datetime, timezone
from typing import Optional
from pydantic import BaseModel, Field

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

    class Config:
        populate_by_name = True
