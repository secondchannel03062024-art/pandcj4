# Admin Authentication Quick Start & Testing Guide

## Quick Setup (5 Minutes)

### 1. Seed Default Admin User

```bash
cd backend
node seedAdmin.js
```

**Output should show:**
```
✓ Admin user created: dasparna75@gmail.com
```

### 2. Start Backend Server

```bash
# In backend directory
npm start
```

**Output should show:**
```
Server running on http://localhost:3000
MongoDB connected
```

### 3. Start Frontend Dev Server

```bash
# In frontend directory
npm run dev
```

**Output should show:**
```
VITE v... dev server running at:
➜  Local:   http://localhost:5173/
```

## Testing the Admin Login

### Test 1: Login Page Access
1. Open browser to `http://localhost:5173/admin/login`
2. ✅ Should see admin login form with:
   - Email input field
   - Password input field
   - Show/hide password toggle
   - Sign In button
   - Professional dark theme

### Test 2: Valid Login
1. Enter credentials:
   - Email: `dasparna75@gmail.com`
   - Password: `biditadas123@`
2. Click "Sign In"
3. ✅ Should:
   - Show loading state
   - Redirect to `/admin`
   - Display admin dashboard
   - Show admin email in sidebar

### Test 3: Invalid Credentials
1. Go to `/admin/login`
2. Enter wrong credentials (e.g., wrong password)
3. Click "Sign In"
4. ✅ Should:
   - Show error message: "Invalid credentials"
   - Display attempt counter
   - Remain on login page
   - Allow retry

### Test 4: Account Lockout
1. Go to `/admin/login`
2. Enter correct email but wrong password 5 times
3. ✅ Should:
   - Show error: "Account locked. Try again later"
   - Prevent further login attempts for 1 hour

### Test 5: Navigate Admin Routes
After login, click these menu items (all should work):
- Dashboard → `/admin`
- Orders → `/admin/orders`
- Products → `/admin/products`
- Categories → `/admin/categories`
- Coupons → `/admin/coupons`
- Banners → `/admin/banners`

✅ All should render without redirect to login

### Test 6: Logout
1. Click "Logout" button in admin sidebar
2. ✅ Should:
   - Show loading state
   - Clear token from localStorage
   - Redirect to `/admin/login`
   - Login page should be accessible

### Test 7: Protected Route Access
1. Logout from admin
2. Try to visit `http://localhost:5173/admin` directly
3. ✅ Should redirect to `/admin/login`

### Test 8: Token Persistence
1. Login to admin panel
2. Refresh the page with F5
3. ✅ Should:
   - Verify token automatically
   - Remain logged in
   - Show admin dashboard

### Test 9: Invalid Token
1. Open browser DevTools
2. Go to Application → LocalStorage
3. Delete the `adminToken` entry
4. Refresh page
5. ✅ Should redirect to `/admin/login`

## API Testing with cURL

### Test Login Endpoint

```bash
curl -X POST http://localhost:3000/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "dasparna75@gmail.com",
    "password": "biditadas123@"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "admin": {
      "_id": "...",
      "email": "dasparna75@gmail.com",
      "role": "super-admin",
      "permissions": [...]
    }
  }
}
```

### Test Verify Endpoint

```bash
# Replace TOKEN with actual token from login
curl -X POST http://localhost:3000/api/admin/auth/verify \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "admin": {
      "_id": "...",
      "email": "dasparna75@gmail.com",
      "role": "super-admin",
      "permissions": [...]
    }
  }
}
```

### Test Protected Route

```bash
# This should fail without a token
curl -X GET http://localhost:3000/api/admin/products

# This should succeed with token
curl -X GET http://localhost:3000/api/admin/products \
  -H "Authorization: Bearer TOKEN"
```

## Browser DevTools Verification

### 1. Check LocalStorage
1. Open DevTools (F12)
2. Go to Applications → LocalStorage
3. Find entry for `http://localhost:5173`
4. ✅ Should see:
   - `adminToken`: JWT token string
   - `adminUser`: Admin object as JSON

### 2. Check Network Requests
1. Open DevTools Network tab
2. Perform login action
3. ✅ Should see:
   - POST to `/api/admin/auth/login`
   - Response includes `token` and `admin`
   - Token in response header or body

### 3. Check API Authorization
1. In Network tab, filter for "admin"
2. View admin API requests (products, orders, etc.)
3. ✅ Should see:
   - Authorization header: `Bearer <token>`
   - All requests returning 200 status

## Password Reset Testing

### Reset Admin Password

If you need to change the default password:

```bash
cd backend
node seedAdmin.js --reset-password
```

This will:
- Reset to default credentials: `dasparna75@gmail.com` / `biditadas123@`
- Clear failed login attempts
- Unlock account if locked

## Common Issues & Solutions

| Issue | Check |
|-------|-------|
| Seed script fails | Verify MongoDB is running and `.env` has MONGODB_URI |
| Login always fails | Check backend is running on port 3000 |
| "Account locked" | Wait 1 hour or run reset script |
| Stays on login after submit | Check browser console for errors |
| Can't access `/admin` | Verify AdminProvider is in App.tsx |
| 404 on login endpoint | Verify backend routes are registered |

## Success Checklist

- [ ] Seed script runs without errors
- [ ] Backend server starts without errors
- [ ] Frontend dev server starts without errors
- [ ] Can access login page at `/admin/login`
- [ ] Can login with correct credentials
- [ ] Can access admin dashboard after login
- [ ] Can navigate all admin sub-routes
- [ ] Can logout and redirect to login
- [ ] Cannot access `/admin` without login
- [ ] Token persists after page refresh
- [ ] Invalid credentials show error message

## Next: Integrate with Admin Pages

Once testing confirms the authentication works, integrate with admin pages:

1. **AdminOrders** → Fetch `/api/admin/orders` with token
2. **AdminProducts** → Fetch `/api/admin/products` with token
3. **AdminCategories** → Fetch `/api/admin/categories` with token
4. **AdminCoupons** → Fetch `/api/admin/coupons` with token
5. **BannersPage** → Fetch `/api/admin/banners` with token

Example integration pattern:

```tsx
import { useAdmin } from '@/app/context/AdminContext';

export default function AdminProducts() {
  const { token } = useAdmin();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      const response = await fetch('/api/admin/products', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setProducts(data.data || []);
    };

    if (token) {
      fetchProducts();
    }
  }, [token]);

  return (
    // Render products here
  );
}
```

## Production Deployment Checklist

Before deploying to production:

- [ ] Change default admin password
- [ ] Set strong `JWT_SECRET` in environment
- [ ] Enable HTTPS in frontend (redirects)
- [ ] Set `NODE_ENV=production`
- [ ] Configure CORS properly in backend
- [ ] Enable rate limiting on login endpoint
- [ ] Set up SSL certificates
- [ ] Configure secure cookie flags if needed
- [ ] Implement logging for admin access
- [ ] Set up email notifications for failed logins
- [ ] Enable 2FA (optional but recommended)
- [ ] Audit database for proper indexing

---

You now have a fully functional admin authentication system! 🎉

For questions or issues, refer to:
- `ADMIN_AUTH_SETUP.md` - Detailed setup guide
- `ADMIN_AUTH_IMPLEMENTATION.md` - Implementation details
- Browser console for error messages
- Backend logs for API errors
