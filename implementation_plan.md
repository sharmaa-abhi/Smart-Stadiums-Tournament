# Smart Stadiums — Remaining Backend Services + Full Browser Testing

## Overview

The project has a solid Express/SQLite backend with Auth, Venues, and Incidents routes fully working. The frontend pages (Dashboard, Security, Concessions, Crowd Management, etc.) are still using **local mock data** instead of real API calls. We need to:

1. Add **remaining backend routes** (analytics, broadcast, AI assistant, user profile/settings)
2. **Wire every frontend page** to the real API instead of mock data
3. Fix the **Security page** to use real incidents from DB
4. Add **WebSocket / SSE** for live-updating KPI tickers
5. Launch both servers and do **extreme-level browser testing** through every page and feature

---

## Remaining Backend Routes to Add

### New: `/api/analytics` — `server/routes/analytics.js`
- `GET /api/analytics/overview` — match stats, revenue, total attendance per venue
- `GET /api/analytics/trends` — 7-day trend data for charts
- `GET /api/analytics/performance` — per-zone performance scores

### New: `/api/broadcast` — `server/routes/broadcast.js`
- `GET /api/broadcast/messages` — list of active broadcast messages
- `POST /api/broadcast/messages` — create new broadcast
- `PATCH /api/broadcast/messages/:id` — update (activate/deactivate)
- `DELETE /api/broadcast/messages/:id` — delete

### New: `/api/ai` — `server/routes/ai.js`
- `POST /api/ai/chat` — AI assistant conversation handler (smart pre-programmed responses for stadium operations Q&A)
- `GET /api/ai/history` — chat history per session

### New: `/api/users` — `server/routes/users.js`
- `GET /api/users/profile` — get full user profile
- `PATCH /api/users/profile` — update name, avatar
- `PATCH /api/users/password` — change password

### Database additions to `server/db/database.js`
- `broadcast_messages` table
- `ai_conversations` table

---

## Frontend Wiring

### Pages to wire to real API:
- **Dashboard** — use `api.getVenueKPIs()`, `api.getVenueAlerts()`, `api.getVenueTimeseries()`, `api.getVenueOccupancy()`, `api.getVenueHeatmap()`
- **Security** — use `api.getIncidents()`, `api.createIncident()`, `api.updateIncident()`
- **Concessions** — use `api.getVenueConcessions()`, `api.getVenueGates()`
- **CrowdManagement** — use `api.getVenueOccupancy()`, `api.getVenueTimeseries()`, `api.getVenueHeatmap()`
- **Analytics** — use new `api.getAnalytics*()`
- **Broadcast** — use new `api.getBroadcasts()`, `api.createBroadcast()`
- **AIAssistant** — use new `api.aiChat()`
- **Settings** — use `api.getVenues()`, `api.updateProfile()`
- **TopBar** — show real logged-in user name/role

---

## Proposed Changes

### Server

#### [NEW] server/routes/analytics.js
#### [NEW] server/routes/broadcast.js
#### [NEW] server/routes/ai.js
#### [NEW] server/routes/users.js
#### [MODIFY] server/db/database.js — add broadcast_messages + ai_conversations tables + seed data
#### [MODIFY] server/index.js — register 4 new route files

### Frontend API Client

#### [MODIFY] src/lib/api.js — add analytics, broadcast, AI, user profile methods

### Frontend Pages

#### [MODIFY] src/pages/Dashboard.jsx — wire to real API
#### [MODIFY] src/pages/Security.jsx — wire incidents to real API
#### [MODIFY] src/pages/Concessions.jsx — wire to real API
#### [MODIFY] src/pages/CrowdManagement.jsx — wire to real API
#### [MODIFY] src/pages/Analytics.jsx — wire to new analytics API
#### [MODIFY] src/pages/Broadcast.jsx — wire to new broadcast API
#### [MODIFY] src/pages/AIAssistant.jsx — wire to new AI chat API
#### [MODIFY] src/pages/Settings.jsx — wire venues + user profile to real API
#### [MODIFY] src/components/TopBar.jsx — show real user from AuthContext

---

## Verification Plan

### Automated
- Start both servers simultaneously
- Browser testing through every page and interaction

### Manual Browser Testing (Extreme Level)
1. Register new user → verify in DB
2. Login → verify token in localStorage
3. Dashboard → live KPI updates, charts, heatmap
4. Security → view/create/resolve incidents
5. Concessions → live queue data, gate flows
6. Crowd Management → occupancy, heatmap
7. Analytics → charts and trends
8. Broadcast → create/delete messages
9. AI Assistant → chat with bot
10. Settings → venue selection, user profile
11. Logout → redirect to login, verify token cleared
