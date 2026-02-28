# Pre-Deployment Checklist

Use this checklist to ensure everything is configured correctly before deploying to Render.

## Frontend Configuration

- [x] Frontend package.json exists at `frontend/package.json`
- [x] Vite config at `frontend/vite.config.ts` configured to build to `dist/`
- [x] TypeScript config at `frontend/tsconfig.json`
- [x] PostCSS config at `frontend/postcss.config.mjs`
- [x] Entry HTML at `frontend/index.html`
- [x] Source code at `frontend/src/` with main.tsx
- [x] Frontend .env file exists at `frontend/.env`
- [x] Frontend .env.example exists at `frontend/.env.example`

**Verify Frontend Code:**
- [ ] All React components import correctly
- [ ] No hardcoded API URLs (should use config/env.ts)
- [ ] API calls use `config.api.url` from env.ts
- [ ] Environment variables properly configured

## Backend Configuration

- [x] Backend package.json exists at `backend/package.json`
- [x] Express main file at `backend/index.js`
- [x] Routes configured:
  - [x] `backend/routes/products.js`
  - [x] `backend/routes/orders.js`
  - [x] `backend/routes/coupons.js`
  - [x] `backend/routes/banners.js`
  - [x] `backend/routes/categories.js`
  - [x] `backend/routes/users.js`
- [x] Models configured:
  - [x] `backend/models/Product.js`
  - [x] `backend/models/Order.js`
  - [x] `backend/models/Coupon.js`
  - [x] `backend/models/Banner.js`
  - [x] `backend/models/Category.js`
  - [x] `backend/models/User.js`
- [x] Seed file at `backend/seed.js`
- [x] Backend .env file exists at `backend/.env`
- [x] Backend .env.example exists at `backend/.env.example`

**Verify Backend Code:**
- [ ] All required npm packages installed locally
- [ ] Database models properly defined
- [ ] API routes respond correctly
- [ ] CORS middleware configured
- [ ] Error handling implemented
- [ ] MongoDB connection works locally

## Monorepo Configuration

- [x] Root package.json configured with workspaces
- [x] Monorepo build scripts defined:
  - [x] `pnpm build` - builds frontend + backend
  - [x] `pnpm dev` - runs both dev servers
  - [x] `pnpm start` - starts production server
  - [x] `pnpm seed` - runs database seed
- [x] .gitignore configured for both applications
- [x] Documentation created:
  - [x] MONOREPO_SETUP.md
  - [x] RENDER_DEPLOYMENT.md
  - [x] STRUCTURE.md
  - [x] MIGRATION_GUIDE.md

## Testing Before Deployment

### Local Development Test

```bash
# Navigate to project root
cd C:\Users\preet\Downloads\pandcj4

# Install all dependencies
pnpm install

# Test frontend build
pnpm build

# Test production server
pnpm start
```

After running `pnpm start`:
- [ ] Frontend loads at `http://localhost:5000`
- [ ] API health check works: `http://localhost:5000/api/health`
- [ ] Product page loads: `http://localhost:5000` and click on products
- [ ] Product details load when clicking a product
- [ ] Shopping cart works
- [ ] User can navigate without errors

### API Testing

```bash
# Test API endpoints are accessible
curl http://localhost:5000/api/health
curl http://localhost:5000/api/products
curl http://localhost:5000/api/categories
curl http://localhost:5000/api/banners
```

All should return JSON responses without 404 errors.

## Environment Variables

### Required Frontend (.env in frontend/)
- [ ] VITE_APP_NAME
- [ ] VITE_APP_URL
- [ ] VITE_API_URL (http://localhost:5000/api for local)
- [ ] VITE_RAZORPAY_KEY_ID (if using Razorpay)
- [ ] VITE_CLOUDINARY_CLOUD_NAME (if using Cloudinary)
- [ ] VITE_CLERK_PUBLISHABLE_KEY (if using Clerk)

### Required Backend (.env in backend/)
- [ ] MONGODB_URI (MongoDB connection string)
- [ ] MONGODB_DATABASE
- [ ] PORT (5000)
- [ ] NODE_ENV (development for local, production for Render)
- [ ] CORS_ORIGIN (http://localhost:5173 for local)
- [ ] JWT_SECRET (strong secret, min 32 chars)
- [ ] RAZORPAY_KEY_ID (if using Razorpay)
- [ ] RAZORPAY_KEY_SECRET (if using Razorpay)
- [ ] CLOUDINARY_* (if using Cloudinary)

## GitHub Preparation

- [ ] All changes committed: `git add . && git commit -m "Setup monorepo"`
- [ ] Pushed to GitHub: `git push origin master`
- [ ] Branch protection rules (optional): Protect main/master branch
- [ ] .env files are NOT committed (check .gitignore)

## Render Deployment

- [ ] Render account created
- [ ] GitHub repository connected to Render
- [ ] Web Service configured with:
  - [ ] Build Command: `pnpm install && pnpm build`
  - [ ] Start Command: `pnpm start`
  - [ ] Node runtime selected
  - [ ] Environment variables added (all MONGODB_URI, JWT_SECRET, etc.)
- [ ] Deployment completed successfully
- [ ] App loads on Render URL
- [ ] API endpoints respond
- [ ] Frontend renders correctly

## Post-Deployment Verification

- [ ] Visit your Render URL in browser
- [ ] Frontend loads without errors (check browser console)
- [ ] Can navigate between pages
- [ ] API calls work (check network tab)
- [ ] Products load and display correctly
- [ ] Shopping cart functions
- [ ] Payment gateway loads (if implemented)
- [ ] Check Render logs for errors: `tail -f /var/log/app.log`

## Performance Checklist (After Deployment)

- [ ] Page loads in < 3 seconds
- [ ] No JavaScript errors in browser console
- [ ] Network requests complete successfully
- [ ] Images load properly from CDN (Cloudinary if used)
- [ ] Payment gateway loads (Razorpay)
- [ ] Database queries execute reasonably fast

## Security Checklist

- [ ] .env file NOT in git repository
- [ ] JWT_SECRET is strong and unique
- [ ] Database credentials never hardcoded
- [ ] CORS_ORIGIN matches deployment URL
- [ ] API keys properly secured
- [ ] HTTPS enabled on Render (automatic)
- [ ] MongoDB connection validated (check Atlas IP whitelist)

## Documentation Checklist

- [ ] README.md updated with deployment instructions
- [ ] RENDER_DEPLOYMENT.md created and reviewed
- [ ] .env.example files exist for reference
- [ ] API documentation exists (if needed)
- [ ] Know how to restart/redeploy on Render

## Troubleshooting Preparation

Before deployment, document:
- [ ] Render dashboard access and deployment URL
- [ ] MongoDB Atlas dashboard access
- [ ] API key management dashboard access
- [ ] GitHub repository URL
- [ ] Local clone of repository as backup

## Go/No-Go Decision

- [ ] All checklist items completed
- [ ] Local testing successful
- [ ] Environment variables prepared
- [ ] Ready to deploy to Render

**Status:** Ready to Deploy ✓
