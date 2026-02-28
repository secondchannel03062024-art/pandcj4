# .env Configuration Guide

## Current Status

✅ **Frontend (React)**: Fully functional with localStorage
❓ **Backend (Node.js/Express)**: To be set up
❓ **MongoDB**: To be configured

## .env File Overview

Your `.env` file has been updated with complete configuration for both frontend and backend development.

### Frontend Environment Variables (VITE_*)

These are exposed to your React frontend (ALL VITE_ prefixed variables):

```env
# Application URLs
VITE_APP_NAME=P&C Texfab
VITE_APP_URL=http://localhost:5173
VITE_API_URL=http://localhost:5000/api          # Points to backend

# MongoDB Reference (for frontend developers)
VITE_MONGODB_URI=mongodb+srv://...              # Connection string
VITE_MONGODB_DATABASE=fabric_store              # Database name

# Payment & Services
VITE_PAYMENT_GATEWAY_KEY=                       # Razorpay public key
VITE_CLOUDINARY_CLOUD_NAME=                     # Image hosting
VITE_EMAIL_SERVICE_API_KEY=                     # Email service

# Feature Configuration
VITE_FREE_SHIPPING_THRESHOLD=2000                # Min order for free shipping (₹)
VITE_STANDARD_SHIPPING_COST=100                  # Default shipping cost (₹)
VITE_TAX_RATE=0.18                               # GST (18%)
VITE_CURRENCY_SYMBOL=₹

# Feature Flags
VITE_ENABLE_WISHLIST=true
VITE_ENABLE_REVIEWS=true
VITE_ENABLE_CHAT_SUPPORT=false
VITE_ENABLE_LOYALTY_PROGRAM=false

# Analytics
VITE_GOOGLE_ANALYTICS_ID=                       # Google Analytics
VITE_FACEBOOK_PIXEL_ID=                         # Facebook tracking

# Development
VITE_DEBUG_MODE=true
VITE_MOCK_PAYMENTS=true
```

### Backend Environment Variables (Non-VITE)

These are for your Node.js backend server ONLY:

```env
# MongoDB Connection (CRITICAL)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/fabric_store
MONGODB_DATABASE=fabric_store

# Server Configuration
PORT=5000
NODE_ENV=development

# Security
JWT_SECRET=your_strong_jwt_secret_32_chars_or_more

# Email (for order notifications)
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password

# Payment Processing
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret

# Image Hosting
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Cross-Origin Settings
CORS_ORIGIN=http://localhost:5173
```

## How to Get API Keys/Credentials

### 🌍 MongoDB Atlas (Database)
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create cluster → Click "Connect"
4. Choose "Connect Your Application"
5. Copy connection string: `mongodb+srv://username:password@cluster.mongodb.net/dbname`

### 💳 Razorpay (Payments)
1. Go to https://razorpay.com
2. Sign up → Dashboard
3. Copy Key ID and Key Secret from Settings

### ☁️ Cloudinary (Image Hosting)
1. Go to https://cloudinary.com
2. Sign up → Dashboard
3. Copy Cloud Name, API Key, API Secret

### 📧 Gmail (Email Service)
1. Enable 2-Factor Authentication
2. Create App Password at myaccount.google.com/apppasswords
3. Use app password in EMAIL_PASSWORD

### 📊 Google Analytics
1. Go to https://analytics.google.com
2. Create property → Get Measurement ID

### 📱 Razorpay (already listed above)

## Current Architecture

### Development Mode (Current)
```
React App (Port 5173)
    ↓
localStorage (Browser storage)
    ↓
Seed Data (from seedData.ts)
```

**Status**: ✅ Working - no backend needed
**Use Case**: Development, testing, demo

### Production Mode (To Be Implemented)
```
React App (Port 5173)
    ↓ (API calls)
Node.js Backend (Port 5000)
    ↓ (Database queries)
MongoDB Atlas
    ↓ (Stores)
Collections: products, orders, users, coupons, categories
```

**Status**: 🔄 In Progress
**Use Case**: Production, real data, user management

## Quick Start Checklist

