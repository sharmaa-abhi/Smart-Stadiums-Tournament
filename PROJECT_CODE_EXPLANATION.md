# 🏟️ StadiumGenius — Complete Code Explanation (What Every File & Folder Does)

> This document is a detailed breakdown of the entire **Smart-Stadiums-Tournament** project.  
> It explains what the code written in every folder and every file is actually doing.

---

## 📁 Project Root (Top-Level Files)

### `package.json`
- **What it does:** Defines the project's identity — name `stadiumgenius`, version `1.0.0`.
- All **npm scripts** are defined here:
  - `npm run dev` → Starts the Vite development server (frontend)
  - `npm run build` → Creates the production build
  - `npm run test` → Runs unit tests using Vitest
  - `npm run test:e2e` → Runs browser automation tests using Playwright
  - `npm run lint` → Checks code quality using OxLint
- **Dependencies:** React 19, React Router 7, Auth0, Framer Motion (animations), Recharts (charts), TailwindCSS 4, Lucide React (icons)
- **Dev Dependencies:** Vitest (testing), Playwright (E2E), Puppeteer, Supertest (API testing)

### `index.html`
- **What it does:** This is the entry point HTML file for the entire application.
- `<div id="root">` — React mounts here.
- PWA (Progressive Web App) support: manifest.json link, apple-touch-icon, theme-color are all configured.
- Loads Google Fonts — **Inter** (body text) and **Outfit** (headings).
- Meta tags: SEO description, mobile-web-app-capable, viewport settings.

