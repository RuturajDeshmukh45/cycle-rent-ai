const multer = require('multer');

const errorHandler = (err, req, res, next) => {
  console.error('Error:', err.message);

  // Handle multer file size / type errors with a clear message
  if (err instanceof multer.MulterError) {
    const msg = err.code === 'LIMIT_FILE_SIZE'
      ? 'Image too large. Maximum size is 5MB.'
      : `File upload error: ${err.message}`;
    return res.status(400).json({ success: false, message: msg });
  }
  if (err.message === 'Only image files are allowed') {
    return res.status(400).json({ success: false, message: err.message });
  }

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

const notFound = (req, res, next) => {
  const err = new Error(`Not found: ${req.originalUrl}`);
  err.statusCode = 404;
  next(err);
};

module.exports = { errorHandler, notFound };
