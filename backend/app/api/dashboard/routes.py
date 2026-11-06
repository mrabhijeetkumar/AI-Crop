from fastapi import APIRouter, Depends, Query
from app.services.dashboard_service import DashboardService
from app.security.dependencies import get_current_user_optional

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("")
@router.get("/")
@router.get("/overview")
async def get_dashboard_overview(
    location: str = Query("Punjab, India", description="Farm region location"),
    user: dict | None = Depends(get_current_user_optional)
):
    uid = str(user["id"]) if user else "demo_user"
    return await DashboardService.get_overview(user_id=uid, location=location)
