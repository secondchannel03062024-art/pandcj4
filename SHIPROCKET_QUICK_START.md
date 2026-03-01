# Shiprocket Integration - Quick Start (3 Steps)

## ⚡ Fast Setup

### Step 1: Get Shiprocket API Key (5 minutes)
```
1. Go to: https://shiprocket.in
2. Login or create account
3. Dashboard → Settings → API
4. Copy your API key
5. Note your warehouse pincode (usually 400001 if in Mumbai)
```

### Step 2: Configure `.env` File (2 minutes)

**Edit `backend/.env`**:
```env
SHIPROCKET_API_KEY=paste_your_api_key_here
ORIGIN_PINCODE=400001  # Your warehouse location
```

### Step 3: Restart & Test (1 minute)

```bash
# Backend terminal
cd backend
npm install axios  # If not already installed
npm start
```

**Test in Checkout**:
1. Add items to cart
2. Go to checkout
3. Enter pincode: `400001`
4. Wait 1-2 seconds
5. See shipping calculation ✅

---

## ✅ What Changed

### Frontend
- ✅ Real-time shipping calculation on pincode entry
- ✅ Shows estimated delivery days
- ✅ Loads "Calculating..." message
- ✅ Updates order total automatically
- ✅ Shows free shipping message if eligible

### Backend
- ✅ Shiprocket API integration
- ✅ 4 new endpoints (calculate, check, rates, validate)
- ✅ Error handling with fallback costs
- ✅ Secure API key storage

### User Experience
```
Before: Fixed ₹100 shipping cost always
After:  Dynamic cost based on destination
        "Shipping: ₹45 - Delivery in 2-3 days"
```

---

## 🧪 Test Cases

| Pincode | Result |
|---------|--------|
| 400001 | ✅ Shipping calculated (e.g., ₹45) |
| 110001 | ✅ Shipping calculated (e.g., ₹50) |
| 560001 | ✅ Shipping calculated (e.g., ₹35) |
| 12345 | ❌ Invalid format error |
| 999999 | ⚠️ Not serviceable (uses ₹100) |

---

## 📊 Features

✅ **Real-time Calculation**
- Updates as customer types pincode
- Shows courier name and delivery days

✅ **Smart Defaults**
- Fallback to ₹100 if API fails
- Free shipping for orders > ₹2000

✅ **Validation**
- Format check (6 digits)
- Serviceability check
- Clear error messages

✅ **Performance**
- Caches results (5 minutes)
- Debounced calls (1 second)
- Fast API response

---

## 🚀 You're Ready!

The shipping integration is now live. Customers will see accurate shipping costs based on their address! 📦

### Next Steps (Optional):
- Configure webhook in Razorpay dashboard
- Set up email notifications
- Add tracking updates from Shiprocket

---

See `SHIPROCKET_SETUP_GUIDE.md` for complete documentation.
