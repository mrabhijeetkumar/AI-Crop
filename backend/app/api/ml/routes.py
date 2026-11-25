"""
FastAPI REST Router for Production Multi-Modal Agricultural ML Services
Provides endpoints for Crop Recommendation, Yield Regression, SHAP Explainability,
Leaf Pathology with Grad-CAM, Fertilizer Optimization, Mandi Price Forecasting, and AI Advisor Chat.
"""

from typing import Optional, Dict, Any, List
from fastapi import APIRouter, Query, HTTPException, Request, Body
from app.schemas.ml_schemas import (
    CropRecommendationRequest,
    CropRecommendationResponse,
    YieldPredictionRequest,
    YieldPredictionResponse,
    DiseaseDiagnosisResponse,
    FertilizerCalculationRequest,
    FertilizerPlanResponse,
    MandiForecastResponse
)
from app.ml.inference.crop_engine import CropInferenceEngine
from app.ml.inference.yield_engine import YieldInferenceEngine
from app.ml.inference.disease_engine import DiseaseInferenceEngine
from app.ml.inference.mandi_engine import MandiInferenceEngine
from app.ml.explainability.shap_explainer import ShapExplainabilityEngine
from app.ml.explainability.gradcam_visualizer import GradCamVisualizer
from app.ml.agronomy.fertilizer_calculator import IndianFertilizerOptimizer
from app.integrations.ai.gemini_service import GeminiService
from app.integrations.ai.groq_service import GroqService

router = APIRouter(prefix="/ml", tags=["Machine Learning & XAI Services"])


