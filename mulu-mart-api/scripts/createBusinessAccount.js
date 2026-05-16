const mongoose = require('mongoose');
const User = require('../src/models/User');
const BusinessAccount = require('../src/models/BusinessAccount');
require('dotenv').config();

const createBusinessAccount = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/mulumart');
    console.log('✅ Connected to MongoDB');

    // Find business user
    const businessUser = await User.findOne({ email: 'business@mulumart.com' });
    
    if (!businessUser) {
      console.log('❌ Business user not found');
      return;
    }

    console.log(`✅ Found business user: ${businessUser.name}`);

    // Check if business account already exists
    const existingBusiness = await BusinessAccount.findOne({ userId: businessUser._id });
    
    if (existingBusiness) {
      console.log('⚠️ Business account already exists');
      console.log(`- Business Name: ${existingBusiness.businessName}`);
      console.log(`- Plan: ${existingBusiness.subscription.plan}`);
      console.log(`- Status: ${existingBusiness.subscription.status}`);
      return;
    }

    // Create business account
    const businessAccount = await BusinessAccount.create({
      userId: businessUser._id,
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
        verifiedBy: businessUser._id
      }
    });

    console.log('✅ Business account created successfully!');
    console.log(`- Business Name: ${businessAccount.businessName}`);
    console.log(`- Plan: ${businessAccount.subscription.plan}`);
    console.log(`- Status: ${businessAccount.subscription.status}`);
    console.log(`- Verified: ${businessAccount.verification.isVerified}`);
    console.log(`- Expires: ${businessAccount.subscription.endDate}`);

    await mongoose.connection.close();
    console.log('✅ Database connection closed');

  } catch (error) {
    console.error('❌ Error:', error);
  }
};

createBusinessAccount();
