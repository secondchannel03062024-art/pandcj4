const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  handleGoogleAuth,
  handleFacebookAuth,
  getUserByToken,
  verifyToken,
} = require('../services/authService');

// Middleware to verify token
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }

  req.user = decoded;
  next();
};

// Register endpoint
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    // Validation
    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const result = await registerUser(name, email, password);
    return res.status(201).json(result);
  } catch (err) {
    console.error('Register error:', err);
    return res.status(400).json({ success: false, message: err.message });
  }
});

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const result = await loginUser(email, password);
    return res.status(200).json(result);
  } catch (err) {
    console.error('Login error:', err);
    return res.status(400).json({ success: false, message: err.message });
  }
});

// Google OAuth endpoint
router.post('/google', async (req, res) => {
  try {
    const { googleId, name, email, profileImage } = req.body;

    if (!googleId || !email) {
      return res.status(400).json({ success: false, message: 'Google ID and email are required' });
    }

    const result = await handleGoogleAuth(googleId, name, email, profileImage);
    return res.status(200).json(result);
  } catch (err) {
    console.error('Google auth error:', err);
    return res.status(400).json({ success: false, message: err.message });
  }
});

// Facebook OAuth endpoint
router.post('/facebook', async (req, res) => {
  try {
    const { facebookId, name, email, profileImage } = req.body;

    if (!facebookId || !email) {
      return res.status(400).json({ success: false, message: 'Facebook ID and email are required' });
    }

    const result = await handleFacebookAuth(facebookId, name, email, profileImage);
    return res.status(200).json(result);
  } catch (err) {
    console.error('Facebook auth error:', err);
    return res.status(400).json({ success: false, message: err.message });
  }
});

// Get current user endpoint
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await getUserByToken(req.headers.authorization.split(' ')[1]);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    return res.status(200).json({ success: true, user });
  } catch (err) {
    console.error('Get user error:', err);
    return res.status(500).json({ success: false, message: 'Failed to get user' });
  }
});

// Logout endpoint (frontend should clear token from localStorage)
router.post('/logout', authMiddleware, async (req, res) => {
  try {
    return res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Logout failed' });
  }
});

module.exports = router;
