from app.ml.prediction.soil_prediction import SoilPredictionEngine
from app.repositories.soil_repository import SoilRepository
from app.schemas.soil_schema import SoilTestRequest

class SoilService:
    @staticmethod
    async def analyze_soil(user_id: str, req: SoilTestRequest) -> dict:
        analysis = SoilPredictionEngine.analyze(
            n=req.nitrogen,
            p=req.phosphorus,
            k=req.potassium,
            ph=req.ph,
            oc=req.organic_carbon_percent,
            ec=req.electrical_conductivity
        )
        
        # Persist test record
        doc = req.model_dump()
        doc["user_id"] = user_id
        doc["health_score"] = analysis["overall_health_score"]
        doc["health_status"] = analysis["health_status"]
        await SoilRepository.create(doc)

        return analysis

    @staticmethod
    async def get_test_history(user_id: str):
        return await SoilRepository.get_by_user(user_id)
