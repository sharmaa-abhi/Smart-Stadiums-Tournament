# Auth0-Only Authentication — Remove All Non-Auth0 Login/Register

Make the Login and Register pages use **only Auth0** for authentication. Remove all local email/password forms, mock login, and any non-Auth0 authentication paths. Only valid Auth0 authentication should be allowed.

## Current Problems

1. **Login page** has both Auth0 buttons AND a local email/password form that calls `loginMock()` — allowing bypass without real authentication
2. **Register page** has an Auth0 button AND a local email/password form that calls `loginMock()` — same bypass issue
3. **AuthContext** exposes `loginMock()` which creates fake users with mock tokens — no real Auth0 validation
4. **Server middleware** accepts `mock-*` and `test-*` tokens as valid — major security hole
5. **Server routes** have `/register` and `/login` endpoints with password-based auth — bypasses Auth0
6. **`.env`** file is missing `VITE_AUTH0_DOMAIN` and `VITE_AUTH0_CLIENT_ID` — Auth0 won't work without these

> [!IMPORTANT]
> You **must** set your Auth0 credentials in `.env` for this to work:
> ```
> VITE_AUTH0_DOMAIN=your-tenant.us.auth0.com
> VITE_AUTH0_CLIENT_ID=your-auth0-client-id
> ```
> Without these, the app will show an error screen instead of letting users in.

## Open Questions

> [!IMPORTANT]
> **Do you have an Auth0 account set up?** If not, you'll need to create one at [auth0.com](https://auth0.com) and create a Single Page Application. Then paste the Domain and Client ID into the `.env` file.

## Proposed Changes

### Frontend — Auth Pages

---

#### [MODIFY] [Login.jsx](file:///c:/Users/ABHI%20SHARMA/OneDrive/Desktop/projects/Smart-Stadiums-Tournament/src/pages/Login.jsx)
- **Remove** the entire email/password form (email input, password input, remember me, submit button)
- **Remove** the `handleSubmit` function (calls `loginMock`)
- **Remove** the `handleEmailChange` role-detection logic
- **Remove** the "forgot password" functionality
- **Remove** email/password state variables (`email`, `password`, `showPassword`, `rememberMe`)
- **Keep** the Auth0 Universal Login button, Google Login button, and Microsoft Login button
- **Keep** the role selector (so users can pick their role before Auth0 redirect)
- **Keep** all visual styling/widgets (StadiumBackdrop, MatchDayHype, GateMap, Mascot)
- **Update** the "or sign in with password" divider → remove it entirely

#### [MODIFY] [Register.jsx](file:///c:/Users/ABHI%20SHARMA/OneDrive/Desktop/projects/Smart-Stadiums-Tournament/src/pages/Register.jsx)
- **Remove** the entire name/email/password form
- **Remove** the `handleSubmit` function (calls `loginMock`)
- **Remove** form state variables (`name`, `email`, `password`, `showPassword`)
- **Replace** with a single "Register via Auth0" button that calls `loginWithAuth0` with `screen_hint: 'signup'`
- **Keep** role selector cards
- **Keep** all visual styling/widgets

---

### Frontend — Auth Context

---

#### [MODIFY] [AuthContext.jsx](file:///c:/Users/ABHI%20SHARMA/OneDrive/Desktop/projects/Smart-Stadiums-Tournament/src/context/AuthContext.jsx)
- **Remove** the `loginMock` function entirely — no more fake users
- **Remove** mock token fallback logic (`mock-*` token generation in Auth0 sync)
- **Remove** mock token recovery in the startup `initAuth()` (lines 119-132 where it creates fake users from mock tokens)
- **Remove** backward-compatible aliases `login: loginMock, register: loginMock`
- **Enforce** that `isAuthenticated` is only `true` when Auth0 is authenticated (`auth0IsAuthenticated`)
- **Keep** `loginWithAuth0`, `triggerPasswordReset`, `logout` — these are the valid Auth0 flows
- Add a new `loginWithAuth0Signup` convenience function for the Register page

---

### Frontend — Entry Point

---

#### [MODIFY] [main.jsx](file:///c:/Users/ABHI%20SHARMA/OneDrive/Desktop/projects/Smart-Stadiums-Tournament/src/main.jsx)
- **Remove** the fallback `placeholder.us.auth0.com` — if Auth0 isn't configured, show an error
- **Make** Auth0 configuration **mandatory** — throw a visible error if env vars are missing

---

### Backend — Server Middleware

---

#### [MODIFY] [auth.js (middleware)](file:///c:/Users/ABHI%20SHARMA/OneDrive/Desktop/projects/Smart-Stadiums-Tournament/server/middleware/auth.js)
- **Remove** mock/test token acceptance (lines 17-27 that accept `mock-*` and `test-*` tokens)
- **Keep** Auth0 JWT token validation (RS256 decode)
- **Keep** locally-signed JWT validation for backend-issued tokens

#### [MODIFY] [auth.js (routes)](file:///c:/Users/ABHI%20SHARMA/OneDrive/Desktop/projects/Smart-Stadiums-Tournament/server/routes/auth.js)
- **Remove** `POST /register` endpoint (password-based registration)
- **Remove** `POST /login` endpoint (password-based login)
- **Keep** `POST /auth0-login` endpoint (Auth0 user sync)
- **Keep** `GET /me` endpoint

---

### Environment Config

---

#### [MODIFY] [.env](file:///c:/Users/ABHI%20SHARMA/OneDrive/Desktop/projects/Smart-Stadiums-Tournament/.env)
- Add placeholder entries for `VITE_AUTH0_DOMAIN` and `VITE_AUTH0_CLIENT_ID` so user knows they need to fill them

## Verification Plan

### Manual Verification
- Start the dev server (`npm run dev`)
- Visit `/login` → should show ONLY Auth0 buttons (Google, Microsoft, Universal Login) and role selector — NO email/password form
- Visit `/register` → should show ONLY "Register via Auth0" button and role selector — NO email/password form
- Try to access a protected route without Auth0 login → should redirect to `/login`
- Click Auth0 login → should redirect to Auth0's hosted login page
- After Auth0 login → should redirect back and grant access
