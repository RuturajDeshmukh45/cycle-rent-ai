const express = require('express');
const router = express.Router();
const { register, login, getProfile, updateProfile } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');
const { uploadAvatar } = require('../config/cloudinary');

router.post('/register', register);
router.post('/login', login);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, uploadAvatar.single('image'), updateProfile);

module.exports = router;
