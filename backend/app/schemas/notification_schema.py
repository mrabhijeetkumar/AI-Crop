from pydantic import BaseModel
from typing import Optional

class NotificationBase(BaseModel):
    title: str
    message: str
    type: str = "info" # alert, info, warning, success
    action_url: Optional[str] = None
    read: bool = False

class NotificationCreate(NotificationBase):
    pass

class NotificationResponse(NotificationBase):
    id: str
    timestamp: str
