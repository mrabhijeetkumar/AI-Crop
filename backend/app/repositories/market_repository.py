from typing import List, Dict, Any
from app.database.mongodb import get_database
from app.database.collections import MARKET_PRICES_COLLECTION

_default_market_prices = [
    {"crop_name": "Wheat", "mandi_name": "Khanna Mandi", "state": "Punjab", "modal_price_per_quintal": 2275.0, "min_price": 2180.0, "max_price": 2350.0, "daily_change_percent": 1.5, "price_trend": "Bullish", "projected_price_30d": 2420.0, "best_selling_window": "Next 15-20 Days"},
    {"crop_name": "Rice (Paddy)", "mandi_name": "Karnal Mandi", "state": "Haryana", "modal_price_per_quintal": 2203.0, "min_price": 2100.0, "max_price": 2310.0, "daily_change_percent": -0.8, "price_trend": "Stable", "projected_price_30d": 2250.0, "best_selling_window": "Hold for 30 Days"},
    {"crop_name": "Cotton", "mandi_name": "Rajkot Mandi", "state": "Gujarat", "modal_price_per_quintal": 7120.0, "min_price": 6800.0, "max_price": 7450.0, "daily_change_percent": 2.4, "price_trend": "Bullish", "projected_price_30d": 7600.0, "best_selling_window": "Sell in batches"},
    {"crop_name": "Mustard", "mandi_name": "Bharatpur Mandi", "state": "Rajasthan", "modal_price_per_quintal": 5650.0, "min_price": 5400.0, "max_price": 5850.0, "daily_change_percent": 0.5, "price_trend": "Stable", "projected_price_30d": 5800.0, "best_selling_window": "Immediate Selling Good"},
    {"crop_name": "Maize", "mandi_name": "Gulabbagh Mandi", "state": "Bihar", "modal_price_per_quintal": 2090.0, "min_price": 1950.0, "max_price": 2180.0, "daily_change_percent": 1.2, "price_trend": "Bullish", "projected_price_30d": 2200.0, "best_selling_window": "Hold for 2 Weeks"},
    {"crop_name": "Soybean", "mandi_name": "Indore Mandi", "state": "Madhya Pradesh", "modal_price_per_quintal": 4890.0, "min_price": 4650.0, "max_price": 5100.0, "daily_change_percent": -1.1, "price_trend": "Bearish", "projected_price_30d": 4750.0, "best_selling_window": "Sell Now"}
]

class MarketRepository:
    @staticmethod
    async def get_all_prices() -> List[dict]:
        db = get_database()
        if db is not None:
            try:
                cursor = db[MARKET_PRICES_COLLECTION].find({})
                results = []
                async for doc in cursor:
                    doc["id"] = str(doc["_id"])
                    results.append(doc)
                if results:
                    return results
            except Exception:
                pass
        return _default_market_prices
