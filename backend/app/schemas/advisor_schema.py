from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class ChatMessage(BaseModel):
    sender: str # user, assistant, system
    text: str
    timestamp: str
    metadata: Optional[Dict[str, Any]] = None

class AdvisorQueryRequest(BaseModel):
    query: str
    language: str = "en"
    farm_context: Optional[Dict[str, Any]] = None
    conversation_id: Optional[str] = None
    provider: str = "gemini" # gemini, groq

class AdvisorQueryResponse(BaseModel):
    response: str
    suggested_actions: List[str]
    related_topics: List[str]
    conversation_id: str
    sources: Optional[List[str]] = []
