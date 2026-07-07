stadium-genius/
│
├── README.md
├── LICENSE
├── .gitignore
├── docker-compose.yml
├── Makefile
├── .env.example
│
├── docs/
│   ├── README.md
│   ├── architecture.md
│   ├── data-flow.md
│   ├── api.md
│   ├── deployment.md
│   ├── ai-workflows.md
│   ├── database-schema.md
│   ├── mvp-roadmap.md
│   ├── security.md
│   ├── monitoring.md
│   ├── adr/
│   │   ├── ADR-001-system-architecture.md
│   │   ├── ADR-002-database-selection.md
│   │   └── ADR-003-edge-computing.md
│   │
│   └── diagrams/
│       ├── architecture.mmd
│       ├── deployment.mmd
│       ├── sequence.mmd
│       ├── dataflow.mmd
│       └── database.mmd
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── ai/
│   │   ├── analytics/
│   │   ├── auth/
│   │   ├── digital_twin/
│   │   ├── ingestion/
│   │   ├── models/
│   │   ├── services/
│   │   ├── websocket/
│   │   ├── utils/
│   │   └── main.py
│   │
│   ├── tests/
│   ├── requirements.txt
│   ├── Dockerfile
│   └── README.md
│
├── frontend/
│   ├── dashboard/
│   │   ├── src/
│   │   ├── public/
│   │   ├── package.json
│   │   └── README.md
│   │
│   ├── mobile/
│   │   ├── src/
│   │   ├── assets/
│   │   ├── package.json
│   │   └── README.md
│   │
│   └── shared/
│
├── infrastructure/
│   ├── docker/
│   │   ├── backend.Dockerfile
│   │   ├── frontend.Dockerfile
│   │   └── ai.Dockerfile
│   │
│   ├── kubernetes/
│   │   ├── backend.yaml
│   │   ├── frontend.yaml
│   │   ├── kafka.yaml
│   │   ├── redis.yaml
│   │   ├── postgres.yaml
│   │   ├── neo4j.yaml
│   │   └── ingress.yaml
│   │
│   ├── terraform/
│   │   ├── aws/
│   │   └── azure/
│   │
│   └── monitoring/
│       ├── prometheus.yml
│       └── grafana/
│
├── database/
│   ├── postgres/
│   │   ├── schema.sql
│   │   ├── migrations/
│   │   └── seed.sql
│   │
│   ├── neo4j/
│   │   ├── schema.cypher
│   │   └── seed.cypher
│   │
│   └── timescaledb/
│       ├── schema.sql
│       └── retention.sql
│
├── streaming/
│   ├── kafka/
│   ├── flink/
│   └── topics.md
│
├── ai/
│   ├── prompts/
│   │   ├── operator.md
│   │   ├── fan.md
│   │   ├── incident.md
│   │   └── evacuation.md
│   │
│   ├── rag/
│   ├── models/
│   ├── evaluation/
│   └── guardrails/
│
├── scripts/
│   ├── start.sh
│   ├── stop.sh
│   ├── seed.py
│   └── simulator.py
│
├── tests/
│   ├── integration/
│   ├── unit/
│   └── performance/
│
└── assets/
    ├── architecture.png
    ├── dashboard.png
    ├── logo.png
    └── screenshots/
