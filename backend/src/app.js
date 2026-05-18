require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { errorHandler, notFound } = require('./middleware/error.middleware');

const authRoutes = require('./routes/auth.routes');
const cycleRoutes = require('./routes/cycle.routes');
const bookingRoutes = require('./routes/booking.routes');
const aiRoutes = require('./routes/ai.routes');
const reviewRoutes = require('./routes/review.routes');

const app = express();

// Ensure uploads directories exist
['../uploads/cycles', '../uploads/avatars'].forEach(rel => {
  const dir = path.join(__dirname, rel);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

app.use(cors({ origin: '*', methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'], allowedHeaders: ['Content-Type', 'Authorization'] }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded images as static files
// Image URL: http://localhost:5000/uploads/cycles/filename.jpg
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'OK', message: 'Cycle Rent API is running' }));

// ── Live status endpoint (used by dev dashboard monitor) ──
app.get('/api/status', async (req, res) => {
  const { sequelize } = require('./models');
  try {
    await sequelize.authenticate();
    res.json({
      server: 'running',
      port: process.env.PORT || 5000,
      db: 'connected',
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    res.json({
      server: 'running',
      port: process.env.PORT || 5000,
      db: 'error',
      timestamp: new Date().toISOString(),
    });
  }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/cycles', cycleRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/reviews', reviewRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;