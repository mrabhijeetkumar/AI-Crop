from typing import Optional, List, Dict, Any
from bson import ObjectId
from app.database.mongodb import get_database
from app.database.collections import FIELDS_COLLECTION
from datetime import datetime, timezone

_memory_fields: Dict[str, Dict[str, Any]] = {}

class FieldRepository:
    @staticmethod
    async def create(field_data: dict) -> dict:
        db = get_database()
        field_data["created_at"] = datetime.now(timezone.utc)
        if db is not None:
            try:
                res = await db[FIELDS_COLLECTION].insert_one(field_data)
                field_data["_id"] = res.inserted_id
                field_data["id"] = str(res.inserted_id)
                return field_data
            except Exception:
                pass
        fid = str(ObjectId())
        field_data["_id"] = fid
        field_data["id"] = fid
        _memory_fields[fid] = field_data
        return field_data

    @staticmethod
    async def get_by_user(user_id: str) -> List[dict]:
        db = get_database()
        if db is not None:
            try:
                cursor = db[FIELDS_COLLECTION].find({"user_id": user_id})
                results = []
                async for doc in cursor:
                    doc["id"] = str(doc["_id"])
                    results.append(doc)
                if results:
                    return results
            except Exception:
                pass
        return [f for f in _memory_fields.values() if f.get("user_id") == user_id]

    @staticmethod
    async def get_by_id(field_id: str) -> Optional[dict]:
        db = get_database()
        if db is not None:
            try:
                doc = await db[FIELDS_COLLECTION].find_one({"_id": ObjectId(field_id)})
                if doc:
                    doc["id"] = str(doc["_id"])
                    return doc
            except Exception:
                pass
        return _memory_fields.get(field_id)

    @staticmethod
    async def update(field_id: str, update_data: dict) -> Optional[dict]:
        db = get_database()
        update_data["updated_at"] = datetime.now(timezone.utc)
        if db is not None:
            try:
                await db[FIELDS_COLLECTION].update_one(
                    {"_id": ObjectId(field_id)},
                    {"$set": update_data}
                )
                return await FieldRepository.get_by_id(field_id)
            except Exception:
                pass
        if field_id in _memory_fields:
            _memory_fields[field_id].update(update_data)
            return _memory_fields[field_id]
        return None
