"""
StadiumGenius - End-to-End Auth0 & FastAPI RBAC Verification Script
Validates 100% of authentication and authorization requirements across Administrator, Manager, Operator, and Security roles.
"""

import sys
import os
import json
import time

# Force UTF-8 stdout on Windows
sys.stdout.reconfigure(encoding='utf-8')

# Ensure project root is in Python path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from fastapi.testclient import TestClient
from server.app.main import app

def run_e2e_verification():
    client = TestClient(app)
    
    print("\n" + "="*80)
    print(" STADIUMGENIUS ENTERPRISE AUTH0 & FASTAPI RBAC E2E VERIFICATION")
    print("="*80 + "\n")

    passed_count = 0
    total_count = 0

    def assert_test(name: str, condition: bool, details: str = ""):
        nonlocal passed_count, total_count
        total_count += 1
        if condition:
            passed_count += 1
            print(f"  [PASS] {name}")
            if details:
                print(f"      L-- {details}")
        else:
            print(f"  [FAIL] {name}")
            if details:
                print(f"      L-- ERROR: {details}")

    # 1. Health Check
    res = client.get("/health")
    assert_test("FastAPI Health Endpoint Response", res.status_code == 200, f"Status: {res.status_code}, Body: {res.json()}")

    # 2. Security Headers
    headers = res.headers
    has_security_headers = (
        "Strict-Transport-Security" in headers and
        "X-Frame-Options" in headers and
        "X-Content-Type-Options" in headers and
        "Content-Security-Policy" in headers
    )
    assert_test(
        "Enterprise Security Headers (HSTS, CSP, X-Frame-Options, X-Content-Type-Options)",
        has_security_headers,
        f"HSTS: {headers.get('Strict-Transport-Security')}, X-Frame: {headers.get('X-Frame-Options')}"
    )

    # 3. Unauthenticated Rejection (401)
    res = client.get("/api/v1/auth/me")
    assert_test("Missing JWT Access Token returns 401 Unauthorized", res.status_code == 401, f"Detail: {res.json().get('detail')}")

    # 4. Invalid Signature Rejection (401)
    res = client.get("/api/v1/auth/me", headers={"Authorization": "Bearer mock-invalid-tampered-token"})
    assert_test("Invalid/Tampered JWT returns 401 Unauthorized", res.status_code == 401, f"Detail: {res.json().get('detail')}")

    # 5. Expired Token Rejection (401)
    res = client.get("/api/v1/auth/me", headers={"Authorization": "Bearer mock-expired-jwt-token"})
    assert_test("Expired JWT Token returns 401 Unauthorized", res.status_code == 401, f"Detail: {res.json().get('detail')}")

    # 6. Administrator Role Verification
    admin_headers = {"Authorization": "Bearer mock-admin-jwt-token"}
    res = client.get("/api/v1/auth/me", headers=admin_headers)
    admin_user = res.json() if res.status_code == 200 else {}
    assert_test(
        "Admin Login & Profile Extraction",
        res.status_code == 200 and admin_user.get("role") == "admin",
        f"Role: {admin_user.get('role')}, Email: {admin_user.get('email')}"
    )

    res = client.get("/api/v1/admin/users", headers=admin_headers)
    assert_test("Admin Permission ('manage:users') -> /admin/users", res.status_code == 200, f"Retrieved {len(res.json())} users")

    res = client.get("/api/v1/admin/roles", headers=admin_headers)
    assert_test("Admin Permission ('manage:roles') -> /admin/roles matrix", res.status_code == 200)

    res = client.post("/api/v1/admin/system-config", json={"key": "max_capacity", "value": "82000"}, headers=admin_headers)
    assert_test("Admin Permission ('configure:system') -> /admin/system-config", res.status_code == 200)

    res = client.post("/api/v1/admin/ai-settings", json={"threshold": 0.85}, headers=admin_headers)
    assert_test("Admin Permission ('configure:ai') -> /admin/ai-settings", res.status_code == 200)

    # 7. Manager Role Verification
    manager_headers = {"Authorization": "Bearer mock-manager-jwt-token"}
    res = client.get("/api/v1/manager/dashboard-summary", headers=manager_headers)
    assert_test("Manager Permission ('read:dashboard') -> /manager/dashboard-summary", res.status_code == 200)

    res = client.post("/api/v1/manager/assign-staff", json={"sector": "Gate C", "staff_count": 15}, headers=manager_headers)
    assert_test("Manager Permission ('assign:staff') -> /manager/assign-staff", res.status_code == 200)

    res = client.get("/api/v1/manager/reports", headers=manager_headers)
    assert_test("Manager Permission ('read:reports') -> /manager/reports", res.status_code == 200)

    res = client.post("/api/v1/manager/approve-ai-recommendation", json={"recommendation_id": "REC-101", "action": "Reroute"}, headers=manager_headers)
    assert_test("Manager Permission ('approve:ai') -> /manager/approve-ai-recommendation", res.status_code == 200)

    # 8. Operator Role Verification
    operator_headers = {"Authorization": "Bearer mock-operator-jwt-token"}
    res = client.get("/api/v1/operator/crowd-analytics", headers=operator_headers)
    assert_test("Operator Permission ('read:crowd_analytics') -> /operator/crowd-analytics", res.status_code == 200)

    res = client.post("/api/v1/operator/incidents", json={"title": "Spill Sector 104", "severity": "Low"}, headers=operator_headers)
    assert_test("Operator Permission ('create:incidents') -> /operator/incidents", res.status_code == 200)
    inc_id = res.json().get("id") if res.status_code == 200 else 1

    res = client.put(f"/api/v1/operator/incidents/{inc_id}", json={"status": "Investigating"}, headers=operator_headers)
    assert_test("Operator Permission ('update:incidents') -> /operator/incidents/{id}", res.status_code == 200)

    res = client.post("/api/v1/operator/ai-assistant", json={"prompt": "Turnstile traffic forecast"}, headers=operator_headers)
    assert_test("Operator Permission ('use:ai_assistant') -> /operator/ai-assistant", res.status_code == 200)

    # 9. Security Role Verification
    security_headers = {"Authorization": "Bearer mock-security-jwt-token"}
    res = client.get("/api/v1/security/dashboard", headers=security_headers)
    assert_test("Security Permission ('read:security_dashboard') -> /security/dashboard", res.status_code == 200)

    res = client.get("/api/v1/security/cctv-status", headers=security_headers)
    assert_test("Security Permission ('read:cctv') -> /security/cctv-status", res.status_code == 200)

    res = client.post("/api/v1/security/verify-alert", json={"alert_id": "ALT-501", "status": "CONFIRMED"}, headers=security_headers)
    assert_test("Security Permission ('verify:alerts') -> /security/verify-alert", res.status_code == 200)

    res = client.post("/api/v1/security/respond-incident", json={"incident_id": inc_id, "team": "K9 Unit 2"}, headers=security_headers)
    assert_test("Security Permission ('respond:incidents') -> /security/respond-incident", res.status_code == 200)

    res = client.post("/api/v1/security/emergency-status", json={"emergency_level": "NORMAL", "reason": "All clear"}, headers=security_headers)
    assert_test("Security Permission ('update:emergency') -> /security/emergency-status", res.status_code == 200)

    # 10. Cross-Role Forbidden (403) Enforcement
    res = client.get("/api/v1/admin/users", headers=operator_headers)
    assert_test("Operator accessing Admin /admin/users returns 403 Forbidden", res.status_code == 403)

    res = client.post("/api/v1/security/emergency-status", json={"emergency_level": "ALERT"}, headers=operator_headers)
    assert_test("Operator accessing Security /emergency-status returns 403 Forbidden", res.status_code == 403)

    res = client.post("/api/v1/manager/assign-staff", json={"sector": "Gate A"}, headers=security_headers)
    assert_test("Security accessing Manager /assign-staff returns 403 Forbidden", res.status_code == 403)

    # 11. Audit Logs Generation
    res = client.get("/api/v1/admin/audit-logs", headers=admin_headers)
    logs = res.json() if res.status_code == 200 else []
    assert_test(
        "Audit Trail Persistence & Retrieval (read:audit_logs)",
        res.status_code == 200 and len(logs) >= 5,
        f"Total Audit Entries Recorded: {len(logs)}"
    )

    print("\n" + "="*80)
    print(f" RESULTS: {passed_count} / {total_count} TESTS PASSED ({(passed_count/total_count)*100:.1f}%)")
    print("="*80 + "\n")

    if passed_count == total_count:
        print("ALL STADIUMGENIUS AUTHENTICATION & AUTHORIZATION TESTS VERIFIED CLEANLY!")
        sys.exit(0)
    else:
        print("SOME TESTS FAILED! CHECK OUTPUT DETAILS ABOVE.")
        sys.exit(1)

if __name__ == "__main__":
    run_e2e_verification()
