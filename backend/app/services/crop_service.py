from datetime import datetime, timezone
from typing import Dict, Any
from app.ml.prediction.crop_prediction import CropPredictionEngine
from app.ml.prediction.yield_prediction import DiseaseDetectionEngine, YieldPredictionEngine
from app.schemas.crop_schema import CropSuitabilityRequest, CropAnalysisRequest

CROP_AGRONOMIC_DATA = {
    "rice": {"growth_duration_days": 120, "expected_yield_per_acre": "24-28 Quintals/Acre"},
    "wheat": {"growth_duration_days": 115, "expected_yield_per_acre": "22-26 Quintals/Acre"},
    "maize": {"growth_duration_days": 105, "expected_yield_per_acre": "28-34 Quintals/Acre"},
    "chickpea": {"growth_duration_days": 95, "expected_yield_per_acre": "8-12 Quintals/Acre"},
    "kidneybeans": {"growth_duration_days": 90, "expected_yield_per_acre": "7-10 Quintals/Acre"},
    "pigeonpeas": {"growth_duration_days": 150, "expected_yield_per_acre": "9-14 Quintals/Acre"},
    "mothbeans": {"growth_duration_days": 75, "expected_yield_per_acre": "4-6 Quintals/Acre"},
    "mungbean": {"growth_duration_days": 70, "expected_yield_per_acre": "5-8 Quintals/Acre"},
    "blackgram": {"growth_duration_days": 80, "expected_yield_per_acre": "6-9 Quintals/Acre"},
    "lentil": {"growth_duration_days": 110, "expected_yield_per_acre": "6-10 Quintals/Acre"},
    "pomegranate": {"growth_duration_days": 180, "expected_yield_per_acre": "40-60 Quintals/Acre"},
    "banana": {"growth_duration_days": 300, "expected_yield_per_acre": "120-160 Quintals/Acre"},
    "mango": {"growth_duration_days": 240, "expected_yield_per_acre": "50-80 Quintals/Acre"},
    "grapes": {"growth_duration_days": 140, "expected_yield_per_acre": "80-110 Quintals/Acre"},
    "watermelon": {"growth_duration_days": 85, "expected_yield_per_acre": "100-150 Quintals/Acre"},
    "muskmelon": {"growth_duration_days": 80, "expected_yield_per_acre": "80-120 Quintals/Acre"},
    "apple": {"growth_duration_days": 160, "expected_yield_per_acre": "40-70 Quintals/Acre"},
    "orange": {"growth_duration_days": 210, "expected_yield_per_acre": "60-90 Quintals/Acre"},
    "papaya": {"growth_duration_days": 270, "expected_yield_per_acre": "150-200 Quintals/Acre"},
    "coconut": {"growth_duration_days": 365, "expected_yield_per_acre": "4000-6000 Nuts/Acre"},
    "cotton": {"growth_duration_days": 160, "expected_yield_per_acre": "12-16 Quintals/Acre"},
    "jute": {"growth_duration_days": 120, "expected_yield_per_acre": "14-18 Quintals/Acre"},
    "coffee": {"growth_duration_days": 240, "expected_yield_per_acre": "6-10 Quintals/Acre"},
}

class CropService:
    @staticmethod
    async def recommend_crops(req: CropSuitabilityRequest) -> dict:
        results = CropPredictionEngine.predict(
            n=req.nitrogen,
            p=req.phosphorus,
            k=req.potassium,
            temp=req.temperature,
            humidity=req.humidity,
            ph=req.ph,
            rainfall=req.rainfall
        )
        
        for crop in results:
            raw_name = crop["crop_name"]
            formatted_name = raw_name.title() if raw_name.islower() else raw_name
            crop["crop_name"] = formatted_name
            crop_key = raw_name.lower().replace(" ", "").replace("_", "")
            agro = CROP_AGRONOMIC_DATA.get(crop_key, {"growth_duration_days": 110, "expected_yield_per_acre": "15-22 Quintals/Acre"})
            crop["growth_duration_days"] = agro["growth_duration_days"]
            crop["expected_yield_per_acre"] = agro["expected_yield_per_acre"]
        
        top = results[0] if results else None
        
        # Insights calculation
        if top:
            insights = [
                f"Based on your soil NPK ({req.nitrogen}-{req.phosphorus}-{req.potassium}) and pH ({req.ph}), **{top['crop_name']}** achieves the highest compatibility score ({top['confidence_score']}%).",
                f"Expected duration to harvest: **{top['growth_duration_days']} days** with estimated yield **{top['expected_yield_per_acre']}**.",
                "Weather conditions are highly supportive for root establishment during this vegetative phase."
            ]
        else:
            insights = ["No clear crop match found for given soil parameters. Please verify test values."]

        return {
            "top_recommendation": top,
            "recommended_crops": results,
            "soil_health_grade": "A (Optimal)" if 6.0 <= req.ph <= 7.5 else "B (Requires Minor Conditioning)",
            "actionable_insights": insights,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }

    @staticmethod
    async def analyze_crop(req: CropAnalysisRequest) -> dict:
        diagnosis = DiseaseDetectionEngine.detect_disease(req.crop_name, req.observed_symptoms)
        yield_data = YieldPredictionEngine.predict_yield(req.crop_name, req.area_acres, 85, 120.0)

        health_score = 92 if diagnosis["severity"] == "None" else (72 if diagnosis["severity"] == "Moderate" else 48)

        return {
            "crop": req.crop_name,
            "stage": req.stage,
            "health_score": health_score,
            "detected_condition": diagnosis["condition"],
            "confidence": diagnosis["confidence"],
            "treatment_plan": [
                diagnosis["chemical_treatment"],
                diagnosis["organic_treatment"],
                diagnosis["action_timeline"]
            ],
            "prevention_tips": [
                "Maintain adequate plant-to-plant spacing for proper aeration.",
                "Ensure balanced potash application to build cell wall resistance.",
                "Avoid late evening overhead sprinkler irrigation to reduce foliage dampness."
            ],
            "yield_impact_percentage": 0.0 if diagnosis["severity"] == "None" else (4.5 if diagnosis["severity"] == "Moderate" else 15.0)
        }
