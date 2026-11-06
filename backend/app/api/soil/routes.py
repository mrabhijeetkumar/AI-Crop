from fastapi import APIRouter, Depends, Body
from app.schemas.soil_schema import SoilTestRequest
from app.services.soil_service import SoilService
from app.integrations.ai.gemini_service import GeminiService
from app.security.dependencies import get_current_user_optional

router = APIRouter(prefix="", tags=["Soil Health & AI Analysis"])

@router.post("/soil/analyze")
async def analyze_soil(req: SoilTestRequest, user: dict | None = Depends(get_current_user_optional)):
    uid = str(user["id"]) if user else "demo_user"
    return await SoilService.analyze_soil(uid, req)

@router.get("/soil/history")
async def get_soil_test_history(user: dict | None = Depends(get_current_user_optional)):
    uid = str(user["id"]) if user else "demo_user"
    return await SoilService.get_test_history(uid)

@router.post("/soil/advice")
@router.post("/gemini/soil-advice")
async def get_soil_ai_advice(body: dict = Body(...)):
    n = body.get("n", body.get("nitrogen", 90))
    p = body.get("p", body.get("phosphorus", 42))
    k = body.get("k", body.get("potassium", 43))
    ph = body.get("ph", 6.5)
    soil_type = body.get("soilType", body.get("soil_type", "Alluvial Soil"))
    crop = body.get("crop", "Wheat")
    
    prompt = f"Provide actionable soil nutrient and fertilization advice for {soil_type} with NPK ({n}:{p}:{k}), pH {ph} for growing {crop} in Indian conditions."
    advice = await GeminiService.generate_advisor_response(
        query=prompt,
        farm_context={"soil_type": soil_type, "current_crop": crop, "location": "India"}
    )
    return {
        "success": True,
        "advice": advice,
        "npkStatus": {
            "nitrogen": "Optimal" if n >= 80 else "Deficient",
            "phosphorus": "Optimal" if p >= 35 else "Moderate",
            "potassium": "Optimal" if k >= 40 else "Low",
            "phStatus": "Neutral" if 6.2 <= ph <= 7.5 else ("Acidic" if ph < 6.2 else "Alkaline")
        },
        "fertilizerSplit": [
            {"stage": "Basal (At Sowing)", "urea": "35 kg/acre", "dap": "50 kg/acre", "mop": "20 kg/acre"},
            {"stage": "First Top-Dressing (CRI)", "urea": "30 kg/acre", "dap": "0", "mop": "0"},
            {"stage": "Second Top-Dressing (Booting)", "urea": "25 kg/acre", "dap": "0", "mop": "10 kg/acre"}
        ]
    }
