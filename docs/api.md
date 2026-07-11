# 🔌 StadiumGenius — API Reference

> [!IMPORTANT]
> **MVP vs. Target API Note:**
> This document describes the **Target Production API Endpoints and Protocols** (including WebSockets, Kafka events, multi-stadium parameters, etc.).
> The current working code in this repository runs a **local Node.js Express server on port 5000** (`/api` endpoints) with REST APIs and simulated Server-Sent Events (SSE) for dynamic updates.
> For details on the actual implemented codebase, database schema, and files, please refer to the root [README.md](file:///c:/Users/ABHI%20SHARMA/OneDrive/Desktop/projects/Smart-Stadiums-Tournament/README.md) and [docs/SYSTEM_GUIDE.md](file:///c:/Users/ABHI%20SHARMA/OneDrive/Desktop/projects/Smart-Stadiums-Tournament/docs/SYSTEM_GUIDE.md).

> **Version:** 1.0.0 · **Base URL:** `http://localhost:5000/api` (Local MVP) \| `https://api.stadiumgenius.io/v1` (Target)  
> **Auth:** Bearer JWT · **Format:** JSON · **Protocol:** REST + SSE (MVP) \| REST + WebSocket (Target)


---

## 1. Authentication

All API requests require a valid JWT token in the `Authorization` header.

```http
Authorization: Bearer <jwt_token>
```

### POST `/auth/login`

Authenticate and receive a JWT token.

**Request:**
```json
{
  "email": "operator@stadiumgenius.io",
  "password": "••••••••",
  "venue_id": "metlife"
}
```

**Response:** `200 OK`
```json
{
  "token": "eyJhbGciOiJSUzI1NiIs...",
  "expires_in": 3600,
  "role": "operator",
  "venue": "metlife",
  "permissions": ["dashboard:read", "alerts:read", "ai:query", "incidents:write"]
}
```

### POST `/auth/refresh`

Refresh an expiring token.

**Request:**
```json
{
  "refresh_token": "dGhpcyBpcyBhIHJlZnJlc2..."
}
```

---

## 2. Dashboard APIs

### GET `/dashboard`

Returns the complete dashboard state for the current venue.

**Response:** `200 OK`
```json
{
  "venue": {
    "id": "metlife",
    "name": "MetLife Stadium",
    "capacity": 82500,
    "current_occupancy": 72140
  },
  "kpis": {
    "total_fans": 72140,
    "avg_queue_time": 2.5,
    "incidents_resolved": 12,
    "active_alerts": 3,
    "fan_satisfaction": 4.7,
    "edge_node_uptime": 99.2,
    "security_events": 2,
    "transport_capacity": 85
  },
  "timestamp": "2026-07-07T15:30:00Z"
}
```

### GET `/dashboard/telemetry`

Returns time-series telemetry data for charts.

**Query Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `interval` | string | `5m` | Aggregation interval: `1m`, `5m`, `15m`, `1h` |
| `points` | integer | `24` | Number of data points |
| `metrics` | string | `all` | Comma-separated: `crowd,gates,concessions,temp` |

**Response:** `200 OK`
```json
{
  "data": [
    {
      "time": "15:00",
      "crowd_density": 72,
      "gate_flow": 380,
      "concession_queue": 18,
      "temperature": 29.3
    }
  ]
}
```

---

## 3. Digital Twin APIs

### GET `/digital-twin`

Returns the current Digital Twin state.

**Response:** `200 OK`
```json
{
  "heatmap": [[0.3, 0.5, 0.7], [0.8, 0.2, 0.4]],
  "zones": [
    {
      "zone": "A",
      "occupancy": 78,
      "capacity": 9200,
      "current": 7176,
      "trend": "rising"
    }
  ],
  "gates": [
    {
      "name": "Gate A",
      "throughput": 342,
      "queue": 85,
      "status": "open",
      "avg_wait": 3.2
    }
  ],
  "environment": {
    "temperature": 28.5,
    "humidity": 52,
    "wind_speed": 8.3,
    "air_quality": 72
  },
  "sensors": {
    "cameras": 128,
    "lidar": 24,
    "turnstiles": 48,
    "iot_sensors": 312,
    "wifi_aps": 156
  },
  "active_layer": "density",
  "last_updated": "2026-07-07T15:30:02Z"
}
```

### GET `/digital-twin/heatmap`

Returns only the crowd density heatmap grid.

**Response:** `200 OK`
```json
{
  "grid": [[0.32, 0.55, ...], ...],
  "rows": 12,
  "cols": 16,
  "timestamp": "2026-07-07T15:30:02Z"
}
```

### GET `/digital-twin/layers/:layer_id`

Returns data for a specific twin layer.

**Path Parameters:** `density` | `security` | `environmental` | `infrastructure`

---

## 4. Crowd Management APIs

### GET `/crowd/occupancy`

Returns current zone-by-zone occupancy.

**Response:** `200 OK`
```json
{
  "overall_occupancy": 87.3,
  "total_fans": 72140,
  "total_capacity": 82500,
  "zones": [
    {
      "zone": "A",
      "occupancy": 78,
      "capacity": 9200,
      "current": 7176,
      "trend": "rising",
      "risk_level": "normal"
    }
  ]
}
```

### GET `/crowd/predictions`

Returns AI-predicted crowd density for the next 60 minutes.

**Response:** `200 OK`
```json
{
  "predictions": [
    {
      "time_offset": "+5min",
      "predicted_density": 78,
      "trend": "rising",
      "confidence": 0.91,
      "recommended_action": "Monitor Zone B corridor"
    },
    {
      "time_offset": "+15min",
      "predicted_density": 85,
      "trend": "rising",
      "confidence": 0.87,
      "recommended_action": "Consider opening Gate C overflow"
    }
  ]
}
```

### POST `/crowd/reroute`

Trigger a crowd reroute protocol.

**Request:**
```json
{
  "source_gate": "Gate B",
  "target_gate": "Gate C",
  "reason": "Density threshold exceeded",
  "notify_fans": true,
  "update_signage": true
}
```

**Response:** `201 Created`
```json
{
  "reroute_id": "RRT-2026-0142",
  "status": "activated",
  "fans_notified": 2147,
  "signage_updated": ["B1", "B2", "B3"],
  "estimated_relief": "4-6 minutes"
}
```

---

## 5. Security APIs

### GET `/security/zones`

Returns all security zone statuses.

**Response:** `200 OK`
```json
{
  "threat_level": "elevated",
  "zones": [
    {
      "id": 1,
      "name": "North Perimeter",
      "status": "secure",
      "level": "green",
      "cameras": 32,
      "alerts": 0,
      "patrols": 4,
      "last_sweep": "2 min ago"
    }
  ]
}
```

### GET `/security/incidents`

Returns active and recent incidents.

**Query Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `status` | string | `all` | `active`, `resolved`, `all` |
| `priority` | string | `all` | `critical`, `high`, `medium`, `low` |
| `limit` | integer | `20` | Max results |

**Response:** `200 OK`
```json
{
  "incidents": [
    {
      "id": "INC-2026-0848",
      "type": "Lost Child",
      "zone": "Section 204",
      "time": "14:45",
      "status": "active",
      "priority": "critical",
      "response_time": "12s",
      "assignee": "Team Delta"
    }
  ],
  "summary": {
    "total": 5,
    "active": 4,
    "resolved": 1
  }
}
```

### POST `/security/incidents`

Report a new incident.

**Request:**
```json
{
  "type": "unauthorized_access",
  "zone": "VIP Level 3",
  "priority": "high",
  "description": "Invalid credential scan at VIP entrance",
  "reported_by": "operator_001"
}
```

**Response:** `201 Created`
```json
{
  "id": "INC-2026-0852",
  "status": "detected",
  "assigned_to": "Team Alpha",
  "created_at": "2026-07-07T15:12:00Z"
}
```

### GET `/security/access-log`

Returns live access control events.

### GET `/security/cctv`

Returns CCTV camera feed statuses and AI anomaly detections.

### GET `/security/evacuation-routes`

Returns evacuation route statuses and capacities.

### POST `/security/lockdown`

⚠️ **Admin Only** — Triggers a full venue lockdown.

---

## 6. AI Assistant APIs

### POST `/ai/chat`

Send a query to the AI Operations Assistant.

**Request:**
```json
{
  "message": "What's the current crowd status at Gate B?",
  "session_id": "session_abc123",
  "context": {
    "venue_id": "metlife",
    "include_twin_state": true
  }
}
```

**Response:** `200 OK`
```json
{
  "response": "Gate B is currently experiencing **elevated density** (4.2 persons/m²)...",
  "confidence": 0.94,
  "sources": ["digital_twin", "kafka_stream", "historical_sop"],
  "suggested_actions": [
    {
      "action": "activate_reroute",
      "target": "Gate C",
      "requires_approval": true
    }
  ],
  "session_id": "session_abc123",
  "model": "StadiumGPT-4o",
  "latency_ms": 1420
}
```

### POST `/ai/generate-report`

Generate an AI incident report.

**Request:**
```json
{
  "incident_id": "INC-2026-0852",
  "format": "detailed"
}
```

### GET `/ai/templates`

Returns available AI quick-prompt templates.

---

## 7. Fan APIs

### GET `/fan/navigation`

Get optimal route to a destination.

**Query Parameters:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `from` | string | Yes | Origin (e.g., `gate-d`) |
| `to` | string | Yes | Destination (e.g., `section-108`) |
| `accessible` | boolean | No | Wheelchair-accessible route |

**Response:** `200 OK`
```json
{
  "routes": [
    {
      "type": "primary",
      "path": ["Gate D", "Concourse West", "Ramp W3", "Section 108"],
      "distance_m": 180,
      "estimated_time": "2m 45s",
      "corridor_density": "low",
      "accessible": false
    },
    {
      "type": "alternative",
      "path": ["Gate D", "Elevator E2", "Level 2", "Section 108"],
      "distance_m": 210,
      "estimated_time": "3m 15s",
      "corridor_density": "low",
      "accessible": true
    }
  ]
}
```

### GET `/fan/queues`

Returns concession queue lengths and wait times.

### GET `/fan/offers`

Returns personalized offers and vouchers.

### GET `/fan/seat`

Returns seat information and nearby amenities.

---

## 8. Concession APIs

### GET `/concessions`

Returns all concession stand statuses.

**Response:** `200 OK`
```json
{
  "stands": [
    {
      "name": "Food Court North",
      "type": "food",
      "queue_length": 35,
      "avg_wait": 11.2,
      "revenue": 12400,
      "status": "high-demand"
    }
  ]
}
```

### POST `/concessions/express-lane`

Activate an express lane for a concession stand.

---

## 9. Alert APIs

### GET `/alerts`

Returns active alerts with severity levels.

**Response:** `200 OK`
```json
{
  "alerts": [
    {
      "id": "ALT-001",
      "type": "crowd",
      "severity": "warning",
      "title": "High density detected in Zone B corridor",
      "description": "Density exceeds 4.2 persons/m²...",
      "time": "2 min ago",
      "acknowledged": false
    }
  ]
}
```

### POST `/alerts/:id/acknowledge`

Acknowledge an alert.

### POST `/alerts/:id/dismiss`

Dismiss a resolved alert.

---

## 10. WebSocket API

### Connection

```
wss://api.stadiumgenius.io/v1/ws?token=<jwt_token>&venue=metlife
```

### Subscribe to Channels

```json
{
  "type": "subscribe",
  "channels": [
    "twin.heatmap",
    "twin.zones",
    "gates.status",
    "alerts.live",
    "kpis.live",
    "security.access"
  ]
}
```

### Incoming Message Format

```json
{
  "channel": "twin.heatmap",
  "data": {
    "grid": [[0.32, 0.55, ...], ...],
    "timestamp": "2026-07-07T15:30:02Z"
  },
  "sequence": 42891
}
```

### WebSocket Heartbeat

```json
{ "type": "ping" }
{ "type": "pong", "server_time": "2026-07-07T15:30:05Z" }
```

---

## 11. Error Responses

All errors follow a consistent format:

```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Retry after 30 seconds.",
    "status": 429,
    "retry_after": 30
  }
}
```

| Status | Code | Description |
|--------|------|-------------|
| `400` | `INVALID_REQUEST` | Malformed request body |
| `401` | `UNAUTHORIZED` | Missing or expired token |
| `403` | `FORBIDDEN` | Insufficient permissions |
| `404` | `NOT_FOUND` | Resource not found |
| `429` | `RATE_LIMIT_EXCEEDED` | Too many requests |
| `500` | `INTERNAL_ERROR` | Server error |
| `503` | `SERVICE_UNAVAILABLE` | Service temporarily down |

---

## 12. Rate Limits

| Role | Requests/min | WebSocket connections |
|------|-------------|----------------------|
| **Admin** | 600 | 10 |
| **Operator** | 300 | 5 |
| **Security** | 300 | 5 |
| **Fan (mobile)** | 60 | 1 |

---

*Next: [Deployment →](deployment.md) · [AI Workflows →](ai-workflows.md) · [Architecture →](architecture.md)*
