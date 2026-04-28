const CYCLE_STATUS = {
  AVAILABLE: 'available',
  BOOKED: 'booked',
  MAINTENANCE: 'maintenance',
};

const BOOKING_STATUS = {
  BOOKED: 'booked',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin',
};

module.exports = { CYCLE_STATUS, BOOKING_STATUS, USER_ROLES };
