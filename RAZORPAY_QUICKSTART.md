# 🔧 Quick Start - Razorpay Configuration

## ⚠️ Important: Configure Razorpay for Payments

Your fabric e-commerce site is ready, but **payment processing requires configuration**.

### Option 1: Quick Test Setup (1 minute)

Add this test key to your `.env` file:

```env
VITE_RAZORPAY_KEY_ID=rzp_test_1234567890
```

Then restart the server:
```bash
npm run dev
```

### Option 2: Get Real Razorpay Keys (Recommended)

1. **Sign up**: https://razorpay.com
2. **Login**: https://dashboard.razorpay.com
3. **Get Keys**: Settings → API Keys → Generate Test Key
4. **Add to `.env`**:
   ```env
   VITE_RAZORPAY_KEY_ID=rzp_test_YOUR_ACTUAL_KEY
   ```
5. **Restart server**

### Test Cards (Test Mode Only)

Once configured, use these test cards:

**Success:**
- Card: `4111 1111 1111 1111`
- CVV: Any 3 digits
- Expiry: Any future date

**Failure:**
- Card: `4000 0000 0000 0002`

### Demo Mode (No Payment)

If you try to checkout without configuring Razorpay:
- You'll see a configuration error
- Click "OK" to continue in DEMO MODE
- Order will be created without payment
- Status will be "pending" instead of "completed"

### Full Documentation

See `RAZORPAY_SETUP.md` for complete setup guide.

---

**Note:** The `.env` file is in your project root. If it doesn't exist, copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
