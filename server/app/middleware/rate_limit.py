import time
import logging
from collections import defaultdict
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse

logger = logging.getLogger("stadiumgenius.ratelimit")

# Maximum tracked IPs before forced cleanup (prevents memory exhaustion in DDoS)
MAX_TRACKED_IPS = 10_000

# Paths that get stricter rate limits (auth endpoints are brute-force targets)
AUTH_PATHS = frozenset({"/api/v1/auth/sync", "/api/v1/auth/logout"})
EXEMPT_PATHS = frozenset({"/health", "/api/v1/docs", "/api/v1/redoc", "/api/v1/openapi.json"})


class InMemoryRateLimiterMiddleware(BaseHTTPMiddleware):
    """
    Sliding-window rate limiter middleware:
    - General endpoints: max_requests per window (default 120/min)
    - Auth endpoints: stricter limit (30/min) to prevent brute-force
    - Health/docs: exempt
    - Automatic cleanup when tracked IPs exceed MAX_TRACKED_IPS
    """

    def __init__(self, app, max_requests: int = 120, window_seconds: int = 60):
        super().__init__(app)
        self.max_requests = max_requests
        self.auth_max_requests = min(30, max_requests // 4)  # Auth gets 1/4 the limit
        self.window_seconds = window_seconds
        self.requests_map: dict[str, list[float]] = defaultdict(list)
        self._last_cleanup = time.time()

    def _cleanup_stale_entries(self, now: float):
        """Remove entries older than the window. Cap total tracked IPs."""
        stale_keys = [
            ip for ip, timestamps in self.requests_map.items()
            if not timestamps or (now - timestamps[-1]) > self.window_seconds
        ]
        for key in stale_keys:
            del self.requests_map[key]

        # Emergency cleanup if we're tracking too many IPs (DDoS scenario)
        if len(self.requests_map) > MAX_TRACKED_IPS:
            logger.warning(
                "Rate limiter tracking %d IPs — forcing cleanup", len(self.requests_map)
            )
            self.requests_map.clear()

    async def dispatch(self, request: Request, call_next):
        # Exempt health/docs paths
        if request.url.path in EXEMPT_PATHS:
            return await call_next(request)

        client_ip = request.client.host if request.client else "127.0.0.1"
        now = time.time()

        # Periodic cleanup (every 30 seconds)
        if now - self._last_cleanup > 30:
            self._cleanup_stale_entries(now)
            self._last_cleanup = now

        # Remove timestamps outside the current window
        timestamps = [t for t in self.requests_map[client_ip] if now - t < self.window_seconds]
        self.requests_map[client_ip] = timestamps

        # Determine rate limit based on path
        is_auth = request.url.path in AUTH_PATHS
        limit = self.auth_max_requests if is_auth else self.max_requests

        if len(timestamps) >= limit:
            logger.warning(
                "Rate limit exceeded: IP=%s, path=%s, requests=%d/%d",
                client_ip, request.url.path, len(timestamps), limit,
            )
            return JSONResponse(
                status_code=429,
                content={
                    "detail": "Rate limit exceeded. Too many requests. Please wait a moment.",
                    "error": "rate_limit_exceeded",
                },
                headers={"Retry-After": str(self.window_seconds)},
            )

        self.requests_map[client_ip].append(now)
        return await call_next(request)

