const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Booking = sequelize.define('Booking', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  cycle_id: { type: DataTypes.INTEGER, allowNull: false },
  start_time: { type: DataTypes.DATE, allowNull: false },
  end_time: { type: DataTypes.DATE, allowNull: true },
  duration_hours: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
  total_cost: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
  status: { type: DataTypes.ENUM('booked', 'active', 'completed', 'cancelled'), defaultValue: 'booked' },
  pickup_location: { type: DataTypes.STRING(255), allowNull: true },
  drop_location: { type: DataTypes.STRING(255), allowNull: true },
}, {
  tableName: 'bookings',
  timestamps: true,
});

module.exports = Booking;
