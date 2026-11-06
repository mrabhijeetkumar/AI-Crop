from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class SoilTestRequest(BaseModel):
    sample_id: Optional[str] = None
    field_id: Optional[str] = None
    soil_type: str
    nitrogen: float = Field(ge=0, le=400)
    phosphorus: float = Field(ge=0, le=250)
    potassium: float = Field(ge=0, le=400)
    ph: float = Field(ge=3.0, le=10.0)
    organic_carbon_percent: float = Field(ge=0.0, le=10.0, default=0.65)
    moisture_percent: float = Field(ge=0.0, le=100.0, default=35.0)
    electrical_conductivity: float = Field(default=0.45) # dS/m

class SoilAnalysisResult(BaseModel):
    overall_health_score: int # 0 - 100
    health_status: str # Excellent, Optimal, Deficient, Degraded
    npk_status: Dict[str, str] # N: "Low", P: "Optimal", K: "High"
    ph_category: str # Acidic, Neutral, Alkaline
    deficiencies: List[str]
    organic_remedies: List[str]
    chemical_fertilizer_dosage: Dict[str, str]
    compatible_crops: List[str]
    next_test_recommended_days: int
