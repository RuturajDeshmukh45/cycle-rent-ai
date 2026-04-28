const bookingRepo = require('../repositories/booking.repository');
const cycleRepo = require('../repositories/cycle.repository');
const rideHistoryRepo = require('../repositories/rideHistory.repository');
const { getDynamicPrice } = require('../services/pricing.service');
const { calculateCost, getDurationHours, successResponse, errorResponse } = require('../utils/helper');

exports.createBooking = async (req, res, next) => {
  try {
    const { cycle_id, pickup_location, drop_location } = req.body;
    if (!cycle_id) return errorResponse(res, 'Cycle ID is required.', 400);
    const cycle = await cycleRepo.findById(cycle_id);
    if (!cycle) return errorResponse(res, 'Cycle not found.', 404);
    if (cycle.status !== 'available') return errorResponse(res, 'Cycle is not available.', 400);
    const existing = await bookingRepo.findActiveByUserId(req.user.id);
    if (existing) return errorResponse(res, 'You already have an active booking.', 400);
    const pricing = getDynamicPrice(parseFloat(cycle.price_per_hour));
    const booking = await bookingRepo.create({
      user_id: req.user.id,
      cycle_id,
      start_time: new Date(),
      status: 'active',
      pickup_location,
      drop_location,
    });
    await cycleRepo.updateStatus(cycle_id, 'booked');
    return successResponse(res, { booking, pricing }, 'Booking created', 201);
  } catch (err) { next(err); }
};

exports.completeBooking = async (req, res, next) => {
  try {
    const booking = await bookingRepo.findById(req.params.id);
    if (!booking) return errorResponse(res, 'Booking not found.', 404);
    if (booking.user_id !== req.user.id) return errorResponse(res, 'Not authorized.', 403);
    if (booking.status !== 'active' && booking.status !== 'booked') {
      return errorResponse(res, 'Booking is not active.', 400);
    }
    const endTime = new Date();
    const duration = getDurationHours(booking.start_time, endTime);
    const cost = calculateCost(booking.start_time, endTime, parseFloat(booking.cycle.price_per_hour));
    const updated = await bookingRepo.update(booking.id, {
      end_time: endTime,
      duration_hours: duration,
      total_cost: cost,
      status: 'completed',
    });
    await cycleRepo.updateStatus(booking.cycle_id, 'available');
    await rideHistoryRepo.create({
      user_id: req.user.id,
      booking_id: booking.id,
      cycle_id: booking.cycle_id,
      total_cost: cost,
      duration_hours: duration,
      start_location: booking.pickup_location,
      end_location: booking.drop_location,
    });
    return successResponse(res, updated, 'Ride completed');
  } catch (err) { next(err); }
};

exports.cancelBooking = async (req, res, next) => {
  try {
    const booking = await bookingRepo.findById(req.params.id);
    if (!booking) return errorResponse(res, 'Booking not found.', 404);
    if (booking.user_id !== req.user.id) return errorResponse(res, 'Not authorized.', 403);
    if (!['booked', 'active'].includes(booking.status)) {
      return errorResponse(res, 'Cannot cancel this booking.', 400);
    }
    await bookingRepo.update(booking.id, { status: 'cancelled' });
    await cycleRepo.updateStatus(booking.cycle_id, 'available');
    return successResponse(res, null, 'Booking cancelled');
  } catch (err) { next(err); }
};

exports.getMyRides = async (req, res, next) => {
  try {
    const bookings = await bookingRepo.findByUserId(req.user.id);
    return successResponse(res, bookings, 'Rides fetched');
  } catch (err) { next(err); }
};

exports.getRideHistory = async (req, res, next) => {
  try {
    const history = await rideHistoryRepo.findByUserId(req.user.id);
    return successResponse(res, history, 'Ride history fetched');
  } catch (err) { next(err); }
};

exports.getAllBookings = async (req, res, next) => {
  try {
    const bookings = await bookingRepo.findAll();
    return successResponse(res, bookings, 'All bookings fetched');
  } catch (err) { next(err); }
};
