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
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      connectTimeoutMS: 10000,
      serverSelectionTimeoutMS: 10000,
    });
    console.log('✓ MongoDB connected successfully');
    
    // Start server only after DB connection is successful
    app.listen(PORT, () => {
      console.log(`✓ Server is running on port ${PORT}`);
    });
  } catch (err) {
    console.error('✗ MongoDB connection error:', err.message);
    console.log('Retrying connection in 5 seconds...');
    setTimeout(connectDB, 5000);
  }
};

connectDB();
