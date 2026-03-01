# Razorpay Production Setup Guide

## Overview
This guide provides production-grade Razorpay integration with:
- ✅ Secure payment processing
- ✅ Webhook signature verification
- ✅ Payment verification
- ✅ Refund handling
- ✅ Order management
- ✅ Database integrity

## Backend Environment Setup

### 1. Install Razorpay SDK
```bash
cd backend
npm install razorpay
```

### 2. Add Environment Variables to `.env`

Create or update your `.env` file in the backend directory:

```env
# Razorpay Configuration
RAZORPAY_KEY_ID=rzp_test_your_key_id_here
RAZORPAY_KEY_SECRET=rzp_test_your_key_secret_here

# Node Environment
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/aura-clothing

# Log Level (optional)
LOG_LEVEL=info
```

### 3. Get Your Razorpay Credentials

#### For Testing:
1. Sign up at https://razorpay.com
2. Go to Dashboard: https://dashboard.razorpay.com
3. Navigate to **Settings → API Keys**
4. Copy both **Key ID** and **Key Secret** from the Test section
5. Replace `rzp_test_xxx` placeholders in `.env`

#### Test Card Numbers:
- **Success (Visa):** 4111 1111 1111 1111
- **Failed (Visa):** 4000 0000 0000 0002
- **Expiry:** Any future date (MM/YY)
- **CVV:** Any 3-4 digit number

## API Endpoints

### 1. Create Order
**POST** `/api/payments/create-order`

**Request:**
```json
{
  "customerName": "John Doe",
  "customerEmail": "john@example.com",
  "customerPhone": "+919876543210",
  "items": [
    {
      "productId": "60d5ec49c1234567890abcd1",
      "productName": "Summer Shirt",
      "sku": "SUM-001",
      "quantity": 2,
      "price": 1299,
      "image": "https://..."
    }
  ],
  "subtotal": 2598,
  "discount": 100,
  "shipping": 99,
  "shippingAddress": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "orderId": "60d5ec49c1234567890abcd1",
    "orderNumber": "ORD-1234567890123",
    "razorpayOrderId": "order_1234567890123",
    "amount": 2597,
    "currency": "INR"
  }
}
```

### 2. Verify Payment
**POST** `/api/payments/verify`

**Request:**
```json
{
  "orderId": "60d5ec49c1234567890abcd1",
  "razorpayPaymentId": "pay_1234567890123",
  "razorpaySignature": "signature_hash_here"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment verified successfully",
  "data": {
    "orderId": "60d5ec49c1234567890abcd1",
    "orderNumber": "ORD-1234567890123",
    "paymentStatus": "completed",
    "status": "processing"
  }
}
```

### 3. Webhook Endpoint
**POST** `/api/payments/webhook`

Razorpay will send payment events to this endpoint:

**Events handled:**
- `payment.authorized` - Payment authorized
- `payment.captured` - Payment captured
- `payment.failed` - Payment failed
- `refund.created` - Refund initiated
- `refund.processed` - Refund completed

### 4. Process Refund
**POST** `/api/payments/refund`

**Request:**
```json
{
  "orderId": "60d5ec49c1234567890abcd1",
  "amount": 2597  // Optional: omit for full refund
}
```

### 5. Get Payment Status
**GET** `/api/payments/:orderId`

**Response:**
```json
{
  "success": true,
  "data": {
    "orderId": "60d5ec49c1234567890abcd1",
    "orderNumber": "ORD-1234567890123",
    "razorpayOrderId": "order_xxx",
    "razorpayPaymentId": "pay_xxx",
    "paymentStatus": "completed",
    "total": 2597,
    "refundId": null,
    "refundAmount": 0,
    "refundStatus": "none"
  }
}
```

## Webhook Configuration (Production)

### Setup Razorpay Webhook

1. Go to **Razorpay Dashboard** → **Settings** → **Webhooks**
2. Click **Add new webhook**
3. Enter webhook URL:
   ```
   https://yourdomain.com/api/payments/webhook
   ```
4. Select events:
   - ✅ payment.authorized
   - ✅ payment.captured
   - ✅ payment.failed
   - ✅ refund.created
   - ✅ refund.processed

5. Click **Create webhook**

