const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the frontend build directory
const staticFilePath = path.join(__dirname, '../frontend/dist');
app.use(express.static(staticFilePath));

// API Routes
app.use((req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ success: false, message: 'Database not connected' });
  }
  next();
});

// Routes
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const couponRoutes = require('./routes/coupons');
const bannerRoutes = require('./routes/banners');
const categoryRoutes = require('./routes/categories');
const userRoutes = require('./routes/users');
const paymentRoutes = require('./routes/payments');
const shippingRoutes = require('./routes/shipping');

app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/users', userRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/shipping', shippingRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Fabric Store API is running...' });
});

// Serve index.html for all non-API routes (client-side routing)
app.get('*', (req, res) => {
  res.sendFile(path.join(staticFilePath, 'index.html'), (err) => {
    if (err) {
      res.status(404).json({ success: false, message: 'Page not found' });
    }
  });
});

// MongoDB Connection with proper error handling
let isDBConnected = false;

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      connectTimeoutMS: 15000,
      serverSelectionTimeoutMS: 15000,
    });
    isDBConnected = true;
    console.log('✓ MongoDB connected successfully');
  } catch (err) {
    isDBConnected = false;
    console.error('✗ MongoDB connection error:', err.message);
    console.log('Retrying connection in 5 seconds...');
    setTimeout(connectDB, 5000);
  }
};

// Start MongoDB connection in background (don't wait for it)
connectDB();

// Start server immediately for Render health checks
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`✓ Server is running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    mongoose.connection.close();
    process.exit(0);
  });
});
