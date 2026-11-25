from typing import List, Dict, Any, Optional
from datetime import datetime, timezone

INDIAN_COMMODITIES_BASE = [
    {
        "id": "m_1",
        "crop": "Wheat (गेहूं)",
        "variety": "Sharbati / Lokwan",
        "category": "Cereals",
        "state": "Bihar",
        "district": "Rohtas",
        "mandi": "Sasaram APMC Mandi",
        "price": 2420,
        "modalPrice": 2420,
        "minPrice": 2340,
        "maxPrice": 2510,
        "change": 45,
        "trend": "up",
        "msp": 2275,
        "arrivals": "145 Tonnes",
        "unit": "₹/Quintal",
        "date": datetime.now().strftime("%d %b %Y"),
        "sentiment": "Strong Demand (Hold for 2-3 weeks for higher APMC prices)",
        "arbitrage": "+₹110/Qtl in Patna Main Market"
    },
    {
        "id": "m_2",
        "crop": "Rice / Paddy (धान)",
        "variety": "Common (Grade A)",
        "category": "Cereals",
        "state": "Bihar",
        "district": "Rohtas",
        "mandi": "Nokha Rice Hub",
        "price": 2380,
        "modalPrice": 2380,
        "minPrice": 2280,
        "maxPrice": 2450,
        "change": 20,
        "trend": "up",
        "msp": 2300,
        "arrivals": "280 Tonnes",
        "unit": "₹/Quintal",
        "date": datetime.now().strftime("%d %b %Y"),
        "sentiment": "Stable procurement at MSP support levels",
        "arbitrage": "+₹85/Qtl in Buxar APMC"
    },
    {
        "id": "m_3",
        "crop": "Mustard (सरसों)",
        "variety": "Pusa Bold 42% Oil",
        "category": "Oilseeds",
        "state": "Bihar",
        "district": "Rohtas",
        "mandi": "Dehri on Sone Mandi",
        "price": 5750,
        "modalPrice": 5750,
        "minPrice": 5500,
        "maxPrice": 5920,
        "change": 110,
        "trend": "up",
        "msp": 5650,
        "arrivals": "85 Tonnes",
        "unit": "₹/Quintal",
        "date": datetime.now().strftime("%d %b %Y"),
        "sentiment": "Crusher mill buying active. Bullish outlook.",
        "arbitrage": "+₹220/Qtl in Varanasi Yard"
    },
    {
        "id": "m_4",
        "crop": "Maize / Corn (मक्का)",
        "variety": "Hybrid Yellow",
        "category": "Cereals",
        "state": "Bihar",
        "district": "Rohtas",
        "mandi": "Kudra Mandi",
        "price": 2180,
        "modalPrice": 2180,
        "minPrice": 2050,
        "maxPrice": 2240,
        "change": -15,
        "trend": "down",
        "msp": 2090,
        "arrivals": "190 Tonnes",
        "unit": "₹/Quintal",
        "date": datetime.now().strftime("%d %b %Y"),
        "sentiment": "Poultry feed buying steady. Neutral outlook.",
        "arbitrage": "+₹60/Qtl in Gulabbagh Purnea"
    },
    {
        "id": "m_5",
        "crop": "Gram / Chickpea (चना)",
        "variety": "Desi Bold",
        "category": "Pulses",
        "state": "Bihar",
        "district": "Rohtas",
        "mandi": "Sasaram APMC Mandi",
        "price": 6150,
        "modalPrice": 6150,
        "minPrice": 5950,
        "maxPrice": 6300,
        "change": 75,
        "trend": "up",
        "msp": 5440,
        "arrivals": "40 Tonnes",
        "unit": "₹/Quintal",
        "date": datetime.now().strftime("%d %b %Y"),
        "sentiment": "Tight arrivals supporting high spot premiums.",
        "arbitrage": "+₹150/Qtl in Indore Mandi"
    },
    {
        "id": "m_6",
        "crop": "Potato (आलू)",
        "variety": "Kufri Jyoti / Pukhraj",
        "category": "Vegetables",
        "state": "Bihar",
        "district": "Rohtas",
        "mandi": "Bikramganj Sabzi Mandi",
        "price": 1420,
        "modalPrice": 1420,
        "minPrice": 1280,
        "maxPrice": 1550,
        "change": 30,
        "trend": "up",
        "msp": 0,
        "arrivals": "320 Tonnes",
        "unit": "₹/Quintal",
        "date": datetime.now().strftime("%d %b %Y"),
        "sentiment": "Cold storage release steady. Sell in batches.",
        "arbitrage": "+₹90/Qtl in Gaya Vegetable Yard"
    },
    {
        "id": "m_7",
        "crop": "Cotton (कपास)",
        "variety": "Medium Staple (Shankar-6)",
        "category": "Commercial",
        "state": "Punjab",
        "district": "Ludhiana",
        "mandi": "Khanna Mandi",
        "price": 7450,
        "modalPrice": 7450,
        "minPrice": 7100,
        "maxPrice": 7700,
        "change": 140,
        "trend": "up",
        "msp": 7020,
        "arrivals": "110 Tonnes",
        "unit": "₹/Quintal",
        "date": datetime.now().strftime("%d %b %Y"),
        "sentiment": "Textile export demand high. Bullish trend.",
        "arbitrage": "+₹250/Qtl in Rajkot Yard"
    }
]

