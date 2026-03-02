const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: false, // Not required for OAuth users
  },
  profileImage: {
    type: String,
    default: null,
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  phone: String,
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
  },
  
  // OAuth fields
  googleId: {
    type: String,
    default: null,
  },
  facebookId: {
    type: String,
    default: null,
  },
  authProvider: {
    type: String,
    enum: ['local', 'google', 'facebook'],
    default: 'local',
  },
  
  // Account status
  isActive: {
    type: Boolean,
    default: true,
  },
  emailVerified: {
    type: Boolean,
    default: false,
  },
  lastLogin: Date,
}, {
  timestamps: true,
});

module.exports = mongoose.model('User', userSchema);
