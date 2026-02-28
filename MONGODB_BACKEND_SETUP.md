# MongoDB Backend Setup Guide

This project uses a frontend (React) + Backend (Node.js/Express) architecture with MongoDB for data persistence.

## Architecture Overview

```
┌─────────────────────────────────────┐
│   React Frontend (Port 5173)         │
│   - Product Display                 │
│   - Cart Management                 │
│   - User Profile                    │
│   - Order Tracking                  │
└────────────┬────────────────────────┘
             │ API Calls
             ↓
┌─────────────────────────────────────┐
│   Node.js/Express Backend (Port 5000)│
│   - REST API Endpoints              │
│   - Authentication                  │
│   - Order Processing                │
│   - Payment Integration             │
└────────────┬────────────────────────┘
             │ Database Queries
             ↓
┌─────────────────────────────────────┐
│   MongoDB Atlas Cloud               │
│   - Products Collection             │
│   - Orders Collection               │
│   - Users Collection                │
│   - Coupons Collection              │
│   - Categories Collection           │
└─────────────────────────────────────┘
```

## Backend Setup Steps

### 1. Install Node.js and npm
- Download from https://nodejs.org/
- Verify installation: `node --version` && `npm --version`

### 2. Create Backend Directory
```bash
mkdir fabric-store-backend
cd fabric-store-backend
npm init -y
```

### 3. Install Dependencies
```bash
npm install express mongoose dotenv cors body-parser axios razorpay
npm install --save-dev nodemon
```

### 4. Create Backend Structure
```
fabric-store-backend/
├── config/
│   └── database.js
├── routes/
│   ├── products.js
│   ├── orders.js
│   ├── users.js
│   ├── coupons.js
│   └── payments.js
├── models/
│   ├── Product.js
│   ├── Order.js
│   ├── User.js
│   ├── Coupon.js
│   └── Category.js
├── controllers/
│   ├── productController.js
│   ├── orderController.js
│   ├── paymentController.js
│   └── userController.js
├── middleware/
│   ├── auth.js
│   └── errorHandler.js
├── .env
├── server.js
└── package.json
```

### 5. Create Database Connection (`config/database.js`)
```javascript
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
```

### 6. Create Main Server File (`server.js`)
```javascript
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/database');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/users', require('./routes/users'));
app.use('/api/coupons', require('./routes/coupons'));
app.use('/api/payments', require('./routes/payments'));

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: err.message || 'Server Error' 
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

### 7. Create Product Model (`models/Product.js`)
```javascript
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  sku: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  offerPercentage: { type: Number, default: 0 },
  quantity: { type: Number, required: true },
  category: { type: String, required: true },
  subCategory: { type: String, required: true },
  fabricType: String,
  careInstructions: String,
  description: String,
  images: [String],
  colors: [String],
  features: [String],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', productSchema);
```

### 8. Create Order Model (`models/Order.js`)
```javascript
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, required: true, unique: true },
  customerName: { type: String, required: true },
  customerEmail: { type: String, required: true },
  customerPhone: { type: String, required: true },
  shippingAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  items: [{
    productId: mongoose.Schema.Types.ObjectId,
    productName: String,
    sku: String,
    quantity: Number,
    price: Number,
    image: String
  }],
  subtotal: Number,
  discount: Number,
  shipping: Number,
  total: Number,
  couponCode: String,
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  razorpayOrderId: String,
  razorpayPaymentId: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);
```

## MongoDB Setup (Recommended: MongoDB Atlas)

### 1. Create MongoDB Atlas Account
- Go to https://www.mongodb.com/cloud/atlas
- Sign up for free account
- Create a new cluster

### 2. Get Connection String
1. In Atlas Dashboard, click "Connect"
2. Choose "Connect Your Application"
3. Copy the connection string
4. Replace `<username>` and `<password>` with your credentials
5. Replace `myFirstDatabase` with `fabric_store`

### 3. Update .env File
```env
MONGODB_URI=mongodb+srv://your_username:your_password@cluster0.xxxxx.mongodb.net/fabric_store
MONGODB_DATABASE=fabric_store
```

## Running the Backend

### Development Mode (with auto-reload)
```bash
npm run dev
```

Add to `package.json` scripts:
```json
"scripts": {
  "dev": "nodemon server.js",
  "start": "node server.js"
}
```

### Production Mode
```bash
npm start
```

## Frontend Configuration

Update your frontend .env:
```env
VITE_API_URL=http://localhost:5000/api
```

## API Endpoints Reference

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Orders
- `GET /api/orders` - Get all orders
- `GET /api/orders/:id` - Get order by ID
- `POST /api/orders` - Create order
- `PUT /api/orders/:id` - Update order status

### Users
- `POST /api/users/register` - Register user
- `POST /api/users/login` - Login user
- `GET /api/users/profile` - Get user profile

### Payments
- `POST /api/payments/create-order` - Create Razorpay order
- `POST /api/payments/verify` - Verify payment

## Frontend Integration

Update your database service to call backend API instead of localStorage:

```typescript
// Replace localStorage calls with API calls
async getProducts() {
  const response = await fetch(import.meta.env.VITE_API_URL + '/products');
  return response.json();
}

async createOrder(orderData) {
  const response = await fetch(import.meta.env.VITE_API_URL + '/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderData)
  });
  return response.json();
}
```

## Troubleshooting

### MongoDB Connection Failed
- Verify MongoDB URI in .env
- Check network access in MongoDB Atlas (IP whitelist)
- Ensure username and password are correct

### CORS Errors
- Check CORS_ORIGIN in .env matches frontend URL
- Ensure backend is running on correct port

### Port Already in Use
```bash
# Kill process on port 5000
npx kill-port 5000
```

## Next Steps

1. Set up Git repository for backend code
2. Deploy backend to services like:
   - Vercel (for serverless)
   - Heroku (paid plans)
   - AWS/Google Cloud
   - Railway.app (recommended)
   - Render.com

3. Update frontend API_URL to production backend URL

## Security Checklist

- [ ] Never commit .env file
- [ ] Use strong JWT_SECRET
- [ ] Validate all user inputs
- [ ] Sanitize database queries
- [ ] Use HTTPS in production
- [ ] Implement rate limiting
- [ ] Add authentication middleware
- [ ] Hash passwords with bcrypt
- [ ] Setup CORS properly
- [ ] Enable MongoDB IP whitelist
