# 🌾 AI Crop: Precision Agriculture & Multi-Modal AgTech Platform

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI%200.115+-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![PyTorch](https://img.shields.io/badge/Deep%20Learning-PyTorch%202.3+-EE4C2C.svg?logo=pytorch&logoColor=white)](https://pytorch.org)
[![scikit-learn](https://img.shields.io/badge/ML-scikit--learn%20%7C%20LightGBM-F7931E.svg?logo=scikit-learn&logoColor=white)](https://scikit-learn.org)
[![XAI](https://img.shields.io/badge/Explainable%20AI-SHAP%20%7C%20Grad--CAM-8A2BE2.svg)](https://shap.readthedocs.io)
[![React](https://img.shields.io/badge/Frontend-React%2019%20%2B%20Vite-61DAFB.svg?logo=react&logoColor=black)](https://react.dev)
[![Docker](https://img.shields.io/badge/Deployment-Docker%20Compose-2496ED.svg?logo=docker&logoColor=white)](https://www.docker.com)

> An end-to-end multi-modal precision agriculture decision-support platform engineered for Indian farmers and agronomists, combining **Computer Vision**, **Tabular ML**, **Time-Series Mandi Econometrics**, **Explainable AI (XAI)**, and **Multilingual Voice AI**.

---

## 🏛️ System Architecture

```
                                 🌾 AI CROP PLATFORM
                                         │
        ┌────────────────────────────────┴────────────────────────────────┐
        ▼                                                                 ▼
 🌐 FARMER CLIENT (React 19 + PWA)                      ⚡ FASTAPI PRODUCTION GATEWAY
   ├── 🎙️ Multilingual Voice AI (Hindi / English)          ├── 🛡️ JWT Security & CORS Guard
   ├── 📷 Leaf Disease Camera Scanner                     ├── 📊 /api/v1/ml/predict-crop
   ├── 📈 SHAP Feature Waterfall Visualizer               ├── 🌾 /api/v1/ml/predict-yield
   └── 🧪 Soil Health & Fertilizer Bag Dispenser          ├── 🔬 /api/v1/ml/diagnose-leaf (Grad-CAM)
                                                          ├── 🧪 /api/v1/ml/fertilizer-plan
                                                          └── 📉 /api/v1/ml/mandi-forecast
                                                                          │
                                       ┌──────────────────────────────────┴─────────────────┐
                                       ▼                                                    ▼
                       🧠 MULTI-MODAL ML ENGINES                             💾 DATA & REGISTRY
                         ├── MobileNetV3 + Grad-CAM (38 Leaf Classes)          ├── MongoDB (Farm Telemetry)
                         ├── LightGBM Yield Regressor (R²=0.914, SHAP)         ├── Model Registry (.joblib, .pt)
                         ├── Stratified Random Forest Crop Matcher             └── ICAR Agronomy Vector Store
                         ├── Prophet 30-day APMC Mandi Forecaster
                         └── Elemental NPK -> Indian Fertilizer Bag Math
```

---

## 🚀 Key Modules & Capabilities

### 1. 📷 Plant Pathology Computer Vision (MobileNetV3 + Grad-CAM)
* **38 Crop-Disease Classes** classified with **96.4% Top-1 Accuracy** in < 45ms.
* **Grad-CAM Visual Heatmaps**: Shows farmers exact visual areas where fungal, bacterial, or pest damage is occurring.
* **Prescriptive Agronomy**: Immediate chemical and bio-pesticide (Neem oil, *Trichoderma*) treatment protocols with dilution ratios per liter.

### 2. 🌾 Crop Yield Regressor & Explainable AI (LightGBM + SHAP)
* Accurately forecasts yield in **Quintals per Acre** ($R^2 = 0.914, \text{MAE} = 1.18\text{ Qtl/Acre}$).
* **SHAP TreeExplainer Waterfall**: Explains *why* yield increased or decreased (e.g., Nitrogen deficit vs optimal rainfall).

### 3. 🧪 Indian Commercial Fertilizer Bag Optimizer
* Converts Soil Health Card nutrient values ($N, P, K$ kg/ha) into exact **commercial Indian 45kg/50kg bags** (Urea, DAP, MOP, SSP, Zinc Sulphate).
* Split schedules: Basal dose at sowing vs Tillering vs Flowering top-dressing.
* Land unit normalization: Supports **Bigha (Pucca/Kaccha), Guntha, Biswa, Acre, and Hectare**.

### 4. 📉 APMC Mandi Price Forecaster (Time-Series)
* 30-day price trend projection using Facebook Prophet / SARIMA on Indian Mandi wholesale arrivals.
* Generates **"Sell Immediately"** vs **"Hold in Storage"** financial advisory indicators.

### 5. 🎙️ Multilingual Voice AI Advisor
* Voice query support for Indian farmers in **Hindi** and **English** powered by Web Speech API + Gemini/Groq LLMs grounded on ICAR agronomy manuals.

---

## 🗂️ Complete Website File Structure

The project is organized as a React/Vite client, a FastAPI/ML backend, shared data utilities, model artifacts, and deployment configuration. Generated folders such as `node_modules`, `dist`, `.venv`, and Python `__pycache__` files are intentionally omitted.

```text
AI Crop Profit/
├── index.html                         # Vite HTML entry point
├── package.json                       # Frontend scripts and dependencies
├── package-lock.json
├── bun.lock
├── vite.config.ts                     # Vite + React configuration
├── tsconfig.json                      # TypeScript tooling configuration
├── metadata.json                      # App metadata
├── server.ts                          # Express/Vite application server
├── server_db.ts                       # Database-aware server variant
├── .env.example                       # Root environment template
├── docker-compose.yml                 # Full-stack local deployment
├── netlify.toml                       # Netlify deployment rules
├── render.yaml                        # Render deployment rules
├── public/
│   ├── _redirects                      # SPA fallback for static hosting
│   └── images/                         # Crop, farm, and farmer imagery
│       ├── farmer-hero.jpg
│       ├── farm-landscape-hero.jpg
│       ├── dashboard_bg.jpg
│       ├── crop-wheat.jpg
│       ├── crop-rice.jpg
│       ├── crop-mustard.jpg
│       └── crop-cotton.jpg
├── src/
│   ├── main.jsx                        # React application bootstrap
│   ├── App.jsx                         # Providers, dashboard shell, modals
│   ├── index.css                       # Global design system and responsive CSS
│   ├── types.js                        # Shared frontend types
│   ├── context/                        # Global application state
│   │   ├── AuthContext.jsx
│   │   ├── FarmContext.jsx
│   │   ├── LocationContext.jsx
│   │   ├── NotificationContext.jsx
│   │   └── ThemeContext.jsx
│   ├── data/                           # Local datasets and UI seed data
│   │   ├── cropsData.js
│   │   ├── cropIntelligenceData.js
│   │   ├── indianStatesDistricts.js
│   │   ├── mandiData.js
│   │   ├── sampleDiseases.js
│   │   ├── soilTypes.js
│   │   ├── translations.js
│   │   └── weatherData.js
│   ├── services/                       # Frontend API/domain services
│   │   └── cropEngine.js
│   ├── utils/                          # Calculations, formatting, API helpers
│   │   ├── apiConfig.js
│   │   ├── calculations.js
│   │   ├── cropIntelligenceEngine.js
│   │   └── formatters.js
│   └── components/
│       ├── navigation/                 # Primary application navigation
│       │   └── TopNavbar.jsx
│       ├── sections/                   # Dashboard sections and KPI panels
│       │   ├── HeroSection.jsx
│       │   ├── FarmOverviewKPISection.jsx
│       │   ├── FarmPerformanceWeatherSection.jsx
│       │   ├── FarmOperationsTelemetrySection.jsx
│       │   ├── CropRecommendationsSection.jsx
│       │   ├── CropHealthDiseaseSection.jsx
│       │   ├── MandiAndProfitRow.jsx
│       │   ├── DrKrishiAndNewsRow.jsx
│       │   ├── WeatherAdvisorySection.jsx
│       │   ├── MandiPricesSection.jsx
│       │   ├── ProfitRiskSection.jsx
│       │   ├── SoilHealthSection.jsx
│       │   ├── ReportsSection.jsx
│       │   └── NewsSchemesSection.jsx
│       ├── crop/                       # Crop intelligence and agronomy tools
│       │   ├── CropAgronomyBlueprintModal.jsx
│       │   ├── CropComparisonDeck.jsx
│       │   ├── CropHeaderControls.jsx
│       │   ├── CropIpmDefenseMatrix.jsx
│       │   ├── CropLifecycleCalendar.jsx
│       │   ├── CropRotationPlanner.jsx
│       │   └── CropSuitabilityGrid.jsx
│       ├── soil/                       # Soil health, NPK and remediation tools
│       │   ├── SoilHealthCardModal.jsx
│       │   ├── SoilHealthOverviewCards.jsx
│       │   ├── SoilNPKSliders.jsx
│       │   ├── SoilFertilizerCalculator.jsx
│       │   ├── SoilAIAuditPanel.jsx
│       │   ├── SoilRemediationPlanner.jsx
│       │   ├── SoilHistoryTimeline.jsx
│       │   └── SoilTextureSelector.jsx
│       ├── farm/                       # Farm GIS, fields and activities
│       │   ├── FarmGISMap.jsx
│       │   ├── FarmKPIHeader.jsx
│       │   ├── FarmActivityLogModal.jsx
│       │   ├── FieldDetailDrawer.jsx
│       │   └── FieldDeleteConfirmModal.jsx
│       ├── advisor/                    # AI advisor chat and prescriptions
│       │   ├── AdvisorSidebar.jsx
│       │   ├── AdvisorMessageItem.jsx
│       │   ├── AdvisorGroundingBar.jsx
│       │   └── AdvisorPrescriptionModal.jsx
│       ├── reports/                    # Report generation and detail views
│       │   ├── GenerateReportModal.jsx
│       │   └── ReportDetailModal.jsx
│       ├── settings/                   # Profile, security and farm settings
│       │   ├── ProfileSection.jsx
│       │   ├── FarmEstateSection.jsx
│       │   ├── PreferencesSection.jsx
│       │   ├── FinancialSchemesSection.jsx
│       │   ├── MongoDbSection.jsx
│       │   ├── SecuritySection.jsx
│       │   ├── AuditLogsSection.jsx
│       │   ├── UserSwitcherModal.jsx
│       │   └── DeleteAccountModal.jsx
│       ├── DashboardView.jsx            # Legacy/full dashboard workspace
│       ├── FarmFieldsView.jsx
│       ├── SoilHealthView.jsx
│       ├── WeatherAdvisoryView.jsx
│       ├── DiseaseDiagnosisView.jsx
│       ├── MarketIntelligenceView.jsx
│       ├── ProfitRiskView.jsx
│       ├── CropAnalysisView.jsx
│       ├── CropIntelligenceView.jsx
│       ├── AIAdvisorView.jsx
│       ├── ReportsView.jsx
│       ├── SettingsView.jsx
│       ├── QuickActionModal.jsx
│       ├── NavigationTabBar.jsx
│       ├── Footer.jsx
│       └── ErrorBoundary.jsx
├── backend/
│   ├── requirements.txt                # Python dependencies
│   ├── runtime.txt                     # Backend runtime version
│   ├── Procfile                        # Production process command
│   ├── .env.example                    # Backend environment template
│   ├── datasets/                       # Training and market datasets
│   │   ├── Crop_recommendation.csv
│   │   ├── indian_crop_yield_district.csv
│   │   ├── mandi_price_history.csv
│   │   ├── plant_disease_metadata.json
│   │   └── generate_agri_datasets.py
│   ├── app/
│   │   ├── main.py                     # FastAPI application entry point
│   │   ├── api/                        # HTTP route modules
│   │   │   ├── auth/routes.py
│   │   │   ├── advisor/routes.py
│   │   │   ├── crops/routes.py
│   │   │   ├── dashboard/routes.py
│   │   │   ├── database/routes.py
│   │   │   ├── farms/routes.py
│   │   │   ├── fields/routes.py
│   │   │   ├── market/routes.py
│   │   │   ├── ml/routes.py
│   │   │   ├── notifications/routes.py
│   │   │   ├── reports/routes.py
│   │   │   ├── soil/routes.py
│   │   │   ├── tasks/routes.py
│   │   │   ├── users/routes.py
│   │   │   └── weather/routes.py
│   │   ├── config/                     # Settings and environment loading
│   │   ├── database/                   # MongoDB connection and collections
│   │   ├── integrations/               # Gemini, Groq, weather and schemes
│   │   ├── models/                     # Persistence/domain models
│   │   ├── repositories/               # Database access layer
│   │   ├── schemas/                    # Pydantic request/response schemas
│   │   ├── security/                   # JWT, passwords and auth dependencies
│   │   ├── services/                   # Business logic layer
│   │   ├── utils/                      # Backend helpers and validators
│   │   └── ml/
│   │       ├── agronomy/               # Fertilizer and agronomy calculations
│   │       ├── explainability/         # SHAP and Grad-CAM explainers
│   │       ├── inference/              # Production inference engines
│   │       ├── prediction/             # Prediction service adapters
│   │       │   ├── crop_prediction.py
│   │       │   ├── disease_prediction.py
│   │       │   ├── soil_prediction.py
│   │       │   └── yield_prediction.py
│   │       ├── preprocessing/           # Feature preparation
│   │       ├── training/               # Model training scripts
│   │       └── models/                 # Versioned trained model artifacts
│   └── tests/                          # Backend auth, service and ML tests
│       ├── test_auth.py
│       ├── test_predictions.py
│       └── test_ml_inference.py
├── ARCHITECTURE.md                     # System design documentation
├── ML_PIPELINE.md                      # ML pipeline and methodology
├── ROADMAP.md                          # Product roadmap
├── DEPLOYMENT_GUIDE.md                 # Deployment instructions
└── README.md                           # Project overview and setup guide
```

### Runtime flow

```text
Browser → src/main.jsx → src/App.jsx → React providers → Dashboard sections
                                      ↓
                              Express/Vite server
                                      ↓
                              FastAPI backend APIs
                                      ↓
                          services → repositories → MongoDB
                                      ↓
                            ML prediction/inference engines
```

## 📂 Project Documentation

* 🏛️ **[System Architecture](./ARCHITECTURE.md)**: Deep dive into microservices, data flow, security, and scalability.
* 🔬 **[ML Pipeline & Math](./ML_PIPELINE.md)**: Mathematical formulations, loss functions, benchmarks, and XAI theory.
* 🗺️ **[7-Part Master Roadmap](./ROADMAP.md)**: Live progress tracker of the modular transformation.

---

## ⚡ Quick Start

### 1. Backend Service (FastAPI + ML Core)
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
API Documentation will be live at: `http://localhost:8000/docs`

### 2. Frontend Application (React + Vite)
```bash
npm install
npm run dev
```
Platform UI will be live at: `http://localhost:5173`

### 3. Docker Deployment (Full Stack)
```bash
docker-compose up --build
```

---

## 🧪 Testing & Validation
```bash
cd backend
pytest tests/ -v
```
