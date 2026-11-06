# 🚀 AI Crop Platform - Production Deployment & Security Guide
## GitHub (Public) → Render (FastAPI Backend) → MongoDB Atlas → Netlify (React Frontend)

This guide provides step-by-step instructions to push the AI Crop Platform codebase to a **Public GitHub repository** safely and deploy the **FastAPI backend on Render** with **MongoDB Atlas** and the **React Vite frontend on Netlify**.

---

## 🏛️ Production Architecture Overview

```text
┌─────────────────────────────────────────────────────────────┐
│  🌐 FRONTEND: Netlify (React 19 + Vite + Tailwind CSS + PWA)│
│  - Static Asset CDN & SPA Routing (_redirects / netlify.toml)│
│  - Environment: VITE_API_BASE_URL (Render Backend URL)      │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTPS / JSON REST API (JWT Bearer)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│  ⚡ BACKEND: Render (FastAPI + Python 3.11 + Uvicorn)        │
│  - Dual Route Mounts (/api and /api/v1)                     │
│  - CORS Middleware with Origin Whitelisting                 │
│  - ML Inference (Random Forest, GBDT, MobileNetV3, XAI)     │
└──────────────┬──────────────────────────────┬───────────────┘
               │                              │
               ▼                              ▼
┌──────────────────────────────┐ ┌──────────────────────────────┐
│  💾 DATABASE: MongoDB Atlas  │ │  🧠 AI ENGINES: External APIs│
│  - Users & Hashed Passwords  │ │  - Google Gemini 2.5 Flash   │
│  - Farm Estate & Fields Data │ │  - Groq Llama 3.1 (Optional) │
│  - Agronomic Prescriptions   │ │  - OpenWeatherMap (Optional) │
└──────────────────────────────┘ └──────────────────────────────┘
```

---

## 🔒 1. Security & Pre-Push Checklist

Before pushing to a public GitHub repository, verify:
* [x] **Comprehensive `.gitignore` Active**: All `.env`, `.env.*` (except `.env.example`), `node_modules/`, `__pycache__/`, `.pytest_cache/`, `*.pyc`, `*.db`, `*.sqlite3`, `*.pem`, `*.key`, and OS files (`.DS_Store`) are ignored.
* [x] **No Secrets in Code**: All API keys, database connection strings, passwords, and JWT secrets are read strictly from environment variables.
* [x] **Safe Templates**: `.env.example` and `backend/.env.example` contain placeholder values only.
* [x] **Secure Authentication & Data Isolation**: Endpoints verify JWT signatures and extract `user_id` from the authenticated token context.

---

## 📤 2. Step 1: Push Code to GitHub

### 2.1 Create a New GitHub Repository
1. Navigate to [GitHub New Repository](https://github.com/new).
2. Set the repository name (e.g., `ai-crop-platform` or `AI-Crop-Profit-Optimizer`).
3. Choose **Public** (or **Private**).
4. **Leave "Initialize this repository with README or .gitignore" UNCHECKED** (the repository is already configured).
5. Click **Create repository**.

### 2.2 Run Git Commands
In your project directory terminal, execute:

```bash
# 1. Initialize git (if not already initialized)
git init

# 2. Stage all sanitized files
git add .

# 3. Verify staged files (confirm no .env or sensitive files are staged)
git status

# 4. Commit code
git commit -m "feat: production-ready AI Crop intelligence platform"

# 5. Set default branch to main
git branch -M main

# 6. Link to your GitHub repository URL
git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/<YOUR_REPO_NAME>.git

# 7. Push to GitHub
git push -u origin main
```

---

## 🍃 3. Step 2: MongoDB Atlas Cloud Database Setup

1. Register or log in at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register).
2. Create a free **M0 Shared Cluster**.
3. Under **Security → Database Access**:
   - Create a database user (e.g. `aicrop_admin`) with a strong password.
