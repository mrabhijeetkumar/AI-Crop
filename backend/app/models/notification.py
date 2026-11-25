from datetime import datetime, timezone
from typing import Optional
from pydantic import BaseModel, Field

class NotificationModel(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")
    user_id: str
    title: str
    message: str
    type: str = "info" # alert, info, warning, success
    read: bool = False
    action_url: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Config:
        populate_by_name = True
