import api from './api';
export const createBooking = (data) => api.post('/bookings', data);
export const completeBooking = (id) => api.put(`/bookings/${id}/complete`);
export const cancelBooking = (id) => api.put(`/bookings/${id}/cancel`);
export const getMyRides = () => api.get('/bookings/my-rides');
export const getRideHistory = () => api.get('/bookings/history');
export const getAllBookings = () => api.get('/bookings/all');
export const getAdminStats = () => api.get('/bookings/admin/stats');
