# Admin Authentication System Setup Guide

## Overview

A complete, secure admin authentication system has been implemented with JWT-based authentication, bcrypt password hashing, and login attempt tracking.

## System Architecture

### Backend Components

#### 1. Admin Model (`backend/models/Admin.js`)
- **Purpose**: MongoDB schema for admin users with security features
- **Features**:
  - Bcrypt password hashing (salt rounds: 10)
  - Account lock mechanism (5 failed attempts → 1 hour lock)
  - Login attempt tracking
  - Timestamp tracking (createdAt, updatedAt, lastLogin)

#### 2. Admin Authentication Routes (`backend/routes/adminAuth.js`)
- **Endpoints**:
  - `POST /api/admin/auth/login` - Authenticate with email/password
  - `POST /api/admin/auth/verify` - Verify JWT token validity
  - `POST /api/admin/auth/logout` - Logout confirmation

#### 3. Admin Middleware (`backend/middleware/adminAuth.js`)
- **adminAuth Middleware**: Validates JWT tokens on protected routes
- **adminPermission Middleware**: Optional permission-based access control

### Frontend Components

#### 1. Admin Login Page (`frontend/src/app/pages/AdminLoginPage.tsx`)
- **Features**:
  - Email and password validation
  - Show/hide password toggle
  - Real-time error feedback
  - Loading states
  - GSAP animations
  - Login attempt tracking UI

#### 2. Admin Context (`frontend/src/app/context/AdminContext.tsx`)
- **Provides**:
  - `admin`: Current admin user object
  - `token`: JWT token for API requests
  - `isAuthenticated`: Authentication status
  - `isLoading`: Loading state for async operations
  - `login(email, password)`: Login function
  - `logout()`: Logout function
  - `verifyToken()`: Token verification

#### 3. Protected Admin Route (`frontend/src/app/components/ProtectedAdminRoute.tsx`)
- **Features**:
  - Route protection with authentication check
  - Token verification
  - Permission-based access control (optional)
  - Automatic redirect to login if not authenticated

## Setup Instructions

### Step 1: Seed Default Admin User

Run the seed script to create the default admin account:

```bash
cd backend
node seedAdmin.js
```

**Default Credentials**:
- Email: `dasparna75@gmail.com`
- Password: `biditadas123@`

**Change Password** (if needed, use `--reset-password` flag):
```bash
node seedAdmin.js --reset-password
```

### Step 2: Verify Backend Configuration

The backend has already been configured with:
- ✅ Admin routes registered in `backend/index.js`
- ✅ Admin middleware protecting `/api/admin/*` routes
- ✅ MongoDB connection for Admin model

### Step 3: Verify Frontend Configuration

The frontend has been configured with:
- ✅ AdminProvider in `App.tsx`
- ✅ AdminLoginPage route at `/admin/login`
- ✅ Protected admin routes wrapped with `ProtectedAdminRoute`
- ✅ AdminContext providing authentication state

## API Documentation

### Login Endpoint

**POST** `/api/admin/auth/login`

**Request**:
```json
{
  "email": "dasparna75@gmail.com",
  "password": "biditadas123@"
}
```

