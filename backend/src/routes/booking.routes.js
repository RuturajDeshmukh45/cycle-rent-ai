const express = require('express');
const router = express.Router();
const {
  createBooking, completeBooking, cancelBooking,
  getMyRides, getRideHistory, getAllBookings,
} = require('../controllers/booking.controller');
const { protect, adminOnly } = require('../middleware/auth.middleware');

router.post('/', protect, createBooking);
router.put('/:id/complete', protect, completeBooking);
router.put('/:id/cancel', protect, cancelBooking);
router.get('/my-rides', protect, getMyRides);
router.get('/history', protect, getRideHistory);
router.get('/all', protect, adminOnly, getAllBookings);

module.exports = router;
