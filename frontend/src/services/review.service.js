import api from './api';

// NOTE: getAllReviews and getMyReviews are used via useFetch,
// which internally does: setData(res.data?.data)
// So these must return the raw axios response (r), NOT r.data

export const getAllReviews  = ()           => api.get('/reviews/all');
export const getMyReviews  = ()           => api.get('/reviews/my');

// These are called directly (not via useFetch), so return r.data
export const submitReview    = (data)      => api.post('/reviews', data).then(r => r.data);
export const updateReview    = (id, data)  => api.put(`/reviews/${id}`, data).then(r => r.data);
export const getBookingReview = (bookingId) => api.get(`/reviews/booking/${bookingId}`).then(r => r.data);
export const getCycleReviews  = (cycleId)  => api.get(`/reviews/cycle/${cycleId}`).then(r => r.data);