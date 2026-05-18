// LOCAL DISK STORAGE — No Cloudinary account needed
// Images saved to backend/uploads/ (cycles/) and backend/uploads/avatars/

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload dirs exist
const cycleDirAbs = path.join(__dirname, '../../uploads/cycles');
const avatarDirAbs = path.join(__dirname, '../../uploads/avatars');
[cycleDirAbs, avatarDirAbs].forEach(d => { if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true }); });

// Cycle image storage
const cycleStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, cycleDirAbs),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `cycle_${Date.now()}_${Math.round(Math.random() * 1e6)}${ext}`);
  },
});

// Avatar storage
const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, avatarDirAbs),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `avatar_${Date.now()}_${Math.round(Math.random() * 1e6)}${ext}`);
  },
});

const imageFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) cb(null, true);
  else cb(new Error('Only image files are allowed'), false);
};

const upload = multer({ storage: cycleStorage, limits: { fileSize: 5 * 1024 * 1024 }, fileFilter: imageFilter });
const uploadAvatar = multer({ storage: avatarStorage, limits: { fileSize: 2 * 1024 * 1024 }, fileFilter: imageFilter });

// Stub cloudinary so existing code won't crash
const cloudinary = { uploader: { destroy: async () => ({ result: 'ok' }) } };

module.exports = { cloudinary, upload, uploadAvatar };
