# 🧠 BRAIN.md — StadiumGenius Project Intelligence File

> **Purpose**: Yeh file kisi bhi AI agent (Copilot, Gemini, Claude, GPT, Cursor, etc.) ko poora project samajhne mein madad karti hai — bina har file ko scan kiye. Isko padho, samjho, aur directly kaam shuru karo.

> **Last Updated**: 2026-07-22
> **Owner**: Abhi Sharma

---

## 📌 PROJECT IDENTITY

| Key | Value |
|-----|-------|
| **Project Name** | StadiumGenius |
| **Tagline** | AI-Powered Smart Stadium Operations Platform |
| **Domain** | FIFA World Cup 2026 — Stadium Operations & Crowd Management |
| **Repo** | `Smart-Stadiums-Tournament` |
| **License** | MIT |
| **Version** | 1.0.0 |

---

## 🏗️ HIGH-LEVEL ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────────┐
│                        BROWSER (Client)                         │
│  React 19 + Vite 8 + Tailwind CSS v4 + Framer Motion           │
│  Auth0 SDK + React Router v7 + Recharts + Lucide Icons          │
│  PWA (Service Worker via vite-plugin-pwa)                       │
└──────────────────┬──────────────────────┬───────────────────────┘
                   │ REST API (JSON)      │ SSE (Server-Sent Events)
                   ▼                      ▼
┌──────────────────────────────┐  ┌───────────────────────────────┐
│  🐍 FastAPI Backend (PRIMARY)│  │  📦 Express.js Backend (LEGACY│
│  Port: 8000                  │  │  /DEMO) Port: 5000            │
│  SQLAlchemy ORM              │  │  node:sqlite (DatabaseSync)   │
│  Auth0 RS256 JWT             │  │  JWT + bcrypt                 │
│  Pydantic Schemas            │  │  SSE Notifications Stream     │
│  RBAC + Audit Logging        │  │  Rate Limiting                │
│  CSRF + Rate Limiting        │  │                               │
└──────────┬───────────────────┘  └──────────┬────────────────────┘
           │                                  │
           ▼                                  ▼
┌──────────────────────────────────────────────────────────────────┐
│                    SQLite Database(s)                             │
│  FastAPI: stadiumgenius.db (via SQLAlchemy, root or server/app/) │
│  Express: server/db/stadiumgenius.db (via node:sqlite)           │
└──────────────────────────────────────────────────────────────────┘
```

### Two Backend Architecture (IMPORTANT!)

This project has **TWO backend servers** that coexist:

1. **FastAPI (Python)** — `server/app/` — **PRIMARY production backend** (port 8000)
   - Uses SQLAlchemy ORM with Pydantic models
   - Auth0 RS256 JWT verification with JWKS
   - Full RBAC with permission-based access control
   - Runs via: `uvicorn server.app.main:app --reload`

2. **Express.js (Node.js)** — `server/index.js` — **Legacy/Demo backend** (port 5000)
   - Uses Node.js built-in `node:sqlite` (DatabaseSync)
   - JWT + bcrypt authentication
   - SSE notification streaming
   - Runs via: `cd server && npm run dev`

> ⚠️ **The frontend API client (`src/lib/api.js`) defaults to `http://127.0.0.1:8000/api/v1`** (FastAPI). The SSE notification stream connects to port 5000 (Express).

---

## 📁 COMPLETE FILE MAP

