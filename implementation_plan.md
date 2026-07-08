# Smart Stadiums — Remaining Backend Services + Full Browser Testing

## Overview

The backend contains routes for Auth, Venues, Incidents, Analytics, Broadcast, AI, and Users. The frontend pages (Dashboard, Security, Concessions, Crowd Management, etc.) are partially wired, but some pages need more comprehensive integration with the backend APIs. We will:
1. Update authentication middleware to support URL query token parsing for EventSource (SSE).
2. Implement Server-Sent Events (SSE) route `/api/venues/:id/live-kpis` on the backend to stream live KPI updates.
3. Modify `Dashboard.jsx` to establish an EventSource connection for real-time KPI updates.
4. Modify `Settings.jsx` to include user profile update (name) and password change functionality wired to the backend API.
5. Launch both servers and run automated browser verification using the browser subagent.

---

## Proposed Changes

### Server

#### [MODIFY] [auth.js](file:///c:/Users/ABHI%20SHARMA/OneDrive/Desktop/projects/server/middleware/auth.js)
- Allow authenticating requests via a `token` query parameter in addition to the standard `Authorization` Bearer header to support SSE connections.

#### [MODIFY] [venues.js](file:///c:/Users/ABHI%20SHARMA/OneDrive/Desktop/projects/server/routes/venues.js)
- Implement a `GET /api/venues/:id/live-kpis` route that sets the response headers for SSE (`text/event-stream`) and pushes live-generated venue KPI stats down the connection every 2 seconds.

### Frontend

#### [MODIFY] [Dashboard.jsx](file:///c:/Users/ABHI%20SHARMA/OneDrive/Desktop/projects/src/pages/Dashboard.jsx)
- Use `EventSource` connected to the `/api/venues/:id/live-kpis` endpoint to receive live updates.
- Keep standard polling/fetching for secondary telemetry, alerts, occupancy, and heatmaps.

#### [MODIFY] [Settings.jsx](file:///c:/Users/ABHI%20SHARMA/OneDrive/Desktop/projects/src/pages/Settings.jsx)
- Wire active venue selection to state.
- Add user profile edit card (update name) using `api.updateUserProfile()`.
- Add change password card (current password + new password) using `api.changePassword()`.

---

## Verification Plan

### Automated
- Launch frontend (Vite) and backend (Express) concurrently.
- Run browser subagent task to navigate through all dashboard pages, trigger incident resolution, test AI chat, edit profile, and verify that real API data is loaded correctly.

### Manual Verification
- Verify that live KPI tickers tick automatically without manual refresh or periodic REST requests in the network panel.
- Update profile details and verify changes persist on page refresh.
