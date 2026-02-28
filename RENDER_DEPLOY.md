# Render Deployment Guide

## Quick Setup

1. **Push to GitHub** (already done):
   ```powershell
   git push origin main
   ```

2. **Go to [render.com](https://render.com)**
   - Sign in with GitHub
   - Click **New+** → **Web Service**
   - Select your repo `pandcj` (branch: `main`)
   - Click **Connect**

3. **Configure the service:**
   - **Name:** `fabric-store` (or anything you want)
   - **Environment:** Node
   - **Build Command:** `pnpm install && pnpm build`
   - **Start Command:** `pnpm start`
   - **Plan:** Free or Starter (your choice)

4. **Set Environment Variables:**
   Click **Environment** and add:
   ```
   MONGODB_URI = your_mongodb_connection_string
   NODE_ENV = production
   PORT = 5000
   ```

5. **Deploy:**
   - Click **Create Web Service**
   - Wait for build to complete (~2-5 minutes)
   - Get your URL: `https://your-service-name.onrender.com`

## Auto-Deployment

The `render.yaml` file automatically configures:
- ✅ Auto-deploy on `main` branch pushes
- ✅ Health check at `/api/health`
- ✅ Build cache enabled
- ✅ Proper build & start commands

## Custom Domain

After deployment:
1. Go to your service **Settings**
2. Scroll to **Custom Domain**
3. Add your domain (e.g., `yourdomain.com`)
4. Update DNS:
   ```
   Type: CNAME
   Name: @ (or www)
   Value: your-service-name.onrender.com
   ```
5. Wait 24-48 hours for DNS to propagate

## How It Works

```
GitHub push (main branch)
    ↓
Render detects change
    ↓
Runs: pnpm install && pnpm build
    ↓
Frontend builds → frontend/dist/
    ↓
Runs: pnpm start
    ↓
Express server starts
    ↓
Serves frontend from frontend/dist/
Serves API from /api/*
    ↓
Your domain (e.g., yourdomain.com)
```

## MongoDB Connection

Make sure your `.env` has:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/databasename
```

Then add this exact value in Render dashboard → Environment Variables.

## Troubleshooting

**Build fails?**
- Check logs in Render dashboard
- Ensure all files are committed to GitHub
- Run locally first: `pnpm install && pnpm build && pnpm start`

**Can't connect to database?**
- Verify MONGODB_URI in Render environment variables
- Check MongoDB connection string is correct
- Whitelist Render IP in MongoDB Atlas (or 0.0.0.0 for free tier)

**Frontend not loading?**
- Check `/api/health` endpoint works
- Verify frontend/dist/ created during build
- Check Express is serving static files properly

## Monitor Deployments

In Render dashboard:
- **Logs**: Real-time server logs
- **Metrics**: CPU, memory, bandwidth usage
- **Deploys**: Deployment history
- **Events**: All activity

Now just push and deploy! 🚀
