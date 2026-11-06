from .auth_schema import TokenSchema, LoginRequest, RegisterRequest
from .user_schema import UserBase, UserCreate, UserUpdate, UserResponse
from .dashboard_schema import MetricCard, DashboardOverview
from .farm_schema import FarmCreate, FarmUpdate, FarmResponse
from .field_schema import FieldDetail
from .crop_schema import (
    CropSuitabilityRequest,
    CropRecommendationItem,
    CropSuitabilityResponse,
    CropAnalysisRequest,
    CropAnalysisResponse,
)
from .soil_schema import SoilTestRequest, SoilAnalysisResult
from .weather_schema import (
    WeatherCurrent,
    ForecastDay,
    AgriculturalAdvisory,
    WeatherResponse,
)
from .market_schema import CommodityPrice, MarketOverviewResponse
from .advisor_schema import ChatMessage, AdvisorQueryRequest, AdvisorQueryResponse
from .report_schema import ReportSummary
from .task_schema import TaskBase, TaskCreate, TaskUpdate, TaskResponse
from .notification_schema import NotificationBase, NotificationCreate, NotificationResponse
from .prediction_schema import PredictionRequestSchema, PredictionResultSchema

__all__ = [
    "TokenSchema",
    "LoginRequest",
    "RegisterRequest",
    "UserBase",
    "UserCreate",
    "UserUpdate",
    "UserResponse",
    "MetricCard",
    "DashboardOverview",
    "FarmCreate",
    "FarmUpdate",
    "FarmResponse",
    "FieldDetail",
    "CropSuitabilityRequest",
    "CropRecommendationItem",
    "CropSuitabilityResponse",
    "CropAnalysisRequest",
    "CropAnalysisResponse",
    "SoilTestRequest",
    "SoilAnalysisResult",
    "WeatherCurrent",
    "ForecastDay",
    "AgriculturalAdvisory",
    "WeatherResponse",
    "CommodityPrice",
    "MarketOverviewResponse",
    "ChatMessage",
    "AdvisorQueryRequest",
    "AdvisorQueryResponse",
    "ReportSummary",
    "TaskBase",
    "TaskCreate",
    "TaskUpdate",
    "TaskResponse",
    "NotificationBase",
    "NotificationCreate",
    "NotificationResponse",
    "PredictionRequestSchema",
    "PredictionResultSchema",
]
