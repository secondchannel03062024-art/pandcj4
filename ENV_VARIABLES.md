# Environment Variables Reference

## Frontend: `frontend/.env.local`

```dotenv
# Required for Clerk Authentication
VITE_CLERK_PUBLISHABLE_KEY=pk_test_Y29udGludWFibHktZGlyCgl...

# Optional but recommended
VITE_API_URL=https://auraclothings.qzz.io/api
```

### What to Fill In:

1. **VITE_CLERK_PUBLISHABLE_KEY**: 
   - Go to Clerk Dashboard → API Keys
   - Copy the **Publishable Key** (starts with `pk_`)
   - Paste it here
   - **This is already set in Render** ✅

2. **VITE_API_URL** (optional):
   - For local dev: `http://localhost:5000/api`
   - For production: `https://auraclothings.qzz.io/api`

---

## Backend: `backend/.env`

```dotenv
# Required for Clerk Token Verification (optional for basic setup)
CLERK_SECRET_KEY=sk_test_abc123xyz...
CLERK_PUBLISHABLE_KEY=pk_test_abc123xyz...

# Database
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname

# Payment Gateway
RAZORPAY_KEY_ID=rzp_test_abc123xyz
RAZORPAY_KEY_SECRET=rzp_test_secret_abc123xyz

# Shipping
SHIPROCKET_API_KEY=your_shiprocket_api_key
SHIPROCKET_USERNAME=your_shiprocket_username
SHIPROCKET_PASSWORD=your_shiprocket_password

# Cors and other
FRONTEND_URL=https://auraclothings.qzz.io
NODE_ENV=production
PORT=5000
```

### What to Fill In:

1. **CLERK_SECRET_KEY** & **CLERK_PUBLISHABLE_KEY**:
   - Go to Clerk Dashboard → API Keys
   - Copy **Secret Key** and **Publishable Key**
   - **Already set in Render** ✅

2. **MONGODB_URI**:
   - MongoDB connection string
   - **Already set in Render** ✅

3. **RAZORPAY_KEY_ID** & **RAZORPAY_KEY_SECRET**:
   - From Razorpay Dashboard
   - **Already set in Render** ✅

4. **SHIPROCKET_API_KEY**, **SHIPROCKET_USERNAME**, **SHIPROCKET_PASSWORD**:
   - From Shiprocket Dashboard
   - **Already set in Render** ✅

---

## Render Environment Setup ✅

All critical variables are **already set** in Render:

- ✅ `VITE_CLERK_PUBLISHABLE_KEY`
- ✅ `CLERK_SECRET_KEY`
- ✅ `CLERK_PUBLISHABLE_KEY`
- ✅ `MONGODB_URI`
- ✅ `RAZORPAY_KEY_ID`
- ✅ `RAZORPAY_KEY_SECRET`
- ✅ `SHIPROCKET_API_KEY`
- ✅ `SHIPROCKET_USERNAME`
- ✅ `SHIPROCKET_PASSWORD`
- ✅ `FRONTEND_URL`

---

## Verify Everything is Set

### In Render Dashboard:

1. Go to: https://dashboard.render.com/
2. Click your service
3. Click: **Environment**
4. You should see all the variables above

If any are missing:
1. Click **Add Environment Variable**
2. Fill in the key and value
3. Service will auto-redeploy

---

## For Local Development

### Create `frontend/.env.local`:

```bash
cd frontend
echo "VITE_CLERK_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE" > .env.local
```

### Create `backend/.env`:

```bash
cd backend
echo "CLERK_SECRET_KEY=sk_test_YOUR_KEY_HERE" > .env
echo "MONGODB_URI=your_mongodb_url" >> .env
echo "RAZORPAY_KEY_ID=your_razorpay_key" >> .env
# ... etc
```

Then start:

```bash
# Terminal 1
cd frontend && pnpm dev

# Terminal 2
cd backend && npm start
```

---

## OAuth Environment Variables

For Google OAuth to work, you need:

**In Google Cloud Console**:
- Client ID (from OAuth 2.0 credential)
- Client Secret (from OAuth 2.0 credential)

**In Clerk Dashboard** → Social Connections → Google:
- Client ID (paste here)
- Client Secret (paste here)

**You don't need to add these to `.env` files** - they're managed by Clerk!

---

## Troubleshooting Missing Variables

### Frontend won't start: "Missing Vite Variables"
- Check `frontend/.env.local` has `VITE_CLERK_PUBLISHABLE_KEY`
- Reload: `pnpm dev`

### Backend won't start: "Missing environment variables"
- Check `backend/.env` has all required variables
- Reload: `npm start`

### App not connecting to API
- Check `VITE_API_URL` in frontend matches your backend
- Local: `http://localhost:5000/api`
- Production: `https://auraclothings.qzz.io/api`

### OAuth not working
- Check Clerk Dashboard has all URL redirects configured
- Check Google Cloud has all redirect URIs
- See `OAUTH_CHECKLIST.md` for full troubleshooting

---

## Security Notes ⚠️

- **Never commit `.env` files** (they're in `.gitignore` ✅)
- **Never share secret keys** in Slack/GitHub/emails
- **Keep API keys private** - they're in Render environment only
- **Regenerate keys** if accidentally exposed

---

Need help finding a variable? Check:
- [Clerk Dashboard](https://dashboard.clerk.com/api-keys) → API Keys
- [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials
- [Razorpay Dashboard](https://dashboard.razorpay.com/) → Settings → API Keys
- [Shiprocket Dashboard](https://shiprocket.co/) → Settings → API Keys
