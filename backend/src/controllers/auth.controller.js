const userRepo = require('../repositories/user.repository');
const { generateToken } = require('../config/jwt');
const { successResponse, errorResponse } = require('../utils/helper');

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password) return errorResponse(res, 'Name, email, and password are required.', 400);
    const existing = await userRepo.findByEmail(email);
    if (existing) return errorResponse(res, 'Email already registered.', 409);
    const user = await userRepo.create({ name, email, password, phone });
    const token = generateToken({ id: user.id, email: user.email, role: user.role });
    return successResponse(res, {
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    }, 'Registered successfully', 201);
  } catch (err) { next(err); }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return errorResponse(res, 'Email and password are required.', 400);
    const user = await userRepo.findByEmail(email);
    if (!user) return errorResponse(res, 'Invalid credentials.', 401);
    const isMatch = await user.comparePassword(password);
    if (!isMatch) return errorResponse(res, 'Invalid credentials.', 401);
    const token = generateToken({ id: user.id, email: user.email, role: user.role });
    return successResponse(res, {
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone },
    }, 'Login successful');
  } catch (err) { next(err); }
};

exports.getProfile = async (req, res, next) => {
  try {
    const user = await userRepo.findById(req.user.id);
    return successResponse(res, user, 'Profile fetched');
  } catch (err) { next(err); }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { name, phone } = req.body;
    const user = await userRepo.update(req.user.id, { name, phone });
    return successResponse(res, user, 'Profile updated');
  } catch (err) { next(err); }
};
