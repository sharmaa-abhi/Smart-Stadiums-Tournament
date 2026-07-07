# 🏟️ StadiumGenius — System Architecture

> **Version:** 1.0.0 · **Last Updated:** July 2026  
> **Status:** MVP — FIFA World Cup 2026  
> **Classification:** Technical Architecture Document

---

## 1. Executive Summary

StadiumGenius is an **AI-powered smart stadium operations platform** designed for FIFA World Cup 2026 venues. It combines Digital Twins, IoT telemetry, 5G edge computing, and Generative AI (LLM) to deliver real-time crowd management, security orchestration, fan navigation, and operational intelligence.

The architecture follows a **layered, event-driven microservices** model with edge-cloud hybrid processing to meet the sub-second latency requirements of live stadium operations.

---

## 2. Architecture Principles

| Principle | Description |
|-----------|-------------|
| **Event-Driven** | All telemetry flows through Apache Kafka; components react to events, not polling |
| **Edge-First** | Safety-critical inference (crowd density, anomaly detection) runs on NVIDIA Jetson edge nodes |
| **Human-in-the-Loop** | AI recommendations require operator approval before execution |
| **Separation of Concerns** | Frontend, backend, AI, streaming, and data layers are independently deployable |
| **Fail-Safe Defaults** | System degrades gracefully; edge nodes fail over automatically |
| **Zero Trust Security** | mTLS between services, JWT auth for users, RBAC for operators |

---

## 3. System Context Diagram

```mermaid
C4Context
    title StadiumGenius — System Context

    Person(fan, "Fan", "80,000+ attendees with mobile app")
    Person(operator, "Stadium Operator", "Control room staff")
    Person(security, "Security Team", "Field & perimeter security")

    System(sg, "StadiumGenius Platform", "AI-powered stadium operations")

    System_Ext(iot, "IoT Sensors", "Cameras, LiDAR, turnstiles, environmental sensors")
    System_Ext(ticketing, "Ticketing API", "FIFA / venue ticketing system")
    System_Ext(pos, "POS Systems", "Concession point-of-sale terminals")
    System_Ext(transport, "Transport APIs", "Parking, shuttle, transit systems")
    System_Ext(llm, "LLM Provider", "OpenAI GPT-4o / Llama 3")

    Rel(fan, sg, "Mobile app / Push notifications")
    Rel(operator, sg, "Operator dashboard / WebSocket")
    Rel(security, sg, "Security console / Alerts")
    Rel(iot, sg, "MQTT / 5G telemetry")
    Rel(ticketing, sg, "REST API")
    Rel(pos, sg, "Event stream")
    Rel(transport, sg, "REST / webhooks")
    Rel(sg, llm, "Inference API calls")
```

---

## 4. High-Level Architecture