```
Smart-Stadiums-Tournament/
│
├── 🧠 BRAIN.md                          ← THIS FILE (AI agent guide)
├── 📖 README.md                          ← Project overview & quick start
├── 📋 extreme_audit_report.md            ← Security audit report
│
├── ⚙️ CONFIGURATION FILES
│   ├── package.json                      ← Frontend deps (React, Tailwind, Recharts)
│   ├── vite.config.js                    ← Vite + PWA + Tailwind plugin config
│   ├── vitest.config.js                  ← Test runner config (vitest + jsdom)
│   ├── playwright.config.js              ← E2E test config (Playwright)
│   ├── .oxlintrc.json                    ← Linter config (OxLint)
│   ├── .env                              ← Frontend env (VITE_AUTH0_DOMAIN, VITE_AUTH0_CLIENT_ID)
│   ├── .env.example                      ← Template for frontend env
│   ├── requirements.txt                  ← Python deps (FastAPI, SQLAlchemy, PyJWT)
│   ├── Dockerfile                        ← Multi-stage: Node build → Python prod image
│   ├── docker-compose.yml                ← 3 services: api(FastAPI), express, nginx
│   └── .dockerignore / .gitignore
│
├── 🌐 index.html                         ← SPA entry (loads /src/main.jsx)
│
├── 📂 src/                               ← ★ REACT FRONTEND ★
│   ├── main.jsx                          ← App bootstrap (Auth0Provider + BrowserRouter)
│   ├── App.jsx                           ← Route definitions + Layout + RBAC guards
│   ├── index.css                         ← Global styles (Tailwind v4 base)
│   │
│   ├── 📂 context/                       ← React Context Providers
│   │   ├── AuthContext.jsx               ← Auth state, login/logout, RBAC, sidebar, venue
│   │   └── NotificationContext.jsx       ← SSE-based real-time notifications
│   │
│   ├── 📂 lib/                           ← Client Libraries
│   │   └── api.js                        ← ApiClient class (fetch wrapper, JWT, retry, abort)
│   │
│   ├── 📂 data/                          ← Static/Mock Data
│   │   └── mockData.js                   ← Simulated venues, zones, KPIs, heatmaps, alerts
│   │
│   ├── 📂 components/                    ← Shared UI Components
│   │   ├── Sidebar.jsx                   ← Main navigation sidebar (collapsible)
│   │   ├── TopBar.jsx                    ← Top header bar with search, venue selector
│   │   ├── ProtectedRoute.jsx            ← Redirect to /login if not authenticated
│   │   ├── RoleGuard.jsx                 ← RBAC route guard (checks user.role)
│   │   ├── PermissionGuard.jsx           ← Permission-level guard (checks permission codes)
│   │   ├── ErrorBoundary.jsx             ← React error boundary with fallback UI
│   │   ├── ScrollToTop.jsx               ← Scroll to top on route change
│   │   ├── PWAInstallBanner.jsx          ← PWA install prompt banner
│   │   ├── NotificationPanel.jsx         ← Notification dropdown panel
│   │   ├── NotificationToast.jsx         ← Toast notification popups
│   │   ├── UserProfilePopup.jsx          ← User profile modal
│   │   ├── AlertCard.jsx                 ← Alert display card
│   │   ├── StatCard.jsx                  ← KPI stat display card
│   │   ├── StadiumBackdrop.jsx           ← Animated stadium background
│   │   ├── StadiumHeatmap.jsx            ← Crowd density heatmap visualization
│   │   └── 📂 skeleton/                  ← Loading skeleton components
│   │       ├── index.js                  ← Barrel exports
│   │       ├── primitives.jsx            ← Base skeleton primitives
│   │       ├── page-skeletons.jsx        ← Full page skeleton layouts
│   │       ├── Skeleton.jsx, StatCardSkeleton.jsx, ChartSkeleton.jsx, etc.
│   │
│   ├── 📂 pages/                         ← Feature Pages (lazy-loaded)
│   │   ├── Dashboard.jsx                 ← Main operator dashboard (KPIs, charts, alerts)
│   │   ├── DigitalTwin.jsx               ← Stadium digital twin visualization
│   │   ├── CrowdManagement.jsx           ← Zone occupancy & crowd control
│   │   ├── Security.jsx                  ← Security dashboard (incidents, patrols, CCTV)
│   │   ├── Concessions.jsx               ← Food/beverage queue monitoring
│   │   ├── AIAssistant.jsx               ← AI chatbot interface
│   │   ├── Broadcast.jsx                 ← PA/App/Screen broadcast management
│   │   ├── Analytics.jsx                 ← Manager-level analytics & reports
│   │   ├── AdminPanel.jsx                ← Admin user/role/config management
│   │   ├── Settings.jsx                  ← User settings & preferences
│   │   ├── FanPortal.jsx                 ← Public fan-facing portal (no auth)
│   │   ├── Login.jsx                     ← Login page (Auth0 + local JWT)
│   │   ├── Register.jsx                  ← Registration page
│   │   └── NotFound.jsx                  ← 404 page
│   │
│   ├── 📂 __tests__/                     ← Frontend Unit Tests (vitest + testing-library)
│   │   ├── AuthContext.test.jsx
│   │   ├── Login.test.jsx
│   │   ├── Register.test.jsx
│   │   ├── ErrorBoundary.test.jsx
│   │   └── Accessibility.test.jsx
│   │
│   └── setupTests.jsx                    ← Test setup (mocks for Auth0, IntersectionObserver)
│
├── 📂 server/                            ← ★ BACKEND(S) ★
│   ├── .env / .env.example               ← Server env vars
│   ├── package.json                      ← Express deps (express 5, bcryptjs, jwt, cors)
│   ├── index.js                          ← Express server entry point (port 5000)
│   ├── run_server.py                     ← Python script to start FastAPI via uvicorn
│   │
│   ├── 📂 db/                            ← Express Database (SQLite via node:sqlite)
│   │   ├── database.js                   ← DB init, table creation, seed data
│   │   └── stadiumgenius.db              ← SQLite database file
│   │
│   ├── 📂 middleware/                    ← Express Middleware
│   │   └── auth.js                       ← JWT verification (mock + local + Auth0 fallback)
│   │
│   ├── 📂 routes/                        ← Express API Routes (/api/*)
│   │   ├── auth.js                       ← /api/auth (register, login, auth0-login, me)
│   │   ├── venues.js                     ← /api/venues (CRUD for stadiums)
│   │   ├── incidents.js                  ← /api/incidents (incident management)
│   │   ├── analytics.js                  ← /api/analytics (dashboard stats)
│   │   ├── broadcast.js                  ← /api/broadcast (PA/app messages)
│   │   ├── ai.js                         ← /api/ai (AI assistant queries)
│   │   ├── users.js                      ← /api/users (user management)
│   │   └── notifications.js              ← /api/notifications (SSE stream)
│   │
│   ├── 📂 utils/
│   │   └── sanitize.js                   ← User object sanitization (strip password)
│   │
│   ├── 📂 app/                           ← ★ FastAPI Backend (PRIMARY) ★
│   │   ├── __init__.py
│   │   ├── main.py                       ← FastAPI app factory, middleware, router setup
│   │   ├── config.py                     ← Settings (pydantic-settings, env vars)
│   │   │
│   │   ├── 📂 core/                      ← Core Business Logic
│   │   │   ├── auth0.py                  ← Auth0 JWT validator (RS256/JWKS), ROLE_PERMISSIONS_MAP
│   │   │   └── security.py              ← get_current_user, require_permission, require_role, audit_log
│   │   │
│   │   ├── 📂 db/                        ← Database Layer (SQLAlchemy)
│   │   │   ├── database.py               ← Engine, SessionLocal, Base, get_db dependency
│   │   │   └── models.py                 ← All ORM models (User, Role, Permission, Incident, Venue, etc.)
│   │   │
│   │   ├── 📂 schemas/                   ← Pydantic Schemas
│   │   │   └── user.py                   ← UserCreate, UserResponse, etc.
│   │   │
│   │   ├── 📂 middleware/                ← FastAPI Middleware
│   │   │   ├── security_headers.py       ← Security headers (X-Frame-Options, HSTS, CSP)
│   │   │   ├── rate_limit.py             ← In-memory rate limiter (120 req/min)
│   │   │   └── csrf.py                   ← CSRF token validation
│   │   │
│   │   └── 📂 api/v1/endpoints/          ← FastAPI API Routers
│   │       ├── auth.py                   ← /api/v1/auth/* (sync, me, csrf-token, logout)
│   │       ├── admin.py                  ← /api/v1/admin/* (users, roles, audit, config)
│   │       ├── manager.py                ← /api/v1/manager/* (dashboard, staff, reports)
│   │       ├── operator.py               ← /api/v1/operator/* (crowd, incidents, AI)
│   │       └── security.py               ← /api/v1/security/* (dashboard, cctv, alerts)
│   │
│   └── 📂 __tests__/ & tests/            ← Backend tests
│       └── api.test.js                   ← Express API integration tests
│
├── 📂 e2e/                               ← Playwright E2E Tests
│   ├── auth.spec.js                      ← Auth flow E2E tests
│   └── performance.spec.js               ← Performance E2E tests
│
├── 📂 docs/                              ← Documentation
│   ├── architecture.md                   ← System architecture doc
│   ├── api.md                            ← API endpoint documentation
│   ├── database-schema.md                ← Database schema docs
│   ├── data-flow.md                      ← Data flow documentation
│   ├── security.md                       ← Security implementation docs
│   ├── deployment.md                     ← Deployment guide
│   ├── testing.md                        ← Testing strategy docs
│   ├── ai-workflows.md                   ← AI assistant workflow docs
│   ├── mvp-roadmap.md                    ← MVP roadmap
│   ├── AUDIT_REPORT.md                   ← Security audit report
│   ├── SYSTEM_GUIDE.md                   ← System operations guide
│   └── user-stories.md                   ← User stories
│
├── 📂 public/                            ← Static assets (icons, favicon)
├── 📂 dist/                              ← Production build output
└── 📂 coverage/                          ← Test coverage reports
```

