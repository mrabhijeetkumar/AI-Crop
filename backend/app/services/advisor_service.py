import uuid
from app.integrations.ai.gemini_service import GeminiService
from app.integrations.ai.groq_service import GroqService
from app.schemas.advisor_schema import AdvisorQueryRequest

class AdvisorService:
    @staticmethod
    async def process_query(req: AdvisorQueryRequest) -> dict:
        conv_id = req.conversation_id or str(uuid.uuid4())
        
        if req.provider == "groq":
            response_text = await GroqService.generate_advisor_response(req.query, req.farm_context)
        else:
            response_text = await GeminiService.generate_advisor_response(req.query, req.farm_context, req.language)

        # Generate related dynamic follow-up suggestions
        suggestions = [
            "What is the recommended fertilizer spray schedule for this week?",
            "How do I prevent pest infestations after rainfall?",
            "What is the best Mandi selling window for my crop?"
        ]

        return {
            "response": response_text,
            "suggested_actions": [
                "Schedule irrigation reminder",
                "Log soil sample data",
                "Check Mandi rates"
            ],
            "related_topics": suggestions,
            "conversation_id": conv_id,
            "sources": ["ICAR Agricultural Package of Practices", "Department of Agriculture", "AI Crop Science Core"]
        }
