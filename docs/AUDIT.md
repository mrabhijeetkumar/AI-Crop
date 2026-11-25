# AI Crop Profit — Phase 1 Structure Audit

**Audit mode:** read-only review, except for creating this report.

**Baseline:** commit `8d76820 chore: capture project baseline` on branch `refactor/structure-cleanup`.

## 1. Executive summary

The repository currently contains two application stacks:

1. React + Vite frontend with a large Node/Express + TypeScript server in [`server.ts`](../server.ts).
2. Separate FastAPI backend under [`backend/app/main.py`](../backend/app/main.py), deployed by [`render.yaml`](../render.yaml).

The active client shell imports [`TopNavbar`](../src/components/navigation/TopNavbar.jsx) directly from [`App.jsx`](../src/App.jsx). Several older navigation, dashboard, and settings components remain in the tree without direct consumer imports. API calls are spread across contexts and feature components even though [`src/utils/apiConfig.js`](../src/utils/apiConfig.js) already provides a central fetch helper that is not used by those callers.

The build is healthy, but the project has structural/deployment risks:

- Express and FastAPI expose overlapping API responsibilities.
- [`docker-compose.yml`](../docker-compose.yml) references missing Dockerfiles and a missing `frontend/` directory.
- `npm run lint` is only `tsc --noEmit`; there is no ESLint or formatter configuration.
- There is no frontend test setup or root test script.
- Both `package-lock.json` and `bun.lock` exist while docs use npm.
- The local `.venv` points to a missing Python interpreter.

## 2. Verification baseline

| Check | Result |
|---|---|
| Git safety | Passed. Existing state committed as `8d76820`; branch created. |
| `npm install` | Not run: `npm` executable is unavailable in this environment. No dependency files changed. |
| Client production build | Passed with `node_modules/.bin/vite build`; 2,619 modules transformed. Existing warning: one chunk exceeds 500 kB. |
| Typecheck/lint | Passed with `node_modules/.bin/tsc --noEmit`; this is the current lint script. |
| Node dev server | Passed with `node_modules/.bin/tsx server.ts`; `/api/health` and `/` returned HTTP 200. |
| Python backend tests | Not run: `.venv/bin/python` is a broken symlink to `python3.13`. |
| Crop dataset | Passed structural check: 2,200 data rows, 8 fields per row, no malformed row shape. |

## 3. Project map

### Root/configuration

- [`package.json`](../package.json): npm metadata, Vite build scripts, Node/Express dev script, dependencies.
- [`package-lock.json`](../package-lock.json): npm lockfile; do not change without dependency approval.
- [`bun.lock`](../bun.lock): second package-manager lockfile; no Bun scripts are defined.
- [`vite.config.ts`](../vite.config.ts): React/Tailwind plugins, `@` alias, HMR/watch settings.
- [`tsconfig.json`](../tsconfig.json): TypeScript checking for TS, JS, and JSX with `allowJs`.
- [`index.html`](../index.html): Vite shell, metadata, fonts, Font Awesome CDN, React entrypoint.
- [`netlify.toml`](../netlify.toml): Netlify build/publish, Render proxy, SPA fallback, headers.
- [`render.yaml`](../render.yaml): Render Blueprint for the Python backend.
- [`docker-compose.yml`](../docker-compose.yml): intended backend/frontend/MongoDB topology; currently references missing build inputs.
- [`.gitignore`](../.gitignore), [`.env.example`](../.env.example), and [`backend/.env.example`](../backend/.env.example): ignore rules and environment templates.
- [`README.md`](../README.md), [`ARCHITECTURE.md`](../ARCHITECTURE.md), [`ML_PIPELINE.md`](../ML_PIPELINE.md), [`DEPLOYMENT_GUIDE.md`](../DEPLOYMENT_GUIDE.md), [`ROADMAP.md`](../ROADMAP.md): project documentation.

### Client

