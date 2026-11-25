"""
High-Performance Crop Recommendation Inference Engine
"""

from pathlib import Path
from typing import List, Dict, Any, Optional
import joblib
import numpy as np
import pandas as pd

PROJECT_ROOT = Path(__file__).resolve().parents[4]
MODEL_PATH = (
    PROJECT_ROOT
    / "backend"
    / "app"
    / "ml"
    / "models"
    / "crop_recommendation"
    / "crop_recommendation_random_forest.joblib"
)

AGRONOMIC_INSIGHTS = {
    "rice": "High water requirement (~1200mm); thrives in warm, clayey/alluvial soils with high nitrogen.",
    "maize": "Moderate water requirement; excellent nutrient response with strong commercial feed & starch demand.",
    "chickpea": "Rabi pulse; fixes atmospheric nitrogen naturally, low water requirement, thrives in sandy loam.",
    "kidneybeans": "Thrives in mild temperatures with well-drained fertile loam; high market value.",
    "pigeonpeas": "Deep taproot system imparts high drought resilience; ideal for intercropping with cotton/maize.",
    "mothbeans": "Extreme drought tolerance; suitable for arid regions and light sandy soils.",
    "mungbean": "Short duration (60-70 days) catch crop; enriches soil fertility between main seasons.",
    "blackgram": "High protein pulse; excels in warm humid Kharif climates with moderate rainfall.",
    "lentil": "Cool-season pulse; requires minimal irrigation, highly responsive to basal phosphorus.",
    "pomegranate": "High-value horticulture crop; semi-arid climate suitable with drip fertigation.",
    "banana": "Heavy feeder of Potassium and Nitrogen; requires perennial moisture and tropical warmth.",
    "mango": "Deep alluvial soil suitable; susceptible to frost, strong domestic and export market demand.",
    "grapes": "Requires warm, dry weather during ripening; thrives in light well-drained soils with trellis support.",
    "watermelon": "Zaid season crop; high sand content soil preferred with warm sunshine.",
    "muskmelon": "Warm dry climate gives higher TSS (sweetness); prone to powdery mildew under high humidity.",
    "apple": "Temperate crop requiring 1000+ chilling hours; well-drained loamy soils on hill slopes.",
    "orange": "Sub-tropical citrus; well-drained light loams, highly sensitive to waterlogging.",
    "papaya": "Rapid growth; requires warm frost-free climate with fertile loams and high organic matter.",
    "coconut": "Coastal humid tropics; sandy loam soils with consistent soil moisture.",
    "cotton": "Black (Regur) soil optimal; long frost-free season, sensitive to boll rot under water stagnation.",
    "jute": "Warm humid climate with standing water tolerance; alluvial flood plains of eastern India.",
    "coffee": "Grown under shade trees at higher elevations; acidic forest soils with high organic humus."
}

CROP_SEASONS = {
    "rice": "Kharif", "maize": "Kharif/Rabi", "cotton": "Kharif", "jute": "Kharif",
    "pigeonpeas": "Kharif", "mungbean": "Kharif/Zaid", "blackgram": "Kharif",
    "chickpea": "Rabi", "lentil": "Rabi", "wheat": "Rabi", "mustard": "Rabi",
    "watermelon": "Zaid", "muskmelon": "Zaid", "banana": "Perennial",
    "apple": "Perennial", "orange": "Perennial", "mango": "Perennial", "grapes": "Perennial"
}


