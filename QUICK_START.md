# Quick Start Guide

Follow these steps to get your monorepo working locally, then deploy to Render.

## 1. Install Dependencies (First Time Only)

```powershell
cd C:\Users\preet\Downloads\pandcj4
pnpm install
```

This installs dependencies for both frontend and backend.

## 2. Test Locally

```powershell
# Run both frontend dev server and backend
pnpm dev

# OR run separately:
# pnpm dev:frontend  # Frontend: http://localhost:5173
# pnpm dev:backend   # Backend: http://localhost:5000
```

Visit `http://localhost:5173` to test the frontend.

## 3. Build for Production

```powershell
pnpm build
```

This builds the React frontend to `frontend/dist/`.

## 4. Test Production Build Locally

```powershell
pnpm start
```

Visit `http://localhost:5000` - You should see your complete app!

Test the app:
- [ ] Homepage loads
- [ ] Can click products
- [ ] Product details page works
- [ ] Shopping cart works
- [ ] API calls work (check browser DevTools Network tab)

## 5. Deploy to Render

### Step 1: Push to GitHub
```powershell
git add .
git commit -m "Setup monorepo"
git push origin master
```

### Step 2: Go to Render.com
1. Login to [render.com](https://render.com)
2. Click **+ New** → **Web Service**
3. Connect GitHub (preetbiswas12/pandcj)

### Step 3: Configure

Fill in these fields:

- **Name:** `fabric-store`
- **Runtime:** Node
- **Build Command:** `pnpm install && pnpm build`
- **Start Command:** `pnpm start`
- **Instance Type:** Free (or paid for better performance)

### Step 4: Add Environment Variables

Click **Environment** and paste your `.env` values:

**From `backend/.env`:**
- `MONGODB_URI`
- `PORT=5000`
- `NODE_ENV=production`
- `JWT_SECRET`
- `CORS_ORIGIN` = Your Render URL (e.g., `https://fabric-store.onrender.com`)
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

### Step 5: Deploy

Click **Create Web Service**

Render will:
1. Clone your repo
2. Install dependencies
3. Build the app
4. Start the server
5. Give you a URL!

### Step 6: Test Your Deployment

After deployment completes:

1. Visit your Render URL (e.g., `https://fabric-store.onrender.com`)
2. App should load
3. Try:
   - [ ] View products
   - [ ] Click product details
   - [ ] Use shopping cart
   - [ ] Check API: Visit `/api/health` in the URL

## Troubleshooting

### App won't build
- Check Render logs
- Ensure `pnpm` is available (it should be)
- Verify all files are committed to Git

### App won't start
- Check if MongoDB URI is correct
- Verify all environment variables are set
- Check database connection in MongoDB Atlas (IP whitelist)

### Static files not loading
- Clear browser cache (Ctrl+Shift+Delete)
- Check that `frontend/dist/` was created during build
- Look at Render build logs

### API calls failing
- Ensure `CORS_ORIGIN` is set to your Render URL
- Verify `VITE_API_URL` in production
- Check backend logs for errors

## File Locations Reference

- **Frontend code:** `frontend/src/`
- **Backend code:** `backend/`
- **Frontend config:** `frontend/vite.config.ts`
- **Backend config:** `backend/index.js`
- **Frontend .env:** `frontend/.env`
- **Backend .env:** `backend/.env`
- **Root config:** `package.json` (monorepo)

## Common Commands

```powershell
# Install dependencies
pnpm install

# Develop locally (both frontend + backend)
pnpm dev

# Build frontend for production
pnpm build

# Start production server
pnpm start

# Seed database
pnpm seed

# Run only frontend
pnpm dev:frontend

# Run only backend
pnpm dev:backend
```

## Need Help?

Read these files in order:
1. **SETUP_SUMMARY.md** - Overview of changes
2. **MONOREPO_SETUP.md** - How monorepo works
3. **RENDER_DEPLOYMENT.md** - Detailed deployment guide
4. **PRE_DEPLOYMENT_CHECKLIST.md** - Verification steps

## You're Done! 🎉

Your app is now deployed on Render with:
- ✓ Frontend and backend in one deployment
- ✓ No separate hosting needed
- ✓ One URL for everything
- ✓ Easy to update (just push to GitHub)

Every time you push to GitHub, Render automatically redeploys your app.

---

**Next:** Push to GitHub and start the Render deployment!

```powershell
git push origin master
```

Then follow Step 2-5 above.
