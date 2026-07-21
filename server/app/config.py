import os
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "StadiumGenius – AI-Powered Smart Stadium Platform"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Auth0 Configuration
    AUTH0_DOMAIN: str = os.getenv("AUTH0_DOMAIN", "stadiumgenius.us.auth0.com")
    AUTH0_AUDIENCE: str = os.getenv("AUTH0_AUDIENCE", "https://api.stadiumgenius.io")
    AUTH0_ISSUER: str = os.getenv("AUTH0_ISSUER", f"https://stadiumgenius.us.auth0.com/")
    AUTH0_ALGORITHMS: List[str] = ["RS256", "HS256"]
    CUSTOM_CLAIM_NAMESPACE: str = "https://stadiumgenius.io"
    
    # Database Configuration
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./stadiumgenius.db")
    
    # Security Configurations
    SECRET_KEY: str = os.getenv("SECRET_KEY", "stadiumgenius_super_secret_enterprise_key_2026_998877")
    CSRF_SECRET: str = os.getenv("CSRF_SECRET", "csrf_stadiumgenius_protection_secret_key_2026")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 1 day
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://stadiumgenius.io",
    ]
    
    # Dev / Testing Mock Mode
    ALLOW_MOCK_TOKENS: bool = True
    
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
