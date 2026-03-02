# Clerk Authentication Setup - Complete Guide

## Overview

Your e-commerce platform now uses **Clerk** for authentication instead of custom JWT. This guide covers setup, configuration, and deployment.

## What Changed

### Removed Components
- ❌ Custom JWT authentication system
- ❌ bcryptjs password hashing
- ❌ Custom `/auth` backend routes
- ❌ `AuthContext` global state management
- ❌ Custom `AuthPage.tsx`
- ❌ Custom OAuth button components

### Added Components
- ✅ **@clerk/clerk-react** - Frontend authentication
- ✅ **@clerk/backend** - Backend user verification
- ✅ **Clerk Hosted UI** - Beautiful sign-in/sign-up pages
- ✅ **Clerk OAuth** - Built-in Google, GitHub, Apple authentication
- ✅ **ClerkProvider** - Global authentication context
- ✅ `SignInPage.tsx` - Clerk sign-in component
- ✅ `SignUpPage.tsx` - Clerk sign-up component
- ✅ `SSOCallbackPage.tsx` - OAuth callback handler

### Preserved Components
- ✅ Razorpay payment integration
- ✅ Shiprocket shipping integration
- ✅ MongoDB user database
- ✅ All product, order, and cart functionality

## Quick Setup (5 minutes)

