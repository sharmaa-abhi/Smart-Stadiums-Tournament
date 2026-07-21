import time
import json
import logging
from typing import Dict, Any, List, Optional
import jwt
from jwt import PyJWKClient, PyJWTError
from fastapi import HTTPException, status
from server.app.config import settings

logger = logging.getLogger("stadiumgenius.auth0")

ROLE_PERMISSIONS_MAP = {
    "admin": [
        "manage:users",
        "manage:roles",
        "configure:system",
        "configure:ai",
        "read:incidents",
        "delete:incidents",
        "read:audit_logs",
        "manage:dashboard"
    ],
    "manager": [
        "read:dashboard",
        "assign:staff",
        "read:reports",
        "read:incidents",
        "approve:ai",
        "allocate:resources"
    ],
    "operator": [
        "login",
        "read:dashboard",
        "update:incidents",
        "read:crowd_analytics",
        "create:incidents",
        "use:ai_assistant"
    ],
    "security": [
        "login",
        "read:security_dashboard",
        "respond:incidents",
        "verify:alerts",
        "read:cctv",
        "update:emergency"
    ]
}

class Auth0JWTValidator:
    def __init__(self):
        self.domain = settings.AUTH0_DOMAIN
        self.audience = settings.AUTH0_AUDIENCE
        self.issuer = settings.AUTH0_ISSUER
        self.algorithms = settings.AUTH0_ALGORITHMS
        self.jwks_url = f"https://{self.domain}/.well-known/jwks.json"
        self._jwk_client: Optional[PyJWKClient] = None

    @property
    def jwk_client(self) -> PyJWKClient:
        if self._jwk_client is None:
            self._jwk_client = PyJWKClient(self.jwks_url, cache_keys=True, max_cached_keys=10)
        return self._jwk_client

    def verify_token(self, token: str) -> Dict[str, Any]:
        """
        Validates Auth0 JWT Access Token:
        - Signature verification using RS256 via JWKS
        - Issuer check
        - Audience check
        - Expiration check
        - Fallback support for local testing/mock JWT tokens if enabled
        """
        if not token:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authentication token is missing.",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # Check for dev/testing mock token support
        if settings.ALLOW_MOCK_TOKENS and (token.startswith("mock-") or token.startswith("test-")):
            return self._decode_mock_token(token)

        try:
            # Get signing key from Auth0 JWKS
            signing_key = self.jwk_client.get_signing_key_from_jwt(token)
            
            payload = jwt.decode(
                token,
                signing_key.key,
                algorithms=self.algorithms,
                audience=self.audience,
                issuer=self.issuer,
                options={
                    "verify_signature": True,
                    "verify_aud": True,
                    "verify_iss": True,
                    "verify_exp": True,
                }
            )

            # Ensure permissions are attached
            self._enrich_permissions(payload)
            return payload

        except jwt.ExpiredSignatureError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token has expired. Please log in again.",
                headers={"WWW-Authenticate": "Bearer error='invalid_token', error_description='Token has expired'"},
            )
        except jwt.PyJWTError as e:
            logger.warning(f"JWT Validation failed: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Invalid authentication token: {str(e)}",
                headers={"WWW-Authenticate": "Bearer error='invalid_token'"},
            )
        except Exception as e:
            # Fallback for mock tokens or local JWT during testing if JWKS fetch fails
            if settings.ALLOW_MOCK_TOKENS:
                try:
                    unverified_payload = jwt.decode(token, options={"verify_signature": False})
                    self._enrich_permissions(unverified_payload)
                    return unverified_payload
                except Exception:
                    pass

            logger.error(f"Auth0 verification error: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authentication failed. Could not verify JWT signature.",
                headers={"WWW-Authenticate": "Bearer"},
            )

    def _decode_mock_token(self, token: str) -> Dict[str, Any]:
        """Support for automated integration testing tokens."""
        role = "operator"
        if "admin" in token:
            role = "admin"
        elif "manager" in token:
            role = "manager"
        elif "security" in token:
            role = "security"

        email = f"{role}@stadiumgenius.io"
        user_id = f"auth0|mock-{role}-id-100"

        # Check for expired mock token simulation
        if "expired" in token:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token has expired. Please log in again.",
                headers={"WWW-Authenticate": "Bearer error='invalid_token'"}
            )
        
        # Check for invalid signature token simulation
        if "invalid" in token or "corrupt" in token:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid signature or tampered JWT.",
                headers={"WWW-Authenticate": "Bearer error='invalid_token'"}
            )

        permissions = ROLE_PERMISSIONS_MAP.get(role, [])
        return {
            "sub": user_id,
            "email": email,
            "name": f"Stadium {role.capitalize()}",
            "picture": f"https://stadiumgenius.io/avatars/{role}.png",
            "email_verified": True,
            "role": role,
            "permissions": permissions,
            f"{settings.CUSTOM_CLAIM_NAMESPACE}/role": role,
            f"{settings.CUSTOM_CLAIM_NAMESPACE}/permissions": permissions,
            "iss": self.issuer,
            "aud": self.audience,
            "exp": int(time.time()) + 3600
        }

    def _enrich_permissions(self, payload: Dict[str, Any]):
        """Extract or infer permissions from standard or custom claims."""
        custom_namespace = settings.CUSTOM_CLAIM_NAMESPACE
        
        # 1. Custom namespace claims
        role = payload.get(f"{custom_namespace}/role") or payload.get("role")
        permissions = payload.get(f"{custom_namespace}/permissions") or payload.get("permissions")

        # 2. Standard scope parsing
        if not permissions and "scope" in payload:
            scopes = payload["scope"].split()
            permissions = [s for s in scopes if ":" in s or s in ["login"]]

        # 3. Role-based permission fallback if permissions claim empty
        if not role:
            role = "operator"
            if "admin" in payload.get("sub", "") or "admin" in payload.get("email", ""):
                role = "admin"
            elif "manager" in payload.get("sub", "") or "manager" in payload.get("email", ""):
                role = "manager"
            elif "security" in payload.get("sub", "") or "security" in payload.get("email", ""):
                role = "security"

        if not permissions:
            permissions = ROLE_PERMISSIONS_MAP.get(role, [])

        payload["role"] = role
        payload["permissions"] = permissions

auth0_validator = Auth0JWTValidator()
