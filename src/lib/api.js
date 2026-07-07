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

  // ── Health ──
  async health() {
    return this.request('/health');
  }
}

const api = new ApiClient();
export default api;