```mermaid
graph TB
    subgraph Clients["👤 Client Layer"]
        FAN[Fan Mobile App<br/>React Native]
        DASH[Operator Dashboard<br/>React + Vite]
        SEC[Security Console<br/>React + Vite]
    end

    subgraph Gateway["🌐 API Gateway"]
        APIGW[Kong / NGINX Gateway<br/>Rate Limiting · Auth · Routing]
    end

    subgraph Backend["⚙️ Backend Services"]
        AUTH[Auth Service<br/>JWT + OAuth2]
        TWIN[Digital Twin Engine<br/>Spatial Graph + State]
        CROWD[Crowd Analytics<br/>ML Prediction]
        AI[AI Assistant Service<br/>LLM Orchestration]
        NAV[Fan Navigation<br/>Pathfinding]
        INC[Incident Manager<br/>Workflow Engine]
        CONC[Concession Service<br/>Queue Optimization]
    end

    subgraph Streaming["📡 Event Processing"]
        KAFKA[Apache Kafka<br/>Event Bus]
        FLINK[Apache Flink<br/>Stream Processing]
        MQTT[MQTT Broker<br/>IoT Ingestion]
    end

    subgraph Data["🗄️ Data Layer"]
        PG[(PostgreSQL<br/>Operational Data)]
        TS[(TimescaleDB<br/>Time-Series)]
        NEO[(Neo4j<br/>Spatial Graph)]
        REDIS[(Redis<br/>Cache + Pub/Sub)]
    end

    subgraph Edge["📶 Edge Computing"]
        EN1[Edge Node Cluster<br/>NVIDIA Jetson]
        CAM[CCTV + LiDAR]
        TURN[Turnstiles]
        ENV[Environmental Sensors]
        WIFI[WiFi APs]
    end

    subgraph AI_Layer["🤖 AI / ML Layer"]
        LLM[LLM API<br/>GPT-4o / Llama 3]
        RAG[RAG Pipeline<br/>Vector Store]
        GUARD[Guardrails<br/>Safety + PII Filter]
    end

    FAN --> APIGW
    DASH --> APIGW
    SEC --> APIGW

    APIGW --> AUTH
    APIGW --> TWIN
    APIGW --> CROWD
    APIGW --> AI
    APIGW --> NAV
    APIGW --> INC
    APIGW --> CONC

    CAM --> EN1
    TURN --> EN1
    ENV --> EN1
    WIFI --> EN1
    EN1 --> MQTT
    MQTT --> KAFKA

    KAFKA --> FLINK
    FLINK --> TWIN
    FLINK --> CROWD
    FLINK --> TS

    TWIN --> NEO
    TWIN --> REDIS
    CROWD --> PG
    AI --> LLM
    AI --> RAG
    AI --> GUARD
    INC --> PG
    NAV --> NEO

    TWIN -.->|WebSocket| DASH
    INC -.->|Push| FAN

    style Clients fill:#1a1a2e,stroke:#3378ff,color:#fff
    style Gateway fill:#1a1a2e,stroke:#22d3ee,color:#fff
    style Backend fill:#1a1a2e,stroke:#34d399,color:#fff
    style Streaming fill:#1a1a2e,stroke:#f59e0b,color:#fff
    style Data fill:#1a1a2e,stroke:#a78bfa,color:#fff
    style Edge fill:#1a1a2e,stroke:#f43f5e,color:#fff
    style AI_Layer fill:#1a1a2e,stroke:#ec4899,color:#fff
```

---

## 5. Component Architecture

### 5.1 Frontend (React + Vite)

The MVP dashboard is a single-page application built with:

| Technology | Purpose |
|-----------|---------|
| **React 19** | Component framework |
| **Vite 8** | Build tool with HMR |
| **React Router v7** | Client-side routing |
| **Tailwind CSS v4** | Utility-first styling |
| **Framer Motion** | Animations & transitions |
| **Recharts** | Data visualization (charts, heatmaps) |
| **Lucide React** | Icon system |

**Page Architecture:**

```mermaid
graph LR
    subgraph App["App.jsx — Root"]
        SB[Sidebar] --> D[Dashboard]
        SB --> DT[Digital Twin]
        SB --> CM[Crowd Management]
        SB --> SC[Security]
        SB --> CO[Concessions]
        SB --> AA[AI Assistant]
        SB --> BR[Broadcast]
        SB --> AN[Analytics]
        SB --> ST[Settings]
    end
```

### 5.2 Backend (FastAPI — Planned)

```
backend/
├── app/
│   ├── api/           # REST endpoints
│   ├── ai/            # LLM orchestration
│   ├── analytics/     # Crowd prediction models
│   ├── auth/          # JWT + OAuth2
│   ├── digital_twin/  # Twin state engine
│   ├── ingestion/     # Kafka consumers
│   ├── models/        # SQLAlchemy / Pydantic
│   ├── services/      # Business logic
│   ├── websocket/     # Real-time push
│   └── main.py        # FastAPI entry point
```

