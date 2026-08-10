# 🛠️ Implementation Plan: Production-Level Error & Security Remediation

Address all 24 production-level issues identified in the audit report across database persistence, Docker builds, container orchestration, security headers, rate limiting, test suites, and linter warnings.

## User Review Required

> [!IMPORTANT]
> **Primary Backend Architecture Alignment**:
> The project currently contains two backend implementations:
> 1. **Python FastAPI** (`server/app/main.py`) running on port 8000.
> 2. **Node.js Express** (`server/index.js`) running on port 5000.
>
> We will configure both backends for full production stability:
> - **FastAPI**: Add missing `requirements.txt` with `psycopg2-binary` and SQLAlchemy dependencies.
> - **Node Express**: Update `server/db/database.js` to provide an in-memory/fallback database adapter so all Express routes (`/api/auth`, `/api/incidents`, `/api/venues`, `/api/users`) operate reliably without throwing 500 exceptions.

---

## Proposed Changes

### 1. Database & Persistence Layer

#### [NEW] [requirements.txt](file:///c:/Extra/projects/Smart-Stadiums-Tournament/requirements.txt)
- Create `requirements.txt` at the root directory containing all Python dependencies required by FastAPI, SQLAlchemy, PostgreSQL, and Pytest (`fastapi`, `uvicorn`, `sqlalchemy`, `psycopg2-binary`, `pydantic-settings`, `python-jose`, `passlib`, `pytest`, `httpx`).

#### [MODIFY] [database.js](file:///c:/Extra/projects/Smart-Stadiums-Tournament/server/db/database.js)
- Replace throwing stub with an in-memory SQLite / mock store database client using `better-sqlite3` or standard JS Map storage so `db.prepare(...).get()`, `.all()`, and `.run()` succeed safely for local/Express operation.

#### [MODIFY] [schema.prisma](file:///c:/Extra/projects/Smart-Stadiums-Tournament/prisma/schema.prisma)
- Update `schema.prisma` with basic models (`User`, `Venue`, `Incident`) and environment-driven `datasource db` configuration.

---

### 2. Docker & Container Infrastructure

#### [NEW] [Dockerfile.node](file:///c:/Extra/projects/Smart-Stadiums-Tournament/server/Dockerfile.node)
- Create `Dockerfile.node` inside `server/` to build and serve the Node Express backend service specified in `docker-compose.yml`.

#### [NEW] [default.conf](file:///c:/Extra/projects/Smart-Stadiums-Tournament/nginx/default.conf)
- Create `nginx/default.conf` to configure Nginx reverse proxy routes for `/api/v1` (FastAPI), `/api` (Express), and root static frontend assets.

#### [MODIFY] [docker-compose.yml](file:///c:/Extra/projects/Smart-Stadiums-Tournament/docker-compose.yml)
- Update `docker-compose.yml` health check strings and volume references for consistency.

---

### 3. Security, CORS & Rate Limiting Hardening

#### [MODIFY] [index.js](file:///c:/Extra/projects/Smart-Stadiums-Tournament/server/index.js)
- Add `app.set('trust proxy', 1);` to ensure IP rate limiting works correctly behind Nginx / cloud load balancers without blocking all users.
- Update `Content-Security-Policy` header to include `connect-src 'self' https://*.auth0.com https://*.supabase.co; img-src 'self' data: https:; font-src 'self' https: data:;`.
- Enhance CORS middleware to support dynamic origins from environment variables (`CORS_ORIGINS`).

---

### 4. Test Suite & CI Quality Fixes

#### [MODIFY] [api.test.js](file:///c:/Extra/projects/Smart-Stadiums-Tournament/server/__tests__/api.test.js)
- Update test cases to match active Auth0 endpoints (`/api/auth/auth0-login`, `/api/auth/sync`, `/api/auth/me`) and verify status 200 responses with the updated DB layer.

#### [MODIFY] Source files with linter warnings
- Clean up unused imports and variables in `AuthContext.jsx`, `NotificationContext.jsx`, `AuthThemeToggle.jsx`, `CrowdManagement.jsx`, `AdminPanel.jsx`, and `DigitalTwin.jsx`.

---

## Verification Plan

### Automated Tests
- Run Vite build check: `npm run build`
- Run Oxlint linter: `npm run lint`
- Run Vitest unit & integration tests: `npm run test`
- Run Pytest backend test suite: `$env:PYTHONPATH="."; python -m pytest`

### Manual Verification
- Test Docker image build capability: `docker build -t stadiumgenius:latest .`
- Verify API health endpoints on both ports 5000 (`/api/health`) and 8000 (`/health`).
