# 🚀 StadiumGenius — Deployment Guide

> [!IMPORTANT]
> **MVP vs. Target Deployment Note:**
> This document describes the **Target Production/Enterprise Cloud & Edge Deployment Infrastructure** (using Kubernetes configs, Docker Compose container setups for FastAPI/Kafka/TimescaleDB/Neo4j, and edge scripts for NVIDIA Jetson nodes).
> The current working code in this repository runs directly as a **Node.js Express backend and React front-end application**.
> For details on the actual implemented codebase, database schema, and files, please refer to the root [README.md](file:///c:/Users/ABHI%20SHARMA/OneDrive/Desktop/projects/Smart-Stadiums-Tournament/README.md) and [docs/SYSTEM_GUIDE.md](file:///c:/Users/ABHI%20SHARMA/OneDrive/Desktop/projects/Smart-Stadiums-Tournament/docs/SYSTEM_GUIDE.md).

> **Version:** 1.0.0 · **Last Updated:** July 2026  
> **Targets:** Kubernetes & Edge (Target Design) \| Node.js / React (Actual MVP Local Deploy)


---

## 1. Deployment Architecture Overview

```mermaid
graph TB
    subgraph Dev["🧑‍💻 Local Development"]
        DC[Docker Compose<br/>All services]
    end

    subgraph Staging["🧪 Staging"]
        K8S_STG[Kubernetes Cluster<br/>Azure AKS / AWS EKS]
    end

    subgraph Prod["🏟️ Production"]
        subgraph Cloud["☁️ Cloud Region"]
            K8S[Kubernetes Cluster<br/>Multi-AZ]
            CDN[CDN<br/>CloudFront / Azure CDN]
            LB[Load Balancer<br/>L7 Ingress]
        end
        subgraph EdgeSite["📶 Edge Site (Per Venue)"]
            EDGE[Edge Cluster<br/>NVIDIA Jetson × 47]
            LOCAL_GW[Local Gateway<br/>MQTT + Cache]
        end
    end

    subgraph CI["🔄 CI/CD Pipeline"]
        GH[GitHub Actions]
        REG[Container Registry<br/>ECR / ACR]
    end

    GH -->|Build & Push| REG
    REG -->|Deploy| K8S_STG
    REG -->|Promote| K8S
    REG -->|OTA Update| EDGE

    style Dev fill:#1a1a2e,stroke:#3378ff,color:#fff
    style Staging fill:#1a1a2e,stroke:#f59e0b,color:#fff
    style Prod fill:#1a1a2e,stroke:#34d399,color:#fff
    style CI fill:#1a1a2e,stroke:#a78bfa,color:#fff
```

---

## 2. Docker — Local Development

### 2.1 Docker Compose

```yaml
# docker-compose.yml
version: "3.9"

services:
  # ── Frontend Dashboard ──
  frontend:
    build:
      context: ./frontend/dashboard
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - VITE_API_URL=http://localhost:8000
      - VITE_WS_URL=ws://localhost:8000/ws
    depends_on:
      - backend

  # ── Backend API ──
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://sg:sg_secret@postgres:5432/stadiumgenius
      - REDIS_URL=redis://redis:6379
      - KAFKA_BROKERS=kafka:9092
      - NEO4J_URI=bolt://neo4j:7687
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - postgres
      - redis
      - kafka
      - neo4j

  # ── Databases ──
  postgres:
    image: timescale/timescaledb:latest-pg16
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_USER=sg
      - POSTGRES_PASSWORD=sg_secret
      - POSTGRES_DB=stadiumgenius
    volumes:
      - pg_data:/var/lib/postgresql/data
      - ./database/postgres/schema.sql:/docker-entrypoint-initdb.d/01-schema.sql
      - ./database/timescaledb/schema.sql:/docker-entrypoint-initdb.d/02-timescale.sql

  neo4j:
    image: neo4j:5-community
    ports:
      - "7474:7474"
      - "7687:7687"
    environment:
      - NEO4J_AUTH=neo4j/sg_secret
    volumes:
      - neo4j_data:/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  # ── Streaming ──
  zookeeper:
    image: confluentinc/cp-zookeeper:7.6.0
    environment:
      ZOOKEEPER_CLIENT_PORT: 2181

  kafka:
    image: confluentinc/cp-kafka:7.6.0
    ports:
      - "9092:9092"
    environment:
      KAFKA_BROKER_ID: 1
      KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://kafka:9092
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1
    depends_on:
      - zookeeper

volumes:
  pg_data:
  neo4j_data:
```

### 2.2 Dockerfile — Frontend

```dockerfile
# frontend/dashboard/Dockerfile
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]
```

### 2.3 Dockerfile — Backend

```dockerfile
# backend/Dockerfile
FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
```

### 2.4 Quick Start

```bash
# Clone repository
git clone https://github.com/sharmaa-abhi/Smart-Stadiums-Tournament.git
cd Smart-Stadiums-Tournament

# Create environment file
cp .env.example .env
# Edit .env with your API keys

# Start all services
docker compose up -d

# Frontend:  http://localhost:3000
# Backend:   http://localhost:8000
# Neo4j:     http://localhost:7474
# Kafka UI:  http://localhost:9092
```

---

## 3. Kubernetes — Production Deployment

### 3.1 Cluster Topology

```mermaid
graph TB
    subgraph K8S["Kubernetes Cluster"]
        subgraph Ingress["Ingress Layer"]
            IG[NGINX Ingress Controller]
            CERT[Cert-Manager<br/>Let's Encrypt]
        end

        subgraph App["Application Pods"]
            FE[Frontend<br/>3 replicas]
            BE[Backend API<br/>5 replicas]
            AI_POD[AI Service<br/>3 replicas]
            WS_POD[WebSocket Server<br/>3 replicas]
        end

        subgraph Data_K8S["Data Plane"]
            PG_K8S[PostgreSQL<br/>HA StatefulSet]
            REDIS_K8S[Redis Cluster<br/>3 nodes]
            KAFKA_K8S[Kafka Cluster<br/>3 brokers]
            NEO_K8S[Neo4j<br/>StatefulSet]
        end

        subgraph Monitoring["Monitoring"]
            PROM[Prometheus]
            GRAF[Grafana]
            ALERT[Alertmanager]
        end

        IG --> FE & BE & WS_POD
        BE --> PG_K8S & REDIS_K8S & KAFKA_K8S & NEO_K8S
        AI_POD --> REDIS_K8S
        PROM --> GRAF & ALERT
    end
```

### 3.2 Backend Deployment Manifest

```yaml
# kubernetes/backend.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: stadiumgenius-backend
  namespace: stadiumgenius
  labels:
    app: backend
    version: v1.0.0
spec:
  replicas: 5
  selector:
    matchLabels:
      app: backend
  template:
    metadata:
      labels:
        app: backend
    spec:
      containers:
        - name: backend
          image: stadiumgenius/backend:1.0.0
          ports:
            - containerPort: 8000
          resources:
            requests:
              cpu: "500m"
              memory: "512Mi"
            limits:
              cpu: "2000m"
              memory: "2Gi"
          envFrom:
            - secretRef:
                name: backend-secrets
            - configMapRef:
                name: backend-config
          livenessProbe:
            httpGet:
              path: /health
              port: 8000
            initialDelaySeconds: 15
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /ready
              port: 8000
            initialDelaySeconds: 5
            periodSeconds: 5
      affinity:
        podAntiAffinity:
          preferredDuringSchedulingIgnoredDuringExecution:
            - weight: 100
              podAffinityTerm:
                labelSelector:
                  matchLabels:
                    app: backend
                topologyKey: topology.kubernetes.io/zone
---
apiVersion: v1
kind: Service
metadata:
  name: backend-service
  namespace: stadiumgenius
spec:
  selector:
    app: backend
  ports:
    - port: 8000
      targetPort: 8000
  type: ClusterIP
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: backend-hpa
  namespace: stadiumgenius
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: stadiumgenius-backend
  minReplicas: 3
  maxReplicas: 20
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
    - type: Resource
      resource:
        name: memory
        target:
          type: Utilization
          averageUtilization: 80
```

### 3.3 Ingress Configuration

```yaml
# kubernetes/ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: stadiumgenius-ingress
  namespace: stadiumgenius
  annotations:
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    nginx.ingress.kubernetes.io/rate-limit: "100"
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
spec:
  tls:
    - hosts:
        - api.stadiumgenius.io
        - app.stadiumgenius.io
      secretName: stadiumgenius-tls
  rules:
    - host: app.stadiumgenius.io
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: frontend-service
                port:
                  number: 3000
    - host: api.stadiumgenius.io
      http:
        paths:
          - path: /v1
            pathType: Prefix
            backend:
              service:
                name: backend-service
                port:
                  number: 8000
          - path: /v1/ws
            pathType: Prefix
            backend:
              service:
                name: websocket-service
                port:
                  number: 8001
```

---

## 4. Edge Deployment

### 4.1 Edge Node Stack

```mermaid
graph TB
    subgraph Jetson["NVIDIA Jetson Orin (Per Node)"]
        DOCKER_E[Docker Runtime]
        INF[Inference Container<br/>YOLOv8 + TensorRT]
        PROC[Stream Processor<br/>Python]
        CACHE_E[Redis Cache<br/>Local]
        MQTT_E[MQTT Client]
        MON[Health Monitor]
        OTA[OTA Update Agent]
    end

    CAM_E[Camera Feed] --> INF
    INF --> PROC
    PROC --> CACHE_E
    PROC --> MQTT_E
    MQTT_E -->|5G / WiFi| CLOUD_E[Cloud Backend]
    MON -->|Metrics| CLOUD_E
    OTA -->|Pull Models| CLOUD_E
```

### 4.2 Edge Deployment Script

```bash
#!/bin/bash
# deploy-edge.sh — Deploy to NVIDIA Jetson edge nodes

NODES=("en-01" "en-02" "en-03" ... "en-47")
IMAGE="stadiumgenius/edge-inference:1.0.0-jetson"

for NODE in "${NODES[@]}"; do
  echo "📶 Deploying to $NODE..."
  ssh jetson@$NODE << 'EOF'
    docker pull $IMAGE
    docker stop sg-inference 2>/dev/null
    docker rm sg-inference 2>/dev/null
    docker run -d \
      --name sg-inference \
      --runtime nvidia \
      --restart always \
      -v /dev/video0:/dev/video0 \
      -e MQTT_BROKER=mqtt://broker.stadiumgenius.local \
      -e NODE_ID=$NODE \
      -e MODEL_PATH=/models/yolov8n.engine \
      $IMAGE
EOF
  echo "✅ $NODE deployed"
done
```

---

## 5. CI/CD Pipeline

### 5.1 GitHub Actions Workflow

```yaml
# .github/workflows/deploy.yml
name: Build & Deploy

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 22

      - name: Install & Test Frontend
        run: |
          cd frontend/dashboard
          npm ci
          npm run lint
          npm run build

      - name: Setup Python
        uses: actions/setup-python@v5
        with:
          python-version: "3.12"

      - name: Install & Test Backend
        run: |
          cd backend
          pip install -r requirements.txt -r requirements-test.txt
          pytest tests/ -v --cov=app

  build:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4

      - name: Build & Push Frontend Image
        run: |
          docker build -t stadiumgenius/frontend:${{ github.sha }} ./frontend/dashboard
          docker push stadiumgenius/frontend:${{ github.sha }}

      - name: Build & Push Backend Image
        run: |
          docker build -t stadiumgenius/backend:${{ github.sha }} ./backend
          docker push stadiumgenius/backend:${{ github.sha }}

  deploy-staging:
    needs: build
    runs-on: ubuntu-latest
    environment: staging
    steps:
      - name: Deploy to Staging
        run: |
          kubectl set image deployment/stadiumgenius-frontend \
            frontend=stadiumgenius/frontend:${{ github.sha }} \
            --namespace=stadiumgenius-staging
          kubectl set image deployment/stadiumgenius-backend \
            backend=stadiumgenius/backend:${{ github.sha }} \
            --namespace=stadiumgenius-staging

  deploy-production:
    needs: deploy-staging
    runs-on: ubuntu-latest
    environment: production
    steps:
      - name: Deploy to Production
        run: |
          kubectl set image deployment/stadiumgenius-frontend \
            frontend=stadiumgenius/frontend:${{ github.sha }} \
            --namespace=stadiumgenius
          kubectl set image deployment/stadiumgenius-backend \
            backend=stadiumgenius/backend:${{ github.sha }} \
            --namespace=stadiumgenius
```

### 5.2 CI/CD Pipeline Flow

```mermaid
graph LR
    PR[Pull Request] --> LINT[Lint & Format]
    LINT --> TEST[Unit Tests]
    TEST --> BUILD[Docker Build]
    BUILD --> PUSH[Push to Registry]
    PUSH --> STG[Deploy Staging]
    STG --> SMOKE[Smoke Tests]
    SMOKE --> APPROVE[Manual Approval]
    APPROVE --> PROD[Deploy Production]
    PROD --> CANARY[Canary Rollout<br/>10% → 50% → 100%]
    CANARY --> MONITOR[Post-Deploy<br/>Monitoring]
```

---

## 6. Monitoring & Observability

### 6.1 Stack

| Component | Tool | Purpose |
|-----------|------|---------|
| Metrics | Prometheus | Infrastructure & app metrics |
| Dashboards | Grafana | Visual monitoring |
| Alerting | Alertmanager + PagerDuty | Incident notifications |
| Logging | Loki / ELK | Centralized log aggregation |
| Tracing | Jaeger / OpenTelemetry | Distributed tracing |
| Uptime | Blackbox Exporter | Endpoint health checks |

### 6.2 Key Alerts

| Alert | Condition | Severity |
|-------|-----------|----------|
| API Latency High | p95 > 2s for 5 min | Warning |
| Edge Node Offline | No heartbeat for 60s | Critical |
| Kafka Consumer Lag | > 10K messages behind | Warning |
| Error Rate Spike | 5xx > 1% for 3 min | Critical |
| Database Connection Pool | > 80% utilization | Warning |
| Memory Pressure | Pod memory > 90% | Warning |

---

## 7. Environment Configuration

### `.env.example`

```bash
# ── Application ──
APP_ENV=development
APP_PORT=8000
APP_DEBUG=true

# ── Database ──
DATABASE_URL=postgresql://sg:sg_secret@localhost:5432/stadiumgenius
REDIS_URL=redis://localhost:6379
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=sg_secret

# ── Kafka ──
KAFKA_BROKERS=localhost:9092

# ── AI ──
OPENAI_API_KEY=sk-...
LLM_MODEL=gpt-4o
LLM_TEMPERATURE=0.3
LLM_MAX_TOKENS=2048

# ── Auth ──
JWT_SECRET=your-256-bit-secret
JWT_EXPIRY=3600

# ── Edge ──
MQTT_BROKER=mqtt://localhost:1883
EDGE_INFERENCE_TIMEOUT=200
```

---

*Next: [AI Workflows →](ai-workflows.md) · [Database Schema →](database-schema.md) · [MVP Roadmap →](mvp-roadmap.md)*
