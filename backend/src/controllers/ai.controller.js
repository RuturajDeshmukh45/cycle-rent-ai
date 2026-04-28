const { getDynamicPrice, getPeakHours } = require('../services/pricing.service');
const { getBestTimeToRent, getRoutesSuggestion, getUserInsights } = require('../services/recommendation.service');
const { RideHistory, Cycle, Booking } = require('../models');
const { successResponse } = require('../utils/helper');
const { sequelize } = require('../models');

exports.getDynamicPricing = async (req, res, next) => {
  try {
    const { base_price = 10, demand_score = 50 } = req.query;
    const pricing = getDynamicPrice(parseFloat(base_price), parseInt(demand_score));
    const peakHours = getPeakHours();
    return successResponse(res, { pricing, peakHours }, 'Dynamic pricing fetched');
  } catch (err) { next(err); }
};

exports.getRecommendations = async (req, res, next) => {
  try {
    const [timeRec, routeRec, userInsights] = await Promise.all([
      getBestTimeToRent(),
      getRoutesSuggestion(req.user.id),
      getUserInsights(req.user.id),
    ]);
    return successResponse(res, { timeRecommendation: timeRec, routeRecommendation: routeRec, userInsights }, 'Recommendations fetched');
  } catch (err) { next(err); }
};

exports.getAnalytics = async (req, res, next) => {
  try {
    const totalRides = await RideHistory.count();
    const totalRevenue = await RideHistory.sum('total_cost') || 0;
    const totalCycles = await Cycle.count();
    const availableCycles = await Cycle.count({ where: { status: 'available' } });
    const totalBookings = await Booking.count();
    const activeBookings = await Booking.count({ where: { status: 'active' } });

    // Rides by status
    const bookingsByStatus = await Booking.findAll({
      attributes: ['status', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
      group: ['status'],
      raw: true,
    });

    // Top cycles
    const topCycles = await RideHistory.findAll({
      attributes: ['cycle_id', [sequelize.fn('COUNT', sequelize.col('cycle_id')), 'ride_count']],
      group: ['cycle_id'],
      order: [[sequelize.fn('COUNT', sequelize.col('cycle_id')), 'DESC']],
      limit: 5,
      include: [{ model: Cycle, as: 'cycle', attributes: ['name', 'location'] }],
    });

    return successResponse(res, {
      overview: { totalRides, totalRevenue: parseFloat(totalRevenue).toFixed(2), totalCycles, availableCycles, totalBookings, activeBookings },
      bookingsByStatus,
      topCycles,
    }, 'Analytics fetched');
  } catch (err) { next(err); }
};
