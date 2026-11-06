from typing import Dict, Any

class YieldPredictionEngine:
    @staticmethod
    def predict_yield(crop_name: str, area_acres: float, soil_health_score: int, rainfall_mm: float) -> Dict[str, Any]:
        base_yields = {
            "Wheat": (20.0, "Quintals"),
            "Rice (Paddy)": (25.0, "Quintals"),
            "Cotton": (12.0, "Quintals"),
            "Mustard": (10.0, "Quintals"),
            "Maize": (28.0, "Quintals"),
            "Sugarcane": (350.0, "Quintals"),
            "Tomato": (180.0, "Quintals")
        }
        
        base, unit = base_yields.get(crop_name, (15.0, "Quintals"))
        health_factor = 0.7 + (soil_health_score / 100.0) * 0.4 # 0.7 to 1.1x
        
        per_acre = base * health_factor
        total_estimated = per_acre * area_acres
        
        return {
            "crop": crop_name,
            "area_acres": area_acres,
            "estimated_yield_per_acre": f"{round(per_acre, 1)} {unit}",
            "total_estimated_yield": f"{round(total_estimated, 1)} {unit}",
            "confidence_interval": f"±{round(per_acre * 0.08, 1)} {unit}",
            "limiting_factors": ["Soil organic carbon status", "Timely irrigation scheduling"]
        }

class DiseaseDetectionEngine:
    @staticmethod
    def detect_disease(crop_name: str, symptoms: str = None) -> Dict[str, Any]:
        s_lower = (symptoms or "").lower()
        if "rust" in s_lower or "yellow" in s_lower or "spot" in s_lower:
            return {
                "condition": "Fungal Leaf Blight / Yellow Rust",
                "confidence": 0.94,
                "severity": "Moderate",
                "chemical_treatment": "Spray Propiconazole 25% EC @ 1ml per liter of water.",
                "organic_treatment": "Spray 5% Neem seed kernel extract (NSKE) or Trichoderma viride.",
                "action_timeline": "Apply within 48 hours before dew sets in."
            }
        elif "wilt" in s_lower or "droop" in s_lower or "root" in s_lower:
            return {
                "condition": "Fusarium Root Wilt",
                "confidence": 0.89,
                "severity": "High",
                "chemical_treatment": "Soil drench with Carbendazim 50% WP @ 2g/L.",
                "organic_treatment": "Incorporate Pseudomonas fluorescens enriched compost around root zones.",
                "action_timeline": "Avoid over-irrigation immediately."
            }
        else:
            return {
                "condition": "Healthy Foliage / Normal Growth",
                "confidence": 0.96,
                "severity": "None",
                "chemical_treatment": "No chemical intervention needed.",
                "organic_treatment": "Maintain regular foliar nourishment spray.",
                "action_timeline": "Routine monitoring in 7 days."
            }