---

## 🔐 AUTHENTICATION & AUTHORIZATION SYSTEM

### Dual Auth Strategy

```
┌─────────────────────────────────────────────────┐
│              Authentication Flow                 │
├─────────────────────────────────────────────────┤
│                                                  │
│  Method 1: Auth0 SSO (Production)                │
│  ├─ Auth0Provider wraps entire app (main.jsx)    │
│  ├─ loginWithRedirect() → Auth0 hosted login     │
│  ├─ Returns RS256 JWT Access Token               │
│  ├─ Backend verifies via JWKS endpoint           │
│  └─ User synced to local DB on first login       │
│                                                  │
│  Method 2: Local JWT (Dev/Demo)                  │
│  ├─ POST /api/auth/register → bcrypt + JWT       │
│  ├─ POST /api/auth/login → verify + JWT          │
│  └─ JWT signed with JWT_SECRET (HS256)           │
│                                                  │
│  Method 3: Mock Tokens (Testing)                 │
│  ├─ Token format: "mock-{role}-jwt-token"        │
│  ├─ AuthContext.loginMock(role) creates instant   │
│  └─ Only works when ALLOW_MOCK_TOKENS = true     │
│                                                  │
└─────────────────────────────────────────────────┘
```

### RBAC (Role-Based Access Control)

