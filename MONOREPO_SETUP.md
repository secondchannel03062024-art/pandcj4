# Fabric Store Monorepo

A monorepo structure with a static frontend and Node.js backend serving static files.

## Structure

```
.
├── frontend/          # React/Vite frontend application
│   ├── src/          # Frontend source code
│   ├── dist/         # Built static files (generated)
│   └── package.json  # Frontend dependencies
├── backend/          # Express.js backend API
│   ├── models/       # MongoDB models
│   ├── routes/       # API routes
│   └── package.json  # Backend dependencies
└── package.json      # Monorepo configuration
```

## How It Works

1. **Frontend** (React + Vite): Builds to static HTML/CSS/JS in `frontend/dist/`
2. **Backend** (Express): 
   - Serves the static frontend files
   - Provides API endpoints at `/api/*`
   - Routes all non-API requests to `index.html` for client-side routing
   - Uses MongoDB for data persistence

When users request the site, they get the static files. When the app updates, users must refresh their browser to get the new version (no hot reloading in production).

## Installation

```bash
# Install dependencies for all workspaces
pnpm install
```

## Development

Run both frontend and backend in development mode:

```bash
pnpm dev
```

Or run them separately:

```bash
pnpm dev:frontend   # Vite dev server on port 5173
pnpm dev:backend    # Express server on port 5000
```

## Build

Build the production static site:

```bash
pnpm build
```

This:
1. Builds the frontend to `frontend/dist/`
2. Runs backend build (no-op for Node.js)

## Production

Run the production server:

```bash
pnpm start
```

The Express server will:
- Serve static files from `frontend/dist/`
- Provide API endpoints at `/api/*`
- Handle client-side routing by serving `index.html`

## API Health Check

```bash
GET /api/health
```

## Next Steps

You need to manually move your source files from the root `src/` directory into `frontend/src/`. The structure is already set up at `frontend/vite.config.ts` - just copy your React components and assets there.

### Migration Checklist

- [ ] Copy `src/*` to `frontend/src/`
- [ ] Copy `styles/*` to `frontend/src/styles/` (if exists)
- [ ] Copy `assets/*` to `frontend/src/assets/` (if exists)
- [ ] Run `pnpm install` to install all dependencies
- [ ] Test with `pnpm dev`
- [ ] Verify build output with `pnpm build`
- [ ] Test production server with `pnpm start`

## Environment Variables

Create `.env` files in both `frontend/` and `backend/`:

### `backend/.env`
```
MONGODB_URI=your_mongodb_connection_string
PORT=5000
```

### `frontend/.env` (optional)
```
VITE_API_URL=http://localhost:5000
```