### `vite.config.js`
- **What it does:** Configuration for the Vite build tool:
  - **React plugin** — JSX support
  - **TailwindCSS plugin** — CSS framework
  - **VitePWA plugin** — Auto-generates the Service Worker, sets up offline caching
  - Defines the PWA manifest (app name, icons, shortcuts)
  - **Runtime caching:** Google Fonts → CacheFirst, API calls → NetworkFirst
  - Deduplicates React and react-dom (avoids version conflicts)
  - Ignores the server folder from watch (backend changes won't trigger frontend reload)

### `vitest.config.js`
- **What it does:** Unit testing configuration:
  - Uses JSDOM environment (simulates the browser in Node.js)
  - Loads `setupTests.jsx` file before running tests
  - Coverage: Uses V8 provider, tracks coverage for specific files (Login, Register, AuthContext, ErrorBoundary)

### `Dockerfile`
- **What it does:** Multi-stage Docker build:
  - **Stage 1 (frontend-builder):** Builds the frontend in a Node.js 20 Alpine image (`npm ci` + `npm run build`)
  - **Stage 2 (backend):** Sets up the backend in a Python 3.12 slim image
  - Creates a non-root user `stadium` (security best practice)
  - Copies frontend build artifacts (`dist/`) into the backend container
  - Exposes port 8000
  - Health check: Hits `http://localhost:8000/health` every 30 seconds
  - Starts FastAPI via Uvicorn with 4 workers

### `docker-compose.yml`
- **What it does:** Orchestrates 3 services:
  - **api:** FastAPI backend (port 8000), production mode, SQLite database with persistent volume
  - **express:** Legacy Node.js Express server (port 5000) — used for demo/fallback
  - **nginx:** Reverse proxy (port 80/443), depends on the API service being healthy

### `playwright.config.js`
- **What it does:** End-to-end browser testing configuration:
  - Reads tests from the `e2e/` folder
  - Base URL: `http://localhost:5173` (Vite dev server)
  - Uses the Chromium browser
  - Takes screenshots on failure, records traces on the first retry

### `.env` / `.env.example`
- **What it does:** Stores environment variables (Auth0 domain, client ID, API URLs, secrets)
- `.env.example` is a template — actual secrets go in `.env`

### `.gitignore`
- **What it does:** Defines files/folders that should not be tracked by Git (node_modules, dist, .env, __pycache__, etc.)

### `.oxlintrc.json`
- **What it does:** Configuration for OxLint (a Rust-based linter) — specifies disabled/enabled rules

### `BRAIN.md` / `README.md`
- **What it does:** Project documentation files — overview, setup instructions, architecture description

### Root-level Test Files
- **`test_all_roles.mjs`** — Programmatic test that tests login, navigation, and permissions for each role (admin, manager, security, operator)
- **`test_auth0_fastapi_e2e.py`** — Python-based E2E test that tests the Auth0 + FastAPI RBAC flow
- **`verify_all_flows.js`** — Complete user flow verification (login → dashboard → features → logout)
- **`verify_login_phase.js`** — Detailed verification of the login page (UI elements, role selection, auth flow)
- **`verify_roles.js`** / **`verify_roles_auth0.js`** — Role-based access control verification scripts

### `stadiumgenius.db`
- **What it does:** SQLite database file — stores users, incidents, venues, audit logs, and all other persistent data

---

## 📁 `src/` — Frontend Source Code

### `src/main.jsx` — Application Entry Point
- **What it does:**
  - In development mode, **unregisters service workers** and **clears the cache** (avoids stale cache issues)
  - Wraps the app with Auth0Provider — for Auth0 SSO support
  - Wraps the app with BrowserRouter — for client-side routing
  - If Auth0 config is missing, logs a console warning — falls back to local JWT authentication
  - `StrictMode` is enabled — enforces React best practices

### `src/App.jsx` — Main Application Router
- **What it does:**
  - **Lazy loading:** All pages (`Dashboard`, `Security`, `AdminPanel`, etc.) are lazy-loaded — reduces initial bundle size
  - **AppLayout component:** Defines the layout with Sidebar + main content area + BottomNav (mobile)
  - **Page wrapper component:** Wraps every protected page with `ProtectedRoute` (auth check) + `ErrorBoundary` (crash protection) + `Suspense` (loading skeleton) + optional `RoleGuard` (role check)
  - **Defines all routes:**
    - `/login`, `/register` — Public pages
    - `/fan` — Public Fan Portal (no authentication required)
    - `/` — Dashboard (all roles)
    - `/assistant`, `/settings` — All authenticated users
    - `/digital-twin`, `/crowd`, `/concessions` — Operator, Manager, Admin
    - `/security` — Security, Admin only
    - `/analytics` — Manager, Admin only
    - `/broadcast` — All roles
    - `/admin-panel` — Admin only
    - `*` — 404 NotFound page

### `src/index.css` — Global Stylesheet
- **What it does:**
  - **TailwindCSS import** + defines the custom theme
  - **Brand color palette:** Brand blue (#3378ff), Accent cyan, Emerald green, Amber, Rose
  - **Surface colors:** Dark theme (0a0a1a to 282c5a range) — stadium control room aesthetic
  - **Glassmorphism classes:** `glass-card`, `glass-card-hover` — frosted glass UI effect
  - **Glow effects:** `glow-brand`, `glow-accent`, `glow-emerald`, etc.
  - **Gradient text:** `text-gradient` (brand → cyan → green), `text-gradient-warm` (amber → rose)
  - **Animations:** `pulse-dot` (pulsing rings), `animate-scanline` (sci-fi scanline effect), `animate-shimmer` (skeleton loading shimmer)
  - **Stadium grid background:** Subtle grid pattern overlay

### `src/setupTests.jsx` — Test Environment Setup
- **What it does:**
  - **localStorage mock** — Simulates localStorage in tests
  - **ResizeObserver, matchMedia, IntersectionObserver mocks** — DOM APIs that don't exist in JSDOM
  - **Auth0 SDK mock** — Mocks the `@auth0/auth0-react` package (tests don't depend on the Auth0 server)
  - **Recharts mock** — Mocks `ResponsiveContainer` (avoids SVG sizing issues)

---

## 📁 `src/context/` — React Context (Global State)

### `AuthContext.jsx` — Authentication State Manager
- **What it does:** Manages the entire app's authentication and user state:
  - **Dual auth support:** Auth0 SSO + Local JWT mock authentication
  - **Role-Permission mapping:** Admin, Manager, Operator, Security — each role's permissions are defined (manage:users, read:incidents, etc.)
  - **Auth0 sync flow:** After Auth0 login, syncs user data with the FastAPI backend; a fallback payload is also prepared
  - **Mock login:** Provides role-based mock login without Auth0 for development/demo purposes
  - **Token management:** Stores `sg_token` in localStorage, auto-logout on 401
  - **Sidebar state:** Persists collapsed/expanded state
  - **Active venue:** Persists the selected stadium ID
  - **Permission helpers:** `hasPermission('manage:users')`, `hasRole('admin')` functions
  - **Mobile sidebar drawer:** Manages open/close state
  - **Profile popup:** Controls user profile modal open/close

### `NotificationContext.jsx` — Real-time Notifications
- **What it does:**
  - Receives real-time notifications via an **SSE (Server-Sent Events) stream**
  - Establishes a secure SSE connection with the Bearer token in the header (token is not exposed in the URL)
  - Auto-reconnect: Reconnects after 5 seconds on error
  - Stores a **maximum of 50 notifications**
  - Provides functions: `markAllRead()`, `dismissNotification(id)`, `clearAll()`
  - Tracks unread count

---

## 📁 `src/lib/` — Utility Libraries

### `api.js` — HTTP API Client
- **What it does:** A centralized client for communicating with the backend:
  - **Automatic JWT injection:** Adds the Authorization header to every request
  - **Request ID:** Adds a unique `X-Request-ID` header to every request (for observability)
  - **401 handling:** Auto-redirects to `/login` when the token expires
  - **Retry with exponential backoff:** Retries 3 times on network errors or 500/429 responses
  - **AbortController support:** Requests can be cancelled during React useEffect cleanup
  - **Available methods:**
    - Auth: `getMe()`, `syncAuth0User()`, `logout()`, `getCsrfToken()`
    - Venues: `getVenues()`, `getVenueAlerts()`, `getVenueOccupancy()`, `getVenueHeatmap()`, `getVenueTimeseries()`, `getVenueConcessions()`
    - Analytics: `getAnalyticsTrends()`, `getAnalyticsOverview()`, `getAnalyticsPerformance()`, `getAnalyticsRevenue()`
    - Admin: `getAdminUsers()`, `updateAdminUserRole()`, `getAdminAuditLogs()`, `updateSystemConfig()`, `updateAiSettings()`
    - Manager: `getManagerDashboard()`, `assignStaff()`, `getManagerReports()`, `approveAiRecommendation()`, `allocateResources()`
    - Operator: `getCrowdAnalytics()`, `getIncidents()`, `createIncident()`, `updateIncident()`, `queryAiAssistant()`
    - Security: `getSecurityDashboard()`, `getCctvStatus()`, `verifyAlert()`, `respondToIncident()`, `updateEmergencyStatus()`

---

## 📁 `src/data/` — Mock Data

### `mockData.js` — Simulated Real-time Data
- **What it does:** Generates fake data when the backend is unavailable or for demo purposes:
  - **VENUES array:** 7 FIFA World Cup 2026 stadiums (MetLife, SoFi, AT&T, Arrowhead, Lumen Field, Estadio Azteca, BMO Field) with coordinates
  - **`generateOccupancy()`** — Generates random occupancy data for 8 zones
  - **`generateGateData()`** — Generates throughput, queue, and wait time data for 6 gates
  - **`generateConcessions()`** — Generates queue and revenue data for food courts and bars
  - **`generateAlerts()`** — Creates 6 types of alerts (crowd, security, medical, concession, transport, system)
  - **`generateTimeSeriesData()`** — Generates crowd density, gate flow, and temperature data for time-based charts
  - **`generateKPIs()`** — Generates key performance indicators for the dashboard
  - **`CHAT_MESSAGES`** — Pre-defined AI Assistant conversation for demo
  - **`generateStadiumHeatmap()`** — Generates a 12×16 grid stadium heatmap (for crowd density visualization)

---

## 📁 `src/components/` — Reusable UI Components

### `ProtectedRoute.jsx`
- **What it does:** Route guard — redirects to `/login` if the user is not authenticated; shows a skeleton during loading state

### `RoleGuard.jsx`
- **What it does:** Role-based route guard — if the user's role is not in the allowed roles list, displays an "Access Restricted" message and redirects to the dashboard after 3 seconds

### `PermissionGuard.jsx`
- **What it does:** Permission-level guard — if the user lacks a specific permission (e.g., `manage:users`), displays a "Permission Required" message with a lock icon

### `ScrollToTop.jsx`
- **What it does:** Scrolls the page to the top on route change (fixes SPA navigation behavior)

### `ErrorBoundary.jsx`
- **What it does:** A React class component that catches rendering errors — when a crash occurs, it displays a styled error page with "Reset & Retry" and "Return Home" buttons. Features a sci-fi themed error display with scanline animation

### `Sidebar.jsx`
- **What it does:** Main navigation sidebar:
  - **Role-based navigation:** Different navigation items for each role (admin, manager, security, operator)
    - Admin → Command Center, User Management, System Analytics, etc.
    - Security → Threat Dashboard, Incident Control, Zone Surveillance, etc.
  - **Role branding:** Each role has a unique color gradient, glow effect, and badge
  - **Collapsible:** Can be collapsed/expanded on desktop (state persists in localStorage)
  - **Mobile drawer:** Opens as a full-screen drawer on mobile with a backdrop overlay
  - **User info section:** Displays avatar, name, and email; clicking opens the profile popup
  - **Logout button** with navigation to the login page

### `TopBar.jsx`
- **What it does:** Top header bar displayed on every page:
  - Displays the page title and subtitle
  - **Live clock** — updates every second
  - **Search bar** — searches venues, zones, and alerts (desktop only)
  - **Status indicators:** 5G connection status, 47 Edge Nodes count
  - **Notification bell** — with unread count badge; clicking opens the NotificationPanel
  - **User avatar + profile dropdown** — shows name, role, email; includes Edit Profile, Settings, and Logout buttons
  - **Mobile hamburger menu** — opens the sidebar

### `BottomNav.jsx`
- **What it does:** Mobile bottom navigation bar — only visible on mobile via the `md:hidden` class
  - Role-specific navigation items (5 shortcuts per role)
  - Active route highlighted with cyan color

### `StadiumBackdrop.jsx`
- **What it does:** Animated SVG background — the visual backdrop for the entire application:
  - **Dynamic grid pattern** that changes color based on the user's role
  - **SVG stadium wireframe** — seating tiers, playing field, penalty areas, goal posts, center circle
  - **Pulsing IoT sensor dots** — 11 animated sensor/camera nodes around the stadium
  - **Ambient glow blurs** — soft glowing circles in the role's color
  - Wrapped with `memo()` — avoids unnecessary re-renders

### `StadiumHeatmap.jsx`
- **What it does:** Stadium crowd density heatmap visualization:
  - Displays a 12×16 grid with color-coded density cells
  - Colors: Green (low) → Cyan (moderate) → Amber (elevated) → Orange (high) → Red (critical)
  - "Playing Field" label in the center, zone labels (North, South, East, West)
  - Legend bar at the bottom
  - Hover effect: cell zoom + density percentage tooltip

### `StatCard.jsx`
- **What it does:** KPI statistic card component:
  - Displays icon, label, value, unit, and trend indicator (up/down/neutral)
  - 5 color themes: brand, accent, emerald, amber, rose — with glow effects
  - Entry animation with Framer Motion (fade up)

### `AlertCard.jsx`
- **What it does:** Alert/notification card:
  - 3 severity levels: Critical (red pulse), Warning (amber), Info (blue)
  - 6 alert types with icons: crowd, security, medical, concession, transport, system
  - Slide-in animation, timestamp display, description truncation

### `NotificationPanel.jsx`
- **What it does:** Dropdown notification feed panel (opens from the bell icon in the TopBar):
  - Displays real-time SSE notifications
  - Each notification: type icon, severity badge, title, message, relative timestamp
  - Unread indicator dot, Mark All Read, Clear All, and individual dismiss buttons
  - Empty state: "No notification alerts" message
  - Closes on click outside

### `NotificationToast.jsx`
- **What it does:** Bottom-right toast popups for new notifications:
  - Displays a maximum of 3 toasts simultaneously
  - Auto-dismisses after 5 seconds with an animated progress bar
  - Critical alerts get a pulsing red background
  - Spring animation for entrance/exit
  - Severity-specific styling (rose/amber/brand/emerald)

### `PWAInstallBanner.jsx`
- **What it does:** "Install StadiumGenius" banner:
  - Captures the browser's `beforeinstallprompt` event
  - Displays the banner after a 3-second delay
  - Registers the Service Worker — for offline support
  - Triggers the native install prompt when the Install button is clicked
  - On dismiss, saves to session storage (won't show again in the same session)

### `UserProfilePopup.jsx`
- **What it does:** Full-screen user profile modal:
  - Displays avatar, name, email (with verified badge), and role badge
  - Shows account status and last authentication time
  - Lists **all granted permissions** as chips (mono-font, scrollable list)
  - Session active indicator (animated pulse)
  - Sign Out button with a **confirmation modal** ("Are you sure?")

---

## 📁 `src/components/auth/` — Login/Register Page Widgets

### `AuthThemeToggle.jsx`
- **What it does:** Toggles between 4 color themes (Cosmos, Aurora, Sunset, Arctic) on Login/Register pages — changes the visual theme of the entire auth pages

### `MatchDayHypeWidget.jsx`
- **What it does:** Displays a live match countdown/score widget on the Login page — shows FIFA World Cup 2026 match day excitement (animated background, team flags, etc.)

### `AuthMascotWidget.jsx`
- **What it does:** Displays an animated mascot/avatar widget on the Login page — an interactive UI element that makes auth pages visually engaging

### `StadiumGateMapPreview.jsx`
- **What it does:** Displays a stadium gate map preview on the Login page — gives users a glimpse of the stadium layout before login

---

## 📁 `src/components/skeleton/` — Loading Skeleton Components

### `index.js` — Barrel export file
### `primitives.jsx` — Base skeleton shapes (rounded blocks, shimmer bars)
### `Skeleton.jsx` — Base skeleton component with shimmer animation
### `StatCardSkeleton.jsx` — Loading skeleton for StatCard
### `ChartSkeleton.jsx` — Loading skeleton for charts/graphs
### `TableSkeleton.jsx` — Loading skeleton for tables
### `TextSkeleton.jsx` — Loading skeleton for text blocks
### `AvatarSkeleton.jsx` — Loading skeleton for avatar circles
### `SidebarSkeleton.jsx` — Loading skeleton for the Sidebar
### `TopBarSkeleton.jsx` — Loading skeleton for the TopBar
### `PageSkeletonLayout.jsx` — Full page layout skeleton
### `page-skeletons.jsx` — Page-specific skeletons:
  - `DashboardSkeleton`, `SecuritySkeleton`, `ConcessionsSkeleton`, `AnalyticsSkeleton`, `BroadcastSkeleton`, `DigitalTwinSkeleton`, `CrowdManagementSkeleton`, `AIAssistantSkeleton`, `SettingsSkeleton`, `AdminPanelSkeleton`, `FanPortalSkeleton`, `AuthPageSkeleton`, `AppShellSkeleton`, `RouteFallbackSkeleton`

**What they do:** Display realistic shimmer placeholders until the actual data loads — provides a better UX than blank white pages or spinners (more professional feel).

---

## 📁 `src/pages/` — Application Pages

### `Login.jsx` — Login Page
- **What it does:**
  - **Dual login system:** Auth0 SSO + Direct mock login (for development)
  - **Role selector:** Users can select from 4 roles (Admin, Manager, Security, Operator) — each role has a unique color theme
  - Email + password fields (for mock login)
  - "Remember me" checkbox, "Forgot Password" link
  - Auth0 login button ("Sign in with Auth0") — social login support
  - **Visual elements:** Stadium backdrop, animated scanline, role-themed glow effects
  - Auth theme toggle, MatchDay hype widget, mascot widget, gate map preview
  - Link to the Register page

### `Register.jsx` — Registration Page
- **What it does:**
  - Name, email, password, and confirm password fields
  - **Role selection** dropdown — Operator, Security, Manager, Admin
  - Password strength validation
  - Mock registration (backend API call or local state update)
  - Same visual styling as the Login page — stadium backdrop, role-themed colors
  - Link to the Login page

### `Dashboard.jsx` — Main Dashboard
- **What it does:**
  - **Role-specific dashboard:** Each role gets a different title, subtitle, color theme, and quick action buttons:
    - Admin → "Command Center" with User Management, System Analytics, Broadcast Control, Security Overview
    - Manager → "Operations Dashboard" with Revenue & KPIs, Concessions Sales, Crowd Flow
    - Security → "Threat Dashboard" with Incident Control, Zone Surveillance, Emergency Alerts
    - Operator → "Live Dashboard" with Digital Twin, Crowd Management, Concessions
  - **KPI stat cards:** Total Fans, Queue Time, Incidents Resolved, Active Alerts, Fan Satisfaction, Edge Node Uptime
  - **Live time-series chart** (AreaChart) — crowd density over time
  - **Stadium heatmap** — real-time crowd density visualization
  - **Alert feed** — latest alerts with severity indicators
  - **Bar chart** — zone occupancy visualization
  - Fetches data from the API, falls back to mock data when unavailable
  - 15-second auto-refresh interval

### `Security.jsx` — Security Operations Page (896 lines — the largest page!)
- **What it does:**
  - **6 security zones** with status (secure/elevated/alert), camera count, patrol count, and last sweep time
  - **CCTV camera feeds** (8 feeds) — camera ID, location, zone, status, anomaly detection
  - **Access control log** — credential scans, badge verifications, denied entries, alarm triggers
  - **Incident management:** Active incidents list, create new incident, update status, assign responders
  - **Emergency level control:** DEFCON-style security levels (Normal → Elevated → High → Critical)
  - **Security analytics:** AreaChart showing security events over time
  - **Stat cards:** Active threats, cameras online, incidents today, response time
  - Zone detail modal with expanded information

### `AdminPanel.jsx` — Admin User Management
- **What it does:**
  - **User management table:** Lists all users with name, email, role, and status
  - **Role change:** Admin can change any user's role (via dropdown)
  - **Search + filter** users
  - **Audit log feed:** Real-time actions log (who did what, when)
  - **System health dashboard:** API Server, Database, AI Engine, SSE Stream, Camera Grid — shows status, uptime, and latency
  - Role-specific color badges
  - Fetches users from the API, sends role update POST requests

### `Analytics.jsx` — KPI Analytics Page
- **What it does:**
  - **6 KPI cards:** Queue Time Reduction (-47%), Incident Response (-67%), Auto-resolved Events (84%), Fan NPS (4.8/5.0), Transport Efficiency (+32%), AI Prediction Accuracy (94.2%)
  - **AreaChart** — trends over time (revenue, crowd, incidents)
  - **RadarChart** — multi-dimensional performance comparison
  - **BarChart** — venue/zone comparison
  - Fetches analytics data from the API

### `Broadcast.jsx` — Broadcast & Media Control
- **What it does:**
  - **6 camera feeds** displayed — Main Camera (4K HDR 60fps), Tactical Overhead, Referee Bodycam (120fps), Goal-line (240fps Super Slow), 3D Avatar Replay, Fan Cam
  - Selected feed large preview with play/pause, volume, and fullscreen controls
  - **AI overlays list:** Player Tracking Heatmap, Ball Speed, Tactical Formation, xG Probability, Sprint Distance, Offside Line
  - **AI-generated highlights:** Goals, cards, saves with confidence scores and clip counts
  - **Broadcast messaging system:** Send messages to all channels, PA system, and digital signage
  - New broadcast form with title, message, channel selector, and priority
  - **Stat cards:** Live viewers, camera feeds, AI overlays active, highlights generated

### `Concessions.jsx` — Concessions & Food Service
- **What it does:**
  - **Revenue line chart** — time-based revenue tracking
  - **Category breakdown pie chart** — food, beverages, snacks, premium
  - **Concession stands list** — name, type, queue length, average wait time, revenue, status (operational/high-demand)
  - **Stat cards:** Total revenue, average queue time, express lanes active, orders/hour
  - Fetches concession data from the API

### `CrowdManagement.jsx` — Crowd Flow Management
- **What it does:**
  - **Zone occupancy cards** — occupancy %, capacity, current count, and trend (rising/stable) for 8 zones
  - **Time-series line chart** — crowd density changes over time
  - **Radial bar chart** — zone-wise occupancy comparison
  - **Gate throughput data** — flow rate and queue length for each gate
  - **Stat cards:** Total fans, average density, congested zones, gate throughput
  - Real-time data refresh with API calls

### `DigitalTwin.jsx` — 3D Digital Twin View
- **What it does:**
  - **Stadium heatmap** visualization — visual representation of crowd density
  - **Layer toggles:** Switch between Density, Temperature, Air Quality, and Connectivity layers
  - **Gate status cards** — throughput, queue, status (open/congested)
  - **Zone selector** — clicking shows zone details
  - **Environmental data:** Temperature, wind speed, and humidity widgets
  - Auto-refreshes every 4 seconds (real-time simulation)
  - Zoom, rotate, and fullscreen controls (UI only — no actual 3D rendering)

### `AIAssistant.jsx` — AI Chat Interface
- **What it does:**
  - **Chat interface** — a ChatGPT-like conversational UI
  - User types a message, and an AI response appears (from the API or a mock response)
  - **Role-specific styling:** Admin → Rose, Manager → Violet, Security → Amber, Operator → Blue
  - **Suggested prompts:** Pre-defined questions that the user can click
  - Typing indicator animation, auto-scroll to the latest message
  - Copy, thumbs up/down feedback buttons per message
  - Session ID per conversation
  - Microphone and attachment buttons (UI placeholders)

### `FanPortal.jsx` — Fan-facing Mobile App View
- **What it does:** A mobile-optimized portal for stadium visitors:
  - **Live match score:** Brazil 🇧🇷 2 - 1 Argentina 🇦🇷, minute, venue
  - **Digital ticket:** Section, row, seat, gate, and ticket ID with a QR code placeholder
  - **Food ordering system:** Full menu (Hot Food, Drinks, Snacks) with prices, add to cart, and quantity controls
  - **Cart system:** Add/remove items, calculate total, "Order to Seat" button
  - **Stadium seat map:** Section-wise occupancy visualization
  - **Live stats:** Fan satisfaction, queue times, crowd level
  - No authentication required (public page)

### `Settings.jsx` — Settings & Configuration
- **What it does:**
  - **Venue Configuration:** Active venue selector, edge node auto-discovery toggle, telemetry refresh rate
  - **Notifications:** Push notifications, SMS alerts, email digest, and alert sound toggles
  - **Security & Privacy:** 2-Factor auth, session timeout, and data sharing toggles
  - **Display:** Dark mode, compact view, animations, and high contrast toggles
  - **System Info:** API endpoint, database, AI engine status, and environment information
  - Toggle switches with smooth animation

### `NotFound.jsx` — 404 Page
- **What it does:** Displays a "404 — Sector Uncharted" styled error page — stadium themed design with "Go Back" and "Return Home" buttons, scanline animation, and ambient glows

---

## 📁 `src/__tests__/` — Frontend Unit Tests

### `Login.test.jsx`
- **What it does:** Tests for the Login page — rendering, form validation, role selection, and mock login flow

### `Register.test.jsx`
- **What it does:** Tests for the Register page — form rendering, validation, and password matching

### `AuthContext.test.jsx`
- **What it does:** Tests for AuthContext — login, logout, token management, role permissions, and mock auth flow

### `ErrorBoundary.test.jsx`
- **What it does:** Tests for the ErrorBoundary component — error catching, error display, and reset functionality

### `Accessibility.test.jsx`
- **What it does:** Accessibility tests — ARIA labels, keyboard navigation, and screen reader support

---

## 📁 `src/assets/` — Static Assets
- `hero.png` — Hero image/logo
- `react.svg` — React logo
- `vite.svg` — Vite logo

---

## 📁 `server/` — Backend Server (Dual: Express + FastAPI)

### Express Server (Node.js — Legacy/Demo)

#### `server/index.js` — Express Server Entry Point
- **What it does:**
  - Auto-generates JWT_SECRET if it's not set in `.env` (logs a warning)
  - Creates database tables and seeds initial data
  - **CORS setup:** Allows localhost:5173, 5178, and 3000
  - **Rate limiting:** Max 20 (production) / 200 (development) requests per 15-minute window on auth endpoints
  - **Security headers:** X-Content-Type-Options, X-Frame-Options, CSP, HSTS, etc.
  - **Mounts routes:** `/api/auth`, `/api/venues`, `/api/incidents`, `/api/analytics`, `/api/broadcast`, `/api/ai`, `/api/users`, `/api/notifications`
  - Health check endpoint: `/api/health`
  - 404 handler, global error handler

#### `server/db/database.js` — SQLite Database Setup (Express)
- **What it does:**
  - Creates/connects to an SQLite database using Node.js native `DatabaseSync`
  - Enables WAL mode (better concurrent performance)
  - **Creates tables:** users, venues, zones, incidents, broadcasts, analytics, user_sessions
  - **Seeds data:** 7 FIFA WC 2026 venues, 8 zones per venue, and initial analytics entries

#### `server/middleware/auth.js` — JWT Authentication Middleware (Express)
- **What it does:**
  - Extracts the Bearer token from the Authorization header
  - **3-tier token validation:**
    1. Mock/test tokens — extracts the role and sets req.user
    2. Locally-signed JWT (verified with Express JWT_SECRET)
    3. Auth0 RS256 tokens — decodes and extracts the role (development fallback)
  - Returns a 401 response for invalid/expired tokens

#### `server/utils/sanitize.js` — Data Sanitization
- **What it does:** Removes the `password` field from user objects before sending them to the client

#### `server/routes/` — Express API Routes

- **`auth.js`** — Login (email/password → JWT token), Register (hash password → create user → JWT), logout, CSRF token generation
- **`venues.js`** — GET venues list, venue details, zone occupancy, heatmap data, timeseries data, concessions data, alerts
- **`incidents.js`** — CRUD operations for security incidents (create, read, update, delete with role checks)
- **`analytics.js`** — Trends, overview, performance metrics, and revenue data endpoints
- **`broadcast.js`** — Send broadcasts (PA system messages), get broadcast history per venue
- **`ai.js`** — AI assistant chat endpoint — receives a user prompt, returns a simulated AI response with stadium context
- **`users.js`** — User profile update, password reset, admin user management
- **`notifications.js`** — **SSE (Server-Sent Events) stream** — pushes real-time notifications to connected clients. Authenticates via Bearer token, periodically generates mock notifications

---

### FastAPI Server (Python — Primary/Production)

#### `server/app/main.py` — FastAPI Application
- **What it does:**
  - Creates the FastAPI app with lifespan hooks (startup/shutdown)
  - **Startup:** Creates database tables, seeds roles/permissions/system config
  - **Middleware stack (order matters):**
    1. CORS middleware
    2. SecurityHeadersMiddleware
    3. InMemoryRateLimiterMiddleware (120 req/min)
    4. CSRFProtectionMiddleware
  - Request ID middleware (for traceability)
  - **Includes API routers:** auth, admin, manager, operator, security (all under `/api/v1`)
  - Health check endpoint: `/health`
  - Global exception handlers (401, 403, 500)
  - OpenAPI docs: `/api/v1/docs`, `/api/v1/redoc`

#### `server/app/config.py` — Settings & Configuration
- **What it does:**
  - Uses Pydantic `BaseSettings` — auto-loads from the `.env` file
  - **Auth0 config:** Domain, audience, issuer, algorithms (RS256)
  - **Database URL:** Default SQLite
  - **Security secrets:** `SECRET_KEY` and `CSRF_SECRET` — required in production, auto-generated in development
  - **CORS origins:** localhost + production domain
  - **Mock tokens:** Only allowed in development mode

#### `server/app/core/auth0.py` — Auth0 JWT Validator
- **What it does:**
  - **ROLE_PERMISSIONS_MAP:** Defines permissions for each role (admin: manage:users, manage:roles... ; operator: login, read:dashboard...)
  - **Auth0JWTValidator class:**
    - Fetches the RS256 signing key from the JWKS endpoint (cached)
    - Verifies the JWT signature, checks issuer, audience, and expiry
    - **Mock token support:** Returns role-based payloads for tokens like `mock-admin-jwt-token`
    - Properly simulates errors for `expired`, `invalid`, and `corrupt` tokens
    - `_enrich_permissions()` — Extracts permissions from custom namespace claims or falls back to role-based permissions

#### `server/app/core/security.py` — Security & RBAC
- **What it does:**
  - **`log_audit_action()`** — Writes an audit log entry to the database for every important action (who, what, when, from where)
  - **`get_current_user()`** — A FastAPI dependency that:
    1. Validates the JWT token
    2. Syncs the user into the database (new user → create, existing → update last_login)
    3. Blocks suspended accounts
  - **`require_permission()`** — RBAC enforcement — checks for a specific permission (e.g., `manage:users`)
  - **`require_role()`** — Role-based access check (admin is always allowed)

#### `server/app/db/database.py` — Database Connection
- **What it does:**
  - Creates the SQLAlchemy engine (SQLite or PostgreSQL)
  - `SessionLocal` — database session factory
  - `get_db()` — FastAPI dependency for database session injection
  - WAL mode support for SQLite

#### `server/app/db/models.py` — Database Models (ORM)
- **What it does:** Defines 10 database tables:
  - **`UserModel`** — id, auth0_id, email, name, avatar, role, account_status, email_verified, last_login, soft-delete
  - **`RoleModel`** — name, description
  - **`PermissionModel`** — code, description
  - **`AuditLogModel`** — user_id, action, resource, ip_address, user_agent, status, details, timestamp
  - **`IncidentModel`** — title, description, severity, category, status, location, created_by, assigned_to
  - **`SystemConfigModel`** — key-value configuration store
  - **`VenueModel`** — venue_code, name, city, country, capacity, coordinates, timezone, status (relationships: zones, gates)
  - **`ZoneModel`** — code, name, venue_id, capacity, zone_type (general/vip/field)
  - **`GateModel`** — name, venue_id, gate_type (entry/exit/emergency), status, throughput, queue_length
  - **`SensorModel`** — sensor_id, type (camera/thermal/crowd/air_quality), location, status, last_reading
  - **`AIRecommendationModel`** — recommendation_type, title, confidence, status (pending/approved/rejected)
  - **`CrowdSnapshotModel`** — venue_code, zone_code, density, occupancy_pct, flow_rate
  - **`EmergencyModel`** — level (NORMAL/ELEVATED/HIGH/CRITICAL), reason, activated_by

#### `server/app/schemas/user.py` — Pydantic Schemas
- **What it does:** Defines API request/response validation schemas:
  - `UserBase`, `UserCreate`, `UserProfileUpdate`, `UserUpdateRole`, `UserResponse`
  - `PermissionSchema`, `RoleSchema`
  - `AuditLogResponse`
  - `IncidentCreate`, `IncidentUpdate`, `IncidentResponse`
  - `SystemConfigUpdate`

---

### FastAPI Middleware

#### `server/app/middleware/security_headers.py`
- **What it does:** Sets enterprise security headers on every response:
  - HSTS (1 year), X-Frame-Options DENY, X-Content-Type-Options nosniff
  - Referrer-Policy, Permissions-Policy (camera, microphone, geolocation disabled)
  - Content-Security-Policy — restricts script/style/connect sources
  - No-cache headers for API responses

#### `server/app/middleware/rate_limit.py`
- **What it does:** An in-memory sliding window rate limiter:
  - General endpoints: 120 requests per minute
  - Auth endpoints: 30 requests per minute (brute-force protection)
  - Health/docs endpoints are exempt
  - Tracks up to 10,000 IPs — performs an emergency cleanup during DDoS scenarios
  - Periodic stale entry cleanup every 30 seconds

#### `server/app/middleware/csrf.py`
- **What it does:** CSRF (Cross-Site Request Forgery) protection:
  - Checks state-changing requests (POST/PUT/DELETE/PATCH)
  - Bearer token APIs bypass the check (header-based auth is immune to CSRF)
  - For cookie-based auth, matches the `sg_csrf_token` cookie against the `X-CSRF-Token` header
  - Returns a 403 response with a warning log on mismatch

---

### FastAPI Endpoints

#### `server/app/api/v1/endpoints/auth.py`
- **What it does:** Auth0 user sync, get current user profile (`/auth/me`), logout, and CSRF token generation

#### `server/app/api/v1/endpoints/admin.py`
- **What it does:** Admin-only endpoints — user list, role change, audit logs, system config update, AI settings (requires `manage:users` permission)

#### `server/app/api/v1/endpoints/manager.py`
- **What it does:** Manager endpoints — dashboard summary, staff assignment, reports, AI recommendation approval, and resource allocation

#### `server/app/api/v1/endpoints/operator.py`
- **What it does:** Operator endpoints — crowd analytics, incident CRUD, and AI assistant queries

#### `server/app/api/v1/endpoints/security.py`
- **What it does:** Security endpoints — security dashboard, CCTV status, alert verification, incident response, and emergency status updates

---

## 📁 `server/__tests__/` & `server/tests/` — Backend Tests

### `server/__tests__/api.test.js`
- **What it does:** Supertest-based integration tests for the Express API — auth routes, venue endpoints, and error handling

### `server/tests/test_auth_rbac.py`
- **What it does:** FastAPI RBAC tests — role-based access control verification, permission enforcement, and token validation

### `server/tests/conftest.py`
- **What it does:** Pytest fixtures — test database setup and test client creation

---

## 📁 `public/` — Static Public Assets

### `favicon.svg` — Browser tab icon (stadium themed SVG)
### `icons.svg` — SVG icon sprite sheet
### `manifest.json` — PWA manifest — app name, icons, theme color, display mode, and shortcuts
### `sw.js` — Service Worker:
  - **Install phase:** Pre-caches core static assets (index.html, /fan, manifest.json)
  - **Activate phase:** Deletes old caches
  - **Fetch strategy:** Static assets → Cache-first, API calls → Network-first with cache fallback
  - **Push notifications:** Handles push events — displays notifications with action buttons (View, Dismiss)
  - **Notification click:** Opens the app or navigates to a specific URL

### `public/icons/` — PWA Icons
- `icon-96.png`, `icon-192.png`, `icon-512.png`, `icon.svg` — Different sizes for different devices

---

## 📁 `e2e/` — End-to-End Tests

### `auth.spec.js`
- **What it does:** Playwright browser tests — login page loading, authentication flow, and redirect behavior

### `performance.spec.js`
- **What it does:** Performance tests — page load time and FCP (First Contentful Paint) measurement

---

## 📁 `.github/workflows/` — CI/CD Pipeline

### `ci.yml`
- **What it does:** GitHub Actions CI pipeline (runs on every push/PR to main):
  - **Frontend job:** Node.js 20 setup → `npm ci` → `npm run lint` → `npm run build`
  - **Backend job:** Python 3.12 setup → `pip install` → `pytest server/tests/`
  - **Docker job:** After Frontend + Backend succeed, verifies the Docker image build

---

## 📁 `docs/` — Project Documentation

- **`AUDIT_REPORT.md`** — Security audit findings and recommendations
- **`SYSTEM_GUIDE.md`** — System setup and operation guide
- **`ai-workflows.md`** — AI/ML integration workflows documentation
- **`api.md`** — Complete API documentation (endpoints, request/response formats)
- **`architecture.md`** — System architecture description (frontend, backend, database, auth flow)
- **`data-flow.md`** — Data flow diagrams (how data moves through the system)
- **`database-schema.md`** — Complete database schema documentation
- **`deployment.md`** — Deployment instructions (Docker, cloud, local)
- **`mvp-roadmap.md`** — MVP features and future roadmap
- **`security.md`** — Security policies, RBAC model, and encryption details
- **`testing.md`** — Testing strategy, test coverage, and how to run tests
- **`user-stories.md`** — User stories and feature requirements

---

## 🔄 System Flow Summary

```
User Opens App
  ↓
main.jsx → Auth0Provider + BrowserRouter wrap
  ↓
App.jsx → Route matching
  ↓
Login/Register (public) OR ProtectedRoute → RoleGuard → Page
  ↓
Page fetches data via api.js → FastAPI Backend (/api/v1/*)
  ↓
FastAPI validates JWT → Auth0 JWKS verification OR mock token
  ↓
RBAC check (require_permission / require_role)
  ↓
SQLite database query/mutation
  ↓
Response → Frontend renders with Recharts, Framer Motion
  ↓
SSE stream → Real-time notifications via NotificationContext
```

---

> **Total files analyzed:** 80+ source files across frontend, backend, tests, configuration, and documentation.
