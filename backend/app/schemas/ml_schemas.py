from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field


# ---------------------------------------------------------------------------
# 1. Crop Recommendation Schemas
# ---------------------------------------------------------------------------
class CropRecommendationRequest(BaseModel):
    nitrogen: float = Field(..., ge=0, le=300, description="Soil Nitrogen content (kg/ha)", example=90.0)
    phosphorus: float = Field(..., ge=0, le=200, description="Soil Phosphorus content (kg/ha)", example=42.0)
    potassium: float = Field(..., ge=0, le=300, description="Soil Potassium content (kg/ha)", example=43.0)
    temperature: float = Field(..., ge=-10, le=60, description="Average temperature in Celsius", example=24.5)
    humidity: float = Field(..., ge=0, le=100, description="Relative humidity in percentage", example=82.0)
    ph: float = Field(..., ge=0, le=14, description="Soil pH level", example=6.5)
    rainfall: float = Field(..., ge=0, le=3000, description="Rainfall in mm", example=202.9)
    top_k: int = Field(default=5, ge=1, le=15, description="Number of top crop suggestions to return")
    state: Optional[str] = Field(default="Punjab", description="Indian State for regional suitability matching")
    soil_type: Optional[str] = Field(default="Alluvial", description="Predominant soil type")


class CropRecommendationItem(BaseModel):
    crop_name: str
    confidence_score: float = Field(..., description="Percentage confidence (0-100%)")
    suitability_level: str = Field(..., description="Highly Suitable / Moderately Suitable / Low Suitability")
    model_probability: float = Field(..., description="Raw Softmax probability (0.0 - 1.0)")
    growing_season: Optional[str] = None
    water_requirement_mm: Optional[float] = None
    expected_duration_days: Optional[str] = None
    agronomic_insight: Optional[str] = None


class CropRecommendationResponse(BaseModel):
    status: str = "success"
    total_evaluated_crops: int
    top_recommendations: List[CropRecommendationItem]
    model_metadata: Dict[str, Any]


# ---------------------------------------------------------------------------
# 2. Crop Yield Prediction & SHAP Explainability Schemas
# ---------------------------------------------------------------------------
class YieldPredictionRequest(BaseModel):
    crop_name: str = Field(..., description="Target crop name", example="Wheat")
    area_acres: float = Field(..., gt=0, le=10000, description="Land area in acres", example=5.0)
    nitrogen: float = Field(default=120.0, ge=0, le=300, description="Nitrogen (kg/ha)")
    phosphorus: float = Field(default=50.0, ge=0, le=200, description="Phosphorus (kg/ha)")
    potassium: float = Field(default=40.0, ge=0, le=300, description="Potassium (kg/ha)")
    ph: float = Field(default=6.8, ge=3.5, le=10.0, description="Soil pH")
    rainfall_mm: float = Field(default=650.0, ge=0, le=3000, description="Total expected rainfall during season in mm")
    temperature_c: float = Field(default=22.0, ge=-5, le=55, description="Average season temperature in C")
    season: Optional[str] = Field(default="Rabi", description="Cropping season: Kharif / Rabi / Zaid")
    state: Optional[str] = Field(default="Punjab", description="State in India")


class ShapFeatureContribution(BaseModel):
    feature_name: str
    feature_value: Any
    shap_value: float = Field(..., description="Marginal yield impact in Quintals/Acre (+ or -)")
    impact_direction: str = Field(..., description="'positive' (increases yield) or 'negative' (reduces yield)")
    human_readable_insight: str


class YieldPredictionResponse(BaseModel):
    crop_name: str
    area_acres: float
    estimated_yield_per_acre_qtl: float
    total_estimated_yield_qtl: float
    unit: str = "Quintals"
    confidence_interval: str
    model_r2_score: float
    model_mae: float
    limiting_factors: List[str]
    shap_explainability: Optional[List[ShapFeatureContribution]] = None


# ---------------------------------------------------------------------------
# 3. Plant Leaf Disease Computer Vision & Grad-CAM Schemas
# ---------------------------------------------------------------------------
class DiseaseDiagnosisResponse(BaseModel):
    status: str = "success"
    crop_detected: str
    disease_name: str
    is_healthy: bool
    confidence_score: float = Field(..., description="Model confidence percentage (0-100%)")
    pathogen_type: str = Field(..., description="Fungal / Bacterial / Viral / Pest / Healthy")
    severity_level: str = Field(..., description="None / Low / Moderate / Severe")
    chemical_treatment: str
    organic_treatment: str
    preventive_measures: List[str]
    action_timeline_hours: int
    gradcam_heatmap_base64: Optional[str] = Field(default=None, description="Base64 encoded Grad-CAM overlay image")
    inference_latency_ms: float


# ---------------------------------------------------------------------------
# 4. Indian Commercial Fertilizer Bag Optimizer Schemas
# ---------------------------------------------------------------------------
class FertilizerCalculationRequest(BaseModel):
    crop_name: str = Field(..., example="Wheat")
    area_value: float = Field(..., gt=0, example=2.0)
    land_unit: str = Field(default="Acre", description="Acre / Bigha / Hectare / Guntha")
    soil_n: float = Field(..., description="Current Soil N (kg/ha)", example=80.0)
    soil_p: float = Field(..., description="Current Soil P (kg/ha)", example=25.0)
    soil_k: float = Field(..., description="Current Soil K (kg/ha)", example=30.0)
    soil_ph: float = Field(default=6.8, description="Soil pH", example=6.8)


class FertilizerBagItem(BaseModel):
    fertilizer_name: str = Field(..., description="e.g. Neem Coated Urea, DAP, MOP, Single Super Phosphate (SSP)")
    total_bags_required: float = Field(..., description="Number of standard 45kg or 50kg bags")
    bag_size_kg: int = Field(default=45, description="Standard Indian bag packing size")
    total_weight_kg: float
    estimated_cost_inr: float
    stage: str = Field(..., description="Basal Dose / 1st Top Dressing / 2nd Top Dressing")
    application_guide: str


class FertilizerPlanResponse(BaseModel):
    crop_name: str
    normalized_area_acres: float
    elemental_deficit_kg: Dict[str, float] = Field(..., description="Deficit in elemental N, P2O5, K2O")
    recommended_bags: List[FertilizerBagItem]
    total_estimated_fertilizer_cost_inr: float
    organic_remedies: List[str]
    precautions: List[str]


# ---------------------------------------------------------------------------
# 5. APMC Mandi Price Forecasting Schemas
# ---------------------------------------------------------------------------
class MandiForecastRequest(BaseModel):
    commodity: str = Field(..., example="Wheat")
    mandi_name: Optional[str] = Field(default="Khanna", example="Khanna")
    state: Optional[str] = Field(default="Punjab", example="Punjab")
    days_ahead: int = Field(default=30, ge=7, le=90, example=30)


class PriceForecastPoint(BaseModel):
    date: str
    predicted_price_inr_qtl: float
    lower_bound_inr: float
    upper_bound_inr: float


class MandiForecastResponse(BaseModel):
    commodity: str
    mandi_name: str
    state: str
    current_modal_price_inr: float
    forecast_30d_price_inr: float
    expected_change_percentage: float
    market_sentiment: str = Field(..., description="Bullish / Bearish / Stable")
    action_recommendation: str = Field(..., description="'Sell Immediately' vs 'Hold in Storage for 2-4 weeks'")
    msp_price_inr: Optional[float] = None
    forecast_points: List[PriceForecastPoint]