**4 Roles with specific permissions:**

| Role | Permissions | Accessible Pages |
|------|------------|-------------------|
| **admin** | `manage:users`, `manage:roles`, `configure:system`, `configure:ai`, `read:incidents`, `delete:incidents`, `read:audit_logs`, `manage:dashboard` | ALL pages + AdminPanel |
| **manager** | `read:dashboard`, `assign:staff`, `read:reports`, `read:incidents`, `approve:ai`, `allocate:resources` | Dashboard, DigitalTwin, Crowd, Concessions, Analytics, Broadcast, Settings |
| **operator** | `login`, `read:dashboard`, `update:incidents`, `read:crowd_analytics`, `create:incidents`, `use:ai_assistant` | Dashboard, DigitalTwin, Crowd, Concessions, Broadcast, AIAssistant, Settings |
| **security** | `login`, `read:security_dashboard`, `respond:incidents`, `verify:alerts`, `read:cctv`, `update:emergency` | Dashboard, Crowd, Security, Broadcast, Settings |

### Route Protection (Frontend)

```jsx
// In App.jsx — every protected page uses this pattern:
<Route path="/security" element={
  <Page roles={['security', 'admin']}>
    <Security />
  </Page>
} />

// Page component wraps: ProtectedRoute → AppLayout → ErrorBoundary → Suspense → RoleGuard
```

### Token Storage

| Key | Location | Purpose |
|-----|----------|---------|
| `sg_token` | localStorage | JWT access token |
| `sg_auth0_role` | localStorage | Temp role during Auth0 redirect |
| `sg_sidebar_collapsed` | localStorage | UI preference |
| `sg_active_venue_id` | localStorage | Selected venue ID (default: `metlife`) |

---

## 🗄️ DATABASE SCHEMAS

### Express SQLite (node:sqlite) — `server/db/database.js`

