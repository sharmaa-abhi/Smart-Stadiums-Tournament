# 🗄️ StadiumGenius — Database Schema & Prisma ORM

> **Database Engine:** Supabase PostgreSQL  
> **ORM Layer:** Prisma ORM 7 (`@prisma/client`)

---

## 1. Supabase & Prisma Configuration

Prisma ORM is configured to connect to Supabase PostgreSQL using connection poolers:
- **Transaction Pooler (`DATABASE_URL`):** Used for standard application queries on port `6543`.
- **Session Pooler (`DIRECT_URL`):** Used for schema migrations on port `5432`.

### `prisma.config.ts`
```typescript
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
    directUrl: process.env["DIRECT_URL"],
  },
});
```

### `prisma/schema.prisma`
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
}
```

---

## 2. Relational Entity ERD Model

```mermaid
erDiagram
    USERS ||--o{ INCIDENTS : reports
    VENUES ||--o{ ZONES : contains
    ZONES ||--o{ INCIDENTS : location
    INCIDENTS ||--o{ AI_RECOMMENDATIONS : generates

    USERS {
        string id PK
        string email
        string role
        datetime createdAt
    }
    VENUES {
        string id PK
        string name
        int capacity
        string location
    }
    ZONES {
        string id PK
        string venueId FK
        string name
        int currentOccupancy
    }
    INCIDENTS {
        string id PK
        string zoneId FK
        string severity
        string status
        datetime timestamp
    }
```

---

## 3. Database Environment Setup (`.env` / `.env.local`)

```env
# ── Supabase Configuration ──
SUPABASE_URL=https://diabdoyuzyqsizneczfg.supabase.co
SUPABASE_PUBLISHABLE_KEY=sb_publishable_xpyH4erD3sD3uD5fXEkWQA_...
SUPABASE_SECRET_KEY=sb_secret_ToSGeQkNaU9EAfwbm3kD-w_...
SUPABASE_JWKS_URL=https://diabdoyuzyqsizneczfg.supabase.co/auth/v1/.well-known/jwks.json

# ── Supabase Postgres Direct Connection ──
DATABASE_URL="postgresql://postgres.diabdoyuzyqsizneczfg:[PASSWORD]@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.diabdoyuzyqsizneczfg:[PASSWORD]@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres"
```