### ✅ Frontend (Already Done)
- [x] Install dependencies: `npm install`
- [x] Create .env file with configuration
- [x] Run dev server: `npm run dev`
- [x] Visit: http://localhost:5173

### 📝 Backend Setup (Next Steps)
- [ ] Create backend folder: `mkdir fabric-store-backend`
- [ ] Initialize project: `npm init -y`
- [ ] Install backend dependencies
- [ ] Create MongoDB Atlas account and get URI
- [ ] Set up backend files (server.js, models, routes)
- [ ] Create backend .env file with credentials
- [ ] Run backend: `npm run dev`
- [ ] Test API endpoints: http://localhost:5000/api

### 🗄️ Database Setup (Required for Backend)
- [ ] Sign up at https://www.mongodb.com/cloud/atlas
- [ ] Create cluster
- [ ] Get connection URI
- [ ] Add to backend .env as MONGODB_URI
- [ ] Whitelist IP address in Atlas

## Environment Variables Assignment

| Where | Variable | Example | Required |
|-------|----------|---------|----------|
| Frontend (.env) | VITE_API_URL | http://localhost:5000/api | ✅ |
| Frontend (.env) | VITE_PAYMENT_GATEWAY_KEY | rzp_test_xxx | If using payments |
| Backend (backend/.env) | MONGODB_URI | mongodb+srv://... | ✅ |
| Backend (backend/.env) | RAZORPAY_KEY_SECRET | secret_xxx | If using payments |
| Backend (backend/.env) | JWT_SECRET | any_strong_string_32_chars | ✅ |
| Backend (backend/.env) | PORT | 5000 | ✅ |
| Backend (backend/.env) | CORS_ORIGIN | http://localhost:5173 | ✅ |

## Database Status Check

To check which database is being used, open browser console and paste:

```javascript
import { getDatabaseStatus } from './app/services/database-enhanced.ts';
console.log(getDatabaseStatus());
```

Output will show:
- **Current**: "localStorage (Development)"
- **When backend ready**: "MongoDB API (Production)"

## Switching Between localStorage and MongoDB

### Currently (Using localStorage)
- Data stored in browser
- No backend needed
- Data lost on browser clear
- Perfect for development

### After Backend Setup (Using MongoDB)
1. Update `VITE_API_URL=http://localhost:5000/api`
2. Restart: `npm run dev`
3. Backend will handle API calls
4. Data persisted in MongoDB

## File Locations

| File | Location | Purpose |
|------|----------|---------|
| Frontend .env | `./` | React configuration |
| Backend .env | `./backend/` (to create) | Node.js configuration |
| Database service | `src/app/services/database.ts` | Current (localStorage) |
| Enhanced service | `src/app/services/database-enhanced.ts` | Ready for MongoDB |
| Setup guide | `MONGODB_BACKEND_SETUP.md` | Backend implementation |

## Common Issues & Solutions

### ❌ "Cannot find variable VITE_API_URL"
- **Cause**: Variable not in .env
- **Fix**: Check .env file has VITE_API_URL=...

### ❌ "Backend not responding"
- **Cause**: Backend server not running
- **Fix**: Run `npm run dev` in backend folder

### ❌ "MongoDB connection refused"
- **Cause**: URI invalid or IP not whitelisted
- **Fix**: Check Atlas whitelist and URI

### ❌ "CORS error from frontend"
- **Cause**: Backend CORS_ORIGIN mismatch
- **Fix**: Ensure backend .env has correct frontend URL

## Next Actions

1. **Immediate**: Use current .env (frontend works)
2. **Follow**: Backend setup guide in MONGODB_BACKEND_SETUP.md
3. **Deploy**: When ready, deploy to production services

## Support References

- Vite Env Variables: https://vitejs.dev/guide/env-and-mode.html
- MongoDB Setup: https://docs.mongodb.com/atlas/
- Express Guide: https://expressjs.com/
- CORS Configuration: https://expressjs.com/en/resources/middleware/cors.html

---

**Status**: ✅ Frontend ready | ⏳ Backend to be set up | 📅 MongoDB to be configured
