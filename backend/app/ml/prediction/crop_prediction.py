from pathlib import Path
from typing import List, Dict, Any
import logging

import joblib
import numpy as np

from app.ml.preprocessing.crop_preprocessor import CropPreprocessor

logger = logging.getLogger(__name__)


class CropPredictionEngine:
    """
    Crop recommendation engine backed by a trained
    Random Forest classifier.
    """

    MODEL_PATH = (
        Path(__file__).resolve().parents[1]
        / "models"
        / "crop_recommendation"
        / "crop_recommendation_random_forest.joblib"
    )

    _model = None

    # Keep the inference contract complete so the API response can be
    # validated without filling in missing agronomy fields downstream.
    CROP_PROFILES = {
        "rice": {"yield": "24-28 Quintals/Acre", "revenue": "₹42,000-₹55,000/Acre", "days": 120, "water": "High", "risks": ["Water stress", "Blast disease"], "fertilizer": {"basal": "DAP + MOP", "top_dressing": "Urea in 2 splits"}},
        "wheat": {"yield": "22-26 Quintals/Acre", "revenue": "₹48,000-₹60,000/Acre", "days": 115, "water": "Moderate", "risks": ["Yellow rust", "Terminal heat"], "fertilizer": {"basal": "DAP + Zinc sulphate", "top_dressing": "Urea at tillering"}},
        "maize": {"yield": "28-34 Quintals/Acre", "revenue": "₹45,000-₹62,000/Acre", "days": 105, "water": "Moderate", "risks": ["Fall armyworm", "Lodging"], "fertilizer": {"basal": "NPK + Zinc", "top_dressing": "Urea at knee-high stage"}},
        "chickpea": {"yield": "8-12 Quintals/Acre", "revenue": "₹38,000-₹52,000/Acre", "days": 95, "water": "Low", "risks": ["Pod borer", "Wilt"], "fertilizer": {"basal": "SSP + Rhizobium", "top_dressing": "No heavy nitrogen"}},
        "cotton": {"yield": "12-16 Quintals/Acre", "revenue": "₹70,000-₹95,000/Acre", "days": 160, "water": "Moderate", "risks": ["Bollworm", "Boll rot"], "fertilizer": {"basal": "NPK + Boron", "top_dressing": "Split nitrogen and potash"}},
        "mustard": {"yield": "8-12 Quintals/Acre", "revenue": "₹35,000-₹50,000/Acre", "days": 110, "water": "Low", "risks": ["Aphids", "Alternaria blight"], "fertilizer": {"basal": "SSP + Sulphur", "top_dressing": "Light urea at branching"}},
        "lentil": {"yield": "6-10 Quintals/Acre", "revenue": "₹32,000-₹48,000/Acre", "days": 110, "water": "Low", "risks": ["Rust", "Wilt"], "fertilizer": {"basal": "SSP + Rhizobium", "top_dressing": "Avoid excess nitrogen"}},
    }

    @classmethod
    def _load_model(cls):
        """Load the trained model once and reuse it."""

        if cls._model is None:
            if not cls.MODEL_PATH.exists():
                raise FileNotFoundError(
                    f"Crop recommendation model not found: {cls.MODEL_PATH}"
                )

            cls._model = joblib.load(cls.MODEL_PATH)

        return cls._model

    @staticmethod
    def _suitability_level(confidence: float) -> str:
        """Convert model probability into a user-friendly label."""

        if confidence >= 0.85:
            return "Highly Suitable"

        if confidence >= 0.65:
            return "Moderately Suitable"

        return "Low Suitability"

    @classmethod
    def _enrich_prediction(cls, crop_name: Any, confidence: float) -> Dict[str, Any]:
        """Return one schema-compatible recommendation item."""
        name = str(crop_name)
        profile = cls.CROP_PROFILES.get(name.strip().lower(), {
            "yield": "15-22 Quintals/Acre",
            "revenue": "₹30,000-₹50,000/Acre",
            "days": 110,
            "water": "Moderate",
            "risks": ["Seasonal pest pressure", "Weather variability"],
            "fertilizer": {"basal": "Balanced NPK after soil test", "top_dressing": "Split nitrogen as required"},
        })
        return {
            "crop_name": name,
            "confidence_score": round(float(np.clip(confidence, 0.0, 1.0)) * 100, 2),
            "suitability_level": cls._suitability_level(float(confidence)),
            "model_probability": round(float(np.clip(confidence, 0.0, 1.0)), 4),
            "expected_yield_per_acre": profile["yield"],
            "estimated_revenue_per_acre": profile["revenue"],
            "growth_duration_days": profile["days"],
            "water_requirement": profile["water"],
            "key_risks": profile["risks"],
            "fertilizer_plan": profile["fertilizer"],
        }

    @classmethod
    def predict(
        cls,
        n: float,
        p: float,
        k: float,
        temp: float,
        humidity: float,
        ph: float,
        rainfall: float,
    ) -> List[Dict[str, Any]]:
        """
        Predict the most suitable crops using the trained
        Random Forest model.

        Returns ranked crop recommendations using
        model probability scores.
        """

        values = (n, p, k, temp, humidity, ph, rainfall)
        if not all(np.isfinite(value) for value in values):
            raise ValueError("Crop prediction inputs must be finite numbers")

        try:
            model = cls._load_model()

            features = CropPreprocessor.preprocess(
                nitrogen=n,
                phosphorus=p,
                potassium=k,
                temperature=temp,
                humidity=humidity,
                ph=ph,
                rainfall=rainfall,
            )

            probabilities = model.predict_proba(features)[0]
            classes = model.classes_

            predictions = []

            for crop_name, probability in zip(classes, probabilities):
                confidence = float(probability)

                predictions.append(cls._enrich_prediction(crop_name, confidence))

            predictions.sort(
                key=lambda item: item["confidence_score"],
                reverse=True,
            )

            return predictions
        except Exception as exc:
            logger.exception("Crop model inference failed; using agronomic fallback: %s", exc)
            from app.ml.inference.crop_engine import CropInferenceEngine
            recs = CropInferenceEngine._heuristic_recommend(n, p, k, temp, humidity, ph, rainfall, top_k=10)
            return [cls._enrich_prediction(r["crop_name"], r["model_probability"]) for r in recs]

    @classmethod
    def predict_top_k(
        cls,
        n: float,
        p: float,
        k: float,
        temp: float,
        humidity: float,
        ph: float,
        rainfall: float,
        top_k: int = 5,
    ) -> List[Dict[str, Any]]:
        """
        Return only the top K model recommendations.
        """

        if isinstance(top_k, bool) or not isinstance(top_k, int) or top_k < 1:
            raise ValueError("top_k must be at least 1")

        predictions = cls.predict(
            n=n,
            p=p,
            k=k,
            temp=temp,
            humidity=humidity,
            ph=ph,
            rainfall=rainfall,
        )

        return predictions[:top_k]
