const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Cycle = sequelize.define('Cycle', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(100), allowNull: false },
  location: { type: DataTypes.STRING(255), allowNull: false },
  latitude: { type: DataTypes.DECIMAL(10, 8), allowNull: true },
  longitude: { type: DataTypes.DECIMAL(11, 8), allowNull: true },
  status: { type: DataTypes.ENUM('available', 'booked', 'maintenance'), defaultValue: 'available' },
  price_per_hour: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 10.00 },
  cycle_type: { type: DataTypes.ENUM('standard', 'electric', 'mountain'), defaultValue: 'standard' },
  image_url: { type: DataTypes.STRING(255), allowNull: true },
  description: { type: DataTypes.TEXT, allowNull: true },
}, {
  tableName: 'cycles',
  timestamps: true,
});

module.exports = Cycle;
