const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_change_this';
const JWT_EXPIRY = '7d';

// Generate JWT token
const generateToken = (userId, email, role) => {
  return jwt.sign(
    { userId, email, role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRY }
  );
};

// Verify JWT token
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
};

// Hash password
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

// Compare password
const comparePassword = async (inputPassword, hashedPassword) => {
  return await bcrypt.compare(inputPassword, hashedPassword);
};

// Register user with email and password
const registerUser = async (name, email, password) => {
  try {
    // Check if user already exists
    let user = await User.findOne({ email: email.toLowerCase() });
    if (user) {
      throw new Error('User already exists with this email');
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    user = new User({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      authProvider: 'local',
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id, user.email, user.role);

    return {
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
      },
    };
  } catch (err) {
    throw err;
  }
};

// Login user with email and password
const loginUser = async (email, password) => {
  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Check if user has a password (local auth)
    if (!user.password) {
      throw new Error('This account uses social login. Please use Google or Facebook to sign in.');
    }

    // Compare password
    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      throw new Error('Invalid email or password');
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id, user.email, user.role);

    return {
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
      },
    };
  } catch (err) {
    throw err;
  }
};

// Google OAuth handler
const handleGoogleAuth = async (googleId, name, email, profileImage) => {
  try {
    let user = await User.findOne({ email: email.toLowerCase() });

    if (user) {
      // User exists - check if they need to link Google
      if (!user.googleId) {
        user.googleId = googleId;
        user.authProvider = user.facebookId ? 'both' : 'google'; // 'both' if they also have facebook
      }
      user.lastLogin = new Date();
      await user.save();
    } else {
      // Create new user
      user = new User({
        googleId,
        name,
        email: email.toLowerCase(),
        authProvider: 'google',
        profileImage,
        emailVerified: true,
      });
      await user.save();
    }

    // Generate token
    const token = generateToken(user._id, user.email, user.role);

    return {
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
      },
    };
  } catch (err) {
    throw err;
  }
};

// Facebook OAuth handler
const handleFacebookAuth = async (facebookId, name, email, profileImage) => {
  try {
    let user = await User.findOne({ email: email.toLowerCase() });

    if (user) {
      // User exists - check if they need to link Facebook
      if (!user.facebookId) {
        user.facebookId = facebookId;
        user.authProvider = user.googleId ? 'both' : 'facebook';
      }
      user.lastLogin = new Date();
      await user.save();
    } else {
      // Create new user
      user = new User({
        facebookId,
        name,
        email: email.toLowerCase(),
        authProvider: 'facebook',
        profileImage,
        emailVerified: true,
      });
      await user.save();
    }

    // Generate token
    const token = generateToken(user._id, user.email, user.role);

    return {
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
      },
    };
  } catch (err) {
    throw err;
  }
};

// Get user by token
const getUserByToken = async (token) => {
  try {
    const decoded = verifyToken(token);
    if (!decoded) return null;

    const user = await User.findById(decoded.userId);
    if (!user) return null;

    return {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profileImage: user.profileImage,
    };
  } catch (err) {
    return null;
  }
};

module.exports = {
  generateToken,
  verifyToken,
  hashPassword,
  comparePassword,
  registerUser,
  loginUser,
  handleGoogleAuth,
  handleFacebookAuth,
  getUserByToken,
  JWT_SECRET,
};
