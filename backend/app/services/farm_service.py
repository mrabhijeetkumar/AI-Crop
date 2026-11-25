from typing import List, Dict, Any
from app.repositories.farm_repository import FarmRepository
from app.repositories.field_repository import FieldRepository
from app.schemas.farm_schema import FarmCreate, FarmUpdate
from app.schemas.field_schema import FieldDetail

class FarmService:
    @staticmethod
    async def get_user_farms(user_id: str) -> List[dict]:
        farms = await FarmRepository.get_by_user(user_id)
        return farms

    @staticmethod
    async def create_farm(user_id: str, data: FarmCreate) -> dict:
        doc = data.model_dump()
        doc["user_id"] = user_id
        return await FarmRepository.create(doc)

class FieldService:
    @staticmethod
    async def get_user_fields(user_id: str) -> List[dict]:
        fields = await FieldRepository.get_by_user(user_id)
        return fields

    @staticmethod
    async def create_field(user_id: str, data: dict) -> dict:
        data["user_id"] = user_id
        return await FieldRepository.create(data)

    @staticmethod
    async def update_field(field_id: str, data: dict) -> dict:
        return await FieldRepository.update(field_id, data)