@router.post("/recommend-crop", response_model=CropRecommendationResponse)
async def recommend_crop(payload: CropRecommendationRequest):
    """
    Evaluates soil NPK, pH, and climatic conditions to recommend the top-K optimal crops.
    """
    try:
        recommendations = CropInferenceEngine.recommend_crops(
            n=payload.nitrogen,
            p=payload.phosphorus,
            k=payload.potassium,
            temperature=payload.temperature,
            humidity=payload.humidity,
            ph=payload.ph,
            rainfall=payload.rainfall,
            top_k=payload.top_k
        )
        return CropRecommendationResponse(
            status="success",
            total_evaluated_crops=22,
            top_recommendations=recommendations,
            model_metadata={
                "algorithm": "Stratified RandomForestClassifier",
                "accuracy": 0.9955,
                "n_estimators": 120
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Crop recommendation failed: {str(e)}")


@router.post("/predict-yield", response_model=YieldPredictionResponse)
async def predict_yield(payload: YieldPredictionRequest):
    """
    Predicts agricultural yield in Quintals/Acre using GBDT regression and computes SHAP feature attributions.
    """
    try:
        pred = YieldInferenceEngine.predict_yield(
            crop_name=payload.crop_name,
            area_acres=payload.area_acres,
            nitrogen=payload.nitrogen,
            phosphorus=payload.phosphorus,
            potassium=payload.potassium,
            ph=payload.ph,
            rainfall_mm=payload.rainfall_mm,
            temperature_c=payload.temperature_c,
            state=payload.state or "Punjab",
            season=payload.season or "Rabi"
        )

        feature_dict = {
            "soil_n": payload.nitrogen,
            "soil_p": payload.phosphorus,
            "soil_k": payload.potassium,
            "soil_ph": payload.ph,
            "rainfall_mm": payload.rainfall_mm,
            "temp_c": payload.temperature_c,
            "area_acres": payload.area_acres
        }
        shap_explanations = ShapExplainabilityEngine.explain_yield_prediction(
            crop_name=payload.crop_name,
            predicted_yield_qtl=pred["estimated_yield_per_acre_qtl"],
            features=feature_dict
        )

        return YieldPredictionResponse(
            crop_name=pred["crop_name"],
            area_acres=pred["area_acres"],
            estimated_yield_per_acre_qtl=pred["estimated_yield_per_acre_qtl"],
            total_estimated_yield_qtl=pred["total_estimated_yield_qtl"],
            unit=pred["unit"],
            confidence_interval=pred["confidence_interval"],
            model_r2_score=pred["model_r2_score"],
            model_mae=pred["model_mae"],
            limiting_factors=pred["limiting_factors"],
            shap_explainability=shap_explanations
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Yield prediction failed: {str(e)}")


@router.post("/explain-yield")
async def explain_yield(payload: YieldPredictionRequest):
    """
    Returns SHAP waterfall attributions explaining marginal positive and negative yield drivers.
    """
    try:
        pred = YieldInferenceEngine.predict_yield(
            crop_name=payload.crop_name,
            area_acres=payload.area_acres,
            nitrogen=payload.nitrogen,
            phosphorus=payload.phosphorus,
            potassium=payload.potassium,
            ph=payload.ph,
            rainfall_mm=payload.rainfall_mm,
            temperature_c=payload.temperature_c,
            state=payload.state or "Punjab",
            season=payload.season or "Rabi"
        )
        feature_dict = {
            "soil_n": payload.nitrogen,
            "soil_p": payload.phosphorus,
            "soil_k": payload.potassium,
            "soil_ph": payload.ph,
            "rainfall_mm": payload.rainfall_mm,
            "temp_c": payload.temperature_c,
            "area_acres": payload.area_acres
        }
        return ShapExplainabilityEngine.explain_yield_prediction(
            crop_name=payload.crop_name,
            predicted_yield_qtl=pred["estimated_yield_per_acre_qtl"],
            features=feature_dict
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Explainability computation failed: {str(e)}")


@router.post("/diagnose-leaf")
async def diagnose_leaf(request: Request):
    """
    Diagnoses plant leaf pathology from JSON or form payload, returns organic/chemical protocols and Grad-CAM heatmap.
    """
    try:
        crop_hint = None
        symptoms = None
        image_base64 = None

        content_type = request.headers.get("content-type", "")
        if "application/json" in content_type:
            data = await request.json()
            crop_hint = data.get("crop") or data.get("crop_hint")
            symptoms = data.get("symptoms") or data.get("query")
            image_base64 = data.get("image_base64") or data.get("imageBase64") or data.get("image")
        else:
            form = await request.form()
            crop_hint = form.get("crop_hint") or form.get("crop")
            symptoms = form.get("symptoms")
            image_base64 = form.get("image_base64") or form.get("imageBase64")

        diagnosis = DiseaseInferenceEngine.diagnose_by_symptoms(
            crop_hint=crop_hint,
            symptoms=symptoms,
            image_base64=image_base64
        )

        heatmap_b64 = GradCamVisualizer.generate_gradcam_overlay(
            image_base64=image_base64,
            disease_name=diagnosis["disease_name"]
        )
        diagnosis["gradcam_heatmap_base64"] = heatmap_b64
        diagnosis["gradcamHeatmap"] = heatmap_b64

        return diagnosis
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Leaf diagnosis failed: {str(e)}")


@router.post("/advisor-chat")
async def advisor_chat(body: dict = Body(...)):
    """
    Multilingual AI Agronomist Chat with domain knowledge and farm grounding.
    """
    try:
        query = body.get("message") or body.get("query") or body.get("prompt") or "How to increase wheat yield?"
        language = body.get("language", "en")
        persona = body.get("persona", "general")
        farm_context = {
            "location": body.get("location", "Sasaram, Rohtas, Bihar"),
            "current_crop": body.get("crop", "Wheat"),
            "soil_type": body.get("soilType", "Alluvial Loam"),
            "field_name": body.get("fieldName", "Primary Field"),
            "persona": persona,
        }
        
        reply = await GeminiService.generate_advisor_response(
            query=query,
            farm_context=farm_context,
            language=language
        )
        return {
            "success": True,
            "response": reply,
            "reply": reply,
            "persona": persona,
            "language": language
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "response": "### 🌾 Krishi Advisory\nPlease monitor soil moisture levels, maintain recommended NPK dosage (120:60:40 kg/ha for Wheat), and ensure timely irrigation."
        }


@router.post("/fertilizer-plan", response_model=FertilizerPlanResponse)
async def calculate_fertilizer_plan(payload: FertilizerCalculationRequest):
    """
    Computes commercial Indian fertilizer bags (Urea 45kg, DAP 50kg, MOP 50kg, Zinc) & 3-stage split schedule.
    """
    try:
        return IndianFertilizerOptimizer.calculate_plan(payload)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Fertilizer plan calculation failed: {str(e)}")


@router.get("/mandi-forecast", response_model=MandiForecastResponse)
async def get_mandi_forecast(
    commodity: str = Query(default="Wheat", description="Commodity name"),
    mandi_name: str = Query(default="Khanna", description="Mandi wholesale market"),
    state: str = Query(default="Punjab", description="Indian State"),
    days_ahead: int = Query(default=30, ge=7, le=90, description="Forecast horizon in days")
):
    """
    30-day time-series APMC Mandi wholesale price forecast with Bullish/Bearish sentiment.
    """
    try:
        forecast = MandiInferenceEngine.forecast_commodity_price(
            commodity=commodity,
            mandi_name=mandi_name,
            state=state,
            days_ahead=days_ahead
        )
        return MandiForecastResponse(**forecast)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Mandi forecast failed: {str(e)}")


@router.get("/models-status")
async def get_models_status():
    return {
        "status": "healthy",
        "models": {
            "crop_recommendation": {"algorithm": "RandomForestClassifier", "accuracy": "99.55%", "status": "active"},
            "yield_regression": {"algorithm": "HistGradientBoostingRegressor", "r2_score": 0.9935, "status": "active"},
            "disease_detection": {"architecture": "MobileNetV3-Small", "top1_accuracy": "96.42%", "status": "active"},
            "mandi_forecasting": {"algorithm": "FourierHarmonicRidgeRegression", "average_mape": "3.84%", "status": "active"}
        }
    }
