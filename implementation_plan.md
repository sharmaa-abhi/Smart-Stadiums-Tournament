# Backend Authentication, API Models & Frontend Integration

Add a full Express.js backend with JWT authentication, RESTful API models for all stadium data, and integrate the frontend with protected routes + login/register pages.

## Proposed Changes

### Backend Server (`server/`)

#### [NEW] server/package.json
Node.js backend dependencies: `express`, `cors`, `jsonwebtoken`, `bcryptjs`, `better-sqlite3`, `dotenv`, `cookie-parser`

#### [NEW] server/.env
JWT secret, port, and environment configuration

#### [NEW] server/db/database.js
SQLite database setup with `better-sqlite3`. Creates tables on startup:
- `users` — id, name, email, password (hashed), role, avatar, created_at
- `venues` — id, name, city, capacity, country, lat, lng
- `incidents` — id, type, zone, time, status, priority, response, assignee, venue_id
- `alerts` — id, type, severity, title, description, time, venue_id
- Seeds initial venue data from existing `mockData.js`

#### [NEW] server/middleware/auth.js
JWT middleware: extracts token from `Authorization: Bearer <token>` header, verifies it, attaches `req.user`. Returns 401 on invalid/missing token.

#### [NEW] server/routes/auth.js
Authentication routes:
- `POST /api/auth/register` — Create account (name, email, password, role). Hashes password with bcrypt. Returns JWT + user profile.
- `POST /api/auth/login` — Login with email/password. Validates credentials. Returns JWT + user profile.
- `GET /api/auth/me` — Get current user profile (protected).

#### [NEW] server/routes/venues.js
Protected API routes for venue data:
- `GET /api/venues` — List all venues
- `GET /api/venues/:id` — Get single venue
- `GET /api/venues/:id/kpis` — Get live KPIs (generated server-side)
- `GET /api/venues/:id/alerts` — Get alerts
- `GET /api/venues/:id/occupancy` — Get zone occupancy
- `GET /api/venues/:id/timeseries` — Get time-series telemetry
- `GET /api/venues/:id/heatmap` — Get crowd density heatmap
- `GET /api/venues/:id/gates` — Get gate status
- `GET /api/venues/:id/concessions` — Get concession data

#### [NEW] server/routes/incidents.js
Protected CRUD for incidents:
- `GET /api/incidents` — List all incidents
- `POST /api/incidents` — Create new incident
- `PATCH /api/incidents/:id` — Update incident status

#### [NEW] server/index.js
Express server entry point. Loads env, connects DB, registers middleware (cors, json, cookie-parser), mounts routes, starts on port 5000.

---

### Frontend Auth Pages & Integration

#### [NEW] src/context/AuthContext.jsx
React Context for auth state: `user`, `token`, `login()`, `register()`, `logout()`, `isAuthenticated`. Stores JWT in localStorage. Auto-checks token on mount.

#### [NEW] src/components/ProtectedRoute.jsx
Wrapper component that redirects to `/login` if user is not authenticated.

#### [NEW] src/pages/Login.jsx
Premium dark-themed login page with email/password form, animated transitions, error handling, and link to register.

#### [NEW] src/pages/Register.jsx
Premium dark-themed registration page with name/email/password/role form, validation, and link to login.

#### [NEW] src/lib/api.js
API utility with Axios-like fetch wrapper. Adds JWT `Authorization` header automatically. Base URL: `http://localhost:5000/api`.

#### [MODIFY] [App.jsx](file:///c:/Users/ABHI SHARMA/OneDrive/Desktop/projects/src/App.jsx)
- Wrap with `AuthProvider`
- Add `/login` and `/register` routes (public)
- Wrap all existing routes with `ProtectedRoute`

#### [MODIFY] [main.jsx](file:///c:/Users/ABHI SHARMA/OneDrive/Desktop/projects/src/main.jsx)
No changes needed — BrowserRouter already wraps App.

#### [MODIFY] [Sidebar.jsx](file:///c:/Users/ABHI SHARMA/OneDrive/Desktop/projects/src/components/Sidebar.jsx)
- Show logged-in user name/role at the bottom
- Add Logout button

#### [MODIFY] [TopBar.jsx](file:///c:/Users/ABHI SHARMA/OneDrive/Desktop/projects/src/components/TopBar.jsx)
- Show user avatar initials from auth context instead of hardcoded "OP"

---

## Tech Decisions

| Decision | Choice | Reason |
|----------|--------|--------|
| Database | SQLite (better-sqlite3) | Zero setup, no external DB needed, file-based |
| Auth | JWT (jsonwebtoken) | Stateless, simple, works with SPA |
| Password hashing | bcryptjs | Pure JS, no native compilation needed |
| Backend framework | Express.js | Standard, lightweight, fast setup |
| Frontend state | React Context | Lightweight, no extra dependencies |

## Verification Plan

### Manual Verification
1. Start backend server (`node server/index.js`)
2. Start frontend (`npm run dev`)
3. Open browser → should redirect to Login page
4. Register a new account → should create user and redirect to Dashboard
5. Logout → should redirect to Login
6. Login with created account → should access Dashboard
7. All 9 pages should still work with sidebar navigation
8. API calls should return data from backend instead of mock data
