import pytest
from fastapi.testclient import TestClient
from server.app.main import app
from server.app.core.auth0 import auth0_validator

client = TestClient(app)

def get_auth_header(role: str):
    token = f"mock-{role}-jwt-token"
    return {"Authorization": f"Bearer {token}"}

class TestAuth0FastAPIRBAC:
    
    # ── Health Check ──
    def test_health_check(self):
        response = client.get("/health")
        assert response.status_code == 200
        assert response.json()["status"] == "healthy"

    # ── Unauthorized Requests (401) ──
    def test_unauthorized_access_missing_token(self):
        response = client.get("/api/v1/auth/me")
        assert response.status_code == 401
        assert "Authentication token required" in response.json()["detail"]

    def test_unauthorized_access_invalid_token(self):
        headers = {"Authorization": "Bearer mock-invalid-corrupt-token"}
        response = client.get("/api/v1/auth/me", headers=headers)
        assert response.status_code == 401

    def test_unauthorized_access_expired_token(self):
        headers = {"Authorization": "Bearer mock-expired-token"}
        response = client.get("/api/v1/auth/me", headers=headers)
        assert response.status_code == 401
        assert "expired" in response.json()["detail"].lower()

    # ── Profile & Sync Endpoints ──
    def test_admin_profile_me(self):
        headers = get_auth_header("admin")
        response = client.get("/api/v1/auth/me", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert data["role"] == "admin"
        assert "manage:users" in data["permissions"]
        assert "configure:system" in data["permissions"]

    def test_operator_profile_me(self):
        headers = get_auth_header("operator")
        response = client.get("/api/v1/auth/me", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert data["role"] == "operator"
        assert "read:crowd_analytics" in data["permissions"]

    # ── Admin Role & Permission Verification ──
    def test_admin_list_users_allowed(self):
        headers = get_auth_header("admin")
        response = client.get("/api/v1/admin/users", headers=headers)
        assert response.status_code == 200
        assert isinstance(response.json(), list)

    def test_operator_access_admin_users_forbidden(self):
        headers = get_auth_header("operator")
        response = client.get("/api/v1/admin/users", headers=headers)
        assert response.status_code == 403
        assert "Forbidden" in response.json()["detail"]

    def test_admin_roles_matrix_allowed(self):
        headers = get_auth_header("admin")
        response = client.get("/api/v1/admin/roles", headers=headers)
        assert response.status_code == 200
        assert "matrix" in response.json()

    # ── Manager Operations ──
    def test_manager_dashboard_summary_allowed(self):
        headers = get_auth_header("manager")
        response = client.get("/api/v1/manager/dashboard-summary", headers=headers)
        assert response.status_code == 200
        assert "stadium_capacity" in response.json()

    def test_operator_access_manager_assign_staff_forbidden(self):
        headers = get_auth_header("operator")
        payload = {"sector": "Gate B", "staff_count": 5}
        response = client.post("/api/v1/manager/assign-staff", json=payload, headers=headers)
        assert response.status_code == 403

    # ── Operator Operations ──
    def test_operator_crowd_analytics_allowed(self):
        headers = get_auth_header("operator")
        response = client.get("/api/v1/operator/crowd-analytics", headers=headers)
        assert response.status_code == 200
        assert "overall_density" in response.json()

    def test_operator_create_incident_allowed(self):
        headers = get_auth_header("operator")
        payload = {
            "title": "Turnstile Jam Gate A",
            "description": "Scanners lagging",
            "severity": "Medium",
            "category": "Technical",
            "location": "North Entry"
        }
        response = client.post("/api/v1/operator/incidents", json=payload, headers=headers)
        assert response.status_code == 200
        assert response.json()["title"] == "Turnstile Jam Gate A"

    # ── Security Operations ──
    def test_security_dashboard_allowed(self):
        headers = get_auth_header("security")
        response = client.get("/api/v1/security/dashboard", headers=headers)
        assert response.status_code == 200
        assert response.json()["security_threat_level"] == "LOW"

    def test_security_emergency_status_allowed(self):
        headers = get_auth_header("security")
        payload = {"emergency_level": "ELEVATED", "reason": "Weather warning"}
        response = client.post("/api/v1/security/emergency-status", json=payload, headers=headers)
        assert response.status_code == 200
        assert response.json()["emergency_level"] == "ELEVATED"

    def test_operator_update_emergency_status_forbidden(self):
        headers = get_auth_header("operator")
        payload = {"emergency_level": "CRITICAL", "reason": "Unauthorized test"}
        response = client.post("/api/v1/security/emergency-status", json=payload, headers=headers)
        assert response.status_code == 403

    # ── Audit Log Retrieval (Admin Only) ──
    def test_admin_get_audit_logs(self):
        headers = get_auth_header("admin")
        response = client.get("/api/v1/admin/audit-logs", headers=headers)
        assert response.status_code == 200
        logs = response.json()
        assert isinstance(logs, list)
        assert len(logs) > 0
