const mongoose = require('mongoose');
const Admin = require('./models/Admin');
require('dotenv').config();

const seedAdmin = async () => {
  try {
    console.log('[Seed] Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('[Seed] Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: 'dasparna75@gmail.com' });

    if (existingAdmin) {
      console.log('[Seed] Admin already exists with this email');
      console.log('[Seed] Current admin details:', {
        email: existingAdmin.email,
        name: existingAdmin.name,
        role: existingAdmin.role,
      });

      // Optionally update password if different
      const updatePassword = process.argv.includes('--reset-password');
      if (updatePassword) {
        existingAdmin.password = 'biditadas123@';
        await existingAdmin.save();
        console.log('[Seed] ✅ Admin password has been reset');
      }
    } else {
      // Create new admin
      const newAdmin = new Admin({
        email: 'dasparna75@gmail.com',
        password: 'biditadas123@',
        name: 'Dasparna Admin',
        role: 'super-admin',
        permissions: [
          'view-dashboard',
          'manage-products',
          'manage-orders',
          'manage-coupons',
          'manage-banners',
          'manage-categories',
          'manage-users',
        ],
      });

      await newAdmin.save();
      console.log('[Seed] ✅ Default admin created successfully');
      console.log('[Seed] Admin Details:');
      console.log('  Email: dasparna75@gmail.com');
      console.log('  Password: biditadas123@');
      console.log('  Role: super-admin');
    }

    console.log('[Seed] Seed complete');
    process.exit(0);
  } catch (error) {
    console.error('[Seed] Error:', error.message);
    process.exit(1);
  }
};

seedAdmin();
