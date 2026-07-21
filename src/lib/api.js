const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api/v1';

class ApiClient {
  constructor() {
    this.baseUrl = API_BASE;
  }

  getToken() {
    return localStorage.getItem('sg_token');
  }

  setToken(token) {
    if (token) {
      localStorage.setItem('sg_token', token);
    } else {
      localStorage.removeItem('sg_token');
    }
  }

  async request(endpoint, options = {}) {
    const token = this.getToken();
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, config);
      const data = await response.json();

      if (!response.ok) {
        const errMessage = data.detail || data.error || `Request failed with status ${response.status}`;
        const err = new Error(errMessage);
        err.status = response.status;
        err.detail = data.detail;
        throw err;
      }

      return data;
    } catch (err) {
      if (err.status === 401) {
        console.warn('Unauthorized access - clearing stale token');
      }
      throw err;
    }
  }

  // ── Authentication & Sync ──
  async getMe() {
    return this.request('/auth/me');
  }

  async syncAuth0User() {
    return this.request('/auth/sync', { method: 'POST' });
  }

  async logout() {
    return this.request('/auth/logout', { method: 'POST' });
  }

  async getCsrfToken() {
    return this.request('/auth/csrf-token');
  }

  // ── Administrator Operations ──
  async getAdminUsers() {
    return this.request('/admin/users');
  }

  async updateAdminUserRole(userId, role) {
    return this.request(`/admin/users/${userId}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    });
  }

  async getAdminRolesMatrix() {
    return this.request('/admin/roles');
  }

  async getAdminAuditLogs(limit = 50) {
    return this.request(`/admin/audit-logs?limit=${limit}`);
  }

  async updateSystemConfig(key, value, description) {
    return this.request('/admin/system-config', {
      method: 'POST',
      body: JSON.stringify({ key, value, description }),
    });
  }

  async updateAiSettings(settings) {
    return this.request('/admin/ai-settings', {
      method: 'POST',
      body: JSON.stringify(settings),
    });
  }

  // ── Manager Operations ──
  async getManagerDashboard() {
    return this.request('/manager/dashboard-summary');
  }

  async assignStaff(sector, staffCount) {
    return this.request('/manager/assign-staff', {
      method: 'POST',
      body: JSON.stringify({ sector, staff_count: staffCount }),
    });
  }

  async getManagerReports() {
    return this.request('/manager/reports');
  }

  async approveAiRecommendation(recommendationId, action) {
    return this.request('/manager/approve-ai-recommendation', {
      method: 'POST',
      body: JSON.stringify({ recommendation_id: recommendationId, action }),
    });
  }

  async allocateResources(resourceType, location) {
    return this.request('/manager/allocate-resources', {
      method: 'POST',
      body: JSON.stringify({ resource_type: resourceType, location }),
    });
  }

  // ── Operator Operations ──
  async getCrowdAnalytics() {
    return this.request('/operator/crowd-analytics');
  }

  async getIncidents() {
    return this.request('/operator/incidents');
  }

  async createIncident(data) {
    return this.request('/operator/incidents', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateIncident(id, data) {
    return this.request(`/operator/incidents/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async queryAiAssistant(prompt) {
    return this.request('/operator/ai-assistant', {
      method: 'POST',
      body: JSON.stringify({ prompt }),
    });
  }

  // ── Security Personnel Operations ──
  async getSecurityDashboard() {
    return this.request('/security/dashboard');
  }

  async getCctvStatus() {
    return this.request('/security/cctv-status');
  }

  async verifyAlert(alertId, status) {
    return this.request('/security/verify-alert', {
      method: 'POST',
      body: JSON.stringify({ alert_id: alertId, status }),
    });
  }

  async respondToIncident(incidentId, team) {
    return this.request('/security/respond-incident', {
      method: 'POST',
      body: JSON.stringify({ incident_id: incidentId, team }),
    });
  }

  async updateEmergencyStatus(emergencyLevel, reason) {
    return this.request('/security/emergency-status', {
      method: 'POST',
      body: JSON.stringify({ emergency_level: emergencyLevel, reason }),
    });
  }

  // ── Health Check ──
  async health() {
    return this.request('/health');
  }
}

const api = new ApiClient();
export default api;

