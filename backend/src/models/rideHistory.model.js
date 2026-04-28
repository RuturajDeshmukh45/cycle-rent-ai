const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const RideHistory = sequelize.define('RideHistory', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  booking_id: { type: DataTypes.INTEGER, allowNull: false },
  cycle_id: { type: DataTypes.INTEGER, allowNull: false },
  total_cost: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  duration_hours: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  start_location: { type: DataTypes.STRING(255), allowNull: true },
  end_location: { type: DataTypes.STRING(255), allowNull: true },
  rating: { type: DataTypes.INTEGER, allowNull: true, validate: { min: 1, max: 5 } },
  feedback: { type: DataTypes.TEXT, allowNull: true },
}, {
  tableName: 'ride_history',
  timestamps: true,
});

module.exports = RideHistory;
