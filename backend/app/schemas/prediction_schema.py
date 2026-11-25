from pydantic import BaseModel
from typing import Dict, Any, Optional

class PredictionRequestSchema(BaseModel):
    model_name: str
    features: Dict[str, Any]
    options: Optional[Dict[str, Any]] = None

class PredictionResultSchema(BaseModel):
    model_name: str
    predicted_class: Optional[str] = None
    predicted_value: Optional[float] = None
    confidence: float
    probabilities: Optional[Dict[str, float]] = None
    explanation: Optional[str] = None
