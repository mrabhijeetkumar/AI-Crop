from fastapi import APIRouter, Depends
from app.services.farm_service import FieldService
from app.security.dependencies import get_current_user_optional

router = APIRouter(prefix="/fields", tags=["Fields"])

@router.get("")
async def get_fields(user: dict = Depends(get_current_user_optional)):
    uid = str(user["id"]) if user else "demo_user"
    return await FieldService.get_user_fields(uid)

@router.post("")
async def create_field(data: dict, user: dict = Depends(get_current_user_optional)):
    uid = str(user["id"]) if user else "demo_user"
    return await FieldService.create_field(uid, data)

@router.put("/{field_id}")
async def update_field(field_id: str, data: dict):
    return await FieldService.update_field(field_id, data)
