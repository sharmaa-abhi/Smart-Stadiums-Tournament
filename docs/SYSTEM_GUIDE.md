# 🏟️ StadiumGenius — Main System Guide & Agent Reference

> **Version:** 1.0.0  
> **Last Updated:** July 2026  
> **Status:** Active MVP Implementation  
> **Target Audience:** Developers, AI Coding Agents, and System Operators  

---

## 🎯 Purpose of this Guide

This document serves as the **single source of truth** for understanding the actual architecture, database schema, data flows, and code structure implemented in this repository. 

Many of the detailed design documents in the `docs/` folder (such as `architecture.md`, `database-schema.md`, `api.md`, and others) outline the **Target Production/Enterprise Architecture** (intended for 80,000+ seat stadiums running multi-instance FastAPI, TimescaleDB, Neo4j, Apache Kafka, and NVIDIA Jetson hardware).

This guide provides a direct bridge between that target vision and the **currently running working MVP** in this repository.

---

## 🗺️ Architectural Mapping: MVP vs. Target Enterprise

Here is how the conceptual architecture translates to the actual code running in this project today:

| System Layer | Current MVP Implementation (Real Code) | Target Enterprise Architecture (Conceptual Docs) |
|--------------|--------------------------------------|--------------------------------------------------|
| **Frontend UI** | React 19 + Vite 8 + Tailwind CSS v4 + Framer Motion + Recharts | React + Vite + Tailwind CSS v4 + Framer Motion + Recharts |
| **Backend API** | **Node.js + Express** (located in `server/`) | **Python + FastAPI** (planned under `backend/`) |
| **Operational DB** | **SQLite (`node:sqlite` in memory/file)** | **PostgreSQL 16** |
| **Time-Series / Telemetry**| Simulated data dynamically piped via SSE | **TimescaleDB** |
| **Spatial / Graph DB** | Hardcoded grid layouts & relative coordinates | **Neo4j 5** |
| **Streaming / Ingestion** | Local JS event triggers & setIntervals | **Apache Kafka + Apache Flink + MQTT** |
| **AI Assistant** | Local keyword-matching knowledge base | **Google Gemini 2.0 / GPT-4o + Pinecone RAG** |
| **Two-Factor Auth** | Basic JWT user login & routing guards | **Speakeasy MFA + Twilio SMS OTP** |
| **Evidence Vault** | SQLite text records | **Google Cloud Storage (GCS) + signing keys** |

---

## 📂 Project Directory Map

When inspecting this project, keep in mind this directory structure:

```
Smart-Stadiums-Tournament/
│
├── README.md                    # Main project overview (Real Stack + Quick Start)
├── FUTURE_ROADMAP.md            # Checklist of future features & priority matrix
├── package.json                 # Frontend dependencies (React 19, Tailwind v4, etc.)
├── vite.config.js               # Vite bundler configuration with PWA plugin
├── index.html                   # Main single-page HTML entry point
│
├── src/                         # 🖥️ FRONTEND SOURCE (React)
│   ├── App.jsx                  # React Router v7 routes & Role Gating
│   ├── main.jsx                 # Client entry point
│   ├── components/              # Skeletons, Sidebars (per-role), TopBar, & widgets
│   ├── context/                 # AuthContext (stores token, user, role, profile)
│   ├── data/                    # Local constant JSON data (CCTV feeds list, etc.)
│   ├── lib/                     # Client libraries (axios wrapper config in `api.js`)
│   └── pages/                   # Feature views (Digital Twin, Concessions, Security, AI Chat)
│
├── server/                      # ⚙️ BACKEND SOURCE (Express)
│   ├── index.js                 # API server main file (starts on port 5000)
│   ├── package.json             # Backend dependencies (express, jwt, sqlite)
│   ├── db/                      # DB initialization & Seed scripts (`stadiumgenius.db`)
│   ├── middleware/              # Auth guard (`auth.js`) for incoming tokens
│   └── routes/                  # API endpoints (ai, analytics, incidents, alerts, etc.)
│
└── docs/                        # 📚 DOCUMENTATION SUITE
    ├── SYSTEM_GUIDE.md          # This file (Agent main index)
    ├── architecture.md          # Detailed Target Architecture (FastAPI/Kafka/Neo4j)
    ├── database-schema.md       # Target Polyglot Schema (PostgreSQL/Timescale/Neo4j)
    ├── api.md                   # Target REST & WebSocket API references
    ├── data-flow.md             # Ingestion pipelines & sequence flows
    ├── ai-workflows.md          # LLM & Vision edge workflows
    ├── deployment.md            # Kubernetes, Docker, and edge scripting
    ├── security.md              # Zero Trust & authentication plans
    ├── testing.md               # Testing strategies & cases
    └── user-stories.md          # Consolidator notes
```

---

## 🗄️ Database Schema: SQLite Actual Setup

