from pydantic import BaseModel
from typing import Optional

class TaskBase(BaseModel):
    title: str
    field_name: str
    due_date: str
    priority: str = "Medium"
    status: str = "Pending"
    category: str = "General"
    notes: Optional[str] = ""

class TaskCreate(TaskBase):
    pass

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    field_name: Optional[str] = None
    due_date: Optional[str] = None
    priority: Optional[str] = None
    status: Optional[str] = None
    category: Optional[str] = None
    notes: Optional[str] = None

class TaskResponse(TaskBase):
    id: str
