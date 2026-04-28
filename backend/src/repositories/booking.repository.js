const { Booking, Cycle, User } = require('../models');

class BookingRepository {
  async create(data) {
    return Booking.create(data);
  }
  async findById(id) {
    return Booking.findByPk(id, {
      include: [{ model: Cycle, as: 'cycle' }, { model: User, as: 'user', attributes: { exclude: ['password'] } }],
    });
  }
  async findByUserId(user_id) {
    return Booking.findAll({
      where: { user_id },
      include: [{ model: Cycle, as: 'cycle' }],
      order: [['createdAt', 'DESC']],
    });
  }
  async findActiveByUserId(user_id) {
    return Booking.findOne({
      where: { user_id, status: ['booked', 'active'] },
      include: [{ model: Cycle, as: 'cycle' }],
    });
  }
  async update(id, data) {
    await Booking.update(data, { where: { id } });
    return this.findById(id);
  }
  async findAll() {
    return Booking.findAll({
      include: [
        { model: Cycle, as: 'cycle' },
        { model: User, as: 'user', attributes: { exclude: ['password'] } },
      ],
      order: [['createdAt', 'DESC']],
    });
  }
}

module.exports = new BookingRepository();
