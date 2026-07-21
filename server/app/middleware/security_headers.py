from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """
    Enforces enterprise security headers on all responses:
    - Strict-Transport-Security (HSTS)
    - Content-Security-Policy (CSP) — without unsafe-inline/unsafe-eval
    - X-Frame-Options (Clickjacking Protection)
    - X-Content-Type-Options (MIME Sniffing Protection)
    - Referrer-Policy
    - Permissions-Policy
    - Cache-Control for API responses
    """

    async def dispatch(self, request: Request, call_next) -> Response:
        response = await call_next(request)

        # Standard security headers
        response.headers["Strict-Transport-Security"] = (
            "max-age=31536000; includeSubDomains; preload"
        )
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = (
            "geolocation=(), microphone=(), camera=(), payment=(), usb=()"
        )
        response.headers["Content-Security-Policy"] = (
            "default-src 'self'; "
            "script-src 'self' https://*.auth0.com; "
            "style-src 'self' https://fonts.googleapis.com; "
            "font-src 'self' https://fonts.gstatic.com; "
            "connect-src 'self' https://*.auth0.com https://stadiumgenius.io; "
            "img-src 'self' data: https:; "
            "frame-ancestors 'none';"
        )

        # Prevent caching of API responses containing sensitive data
        if request.url.path.startswith("/api/"):
            response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate"
            response.headers["Pragma"] = "no-cache"

        return response

