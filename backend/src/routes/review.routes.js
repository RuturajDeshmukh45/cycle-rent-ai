const express = require('express');
const router = express.Router();
const {
  createReview,
  updateReview,
  getCycleReviews,
  getMyReviews,
  getBookingReview,
  getAllReviews,
} = require('../controllers/review.controller');
const { protect, adminOnly } = require('../middleware/auth.middleware');

router.post('/', protect, createReview);
router.put('/:id', protect, updateReview);          // ← edit own review
router.get('/my', protect, getMyReviews);
router.get('/booking/:bookingId', protect, getBookingReview);
router.get('/cycle/:cycleId', getCycleReviews);
router.get('/all', protect, adminOnly, getAllReviews);

module.exports = router;