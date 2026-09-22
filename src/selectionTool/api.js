// Selection Tool — API client. Same token/error conventions as AdminAPI.js,
// separate storage key so a salesman session and an admin session can't
// clobber each other in the same browser.
const API_BASE = (import.meta.env.VITE_API_URL || '') + '/api';

class SelectionToolAPI {
  constructor() {
    this.token = localStorage.getItem('st_token');
    this.user = JSON.parse(localStorage.getItem('st_user') || 'null');
  }

  setSession(token, user) {
    this.token = token;
    this.user = user;
    localStorage.setItem('st_token', token);
    localStorage.setItem('st_user', JSON.stringify(user));
  }

  clearSession() {
    this.token = null;
    this.user = null;
    localStorage.removeItem('st_token');
    localStorage.removeItem('st_user');
  }

  isAuthenticated() {
    return !!this.token;
  }

  async request(method, path, body = null) {
    const headers = { 'Content-Type': 'application/json' };
    if (this.token) headers['Authorization'] = `Bearer ${this.token}`;
    const options = { method, headers };
    if (body && method !== 'GET') options.body = JSON.stringify(body);

    const res = await fetch(`${API_BASE}${path}`, options);
    const data = await res.json();
    if (!res.ok) {
      if (res.status === 401) this.clearSession();
      throw new Error(data.error || 'Request failed');
    }
    return data;
  }

  login(username, password) {
    return this.request('POST', '/auth/login', { username, password });
  }

  getQuestionnaire(category) {
    return this.request('GET', `/selection-tool/questionnaire/${category}`);
  }

  syncCatalog(category, since = 0) {
    return this.request('GET', `/selection-tool/catalog/sync?category=${category}&since=${since}`);
  }

  match(payload) {
    return this.request('POST', '/selection-tool/match', payload);
  }

  myPricing() {
    return this.request('GET', '/selection-tool/pricing/mine');
  }

  getSettings() {
    return this.request('GET', '/selection-tool/settings');
  }

  updateTolerances(pressureToleranceBar, capacityTolerancePct) {
    return this.request('PATCH', '/selection-tool/admin/settings', { pressureToleranceBar, capacityTolerancePct });
  }

  getValidationLimits() {
    return this.request('GET', '/selection-tool/validation-limits');
  }

  getReferenceSeries(category) {
    return this.request('GET', `/selection-tool/reference-series?category=${category}`);
  }
}

const selectionToolAPI = new SelectionToolAPI();
export default selectionToolAPI;
