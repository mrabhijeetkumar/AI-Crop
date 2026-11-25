from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class ReportSummary(BaseModel):
    id: str
    title: str
    report_type: str # Seasonal, Soil, Yield, Financial, Pest
    date_generated: str
    summary: str
    highlights: List[str]
    download_url: Optional[str] = None

class TaskItem(BaseModel):
    id: str
    title: str
    field_name: str
    due_date: str
    priority: str # High, Medium, Low
    status: str # Pending, Completed
    category: str # Irrigation, Fertilizer, Pest Control, Harvesting

class TaskCreateRequest(BaseModel):
    title: str
    field_name: str
    due_date: str
    priority: str = "Medium"
    category: str = "General"
    notes: Optional[str] = ""

class NotificationItem(BaseModel):
    id: str
    title: str
    message: str
    timestamp: str
    type: str # alert, info, warning, success
    read: bool = False
    action_url: Optional[str] = None

class PredictionRequest(BaseModel):
    model_type: str # crop_recommendation, yield_prediction, disease_detection, soil_analysis
    features: Dict[str, Any]

class PredictionResponse(BaseModel):
    model_type: str
    prediction: Any
    confidence: float
    metadata: Dict[str, Any]
