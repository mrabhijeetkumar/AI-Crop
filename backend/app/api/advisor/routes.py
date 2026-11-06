from typing import List, Optional
from fastapi import APIRouter, Depends, Body, Query
from app.schemas.advisor_schema import AdvisorQueryRequest
from app.services.advisor_service import AdvisorService
from app.integrations.ai.gemini_service import GeminiService
from app.security.dependencies import get_current_user_optional
from datetime import datetime, timezone

router = APIRouter(prefix="/advisor", tags=["AI Advisor"])

@router.post("/chat")
async def chat_with_advisor(body: dict = Body(...)):
    query = body.get("message") or body.get("query") or body.get("prompt") or "How to increase wheat yield?"
    language = body.get("language", "en")
    persona = body.get("persona", "general")
    farm_context = {
        "location": body.get("location", "Sasaram, Rohtas, Bihar"),
        "current_crop": body.get("crop", "Wheat"),
        "soil_type": body.get("soilType", "Alluvial Loam"),
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

@router.get("/sessions")
async def get_advisor_sessions(user: dict | None = Depends(get_current_user_optional)):
    now_str = datetime.now(timezone.utc).strftime("%d %b %Y, %I:%M %p")
    return [
        {
            "id": "sess_default",
            "title": "🌾 Wheat Nitrogen Top-Dressing & Weed Control",
            "lastUpdated": now_str,
            "persona": "general",
            "messages": [
                {
                    "sender": "ai",
                    "text": "Namaste! I am Dr. Krishi, your AI Senior Agronomist. How can I optimize your crop yield, soil nutrients, or mandi strategy today?",
                    "timestamp": "Just now"
                }
            ]
        }
    ]

@router.post("/sessions")
async def save_advisor_session(body: dict = Body(...), user: dict | None = Depends(get_current_user_optional)):
    return {"success": True, "session": body}

@router.delete("/sessions/{session_id}")
async def delete_advisor_session(session_id: str, user: dict | None = Depends(get_current_user_optional)):
    return {"success": True, "message": f"Session {session_id} removed."}

@router.get("/prescriptions")
async def get_prescriptions(user: dict | None = Depends(get_current_user_optional)):
    return [
        {
            "id": "rx_1",
            "crop": "Wheat (HD-2967)",
            "problem": "Nitrogen Yellowing & Micro-Nutrient Boost",
            "treatment": "2% Urea Foliar Spray + 0.5% Zinc Sulphate",
            "dilution": "20g Urea + 5g Zinc per Liter water",
            "frequency": "Once at CRI stage, repeat at Booting",
            "date": datetime.now(timezone.utc).strftime("%d %b %Y")
        }
    ]

@router.post("/prescriptions")
async def create_prescription(body: dict = Body(...), user: dict | None = Depends(get_current_user_optional)):
    return {"success": True, "prescription": body}

@router.delete("/prescriptions/{rx_id}")
async def delete_prescription(rx_id: str, user: dict | None = Depends(get_current_user_optional)):
    return {"success": True, "message": f"Prescription {rx_id} removed."}
