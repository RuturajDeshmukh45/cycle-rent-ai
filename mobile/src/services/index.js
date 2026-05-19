import api from './api';

// Auth
export const login    = (data) => api.post('/auth/login', data);
export const register = (data) => api.post('/auth/register', data);
export const getProfile    = ()     => api.get('/auth/profile');
export const updateProfile = (data) => api.put('/auth/profile', data);

// Cycles
export const getAllCycles = (params) => api.get('/cycles', { params });
export const getCycleById = (id)     => api.get(`/cycles/${id}`);

// Bookings
export const createBooking  = (data) => api.post('/bookings', data);
export const completeBooking = (id)  => api.put(`/bookings/${id}/complete`);
export const cancelBooking   = (id)  => api.put(`/bookings/${id}/cancel`);
export const getMyRides      = ()    => api.get('/bookings/my-rides');
export const getRideHistory  = ()    => api.get('/bookings/history');

// Reviews
export const submitReview    = (data)     => api.post('/reviews', data).then(r => r.data);
export const updateReview    = (id, data) => api.put(`/reviews/${id}`, data).then(r => r.data);
export const getBookingReview = (bookingId) => api.get(`/reviews/booking/${bookingId}`).then(r => r.data);