| Table | Key Columns | Purpose |
|-------|-------------|---------|
| `users` | id, name, email, password (bcrypt), role, avatar | User accounts |
| `venues` | id (text PK), name, city, capacity, country, lat, lng | FIFA 2026 stadiums (7 seeded) |
| `incidents` | incident_id (text), type, zone, status, priority, assignee | Security/safety incidents |
| `alerts` | type, severity, title, description, venue_id | Stadium alerts (6 seeded) |
| `broadcast_messages` | title, message, channel, priority, status, venue_id | PA/app broadcasts (5 seeded) |
| `ai_conversations` | session_id, role, content, user_id | AI chat history |

### FastAPI SQLAlchemy — `server/app/db/models.py`

| Model | Table | Key Fields | Purpose |
|-------|-------|------------|---------|
| `UserModel` | users | auth0_id, email, name, role, account_status, email_verified | Users with Auth0 sync |
| `RoleModel` | roles | name, description | Role definitions |
| `PermissionModel` | permissions | code, description | Permission codes |
| `AuditLogModel` | audit_logs | user_id, action, resource, ip_address, status | Security audit trail |
| `IncidentModel` | incidents | title, severity, category, status, location, assigned_to | Incident tracking |
| `SystemConfigModel` | system_configs | key, value, description | System configuration |
| `VenueModel` | venues_v2 | venue_code, name, city, country, capacity, lat/lng | Stadiums (v2 schema) |
| `ZoneModel` | zones | code, venue_id, capacity, zone_type | Stadium zones |
| `GateModel` | gates | name, venue_id, gate_type, status, throughput | Stadium gates |
| `SensorModel` | sensors | sensor_id, sensor_type, location, status | IoT sensors |
| `AIRecommendationModel` | ai_recommendations | recommendation_type, confidence, status | AI suggestions |
| `CrowdSnapshotModel` | crowd_snapshots | venue_code, zone_code, density, occupancy_pct | Crowd telemetry |
| `EmergencyModel` | emergencies | level, reason, is_active, venue_code | Emergency status |

---

## 🌐 API ENDPOINTS

### FastAPI (PRIMARY — port 8000, prefix `/api/v1`)

| Group | Endpoint | Method | Auth | Permission | Purpose |
|-------|----------|--------|------|------------|---------|
| **Auth** | `/auth/sync` | POST | Bearer | — | Sync Auth0 user to DB |
| | `/auth/me` | GET | Bearer | — | Get current user profile |
| | `/auth/csrf-token` | GET | — | — | Get CSRF token |
| | `/auth/logout` | POST | Bearer | — | Logout |
| **Admin** | `/admin/users` | GET | Bearer | `manage:users` | List all users |
| | `/admin/users/{id}/role` | PUT | Bearer | `manage:roles` | Update user role |
| | `/admin/roles` | GET | Bearer | `manage:roles` | Get roles matrix |
| | `/admin/audit-logs` | GET | Bearer | `read:audit_logs` | Get audit logs |
| | `/admin/system-config` | POST | Bearer | `configure:system` | Update system config |
| | `/admin/ai-settings` | POST | Bearer | `configure:ai` | Update AI settings |
| **Manager** | `/manager/dashboard-summary` | GET | Bearer | `read:dashboard` | Dashboard KPIs |
| | `/manager/assign-staff` | POST | Bearer | `assign:staff` | Assign staff to sector |
| | `/manager/reports` | GET | Bearer | `read:reports` | Get reports |
| | `/manager/approve-ai-recommendation` | POST | Bearer | `approve:ai` | Approve AI suggestion |
| | `/manager/allocate-resources` | POST | Bearer | `allocate:resources` | Allocate resources |
| **Operator** | `/operator/crowd-analytics` | GET | Bearer | `read:crowd_analytics` | Crowd density data |
| | `/operator/incidents` | GET/POST | Bearer | `read/create:incidents` | Incident CRUD |
| | `/operator/incidents/{id}` | PUT | Bearer | `update:incidents` | Update incident |
| | `/operator/ai-assistant` | POST | Bearer | `use:ai_assistant` | AI chatbot query |
| **Security** | `/security/dashboard` | GET | Bearer | `read:security_dashboard` | Security overview |
| | `/security/cctv-status` | GET | Bearer | `read:cctv` | CCTV camera status |
| | `/security/verify-alert` | POST | Bearer | `verify:alerts` | Verify/dismiss alert |
| | `/security/respond-incident` | POST | Bearer | `respond:incidents` | Respond to incident |
| | `/security/emergency-status` | POST | Bearer | `update:emergency` | Update emergency level |

