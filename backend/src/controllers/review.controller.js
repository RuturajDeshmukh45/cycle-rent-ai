const { Review, Booking, Cycle, User } = require('../models');
const { successResponse, errorResponse } = require('../utils/helper');

// POST /api/reviews — submit a review after completing a ride
exports.createReview = async (req, res, next) => {
  try {
    const { booking_id, rating, comment } = req.body;

    if (!booking_id || !rating) {
      return errorResponse(res, 'booking_id and rating are required.', 400);
    }
    if (rating < 1 || rating > 5) {
      return errorResponse(res, 'Rating must be between 1 and 5.', 400);
    }

    const booking = await Booking.findOne({
      where: { id: booking_id, user_id: req.user.id },
    });
    if (!booking) return errorResponse(res, 'Booking not found.', 404);
    if (booking.status !== 'completed') {
      return errorResponse(res, 'You can only review completed rides.', 400);
    }

    const existing = await Review.findOne({ where: { booking_id } });
    if (existing) return errorResponse(res, 'You have already reviewed this ride.', 400);

    const review = await Review.create({
      user_id: req.user.id,
      booking_id,
      cycle_id: booking.cycle_id,
      rating,
      comment: comment || null,
    });

    return successResponse(res, review, 'Review submitted successfully', 201);
  } catch (err) { next(err); }
};

// PUT /api/reviews/:id — edit own review
exports.updateReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    if (rating && (rating < 1 || rating > 5)) {
      return errorResponse(res, 'Rating must be between 1 and 5.', 400);
    }

    const review = await Review.findOne({
      where: { id: req.params.id, user_id: req.user.id },
    });
    if (!review) return errorResponse(res, 'Review not found or not yours.', 404);

    await review.update({
      ...(rating  !== undefined && { rating }),
      ...(comment !== undefined && { comment: comment || null }),
    });

    return successResponse(res, review, 'Review updated successfully');
  } catch (err) { next(err); }
};

// GET /api/reviews/cycle/:cycleId — get all reviews for a cycle
exports.getCycleReviews = async (req, res, next) => {
  try {
    const reviews = await Review.findAll({
      where: { cycle_id: req.params.cycleId },
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'avatar'] }],
      order: [['createdAt', 'DESC']],
    });
    const avgRating = reviews.length
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : null;
    return successResponse(res, { reviews, avgRating, total: reviews.length }, 'Reviews fetched');
  } catch (err) { next(err); }
};

// GET /api/reviews/my — get current user's reviews
exports.getMyReviews = async (req, res, next) => {
  try {
    const reviews = await Review.findAll({
      where: { user_id: req.user.id },
      include: [{ model: Cycle, as: 'cycle', attributes: ['id', 'name', 'cycle_type', 'image_url'] }],
      order: [['createdAt', 'DESC']],
    });
    return successResponse(res, reviews, 'My reviews fetched');
  } catch (err) { next(err); }
};

// GET /api/reviews/booking/:bookingId — check if a booking has a review
exports.getBookingReview = async (req, res, next) => {
  try {
    const review = await Review.findOne({
      where: { booking_id: req.params.bookingId, user_id: req.user.id },
    });
    return successResponse(res, review, 'Review fetched');
  } catch (err) { next(err); }
};

// GET /api/reviews/all — admin: get all reviews
exports.getAllReviews = async (req, res, next) => {
  try {
    const reviews = await Review.findAll({
      include: [
        { model: User,  as: 'user',  attributes: ['id', 'name', 'avatar'] },
        { model: Cycle, as: 'cycle', attributes: ['id', 'name', 'cycle_type'] },
      ],
      order: [['createdAt', 'DESC']],
    });
    return successResponse(res, reviews, 'All reviews fetched');
  } catch (err) { next(err); }
};