### Production Webhook URL Examples:
- Live: `https://app.auraclothings.com/api/payments/webhook`
- Staging: `https://staging.auraclothings.com/api/payments/webhook`

## Frontend Integration

### Update Checkout Page (CheckoutPage.tsx)

```typescript
// Use the new payment endpoints
const handlePayment = async () => {
  try {
    // Step 1: Create order on backend
    const createOrderRes = await fetch('/api/payments/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerName,
        customerEmail,
        customerPhone,
        items: cartItems,
        subtotal,
        discount,
        shipping,
        shippingAddress
      })
    });

    const orderData = await createOrderRes.json();
    if (!orderData.success) throw new Error(orderData.message);

    // Step 2: Open Razorpay checkout
    const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;
    const options = {
      key: razorpayKey,
      amount: orderData.data.amount * 100, // Convert to paise
      order_id: orderData.data.razorpayOrderId,
      handler: async (response) => {
        // Step 3: Verify payment on backend
        const verifyRes = await fetch('/api/payments/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: orderData.data.orderId,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature
          })
        });

        const verifyData = await verifyRes.json();
        if (verifyData.success) {
          // Payment successful
          navigate(`/order-confirmation/${orderData.data.orderId}`);
        } else {
          alert('Payment verification failed: ' + verifyData.message);
        }
      }
    };

    const razorpay = new window.Razorpay(options);
    razorpay.open();
  } catch (error) {
    console.error('Payment error:', error);
    alert('Payment failed: ' + error.message);
  }
};
```

## Security Best Practices

### ✅ Implemented:
1. **Signature Verification** - Validates payment signatures with HMAC-SHA256
2. **Amount Validation** - Verifies payment amount matches order total
3. **Status Verification** - Confirms payment is captured/authorized
4. **Database Atomicity** - Creates order before Razorpay order to prevent orphaned records
5. **Logging** - Comprehensive logging for audit trails
6. **Error Handling** - Secure error messages (no sensitive data in production)
7. **Webhook Handling** - Multiple payment verification layers

### ⚠️ Additional Recommendations:
1. **Use HTTPS only** - Ensure webhook URL is HTTPS
2. **Validate Webhook IP** - Add IP whitelisting for Razorpay IPs (optional)
3. **Rate Limiting** - Add rate limiting to prevent abuse
4. **Authentication** - Add user authentication to order endpoints
5. **Encryption** - Store sensitive payment data encrypted
6. **PCI Compliance** - Never store full credit card details

## Testing Checklist

- [ ] Test successful payment with test card
- [ ] Test failed payment scenario
- [ ] Test payment verification endpoint
- [ ] Test refund endpoint
- [ ] Test webhook delivery
- [ ] Test edge cases (network errors, timeouts)
- [ ] Verify database updates correctly
- [ ] Check logs for all transactions
- [ ] Test with multiple simultaneous payments

## Troubleshooting

### Issue: "Razorpay is not configured"
**Solution:** Ensure `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` are set in `.env`

### Issue: "Signature verification failed"
**Solution:** Verify that the correct `RAZORPAY_KEY_SECRET` is being used

### Issue: "Payment amount mismatch"
**Solution:** Check that order total calculation matches payment amount in paise conversion

### Issue: Webhook not being received
**Solution:**
1. Ensure webhook URL is publicly accessible
2. Check firewall/security groups
3. Verify webhook is created in Razorpay dashboard
4. Check backend logs for errors

## Production Deployment

### Pre-deployment Checklist:
- [ ] Switch to Live API keys in `.env`
- [ ] Test with live card numbers
- [ ] Configure production webhook URL
- [ ] Set `NODE_ENV=production`
- [ ] Enable HTTPS
- [ ] Set up monitoring and alerting
- [ ] Review all logs and audit trails
- [ ] Load test payment endpoints
- [ ] Test refund functionality
- [ ] Backup database before deployment

## Support & Resources

- Razorpay Docs: https://razorpay.com/docs/
- API Reference: https://razorpay.com/docs/api/
- Webhook Guide: https://razorpay.com/docs/webhooks/
- Integration Guide: https://razorpay.com/docs/integration/payments/
- Test Cards: https://razorpay.com/docs/testing/

---

**Last Updated:** March 2026
**Status:** ✅ Production Ready
