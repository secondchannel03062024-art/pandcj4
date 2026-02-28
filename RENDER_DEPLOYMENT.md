# Deployment to Render - Complete Guide

This monorepo contains both the React frontend and Express backend in a single deployment on Render.

## Prerequisites

- GitHub account with your code pushed
- Render account (https://render.com)
- MongoDB Atlas account with connection string
- Any other API keys (Razorpay, Cloudinary, etc.)

## Step-by-Step Deployment

### 1. Prepare Your Repository

Ensure all files are committed and pushed to GitHub:

\`\`\`bash
git add .
git commit -m "Setup monorepo for Render deployment"
git push origin master
\`\`\`

### 2. Create a New Web Service on Render

1. Go to [https://render.com/dashboard](https://render.com/dashboard)
2. Click **+ New** → **Web Service**
3. Connect your GitHub repository (`preetbiswas12/pandcj`)
4. Choose the branch: **master**
5. Fill in the configuration:

**Name:** `fabric-store` (or any name you prefer)

**Runtime:** Node

**Build Command:**
\`\`\`
pnpm install && pnpm build
\`\`\`

**Start Command:**
\`\`\`
pnpm start
\`\`\`

**Instance Type:** Free (or higher for better performance)

### 3. Add Environment Variables

In the Render dashboard, go to **Environment** and add all variables from your \`.env\` file:

**Backend Variables (Required):**
- \`MONGODB_URI\` - Your MongoDB connection string
- \`PORT\` - Set to 5000
- \`NODE_ENV\` - Set to production
- \`CORS_ORIGIN\` - Set to your Render URL (e.g., \`https://your-app.onrender.com\`)
- \`JWT_SECRET\` - A strong secret key
- \`RAZORPAY_KEY_ID\` - Your Razorpay key
- \`RAZORPAY_KEY_SECRET\` - Your Razorpay secret
- \`CLOUDINARY_CLOUD_NAME\` - Your Cloudinary cloud name
- \`CLOUDINARY_API_KEY\` - Your Cloudinary API key
- \`CLOUDINARY_API_SECRET\` - Your Cloudinary API secret

**Frontend Variables (Optional but Recommended):**
- \`VITE_API_URL\` - Should be your Render URL (e.g., \`https://your-app.onrender.com/api\`)
- \`VITE_RAZORPAY_KEY_ID\` - Public Razorpay key for frontend
- \`VITE_CLOUDINARY_CLOUD_NAME\` - Cloudinary cloud name
- Any other VITE_* variables from your .env file

### 4. Deploy

Click **Create Web Service** and Render will:
1. Install dependencies (\`pnpm install\`)
2. Build the frontend (\`pnpm build\`)
3. Start the server (\`pnpm start\`)
4. Serve everything from your URL

### 5. Verify Deployment

After deployment completes:

1. Visit your app URL (e.g., \`https://your-app.onrender.com\`)
2. Check API connectivity: Visit \`https://your-app.onrender.com/api/health\`
3. Test a product page: Visit \`https://your-app.onrender.com\` and navigate around

## What Happens During Deployment

1. **Build Phase:**
   - \`pnpm install\` - Installs dependencies for both frontend and backend
   - \`pnpm build\` - Builds React frontend to \`frontend/dist/\`

2. **Start Phase:**
   - \`pnpm start\` - Starts Express server on port 5000
   - Express serves static files from \`frontend/dist/\`
   - API routes available at \`/api/*\`

3. **User Accesses App:**
   - Frontend static files are served
   - API calls go to \`/api/*\` endpoints
   - Non-API routes serve \`index.html\` for client-side routing

## Updating After Deployment

Simply push to GitHub:

\`\`\`bash
git add .
git commit -m "Update content"
git push origin master
\`\`\`

Render will automatically redeploy your app.

## Troubleshooting

### App won't start
1. Check logs on Render dashboard
2. Verify all required environment variables are set
3. Ensure MongoDB URI is correct (check Atlas whitelist IPs if needed)

### Static files not loading
- Clear browser cache (Ctrl+Shift+Delete)
- Rebuild on Render (Deploy → Latest Release → Trigger Deploy)

### API calls failing
1. Check \`VITE_API_URL\` in frontend .env
2. Verify \`CORS_ORIGIN\` in backend .env (should be your Render URL)
3. Check API routes are working: \`curl https://your-app.onrender.com/api/health\`

### MongoDB connection errors
1. Go to MongoDB Atlas → Network Access
2. Add Render IP address or allow \`0.0.0.0/0\`
3. Ensure connection string has correct credentials

## Production Checklist

- [ ] All environment variables set on Render
- [ ] MongoDB Atlas allows connections from Render
- [ ] CORS is configured correctly
- [ ] API routes are accessible
- [ ] Frontend loads and API calls work
- [ ] Payment gateway configured (Razorpay)
- [ ] Image uploads work (Cloudinary)

## Important Notes

⚠️ **Static Site Behavior:**
- When you update the app, users must **refresh** their browser to see changes
- There's no hot reload in production
- This is normal for static sites

🔄 **Deployment Frequency:**
- Free tier on Render spins down after 15 minutes of inactivity
- Your app will be slow to start on first request
- Upgrade to paid tier for always-on performance

💾 **Data Persistence:**
- All data is stored in MongoDB, not in the app
- Data persists even if app redeployed
- No data loss on updates

## Next Steps

1. Push your code to GitHub
2. Create Render Web Service
3. Set environment variables
4. Deploy and test
5. Share your app URL!
