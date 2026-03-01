# Complete Payment System - Quick Setup Guide

## ⚡ TL;DR - 3 Steps to Enable Payments

### Step 1: Get Razorpay API Keys
1. Go to https://dashboard.razorpay.com/app/website-app-settings/api-keys
2. Copy your **Test Key ID** and **Test Key Secret**
3. Save them somewhere safe

### Step 2: Configure Environment Variables

**Backend** (`backend/.env`):
```
RAZORPAY_KEY_ID=rzp_test_YOUR_KEY_ID_HERE
RAZORPAY_KEY_SECRET=YOUR_KEY_SECRET_HERE
```

**Frontend** (`frontend/.env`):
```
VITE_RAZORPAY_KEY_ID=rzp_test_YOUR_KEY_ID_HERE
VITE_API_URL=http://localhost:5000
```

### Step 3: Restart Servers
```bash
# Terminal 1: Backend
cd backend
npm install razorpay  # If not already installed
npm start

# Terminal 2: Frontend
cd frontend
npm run dev
```

## ✅ Test the Payment Flow

1. Go to http://localhost:5173
2. Add items to cart
3. Go to checkout
4. Fill in the form with test data
5. Click "Proceed to Payment"
6. **Razorpay popup opens** - Use test card:
   - **Card Number**: 4111 1111 1111 1111
   - **Expiry**: Any date in future
   - **CVV**: Any 3 digits
7. Click "Pay" - Should see success message
8. Check that order was created in database ✅

## 📋 What's Installed

### Backend
- ✅ `razorpayService.js` - All payment operations
- ✅ `payments.js` - 5 payment API endpoints
- ✅ Order model extended with payment fields
- ✅ Webhook endpoint for Razorpay events
- ✅ 160+ lines of production-grade code

### Frontend  
- ✅ `initiateBackendRazorpayPayment()` - Complete payment flow
- ✅ `verifyPaymentOnBackend()` - Signature verification
- ✅ CheckoutPage updated with backend integration
- ✅ Demo mode fallback if keys not configured

## 🔐 Security Features

✅ **No Money Lost**: Orders created BEFORE payments  
✅ **Can't Fake Payments**: HMAC-SHA256 signature verification  
✅ **Amount Always Correct**: Validated at 3 points (order, checkout, verify)  
✅ **Audit Trail**: Every transaction logged  
✅ **Signature Verified Twice**: On frontend receipt + backend API call  

## 📊 Payment Flow

```
Customer Checkout
    ↓
Backend creates Order (status=pending)
    ↓
Backend creates Razorpay Order
    ↓
Frontend opens Razorpay Popup
    ↓
Customer pays with card
    ↓
Razorpay returns payment ID + signature
    ↓
Frontend verifies signature with backend
    ↓
Backend confirms with Razorpay API
    ↓
Order marked as "completed"
    ↓
Webhook handles async confirmation
    ↓
Customer sees order confirmation page ✅
```

## 🧪 Test Cards

**Success**: 4111 1111 1111 1111  
**Failure**: 4242 4242 4242 4242  
**OTP**: Use any 6 digits when prompted

## 🚀 Next Steps

1. **Add Email Notifications**: Send confirmation after payment
2. **Add Admin Refund UI**: Easy button to refund orders
3. **Track Payment History**: Show customers all their orders
4. **Enable Rate Limiting**: Prevent abuse on order creation
5. **Configure Webhook** (optional but recommended):
   - Go to: https://dashboard.razorpay.com/app/webhooks
   - Add URL: `https://yourdomain.com/api/payments/webhook`
   - Select events: payment.authorized, payment.captured, payment.failed
   - This allows Razorpay to notify you of payment status

## 📁 Files Created/Modified

### New Files
- `backend/services/razorpayService.js` - Payment service (162 lines)
- `backend/routes/payments.js` - Payment endpoints (480+ lines)
- `RAZORPAY_PRODUCTION_SETUP.md` - Detailed setup guide
- `FRONTEND_PAYMENT_INTEGRATION.md` - Frontend integration guide

### Modified Files
- `backend/models/Order.js` - Added payment tracking fields
- `backend/index.js` - Registered payment routes
- `frontend/src/app/pages/CheckoutPage.tsx` - Updated payment flow
- `frontend/src/app/services/razorpay.ts` - Added backend integration

## ⚠️ Important Notes

- **Test Mode**: Keys starting with `rzp_test_` are for testing only
- **No Real Charges**: Test payments don't charge real money
- **Switch to Live**: When going public, update to live keys (`rzp_live_`)
- **HTTPS Required**: Razorpay requires HTTPS in production
- **Keep Secrets**: Never commit `.env` files to git

## 🐛 Troubleshooting

### "Razorpay is not configured"
→ Check `VITE_RAZORPAY_KEY_ID` in frontend/.env  
→ Restart frontend server  

### "Failed to create order"
→ Check backend .env has RAZORPAY_KEY_ID and KEY_SECRET  
→ Restart backend server  

### "Payment verification failed"
→ Make sure you have latest code from both services  
→ Check backend logs for detailed error

### "Order created but no payment?"
→ Check backend logs for webhook processing  
→ Verify internet connection

## 📈 Monitoring

Check these for issues:
- **Frontend Console** (F12): JavaScript errors
- **Backend Terminal**: Payment processing logs
- **Database**: Order records and payment status
- **Razorpay Dashboard**: Payment confirmations

## 📞 Support

- See `RAZORPAY_PRODUCTION_SETUP.md` for backend details
- See `FRONTEND_PAYMENT_INTEGRATION.md` for frontend details
- Check Razorpay docs: https://razorpay.com/docs/

---

**You now have a production-grade payment system!** 🎉

Next time customer fills checkout → Payment happens securely → Order saved → Everyone's happy ✅
