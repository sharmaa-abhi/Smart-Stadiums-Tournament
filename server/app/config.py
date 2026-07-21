import os
import secrets
import logging
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict

logger = logging.getLogger("stadiumgenius.config")


def _require_secret(env_key: str, *, dev_fallback: str | None = None) -> str:
    """Return env var value or raise in production if missing."""
    value = os.getenv(env_key)
    if value:
        return value
    env = os.getenv("ENVIRONMENT", "development").lower()
    if env in ("production", "staging"):
        raise RuntimeError(
            f"CRITICAL: Environment variable '{env_key}' is required in {env} mode. "
            "Set it before starting the server."
        )
    fallback = dev_fallback or secrets.token_urlsafe(48)
    logger.warning(
        "⚠️  %s not set — using auto-generated dev secret. "
        "Sessions will be lost on restart. Set it in .env for persistence.",
        env_key,
    )
    return fallback


class Settings(BaseSettings):
    PROJECT_NAME: str = "StadiumGenius – AI-Powered Smart Stadium Platform"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"

    # Environment: development | staging | production
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")

    # Auth0 Configuration
    AUTH0_DOMAIN: str = os.getenv("AUTH0_DOMAIN", "stadiumgenius.us.auth0.com")
    AUTH0_AUDIENCE: str = os.getenv("AUTH0_AUDIENCE", "https://api.stadiumgenius.io")
    AUTH0_ISSUER: str = os.getenv(
        "AUTH0_ISSUER", f"https://{os.getenv('AUTH0_DOMAIN', 'stadiumgenius.us.auth0.com')}/"
    )
    AUTH0_ALGORITHMS: List[str] = ["RS256"]
    CUSTOM_CLAIM_NAMESPACE: str = "https://stadiumgenius.io"

    # Database Configuration
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./stadiumgenius.db")

    # Security Configurations — NO hardcoded secrets
    SECRET_KEY: str = _require_secret("SECRET_KEY")
    CSRF_SECRET: str = _require_secret("CSRF_SECRET")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60  # 1 hour (was 24h — too long)
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://stadiumgenius.io",
    ]

    # Mock tokens only allowed in development — NEVER in production
    @property
    def ALLOW_MOCK_TOKENS(self) -> bool:
        return self.ENVIRONMENT.lower() == "development"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
