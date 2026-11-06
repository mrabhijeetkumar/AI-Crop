from typing import List, Dict, Any, Optional
from bson import ObjectId
from app.database.mongodb import get_database
from app.database.collections import TASKS_COLLECTION
from datetime import datetime, timezone

_memory_tasks: Dict[str, Dict[str, Any]] = {
    "task_1": {
        "id": "task_1",
        "user_id": "demo_user",
        "title": "Irrigate North Field - Stage 2 Flowering",
        "field_name": "North Field - Sector A",
        "due_date": "Tomorrow, 6:00 AM",
        "priority": "High",
        "status": "Pending",
        "category": "Irrigation",
        "notes": "Ensure 3 hours of drip irrigation."
    },
    "task_2": {
        "id": "task_2",
        "user_id": "demo_user",
        "title": "Apply Zinc & Urea Fertilizer spray",
        "field_name": "South Block 2",
        "due_date": "In 3 days",
        "priority": "Medium",
        "status": "Pending",
        "category": "Fertilizer",
        "notes": "Spray before noon to prevent leaf burn."
    }
}

class TaskRepository:
    @staticmethod
    async def get_by_user(user_id: str) -> List[dict]:
        db = get_database()
        if db is not None:
            try:
                cursor = db[TASKS_COLLECTION].find({"user_id": user_id})
                results = []
                async for doc in cursor:
                    doc["id"] = str(doc["_id"])
                    results.append(doc)
                if results:
                    return results
            except Exception:
                pass
        return list(_memory_tasks.values())

    @staticmethod
    async def create(task_data: dict) -> dict:
        db = get_database()
        task_data["created_at"] = datetime.now(timezone.utc)
        if db is not None:
            try:
                res = await db[TASKS_COLLECTION].insert_one(task_data)
                task_data["_id"] = res.inserted_id
                task_data["id"] = str(res.inserted_id)
                return task_data
            except Exception:
                pass
        tid = f"task_{ObjectId()}"
        task_data["id"] = tid
        _memory_tasks[tid] = task_data
        return task_data

    @staticmethod
    async def update(task_id: str, update_data: dict) -> Optional[dict]:
        db = get_database()
        if db is not None:
            try:
                await db[TASKS_COLLECTION].update_one({"_id": ObjectId(task_id)}, {"$set": update_data})
            except Exception:
                pass
        if task_id in _memory_tasks:
            _memory_tasks[task_id].update(update_data)
            return _memory_tasks[task_id]
        return None

    @staticmethod
    async def delete(task_id: str) -> bool:
        db = get_database()
        if db is not None:
            try:
                await db[TASKS_COLLECTION].delete_one({"_id": ObjectId(task_id)})
            except Exception:
                pass
        if task_id in _memory_tasks:
            del _memory_tasks[task_id]
            return True
        return False