### Express (LEGACY — port 5000, prefix `/api`)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/auth/register` | POST | Register new user |
| `/api/auth/login` | POST | Login with email/password |
| `/api/auth/auth0-login` | POST | Login via Auth0 callback |
| `/api/auth/me` | GET | Get current user (JWT required) |
| `/api/venues/*` | CRUD | Venue management |
| `/api/incidents/*` | CRUD | Incident management |
| `/api/analytics/*` | GET | Analytics data |
| `/api/broadcast/*` | CRUD | Broadcast messages |
| `/api/ai/*` | POST | AI assistant |
| `/api/users/*` | CRUD | User management |
| `/api/notifications/stream` | GET (SSE) | Real-time notification stream |
| `/api/health` | GET | Health check |

---

## 🎨 FRONTEND PATTERNS & CONVENTIONS

### Tech Stack
- **React 19** with functional components & hooks
- **Vite 8** for bundling and HMR
- **Tailwind CSS v4** (via `@tailwindcss/vite` plugin)
- **Framer Motion 12** for animations
- **Recharts 3** for data visualization
- **Lucide React** for icons
- **React Router v7** (`react-router-dom`) for routing
- **Auth0 React SDK** (`@auth0/auth0-react`) for SSO

### Component Patterns
```
1. Pages are LAZY LOADED via React.lazy() + Suspense
2. All pages wrapped in: ProtectedRoute → AppLayout → ErrorBoundary → Suspense → RoleGuard
3. Skeleton components used as loading fallbacks
4. Custom hooks: useAuth() from AuthContext, useNotifications() from NotificationContext
5. API calls go through singleton ApiClient (src/lib/api.js)
```

### State Management
- **AuthContext** — User auth state, login/logout, RBAC, sidebar state, venue selection
- **NotificationContext** — SSE-based real-time notifications
- **No Redux/Zustand** — Everything via React Context + local state

### Styling Convention
- Tailwind CSS v4 utility classes
- Custom CSS in `src/index.css`
- Dark theme dominant (`bg-surface-950`, dark color tokens)
- Responsive layout with collapsible sidebar

### Key Custom CSS Classes
- `stadium-grid` — Background grid pattern
- `bg-surface-950` — Main dark background
- Sidebar widths: collapsed=`72px`, expanded=`260px`

---

## 🔧 DEVELOPMENT COMMANDS

```bash
# ── Frontend ──
npm install                    # Install frontend dependencies
npm run dev                    # Start Vite dev server (port 5173)
npm run build                  # Production build → dist/
npm run preview                # Preview production build
npm run lint                   # Run OxLint

# ── Express Backend ──
cd server
npm install                    # Install backend dependencies
npm run dev                    # Start Express with --watch (port 5000)
npm start                      # Start Express (no watch)

# ── FastAPI Backend ──
pip install -r requirements.txt  # Install Python deps
uvicorn server.app.main:app --reload  # Start FastAPI (port 8000)
# OR
python server/run_server.py

# ── Testing ──
npm run test                   # Vitest unit tests
npm run test:watch             # Vitest watch mode
npm run test:coverage          # Test coverage report
npm run test:e2e               # Playwright E2E tests
npm run test:auth0:extreme     # Auth0 role verification
npm run test:all:extreme       # All flow verification

# ── Docker ──
docker compose up --build      # Start all services
```

---

## 🏟️ SEEDED DATA (Auto-populated on first run)

### 7 FIFA World Cup 2026 Venues
| ID | Stadium | City | Capacity |
|----|---------|------|----------|
| metlife | MetLife Stadium | New York/NJ | 82,500 |
| sofi | SoFi Stadium | Los Angeles | 70,240 |
| attstadium | AT&T Stadium | Dallas | 80,000 |
| arrowhead | Arrowhead Stadium | Kansas City | 76,416 |
| lumen | Lumen Field | Seattle | 68,740 |
| azteca | Estadio Azteca | Mexico City | 87,523 |
| bmo | BMO Field | Toronto | 45,736 |

