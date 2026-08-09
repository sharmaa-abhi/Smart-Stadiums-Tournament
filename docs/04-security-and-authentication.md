# 🛡️ StadiumGenius — Security & Authentication

> **Security Model:** Zero-Trust · Role-Based Access Control (RBAC) · Auth0 / Supabase Auth

---

## 1. Authentication & Security Middleware

StadiumGenius enforces multi-layered defense mechanisms across the entire stack:
1. **JWT & Auth0 Token Verification:** Validates standard JWTs and Auth0 OAuth tokens on protected routes.
2. **Security Headers (Express):** Enforces strict HTTP security headers:
   - `Content-Security-Policy`
   - `Strict-Transport-Security` (HSTS)
   - `X-Content-Type-Options: nosniff`
   - `X-Frame-Options: DENY`
3. **Rate Limiting:** Protects `/api/auth` endpoints from brute-force attempts (max 20 requests per window in prod).

---

## 2. Role-Based Access Control (RBAC) Matrix

| User Role | Dashboard View | Incident Management | AI Assistant | System Settings |
|---|---|---|---|---|
| **Admin** | Full Access | Create / Update / Resolve | Full Queries & Actions | Full Configuration |
| **Operator** | Full Access | Create / Acknowledge | Query & Recommend | Read-only |
| **Security Officer** | Security Console | Update Incidents | Query Anomaly Data | None |
| **Viewer / Guest** | Read-Only | Read-Only | None | None |

---

## 3. Environment Variable Security Guidelines

- `.env` and `.env.local` files containing secrets (such as `SUPABASE_SECRET_KEY` or `JWT_SECRET`) are strictly ignored in `.gitignore` and **must never be committed to git repositories**.
- Template values and placeholders are maintained in `.env.example` and `server/.env.example`.
