# 🧠 BRAIN.md — StadiumGenius Complete Project Map & AI Guide

> **Target Audience**: AI Agents (Claude, Gemini, GPT, Cursor, Copilot) & Developers.  
> **Goal**: Simple 1-line explanation of **EVERY single file and folder** in the project so any agent or developer understands what each file does instantly.  
> **Language**: English  
> **Last Updated**: 2026-07-26  

---

## ⚡ QUICK OVERVIEW

- **Project**: StadiumGenius (AI-Powered Smart Stadium Operations Platform for FIFA World Cup 2026)
- **Frontend**: React 19 + Vite 8 + Tailwind CSS v4 ([src/](file:///c:/Users/ABHI%20SHARMA/OneDrive/Desktop/projects/Smart-Stadiums-Tournament/src/))
- **Primary Backend (Port 8000)**: Python FastAPI ([server/app/](file:///c:/Users/ABHI%20SHARMA/OneDrive/Desktop/projects/Smart-Stadiums-Tournament/server/app/))
- **Demo Backend (Port 5000)**: Express.js ([server/index.js](file:///c:/Users/ABHI%20SHARMA/OneDrive/Desktop/projects/Smart-Stadiums-Tournament/server/index.js))
- **Database**: SQLite 3 (`stadiumgenius.db`)

---

## 📁 1. ROOT DIRECTORY (Configuration & Scripts)

| File / Folder | Simple 1-Line Explanation |
|---------------|---------------------------|
| [package.json](file:///c:/Users/ABHI%20SHARMA/OneDrive/Desktop/projects/Smart-Stadiums-Tournament/package.json) | Frontend Node.js dependencies, scripts (`dev`, `build`, `test`), and test runners |
| [vite.config.js](file:///c:/Users/ABHI%20SHARMA/OneDrive/Desktop/projects/Smart-Stadiums-Tournament/vite.config.js) | Vite bundler config with PWA plugin & Tailwind v4 support |
| [vitest.config.js](file:///c:/Users/ABHI%20SHARMA/OneDrive/Desktop/projects/Smart-Stadiums-Tournament/vitest.config.js) | Unit test configuration (Vitest runner with jsdom browser environment) |
| [playwright.config.js](file:///c:/Users/ABHI%20SHARMA/OneDrive/Desktop/projects/Smart-Stadiums-Tournament/playwright.config.js) | End-to-End (E2E) browser testing setup for Playwright |
| [.oxlintrc.json](file:///c:/Users/ABHI%20SHARMA/OneDrive/Desktop/projects/Smart-Stadiums-Tournament/.oxlintrc.json) | Code linter rules for fast OxLint checks |
| [.env](file:///c:/Users/ABHI%20SHARMA/OneDrive/Desktop/projects/Smart-Stadiums-Tournament/.env) / [.env.example](file:///c:/Users/ABHI%20SHARMA/OneDrive/Desktop/projects/Smart-Stadiums-Tournament/.env.example) | Frontend environment variables (Auth0 domain, Client ID, API URLs) |
| [requirements.txt](file:///c:/Users/ABHI%20SHARMA/OneDrive/Desktop/projects/Smart-Stadiums-Tournament/requirements.txt) | Python dependencies for FastAPI, SQLAlchemy, PyJWT, & Pytest |
| [Dockerfile](file:///c:/Users/ABHI%20SHARMA/OneDrive/Desktop/projects/Smart-Stadiums-Tournament/Dockerfile) | Production multi-stage Docker build file (Node frontend → Python backend) |
| [docker-compose.yml](file:///c:/Users/ABHI%20SHARMA/OneDrive/Desktop/projects/Smart-Stadiums-Tournament/docker-compose.yml) | Orchestrates FastAPI backend, Express server, and Nginx reverse proxy containers |
| [index.html](file:///c:/Users/ABHI%20SHARMA/OneDrive/Desktop/projects/Smart-Stadiums-Tournament/index.html) | Single-page web application (SPA) main HTML entry file |
| `stadiumgenius.db` | Local SQLite database containing seeded users, venues, alerts, & incidents |
| [README.md](file:///c:/Users/ABHI%20SHARMA/OneDrive/Desktop/projects/Smart-Stadiums-Tournament/README.md) | Main user-facing project documentation and quick-start guide |
| [BRAIN.md](file:///c:/Users/ABHI%20SHARMA/OneDrive/Desktop/projects/Smart-Stadiums-Tournament/BRAIN.md) | **THIS FILE** — Complete system blueprint & file guide for AI Agents |
| [PROJECT_CODE_EXPLANATION.md](file:///c:/Users/ABHI%20SHARMA/OneDrive/Desktop/projects/Smart-Stadiums-Tournament/PROJECT_CODE_EXPLANATION.md) | Detailed technical breakdown of code architecture and data flows |
| [extreme_audit_report.md](file:///c:/Users/ABHI%20SHARMA/OneDrive/Desktop/projects/Smart-Stadiums-Tournament/extreme_audit_report.md) | Complete security vulnerability assessment report |
| [implementation_plan.md](file:///c:/Users/ABHI%20SHARMA/OneDrive/Desktop/projects/Smart-Stadiums-Tournament/implementation_plan.md) | Implementation blueprint & active feature development plan |

### 🛠️ Root Utility & Test Verification Scripts
- [create_auth0_users.mjs](file:///c:/Users/ABHI%20SHARMA/OneDrive/Desktop/projects/Smart-Stadiums-Tournament/create_auth0_users.mjs) — Script to create Auth0 test user accounts via Auth0 Management API.
- [test_all_roles.mjs](file:///c:/Users/ABHI%20SHARMA/OneDrive/Desktop/projects/Smart-Stadiums-Tournament/test_all_roles.mjs) — Automated test script verifying role-based access across all 4 roles.
- [test_auth0_fastapi_e2e.py](file:///c:/Users/ABHI%20SHARMA/OneDrive/Desktop/projects/Smart-Stadiums-Tournament/test_auth0_fastapi_e2e.py) — E2E test verifying Auth0 JWT authentication with FastAPI backend.
- [verify_all_flows.js](file:///c:/Users/ABHI%20SHARMA/OneDrive/Desktop/projects/Smart-Stadiums-Tournament/verify_all_flows.js) — Master script verifying all user flows, navigation, & API endpoints.
- [verify_login_phase.js](file:///c:/Users/ABHI%20SHARMA/OneDrive/Desktop/projects/Smart-Stadiums-Tournament/verify_login_phase.js) — Verifies authentication login cycle, session storage, and JWT token handling.
- [verify_roles.js](file:///c:/Users/ABHI%20SHARMA/OneDrive/Desktop/projects/Smart-Stadiums-Tournament/verify_roles.js) — Verifies local role permissions and route access rules.
- [verify_roles_auth0.js](file:///c:/Users/ABHI%20SHARMA/OneDrive/Desktop/projects/Smart-Stadiums-Tournament/verify_roles_auth0.js) — Verifies role synchronization between Auth0 cloud & local system.

---

## 💻 2. FRONTEND SOURCE DIRECTORY (`src/`)

### Core Bootstrap Files
| File | Simple 1-Line Explanation |
|------|---------------------------|
| [src/main.jsx](file:///c:/Users/ABHI%20SHARMA/OneDrive/Desktop/projects/Smart-Stadiums-Tournament/src/main.jsx) | Entry point — initializes Auth0Provider, React Router, & renders App |
| [src/App.jsx](file:///c:/Users/ABHI%20SHARMA/OneDrive/Desktop/projects/Smart-Stadiums-Tournament/src/App.jsx) | Defines all routes, layout structure, & RBAC route security wrappers |
| [src/index.css](file:///c:/Users/ABHI%20SHARMA/OneDrive/Desktop/projects/Smart-Stadiums-Tournament/src/index.css) | Global Tailwind v4 styles, dark theme tokens, & custom utility classes |
| [src/setupTests.jsx](file:///c:/Users/ABHI%20SHARMA/OneDrive/Desktop/projects/Smart-Stadiums-Tournament/src/setupTests.jsx) | Vitest test setup (mocks Auth0, browser APIs like IntersectionObserver) |

---

### 📂 `src/context/` (React Context Providers)
- [AuthContext.jsx](file:///c:/Users/ABHI%20SHARMA/OneDrive/Desktop/projects/Smart-Stadiums-Tournament/src/context/AuthContext.jsx) — Manages user login/logout, JWT tokens, RBAC roles, sidebar state, & active venue.
- [NotificationContext.jsx](file:///c:/Users/ABHI%20SHARMA/OneDrive/Desktop/projects/Smart-Stadiums-Tournament/src/context/NotificationContext.jsx) — Handles real-time SSE alerts from backend and manages toast notifications.

---

### 📂 `src/lib/` (Client Helper Libraries)
- [api.js](file:///c:/Users/ABHI%20SHARMA/OneDrive/Desktop/projects/Smart-Stadiums-Tournament/src/lib/api.js) — Central API client singleton (handles HTTP requests, JWT headers, auto-retry, & errors).

---

### 📂 `src/data/` (Mock Data & Constants)
- [mockData.js](file:///c:/Users/ABHI%20SHARMA/OneDrive/Desktop/projects/Smart-Stadiums-Tournament/src/data/mockData.js) — Seed data for 7 FIFA World Cup stadiums, crowd heatmaps, alerts, & incident logs.

---

### 📂 `src/components/` (Reusable UI Components)
| File | Simple 1-Line Explanation |
|------|---------------------------|
| [Sidebar.jsx](file:///c:/Users/ABHI%20SHARMA/OneDrive/Desktop/projects/Smart-Stadiums-Tournament/src/components/Sidebar.jsx) | Left navigation sidebar with role-filtered menu items & collapse button |
| [TopBar.jsx](file:///c:/Users/ABHI%20SHARMA/OneDrive/Desktop/projects/Smart-Stadiums-Tournament/src/components/TopBar.jsx) | Top navigation header with venue selector dropdown, search bar, & profile button |
| [ProtectedRoute.jsx](file:///c:/Users/ABHI%20SHARMA/OneDrive/Desktop/projects/Smart-Stadiums-Tournament/src/components/ProtectedRoute.jsx) | Route wrapper that redirects unauthenticated users to `/login` |
| [RoleGuard.jsx](file:///c:/Users/ABHI%20SHARMA/OneDrive/Desktop/projects/Smart-Stadiums-Tournament/src/components/RoleGuard.jsx) | Security guard that blocks page access if user role is not authorized |
| [PermissionGuard.jsx](file:///c:/Users/ABHI%20SHARMA/OneDrive/Desktop/projects/Smart-Stadiums-Tournament/src/components/PermissionGuard.jsx) | UI element guard that conditionally renders buttons based on specific permissions |
| [ErrorBoundary.jsx](file:///c:/Users/ABHI%20SHARMA/OneDrive/Desktop/projects/Smart-Stadiums-Tournament/src/components/ErrorBoundary.jsx) | React error boundary that catches component crashes and shows a fallback UI |
| [ScrollToTop.jsx](file:///c:/Users/ABHI%20SHARMA/OneDrive/Desktop/projects/Smart-Stadiums-Tournament/src/components/ScrollToTop.jsx) | Auto-scrolls page to top whenever URL route changes |
| [PWAInstallBanner.jsx](file:///c:/Users/ABHI%20SHARMA/OneDrive/Desktop/projects/Smart-Stadiums-Tournament/src/components/PWAInstallBanner.jsx) | Prompts user to install StadiumGenius as a Progressive Web App (PWA) |
| [NotificationPanel.jsx](file:///c:/Users/ABHI%20SHARMA/OneDrive/Desktop/projects/Smart-Stadiums-Tournament/src/components/NotificationPanel.jsx) | Dropdown panel showing real-time alert feed history |
| [NotificationToast.jsx](file:///c:/Users/ABHI%20SHARMA/OneDrive/Desktop/projects/Smart-Stadiums-Tournament/src/components/NotificationToast.jsx) | Pop-up toast alert overlay for instant security/crowd warnings |
| [UserProfilePopup.jsx](file:///c:/Users/ABHI%20SHARMA/OneDrive/Desktop/projects/Smart-Stadiums-Tournament/src/components/UserProfilePopup.jsx) | Modal dialog displaying logged-in user profile & role information |
| [AlertCard.jsx](file:///c:/Users/ABHI%20SHARMA/OneDrive/Desktop/projects/Smart-Stadiums-Tournament/src/components/AlertCard.jsx) | Card widget displaying alert details (severity, zone, time) |
| [StatCard.jsx](file:///c:/Users/ABHI%20SHARMA/OneDrive/Desktop/projects/Smart-Stadiums-Tournament/src/components/StatCard.jsx) | Key metric card displaying stadium KPIs (capacity, incidents, gate flow) |
| [StadiumBackdrop.jsx](file:///c:/Users/ABHI%20SHARMA/OneDrive/Desktop/projects/Smart-Stadiums-Tournament/src/components/StadiumBackdrop.jsx) | Animated background graphics for dark stadium theme |
| [StadiumHeatmap.jsx](file:///c:/Users/ABHI%20SHARMA/OneDrive/Desktop/projects/Smart-Stadiums-Tournament/src/components/StadiumHeatmap.jsx) | Visual heatmap widget showing crowd density across stadium sectors |
| `src/components/skeleton/` | Contains UI skeleton loading state placeholders (`Skeleton.jsx`, `ChartSkeleton.jsx`, `page-skeletons.jsx`) |

---

### 📂 `src/pages/` (Feature Views — Lazy Loaded)
| Page | Simple 1-Line Explanation |
|------|---------------------------|
| [Dashboard.jsx](file:///c:/Users/ABHI%20SHARMA/OneDrive/Desktop/projects/Smart-Stadiums-Tournament/src/pages/Dashboard.jsx) | Main command center dashboard with live KPIs, crowd charts, and real-time alert feed |
| [DigitalTwin.jsx](file:///c:/Users/ABHI%20SHARMA/OneDrive/Desktop/projects/Smart-Stadiums-Tournament/src/pages/DigitalTwin.jsx) | Interactive 2D/3D digital twin visualization of stadium zones and gate throughput |
| [CrowdManagement.jsx](file:///c:/Users/ABHI%20SHARMA/OneDrive/Desktop/projects/Smart-Stadiums-Tournament/src/pages/CrowdManagement.jsx) | Real-time crowd density tracking, sector capacity meters, and corridor redirection controls |
| [Security.jsx](file:///c:/Users/ABHI%20SHARMA/OneDrive/Desktop/projects/Smart-Stadiums-Tournament/src/pages/Security.jsx) | Incident ticket management, patrol allocations, and live CCTV grid views |
| [Concessions.jsx](file:///c:/Users/ABHI%20SHARMA/OneDrive/Desktop/projects/Smart-Stadiums-Tournament/src/pages/Concessions.jsx) | Food & beverage outlet queue monitoring, wait time tracking, and express lane activation |
| [AIAssistant.jsx](file:///c:/Users/ABHI%20SHARMA/OneDrive/Desktop/projects/Smart-Stadiums-Tournament/src/pages/AIAssistant.jsx) | Conversational AI chatbot for natural-language operational queries |
| [Broadcast.jsx](file:///c:/Users/ABHI%20SHARMA/OneDrive/Desktop/projects/Smart-Stadiums-Tournament/src/pages/Broadcast.jsx) | Venue-wide public announcement (PA), mobile app, and screen broadcast creation manager |
| [Analytics.jsx](file:///c:/Users/ABHI%20SHARMA/OneDrive/Desktop/projects/Smart-Stadiums-Tournament/src/pages/Analytics.jsx) | High-level operations reporting, historical trends, and manager metrics |
| [AdminPanel.jsx](file:///c:/Users/ABHI%20SHARMA/OneDrive/Desktop/projects/Smart-Stadiums-Tournament/src/pages/AdminPanel.jsx) | System admin view for managing user roles, permissions, audit logs, & AI settings |
| [Settings.jsx](file:///c:/Users/ABHI%20SHARMA/OneDrive/Desktop/projects/Smart-Stadiums-Tournament/src/pages/Settings.jsx) | User profile, notification preferences, and system preferences configuration |
| [FanPortal.jsx](file:///c:/Users/ABHI%20SHARMA/OneDrive/Desktop/projects/Smart-Stadiums-Tournament/src/pages/FanPortal.jsx) | Public fan portal for match schedules, stadium maps, and concessions (no login needed) |
| [Login.jsx](file:///c:/Users/ABHI%20SHARMA/OneDrive/Desktop/projects/Smart-Stadiums-Tournament/src/pages/Login.jsx) | User login page supporting Auth0 SSO redirect and local email/password login |
| [Register.jsx](file:///c:/Users/ABHI%20SHARMA/OneDrive/Desktop/projects/Smart-Stadiums-Tournament/src/pages/Register.jsx) | Account registration form for new users |
| [NotFound.jsx](file:///c:/Users/ABHI%20SHARMA/OneDrive/Desktop/projects/Smart-Stadiums-Tournament/src/pages/NotFound.jsx) | 404 page for invalid route URLs |

---

### 📂 `src/__tests__/` (Frontend Unit Tests)
- `AuthContext.test.jsx` — Tests authentication context state, login, and logout.
- `Login.test.jsx` — Tests Login page rendering and form validation.
- `Register.test.jsx` — Tests Registration page user signup flow.
- `ErrorBoundary.test.jsx` — Tests React error boundary fallback rendering.
- `Accessibility.test.jsx` — Tests accessibility standards (aria-labels, keyboard navigation).

---

## ⚙️ 3. BACKEND DIRECTORY (`server/`)

### Root Server Files
- [server/index.js](file:///c:/Users/ABHI%20SHARMA/OneDrive/Desktop/projects/Smart-Stadiums-Tournament/server/index.js) — Express.js server entry point (Port 5000), runs REST routes & SSE stream.
- [server/run_server.py](file:///c:/Users/ABHI%20SHARMA/OneDrive/Desktop/projects/Smart-Stadiums-Tournament/server/run_server.py) — Python launcher script that starts the FastAPI Uvicorn server (Port 8000).
- [server/package.json](file:///c:/Users/ABHI%20SHARMA/OneDrive/Desktop/projects/Smart-Stadiums-Tournament/server/package.json) — Express server dependencies (`express`, `bcryptjs`, `jsonwebtoken`, `cors`).

---

### 📂 `server/db/` (Express SQLite Setup)
- [server/db/database.js](file:///c:/Users/ABHI%20SHARMA/OneDrive/Desktop/projects/Smart-Stadiums-Tournament/server/db/database.js) — Initializes `node:sqlite` connection, creates database tables, and seeds initial data.
- `server/db/stadiumgenius.db` — SQLite database file accessed by Express server.

---

### 📂 `server/routes/` (Express API Routers — Port 5000)
- `auth.js` — User register, login, Auth0 sync, and current user endpoints (`/api/auth`).
- `venues.js` — Stadium venue and sector information endpoints (`/api/venues`).
- `incidents.js` — Incident creation, tracking, and priority update endpoints (`/api/incidents`).
- `analytics.js` — Operations overview and analytics data endpoints (`/api/analytics`).
- `broadcast.js` — PA and mobile alert message endpoints (`/api/broadcast`).
- `ai.js` — AI assistant query endpoints (`/api/ai`).
- `users.js` — User profile and account management endpoints (`/api/users`).
- `notifications.js` — Real-time Server-Sent Events (SSE) notification stream (`/api/notifications/stream`).

---

### 📂 `server/app/` (FastAPI Production Backend — Port 8000)

| Subfolder / File | Simple 1-Line Explanation |
|------------------|---------------------------|
| [server/app/main.py](file:///c:/Users/ABHI%20SHARMA/OneDrive/Desktop/projects/Smart-Stadiums-Tournament/server/app/main.py) | FastAPI app factory, CORS policy, security middleware, and router registration |
| [server/app/config.py](file:///c:/Users/ABHI%20SHARMA/OneDrive/Desktop/projects/Smart-Stadiums-Tournament/server/app/config.py) | Application settings loader using Pydantic Settings & environment variables |
| `server/app/core/auth0.py` | Auth0 RS256 JWT validator via JWKS & RBAC permission mapping matrix |
| `server/app/core/security.py` | FastAPI user dependency injection (`get_current_user`, `require_role`, audit logger) |
| [server/app/db/database.py](file:///c:/Users/ABHI%20SHARMA/OneDrive/Desktop/projects/Smart-Stadiums-Tournament/server/app/db/database.py) | SQLAlchemy database engine, SessionLocal generator, & `get_db` dependency |
| [server/app/db/models.py](file:///c:/Users/ABHI%20SHARMA/OneDrive/Desktop/projects/Smart-Stadiums-Tournament/server/app/db/models.py) | All SQLAlchemy ORM models (`UserModel`, `IncidentModel`, `VenueModel`, `AuditLogModel`) |
| `server/app/schemas/user.py` | Pydantic data validation schemas for user requests and responses |
| `server/app/middleware/security_headers.py` | Security headers middleware (CSP, HSTS, X-Frame-Options: DENY) |
| `server/app/middleware/rate_limit.py` | Rate-limiting middleware enforcing 120 req/min limit per client IP |
| `server/app/middleware/csrf.py` | Double-submit cookie Anti-CSRF token verification middleware |
| **`server/app/api/v1/endpoints/`** | Version 1 REST API routers: |
| ├── `auth.py` | Auth0 user sync, CSRF token, & profile endpoints (`/api/v1/auth`) |
| ├── `admin.py` | User role updates, system configs, & audit logs (`/api/v1/admin`) |
| ├── `manager.py` | Manager dashboard summary & staff assignment endpoints (`/api/v1/manager`) |
| ├── `operator.py` | Crowd analytics, incident CRUD, & AI assistant endpoints (`/api/v1/operator`) |
| └── `security.py` | Security dashboard, CCTV camera status, & alert verification (`/api/v1/security`) |

---

### 📂 `server/tests/` (Python Backend Tests)
- `conftest.py` — Pytest configuration, test database setup, and HTTP client fixtures.
- `test_auth_rbac.py` — Pytest test suite testing RBAC role permissions and token validation.

---

## 📖 4. DOCUMENTATION DIRECTORY (`docs/`)

- [docs/architecture.md](file:///c:/Users/ABHI%20SHARMA/OneDrive/Desktop/projects/Smart-Stadiums-Tournament/docs/architecture.md) — High-level system architecture and component interactions.
- [docs/api.md](file:///c:/Users/ABHI%20SHARMA/OneDrive/Desktop/projects/Smart-Stadiums-Tournament/docs/api.md) — API endpoint documentation and request/response examples.
- [docs/database-schema.md](file:///c:/Users/ABHI%20SHARMA/OneDrive/Desktop/projects/Smart-Stadiums-Tournament/docs/database-schema.md) — Database schema, table relationships, and field descriptions.
- [docs/data-flow.md](file:///c:/Users/ABHI%20SHARMA/OneDrive/Desktop/projects/Smart-Stadiums-Tournament/docs/data-flow.md) — Data flow diagrams from frontend client to backend & database.
- [docs/security.md](file:///c:/Users/ABHI%20SHARMA/OneDrive/Desktop/projects/Smart-Stadiums-Tournament/docs/security.md) — Security mechanisms (Auth0, JWT, CSRF, RBAC, Rate Limiting).
- [docs/deployment.md](file:///c:/Users/ABHI%20SHARMA/OneDrive/Desktop/projects/Smart-Stadiums-Tournament/docs/deployment.md) — Docker build & production deployment instructions.
- [docs/testing.md](file:///c:/Users/ABHI%20SHARMA/OneDrive/Desktop/projects/Smart-Stadiums-Tournament/docs/testing.md) — Testing guide (Unit, Integration, E2E, & Pytest).
- [docs/ai-workflows.md](file:///c:/Users/ABHI%20SHARMA/OneDrive/Desktop/projects/Smart-Stadiums-Tournament/docs/ai-workflows.md) — AI assistant design, prompt engineering, and operational query rules.
- [docs/mvp-roadmap.md](file:///c:/Users/ABHI%20SHARMA/OneDrive/Desktop/projects/Smart-Stadiums-Tournament/docs/mvp-roadmap.md) — MVP milestone roadmap and future feature goals.
- [docs/AUDIT_REPORT.md](file:///c:/Users/ABHI%20SHARMA/OneDrive/Desktop/projects/Smart-Stadiums-Tournament/docs/AUDIT_REPORT.md) — Detailed security audit report and resolution history.
- [docs/SYSTEM_GUIDE.md](file:///c:/Users/ABHI%20SHARMA/OneDrive/Desktop/projects/Smart-Stadiums-Tournament/docs/SYSTEM_GUIDE.md) — Complete system setup, startup commands, and operational guide.
- [docs/user-stories.md](file:///c:/Users/ABHI%20SHARMA/OneDrive/Desktop/projects/Smart-Stadiums-Tournament/docs/user-stories.md) — User personas and story requirements for Admin, Manager, Operator, Security.

---

## 🧪 5. AUTOMATED E2E TESTS DIRECTORY (`e2e/`)

- [e2e/auth.spec.js](file:///c:/Users/ABHI%20SHARMA/OneDrive/Desktop/projects/Smart-Stadiums-Tournament/e2e/auth.spec.js) — Playwright E2E test verifying user login, registration, and logout flows.
- [e2e/performance.spec.js](file:///c:/Users/ABHI%20SHARMA/OneDrive/Desktop/projects/Smart-Stadiums-Tournament/e2e/performance.spec.js) — Playwright E2E test measuring page load speed and Core Web Vitals.
