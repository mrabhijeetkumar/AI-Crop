from fastapi import APIRouter, Body
from app.schemas.crop_schema import CropSuitabilityRequest, CropAnalysisRequest
from app.services.crop_service import CropService

router = APIRouter(prefix="", tags=["Crop Intelligence"])

@router.post("/crops/recommend")
@router.post("/predict")
@router.post("/crop/predict")
async def recommend_crops(body: dict = Body(...)):
    # Support both flat keys (nitrogen or N, rainfall or rain)
    n = float(body.get("nitrogen", body.get("N", body.get("n", 90))))
    p = float(body.get("phosphorus", body.get("P", body.get("p", 42))))
    k = float(body.get("potassium", body.get("K", body.get("k", 43))))
    ph = float(body.get("ph", body.get("pH", 6.5)))
    rainfall = float(body.get("rainfall", body.get("rain", 150.0)))
    temp = float(body.get("temperature", body.get("temp", 26.0)))
    humidity = float(body.get("humidity", 65.0))
    soil_type = body.get("soil_type", body.get("soilType", "Alluvial Soil"))
    
    req = CropSuitabilityRequest(
        nitrogen=n,
        phosphorus=p,
        potassium=k,
        ph=ph,
        temperature=temp,
        humidity=humidity,
        rainfall=rainfall,
        soil_type=soil_type
    )
    return await CropService.recommend_crops(req)

@router.post("/crops/analyze")
async def analyze_crop(req: CropAnalysisRequest):
    return await CropService.analyze_crop(req)