### Default Seeded Data
- **6 alerts** (crowd, security, medical, concession, transport, system)
- **5 incidents** (unauthorized access, lost child, crowd surge, suspicious package, medical)
- **5 broadcast messages** (welcome, transport, medical, concession, security)

---

## ⚙️ ENVIRONMENT VARIABLES

### Frontend (`.env`)
```env
VITE_AUTH0_DOMAIN=dev-rx0mbg0jq10om5js.us.auth0.com
VITE_AUTH0_CLIENT_ID=aQlxQVzhReZYEieH3NTj0BWLal3upoQm
VITE_API_BASE_URL=http://127.0.0.1:8000/api/v1     # FastAPI
VITE_SSE_BASE_URL=http://localhost:5000               # Express SSE
```

### Server (`server/.env`)
```env
# Express
PORT=5000
NODE_ENV=development
JWT_SECRET=<generated>
JWT_EXPIRES_IN=7d

# FastAPI
ENVIRONMENT=development
DATABASE_URL=sqlite:///./stadiumgenius.db
SECRET_KEY=<generated>
CSRF_SECRET=<generated>

# Auth0
AUTH0_DOMAIN=dev-rx0mbg0jq10om5js.us.auth0.com
AUTH0_AUDIENCE=https://dev-rx0mbg0jq10om5js.us.auth0.com/api/v2/
AUTH0_ISSUER=https://dev-rx0mbg0jq10om5js.us.auth0.com/
```

---

## 🔒 SECURITY FEATURES

| Feature | Implementation |
|---------|---------------|
| **JWT Auth** | RS256 (Auth0) + HS256 (local), auto-refresh |
| **Password Hashing** | bcrypt with 12 salt rounds |
| **RBAC** | 4 roles × 6-8 permissions each |
| **Rate Limiting** | 120 req/min (FastAPI), 200 req/15min auth (Express) |
| **CSRF Protection** | Token-based CSRF middleware (FastAPI) |
| **Security Headers** | X-Frame-Options: DENY, HSTS, CSP, X-Content-Type-Options |
| **Input Sanitization** | User object sanitization (strip passwords) |
| **Audit Logging** | Full audit trail in audit_logs table |
| **401 Auto-Redirect** | Client-side token invalidation + redirect to /login |
| **Mock Token Guard** | Only allowed in development mode |

---

## 🧪 TESTING STRATEGY

| Layer | Tool | Command | Files |
|-------|------|---------|-------|
| **Unit Tests** | Vitest + Testing Library + jsdom | `npm run test` | `src/__tests__/*.test.jsx` |
| **API Tests** | Supertest (Express) | — | `server/__tests__/api.test.js` |
| **E2E Tests** | Playwright | `npm run test:e2e` | `e2e/*.spec.js` |
| **Auth0 Verification** | Custom Node scripts | `npm run test:auth0:extreme` | `verify_roles_auth0.js` |
| **Full Flow Tests** | Custom Node scripts | `npm run test:all:extreme` | `verify_all_flows.js` |
| **Python Tests** | Pytest + HTTPX | `pytest` | `server/tests/` |

---

## 📊 REAL-TIME DATA FLOW

```
┌──────────────────────┐
│  Mock Data Generator │ ← src/data/mockData.js
│  (Client-side)       │   generates: occupancy, gates, KPIs,
│                      │   alerts, heatmaps, time-series
└──────────┬───────────┘
           │ Used directly by Dashboard, DigitalTwin, etc.
           ▼
┌──────────────────────┐
│  SSE Notification    │ ← Express /api/notifications/stream
│  Stream (Port 5000)  │   Push real-time alerts to frontend
│                      │   Uses fetch-based SSE (not EventSource)
│                      │   for custom Authorization header support
└──────────────────────┘
```

> **Note**: Currently most real-time data is **client-side generated** from `mockData.js`. The SSE stream provides server-push notifications. Future work includes real IoT sensor integration.

---

## 🐳 DOCKER ARCHITECTURE

