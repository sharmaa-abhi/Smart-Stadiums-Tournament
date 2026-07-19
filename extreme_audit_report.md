# 🏟️ StadiumGenius — Extreme-Level Audit Report

> **Project:** Smart-Stadiums-Tournament  
> **Audit Date:** 2026-07-16  
> **Auditor:** Antigravity AI  
> **Scope:** All frontend, backend, configuration, security, PWA, build pipeline, and runtime activities

---

## Summary Scorecard

| Category | Status | Issues Found |
|---|---|---|
| **Build (Vite)** | ✅ **PASS** | 0 errors — clean build |
| **Lint (OxLint)** | ⚠️ **78 warnings** | Unused imports, dev-dist noise |
| **Runtime Errors** | 🔴 **CRITICAL** | XSS vulnerability in AI chat |
| **Security (Server)** | 🔴 **CRITICAL** | Hardcoded JWT secret, no rate limiter, no helmet |
| **Security (Frontend)** | ⚠️ **WARNING** | Token in URL (SSE), env key empty |
| **PWA Assets** | 🔴 **ERROR** | Missing icon/screenshot files |
| **Routing** | ⚠️ **WARNING** | No 404 catch-all route |
| **Database** | ⚠️ **WARNING** | `node:sqlite` requires Node ≥ 22.5 |
| **Architecture** | ⚠️ **WARNING** | Duplicated code, `sanitizeUser` in 2 files |
| **Configuration** | ⚠️ **WARNING** | Unused env key, `nodemon` as production dep |

---

## 🔴 CRITICAL Issues

### 1. XSS Vulnerability — `dangerouslySetInnerHTML` in AI Chat

> [!CAUTION]
> **Severity: CRITICAL** — User input flows into unescaped HTML rendering