### 5.3 AI / LLM Layer

```mermaid
graph TD
    Q[Operator Query] --> CB[Context Builder]
    CB --> |Stadium State| TWIN_STATE[Digital Twin State]
    CB --> |Historical| RAG_DB[(Vector Store)]
    CB --> |Real-time| KAFKA_DATA[Kafka Stream]
    CB --> PROMPT[Prompt Engine]
    PROMPT --> GUARD[Guardrails]
    GUARD --> LLM[LLM - GPT-4o]
    LLM --> VALID[Response Validator]
    VALID --> |Approved| ACTION[Execute Action]
    VALID --> |Flagged| HUMAN[Human Review]
```

---

## 6. Digital Twin Architecture

The Digital Twin maintains a **live virtual model** of the stadium, updated every 2–5 seconds.

```mermaid
graph TB
    subgraph Inputs["Sensor Inputs"]
        S1[Seat Occupancy]
        S2[Turnstile Counts]
        S3[CCTV Frames]
        S4[LiDAR Point Clouds]
        S5[WiFi Device Counts]
        S6[Environmental Sensors]
    end

    subgraph Twin["Digital Twin Engine"]
        STATE[State Manager]
        SPATIAL[Spatial Graph<br/>Neo4j]
        TEMPORAL[Time-Series<br/>TimescaleDB]
        LAYERS[Layer Renderer]
    end

    subgraph Outputs["Twin Outputs"]
        HEATMAP[Crowd Heatmap]
        ZONES[Zone Occupancy]
        GATES[Gate Status]
        ROUTES[Safe Routes]
        ALERTS[Anomaly Alerts]
    end

    S1 & S2 & S3 & S4 & S5 & S6 --> STATE
    STATE --> SPATIAL
    STATE --> TEMPORAL
    STATE --> LAYERS
    LAYERS --> HEATMAP & ZONES & GATES & ROUTES & ALERTS
```

**Twin Layers:**

| Layer | Data Source | Update Interval |
|-------|-----------|----------------|
| Crowd Density | CCTV + LiDAR + WiFi | 2s |
| Security Zones | Access control + patrols | 1s |
| Environmental | Temp, humidity, wind, AQI | 10s |
| Infrastructure | Power, network, POS status | 30s |

---

## 7. Edge Computing Architecture

```mermaid
graph LR
    subgraph Stadium["Stadium Venue"]
        subgraph EN["Edge Node (NVIDIA Jetson)"]
            INF[Inference Engine<br/>YOLOv8 / TensorRT]
            PROC[Stream Processor]
            CACHE[Local Cache]
            FAILOVER[Failover Controller]
        end
        CAM[Camera Cluster] --> INF
        LIDAR[LiDAR Array] --> INF
        INF --> PROC
        PROC --> CACHE
        PROC -->|MQTT/5G| CLOUD[Cloud Backend]
        FAILOVER -->|Failover| EN2[Backup Edge Node]
    end
```

**Edge Specifications:**

| Metric | Target |
|--------|--------|
| Inference latency | < 200ms |
| Edge nodes per venue | 47 |
| Camera feeds per node | 4–8 |
| Failover time | < 500ms |
| Local buffer | 30 min offline operation |

---

## 8. Security Architecture

```mermaid
graph TB
    subgraph Auth["Authentication"]
        JWT[JWT Tokens]
        OAUTH[OAuth2 Provider]
        MFA[Multi-Factor Auth]
    end

    subgraph Access["Access Control"]
        RBAC[Role-Based Access<br/>Admin · Operator · Viewer]
        ZONES_AC[Zone-Based Permissions]
    end

    subgraph Network["Network Security"]
        MTLS[mTLS Between Services]
        HTTPS[TLS 1.3 Everywhere]
        WAF[Web Application Firewall]
    end

    subgraph Data_Sec["Data Security"]
        ENC[Encryption at Rest<br/>AES-256]
        PII[PII Anonymization]
        AUDIT[Audit Log Trail]
    end

    Auth --> Access --> Network --> Data_Sec
```

