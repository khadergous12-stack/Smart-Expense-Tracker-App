// src/services/api.js
// Centralized Axios API service with auth token injection
import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
});

// Automatically inject JWT token in every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 unauthorized globally
API.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ─── Auth APIs ─────────────────────────────────────────────────────
export const registerUser = (data) => API.post('/auth/register', data);
export const loginUser = (data) => API.post('/auth/login', data);
export const getMe = () => API.get('/auth/me');
export const updateProfile = (data) => API.put('/auth/profile', data);

// ─── Transaction APIs ──────────────────────────────────────────────
export const getTransactions = (params) => API.get('/transactions', { params });
export const addTransaction = (data) => API.post('/transactions', data);
export const updateTransaction = (id, data) => API.put(`/transactions/${id}`, data);
export const deleteTransaction = (id) => API.delete(`/transactions/${id}`);
export const getSummary = () => API.get('/transactions/summary');

// ─── Budget APIs ───────────────────────────────────────────────────
export const getBudgets = (params) => API.get('/budgets', { params });
export const createOrUpdateBudget = (data) => API.post('/budgets', data);
export const deleteBudget = (id) => API.delete(`/budgets/${id}`);
export const getBudgetAlerts = () => API.get('/budgets/alerts');

export default API;
