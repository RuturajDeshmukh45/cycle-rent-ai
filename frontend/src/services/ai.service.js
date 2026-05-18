import api from './api';
export const getDynamicPricing = (params) => api.get('/ai/pricing', { params });
export const getRecommendations = () => api.get('/ai/recommendations');
export const getAnalytics = () => api.get('/ai/analytics');