4. Under **Security → Network Access**:
   - Add IP Address `0.0.0.0/0` (Allow Access from Anywhere) to permit connections from Render cloud instances.
5. Under **Deployment → Database → Connect → Drivers**:
   - Copy the standard connection string format:
     ```text
     mongodb+srv://<username>:<password>@cluster0.mongodb.net/?retryWrites=true&w=majority
     ```

---

## ⚡ 4. Step 3: Deploy FastAPI Backend to Render

1. Log in to the [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** → **Web Service**.
3. Connect your GitHub repository.
4. Configure the service settings:
   - **Name:** `ai-crop-backend`
   - **Root Directory:** `backend`
   - **Runtime:** `Python 3`
   - **Build Command:** `pip install --upgrade pip && pip install -r requirements.txt`
   - **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Instance Type:** `Free`

5. In **Environment Variables**, configure the following keys:

| Environment Variable | Recommended Value | Description |
| :--- | :--- | :--- |
| `PYTHON_VERSION` | `3.11.9` | Python runtime version |
| `APP_ENV` | `production` | Environment mode |
| `DEBUG` | `False` | Disable debug logs and reload |
| `PORT` | `8000` | Service port (Render overrides with `$PORT`) |
| `MONGODB_URI` | `mongodb+srv://<user>:<password>@cluster0.mongodb.net/?retryWrites=true&w=majority` | Atlas connection string |
| `MONGODB_DB_NAME` | `aicrop_db` | Database name |
| `JWT_SECRET` | *(Generate a 32+ character random secret)* | JWT signature secret |
| `GEMINI_API_KEY` | *(Your Google Gemini API Key)* | Required for AI Agronomist & Pathology |
| `GROQ_API_KEY` | *(Optional Groq Key)* | Fast fallback LLM |
| `OPENWEATHER_API_KEY`| *(Optional OpenWeather Key)* | Weather radar provider |
| `ALLOWED_ORIGINS` | `*` or `https://<YOUR_NETLIFY_APP>.netlify.app` | CORS allowed origins |

6. Click **Create Web Service**.
7. Once deployment finishes, copy your live backend URL (e.g., `https://ai-crop-backend.onrender.com`).
8. Verify health endpoint: `https://ai-crop-backend.onrender.com/health` → `{"status": "ok", ...}`.

---

## 🌐 5. Step 4: Deploy React Frontend to Netlify

1. Log in to [Netlify](https://app.netlify.com/).
2. Click **Add new site** → **Import an existing project** → Select **GitHub**.
3. Choose your repository.
4. Build settings will automatically detect [`netlify.toml`](file:///Users/abhijeetkumar/Downloads/AI%20Crop%20Profit/netlify.toml):
   - **Base directory:** *(Leave blank / project root)*
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
5. In **Site Configuration → Environment Variables**, add:

| Environment Variable | Value | Description |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | `https://ai-crop-backend.onrender.com` | Your live Render backend base URL |

6. Click **Deploy Site**.
7. Netlify will generate your live production URL (e.g. `https://ai-crop-profit.netlify.app`).

---

## 🔄 6. Secret Rotation Protocol

If any API key or secret is ever suspected of being exposed:
1. **Gemini API Key**: Go to [Google AI Studio API Keys](https://aistudio.google.com/app/apikey), revoke the existing key, generate a new one, and update Render Environment Variables.
2. **MongoDB Database Password**: Go to MongoDB Atlas → Database Access → Edit User → Change Password, then update `MONGODB_URI` in Render.
3. **JWT Secret**: Update `JWT_SECRET` in Render Environment Variables (all active sessions will be safely logged out and require re-login).

---

## 🧪 7. Local Development & Testing

```bash
# Frontend Local Development
npm run dev

# Frontend Production Build Test
npm run build

# Backend Local Testing (FastAPI)
cd backend
python -m pytest tests/
uvicorn app.main:app --reload --port 8000
```
