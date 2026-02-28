# Razorpay Payment Integration Guide

## 🚀 Quick Setup

### 1. Get Razorpay API Keys

1. **Sign up** for Razorpay account at [https://razorpay.com](https://razorpay.com)
2. **Login** to Razorpay Dashboard: [https://dashboard.razorpay.com](https://dashboard.razorpay.com)
3. Navigate to **Settings** → **API Keys**
4. Generate your **Test** or **Live** API keys

### 2. Configure Environment Variables

Add your Razorpay keys to `.env` file:

```env
# For TEST mode (development)
VITE_RAZORPAY_KEY_ID=rzp_test_your_key_id_here

# For LIVE mode (production)
VITE_RAZORPAY_KEY_ID=rzp_live_your_key_id_here
```

⚠️ **Important:** 
- Test keys start with `rzp_test_`
- Live keys start with `rzp_live_`
- Never commit your API keys to version control
- Use Test mode during development

### 3. Test the Integration

#### Test Cards for Razorpay Test Mode:

**Successful Payment:**
- Card Number: `4111 1111 1111 1111`
- CVV: Any 3 digits
- Expiry: Any future date
- Name: Any name

**Failed Payment:**
- Card Number: `4000 0000 0000 0002`
- CVV: Any 3 digits
- Expiry: Any future date

**Other Test Cards:**
- Mastercard: `5555 5555 5555 4444`
- Visa: `4012 8888 8888 1881`
- Amex: `3782 822463 10005`

## 📝 How It Works

### Payment Flow

1. **Customer fills checkout form** with shipping details
2. **Customer clicks "Proceed to Payment"** button
3. **Razorpay checkout modal opens** with payment options
4. **Customer completes payment** (Card/UPI/Netbanking/Wallet)
5. **On success:**
   - Order is created in database with `paymentStatus: 'completed'`
   - Cart is cleared
   - Customer is redirected to order confirmation page
   - Payment ID is displayed for reference
6. **On failure:**
   - Error message is shown
   - Customer can retry payment
   - No order is created

### Key Features

✅ **Secure Payment Gateway** - PCI DSS compliant  
✅ **Multiple Payment Methods** - Cards, UPI, Netbanking, Wallets  
✅ **Real-time Verification** - Instant payment confirmation  
✅ **Order Creation Only After Payment** - No unpaid orders in database  
✅ **Payment ID Tracking** - Each transaction has unique ID  
✅ **Automatic Currency Conversion** - Handles paise to rupee conversion  
✅ **Mobile Responsive** - Works on all devices  

## 🔧 Configuration Options

### Customize Payment UI

Edit `/src/app/services/razorpay.ts`:

```typescript
theme: {
  color: '#000000', // Change to your brand color
}
```

### Add Payment Notes

Notes are automatically added with customer details:

```typescript
notes: {
  customerName: 'John Doe',
  email: 'john@example.com',
  phone: '+919876543210',
}
```

## 🎯 Testing Checklist

- [ ] Razorpay key is configured in `.env`
- [ ] Checkout form accepts all required fields
- [ ] "Proceed to Payment" button opens Razorpay modal
- [ ] Test card payment completes successfully
- [ ] Order is created in database after payment
- [ ] Cart is cleared after successful payment
- [ ] Order confirmation page shows payment ID
- [ ] Failed payment shows error message
- [ ] User can retry failed payment

## 🔒 Security Best Practices

### Frontend Security
✅ Only public `key_id` is exposed to frontend  
✅ Never expose `key_secret` in frontend code  
✅ All payment verification happens on Razorpay servers  

### Backend Security (For Production)
⚠️ **Important for Production:**
- Set up a backend server to verify payment signatures
- Use `key_secret` only on backend server
- Implement webhook handlers for payment notifications
- Verify payment signature using Razorpay SDK

### Signature Verification (Backend Required)

```javascript
// Example backend verification (Node.js)
const crypto = require('crypto');

function verifyPaymentSignature(orderId, paymentId, signature, secret) {
  const body = orderId + '|' + paymentId;
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex');
  
  return expectedSignature === signature;
}
```

## 🌐 Production Deployment

### Switch to Live Mode

1. Get **Live API Keys** from Razorpay Dashboard
2. Update `.env`:
   ```env
   VITE_RAZORPAY_KEY_ID=rzp_live_your_live_key_id
   ```
3. Enable payment methods in Razorpay Dashboard
4. Complete KYC verification
5. Add business details
6. Set up webhooks for payment notifications

### Webhook Setup (Recommended for Production)

1. Go to Razorpay Dashboard → **Settings** → **Webhooks**
2. Add webhook URL: `https://yourdomain.com/api/razorpay/webhook`
3. Select events: `payment.authorized`, `payment.failed`
4. Save webhook secret for signature verification

## 📊 Order Tracking

Orders are automatically created with:

```typescript
{
  orderNumber: 'ORD-1234567890-ABCDE',
  status: 'processing', // Since payment is completed
  paymentStatus: 'completed',
  total: 2999.00,
  customerEmail: 'customer@example.com',
  items: [...],
  shippingAddress: {...}
}
```

## 💡 Troubleshooting

### Issue: Razorpay modal not opening
**Solution:** Check browser console for errors. Ensure Razorpay script is loaded.

### Issue: Payment fails immediately
**Solution:** Check API key is correct and matches mode (test/live).

### Issue: Order not created after payment
**Solution:** Check browser console and database service logs.

### Issue: "Key ID is not configured" error
**Solution:** Add `VITE_RAZORPAY_KEY_ID` to `.env` file and restart server.

## 📚 Additional Resources

- [Razorpay Checkout Documentation](https://razorpay.com/docs/payments/payment-gateway/web-integration/)
- [Test Mode Guide](https://razorpay.com/docs/payments/payments/test-card-details/)
- [API Reference](https://razorpay.com/docs/api/)
- [Webhook Guide](https://razorpay.com/docs/webhooks/)

## 🎉 Success!

Your Razorpay payment integration is complete! Customers can now:
- Complete secure payments
- See payment confirmation
- Track their orders
- Receive order confirmation emails (if configured)

Happy selling! 🛍️
