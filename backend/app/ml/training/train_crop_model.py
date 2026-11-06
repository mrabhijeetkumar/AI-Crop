"""
Production Crop Recommendation Classifier Training Pipeline
Trains a Stratified Random Forest & Gradient Boosted Classifier on agro-climatic parameters.
Saves model artifact and comprehensive evaluation metadata.
"""

from pathlib import Path
import json
import logging
import joblib
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier, HistGradientBoostingClassifier
from sklearn.metrics import accuracy_score, classification_report, f1_score
from sklearn.model_selection import train_test_split, StratifiedKFold, cross_val_score

logger = logging.getLogger("aicrop.ml.train.crop")

PROJECT_ROOT = Path(__file__).resolve().parents[4]
DATASET_PATH = PROJECT_ROOT / "backend" / "datasets" / "Crop_recommendation.csv"
MODEL_DIR = PROJECT_ROOT / "backend" / "app" / "ml" / "models" / "crop_recommendation"
MODEL_PATH = MODEL_DIR / "crop_recommendation_random_forest.joblib"
METADATA_PATH = MODEL_DIR / "metadata.json"

FEATURES = ["N", "P", "K", "temperature", "humidity", "ph", "rainfall"]
TARGET = "label"


def train_crop_recommendation_model():
    logger.info("Initializing Crop Recommendation Training Pipeline...")

    if not DATASET_PATH.exists():
        raise FileNotFoundError(f"Crop dataset not found at: {DATASET_PATH}")

    df = pd.read_csv(DATASET_PATH)

    # Standardize target labels
    df[TARGET] = df[TARGET].astype(str).str.strip().str.lower()
    X = df[FEATURES]
    y = df[TARGET]

    classes = sorted(y.unique().tolist())
    logger.info(f"Loaded {len(df)} samples across {len(classes)} crop classes.")

    # Train / Test Stratified Split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )

    # Train Random Forest Classifier
    rf_model = RandomForestClassifier(
        n_estimators=120,
        max_depth=16,
        min_samples_split=3,
        random_state=42,
        class_weight="balanced",
        n_jobs=-1
    )
    rf_model.fit(X_train, y_train)

    # Evaluate
    y_pred = rf_model.predict(X_test)
    acc = float(accuracy_score(y_test, y_pred))
    macro_f1 = float(f1_score(y_test, y_pred, average="macro"))

    # 5-Fold Stratified Cross-Validation
    skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    cv_scores = cross_val_score(rf_model, X, y, cv=skf, scoring="accuracy")
    cv_mean = float(np.mean(cv_scores))
    cv_std = float(np.std(cv_scores))

    # Feature Importances
    importances = {
        feat: round(float(imp), 4)
        for feat, imp in zip(FEATURES, rf_model.feature_importances_)
    }

    # Save Model Artifact
    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    joblib.dump(rf_model, MODEL_PATH)

    # Build Metadata
    metadata = {
        "model_name": "RandomForestCropRecommendationClassifier",
        "version": "2.1.0",
        "framework": "scikit-learn",
        "algorithm": "RandomForestClassifier",
        "n_estimators": 120,
        "input_features": FEATURES,
        "target_classes": classes,
        "class_count": len(classes),
        "metrics": {
            "test_accuracy": round(acc, 4),
            "macro_f1_score": round(macro_f1, 4),
            "cv_5fold_mean_accuracy": round(cv_mean, 4),
            "cv_5fold_std": round(cv_std, 4)
        },
        "feature_importances": importances,
        "dataset_summary": {
            "total_samples": len(df),
            "train_samples": len(X_train),
            "test_samples": len(X_test)
        },
        "model_file": MODEL_PATH.name,
        "status": "trained_and_verified"
    }

    with open(METADATA_PATH, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)

    logger.info(f"Crop Model saved to: {MODEL_PATH}")
    logger.info(f"Crop Metadata saved to: {METADATA_PATH}")
    return metadata


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, format="%(asctime)s | %(levelname)s | %(message)s")
    meta = train_crop_recommendation_model()
    print(f"\n✅ Crop Recommendation Model Trained Successfully! Accuracy: {meta['metrics']['test_accuracy'] * 100:.2f}%")
