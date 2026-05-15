const express = require('express');
const router = express.Router();
const {
  createBooking, completeBooking, cancelBooking,
  getMyRides, getRideHistory, getAllBookings, getAdminStats,
} = require('../controllers/booking.controller');
const { protect, adminOnly } = require('../middleware/auth.middleware');

router.post('/', protect, createBooking);
router.put('/:id/complete', protect, completeBooking);
router.put('/:id/cancel', protect, cancelBooking);
router.get('/my-rides', protect, getMyRides);
router.get('/history', protect, getRideHistory);
router.get('/all', protect, adminOnly, getAllBookings);
router.get('/admin/stats', protect, adminOnly, getAdminStats);

module.exports = router;
