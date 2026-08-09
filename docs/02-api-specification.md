# 🔌 StadiumGenius — API Specifications & Endpoints

> **Version:** 1.0.0 · **Base URL:** `/api`  
> **Supported Protocols:** REST (JSON), Server-Sent Events (SSE)

---

## 1. Authentication Endpoints (`/api/auth`)

| Endpoint | Method | Description | Auth Required |
|---|---|---|---|
| `/api/auth/login` | `POST` | Authenticate user credentials and return JWT token | No |
| `/api/auth/logout` | `POST` | Invalidate current session and clear auth cookies | Yes |
| `/api/auth/me` | `GET` | Fetch authenticated user profile and roles | Yes |

### Example Request (`POST /api/auth/login`)
```json
{
  "email": "operator@stadiumgenius.io",
  "password": "SecurePassword123!"
}
```

---

## 2. Venue & Crowd Analytics (`/api/venues`, `/api/analytics`)

| Endpoint | Method | Description | Auth Required |
|---|---|---|---|
| `/api/venues` | `GET` | List all monitored stadium venues and status | Yes |
| `/api/venues/:id` | `GET` | Get detailed stadium digital twin state | Yes |
| `/api/analytics/crowd` | `GET` | Fetch real-time crowd density and heatmaps | Yes |
| `/api/analytics/summary` | `GET` | Retrieve overall operational KPIs | Yes |

---

## 3. Incident Management (`/api/incidents`)

| Endpoint | Method | Description | Auth Required |
|---|---|---|---|
| `/api/incidents` | `GET` | Fetch list of active & historic incidents | Yes |
| `/api/incidents` | `POST` | Report new security/operational incident | Yes |
| `/api/incidents/:id` | `PATCH` | Update incident status (acknowledged, resolved) | Yes (Operator/Admin) |
| `/api/incidents/stream` | `GET` | Real-time SSE stream of incident events | Yes |

---

## 4. AI Operations Assistant (`/api/ai`)

| Endpoint | Method | Description | Auth Required |
|---|---|---|---|
| `/api/ai/query` | `POST` | Send natural language operational query to AI | Yes |
| `/api/ai/recommend` | `POST` | Generate automated incident response plan | Yes |

### Example Query (`POST /api/ai/query`)
```json
{
  "prompt": "What is the crowd density status near Gate 4?",
  "venueId": "venue-stadium-01"
}
```

---

## 5. Real-Time Broadcast (`/api/broadcast`)

| Endpoint | Method | Description | Auth Required |
|---|---|---|---|
| `/api/broadcast/stream` | `GET` | Stream live stadium-wide announcement updates | Yes |
| `/api/broadcast/send` | `POST` | Dispatch emergency / fan broadcast message | Yes (Admin) |
