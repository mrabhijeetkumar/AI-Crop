from fastapi import APIRouter, Query
from app.services.weather_service import WeatherService
from app.integrations.weather.openweather_service import OpenWeatherService

router = APIRouter(prefix="/weather", tags=["Weather"])

@router.get("")
@router.get("/")
@router.get("/current")
@router.get("/forecast")
async def get_weather(
    location: str = Query("Sasaram, Rohtas, Bihar", description="Location query"),
    lat: float | None = Query(None),
    lon: float | None = Query(None),
    apiKey: str | None = Query(None)
):
    latitude = lat if lat is not None else 24.95
    longitude = lon if lon is not None else 84.03
    return await OpenWeatherService.get_farm_weather(
        location=location,
        lat=latitude,
        lon=longitude,
        api_key_override=apiKey or ""
    )
