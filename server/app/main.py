import logging
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from server.app.config import settings
from server.app.db.database import engine, Base, SessionLocal
from server.app.db.models import RoleModel, PermissionModel, SystemConfigModel, UserModel
from server.app.core.auth0 import ROLE_PERMISSIONS_MAP

from server.app.middleware.security_headers import SecurityHeadersMiddleware
from server.app.middleware.rate_limit import InMemoryRateLimiterMiddleware
from server.app.middleware.csrf import CSRFProtectionMiddleware

from server.app.api.v1.endpoints import auth, admin, manager, operator, security

logger = logging.getLogger("stadiumgenius")

# Initialize database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url=f"{settings.API_V1_STR}/docs",
    redoc_url=f"{settings.API_V1_STR}/redoc",
)

# 1. CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. Custom Security Middlewares
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(InMemoryRateLimiterMiddleware, max_requests=120, window_seconds=60)
app.add_middleware(CSRFProtectionMiddleware)

# Seed initial database state if empty
@app.on_event("startup")
def seed_database_defaults():
    db = SessionLocal()
    try:
        # Seed permissions
        existing_perms = {p.code for p in db.query(PermissionModel).all()}
        all_perm_codes = set()
        for perms in ROLE_PERMISSIONS_MAP.values():
            all_perm_codes.update(perms)
            
        for code in all_perm_codes:
            if code not in existing_perms:
                db.add(PermissionModel(code=code, description=f"Permission for {code}"))
        
        # Seed roles
        existing_roles = {r.name for r in db.query(RoleModel).all()}
        for r_name in ROLE_PERMISSIONS_MAP.keys():
            if r_name not in existing_roles:
                db.add(RoleModel(name=r_name, description=f"Default {r_name} role"))

        # Seed initial system configuration
        if not db.query(SystemConfigModel).filter(SystemConfigModel.key == "stadium_name").first():
            db.add(SystemConfigModel(key="stadium_name", value="MetLife Stadium - Smart Venue", description="Primary Venue Name"))
        if not db.query(SystemConfigModel).filter(SystemConfigModel.key == "security_level").first():
            db.add(SystemConfigModel(key="security_level", value="DEFCON-4 (Normal Operational Readiness)", description="Security Protocol Level"))

        db.commit()
    except Exception as e:
        db.rollback()
        logger.error(f"Error seeding database defaults: {e}")
    finally:
        db.close()

# Include Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(admin.router, prefix=settings.API_V1_STR)
app.include_router(manager.router, prefix=settings.API_V1_STR)
app.include_router(operator.router, prefix=settings.API_V1_STR)
app.include_router(security.router, prefix=settings.API_V1_STR)

@app.get("/health", tags=["Health"])
async def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION
    }

# Global Exception Handlers
@app.exception_handler(401)
async def custom_401_handler(request: Request, exc):
    return JSONResponse(
        status_code=status.HTTP_401_UNAUTHORIZED,
        content={"detail": getattr(exc, "detail", "Unauthorized access. Invalid or missing JWT access token.")},
        headers={"WWW-Authenticate": "Bearer"}
    )

@app.exception_handler(403)
async def custom_403_handler(request: Request, exc):
    return JSONResponse(
        status_code=status.HTTP_403_FORBIDDEN,
        content={"detail": getattr(exc, "detail", "Forbidden. You do not have sufficient RBAC permissions for this resource.")}
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server.app.main:app", host="0.0.0.0", port=8000, reload=True)
