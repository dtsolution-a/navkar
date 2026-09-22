// Admin API helper
// In production this points to Railway backend
const API_BASE = (import.meta.env.VITE_API_URL || '') + '/api';

class AdminAPI {
  constructor() {
    this.token = localStorage.getItem('admin_token');
  }

  setToken(token) {
    this.token = token;
    localStorage.setItem('admin_token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('admin_token');
  }

  isAuthenticated() {
    return !!this.token;
  }

  async request(method, path, body = null) {
    const headers = { 'Content-Type': 'application/json' };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const options = { method, headers };
    if (body && method !== 'GET') {
      options.body = JSON.stringify(body);
    }

    const res = await fetch(`${API_BASE}${path}`, options);
    const data = await res.json();

    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        this.clearToken();
        window.location.href = '/ad-admin/login';
      }
      throw new Error(data.error || 'Request failed');
    }
    return data;
  }

  // Auth
  login(username, password) {
    return this.request('POST', '/auth/login', { username, password });
  }
  getMe() { return this.request('GET', '/auth/me'); }
  changePassword(currentPassword, newPassword) {
    return this.request('POST', '/auth/change-password', { currentPassword, newPassword });
  }

  // Brands
  getBrands() { return this.request('GET', '/brands'); }
  getBrand(id) { return this.request('GET', `/brands/${id}`); }
  createBrand(data) { return this.request('POST', '/brands', data); }
  updateBrand(id, data) { return this.request('PUT', `/brands/${id}`, data); }
  deleteBrand(id) { return this.request('DELETE', `/brands/${id}`); }

  // Categories
  getCategories(brandId) {
    const query = brandId ? `?brandId=${brandId}` : '';
    return this.request('GET', `/categories${query}`);
  }
  getCategory(id) { return this.request('GET', `/categories/${id}`); }
  createCategory(data) { return this.request('POST', '/categories', data); }
  updateCategory(id, data) { return this.request('PUT', `/categories/${id}`, data); }
  deleteCategory(id) { return this.request('DELETE', `/categories/${id}`); }

  // Products
  getProducts(categoryId) {
    const query = categoryId ? `?categoryId=${categoryId}` : '';
    return this.request('GET', `/products${query}`);
  }
  getProduct(id) { return this.request('GET', `/products/${id}`); }
  createProduct(data) { return this.request('POST', '/products', data); }
  updateProduct(id, data) { return this.request('PUT', `/products/${id}`, data); }
  deleteProduct(id) { return this.request('DELETE', `/products/${id}`); }

  // Blog
  getBlogPosts() { return this.request('GET', '/blog'); }
  getBlogPost(id) { return this.request('GET', `/blog/${id}`); }
  createBlogPost(data) { return this.request('POST', '/blog', data); }
  updateBlogPost(id, data) { return this.request('PUT', `/blog/${id}`, data); }
  deleteBlogPost(id) { return this.request('DELETE', `/blog/${id}`); }

  // Contacts
  getContacts(isRead) {
    const query = isRead !== undefined ? `?is_read=${isRead}` : '';
    return this.request('GET', `/contacts${query}`);
  }
  getContact(id) { return this.request('GET', `/contacts/${id}`); }
  deleteContact(id) { return this.request('DELETE', `/contacts/${id}`); }
  markContactRead(id, isRead) {
    return this.request('PATCH', `/contacts/${id}/read`, { is_read: isRead });
  }

  // Upload
  async uploadFile(file, folder = 'general') {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    const headers = {};
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const res = await fetch(`${API_BASE}/upload`, { method: 'POST', headers, body: formData });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Upload failed');
    return data;
  }

  deleteFile(url) {
    return this.request('POST', '/upload/delete', { url });
  }

  // Solutions
  getSolutions() { return this.request('GET', '/solutions'); }
  createSolution(data) { return this.request('POST', '/solutions', data); }
  updateSolution(id, data) { return this.request('PUT', `/solutions/${id}`, data); }
  deleteSolution(id) { return this.request('DELETE', `/solutions/${id}`); }

  // Gallery
  getGalleryPhotos() { return this.request('GET', '/gallery'); }
  createGalleryPhoto(data) { return this.request('POST', '/gallery', data); }
  updateGalleryPhoto(id, data) { return this.request('PUT', `/gallery/${id}`, data); }
  deleteGalleryPhoto(id) { return this.request('DELETE', `/gallery/${id}`); }

  // Hero Slides
  getHeroSlides() { return this.request('GET', '/hero-slides'); }
  createHeroSlide(data) { return this.request('POST', '/hero-slides', data); }
  updateHeroSlide(id, data) { return this.request('PUT', `/hero-slides/${id}`, data); }
  deleteHeroSlide(id) { return this.request('DELETE', `/hero-slides/${id}`); }

  // Career Applications
  getApplications() { return this.request('GET', '/applications'); }
  getApplication(id) { return this.request('GET', `/applications/${id}`); }
  deleteApplication(id) { return this.request('DELETE', `/applications/${id}`); }
  markApplicationRead(id, isRead) {
    return this.request('PATCH', `/applications/${id}/read`, { is_read: isRead });
  }

  // Timeline Events
  getTimelineEvents() { return this.request('GET', '/timeline'); }
  getTimelineEvent(id) { return this.request('GET', `/timeline/${id}`); }
  createTimelineEvent(data) { return this.request('POST', '/timeline', data); }
  updateTimelineEvent(id, data) { return this.request('PUT', `/timeline/${id}`, data); }
  deleteTimelineEvent(id) { return this.request('DELETE', `/timeline/${id}`); }

  // Settings
  getSettings() { return this.request('GET', '/settings'); }
  updateSettings(data) { return this.request('PUT', '/settings', data); }
}

const api = new AdminAPI();
export default api;