/**
 * StadiumGenius API Client
 *
 * Production-grade HTTP client with:
 * - Configurable base URL via environment variable
 * - Automatic JWT token injection
 * - Request ID tracing for observability
 * - 401 auto-redirect to login
 * - Retry with exponential backoff
 * - AbortController support for request cancellation
 */

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

  async request(endpoint, options = {}, { signal } = {}) {
    const token = this.getToken();
    const config = {
      headers: {
        'Content-Type': 'application/json',
        'X-Request-ID': crypto.randomUUID?.() || `req-${Date.now()}`,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
      ...options,
      ...(signal ? { signal } : {}),
    };

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, config);
      const data = await response.json();

      if (!response.ok) {
        const errMessage = data.detail || data.error || `Request failed with status ${response.status}`;
        const err = new Error(errMessage);
        err.status = response.status;
        err.detail = data.detail;

        // Auto-redirect on 401 (token expired/invalid)
        if (response.status === 401) {
          this.setToken(null);
          localStorage.removeItem('sg_user');
          if (!window.location.pathname.includes('/login')) {
            window.location.href = '/login';
          }
        }

        throw err;
      }

      return data;
    } catch (err) {
      if (err.name === 'AbortError') {
        // Request was cancelled — don't log
        throw err;
      }
      throw err;
    }
  }

  /**
   * Retry wrapper with exponential backoff.
   * @param {string} endpoint
   * @param {object} options - fetch options
   * @param {number} maxRetries - default 3
   * @returns {Promise}
   */
  async requestWithRetry(endpoint, options = {}, maxRetries = 3) {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await this.request(endpoint, options);
      } catch (error) {
        const isRetryable =
          !error.status ||          // Network errors
          error.status >= 500 ||    // Server errors
          error.status === 429;     // Rate limited

        if (!isRetryable || attempt === maxRetries) {
          throw error;
        }

        const delay = 1000 * 2 ** attempt + Math.random() * 500;
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
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
    return this.requestWithRetry('/health');
  }
}

/**
 * Creates an AbortController for cancellable requests.
 * Usage in React useEffect:
 *   const { controller } = createAbortController();
 *   api.request('/endpoint', {}, { signal: controller.signal });
 *   return () => controller.abort();
 */
export function createAbortController() {
  const controller = new AbortController();
  return { controller, signal: controller.signal };
}

const api = new ApiClient();
export default api;