**File:** [AIAssistant.jsx](file:///c:/Users/ABHI%20SHARMA/OneDrive/Desktop/projects/Smart-Stadiums-Tournament/src/pages/AIAssistant.jsx#L68-L76)

```jsx
// Line 71: User-influenced content injected as raw HTML
let formatted = line.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white/90">$1</strong>');
return (
  <span key={i} className="block" dangerouslySetInnerHTML={{ __html: formatted || '&nbsp;' }} />
);
```

**Risk:** If an AI response or a manipulated API payload contains `<script>` or `<img onerror=...>`, it will execute arbitrary JavaScript in the user's browser. This is a textbook **Stored XSS** vulnerability.

**Fix:** Replace `dangerouslySetInnerHTML` with a safe rendering approach using React elements or a sanitizer like `DOMPurify`.

---

### 2. Hardcoded JWT Secret in `.env`

> [!CAUTION]
> **Severity: CRITICAL** — Predictable secret allows token forgery

**File:** [server/.env](file:///c:/Users/ABHI%20SHARMA/OneDrive/Desktop/projects/Smart-Stadiums-Tournament/server/.env#L2)

```
JWT_SECRET=super-secret-stadium-genius-key-fifa-2026-xyz
```

**Risk:** Anyone who reads this file (or any commit where it was checked in) can forge valid JWTs and access any API endpoint as any user/role, including admin.

**Fix:** Use a cryptographically random secret (≥ 64 chars) and never commit it to version control.

---

### 3. No Rate Limiting on Authentication Endpoints

> [!CAUTION]
> **Severity: CRITICAL** — Brute-force password attacks possible

**Files:** [server/routes/auth.js](file:///c:/Users/ABHI%20SHARMA/OneDrive/Desktop/projects/Smart-Stadiums-Tournament/server/routes/auth.js) (login, register)

No `express-rate-limit` or similar middleware is present. The `/api/auth/login` endpoint can be hammered indefinitely.

---

### 4. No Security Headers (Missing Helmet)

> [!WARNING]
> **Severity: HIGH** — Clickjacking, MIME-sniffing, and other header-based attacks possible

**File:** [server/index.js](file:///c:/Users/ABHI%20SHARMA/OneDrive/Desktop/projects/Smart-Stadiums-Tournament/server/index.js)

No `helmet` middleware is used. Missing headers: `X-Content-Type-Options`, `X-Frame-Options`, `Content-Security-Policy`, `Strict-Transport-Security`, etc.

---

### 5. Missing PWA Icon & Screenshot Assets

> [!IMPORTANT]
> **Severity: ERROR** — PWA installation will fail

The following directories are referenced in [vite.config.js](file:///c:/Users/ABHI%20SHARMA/OneDrive/Desktop/projects/Smart-Stadiums-Tournament/vite.config.js#L12), [index.html](file:///c:/Users/ABHI%20SHARMA/OneDrive/Desktop/projects/Smart-Stadiums-Tournament/index.html#L13), and [manifest.json](file:///c:/Users/ABHI%20SHARMA/OneDrive/Desktop/projects/Smart-Stadiums-Tournament/public/manifest.json) but **do not exist**:

| Missing Asset | Referenced In |
|---|---|
| `/public/icons/` (entire directory) | `index.html`, `vite.config.js`, `manifest.json`, `sw.js` |
| `/public/icons/icon-192.png` | Apple touch icon, PWA manifest |
| `/public/icons/icon-512.png` | PWA manifest |
| `/public/icons/icon-96.png` | PWA shortcuts |
| `/public/screenshots/` (entire directory) | `vite.config.js` includeAssets |

**Impact:** PWA install prompt will not appear. Apple touch icon will 404. Chrome Lighthouse PWA audit will fail.

---

## ⚠️ WARNING Issues

### 6. JWT Token Exposed in URL Query String (SSE)

**Files:**
- [NotificationContext.jsx](file:///c:/Users/ABHI%20SHARMA/OneDrive/Desktop/projects/Smart-Stadiums-Tournament/src/context/NotificationContext.jsx#L30) — `?token=${token}`
- [Dashboard.jsx](file:///c:/Users/ABHI%20SHARMA/OneDrive/Desktop/projects/Smart-Stadiums-Tournament/src/pages/Dashboard.jsx#L117) — `?token=${token}`
- [server/middleware/auth.js](file:///c:/Users/ABHI%20SHARMA/OneDrive/Desktop/projects/Smart-Stadiums-Tournament/server/middleware/auth.js#L9) — accepts `req.query.token`

**Risk:** Tokens in URLs get logged in browser history, server access logs, proxy logs, and `Referer` headers. This is a token leakage vector.

**Note:** This is a known limitation of EventSource (SSE) which doesn't support custom headers. Consider using `fetch`-based SSE or cookie-based auth for SSE streams.

---

### 7. Empty Clerk Publishable Key

**File:** [.env](file:///c:/Users/ABHI%20SHARMA/OneDrive/Desktop/projects/Smart-Stadiums-Tournament/.env)

```
VITE_CLERK_PUBLISHABLE_KEY=
```

This key is empty and not used anywhere in the code. It's leftover config that should be removed to avoid confusion.

---

### 8. No 404 Catch-All Route (React Router)

**File:** [App.jsx](file:///c:/Users/ABHI%20SHARMA/OneDrive/Desktop/projects/Smart-Stadiums-Tournament/src/App.jsx#L59-L82)

No `<Route path="*" element={<NotFound />} />` exists. If a user navigates to an undefined URL (e.g., `/xyz`), they will see a blank page instead of a user-friendly 404.

---

### 9. Unused Imports in Settings Page (Lint Warnings)

**File:** [Settings.jsx](file:///c:/Users/ABHI%20SHARMA/OneDrive/Desktop/projects/Smart-Stadiums-Tournament/src/pages/Settings.jsx#L4-L5)

```jsx
// These are imported but never used:
Settings as SettingsIcon, Palette, Database, Wifi
```

The linter flagged 4 unused imports. Won't cause runtime errors but increases bundle size unnecessarily.

---

### 10. `node:sqlite` Requires Node.js ≥ 22.5

**File:** [server/db/database.js](file:///c:/Users/ABHI%20SHARMA/OneDrive/Desktop/projects/Smart-Stadiums-Tournament/server/db/database.js#L1)

```javascript
import { DatabaseSync } from 'node:sqlite';
```

The `node:sqlite` built-in module is only available in **Node.js 22.5+** (experimental) and became stable in Node 23+. If anyone tries to run this server on Node 18/20 LTS, it will crash on startup with `ERR_MODULE_NOT_FOUND`.

**Fix:** Either document the Node.js version requirement in README/package.json `engines`, or use `better-sqlite3` for broader compatibility.

---

### 11. `nodemon` Listed as Production Dependency

**File:** [server/package.json](file:///c:/Users/ABHI%20SHARMA/OneDrive/Desktop/projects/Smart-Stadiums-Tournament/server/package.json#L18)

```json
"dependencies": {
  "nodemon": "^3.1.14"  // ← Should be devDependencies
}
```

`nodemon` is a development tool and should be in `devDependencies`.

---

### 12. Duplicated `sanitizeUser` Function

**Files:**
- [server/routes/auth.js](file:///c:/Users/ABHI%20SHARMA/OneDrive/Desktop/projects/Smart-Stadiums-Tournament/server/routes/auth.js#L17-L20)
- [server/routes/users.js](file:///c:/Users/ABHI%20SHARMA/OneDrive/Desktop/projects/Smart-Stadiums-Tournament/server/routes/users.js#L9-L12)

The exact same function is copy-pasted in two route files. Extract to a shared utility.

---

### 13. Console Logs Left in Production Code

**File:** [PWAInstallBanner.jsx](file:///c:/Users/ABHI%20SHARMA/OneDrive/Desktop/projects/Smart-Stadiums-Tournament/src/components/PWAInstallBanner.jsx)

Three `console.log` statements remain on lines 20, 39, and 49. These should be removed or gated behind `import.meta.env.DEV`.

---

### 14. `useEffect` Missing Dependency: `VENUE_ID`

**File:** [Dashboard.jsx](file:///c:/Users/ABHI%20SHARMA/OneDrive/Desktop/projects/Smart-Stadiums-Tournament/src/pages/Dashboard.jsx#L92-L133)

```jsx
useEffect(() => {
  // uses VENUE_ID inside
}, []); // ← VENUE_ID is not in the dependency array
```

If the active venue changes (e.g., in Settings), the Dashboard won't re-fetch data until a hard refresh.

---

### 15. No Input Sanitization on Broadcast Messages

**File:** [server/routes/broadcast.js](file:///c:/Users/ABHI%20SHARMA/OneDrive/Desktop/projects/Smart-Stadiums-Tournament/server/routes/broadcast.js#L26-L51)

The `title` and `message` fields from `req.body` are stored directly in SQLite without any length limit, character filtering, or sanitization. A malicious user could store megabytes of data per broadcast.

---

### 16. No Email Format Validation on Registration

**File:** [server/routes/auth.js](file:///c:/Users/ABHI%20SHARMA/OneDrive/Desktop/projects/Smart-Stadiums-Tournament/server/routes/auth.js#L23-L63)

Only checks if `email` is truthy, but doesn't validate email format server-side. Any string will be accepted (e.g., `"not-an-email"`). The frontend `type="email"` check is easily bypassed.

---

### 17. Anyone Can Register as Admin

**File:** [server/routes/auth.js](file:///c:/Users/ABHI%20SHARMA/OneDrive/Desktop/projects/Smart-Stadiums-Tournament/server/routes/auth.js#L49)

```javascript
const result = stmt.run(name, email, hashedPassword, role || 'operator');
```

The `role` field comes directly from `req.body` with no restriction. Any user can self-register as `admin` and gain full system access. **This is a privilege escalation vulnerability.**

---

### 18. `terser-brunch` — Likely Unnecessary Dependency

**File:** [package.json](file:///c:/Users/ABHI%20SHARMA/OneDrive/Desktop/projects/Smart-Stadiums-Tournament/package.json#L28)

```json
"terser-brunch": "^4.1.0"
```

This is a Brunch.js plugin for Terser minification. This project uses **Vite**, not Brunch. This dependency is completely unused and adds bloat to `node_modules`.

---

## ✅ What's Working Well

| Area | Status |
|---|---|
| **Vite Build** | Clean build — 0 errors, 47 precache entries, all chunks generated |
| **Code Splitting** | All 13 pages are lazy-loaded via `React.lazy()` — excellent |
| **Auth Flow** | JWT-based login/register with bcrypt hashing (12 rounds) — solid |
| **Role-Based Access Control** | `RoleGuard` + `ProtectedRoute` properly implemented |
| **SSE Streaming** | Real-time notifications and live KPIs via Server-Sent Events |
| **Database Schema** | Well-structured with foreign keys, WAL mode, and proper transactions |
| **Error Handling** | All server routes have try/catch with proper error responses |
| **UI/UX** | Premium glassmorphism design, skeleton loading states, PWA support |
| **Self-protection** | Admin can't delete themselves or demote their own role |

---

## Priority Fix Order

| Priority | Issue | Effort |
|---|---|---|
| 🔴 P0 | #17 — Anyone can register as admin (privilege escalation) | 5 min |
| 🔴 P0 | #1 — XSS in AI Chat (`dangerouslySetInnerHTML`) | 15 min |
| 🔴 P0 | #2 — Hardcoded JWT secret | 5 min |
| 🔴 P1 | #3 — No rate limiting on auth endpoints | 10 min |
| 🔴 P1 | #4 — Missing security headers (Helmet) | 5 min |
| 🟡 P2 | #5 — Missing PWA icon assets | 15 min |
| 🟡 P2 | #8 — No 404 catch-all route | 5 min |
| 🟡 P2 | #10 — Node.js version requirement undocumented | 2 min |
| 🟢 P3 | #6, #7, #9, #11-16 — Cleanup items | 30 min |
