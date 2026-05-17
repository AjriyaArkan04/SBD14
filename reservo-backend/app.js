const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { connectDB } = require('./config/database');

// Import routes
const userRoutes = require('./routes/userRoutes');
const restaurantRoutes = require('./routes/restaurantRoutes');
const tableRoutes = require('./routes/tableRoutes');
const reservationRoutes = require('./routes/reservationRoutes');

// Import middleware
const errorHandler = require('./middleware/errorHandler');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Connect DB
connectDB();

// Routes
app.use('/api/users', userRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/tables', tableRoutes);
app.use('/api/reservations', reservationRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
  });
});

// Error handler
app.use(errorHandler);

module.exports = app;