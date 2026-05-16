const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { sequelize, connectDB } = require('./config/database');


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

// Connect to database
connectDB();

// Routes
app.use('/api/users', userRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/tables', tableRoutes);
app.use('/api/reservations', reservationRoutes);

// Health check endpoint
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

// Error handling middleware
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`📝 API Documentation:`);
  console.log(`   - Health Check: GET /api/health`);
  console.log(`   - Users: GET /api/users`);
  console.log(`   - Restaurants: GET /api/restaurants`);
  console.log(`   - Tables: GET /api/tables`);
  console.log(`   - Reservations: GET /api/reservations`);
});

sequelize.sync({ alter: true })
  .then(() => {
    console.log('✅ All tables synced.');
  })
  .catch((err) => {
    console.error('❌ Sync error:', err);
  });

module.exports = app;
