import axios from 'axios';

const productionBase = 'https://smart-agriculture-z9dw.onrender.com/api';
const API_URL = import.meta.env.VITE_API_BASE_URL || (window.location.hostname === 'localhost' ? '/api' : productionBase);

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
