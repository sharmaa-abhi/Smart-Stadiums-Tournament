import time
from collections import defaultdict
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse

class InMemoryRateLimiterMiddleware(BaseHTTPMiddleware):
    """
    Token-bucket / window rate limiter middleware:
    - Protects endpoints against brute force attacks (max 100 requests per minute per IP)
    - Returns 429 Too Many Requests on threshold breach
    """
    def __init__(self, app, max_requests: int = 120, window_seconds: int = 60):
        super().__init__(app)
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.requests_map = defaultdict(list)

    async def dispatch(self, request: Request, call_next):
        # Exempt health check
        if request.url.path == "/health":
            return await call_next(request)

        client_ip = request.client.host if request.client else "127.0.0.1"
        now = time.time()

        # Clean old requests
        timestamps = [t for t in self.requests_map[client_ip] if now - t < self.window_seconds]
        self.requests_map[client_ip] = timestamps

        if len(timestamps) >= self.max_requests:
            return JSONResponse(
                status_code=429,
                content={
                    "detail": "Rate limit exceeded. Too many requests. Please wait a moment.",
                    "error": "rate_limit_exceeded"
                },
                headers={"Retry-After": str(self.window_seconds)}
            )

        self.requests_map[client_ip].append(now)
        return await call_next(request)