The database in the MVP is SQLite, initialized and seeded in [server/db/database.js](file:///c:/Users/ABHI%20SHARMA/OneDrive/Desktop/projects/Smart-Stadiums-Tournament/server/db/database.js). It contains 6 tables:

### 1. `users`
Stores user profile credentials, password hashes, and operational roles.
* `id` (INTEGER, Primary Key, Autoincrement)
* `name` (TEXT)
* `email` (TEXT, Unique)
* `password` (TEXT, Bcrypt hashed)
* `role` (TEXT, Default 'operator') — Roles include `admin`, `manager`, `operator`, `security`.
* `avatar` (TEXT, Nullable URL)
* `created_at` (DATETIME)

### 2. `venues`
Primary venue definition.
* `id` (TEXT, Primary Key)
* `name` (TEXT)
* `city` (TEXT)
* `capacity` (INTEGER)
* `country` (TEXT)
* `lat` (REAL), `lng` (REAL)

### 3. `incidents`
Incident tracking logs.
* `id` (INTEGER, Primary Key, Autoincrement)
* `incident_id` (TEXT, Unique) — Format: `INC-2026-XXXX`
* `type` (TEXT) — e.g., 'Unauthorized Access', 'Lost Child', 'Medical Emergency'
* `zone` (TEXT) — e.g., 'VIP Level 3', 'Section 204'
* `time` (TEXT)
* `status` (TEXT, Default 'active') — States: `active`, `monitoring`, `investigating`, `resolved`
* `priority` (TEXT, Default 'medium') — Priorities: `critical`, `high`, `medium`, `low`
* `response` (TEXT) — Dispatch duration (e.g., '12s')
* `assignee` (TEXT) — Patrol units (e.g., 'Team Delta')
* `venue_id` (TEXT, Foreign Key)
* `description` (TEXT)
* `created_by` (INTEGER, Foreign Key)
* `created_at` (DATETIME)

### 4. `alerts`
System alerts pushed to the telemetry feeds.
* `id` (INTEGER, Primary Key, Autoincrement)
* `type` (TEXT) — e.g., 'crowd', 'security', 'medical', 'system'
* `severity` (TEXT) — e.g., 'critical', 'warning', 'info'
* `title` (TEXT)
* `description` (TEXT)
* `time` (TEXT)
* `venue_id` (TEXT, Foreign Key)
* `created_at` (DATETIME)

### 5. `broadcast_messages`
Venue-wide announcements.
* `id` (INTEGER, Primary Key, Autoincrement)
* `title` (TEXT)
* `message` (TEXT)
* `channel` (TEXT) — e.g., 'all', 'screens', 'pa', 'app'
* `priority` (TEXT) — e.g., 'normal', 'high', 'urgent'
* `status` (TEXT) — e.g., 'active', 'scheduled', 'expired'
* `venue_id` (TEXT, Foreign Key)
* `created_by` (INTEGER, Foreign Key)
* `created_at` (DATETIME)
* `expires_at` (DATETIME)

### 6. `ai_conversations`
History log for the AI Operations Assistant.
* `id` (INTEGER, Primary Key, Autoincrement)
* `session_id` (TEXT) — UUID grouping conversations
* `role` (TEXT) — 'user' or 'assistant'
* `content` (TEXT)
* `user_id` (INTEGER, Foreign Key)
* `created_at` (DATETIME)

---

## 🔌 API Summary: Implemented Endpoints

The active server runs on **port 5000** with prefix `/api`.

### Authentication (`/api/auth`)
* `POST /api/auth/register` — Create a new user (with specified role).
* `POST /api/auth/login` — Log in and return user metadata, role, and JWT token.
* `GET /api/auth/profile` — Fetch details of the currently logged-in user (authenticated).
* `PUT /api/auth/profile` — Update user profile details (authenticated).
* `PUT /api/auth/change-password` — Change password (authenticated).

### Venues (`/api/venues`)
* `GET /api/venues` — Fetch list of all 7 seeded venues.
* `GET /api/venues/:id/kpis` — Return real-time KPIs.
* `GET /api/venues/:id/sse` — **Server-Sent Events** endpoint for live, streaming KPI updates.

### Incidents (`/api/incidents`)
* `GET /api/incidents` — Fetch list of incidents for the active venue.
* `POST /api/incidents` — Log a new incident.
* `PUT /api/incidents/:id` — Update incident status, priority, description, or assignee.
* `DELETE /api/incidents/:id` — Remove an incident.

### Broadcast (`/api/broadcast`)
* `GET /api/broadcast` — Fetch active announcements.
* `POST /api/broadcast` — Create/Publish a new announcement.
* `DELETE /api/broadcast/:id` — Terminate a broadcast.

### AI Assistant (`/api/ai`)
* `POST /api/ai/chat` — Smart query assistant. Stores thread to `ai_conversations`. Uses local keyword-responses KB.
* `GET /api/ai/history` — Fetch chat messages for a given `session_id`.
* `GET /api/ai/suggestions` — Fetch prompt suggestions.

### Analytics (`/api/analytics`)
* `GET /api/analytics/overview` — Fetch total attendance/revenue/satisfaction metrics across all venues.
* `GET /api/analytics/trends` — Return simulated 7-day trend data.
* `GET /api/analytics/performance` — Return simulated zone-wise performance scores.
* `GET /api/analytics/revenue` — Return simulated concession/merchandise revenue hourly splits.

---

## 🤖 Guidance for Future Agent Contributions

If you are an AI assistant tasked with extending this repository:

1. **Keep it Node-aligned**: Do not write Python files for backend APIs unless explicitly asked to migrate the Express backend to FastAPI. Stick to [server/index.js](file:///c:/Users/ABHI%20SHARMA/OneDrive/Desktop/projects/Smart-Stadiums-Tournament/server/index.js) and the Express routes.
2. **SQLite Compatible**: All SQL operations must utilize the standard node:sqlite client initialized in [server/db/database.js](file:///c:/Users/ABHI%20SHARMA/OneDrive/Desktop/projects/Smart-Stadiums-Tournament/server/db/database.js).
3. **Tailwind v4 UI**: Design additions should make use of the modern CSS architecture defined in [src/index.css](file:///c:/Users/ABHI%20SHARMA/OneDrive/Desktop/projects/Smart-Stadiums-Tournament/src/index.css) using Tailwind CSS v4 variables and dynamic UI primitives.
4. **API Integration Guidelines**: Check [src/lib/api.js](file:///c:/Users/ABHI%20SHARMA/OneDrive/Desktop/projects/Smart-Stadiums-Tournament/src/lib/api.js) when linking a new frontend components to APIs. Keep logic grouped under Axios exports.