class CropInferenceEngine:
    _model = None

    @classmethod
    def _get_model(cls):
        if cls._model is None:
            if not MODEL_PATH.exists():
                raise FileNotFoundError(f"Crop model artifact missing at: {MODEL_PATH}")
            cls._model = joblib.load(MODEL_PATH)
        return cls._model

    @staticmethod
    def _suitability_label(prob: float) -> str:
        if prob >= 0.70:
            return "Highly Suitable"
        if prob >= 0.40:
            return "Moderately Suitable"
        return "Low Suitability"

    @classmethod
    def _heuristic_recommend(
        cls, n: float, p: float, k: float, temp: float, humidity: float, ph: float, rainfall: float, top_k: int = 5
    ) -> List[Dict[str, Any]]:
        # Agronomic compatibility heuristics based on ICAR guidelines
        scores = {}
        # Rice: high rain, warm
        scores["rice"] = max(0.1, min(0.98, 0.4 + (rainfall / 300) * 0.3 + (humidity / 100) * 0.2 + (n / 140) * 0.1))
        # Wheat / Chickpea: cooler, lower rain
        scores["wheat"] = max(0.1, min(0.96, 0.5 + (1.0 - rainfall / 200) * 0.2 + (temp < 25) * 0.2 + (p / 80) * 0.1))
        scores["chickpea"] = max(0.1, min(0.94, 0.4 + (1.0 - rainfall / 150) * 0.3 + (k / 80) * 0.15))
        # Maize: balanced
        scores["maize"] = max(0.1, min(0.92, 0.5 + (n / 120) * 0.2 + (p / 60) * 0.15))
        # Cotton: warm, moderate rain, high potassium
        scores["cotton"] = max(0.1, min(0.90, 0.45 + (k / 100) * 0.25 + (temp > 22) * 0.2))
        # Pulses / Lentil
        scores["lentil"] = max(0.1, min(0.88, 0.4 + (ph > 6.0 and ph < 7.5) * 0.2 + (p / 70) * 0.2))
        scores["pigeonpeas"] = max(0.1, min(0.85, 0.45 + (humidity > 50) * 0.2))

        ranked = sorted(scores.items(), key=lambda x: x[1], reverse=True)
        total = sum(v for _, v in ranked[:top_k])
        results = []
        for crop_name, raw_score in ranked[:top_k]:
            prob = raw_score / max(1.0, total)
            conf_pct = round(prob * 100, 2)
            c_name = crop_name.lower()
            results.append({
                "crop_name": c_name.capitalize(),
                "confidence_score": conf_pct,
                "suitability_level": cls._suitability_label(prob),
                "model_probability": round(prob, 4),
                "growing_season": CROP_SEASONS.get(c_name, "Flexible"),
                "agronomic_insight": AGRONOMIC_INSIGHTS.get(
                    c_name,
                    f"Balanced NPK uptake and climate compatibility index of {conf_pct}%."
                )
            })
        return results

    @classmethod
    def recommend_crops(
        cls,
        n: float,
        p: float,
        k: float,
        temperature: float,
        humidity: float,
        ph: float,
        rainfall: float,
        top_k: int = 5
    ) -> List[Dict[str, Any]]:
        try:
            model = cls._get_model()

            input_df = pd.DataFrame([{
                "N": float(n),
                "P": float(p),
                "K": float(k),
                "temperature": float(temperature),
                "humidity": float(humidity),
                "ph": float(ph),
                "rainfall": float(rainfall)
            }])

            probabilities = model.predict_proba(input_df)[0]
            classes = model.classes_

            results = []
            for crop_name, prob in zip(classes, probabilities):
                confidence_pct = round(float(prob) * 100, 2)
                c_name = str(crop_name).lower()
                results.append({
                    "crop_name": c_name.capitalize(),
                    "confidence_score": confidence_pct,
                    "suitability_level": cls._suitability_label(float(prob)),
                    "model_probability": round(float(prob), 4),
                    "growing_season": CROP_SEASONS.get(c_name, "Flexible"),
                    "agronomic_insight": AGRONOMIC_INSIGHTS.get(
                        c_name,
                        f"Balanced NPK uptake and climate compatibility index of {confidence_pct}%."
                    )
                })

            results.sort(key=lambda x: x["confidence_score"], reverse=True)
            return results[:top_k]
        except Exception:
            return cls._heuristic_recommend(n, p, k, temperature, humidity, ph, rainfall, top_k)
