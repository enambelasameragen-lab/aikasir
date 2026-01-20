import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API_BASE = `${BACKEND_URL}/api/v1`;

// Create axios instance
const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('aikasir_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('aikasir_token');
      localStorage.removeItem('aikasir_user');
      localStorage.removeItem('aikasir_tenant');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// AI Onboarding
export const aiOnboard = (message, sessionId) =>
  api.post('/ai/onboard', { message, session_id: sessionId });

// Auth
export const login = (email, password) =>
  api.post('/auth/login', { email, password });

export const getMe = () => api.get('/auth/me');

export const changePassword = (newPassword) =>
  api.put('/auth/password', { new_password: newPassword });

// Items
export const getItems = (activeOnly = true, search = '') =>
  api.get('/items', { params: { active_only: activeOnly, search } });

export const createItem = (name, price) =>
  api.post('/items', { name, price });

export const updateItem = (id, data) =>
  api.put(`/items/${id}`, data);

export const deleteItem = (id) =>
  api.delete(`/items/${id}`);

// Transactions
export const getTransactions = (date = null, limit = 50, offset = 0) =>
  api.get('/transactions', { params: { date, limit, offset } });

export const getTransaction = (id) =>
  api.get(`/transactions/${id}`);

export const createTransaction = (items, paymentMethod, paymentAmount) =>
  api.post('/transactions', {
    items,
    payment_method: paymentMethod,
    payment_amount: paymentAmount,
  });

// Dashboard
export const getDashboardToday = () => api.get('/dashboard/today');

// Settings
export const getSettings = () => api.get('/settings');

export const updateSettings = (data) => api.put('/settings', data);

export default api;