- [`src/main.jsx`](../src/main.jsx): React root, `StrictMode`, global stylesheet.
- [`src/App.jsx`](../src/App.jsx): providers, auth entry, tab-based shell, dashboard composition, feature views, modals, chatbot.
- [`src/context/`](../src/context): auth, farm, location, notification, and theme state.
- [`src/components/`](../src/components): feature views, dashboard sections, modals, advisor/crop/farm/soil/settings components, and legacy navigation.
- [`src/data/`](../src/data): static crop, weather, mandi, disease, soil, state/district, translation, and intelligence data.
- [`src/services/cropEngine.js`](../src/services/cropEngine.js): client crop recommendation engine.
- [`src/utils/`](../src/utils): API helper, calculations, intelligence, image mapping, and formatters.
- [`src/index.css`](../src/index.css): 2,317-line global stylesheet containing tokens, component styles, responsive rules, and repeated/overridden auth blocks.
- [`public/images/`](../public/images): crop, farm, hero, avatar, dashboard, and auth assets served unchanged by Vite.

### Node/Express server

- [`server.ts`](../server.ts): 4,614-line monolithic Express server. It owns auth, database, user/profile/settings, farm fields, dashboard, weather, market, advisor, reports, prediction, and ML routes. It mounts Vite in development and serves `dist/` in production.
- [`server_db.ts`](../server_db.ts): 956-line MongoDB adapter with in-memory fallback, demo seed data, sessions, audit logs, and repair logic.

### Python backend

- [`backend/app/main.py`](../backend/app/main.py): FastAPI entrypoint, CORS/security middleware, MongoDB lifespan, and dual `/api/v1` + `/api` router registration.
- [`backend/app/api/`](../backend/app/api): route modules for auth, users, dashboard, farms, fields, crops, soil, weather, market, advisor, reports, tasks, notifications, database, and ML.
- [`backend/app/services/`](../backend/app/services): service layer.
- [`backend/app/repositories/`](../backend/app/repositories): persistence access layer.
- [`backend/app/models/`](../backend/app/models) and [`backend/app/schemas/`](../backend/app/schemas): model and API schema definitions.
- [`backend/app/ml/`](../backend/app/ml): training, preprocessing, prediction/inference, explainability, agronomy, and model artifacts.
- [`backend/datasets/`](../backend/datasets): crop, yield, mandi, disease metadata, and generator files.
- [`backend/tests/`](../backend/tests): auth, prediction, and ML inference tests.

## 4. Duplicate and overlapping code/assets

### Navigation proof

| File | Direct-search result | Finding |
|---|---|---|
| [`src/components/navigation/TopNavbar.jsx`](../src/components/navigation/TopNavbar.jsx) | Imported/rendered by [`src/App.jsx`](../src/App.jsx) | Active canonical top navigation. |
| [`src/components/Navbar.jsx`](../src/components/Navbar.jsx) | Only wraps `TopNavbar`; no external consumer found | Unused compatibility wrapper candidate. |
| [`src/components/Topbar.jsx`](../src/components/Topbar.jsx) | Export only; no import/JSX consumer found | Legacy navigation candidate. |
| [`src/components/Sidebar.jsx`](../src/components/Sidebar.jsx) | Export only; no import/JSX consumer found | Legacy sidebar candidate; distinct from used `AdvisorSidebar`. |
| [`src/components/NavigationTabBar.jsx`](../src/components/NavigationTabBar.jsx) | Export only; no import/JSX consumer found | Legacy navigation candidate. |

The active app uses `TopNavbar`; the other four files must not be deleted until the final dynamic/string-reference check and approval.

### Unused/overlapping component candidates

Direct import/search found no external consumer for:

