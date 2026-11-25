from typing import Optional, List, Dict, Any
from bson import ObjectId
from app.database.mongodb import get_database
from app.database.collections import SOIL_TESTS_COLLECTION
from datetime import datetime, timezone

_memory_soil_tests: Dict[str, Dict[str, Any]] = {}

class SoilRepository:
    @staticmethod
    async def create(test_data: dict) -> dict:
        db = get_database()
        test_data["tested_at"] = datetime.now(timezone.utc)
        if db is not None:
            try:
                res = await db[SOIL_TESTS_COLLECTION].insert_one(test_data)
                test_data["_id"] = res.inserted_id
                test_data["id"] = str(res.inserted_id)
                return test_data
            except Exception:
                pass
        sid = str(ObjectId())
        test_data["_id"] = sid
        test_data["id"] = sid
        _memory_soil_tests[sid] = test_data
        return test_data

    @staticmethod
    async def get_by_user(user_id: str) -> List[dict]:
        db = get_database()
        if db is not None:
            try:
                cursor = db[SOIL_TESTS_COLLECTION].find({"user_id": user_id}).sort("tested_at", -1)
                results = []
                async for doc in cursor:
                    doc["id"] = str(doc["_id"])
                    results.append(doc)
                if results:
                    return results
            except Exception:
                pass
        return [s for s in _memory_soil_tests.values() if s.get("user_id") == user_id]
