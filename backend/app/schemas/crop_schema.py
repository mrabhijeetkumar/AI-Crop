from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class CropSuitabilityRequest(BaseModel):
    nitrogen: float = Field(ge=0, le=400, description="Nitrogen content (N)")
    phosphorus: float = Field(ge=0, le=250, description="Phosphorus content (P)")
    potassium: float = Field(ge=0, le=400, description="Potassium content (K)")
    ph: float = Field(ge=3.0, le=10.0, description="Soil pH level")
    temperature: float = Field(ge=-10, le=60, description="Average temperature in Celsius")
    humidity: float = Field(ge=0, le=100, description="Relative humidity in percentage")
    rainfall: float = Field(ge=0, le=3000, description="Annual/Seasonal rainfall in mm")
    soil_type: Optional[str] = "Alluvial Soil"
    season: Optional[str] = "Kharif"

class CropRecommendationItem(BaseModel):
    crop_name: str
    confidence_score: float
    suitability_level: str # Highly Suitable, Moderately Suitable, Low Suitability
    expected_yield_per_acre: str
    estimated_revenue_per_acre: str
    growth_duration_days: int
    water_requirement: str
    key_risks: List[str]
    fertilizer_plan: Dict[str, str]

class CropSuitabilityResponse(BaseModel):
    top_recommendation: CropRecommendationItem
    recommended_crops: List[CropRecommendationItem]
    soil_health_grade: str
    actionable_insights: List[str]
    timestamp: str

class CropAnalysisRequest(BaseModel):
    crop_name: str
    stage: str
    area_acres: float
    observed_symptoms: Optional[str] = None
    image_base64: Optional[str] = None

class CropAnalysisResponse(BaseModel):
    crop: str
    stage: str
    health_score: int
    detected_condition: str
    confidence: float
    treatment_plan: List[str]
    prevention_tips: List[str]
    yield_impact_percentage: float