- [`src/components/DashboardView.jsx`](../src/components/DashboardView.jsx)
- [`src/components/Topbar.jsx`](../src/components/Topbar.jsx)
- [`src/components/NavigationTabBar.jsx`](../src/components/NavigationTabBar.jsx)
- [`src/components/sections/DrKrishiAISection.jsx`](../src/components/sections/DrKrishiAISection.jsx)
- [`src/components/sections/MandiPricesSection.jsx`](../src/components/sections/MandiPricesSection.jsx)
- [`src/components/sections/ProfitRiskSection.jsx`](../src/components/sections/ProfitRiskSection.jsx)
- [`src/components/sections/WeatherAdvisorySection.jsx`](../src/components/sections/WeatherAdvisorySection.jsx)
- [`src/components/settings/AuditLogsSection.jsx`](../src/components/settings/AuditLogsSection.jsx)
- [`src/components/settings/FarmEstateSection.jsx`](../src/components/settings/FarmEstateSection.jsx)
- [`src/components/settings/FinancialSchemesSection.jsx`](../src/components/settings/FinancialSchemesSection.jsx)
- [`src/components/settings/MongoDbSection.jsx`](../src/components/settings/MongoDbSection.jsx)
- [`src/components/settings/PreferencesSection.jsx`](../src/components/settings/PreferencesSection.jsx)
- [`src/components/settings/ProfileSection.jsx`](../src/components/settings/ProfileSection.jsx)
- [`src/components/settings/SecuritySection.jsx`](../src/components/settings/SecuritySection.jsx)

[`SettingsView.jsx`](../src/components/SettingsView.jsx) implements its panels inline and imports only `DeleteAccountModal` from the settings folder. Also, [`FarmOperationsTelemetrySection.jsx`](../src/components/sections/FarmOperationsTelemetrySection.jsx), [`NewsSchemesSection.jsx`](../src/components/sections/NewsSchemesSection.jsx), and [`ReportsSection.jsx`](../src/components/sections/ReportsSection.jsx) are imported into `App.jsx` but not rendered.

### Data/API overlap

- The crop-image mapping has one canonical utility at [`src/utils/cropImages.js`](../src/utils/cropImages.js); the old duplicate module is absent in the baseline.
- [`src/services/cropEngine.js`](../src/services/cropEngine.js) is a client engine; Python `prediction` and `inference` engines are server contracts. They overlap by domain but are not safe duplicates.
- [`server.ts`](../server.ts) and [`backend/app/main.py`](../backend/app/main.py) both implement overlapping REST domains with different runtimes, schemas, and persistence paths.
- [`src/data/translations.js`](../src/data/translations.js) is connected only to the unused `NavigationTabBar` by direct search.
- Direct fetch calls are scattered across contexts, views, and modals. [`src/utils/apiConfig.js`](../src/utils/apiConfig.js) exports `apiFetch` but has no current caller.

### Image status

The current public image inventory has no exact duplicate binaries after the baseline cleanup. Remaining variants appear intentionally named/different. [`AI-Farming-Signup-Workspace.png`](../public/images/AI-Farming-Signup-Workspace.png) is a reference image; [`login-signup-bg.png`](../public/images/login-signup-bg.png) is the interactive auth background used by [`UserSwitcherModal.jsx`](../src/components/settings/UserSwitcherModal.jsx).

## 5. Dead code, unused imports, dependencies, and CSS

### Candidates

- The navigation/settings/section candidates above have no direct consumer.
- [`DashboardView.jsx`](../src/components/DashboardView.jsx) has its own dashboard/weather fetch logic but is not imported by `App.jsx`, which renders sections directly.
- [`src/utils/apiConfig.js`](../src/utils/apiConfig.js) has no consumer.
- [`src/types.js`](../src/types.js) has no current direct consumer found.
- [`src/data/mandiData.js`](../src/data/mandiData.js) has no current direct consumer found.

These are candidates only. Dynamic imports, tooling, or future deployment scripts must be checked before removal.

### Console logging

There are many `console.warn`, `console.error`, and `console.log` calls across the server, database adapter, contexts, and feature views. Most are operational fallback/error logs, not dead code. Replacing them with an environment-aware logger would be a behavior/configuration change and is outside a structure-only refactor.

### Dependencies/tooling

