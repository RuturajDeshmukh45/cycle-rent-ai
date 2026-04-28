import api from './api';
export const getAllCycles = (params) => api.get('/cycles', { params });
export const getCycleById = (id) => api.get(`/cycles/${id}`);
export const createCycle = (data) => api.post('/cycles', data);
export const updateCycle = (id, data) => api.put(`/cycles/${id}`, data);
