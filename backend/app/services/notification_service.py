from typing import List, Dict, Any
from app.repositories.notification_repository import NotificationRepository

class NotificationService:
    @staticmethod
    async def get_notifications(user_id: str) -> List[dict]:
        return await NotificationRepository.get_by_user(user_id)

    @staticmethod
    async def mark_read(notif_id: str) -> bool:
        return await NotificationRepository.mark_read(notif_id)
