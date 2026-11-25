from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class CommodityPrice(BaseModel):
    crop_name: str
    mandi_name: str
    state: str
    modal_price_per_quintal: float
    min_price: float
    max_price: float
    daily_change_percent: float
    price_trend: str # Bullish, Bearish, Stable
    projected_price_30d: float
    best_selling_window: str

class MarketOverviewResponse(BaseModel):
    selected_mandi: str
    state: str
    commodities: List[CommodityPrice]
    market_sentiment: str
    high_demand_crops: List[str]
    price_forecast_chart: List[Dict[str, Any]]
    recommendations: List[str]
