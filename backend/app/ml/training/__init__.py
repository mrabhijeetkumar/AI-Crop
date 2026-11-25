from .train_crop_model import train_crop_recommendation_model
from .train_soil_model import train_soil_model
from .train_yield_model import train_yield_prediction_model
from .train_disease_model import train_disease_detection_model

__all__ = [
    "train_crop_recommendation_model",
    "train_soil_model",
    "train_yield_prediction_model",
    "train_disease_detection_model",
]
