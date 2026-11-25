from app.integrations.weather.openweather_service import OpenWeatherService

class WeatherService:
    @staticmethod
    async def get_forecast(location: str = "Punjab, India") -> dict:
        return await OpenWeatherService.get_farm_weather(location=location)