All declared runtime packages have at least one direct textual usage except `motion`, which needs a package-aware import scan before any removal proposal. The repository has no ESLint, Prettier, Vitest, Jest, or Playwright configuration. The current `lint` script is only `tsc --noEmit`.

## 6. Bugs and risks

### Confirmed structural/deployment risks

1. [`docker-compose.yml`](../docker-compose.yml) expects missing `backend/Dockerfile`, missing `frontend/Dockerfile`, and missing `frontend/` directory. Docker deployment cannot work as written.
2. Express and FastAPI are both present. [`render.yaml`](../render.yaml) deploys FastAPI while local `npm run dev` starts Express, creating possible endpoint/schema drift.
3. [`src/utils/apiConfig.js`](../src/utils/apiConfig.js) supports `VITE_API_BASE_URL`, but most feature code calls relative `/api/...` URLs directly. Netlify routing currently masks this; direct frontend-to-Render deployment would not consistently use the configured base URL.
4. There is no real lint/test gate for the frontend. Python tests are not wired to a root command.
5. `package-lock.json` and `bun.lock` create package-manager ambiguity; docs/scripts use npm.
6. `.venv/bin/python` is a broken symlink to `python3.13`, preventing reliable local Python tests.

### Security/configuration risks

1. [`backend/app/config/settings.py`](../backend/app/config/settings.py) contains a fallback JWT secret; [`docker-compose.yml`](../docker-compose.yml) also contains a development JWT secret. Production should fail closed when a real secret is absent.
2. [`render.yaml`](../render.yaml) includes `*` in `ALLOWED_ORIGINS`; FastAPI then enables wildcard CORS behavior.
3. [`server.ts`](../server.ts) hardcodes port 3000 while FastAPI uses environment-driven `PORT`.
4. [`server_db.ts`](../server_db.ts) seeds a demo user and root `server.ts` returns demo/static tokens. This may be intentional demo behavior but is not a production auth boundary.
5. [`index.html`](../index.html) loads Google Fonts and Font Awesome from external CDNs.

### API/hook/import risks

- Several direct fetches parse JSON without checking `response.ok`, for example dashboard and diagnosis flows.
- Long-running weather/AI requests are not uniformly cancelled on component unmount.
- The client uses persisted tab state rather than a formal router. Any move to `src/pages` must preserve tab aliases and stored values.
- The build passed and the image-reference scan found no missing `/images/...` asset. Extensionless imports still deserve Linux case-sensitive validation after moves.

## 7. Mixed JS/TS recommendation

The client is mostly JSX/JS, root Node/Vite files are TypeScript, and the deployable backend is Python. `tsconfig.json` enables `allowJs`.

Recommended approach:

1. Keep client JSX/JS behavior unchanged during initial structure moves.
2. Keep TypeScript at the Node server boundary and add types only around moved API contracts.
3. Keep FastAPI as a separate backend boundary until API ownership is explicitly decided.
4. Add lint/format/test tooling before large moves.

## 8. Missing essentials

Present: `.gitignore`, root/backend `.env.example`, README and architecture/deployment docs, Python tests, Vite/TypeScript config, Netlify config, and Render config.

Missing/incomplete: ESLint config, Prettier config, root test script, frontend test framework, one documented local backend path, Dockerfiles matching Compose, an API ownership decision, and CI for install/build/typecheck/lint/tests.

## 9. Phase 2 approval questions

1. Should the canonical deployed API be FastAPI, Express, or a deliberate hybrid with route ownership documented?
2. Should proven-unused legacy files be deleted, or moved to an archive/legacy folder?
3. Should npm be the only supported package manager, allowing `bun.lock` removal, or should Bun remain supported?
4. Should Docker support be repaired by adding Dockerfiles, or should stale Compose configuration be removed from the supported workflow?
5. May lint/format/test tooling be added as dev dependencies? This would require an approved dependency and lockfile change.

## 10. Conclusion

The project builds and the Node development server responds correctly at baseline. Phase 2 should produce a target structure and explicit deletion/move table. No Phase 3 move or deletion should begin until that plan is approved.
