from typing import List, Dict, Any, Optional
from app.database.mongodb import get_database
from app.database.collections import CROPS_COLLECTION

_default_crops = [
    {
        "name": "Wheat",
        "category": "Cereal",
        "optimal_temperature_min": 15,
        "optimal_temperature_max": 25,
        "optimal_rainfall_min": 50,
        "optimal_rainfall_max": 100,
        "optimal_ph_min": 6.0,
        "optimal_ph_max": 7.5,
        "optimal_npk": {"N": 100, "P": 50, "K": 50},
        "growing_season": "Rabi",
        "duration_days": 120,
        "water_requirement": "Moderate",
        "expected_yield_per_acre": "18-22 Quintals",
        "market_value_tier": "High"
    },
    {
        "name": "Rice (Paddy)",
        "category": "Cereal",
        "optimal_temperature_min": 22,
        "optimal_temperature_max": 35,
        "optimal_rainfall_min": 150,
        "optimal_rainfall_max": 300,
        "optimal_ph_min": 5.5,
        "optimal_ph_max": 7.0,
        "optimal_npk": {"N": 120, "P": 60, "K": 60},
        "growing_season": "Kharif",
        "duration_days": 135,
        "water_requirement": "High",
        "expected_yield_per_acre": "22-26 Quintals",
        "market_value_tier": "High"
    },
    {
        "name": "Cotton",
        "category": "Commercial",
        "optimal_temperature_min": 21,
        "optimal_temperature_max": 32,
        "optimal_rainfall_min": 50,
        "optimal_rainfall_max": 100,
        "optimal_ph_min": 6.5,
        "optimal_ph_max": 8.0,
        "optimal_npk": {"N": 110, "P": 55, "K": 55},
        "growing_season": "Kharif",
        "duration_days": 160,
        "water_requirement": "Moderate",
        "expected_yield_per_acre": "10-14 Quintals",
        "market_value_tier": "High"
    },
    {
        "name": "Mustard",
        "category": "Oilseeds",
        "optimal_temperature_min": 10,
        "optimal_temperature_max": 25,
        "optimal_rainfall_min": 25,
        "optimal_rainfall_max": 40,
        "optimal_ph_min": 6.0,
        "optimal_ph_max": 7.5,
        "optimal_npk": {"N": 75, "P": 35, "K": 25},
        "growing_season": "Rabi",
        "duration_days": 105,
        "water_requirement": "Low",
        "expected_yield_per_acre": "8-12 Quintals",
        "market_value_tier": "High"
    }
]

class CropRepository:
    @staticmethod
    async def get_all() -> List[dict]:
        db = get_database()
        if db is not None:
            try:
                cursor = db[CROPS_COLLECTION].find({})
                results = []
                async for doc in cursor:
                    doc["id"] = str(doc["_id"])
                    results.append(doc)
                if results:
                    return results
            except Exception:
                pass
        return _default_crops

    @staticmethod
    async def find_by_name(name: str) -> Optional[dict]:
        crops = await CropRepository.get_all()
        for c in crops:
            if c.get("name", "").lower() == name.lower():
                return c
        return None
