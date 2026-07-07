const API_BASE = 'http://localhost:5000/api';

class ApiClient {
  constructor() {
    this.baseUrl = API_BASE;
  }

  getToken() {
    return localStorage.getItem('sg_token');
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

    const response = await fetch(`${this.baseUrl}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `Request failed with status ${response.status}`);
    }

    return data;
  }

  // ── Auth ──
  async register(name, email, password, role) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, role }),
    });
  }

  async login(email, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async getMe() {
    return this.request('/auth/me');
  }

  // ── Venues ──
  async getVenues() {
    return this.request('/venues');
  }

  async getVenue(id) {
    return this.request(`/venues/${id}`);
  }

  async getVenueKPIs(id) {
    return this.request(`/venues/${id}/kpis`);
  }

  async getVenueAlerts(id) {
    return this.request(`/venues/${id}/alerts`);
  }

  async getVenueOccupancy(id) {
    return this.request(`/venues/${id}/occupancy`);
  }

  async getVenueTimeseries(id, points = 24) {
    return this.request(`/venues/${id}/timeseries?points=${points}`);
  }

  async getVenueHeatmap(id) {
    return this.request(`/venues/${id}/heatmap`);
  }

  async getVenueGates(id) {
    return this.request(`/venues/${id}/gates`);
  }

  async getVenueConcessions(id) {
    return this.request(`/venues/${id}/concessions`);
  }

  // ── Incidents ──
  async getIncidents(venueId, status) {
    const params = new URLSearchParams();
    if (venueId) params.set('venue_id', venueId);
    if (status) params.set('status', status);
    const qs = params.toString();
    return this.request(`/incidents${qs ? `?${qs}` : ''}`);
  }

  async createIncident(data) {
    return this.request('/incidents', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateIncident(id, data) {
    return this.request(`/incidents/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // ── Analytics ──
  async getAnalyticsOverview() {
    return this.request('/analytics/overview');
  }

  async getAnalyticsTrends() {
    return this.request('/analytics/trends');
  }

  async getAnalyticsPerformance() {
    return this.request('/analytics/performance');
  }

  async getAnalyticsRevenue() {
    return this.request('/analytics/revenue');
  }

  // ── Broadcast ──
  async getBroadcasts(venueId, status) {
    const params = new URLSearchParams();
    if (venueId) params.set('venue_id', venueId);
    if (status) params.set('status', status);
    const qs = params.toString();
    return this.request(`/broadcast/messages${qs ? `?${qs}` : ''}`);
  }

  async createBroadcast(data) {
    return this.request('/broadcast/messages', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateBroadcast(id, data) {
    return this.request(`/broadcast/messages/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteBroadcast(id) {
    return this.request(`/broadcast/messages/${id}`, { method: 'DELETE' });
  }

  // ── AI Assistant ──
  async aiChat(message, sessionId) {
    return this.request('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ message, session_id: sessionId }),
    });
  }

  async aiHistory(sessionId) {
    return this.request(`/ai/history?session_id=${sessionId}`);
  }

  async aiSuggestions() {
    return this.request('/ai/suggestions');
  }

  // ── Users ──
  async getUserProfile() {
    return this.request('/users/profile');
  }

  async updateUserProfile(data) {
    return this.request('/users/profile', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async changePassword(currentPassword, newPassword) {
    return this.request('/users/password', {
      method: 'PATCH',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  }

  // ── Health ──
  async health() {
    return this.request('/health');
  }
}

const api = new ApiClient();
export default api;
