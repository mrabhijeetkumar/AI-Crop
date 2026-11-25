"""
Comprehensive Unit & Integration Test Suite for Production ML and Agronomic Engines
Tests Crop Recommendation, Yield Regression, SHAP XAI, Grad-CAM, Fertilizer Math, and Mandi Forecaster.
"""

import pytest
from app.ml.inference.crop_engine import CropInferenceEngine
from app.ml.inference.yield_engine import YieldInferenceEngine
from app.ml.inference.disease_engine import DiseaseInferenceEngine
from app.ml.inference.mandi_engine import MandiInferenceEngine
from app.ml.explainability.shap_explainer import ShapExplainabilityEngine
from app.ml.explainability.gradcam_visualizer import GradCamVisualizer
from app.ml.agronomy.fertilizer_calculator import IndianFertilizerOptimizer
from app.schemas.ml_schemas import FertilizerCalculationRequest
from app.integrations.govt_schemes import GovtSchemeEngine


def test_crop_recommendation_engine():
    """Test Crop Recommendation multi-class inference."""
    results = CropInferenceEngine.recommend_crops(
        n=90.0,
        p=42.0,
        k=43.0,
        temperature=24.5,
        humidity=82.0,
        ph=6.5,
        rainfall=202.9,
        top_k=4
    )

    assert len(results) == 4
    top_crop = results[0]
    assert "crop_name" in top_crop
    assert top_crop["confidence_score"] > 0
    assert top_crop["suitability_level"] in ["Highly Suitable", "Moderately Suitable", "Low Suitability"]
    assert top_crop["model_probability"] >= 0.0


def test_yield_prediction_engine():
    """Test Yield GBDT Regression and Limiting Factor Diagnostics."""
    pred = YieldInferenceEngine.predict_yield(
        crop_name="Wheat",
        area_acres=5.0,
        nitrogen=120.0,
        phosphorus=50.0,
        potassium=40.0,
        ph=6.8,
        rainfall_mm=650.0,
        temperature_c=22.0,
        state="Punjab",
        season="Rabi"
    )

    assert pred["crop_name"] == "Wheat"
    assert pred["estimated_yield_per_acre_qtl"] > 0
    assert pred["total_estimated_yield_qtl"] == pytest.approx(pred["estimated_yield_per_acre_qtl"] * 5.0, rel=1e-2)
    assert "±" in pred["confidence_interval"]
    assert len(pred["limiting_factors"]) > 0


def test_shap_explainability_engine():
    """Test SHAP Feature Attribution Waterfall computation."""
    features = {
        "soil_n": 120.0,
        "soil_p": 50.0,
        "soil_k": 40.0,
        "soil_ph": 6.8,
        "rainfall_mm": 650.0,
        "temp_c": 22.0,
        "area_acres": 5.0
    }
    shaps = ShapExplainabilityEngine.explain_yield_prediction(
        crop_name="Wheat",
        predicted_yield_qtl=22.5,
        features=features
    )

    assert len(shaps) > 0
    for item in shaps:
        assert item.feature_name
        assert item.impact_direction in ["positive", "negative"]
        assert isinstance(item.shap_value, float)
        assert len(item.human_readable_insight) > 5


def test_gradcam_visualizer():
    """Test Grad-CAM Visual Heatmap generation."""
    heatmap_data_url = GradCamVisualizer.generate_gradcam_overlay(
        disease_name="Yellow Rust in Wheat"
    )

    assert heatmap_data_url.startswith("data:image/png;base64,")
    assert len(heatmap_data_url) > 100


def test_indian_fertilizer_bag_calculator():
    """Test Soil Health Card to Indian Commercial Bag calculation."""
    req = FertilizerCalculationRequest(
        crop_name="Wheat",
        area_value=2.0,
        land_unit="Acre",
        soil_n=80.0,
        soil_p=25.0,
        soil_k=30.0,
        soil_ph=6.8
    )
    plan = IndianFertilizerOptimizer.calculate_plan(req)

    assert plan.crop_name == "Wheat"
    assert plan.normalized_area_acres == 2.0
    assert len(plan.recommended_bags) >= 4

    # Verify standard commercial bags present
    bag_names = [b.fertilizer_name for b in plan.recommended_bags]
    assert any("DAP" in name for name in bag_names)
    assert any("Urea" in name for name in bag_names)
    assert any("MOP" in name for name in bag_names)
    assert plan.total_estimated_fertilizer_cost_inr > 0
    assert len(plan.organic_remedies) > 0
    assert len(plan.precautions) > 0


def test_fertilizer_land_unit_conversion():
    """Test Bigha and Hectare conversions to standard acreage."""
    # 2 Hectares = ~4.94 Acres
    req = FertilizerCalculationRequest(
        crop_name="Wheat",
        area_value=2.0,
        land_unit="Hectare",
        soil_n=80.0,
        soil_p=25.0,
        soil_k=30.0,
        soil_ph=6.8
    )
    plan = IndianFertilizerOptimizer.calculate_plan(req)
    assert plan.normalized_area_acres == pytest.approx(4.94, abs=0.1)


def test_mandi_time_series_forecaster():
    """Test 30-day APMC Mandi price projection and sentiment."""
    forecast = MandiInferenceEngine.forecast_commodity_price(
        commodity="Wheat",
        mandi_name="Khanna",
        state="Punjab",
        days_ahead=30
    )

    assert forecast["commodity"] == "Wheat"
    assert forecast["current_modal_price_inr"] > 0
    assert forecast["forecast_30d_price_inr"] > 0
    assert len(forecast["forecast_points"]) == 30
    assert forecast["market_sentiment"] in ["Bullish", "Bearish", "Stable"]
    assert "Action" in forecast["action_recommendation"] or len(forecast["action_recommendation"]) > 10


def test_government_schemes_matcher():
    """Test Indian Government Agriculture Scheme Matcher."""
    schemes = GovtSchemeEngine.get_matched_schemes(
        state="Punjab",
        crop="Wheat",
        land_acres=2.5
    )

    assert len(schemes) >= 5
    scheme_ids = [s["id"] for s in schemes]
    assert "pm_kisan" in scheme_ids
    assert "pmfby" in scheme_ids
    assert "kcc" in scheme_ids
    assert "soil_health_card" in scheme_ids