```yaml
Services:
  api:        # FastAPI (PRIMARY) — port 8000, Dockerfile (multi-stage)
  express:    # Express (LEGACY) — port 5000, Dockerfile.node
  nginx:      # Reverse proxy — port 80/443, nginx:alpine

Volumes:
  db-data:    # Persistent database storage for FastAPI
```

---

## 🚧 KNOWN LIMITATIONS & FUTURE WORK

| Area | Current State | Future Plan |
|------|--------------|-------------|
| **AI Chatbot** | Keyword-based mock responses | Real Google Gemini API integration |
| **IoT Sensors** | Client-side simulated data | MQTT/WebSocket real sensor feeds |
| **MFA** | Not implemented | OTP via Speakeasy + Nodemailer |
| **Reports** | Dashboard only | PDF export for managers |
| **Database** | SQLite (single file) | PostgreSQL for production |
| **Caching** | None | Redis for API caching |
| **WebSocket** | SSE only | Full WebSocket for bi-directional |

---

## 📝 CODING CONVENTIONS

1. **File naming**: PascalCase for components (`Dashboard.jsx`), camelCase for utilities (`mockData.js`)
2. **Imports**: Named exports for contexts, default exports for pages/components
3. **API calls**: Always through `src/lib/api.js` singleton — never raw `fetch()`
4. **Auth checks**: Use `useAuth()` hook — never access localStorage directly for auth state
5. **Route protection**: Use `<Page roles={[...]}> ` wrapper in App.jsx
6. **Error handling**: ErrorBoundary wraps all pages, ApiClient auto-redirects on 401
7. **Module system**: ESM (`"type": "module"`) in both frontend and backend
8. **Node version**: Requires Node.js ≥ 22.5.0 (for `node:sqlite`)
9. **Python version**: Python 3.12+ recommended

---

## 🔗 KEY DEPENDENCY DECISIONS

| Decision | Choice | Reason |
|----------|--------|--------|
| Frontend framework | React 19 | Latest features, compiler-ready |
| Bundler | Vite 8 | Fast HMR, ESM-native |
| CSS | Tailwind v4 | Utility-first, v4 plugin via Vite |
| Charts | Recharts 3 | React-native charting |
| Icons | Lucide React | Clean SVG icons, tree-shakeable |
| Animations | Framer Motion 12 | Declarative React animations |
| Auth Provider | Auth0 | Enterprise SSO, social logins |
| Primary Backend | FastAPI | Async, Pydantic validation, auto-docs |
| Legacy Backend | Express 5 | SSE support, rapid prototyping |
| ORM | SQLAlchemy 2 | Mature Python ORM |
| DB (Dev) | SQLite | Zero-config, embedded |
| Testing | Vitest + Playwright | Fast unit + reliable E2E |
| PWA | vite-plugin-pwa | Workbox-based offline support |

---

## 🏁 QUICK CONTEXT FOR AI AGENTS

**If you need to:**

| Task | Go To |
|------|-------|
| Add a new page | Create in `src/pages/`, add lazy import + route in `App.jsx` |
| Add a new API endpoint | FastAPI: `server/app/api/v1/endpoints/`, Express: `server/routes/` |
| Modify auth/roles | `src/context/AuthContext.jsx` + `server/app/core/auth0.py` |
| Add a new DB table | FastAPI: `server/app/db/models.py`, Express: `server/db/database.js` |
| Add a component | Create in `src/components/`, import where needed |
| Add a new API method | Add to `src/lib/api.js` ApiClient class |
| Modify sidebar nav | `src/components/Sidebar.jsx` |
| Add test | Unit: `src/__tests__/`, E2E: `e2e/`, API: `server/__tests__/` |
| Change styling | `src/index.css` or Tailwind classes inline |
| Update env vars | Frontend: `.env`, Backend: `server/.env` |
| Check existing docs | `docs/` folder (architecture, api, security, testing, etc.) |
| Understand data models | `server/app/db/models.py` (FastAPI) or `server/db/database.js` (Express) |

---

> 🤖 **AI Agent Instructions**: Is file ko read karo, project samjho, aur seedha kaam shuru karo. Poora codebase scan karne ki zaroorat nahi hai. Agar koi specific file ka detail chahiye to `docs/` folder check karo ya specific file padho.
