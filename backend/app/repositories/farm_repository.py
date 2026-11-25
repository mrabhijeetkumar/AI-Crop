from typing import Optional, List, Dict, Any
from bson import ObjectId
from app.database.mongodb import get_database
from app.database.collections import FARMS_COLLECTION, FIELDS_COLLECTION
from datetime import datetime, timezone

_memory_farms: Dict[str, Dict[str, Any]] = {}
_memory_fields: Dict[str, Dict[str, Any]] = {}

class FarmRepository:
    @staticmethod
    async def create(farm_data: dict) -> dict:
        db = get_database()
        farm_data["created_at"] = datetime.now(timezone.utc)
        if db is not None:
            try:
                res = await db[FARMS_COLLECTION].insert_one(farm_data)
                farm_data["_id"] = res.inserted_id
                farm_data["id"] = str(res.inserted_id)
                return farm_data
            except Exception:
                pass
        fid = str(ObjectId())
        farm_data["_id"] = fid
        farm_data["id"] = fid
        _memory_farms[fid] = farm_data
        return farm_data

    @staticmethod
    async def save_farm(user_id: str, farm_data: dict) -> dict:
        db = get_database()
        farm_data["user_id"] = user_id
        farm_data["updated_at"] = datetime.now(timezone.utc)
        if db is not None:
            try:
                await db[FARMS_COLLECTION].update_one(
                    {"user_id": user_id},
                    {"$set": farm_data},
                    upsert=True
                )
                return farm_data
            except Exception:
                pass
        _memory_farms[user_id] = farm_data
        return farm_data

    @staticmethod
    async def get_by_user(user_id: str) -> Optional[dict]:
        db = get_database()
        if db is not None:
            try:
                doc = await db[FARMS_COLLECTION].find_one({"user_id": user_id})
                if doc:
                    doc["id"] = str(doc["_id"])
                    return doc
            except Exception:
                pass
        return _memory_farms.get(user_id)

    @staticmethod
    async def get_by_id(farm_id: str) -> Optional[dict]:
        db = get_database()
        if db is not None:
            try:
                doc = await db[FARMS_COLLECTION].find_one({"_id": ObjectId(farm_id)})
                if doc:
                    doc["id"] = str(doc["_id"])
                    return doc
            except Exception:
                pass
        return _memory_farms.get(farm_id)

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
    async def update(field_id: str, field_data: dict) -> dict:
        db = get_database()
        field_data["updated_at"] = datetime.now(timezone.utc)
        if db is not None:
            try:
                await db[FIELDS_COLLECTION].update_one(
                    {"_id": ObjectId(field_id)},
                    {"$set": field_data}
                )
            except Exception:
                pass
        if field_id in _memory_fields:
            _memory_fields[field_id].update(field_data)
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
