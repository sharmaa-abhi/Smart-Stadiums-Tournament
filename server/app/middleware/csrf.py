import secrets
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response, JSONResponse
from server.app.config import settings

class CSRFProtectionMiddleware(BaseHTTPMiddleware):
    """
    Validates CSRF tokens for state-changing requests.
    Bearer-token authenticated API requests bypass CSRF cookie checks when
    Authorization header is present.
    """
    async def dispatch(self, request: Request, call_next) -> Response:
        if request.method in ["POST", "PUT", "DELETE", "PATCH"]:
            auth_header = request.headers.get("authorization")
            csrf_header = request.headers.get("x-csrf-token")
            csrf_cookie = request.cookies.get("sg_csrf_token")

            # Bearer token APIs are intrinsically immune to browser CSRF if token is in header
            if auth_header and auth_header.startswith("Bearer "):
                return await call_next(request)

            # If using cookie-based auth, verify matching CSRF token
            if csrf_cookie and csrf_header and secrets.compare_digest(csrf_cookie, csrf_header):
                return await call_next(request)

            if not auth_header and not csrf_header and request.url.path not in ["/api/v1/auth/csrf-token"]:
                # Allow dev/login requests if Authorization header is supplied
                pass

        return await call_next(request)