### Step 1: Create Clerk Account
1. Visit [clerk.com](https://clerk.com)
2. Sign up with your email
3. Create a new application

### Step 2: Get API Keys
From your Clerk Dashboard → API Keys:
- **Publishable Key**: `pk_...` (starts with `pk_`)
- **Secret Key**: `sk_...` (starts with `sk_`)

### Step 3: Configure Environment Variables

**Frontend** (`frontend/.env.local`):
```dotenv
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
VITE_API_URL=http://localhost:5000/api
```

**Backend** (`backend/.env`):
```dotenv
CLERK_SECRET_KEY=sk_test_your_secret_key_here
CLERK_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/fabric_store
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret
```

### Step 4: Configure Clerk Dashboard

**URLs** (Clerk Dashboard → URL Configuration):

| Environment | URL |
|---|---|
| Sign-in URL | `http://localhost:5173/sign-in` |
| Sign-up URL | `http://localhost:5173/sign-up` |
| Redirect after sign-in | `http://localhost:5173` |
| Allowed origins | `http://localhost:5173` |

### Step 5: Local Development
```bash
# Install dependencies
pnpm install

# Start frontend (Terminal 1)
cd frontend
pnpm dev

# Start backend (Terminal 2)
cd backend
npm start
```

Test at `http://localhost:5173` → Click "Login" → Sign up/Sign in

## Database Schema

### User Model (MongoDB)
```javascript
{
  clerkId: String (unique, required),    // Links to Clerk's user ID
  name: String (required),                // User's full name
  email: String (required, unique),       // Verified email
  profileImage: String,                   // Optional profile picture
  role: String (enum: ['user', 'admin']), // User type
  phone: String,                          // Optional phone
  address: {                              // Optional address
    street, city, state, zipCode, country
  },
  isActive: Boolean (default: true),      // Account status
  emailVerified: Boolean,                 // Email verification status
  lastLogin: Date,                        // Last login timestamp
  createdAt, updatedAt: Date              // Timestamps
}
```

## Using Clerk in Components

### Get Current User
```tsx
import { useUser } from "@clerk/clerk-react";

function MyComponent() {
  const { user, isLoaded } = useUser();
  
  if (!isLoaded) return <div>Loading...</div>;
  if (!user) return <div>Not signed in</div>;
  
  return (
    <div>
      <h1>{user.firstName} {user.lastName}</h1>
      <p>{user.emailAddresses[0]?.emailAddress}</p>
    </div>
  );
}
```

### Check Authentication Status
```tsx
import { useAuth } from "@clerk/clerk-react";

function MyComponent() {
  const { isSignedIn, userId } = useAuth();
  
  return isSignedIn ? <SignedInContent /> : <SignedOutContent />;
}
```

### Sign Out
```tsx
import { useClerk } from "@clerk/clerk-react";
import { useNavigate } from "react-router";

function LogoutButton() {
  const { signOut } = useClerk();
  const navigate = useNavigate();
  
  return (
    <button onClick={async () => {
      await signOut();
      navigate('/');
    }}>
      Sign Out
    </button>
  );
}
```

## Backend Integration

### Verify Clerk Token
```javascript
import { createClerkClient } from "@clerk/backend";

const clerk = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

// In your API route
app.get("/api/protected", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "No token" });
    
    const decoded = await clerk.verifyToken(token);
    const user = await User.findOne({ clerkId: decoded.sub });
    
    res.json(user);
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
});
```

### Get User Info from Clerk
```javascript
const clerk = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

// Fetch user from Clerk
const clerkUser = await clerk.users.getUser(clerkId);
console.log(clerkUser.firstName, clerkUser.emailAddresses);
```

## Authentication Flow Diagram

```
Frontend                              Backend                          Clerk
  |                                     |                               |
  |-- User clicks "Sign In" ----------->|                               |
  |                                     |-- Redirects to Clerk -------->|
  |<-- Redirected to Clerk UI ----------|                               |
  |                                     |                               |
  |-- User enters credentials -------->|                               |
  |                                     |-- Verifies credentials ------>|
  |                                     |<-- Returns JWT token ---------|
  |<-- Redirected with JWT ------------|                               |
  |                                     |                               |
  |-- Includes JWT in API calls ------>|                               |
  |                                     |-- Verifies JWT via Clerk ---->|
  |                                     |<-- Token valid --------------|
  |                                     |-- Fetches user from DB -------|
  |<-- Returns user data -------------|                               |
```

## Production Deployment

### 1. Create Production Clerk App
- Clerk Dashboard → Create new application for production

### 2. Get Production Keys
- Copy production `Publishable Key` and `Secret Key`

### 3. Update Environment Variables

**Render** (or your hosting service):
```
Frontend
VITE_CLERK_PUBLISHABLE_KEY = pk_live_...

Backend
CLERK_SECRET_KEY = sk_live_...
CLERK_PUBLISHABLE_KEY = pk_live_...
```

### 4. Configure Clerk for Production
**Clerk Dashboard → URL Configuration:**

| Setting | Value |
|---|---|
| Sign-in URL | `https://yourdomain.com/sign-in` |
| Sign-up URL | `https://yourdomain.com/sign-up` |
| Allowed origins | `https://yourdomain.com` |
| Allowed redirects | `https://yourdomain.com` |

### 5. Deploy
```bash
git add -A
git commit -m "Update Clerk keys for production"
git push origin main
# Render will auto-deploy
```

## Troubleshooting

| Issue | Solution |
|---|---|
| "Missing Clerk Publishable Key" | Set `VITE_CLERK_PUBLISHABLE_KEY` in `.env.local` |
| Sign-in page not loading | Check domain is in Clerk's allowed origins |
| Token verification fails | Verify `CLERK_SECRET_KEY` is correct in backend |
| Redirect not working | Ensure redirect URL is registered in Clerk Dashboard |
| Getting "Unauthenticated" on protected routes | Token might be expired - user needs to sign in again |

## File Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── App.tsx                 # ClerkProvider wraps app
│   │   ├── components/
│   │   │   └── Navbar.tsx          # Uses useUser() from Clerk
│   │   ├── pages/
│   │   │   ├── SignInPage.tsx      # Clerk SignIn component
│   │   │   ├── SignUpPage.tsx      # Clerk SignUp component
│   │   │   ├── SSOCallbackPage.tsx # OAuth callback
│   │   │   └── ProfilePage.tsx     # Uses useUser()
│   │   └── routes.tsx              # Routes config
│   └── env.d.ts                   # VITE_CLERK_PUBLISHABLE_KEY type def

backend/
├── models/
│   └── User.js                     # Simplified - uses clerkId
├── routes/
│   ├── payments.js                 # Razorpay (still intact)
│   └── shipping.js                 # Shiprocket (still intact)
└── services/
    ├── razorpayService.js          # Payment operations
    └── shiprocketService.js        # Shipping operations
```

## Migration from Custom Auth

If you were using the previous custom auth system:

### What You DON'T Need to Do
- ❌ Manage password hashing
- ❌ Handle JWT generation
- ❌ Manage session storage
- ❌ Build OAuth integrations
- ❌ Implement forgot password

### What Clerk Handles
- ✅ Secure password storage
- ✅ JWT token management
- ✅ Session persistence
- ✅ OAuth (Google, GitHub, Apple, etc.)
- ✅ Password reset
- ✅ Email verification
- ✅ Two-factor authentication
- ✅ Rate limiting login attempts

## Important Notes

1. **Clerk ID is Primary**: Use `clerkId` (not email) to identify users in your database
2. **JWT Verification**: Always verify tokens on protected backend endpoints
3. **Email Source**: Get user email from `user.emailAddresses[0]?.emailAddress`
4. **Names**: Use `user.firstName` and `user.lastName` instead of a combined name
5. **Production Security**: Never commit production keys - use environment variables

## Resources

- 📚 [Clerk Documentation](https://clerk.com/docs)
- 🔗 [Clerk React API Reference](https://clerk.com/docs/references/react/overview)
- 🔐 [Clerk Backend SDK](https://clerk.com/docs/references/backend-sdk/overview)
- 🎯 [Clerk Dashboard](https://dashboard.clerk.com)
- 💬 [Support](https://support.clerk.dev)

## Common Patterns

### Protect a Route
```tsx
import { useAuth } from "@clerk/clerk-react";
import { Navigate } from "react-router";

function ProtectedPage() {
  const { isSignedIn, isLoaded } = useAuth();
  
  if (!isLoaded) return <div>Loading...</div>;
  if (!isSignedIn) return <Navigate to="/sign-in" />;
  
  return <YourComponent />;
}
```

### Display User Profile
```tsx
import { useUser, useClerk } from "@clerk/clerk-react";

function UserProfile() {
  const { user } = useUser();
  const { signOut } = useClerk();
  
  return (
    <div>
      <img src={user?.profileImageUrl} />
      <h1>{user?.fullName}</h1>
      <p>{user?.emailAddresses[0]?.emailAddress}</p>
      <button onClick={() => signOut()}>Sign Out</button>
    </div>
  );
}
```

---

**Status**: ✅ Clerk authentication fully integrated with Razorpay payments and Shiprocket shipping

**Last Updated**: March 2, 2026
