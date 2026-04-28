const { RideHistory, Cycle, Booking } = require('../models');

class RideHistoryRepository {
  async create(data) {
    return RideHistory.create(data);
  }
  async findByUserId(user_id) {
    return RideHistory.findAll({
      where: { user_id },
      include: [{ model: Cycle, as: 'cycle' }, { model: Booking, as: 'booking' }],
      order: [['createdAt', 'DESC']],
    });
  }
  async getAnalytics() {
    const { sequelize } = require('../models');
    const totalRides = await RideHistory.count();
    const totalRevenue = await RideHistory.sum('total_cost');
    const avgDuration = await RideHistory.findAll({
      attributes: [[sequelize.fn('AVG', sequelize.col('duration_hours')), 'avg_duration']],
      raw: true,
    });
    return { totalRides, totalRevenue, avgDuration: avgDuration[0]?.avg_duration || 0 };
  }
}

module.exports = new RideHistoryRepository();
