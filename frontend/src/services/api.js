const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiService {
  getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const headers = this.getAuthHeaders();

    const config = {
      ...options,
      headers: {
        ...headers,
        ...options.headers
      }
    };

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    const response = await fetch(url, config);
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorMsg = data.error || data.message || `Request failed with status ${response.status}`;
      throw new Error(errorMsg);
    }

    return data;
  }

  // Auth endpoints
  login(email, password, role = null) {
    return this.request('/auth/login', {
      method: 'POST',
      body: { email, password, ...(role ? { role } : {}) }
    });
  }

  register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: userData
    });
  }

  getCurrentUser() {
    return this.request('/auth/me');
  }

  // Businesses
  getBusinesses(params = {}) {
    const query = new URLSearchParams();
    if (params.category) query.append('category', params.category);
    if (params.search) query.append('search', params.search);
    if (params.latitude) query.append('latitude', params.latitude);
    if (params.longitude) query.append('longitude', params.longitude);
    if (params.radius) query.append('radius', params.radius);
    if (params.sort) query.append('sort', params.sort);
    return this.request(`/businesses?${query.toString()}`);
  }

  getBusinessDetail(id) {
    return this.request(`/businesses/${id}`);
  }

  getMyBusiness() {
    return this.request('/businesses/my');
  }

  createBusiness(data) {
    return this.request('/businesses', {
      method: 'POST',
      body: data
    });
  }

  updateBusiness(id, data) {
    return this.request(`/businesses/${id}`, {
      method: 'PUT',
      body: data
    });
  }

  // Offers
  getOffers(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/offers${query ? '?' + query : ''}`);
  }

  createOffer(data) {
    return this.request('/offers', {
      method: 'POST',
      body: data
    });
  }

  updateOffer(id, data) {
    return this.request(`/offers/${id}`, {
      method: 'PUT',
      body: data
    });
  }

  deleteOffer(id) {
    return this.request(`/offers/${id}`, {
      method: 'DELETE'
    });
  }

  recordOfferClick(id) {
    return this.request(`/offers/${id}/click`, {
      method: 'POST'
    });
  }

  // Reviews
  createReview(data) {
    return this.request('/reviews', {
      method: 'POST',
      body: data
    });
  }

  getBusinessReviews(businessId) {
    return this.request(`/reviews/business/${businessId}`);
  }

  // Recommendations
  getRecommendations(coords = {}) {
    const query = new URLSearchParams();
    if (coords.latitude) query.append('latitude', coords.latitude);
    if (coords.longitude) query.append('longitude', coords.longitude);
    return this.request(`/recommendations?${query.toString()}`);
  }

  // Owner Analytics
  getOwnerAnalytics(businessId) {
    return this.request(`/analytics/owner/${businessId}`);
  }

  // Admin
  getAdminMetrics() {
    return this.request('/admin/metrics');
  }

  getAdminUsers(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/admin/users${query ? '?' + query : ''}`);
  }

  toggleUserStatus(userId, isActive) {
    return this.request(`/admin/users/${userId}/status`, {
      method: 'PUT',
      body: { is_active: isActive }
    });
  }

  getAdminBusinesses() {
    return this.request('/admin/businesses');
  }

  updateBusinessStatus(businessId, statusData) {
    return this.request(`/admin/businesses/${businessId}/status`, {
      method: 'PUT',
      body: statusData
    });
  }

  getAdminReviews(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/admin/reviews${query ? '?' + query : ''}`);
  }

  moderateReview(reviewId, moderationData) {
    return this.request(`/admin/reviews/${reviewId}/moderate`, {
      method: 'PUT',
      body: moderationData
    });
  }

  deleteReview(reviewId) {
    return this.request(`/admin/reviews/${reviewId}`, {
      method: 'DELETE'
    });
  }
}

export const api = new ApiService();
