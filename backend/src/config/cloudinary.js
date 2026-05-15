// LOCAL DISK STORAGE — No Cloudinary account needed
// Images are saved to backend/uploads/ and served as static files

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, '../../uploads/cycles');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // unique filename: timestamp + random + original extension
    const ext = path.extname(file.originalname).toLowerCase();
    const unique = `cycle_${Date.now()}_${Math.round(Math.random() * 1e6)}${ext}`;
    cb(null, unique);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are allowed'), false);
  },
});

// Stub cloudinary object so existing controller code won't crash
const cloudinary = {
  uploader: {
    destroy: async () => ({ result: 'ok' }),
  },
};

module.exports = { cloudinary, upload };
