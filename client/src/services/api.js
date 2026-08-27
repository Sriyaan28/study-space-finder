const API_BASE = import.meta.env.VITE_API_URL || '/api';

/**
 * Universal Fetch wrapper with automatic JWT token attachment and error parsing
 */
const request = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${API_BASE}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => ({
      success: response.ok,
      message: response.statusText,
    }));

    if (!response.ok) {
      // If token expired / unauthorized, handle clean state
      if (response.status === 401 && token) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Do not force reload if already on login/register
        if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
          window.dispatchEvent(new Event('auth:unauthorized'));
        }
      }

      const error = new Error(data.message || `Request failed with status ${response.status}`);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (err) {
    throw err;
  }
};

export const api = {
  // Auth
  login: (email, password) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (userData) =>
    request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),

  getMe: () => request('/auth/me'),

  updateProfile: (profileData) =>
    request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    }),

  // Study Spaces
  getSpaces: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, val);
      }
    });
    const qs = query.toString();
    return request(`/spaces${qs ? `?${qs}` : ''}`);
  },

  getSpaceById: (id) => request(`/spaces/${id}`),

  getBuildings: () => request('/spaces/meta/buildings'),

  createSpace: (spaceData) =>
    request('/spaces', {
      method: 'POST',
      body: JSON.stringify(spaceData),
    }),

  updateSpace: (id, spaceData) =>
    request(`/spaces/${id}`, {
      method: 'PUT',
      body: JSON.stringify(spaceData),
    }),

  deleteSpace: (id) =>
    request(`/spaces/${id}`, {
      method: 'DELETE',
    }),

  // Seating
  getSpaceSeats: (spaceId, startTime, endTime) => {
    const query = new URLSearchParams();
    if (startTime) query.append('startTime', startTime);
    if (endTime) query.append('endTime', endTime);
    const qs = query.toString();
    return request(`/spaces/${spaceId}/seats${qs ? `?${qs}` : ''}`);
  },

  saveSpaceLayout: (spaceId, layoutData) =>
    request(`/spaces/${spaceId}/layout`, {
      method: 'POST',
      body: JSON.stringify(layoutData),
    }),

  createSeat: (seatData) =>
    request('/seats', {
      method: 'POST',
      body: JSON.stringify(seatData),
    }),

  updateSeat: (id, seatData) =>
    request(`/seats/${id}`, {
      method: 'PUT',
      body: JSON.stringify(seatData),
    }),

  deleteSeat: (id) =>
    request(`/seats/${id}`, {
      method: 'DELETE',
    }),

  // Reservations
  createReservation: (reservationData) =>
    request('/reservations', {
      method: 'POST',
      body: JSON.stringify(reservationData),
    }),

  getMyReservations: (status) => {
    const qs = status ? `?status=${status}` : '';
    return request(`/reservations${qs}`);
  },

  getReservationById: (id) => request(`/reservations/${id}`),

  cancelReservation: (id) =>
    request(`/reservations/${id}`, {
      method: 'DELETE',
    }),

  getAllReservations: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val) query.append(key, val);
    });
    const qs = query.toString();
    return request(`/admin/reservations${qs ? `?${qs}` : ''}`);
  },

  // Favorites
  getMyFavorites: () => request('/favorites'),

  addFavorite: (spaceId) =>
    request(`/favorites/${spaceId}`, {
      method: 'POST',
    }),

  removeFavorite: (spaceId) =>
    request(`/favorites/${spaceId}`, {
      method: 'DELETE',
    }),

  // Availability Prediction
  getSpacePrediction: (spaceId, targetDate) => {
    const qs = targetDate ? `?targetDate=${encodeURIComponent(targetDate)}` : '';
    return request(`/spaces/${spaceId}/prediction${qs}`);
  },

  // Grounded AI Chat
  chatWithAI: (query, history = []) =>
    request('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ query, history }),
    }),

  // Analytics
  getStudentAnalytics: () => request('/analytics/student'),

  getAdminAnalytics: () => request('/analytics/admin'),

  // Admin User Management
  getStudents: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val) query.append(key, val);
    });
    const qs = query.toString();
    return request(`/admin/students${qs ? `?${qs}` : ''}`);
  },

  blockStudent: (id) =>
    request(`/admin/students/${id}/block`, {
      method: 'PATCH',
    }),

  unblockStudent: (id) =>
    request(`/admin/students/${id}/unblock`, {
      method: 'PATCH',
    }),
};

export default api;
