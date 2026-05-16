const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../src/models/User');
const BusinessAccount = require('../src/models/BusinessAccount');
require('dotenv').config();

const createTestUsers = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mulumart');
    console.log('✅ Connected to MongoDB');

    // Create users array
    const users = [
      {
        name: 'Regular User',
        email: 'regular@mulumart.com',
        password: 'password',
        passwordConfirm: 'password',
        role: 'user',
        phone: '+251911000001',
        location: 'Addis Ababa, Ethiopia'
      },
      {
        name: 'Business User',
        email: 'business@mulumart.com',
        password: 'password',
        passwordConfirm: 'password',
        role: 'business',
        phone: '+251911000002',
        location: 'Addis Ababa, Ethiopia'
      },
      {
        name: 'Admin User',
        email: 'admin@mulumart.com',
        password: 'password',
        passwordConfirm: 'password',
        role: 'admin',
        phone: '+251911000004',
        location: 'Addis Ababa, Ethiopia'
      }
    ];

    console.log('🔄 Creating test users...');

    for (const userData of users) {
      try {
        // Check if user already exists
        const existingUser = await User.findOne({ email: userData.email });

        if (existingUser) {
          console.log(`⚠️ User ${userData.email} already exists, skipping...`);
          continue;
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(userData.password, salt);

        // Create user
        const user = await User.create({
          ...userData,
          password: hashedPassword
        });

        console.log(`✅ Created ${user.role}: ${user.email}`);

        // Create business account for business user
        if (userData.email === 'business@mulumart.com') {
          const businessAccount = await BusinessAccount.create({
            userId: user._id,
            businessName: 'Test Business',
            businessType: 'registered',
            businessAddress: {
              street: 'Bole Road',
              city: 'Addis Ababa',
              region: 'Addis Ababa',
              postalCode: '1000',
              country: 'Ethiopia'
            },
            businessPhone: '+251911000002',
            businessEmail: 'business@mulumart.com',
            businessWebsite: 'https://testbusiness.com',
            businessDescription: 'A test business account for Mulu-Mart demonstration',
            subscription: {
              plan: 'monthly',
              status: 'active',
              startDate: new Date(),
              endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
              autoRenew: false
            },
            features: {
              unlimitedAds: true,
              businessBadge: true,
              analytics: true,
              storefront: true,
              prioritySupport: true,
              advancedAnalytics: true,
              bulkUpload: true
            },
            verification: {
              isVerified: true,
              verifiedAt: new Date(),
              verifiedBy: user._id
            }
          });

          console.log(`✅ Created business account for ${user.email}`);
        }

      } catch (error) {
        console.error(`❌ Error creating user ${userData.email}:`, error.message);
      }
    }

    console.log('\n🎉 Test users created successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('Regular User: regular@mulumart.com / password');
    console.log('Business User: business@mulumart.com / password');
    console.log('Admin: admin@mulumart.com / password');
    console.log('\n💡 Note: Use email as username for login');
    console.log('   Moderator role not available in current schema');
    console.log('   Use Admin account for moderation tasks');

    // Close database connection
    await mongoose.connection.close();
    console.log('✅ Database connection closed');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

// Run the script
createTestUsers();
