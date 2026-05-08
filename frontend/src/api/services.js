import api from './apiClient';

// Auth APIs
export const register = (data) => api.post('/auth/register', data);
export const login = (data) => api.post('/auth/login', data);
export const getCurrentUser = () => api.get('/auth/me');

// Climate Data APIs
export const getClimateData = () => api.get('/climate/data');
export const getLatestClimateData = (farmId) => api.get(`/climate/latest/${farmId}`);
export const getClimateStats = (farmId) => api.get(`/climate/stats/${farmId}`);
export const fetchFromAPI = (farmId) => api.post(`/climate/fetch-api/${farmId}`);
export const addManualData = (data) => api.post('/climate/manual', data);

// Farm APIs
export const getFarms = () => api.get('/farms');
export const getFarm = (id) => api.get(`/farms/${id}`);
export const createFarm = (data) => api.post('/farms', data);
export const updateFarm = (id, data) => api.patch(`/farms/${id}`, data);
export const deleteFarm = (id) => api.delete(`/farms/${id}`);

// AI recommendation APIs
export const getAiRecommendations = (farmId) => api.get(`/climate/recommendations/${farmId}`);

// Alert APIs
export const getAlerts = (status) => api.get(`/alerts?status=${status || ''}`);
export const markAlertAsRead = (id) => api.patch(`/alerts/${id}/read`);
export const deleteAlert = (id) => api.delete(`/alerts/${id}`);

// Admin APIs
export const getAdminStats = () => api.get('/admin/stats');
export const getAllUsers = () => api.get('/admin/users');
export const getAllFarms = () => api.get('/admin/farms');
export const getAllClimateData = () => api.get('/admin/climate-data');
export const getAllAlerts = () => api.get('/admin/alerts');
export const deleteUser = (id) => api.delete(`/admin/users/${id}`);
export const deleteFarmAdmin = (id) => api.delete(`/admin/farms/${id}`);
