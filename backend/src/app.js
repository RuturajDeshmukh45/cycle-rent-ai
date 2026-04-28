require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { errorHandler, notFound } = require('./middleware/error.middleware');

const authRoutes = require('./routes/auth.routes');
const cycleRoutes = require('./routes/cycle.routes');
const bookingRoutes = require('./routes/booking.routes');
const aiRoutes = require('./routes/ai.routes');

const app = express();

app.use(cors({ origin: '*', methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'], allowedHeaders: ['Content-Type', 'Authorization'] }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'OK', message: 'Cycle Rent API is running' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/cycles', cycleRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/ai', aiRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
