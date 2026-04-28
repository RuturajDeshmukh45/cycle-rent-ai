const { User } = require('../models');

class UserRepository {
  async create(data) {
    return User.create(data);
  }
  async findByEmail(email) {
    return User.findOne({ where: { email } });
  }
  async findById(id) {
    return User.findByPk(id, { attributes: { exclude: ['password'] } });
  }
  async update(id, data) {
    await User.update(data, { where: { id } });
    return this.findById(id);
  }
}

module.exports = new UserRepository();
