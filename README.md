# 🏟️ StadiumGenius

<div align="center">

### AI-Powered Smart Stadium Operations Platform

**FIFA World Cup 2026 · Digital Twins · IoT · Generative AI**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](#license)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev)
[![Express](https://img.shields.io/badge/Express-5.1-000000?logo=express)](https://expressjs.com)
[![SQLite](https://img.shields.io/badge/SQLite-3.x-003B57?logo=sqlite)](https://sqlite.org)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite)](https://vite.dev)

---

*Transform stadium operations with real-time AI-driven crowd management, predictive analytics, and intelligent decision support — designed for 80,000+ seat FIFA World Cup 2026 venues.*

</div>

---

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Quick Start](#quick-start)
- [Current Achievements](#current-achievements)
- [Future Work](#future-work)
- [React + Vite Template Info](#react--vite-template-info)
- [License](#license)

---

## 🎯 Project Overview

**StadiumGenius** is an enterprise-grade, AI-powered smart stadium operations platform built for FIFA World Cup 2026 venues. It combines cutting-edge frontend design with real-time capabilities to deliver crowd management, security orchestration, concession optimization, and operational intelligence.

### The Problem

Managing 80,000+ fans in a World Cup stadium involves:

- **Safety risks** from crowd density buildup at gates, corridors, and concessions
- **Slow incident response** — average 45+ seconds to detect and dispatch
- **Blind spots** — operators lack unified real-time visibility across camera grids, gates, and concession points
- **Reactive operations** — decisions made after problems occur, not before

### Our Solution

StadiumGenius provides a **unified command center** with:

| Capability | Impact |
|-----------|--------|
| **AI-Powered Digital Twin** | Live interactive visualization of stadium zones and occupancy state |
| **Crowd Management** | Real-time density tracking and redirection triggers |
| **Generative AI Assistant** | Natural-language operational queries backed by database context |
| **Security & Patrols** | Interactive incident log, priority tracking, and broadcasts |

---

## ✨ Key Features

### 🖥️ Operator Dashboard

Real-time command center with live KPIs, crowd density overview, gate throughput, weather monitoring, and an automated alert feed. Powered by SSE (Server-Sent Events) live updates.

### 🏗️ Digital Twin Engine

Multi-layer visualization of the stadium including crowd density, security zones, and gate/infrastructure status.

### 👥 Crowd Management

Zone-by-zone occupancy tracking with capacity meters, crowd status logs, and dynamic corridor redirection controls.

### 🍔 Concession Analytics

Queue monitoring, wait time tracking, and express lane activation flows for concession zones.

### 🤖 AI Operations Assistant

Conversational assistant supporting operational queries regarding crowd density, incidents, weather, concessions, and announcements.

### 🛡️ Security & Broadcasts

Patrol unit allocations, active incident workflows (Active -> Investigating -> Resolved), and venue-wide public announcement (PA)/app broadcast creation panel.

---

## 🛠️ Technology Stack

### Frontend

- **React 19**: Component-based user interface.
- **Vite 8**: Frontend tooling and fast HMR.
- **Tailwind CSS v4**: Modern utility-first styling.
- **Framer Motion 12**: Smooth UI transitions and micro-interactions.
- **Recharts 3.x**: Data visualization and metric charts.
- **Lucide React**: Clean vector icon pack.

### Backend

- **Node.js & Express**: Lightweight, robust API server.
- **SQLite (`node:sqlite`)**: Local storage with seeded schemas for venues, alerts, incidents, and messages.
- **JSON Web Tokens (JWT)**: Secure role-based user sessions and authentication middleware.

---

## 📂 Project Structure

```
Smart-Stadiums-Tournament/
│
├── README.md                    # Main project overview (merged)
├── FUTURE_ROADMAP.md            # Detailed implementation plan & priority matrix
├── package.json                 # Frontend dependencies (React, Tailwind, Recharts)
├── vite.config.js               # Vite & PWA configuration
├── index.html                   # Entry HTML page
│
├── src/                         # 🖥️ React Frontend
│   ├── App.jsx                  # Main routing & Role Guard setup
│   ├── main.jsx                 # Frontend entry point
│   ├── components/              # Skeletons, Sidebars, TopBar, and common widgets
│   ├── context/                 # Context Providers (AuthContext)
│   ├── data/                    # Local data & constant definitions
│   ├── lib/                     # Client libraries (axios wrapper for APIs)
│   └── pages/                   # Feature Pages (DigitalTwin, Security, Analytics, etc.)
│
├── server/                      # ⚙️ Node.js Express Backend
│   ├── index.js                 # API server entry point
│   ├── package.json             # Backend dependencies (express, jwt, sqlite)
│   ├── db/                      # Database initialization (`stadiumgenius.db`)
│   ├── middleware/              # Authentication and Role verification
│   └── routes/                  # API routes (ai, analytics, incidents, etc.)
│
└── stadium-genius/              # Documentation & reference assets
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v22+ recommended)
- **npm** (v10+ recommended)

### Step 1: Install Dependencies

From the project root:

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

### Step 2: Configure Environment

Create a `.env` file in the `server` directory (or modify the existing one):

```env
PORT=5000
JWT_SECRET=super-secret-stadium-genius-key-fifa-2026-xyz
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

### Step 3: Run the Platform

You will need two terminal windows open:

**Terminal 1 (Backend Server)**

```bash
cd server
npm run dev
```

**Terminal 2 (Frontend Dashboard)**

```bash
# From the root directory
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## 🏅 Current Achievements

| Feature | Status | Description |
|---------|:------:|-------------|
| **JWT & Auth0 Integration** | ✅ Done | Auth0 & JWT login/registration with role synchronization and fallback handlers |
| **RBAC Security** | ✅ Done | Admin, Manager, Operator, Security guards protect routes (100% verified via E2E test suite) |
| **Digital Twin View** | ✅ Done | Stadium layout heatmap and interactive zone stats |
| **Live Updates** | ✅ Done | Telemetry streams updates via SSE connection |
| **Incidents Logs** | ✅ Done | Create, update, and resolve incident tickets |
| **AI Assistant UI** | ✅ Done | Fully reactive chat layout with suggestions |

---

## 🔮 Future Work

Check [FUTURE_ROADMAP.md](FUTURE_ROADMAP.md) for detailed tasks, timelines, and priority matrices.

- **Real Google Gemini API Integration**: Move AI Chatbot from local keyword mock responses to live `gemini-2.0-flash` calls.
- **Two-Factor Authentication (MFA)**: Setup OTP codes via Speakeasy and Nodemailer.
- **Real-Time IoT Integration**: Connect actual sensors over MQTT and Websockets.
- **PDF Report Exporter**: Allow managers to print match reports.

---

## 🛠️ React + Vite Template Info

This project was initialized using a Vite + React template.

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

### React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

### Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.

---

## 📄 License

This project is licensed under the MIT License.
