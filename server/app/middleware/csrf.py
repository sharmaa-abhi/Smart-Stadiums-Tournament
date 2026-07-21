import secrets
import logging
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response, JSONResponse

logger = logging.getLogger("stadiumgenius.csrf")

# Paths exempt from CSRF validation
CSRF_EXEMPT_PATHS = frozenset({
    "/api/v1/auth/csrf-token",
    "/health",
    "/api/v1/docs",
    "/api/v1/redoc",
    "/api/v1/openapi.json",
})


class CSRFProtectionMiddleware(BaseHTTPMiddleware):
    """
    Validates CSRF tokens for state-changing requests.

    Security model:
    - Bearer-token API requests (Authorization header) bypass CSRF checks
      because tokens sent via JS headers are not subject to browser CSRF attacks.
    - Cookie-based auth requests MUST include a matching X-CSRF-Token header.
    - Requests with no auth at all are passed through to downstream auth
      handlers which will reject them appropriately.
    """

    async def dispatch(self, request: Request, call_next) -> Response:
        # Only check state-changing methods
        if request.method not in ("POST", "PUT", "DELETE", "PATCH"):
            return await call_next(request)

        # Exempt specific paths
        if request.url.path in CSRF_EXEMPT_PATHS:
            return await call_next(request)

        auth_header = request.headers.get("authorization", "")

        # Bearer token APIs are immune to browser CSRF — the token is in a
        # header that cannot be set by cross-origin form submissions.
        if auth_header.startswith("Bearer "):
            return await call_next(request)

        # For cookie-based auth, enforce CSRF token validation
        csrf_cookie = request.cookies.get("sg_csrf_token")
        csrf_header = request.headers.get("x-csrf-token")

        if csrf_cookie and csrf_header and secrets.compare_digest(csrf_cookie, csrf_header):
            return await call_next(request)

        # If there's a cookie but no matching header, this is a potential CSRF attack
        if csrf_cookie and not csrf_header:
            logger.warning(
                "CSRF validation failed: cookie present but X-CSRF-Token header missing. "
                "Path: %s, IP: %s",
                request.url.path,
                request.client.host if request.client else "unknown",
            )
            return JSONResponse(
                status_code=403,
                content={
                    "detail": "CSRF validation failed. Missing or invalid X-CSRF-Token header.",
                    "error": "csrf_validation_failed",
                },
            )

        # No cookie and no bearer — pass through; downstream auth will reject
        return await call_next(request)

