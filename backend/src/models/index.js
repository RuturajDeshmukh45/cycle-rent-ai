const sequelize = require('../config/db');
const User = require('./user.model');
const Cycle = require('./cycle.model');
const Booking = require('./booking.model');
const RideHistory = require('./rideHistory.model');
const Review = require('./review.model');

// Associations
User.hasMany(Booking, { foreignKey: 'user_id', as: 'bookings' });
Booking.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

Cycle.hasMany(Booking, { foreignKey: 'cycle_id', as: 'bookings' });
Booking.belongsTo(Cycle, { foreignKey: 'cycle_id', as: 'cycle' });

User.hasMany(RideHistory, { foreignKey: 'user_id', as: 'rides' });
RideHistory.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

Booking.hasOne(RideHistory, { foreignKey: 'booking_id', as: 'history' });
RideHistory.belongsTo(Booking, { foreignKey: 'booking_id', as: 'booking' });

Cycle.hasMany(RideHistory, { foreignKey: 'cycle_id', as: 'rides' });
RideHistory.belongsTo(Cycle, { foreignKey: 'cycle_id', as: 'cycle' });

// Review associations
User.hasMany(Review, { foreignKey: 'user_id', as: 'reviews' });
Review.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

Cycle.hasMany(Review, { foreignKey: 'cycle_id', as: 'reviews' });
Review.belongsTo(Cycle, { foreignKey: 'cycle_id', as: 'cycle' });

Booking.hasOne(Review, { foreignKey: 'booking_id', as: 'review' });
Review.belongsTo(Booking, { foreignKey: 'booking_id', as: 'booking' });

module.exports = { sequelize, User, Cycle, Booking, RideHistory, Review };
