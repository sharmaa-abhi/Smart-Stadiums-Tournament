# 🚀 StadiumGenius — Deployment & Environment Guide

> **Runtime Support:** Node.js >= 22.5.0 · Docker · Vite 8

---

## 1. Local Development Setup

### 1. Install Dependencies
```bash
# Frontend & root dependencies
npm install

# Backend dependencies
cd server
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` and fill in credentials:
```bash
cp .env.example .env
cp server/.env.example server/.env
```

### 3. Run Development Servers
```bash
# Terminal 1: Backend Express Server
cd server
npm run dev

# Terminal 2: Frontend Vite Server
npm run dev
```
Open application at `http://localhost:5173`.

---

## 2. Docker & Containerized Deployment

Run application containers via Docker Compose:
```bash
docker-compose up --build -d
```
- **Frontend Port:** `5173`
- **Backend API Port:** `5000`
