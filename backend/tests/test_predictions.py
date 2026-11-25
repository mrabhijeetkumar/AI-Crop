import pytest
from app.services.crop_service import CropService
from app.schemas.crop_schema import CropSuitabilityRequest
from app.services.soil_service import SoilService
from app.schemas.soil_schema import SoilTestRequest
from app.services.weather_service import WeatherService
from app.services.advisor_service import AdvisorService
from app.schemas.advisor_schema import AdvisorQueryRequest

@pytest.mark.asyncio
async def test_crop_recommendation():
    req = CropSuitabilityRequest(
        nitrogen=110,
        phosphorus=55,
        potassium=50,
        ph=6.8,
        temperature=22.5,
        humidity=65.0,
        rainfall=90.0,
        soil_type="Alluvial Soil"
    )
    res = await CropService.recommend_crops(req)
    assert "top_recommendation" in res
    assert len(res["recommended_crops"]) > 0
    assert res["top_recommendation"]["crop_name"] in ["Wheat", "Rice (Paddy)", "Maize", "Cotton"]

@pytest.mark.asyncio
async def test_soil_analysis():
    req = SoilTestRequest(
        soil_type="Alluvial Soil",
        nitrogen=95,
        phosphorus=45,
        potassium=40,
        ph=6.7,
        organic_carbon_percent=0.75,
        electrical_conductivity=0.42
    )
    res = await SoilService.analyze_soil("test_user_id", req)
    assert res["overall_health_score"] >= 70
    assert "npk_status" in res

@pytest.mark.asyncio
async def test_weather_forecast():
    res = await WeatherService.get_forecast("Ludhiana, Punjab")
    assert "current" in res
    assert "forecast" in res
    assert len(res["forecast"]) == 7

@pytest.mark.asyncio
async def test_ai_advisor():
    req = AdvisorQueryRequest(
        query="What is the recommended dose of urea for wheat crop?",
        language="en"
    )
    res = await AdvisorService.process_query(req)
    assert "response" in res
    assert len(res["response"]) > 20
