import os
import logging
import httpx
from app.config.settings import settings
from app.integrations.ai.prompts import AGRI_ADVISOR_SYSTEM_PROMPT

logger = logging.getLogger("aicrop.groq")

class GroqService:
    @staticmethod
    async def generate_advisor_response(query: str, farm_context: dict = None) -> str:
        api_key = settings.GROQ_API_KEY or os.getenv("GROQ_API_KEY", "")
        if api_key:
            try:
                async with httpx.AsyncClient(timeout=15.0) as client:
                    resp = await client.post(
                        "https://api.groq.com/openai/v1/chat/completions",
                        headers={
                            "Authorization": f"Bearer {api_key}",
                            "Content-Type": "application/json"
                        },
                        json={
                            "model": "llama-3.1-70b-versatile",
                            "messages": [
                                {"role": "system", "content": AGRI_ADVISOR_SYSTEM_PROMPT},
                                {"role": "user", "content": f"Context: {farm_context}\nQuery: {query}"}
                            ],
                            "temperature": 0.3,
                            "max_tokens": 800
                        }
                    )
                    if resp.status_code == 200:
                        data = resp.json()
                        return data["choices"][0]["message"]["content"]
            except Exception as e:
                logger.warning(f"Groq API error: {e}")
                
        # Fallback to Gemini service logic
        from app.integrations.ai.gemini_service import GeminiService
        return await GeminiService.generate_advisor_response(query, farm_context)
