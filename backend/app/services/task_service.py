from typing import List, Dict, Any
from app.repositories.task_repository import TaskRepository
from app.schemas.task_schema import TaskCreate, TaskUpdate

class TaskService:
    @staticmethod
    async def get_tasks(user_id: str) -> List[dict]:
        return await TaskRepository.get_by_user(user_id)

    @staticmethod
    async def create_task(user_id: str, data: TaskCreate) -> dict:
        doc = data.model_dump()
        doc["user_id"] = user_id
        return await TaskRepository.create(doc)

    @staticmethod
    async def update_task(task_id: str, data: TaskUpdate) -> dict:
        clean = {k: v for k, v in data.model_dump().items() if v is not None}
        return await TaskRepository.update(task_id, clean)

    @staticmethod
    async def delete_task(task_id: str) -> bool:
        return await TaskRepository.delete(task_id)
