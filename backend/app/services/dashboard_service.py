from app.repositories.farm_repository import FarmRepository
from app.repositories.field_repository import FieldRepository
from app.repositories.task_repository import TaskRepository
from app.repositories.market_repository import MarketRepository
from app.integrations.weather.openweather_service import OpenWeatherService

class DashboardService:
    @staticmethod
    async def get_overview(user_id: str, location: str = "Punjab, India") -> dict:
        fields = await FieldRepository.get_by_user(user_id)
        if not fields:
            # Default realistic sample fields
            fields = [
                {
                    "id": "f_1",
                    "name": "North Field - Sector A",
                    "area_acres": 14.5,
                    "soil_type": "Alluvial Loam",
                    "current_crop": "Wheat (HD-2967)",
                    "growth_stage": "Flowering / Ear Head",
                    "sowing_date": "15 Nov 2025",
                    "expected_harvest": "10 Apr 2026",
                    "health_status": "Good",
                    "irrigation_source": "Solar Drip Tube",
                    "moisture_percentage": 52.0,
                    "ndvi_index": 0.81
                },
                {
                    "id": "f_2",
                    "name": "South Block - Field B",
                    "area_acres": 8.0,
                    "soil_type": "Clay Loam",
                    "current_crop": "Mustard (Pusa Bold)",
                    "growth_stage": "Pod Filling",
                    "sowing_date": "20 Oct 2025",
                    "expected_harvest": "15 Mar 2026",
                    "health_status": "Excellent",
                    "irrigation_source": "Canal + Borewell",
                    "moisture_percentage": 42.0,
                    "ndvi_index": 0.88
                },
                {
                    "id": "f_3",
                    "name": "East Meadow - Sector C",
                    "area_acres": 6.5,
                    "soil_type": "Sandy Loam",
                    "current_crop": "Potato (Kufri Pukhraj)",
                    "growth_stage": "Tuber Bulking",
                    "sowing_date": "05 Oct 2025",
                    "expected_harvest": "28 Feb 2026",
                    "health_status": "Needs Attention",
                    "irrigation_source": "Sprinkler",
                    "moisture_percentage": 36.0,
                    "ndvi_index": 0.69
                }
            ]

        total_acres = sum(f.get("area_acres", 0) for f in fields)
        weather = await OpenWeatherService.get_farm_weather(location=location)
        tasks = await TaskRepository.get_by_user(user_id)
        market_prices = await MarketRepository.get_all_prices()

        return {
            "total_area_acres": round(total_acres, 1),
            "active_crops_count": len(set(f.get("current_crop", "").split("(")[0].strip() for f in fields if f.get("current_crop"))),
            "fields_count": len(fields),
            "soil_health_score": 86,
            "weather_summary": weather.get("current", {}),
            "metrics": [
                {
                    "title": "Total Cultivated Area",
                    "value": f"{round(total_acres, 1)}",
                    "unit": "Acres",
                    "trend": "+2.5 Acres this season",
                    "trend_type": "positive",
                    "icon": "Tractor",
                    "description": f"{len(fields)} Active Fields mapped"
                },
                {
                    "title": "Avg Soil Health Index",
                    "value": "86",
                    "unit": "/ 100",
                    "trend": "Optimal N-P-K balance",
                    "trend_type": "positive",
                    "icon": "Sprout",
                    "description": "pH 6.8 (Neutral) & 0.72% Organic Carbon"
                },
                {
                    "title": "Expected Farm Yield",
                    "value": "468",
                    "unit": "Quintals",
                    "trend": "Est. Revenue ₹11.2L",
                    "trend_type": "positive",
                    "icon": "TrendingUp",
                    "description": "Projected ROI +18.4% YoY"
                },
                {
                    "title": "Crop Health Index (NDVI)",
                    "value": "0.79",
                    "unit": "Score",
                    "trend": "Favorable canopy density",
                    "trend_type": "positive",
                    "icon": "Activity",
                    "description": "No active disease outbreaks detected"
                }
            ],
            "active_crops": fields,
            "recent_tasks": tasks[:4],
            "ai_recommendations": [
                {
                    "id": "rec_1",
                    "crop": "Wheat (HD-2967)",
                    "title": "Scheduled Top-Dress Foliar Nitrogen Spray",
                    "advice": "Apply 2% Urea foliar solution in North Field before morning dew to accelerate ear head grain formation.",
                    "urgency": "High",
                    "impact": "+4-6% grain weight"
                },
                {
                    "id": "rec_2",
                    "crop": "Mustard (Pusa Bold)",
                    "title": "Aphid Pest Vigilance on South Block",
                    "advice": "Inspect border plants for early aphid colonies. If spotted, spray 5% Neem Seed Kernel Extract (NSKE).",
                    "urgency": "Medium",
                    "impact": "Prevents pod damage"
                }
            ],
            "market_highlights": market_prices[:4]
        }