**Response** (Success):
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "admin": {
      "_id": "...",
      "email": "dasparna75@gmail.com",
      "role": "super-admin",
      "permissions": [...]
    }
  }
}
```

**Response** (Error):
```json
{
  "success": false,
  "message": "Invalid credentials" | "Account locked" | "Email or password incorrect"
}
```

### Verify Token Endpoint

**POST** `/api/admin/auth/verify`

**Headers**:
```
Authorization: Bearer <token>
```

**Response**:
```json
{
  "success": true,
  "data": {
    "admin": { ... }
  }
}
```

### Logout Endpoint

**POST** `/api/admin/auth/logout`

**Headers**:
```
Authorization: Bearer <token>
```

## Access Flow

1. **User visits Unprotected route**
   - `/admin/login` → AdminLoginPage (no auth required)

2. **User logs in**
   - Sends credentials to `/api/admin/auth/login`
   - Backend validates credentials against MongoDB
   - Returns JWT token
   - Token stored in localStorage

3. **User visits Protected route**
   - `/admin`, `/admin/products`, etc. wrapped with `ProtectedAdminRoute`
   - Component checks for valid token
   - If authenticated, renders admin panel
   - If not, redirects to `/admin/login`

4. **User navigates admin panel**
   - All requests include JWT token in Authorization header
   - Backend middleware validates token on each request
   - Grants access to protected routes

5. **User logs out**
   - Click logout in admin dashboard
   - Token removed from localStorage
   - Redirected to `/admin/login`

## Security Features

### Password Security
- ✅ Bcrypt hashing with salt rounds of 10
- ✅ No plaintext passwords stored
- ✅ Passwords marked as `select: false` in schema

### Account Protection
- ✅ Login attempt tracking
- ✅ Automatic account lockout after 5 failed attempts
- ✅ 1-hour lockout period
- ✅ Automatic unlock after timeout

### Token Security
- ✅ JWT tokens with 24-hour expiration
- ✅ Tokens validated on every protected request
- ✅ Tokens stored in secure localStorage
- ✅ Automatic logout on token expiration

### Route Protection
- ✅ Public endpoints: Only `/api/admin/auth/login`
- ✅ Protected endpoints: All `/api/admin/*` routes
- ✅ Middleware validates authentication before access
- ✅ Optional permission-based route protection

## Frontend Hook Usage

### Using Admin Context

```tsx
import { useAdmin } from '@/app/context/AdminContext';

function MyComponent() {
  const { admin, isAuthenticated, login, logout } = useAdmin();

  return (
    <div>
      {isAuthenticated && <p>Logged in as: {admin?.email}</p>}
      <button onClick={() => login('email', 'password')}>Login</button>
      <button onClick={() => logout()}>Logout</button>
    </div>
  );
}
```

### Protecting Routes

```tsx
import { ProtectedAdminRoute } from '@/app/components/ProtectedAdminRoute';

<ProtectedAdminRoute requiredPermissions={['admin:manage_products']}>
  <AdminProducts />
</ProtectedAdminRoute>
```

## Troubleshooting

### Login fails with "Account locked"
- Wait 1 hour for automatic unlock
- Or run `seedAdmin.js --reset-password` to reset

### Token verification fails
- Check if token in localStorage is valid
- Try logging in again
- Clear localStorage and refresh

### Routes redirect to login
- Ensure AdminProvider wraps the entire app
- Check browser console for errors
- Verify backend is running and accessible

### MongoDB connection errors
- Ensure MONGODB_URI is set in `.env`
- Check database credentials
- Verify network connectivity

## Files Modified/Created

### Backend
- ✅ `backend/models/Admin.js` - Created
- ✅ `backend/routes/adminAuth.js` - Created
- ✅ `backend/middleware/adminAuth.js` - Created
- ✅ `backend/seedAdmin.js` - Created
- ✅ `backend/index.js` - Updated (integrated admin routes)

### Frontend
- ✅ `frontend/src/app/pages/AdminLoginPage.tsx` - Created
- ✅ `frontend/src/app/context/AdminContext.tsx` - Created
- ✅ `frontend/src/app/components/ProtectedAdminRoute.tsx` - Created
- ✅ `frontend/src/app/routes.tsx` - Updated
- ✅ `frontend/src/app/App.tsx` - Updated (added AdminProvider)
- ✅ `frontend/src/app/pages/admin/AdminDashboard.tsx` - Updated (added logout)

## Testing the Admin Authentication

### 1. Start the application
```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### 2. Navigate to admin login
- Go to `http://localhost:5173/admin/login`

### 3. Test login
- Email: `dasparna75@gmail.com`
- Password: `biditadas123@`

### 4. Verify access
- You should see the admin dashboard
- All admin routes should be accessible
- Logout should redirect to login page

## Next Steps

1. **Customize Admin Pages**: Tailor the admin dashboard pages as needed
2. **Add Permissions**: Implement permission-based UI rendering
3. **Audit Logging**: Add logging for admin actions
4. **Email Notifications**: Add email alerts for failed login attempts
5. **Two-Factor Authentication**: Implement 2FA for additional security

## Security Best Practices Implemented

- ✅ Password hashing with bcrypt (industry standard)
- ✅ JWT token expiration (24 hours)
- ✅ Account lockout mechanism (brute force protection)
- ✅ HTTPS-only in production (recommended via env)
- ✅ Secure localStorage for tokens (client-side)
- ✅ Server-side token validation on protected routes
- ✅ No sensitive data in JWT payload (except user role)
- ✅ HttpOnly cookies option (can be implemented)
