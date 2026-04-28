/**
 * AI Recommendation Service
 * Rule-based suggestions for best routes and rental times
 */
const { RideHistory, Cycle } = require('../models');
const { Op } = require('sequelize');

const getBestTimeToRent = async () => {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  // Simulated demand scores per hour (could be from DB analytics)
  const demandByHour = {
    0: 5, 1: 3, 2: 2, 3: 2, 4: 3, 5: 8,
    6: 20, 7: 70, 8: 90, 9: 75, 10: 60, 11: 50,
    12: 55, 13: 50, 14: 45, 15: 40, 16: 50, 17: 85,
    18: 95, 19: 80, 20: 65, 21: 40, 22: 20, 23: 10,
  };

  const peakHours = Object.entries(demandByHour)
    .filter(([, d]) => d >= 70)
    .map(([h]) => `${h}:00`);

  const bestHours = Object.entries(demandByHour)
    .filter(([, d]) => d <= 30)
    .map(([h]) => `${h}:00`)
    .slice(0, 4);

  return {
    peakHours,
    bestTimeToRent: bestHours,
    recommendation: 'Best times: early morning (5-6 AM) or late evening (10 PM - 12 AM) for lowest prices.',
    demandByHour,
  };
};

const getRoutesSuggestion = async (userId) => {
  // Rule-based popular routes
  const popularRoutes = [
    { from: 'City Center', to: 'Railway Station', distance: '3.2 km', estimatedTime: '15 min', rating: 4.8 },
    { from: 'University', to: 'Shopping Mall', distance: '2.1 km', estimatedTime: '10 min', rating: 4.6 },
    { from: 'Park Entrance', to: 'Museum', distance: '1.8 km', estimatedTime: '8 min', rating: 4.7 },
    { from: 'Bus Stand', to: 'Tech Park', distance: '4.5 km', estimatedTime: '20 min', rating: 4.5 },
  ];
  return { popularRoutes, totalRoutes: popularRoutes.length };
};

const getUserInsights = async (userId) => {
  const rides = await RideHistory.findAll({ where: { user_id: userId }, limit: 20 });
  const totalRides = rides.length;
  const totalSpent = rides.reduce((sum, r) => sum + parseFloat(r.total_cost || 0), 0);
  const avgDuration = totalRides > 0
    ? rides.reduce((sum, r) => sum + parseFloat(r.duration_hours || 0), 0) / totalRides
    : 0;
  return {
    totalRides,
    totalSpent: parseFloat(totalSpent.toFixed(2)),
    avgDuration: parseFloat(avgDuration.toFixed(2)),
    message: totalRides === 0
      ? 'Start your first ride to get personalized insights!'
      : `You've completed ${totalRides} rides. Keep going!`,
  };
};

module.exports = { getBestTimeToRent, getRoutesSuggestion, getUserInsights };
