const { Cycle } = require('../models');
const { Op } = require('sequelize');

class CycleRepository {
  async findAll(filters = {}) {
    const where = {};
    if (filters.status) where.status = filters.status;
    if (filters.location) where.location = { [Op.like]: `%${filters.location}%` };
    return Cycle.findAll({ where, order: [['createdAt', 'DESC']] });
  }
  async findById(id) {
    return Cycle.findByPk(id);
  }
  async create(data) {
    return Cycle.create(data);
  }
  async update(id, data) {
    await Cycle.update(data, { where: { id } });
    return this.findById(id);
  }
  async updateStatus(id, status) {
    return Cycle.update({ status }, { where: { id } });
  }
}

module.exports = new CycleRepository();
