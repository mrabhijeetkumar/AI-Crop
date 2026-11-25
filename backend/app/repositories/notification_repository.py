from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
from bson import ObjectId
from app.database.mongodb import get_database
from app.database.collections import NOTIFICATIONS_COLLECTION

_memory_notifications: Dict[str, Dict[str, Any]] = {
    "notif_1": {
        "id": "notif_1",
        "user_id": "demo_user",
        "title": "Rain Alert for Tomorrow",
        "message": "Heavy showers (18mm) expected in your area. Hold pesticide spraying.",
        "type": "warning",
        "read": False,
        "timestamp": "10 mins ago"
    },
    "notif_2": {
        "id": "notif_2",
        "user_id": "demo_user",
        "title": "Wheat Prices Up by 2.4%",
        "message": "Khanna Mandi wheat rate touched ₹2,275/Qtl. Good time to schedule batch sales.",
        "type": "success",
        "read": False,
        "timestamp": "2 hours ago"
    }
}

class NotificationRepository:
    @staticmethod
    async def get_by_user(user_id: str) -> List[dict]:
        db = get_database()
        if db is not None:
            try:
                cursor = db[NOTIFICATIONS_COLLECTION].find({"user_id": user_id}).sort("created_at", -1)
                results = []
                async for doc in cursor:
                    doc["id"] = str(doc["_id"])
                    results.append(doc)
                if results:
                    return results
            except Exception:
                pass
        return list(_memory_notifications.values())

    @staticmethod
    async def create(notif_data: dict) -> dict:
        db = get_database()
        notif_data["created_at"] = datetime.now(timezone.utc)
        if db is not None:
            try:
                res = await db[NOTIFICATIONS_COLLECTION].insert_one(notif_data)
                notif_data["_id"] = res.inserted_id
                notif_data["id"] = str(res.inserted_id)
                return notif_data
            except Exception:
                pass
        nid = f"notif_{ObjectId()}"
        notif_data["id"] = nid
        _memory_notifications[nid] = notif_data
        return notif_data

    @staticmethod
    async def mark_read(notif_id: str) -> bool:
        db = get_database()
        if db is not None:
            try:
                await db[NOTIFICATIONS_COLLECTION].update_one({"_id": ObjectId(notif_id)}, {"$set": {"read": True}})
            except Exception:
                pass
        if notif_id in _memory_notifications:
            _memory_notifications[notif_id]["read"] = True
            return True
        return True
