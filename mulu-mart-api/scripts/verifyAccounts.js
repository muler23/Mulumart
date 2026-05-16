const mongoose = require('mongoose');
const User = require('../src/models/User');
const BusinessAccount = require('../src/models/BusinessAccount');
require('dotenv').config();

const verifyAccounts = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/mulumart');
    console.log('✅ Connected to MongoDB');

    // Check users
    const users = await User.find({});
    console.log('\n👥 Users Created:');
    users.forEach(user => {
      console.log(`- ${user.name} (${user.email})`);
      console.log(`  Role: ${user.role}`);
      console.log(`  Phone: ${user.phone}`);
      console.log(`  Location: ${user.location}`);
      console.log(`  Active: ${user.active}`);
      console.log('');
    });

    // Check business accounts
    const businessAccounts = await BusinessAccount.find({}).populate('userId', 'name email');
    console.log('\n💼 Business Accounts:');
    businessAccounts.forEach(business => {
      console.log(`- ${business.businessName}`);
      console.log(`  Owner: ${business.userId.name} (${business.userId.email})`);
      console.log(`  Type: ${business.businessType}`);
      console.log(`  Plan: ${business.subscription.plan}`);
      console.log(`  Status: ${business.subscription.status}`);
      console.log(`  Verified: ${business.verification.isVerified}`);
      console.log('');
    });

    await mongoose.connection.close();
    console.log('✅ Database connection closed');
  } catch (error) {
    console.error('❌ Error:', error);
  }
};

verifyAccounts();