class MarketService:
    @staticmethod
    async def get_commodities(
        state: Optional[str] = None,
        district: Optional[str] = None,
        category: Optional[str] = None,
        crop: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        results = []
        for item in INDIAN_COMMODITIES_BASE:
            # Clone item
            c = dict(item)
            if state and state.lower() != "all":
                c["state"] = state
            if district and district.lower() != "all":
                c["district"] = district
                c["mandi"] = f"{district} APMC Mandi"
            
            # Apply category and crop filters if specified
            if category and category.lower() not in ["all", "all categories"]:
                if category.lower() not in c["category"].lower():
                    continue
            if crop and crop.lower().strip():
                if crop.lower().strip() not in c["crop"].lower():
                    continue
            results.append(c)
        return results if results else INDIAN_COMMODITIES_BASE

    @staticmethod
    async def get_market_overview(mandi: str = "Sasaram APMC Mandi", state: str = "Bihar") -> dict:
        prices = await MarketService.get_commodities(state=state)
        chart_data = [
            {"month": "Oct", "Wheat": 2150, "Rice": 2180, "Cotton": 6700, "Mustard": 5300},
            {"month": "Nov", "Wheat": 2190, "Rice": 2200, "Cotton": 6900, "Mustard": 5450},
            {"month": "Dec", "Wheat": 2230, "Rice": 2210, "Cotton": 7050, "Mustard": 5580},
            {"month": "Jan", "Wheat": 2260, "Rice": 2205, "Cotton": 7100, "Mustard": 5620},
            {"month": "Feb", "Wheat": 2275, "Rice": 2203, "Cotton": 7120, "Mustard": 5650},
            {"month": "Mar", "Wheat": 2340, "Rice": 2240, "Cotton": 7350, "Mustard": 5750},
            {"month": "Apr (Est)", "Wheat": 2420, "Rice": 2260, "Cotton": 7600, "Mustard": 5820}
        ]
        return {
            "selected_mandi": mandi,
            "state": state,
            "commodities": prices,
            "market_sentiment": "Bullish for Wheat, Mustard & Pulses across Bihar & Punjab Mandis",
            "price_forecast_chart": chart_data,
            "recommendations": [
                "Wheat procurement prices are above MSP by +₹145/Qtl. Holding for 2-3 weeks recommended.",
                "Mustard crushers are offering premiums for >40% oil content seed lots.",
                "Utilize e-NAM trading for inter-mandi price discovery to capture +5-8% arbitrage."
            ]
        }

    @staticmethod
    async def generate_ai_strategy(data: dict) -> dict:
        crop = data.get("crop", "Wheat")
        mandi = data.get("mandi", "APMC Mandi")
        price = data.get("price", 2400)
        return {
            "success": True,
            "crop": crop,
            "mandi": mandi,
            "current_price": price,
            "action": "HOLD / STAGGERED SELL",
            "confidence": 89.4,
            "target_price_30d": round(float(price) * 1.065, 0),
            "expected_gain": "+6.5% (₹150-180/Qtl)",
            "key_drivers": [
                "Lower crop arrivals reported in neighboring state mandis.",
                "Government MSP procurement buffer stock replenishment active.",
                "Favorable export / industrial flour mill demand."
            ],
            "optimal_selling_window": "Next 18 - 25 Days",
            "storage_advisory": "Maintain grain moisture below 12% in airtight Hermetic Bags."
        }
