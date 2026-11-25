from datetime import datetime, timezone
from typing import Optional, Dict, Any
from pydantic import BaseModel, Field

class PredictionModel(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")
    user_id: str
    model_name: str
    input_features: Dict[str, Any]
    output_result: Dict[str, Any]
    confidence_score: float
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Config:
        populate_by_name = True