**Operator Roles:**

| Role | Permissions |
|------|------------|
| **Admin** | Full system access, configuration, user management |
| **Operator** | Dashboard, alerts, approve AI recommendations |
| **Security** | Security zones, CCTV, incident management |
| **Viewer** | Read-only dashboard access |

---

## 9. Technology Stack Summary

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 19, Vite 8, Tailwind CSS 4 | Operator dashboard & fan app |
| **Mobile** | React Native | Fan mobile experience |
| **Backend** | FastAPI (Python) | REST/WebSocket API server |
| **AI/LLM** | OpenAI GPT-4o, Llama 3 | Operational intelligence |
| **Streaming** | Apache Kafka, Flink | Event processing pipeline |
| **IoT** | MQTT, 5G | Sensor data ingestion |
| **Cache** | Redis | Real-time state cache |
| **Database** | PostgreSQL | Operational data |
| **Time-Series** | TimescaleDB | Sensor telemetry history |
| **Graph** | Neo4j | Spatial relationships & navigation |
| **Edge** | NVIDIA Jetson, TensorRT | On-premise ML inference |
| **Containers** | Docker, Kubernetes | Deployment orchestration |
| **Cloud** | Azure / AWS | Cloud infrastructure |
| **Monitoring** | Prometheus, Grafana | Observability |
| **CI/CD** | GitHub Actions | Build & deploy pipeline |

---

## 10. Architecture Decision Records (ADRs)

### ADR-001: Event-Driven over Request-Response

**Decision:** Use Apache Kafka as the central event bus rather than synchronous REST calls between services.  
**Rationale:** Stadium telemetry generates 50,000+ events/second during peak; synchronous calls would create cascading failures.  
**Consequences:** Added complexity in event ordering; requires idempotent consumers.

### ADR-002: Edge-First Inference

**Decision:** Run safety-critical ML models (crowd density, anomaly detection) on NVIDIA Jetson edge nodes.  
**Rationale:** Cloud round-trip latency (100–300ms) is unacceptable for real-time crowd safety; edge inference achieves < 200ms.  
**Consequences:** Increased hardware costs; requires OTA model update pipeline.

### ADR-003: Neo4j for Spatial Graph

**Decision:** Use Neo4j (graph database) for stadium spatial modeling instead of PostGIS.  
**Rationale:** Stadium navigation requires traversal of complex spatial relationships (zones → corridors → gates → exits) that map naturally to graph queries.  
**Consequences:** Additional database to manage; team needs Cypher expertise.

---

## 11. Scalability & Performance

| Metric | Target | Architecture Strategy |
|--------|--------|----------------------|
| Concurrent fans | 82,500 | Horizontal pod scaling, CDN for static assets |
| Telemetry ingestion | 50K events/sec | Kafka partitioning, edge pre-processing |
| Dashboard refresh | < 2 sec | WebSocket push, Redis cache |
| AI response time | < 3 sec | Edge inference + cloud LLM hybrid |
| Fan navigation | < 1 sec | Precomputed graph routes, local cache |
| System uptime | 99.95% | Multi-AZ deployment, edge failover |

---

## 12. Disaster Recovery

| Scenario | Recovery Strategy | RTO |
|----------|------------------|-----|
| Cloud region outage | Failover to secondary region | < 5 min |
| Edge node failure | Automatic failover to nearest healthy node | < 500ms |
| Kafka broker failure | Multi-broker cluster, replication factor 3 | < 30s |
| Database failure | Standby replica promotion | < 60s |
| Network partition | Edge nodes operate autonomously with 30-min local buffer | 0s (degraded) |

---

*Next: [Data Flow →](data-flow.md) · [API Reference →](api.md) · [Deployment →](deployment.md)*
