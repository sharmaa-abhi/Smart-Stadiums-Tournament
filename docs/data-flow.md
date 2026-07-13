# 📡 StadiumGenius — Data Flow Architecture

> [!IMPORTANT]
> **MVP vs. Target Data Flow Note:**
> This document describes the **Target Real-Time Stream Ingestion and Event Processing Architecture** (telemetry ingestion from 400+ IoT sensors, Kafka brokers, Flink stream analysis, and database writes).
> The current working code in this repository simulates streaming data through **Server-Sent Events (SSE)**.
> For details on the actual implemented codebase, database schema, and files, please refer to the root [README.md](file:///c:/Users/ABHI%20SHARMA/OneDrive/Desktop/projects/Smart-Stadiums-Tournament/README.md) and [docs/SYSTEM_GUIDE.md](file:///c:/Users/ABHI%20SHARMA/OneDrive/Desktop/projects/Smart-Stadiums-Tournament/docs/SYSTEM_GUIDE.md).

> **Version:** 1.0.0 · **Last Updated:** July 2026  
> **Scope:** Target Stream Pipelines (Kafka/Flink) \| Actual MVP Pipeline (Server-Sent Events)


---

## 1. Overview

StadiumGenius processes data through a **five-stage pipeline**: Ingestion → Streaming → Processing → Storage → Delivery. Each stage is designed for real-time throughput at stadium scale (50,000+ events/second during peak operations).

---

## 2. End-to-End Data Flow

```mermaid
graph LR
    subgraph Sources["📶 Data Sources"]
        CAM[CCTV Cameras<br/>128 feeds]
        LIDAR[LiDAR Arrays<br/>24 units]
        TURN[Turnstiles<br/>48 gates]
        WIFI[WiFi APs<br/>156 nodes]
        ENV[Environment<br/>Temp · Humidity · AQI]
        POS[POS Terminals<br/>67 units]
        TICKET[Ticketing API]
    end

    subgraph Edge["⚡ Edge Processing"]
        EN[Edge Nodes<br/>NVIDIA Jetson × 47]
    end

    subgraph Ingest["📥 Ingestion Layer"]
        MQTT[MQTT Broker<br/>Eclipse Mosquitto]
        KAFKA[Apache Kafka<br/>Event Bus]
    end

    subgraph Process["⚙️ Stream Processing"]
        FLINK[Apache Flink<br/>CEP + Aggregation]
    end

    subgraph Store["🗄️ Storage Layer"]
        PG[(PostgreSQL)]
        TS[(TimescaleDB)]
        NEO[(Neo4j)]
        REDIS[(Redis)]
        VEC[(Vector Store<br/>Pinecone / pgvector)]
    end

    subgraph Deliver["📊 Delivery"]
        WS[WebSocket Server]
        REST[REST API]
        PUSH[Push Notifications]
    end

    CAM & LIDAR --> EN
    TURN & WIFI & ENV --> EN
    POS --> KAFKA
    TICKET --> REST

    EN -->|MQTT/5G| MQTT
    MQTT --> KAFKA

    KAFKA --> FLINK

    FLINK -->|Aggregated metrics| TS
    FLINK -->|Events & alerts| PG
    FLINK -->|Spatial updates| NEO
    FLINK -->|Real-time state| REDIS

    REDIS --> WS
    PG --> REST
    WS --> |Live Dashboard| D[Operator Dashboard]
    REST --> |Fan Queries| M[Mobile App]
    PUSH --> |Alerts| M
```

---

## 3. Kafka Topic Architecture

StadiumGenius uses **domain-partitioned Kafka topics** to organize event streams:

```mermaid
graph TD
    subgraph Topics["Kafka Topic Registry"]
        T1["stadium.sensors.crowd-density<br/>Partitions: 8 · Retention: 24h"]
        T2["stadium.sensors.environmental<br/>Partitions: 4 · Retention: 48h"]
        T3["stadium.gates.throughput<br/>Partitions: 6 · Retention: 24h"]
        T4["stadium.security.access-events<br/>Partitions: 4 · Retention: 72h"]
        T5["stadium.security.anomalies<br/>Partitions: 4 · Retention: 168h"]
        T6["stadium.concessions.transactions<br/>Partitions: 4 · Retention: 48h"]
        T7["stadium.ai.recommendations<br/>Partitions: 2 · Retention: 168h"]
        T8["stadium.incidents.events<br/>Partitions: 2 · Retention: 720h"]
        T9["stadium.navigation.requests<br/>Partitions: 8 · Retention: 12h"]
        T10["stadium.twin.state-updates<br/>Partitions: 8 · Retention: 24h"]
    end
```

| Topic | Producer | Consumer(s) | Throughput |
|-------|----------|-------------|-----------|
| `stadium.sensors.crowd-density` | Edge Nodes | Crowd Analytics, Digital Twin | ~10K events/sec |
| `stadium.sensors.environmental` | IoT Sensors | Digital Twin, Dashboard | ~500 events/sec |
| `stadium.gates.throughput` | Turnstiles | Crowd Analytics, Navigation | ~2K events/sec |
| `stadium.security.access-events` | Access Control | Security Service, Audit | ~1K events/sec |
| `stadium.security.anomalies` | Edge AI, CCTV | Incident Manager, Dashboard | ~100 events/sec |
| `stadium.concessions.transactions` | POS Systems | Concession Service | ~500 events/sec |
| `stadium.ai.recommendations` | AI Assistant | Operator Dashboard | ~10 events/sec |
| `stadium.incidents.events` | Incident Manager | All Services | ~5 events/sec |
| `stadium.navigation.requests` | Fan App | Navigation Service | ~5K events/sec |
| `stadium.twin.state-updates` | Digital Twin | Dashboard, AI Assistant | ~1K events/sec |

---

## 4. Telemetry Processing Pipeline

### 4.1 Crowd Density Flow

```mermaid
sequenceDiagram
    participant CAM as CCTV Camera
    participant EN as Edge Node
    participant MQTT as MQTT Broker
    participant KF as Kafka
    participant FL as Flink
    participant TWIN as Digital Twin
    participant DASH as Dashboard

    CAM->>EN: Video frame (30 fps)
    EN->>EN: YOLOv8 person detection
    EN->>EN: Density calculation (persons/m²)
    EN->>MQTT: Density event (zone, value, confidence)
    MQTT->>KF: Publish to crowd-density topic
    KF->>FL: Stream consume
    FL->>FL: 5-second tumbling window aggregation
    FL->>TWIN: Update zone state
    TWIN->>DASH: WebSocket push (heatmap update)

    Note over EN: Latency budget: <200ms
    Note over FL: Aggregation window: 5 seconds
    Note over DASH: Refresh cycle: 2-3 seconds
```

### 4.2 AI Recommendation Flow

```mermaid
sequenceDiagram
    participant OP as Operator
    participant API as API Gateway
    participant AI as AI Assistant
    participant CTX as Context Builder
    participant TWIN as Digital Twin
    participant RAG as RAG Pipeline
    participant LLM as GPT-4o
    participant GR as Guardrails

    OP->>API: "Why is Gate B congested?"
    API->>AI: Route to AI service
    AI->>CTX: Build context
    CTX->>TWIN: Get current stadium state
    CTX->>RAG: Retrieve relevant SOPs
    CTX-->>AI: Enriched context
    AI->>GR: Apply input guardrails
    GR->>LLM: Send prompt + context
    LLM-->>GR: Generated response
    GR->>GR: PII filter + safety check
    GR-->>AI: Validated response
    AI->>OP: Recommendation with actions

    Note over CTX: Context includes:<br/>- Live zone occupancy<br/>- Gate throughput<br/>- Historical patterns<br/>- Relevant SOPs
```

### 4.3 Incident Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Detected: AI/Sensor triggers
    Detected --> Triaged: Auto-priority classification
    Triaged --> Assigned: Dispatch team
    Assigned --> Responding: Team en route
    Responding --> Active: On scene
    Active --> Resolved: Incident contained
    Active --> Escalated: Requires backup
    Escalated --> Responding: Additional resources
    Resolved --> Closed: Report generated
    Closed --> [*]

    note right of Detected: Avg detection: <5s
    note right of Responding: Avg response: 15-47s
    note right of Resolved: AI auto-generates report
```

---

## 5. Data Transformation Stages

| Stage | Input | Transformation | Output | Latency |
|-------|-------|---------------|--------|---------|
| **Edge Inference** | Raw video frames | Person detection, density calc | Density events | < 200ms |
| **Stream Aggregation** | Raw sensor events | 5s tumbling windows, outlier filtering | Aggregated metrics | < 5s |
| **State Update** | Aggregated metrics | Merge into spatial graph | Digital Twin state | < 1s |
| **AI Analysis** | Twin state + query | Context building + LLM inference | Recommendations | < 3s |
| **Dashboard Push** | State changes | Format for UI consumption | WebSocket frames | < 500ms |

---

## 6. Data Freshness & Caching Strategy

```mermaid
graph TB
    subgraph Hot["🔴 Hot Data (Redis) — TTL: 30s"]
        H1[Current zone occupancy]
        H2[Gate throughput rates]
        H3[Active alerts]
        H4[Digital Twin state snapshot]
    end

    subgraph Warm["🟡 Warm Data (TimescaleDB) — 24h rolling"]
        W1[5-minute aggregated telemetry]
        W2[Hourly zone trends]
        W3[Concession queue history]
    end

    subgraph Cold["🔵 Cold Data (PostgreSQL) — Persistent"]
        C1[Incident reports]
        C2[AI conversation logs]
        C3[Audit trail]
        C4[Historical match analytics]
    end

    Hot -->|Expires after 30s| Warm
    Warm -->|Aged out after 24h| Cold
```

---

## 7. Real-Time WebSocket Channels

The dashboard receives live updates via multiplexed WebSocket channels:

| Channel | Payload | Update Frequency |
|---------|---------|-----------------|
| `ws://stadium/twin/heatmap` | Crowd density grid (12×16) | Every 3s |
| `ws://stadium/twin/zones` | Zone occupancy array | Every 5s |
| `ws://stadium/gates/status` | Gate throughput + queue | Every 5s |
| `ws://stadium/alerts/live` | New alert notifications | On event |
| `ws://stadium/kpis/live` | KPI metrics snapshot | Every 5s |
| `ws://stadium/security/access` | Access log entries | On event |
| `ws://stadium/ai/responses` | AI assistant responses | On event |

---

## 8. Data Volume Estimates (Per Match Day)

| Data Type | Volume | Storage |
|-----------|--------|---------|
| CCTV frames processed | ~55M frames | Edge only (not stored) |
| LiDAR point clouds | ~2.6M scans | Edge only |
| Kafka events | ~180M events | TimescaleDB (24h) |
| Crowd density readings | ~4.3M | TimescaleDB |
| Gate throughput events | ~720K | TimescaleDB |
| Concession transactions | ~45K | PostgreSQL |
| AI conversations | ~500 sessions | PostgreSQL |
| Incident records | ~20-60 | PostgreSQL |
| Access control logs | ~165K | PostgreSQL (72h) |

---

*Next: [API Reference →](api.md) · [AI Workflows →](ai-workflows.md) · [Database Schema →](database-schema.md)*
