from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config.settings import settings
from app.database.mongodb import connect_to_mongo, close_mongo_connection

# Routers
from app.api.auth.routes import router as auth_router
from app.api.users.routes import router as users_router
from app.api.dashboard.routes import router as dashboard_router
from app.api.farms.routes import router as farms_router
from app.api.fields.routes import router as fields_router
from app.api.crops.routes import router as crops_router
from app.api.soil.routes import router as soil_router
from app.api.weather.routes import router as weather_router
from app.api.market.routes import router as market_router
from app.api.advisor.routes import router as advisor_router
from app.api.reports.routes import router as reports_router
from app.api.tasks.routes import router as tasks_router
from app.api.notifications.routes import router as notifications_router
from app.api.ml.routes import router as ml_router
from app.api.database.routes import router as db_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await connect_to_mongo()
    yield
    # Shutdown
    await close_mongo_connection()

app = FastAPI(
    title=settings.APP_NAME,
    description="AI-driven Smart Agriculture Platform with crop intelligence, soil health analysis, market predictions, weather advisory, and AI farm advisor.",
    version="2.0.0",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins if "*" not in settings.cors_origins else ["*"],
    allow_origin_regex=r"https://.*\.netlify\.app" if "*" not in settings.cors_origins else None,
    allow_credentials=True if "*" not in settings.cors_origins else False,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def security_headers(request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=(self)"
    return response

# Register routers under both /api/v1 and /api for seamless frontend compatibility
for prefix in ["/api/v1", "/api"]:
    app.include_router(auth_router, prefix=prefix)
    app.include_router(users_router, prefix=prefix)
    app.include_router(dashboard_router, prefix=prefix)
    app.include_router(farms_router, prefix=prefix)
    app.include_router(fields_router, prefix=prefix)
    app.include_router(crops_router, prefix=prefix)
    app.include_router(soil_router, prefix=prefix)
    app.include_router(weather_router, prefix=prefix)
    app.include_router(market_router, prefix=prefix)
    app.include_router(advisor_router, prefix=prefix)
    app.include_router(reports_router, prefix=prefix)
    app.include_router(tasks_router, prefix=prefix)
    app.include_router(notifications_router, prefix=prefix)
    app.include_router(ml_router, prefix=prefix)
    app.include_router(db_router, prefix=prefix)

@app.get("/")
async def root():
    return {
        "service": settings.APP_NAME,
        "version": "2.0.0",
        "status": "online",
        "docs": "/docs",
        "health": "/health"
    }

@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "AI Crop FastAPI Backend", "version": "2.0.0"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=settings.PORT, reload=settings.DEBUG)
