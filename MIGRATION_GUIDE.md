/**
 * MIGRATION GUIDE: Moving from old structure to monorepo
 * 
 * The monorepo structure is now set up. Follow these steps to complete the migration:
 */

// STEP 1: Copy frontend source files
// Copy the entire contents of the root 'src/' directory to 'frontend/src/'
// Command (PowerShell):
// Copy-Item -Path "src\*" -Destination "frontend\src" -Recurse

// STEP 2: Copy any shared configuration files still at root
// The following have been copied to frontend/:
// ✓ vite.config.ts
// ✓ postcss.config.mjs  
// ✓ index.html
// ✓ tsconfig.json
// ✓ tsconfig.node.json

// STEP 3: Update environment variables
// Create frontend/.env with any frontend-specific variables:
// Example: VITE_API_URL=http://localhost:5000

// STEP 4: Update backend API calls
// In your frontend code, make sure API calls point to /api/*
// Example:
// fetch('/api/products')
// fetch('/api/orders')
// etc.

// STEP 5: Install dependencies
// Run: pnpm install
// This will install dependencies for both frontend and backend

// STEP 6: Test development setup
// Run: pnpm dev
// This should start both the Vite dev server and Express backend

// STEP 7: Build for production
// Run: pnpm build
// Frontend will build to frontend/dist/

// STEP 8: Test production build
// Run: pnpm start
// The Express server will serve the static frontend from frontend/dist/

/**
 * Key Changes:
 * - Backend now serves static files from frontend/dist/
 * - API routes are still available at /api/*
 * - All non-API routes serve /index.html for client-side routing
 * - Users must refresh to get updates (no hot reload in production)
 */
