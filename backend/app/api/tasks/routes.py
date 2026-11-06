from fastapi import APIRouter, Depends
from app.schemas.task_schema import TaskCreate, TaskUpdate
from app.services.task_service import TaskService
from app.security.dependencies import get_current_user_optional

router = APIRouter(prefix="/tasks", tags=["Farm Tasks"])

@router.get("")
async def get_tasks(user: dict = Depends(get_current_user_optional)):
    uid = str(user["id"]) if user else "demo_user"
    return await TaskService.get_tasks(uid)

@router.post("")
async def create_task(data: TaskCreate, user: dict = Depends(get_current_user_optional)):
    uid = str(user["id"]) if user else "demo_user"
    return await TaskService.create_task(uid, data)

@router.put("/{task_id}")
async def update_task(task_id: str, data: TaskUpdate):
    return await TaskService.update_task(task_id, data)

@router.delete("/{task_id}")
async def delete_task(task_id: str):
    return {"success": await TaskService.delete_task(task_id)}
