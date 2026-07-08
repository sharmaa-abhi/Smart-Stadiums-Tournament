# Implementation Plan — Backend SSE, Auth, and Settings Integration

This plan implements the remaining backend routes, auth updates, settings functionality, and real-time SSE telemetry, followed by automated browser verification.

## User Review Required

> [!IMPORTANT]
> The implementation of persistent venue state will store the selected venue ID in `localStorage` as `sg_active_venue_id`. If not present, it will fallback to `'metlife'`. This ensures that all components load data matching the selected venue.

## Proposed Changes

### Component: Backend (Express Server)

#### [MODIFY] [auth.js](file:///c:/Users/ABHI%20SHARMA/OneDrive/Desktop/projects/server/middleware/auth.js)
* Ensure requests are authenticated using either the `Authorization` Bearer header or the `token` query parameter to support browser native `EventSource` (which does not allow custom headers by default). *(Note: Already implemented, but we will verify it is operational.)*

#### [MODIFY] [venues.js](file:///c:/Users/ABHI%20SHARMA/OneDrive/Desktop/projects/server/routes/venues.js)
* Verify the `/api/venues/:id/live-kpis` route correctly sets headers for Server-Sent Events (`text/event-stream`), sends the initial KPI dataset, and pushes updates every 2 seconds. *(Note: Already implemented, but we will verify it works during execution.)*

---

### Component: Frontend (React App)

#### [MODIFY] [Dashboard.jsx](file:///c:/Users/ABHI%20SHARMA/OneDrive/Desktop/projects/src/pages/Dashboard.jsx)
* Use `localStorage.getItem('sg_active_venue_id') || 'metlife'` as the `VENUE_ID` to support dynamic loading of the user's active venue from settings.
* Establish `EventSource` connection to dynamic SSE URL `/api/venues/${VENUE_ID}/live-kpis?token=${token}`.

#### [MODIFY] [Settings.jsx](file:///c:/Users/ABHI%20SHARMA/OneDrive/Desktop/projects/src/pages/Settings.jsx)
* Update active venue selection on mount to check if `sg_active_venue_id` exists in `localStorage` and set it accordingly.
* Save the active venue ID to `localStorage` under key `sg_active_venue_id` when the user selects a venue card.
* Update `handleUpdateProfile` to call `api.updateUserProfile({ name: profileName })` and verify it updates the profile name.
* Update `handlePasswordChange` to call `api.changePassword(currentPassword, newPassword)`.

---

## Verification Plan

### Automated Verification
* Run Express server (`npm run dev` in `server/`) and Vite dev server (`npm run dev` in frontend workspace) concurrently.
* Launch browser subagent to:
  1. Navigate to the login/registration page and authenticate.
  2. Load the operations dashboard, verify that KPI telemetry updates automatically over SSE, and verify pages navigate correctly.
  3. Navigate to Settings page, change the active venue, update the user profile name, change the password, and verify the changes persist.

### Manual Verification
* Inspect the network panel to confirm SSE connection is active and receiving telemetry messages every 2 seconds.
* Check that profile name changes are persisted after updating and refreshing.
