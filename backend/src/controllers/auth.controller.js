const userRepo = require('../repositories/user.repository');
const { generateToken } = require('../config/jwt');
const { successResponse, errorResponse } = require('../utils/helper');
const path = require('path');
const fs = require('fs');

// Build public avatar URL
const getAvatarUrl = (req, filename) => {
  if (!filename) return null;
  return `${req.protocol}://${req.get('host')}/uploads/avatars/${filename}`;
};

// Delete old local avatar file
const deleteLocalAvatar = (avatarUrl) => {
  if (!avatarUrl) return;
  try {
    const filename = avatarUrl.split('/uploads/avatars/')[1];
    if (!filename) return;
    const filePath = path.join(__dirname, '../../uploads/avatars', filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  } catch (e) { /* silent */ }
};

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
      user: { id: user.id, name: user.name, email: user.email, role: user.role, profileImage: user.avatar || null },
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
      user: { id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone, profileImage: user.avatar || null },
    }, 'Login successful');
  } catch (err) { next(err); }
};

exports.getProfile = async (req, res, next) => {
  try {
    const user = await userRepo.findById(req.user.id);
    const profile = {
      id: user.id, name: user.name, email: user.email,
      role: user.role, phone: user.phone, profileImage: user.avatar || null,
    };
    return successResponse(res, profile, 'Profile fetched');
  } catch (err) { next(err); }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { name, phone } = req.body;
    const updateData = { name, phone };

    // Handle avatar upload
    if (req.file) {
      // Delete old avatar if exists
      const existing = await userRepo.findById(req.user.id);
      if (existing?.avatar) deleteLocalAvatar(existing.avatar);
      updateData.avatar = getAvatarUrl(req, req.file.filename);
    }

    const user = await userRepo.update(req.user.id, updateData);
    const updatedUser = {
      id: user.id, name: user.name, email: user.email,
      role: user.role, phone: user.phone, profileImage: user.avatar || null,
    };
    return successResponse(res, updatedUser, 'Profile updated');
  } catch (err) { next(err); }
};
