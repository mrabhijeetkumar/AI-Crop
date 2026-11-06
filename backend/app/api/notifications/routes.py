from fastapi import APIRouter, Depends
from app.services.notification_service import NotificationService
from app.security.dependencies import get_current_user_optional

router = APIRouter(prefix="/notifications", tags=["Notifications"])

@router.get("")
async def get_notifications(user: dict = Depends(get_current_user_optional)):
    uid = str(user["id"]) if user else "demo_user"
    return await NotificationService.get_notifications(uid)

@router.post("/{notif_id}/read")
async def mark_notification_read(notif_id: str):
    return {"success": await NotificationService.mark_read(notif_id)}
