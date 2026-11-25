from datetime import datetime, timezone
from typing import Optional
from pydantic import BaseModel, Field

class TaskModel(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")
    user_id: str
    title: str
    field_name: str
    due_date: str
    priority: str = "Medium"
    status: str = "Pending"
    category: str = "General"
    notes: Optional[str] = ""
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Config:
        populate_by_name = True
