from fastapi import APIRouter, Depends, Body
from app.services.report_service import ReportService
from app.security.dependencies import get_current_user_optional
from datetime import datetime, timezone

router = APIRouter(prefix="/reports", tags=["Reports"])

@router.get("")
@router.get("/")
async def get_reports(user: dict | None = Depends(get_current_user_optional)):
    uid = str(user["id"]) if user else "demo_user"
    return await ReportService.get_reports_summary(uid)

@router.post("")
@router.post("/")
async def create_report(
    body: dict = Body(...),
    user: dict | None = Depends(get_current_user_optional)
):
    uid = str(user["id"]) if user else "demo_user"
    now_str = datetime.now(timezone.utc).strftime("%d %b %Y")
    new_report = {
        "id": f"rep_{int(datetime.now().timestamp())}",
        "title": body.get("title", "Agricultural Intelligence Farm Report"),
        "report_type": body.get("report_type", "Agronomic Audit"),
        "date_generated": now_str,
        "date": now_str,
        "summary": body.get("summary", "Complete farm audit across soil, crop health, weather, and yield forecasting."),
        "highlights": body.get("highlights", [
            "Total Cultivated Land: 14.5 Acres",
            "Soil Health Score: 86/100",
            "Foliage Health (NDVI): 0.81",
            "Mandi Sale Advisory: Optimal"
        ]),
        "download_url": "/api/reports"
    }
    return new_report

@router.delete("/{report_id}")
async def delete_report(
    report_id: str,
    user: dict | None = Depends(get_current_user_optional)
):
    return {"success": True, "message": f"Report {report_id} deleted."}
