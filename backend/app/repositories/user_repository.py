from typing import Optional, List, Dict, Any
from bson import ObjectId
from app.database.mongodb import get_database
from app.database.collections import USERS_COLLECTION
from app.models.user import UserModel
from datetime import datetime, timezone
from pymongo.errors import DuplicateKeyError

# Fallback in-memory store
_memory_users: Dict[str, Dict[str, Any]] = {}

class UserRepository:
    @staticmethod
    async def create(user_data: dict) -> dict:
        db = get_database()
        if "created_at" not in user_data:
            user_data["created_at"] = datetime.now(timezone.utc)
            
        if db is not None:
            try:
                res = await db[USERS_COLLECTION].insert_one(user_data)
                user_data["_id"] = res.inserted_id
                user_data["id"] = str(res.inserted_id)
                return user_data
            except DuplicateKeyError:
                raise
            except Exception:
                pass
                
        # In-memory fallback
        uid = str(ObjectId())
        user_data["_id"] = uid
        user_data["id"] = uid
        _memory_users[uid] = user_data
        return user_data

    @staticmethod
    async def find_by_email(email: str) -> Optional[dict]:
        db = get_database()
        if db is not None:
            try:
                user = await db[USERS_COLLECTION].find_one({"email": email.lower()})
                if user:
                    user["id"] = str(user["_id"])
                    return user
            except Exception:
                pass
                
        for u in _memory_users.values():
            if u.get("email", "").lower() == email.lower():
                return u
        return None

    @staticmethod
    async def find_by_id(user_id: str) -> Optional[dict]:
        db = get_database()
        if db is not None:
            try:
                user = await db[USERS_COLLECTION].find_one({"_id": ObjectId(user_id)})
                if user:
                    user["id"] = str(user["_id"])
                    return user
            except Exception:
                pass
                
        return _memory_users.get(user_id)

    @staticmethod
    async def update(user_id: str, update_data: dict) -> Optional[dict]:
        db = get_database()
        update_data["updated_at"] = datetime.now(timezone.utc)
        if db is not None:
            try:
                await db[USERS_COLLECTION].update_one(
                    {"_id": ObjectId(user_id)},
                    {"$set": update_data}
                )
                return await UserRepository.find_by_id(user_id)
            except Exception:
                pass
                
        if user_id in _memory_users:
            _memory_users[user_id].update(update_data)
            return _memory_users[user_id]
        return None
