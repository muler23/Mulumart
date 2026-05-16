const mongoose = require('mongoose');
const Ad = require('./src/models/Ad');

async function testMinimalAd() {
  console.log('🔍 Testing Minimal Ad Creation...');
  
  try {
    // Test direct database operation
    console.log('\n📋 Step 1: Testing direct database connection...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mulu-mart');
    console.log('✅ Database connected');
    
    // Test creating a simple ad directly
    console.log('\n📋 Step 2: Testing direct Ad.create...');
    const minimalAd = {
      title: 'Test Ad',
      description: 'Test description',
      price: 100,
      category: '69689801ff458879c75b94f6', // Electronics category ID
      condition: 'new',
      city: 'Addis Ababa',
      country: 'Ethiopia',
      postedBy: '507f1f77bcf86b799' // Valid ObjectId
    };
    
    const ad = await Ad.create(minimalAd);
    console.log('✅ Ad created successfully:', ad._id);
    console.log('✅ Ad title:', ad.title);
    console.log('✅ Ad category:', ad.category);
    
    await mongoose.disconnect();
    console.log('🔌 Database disconnected');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testMinimalAd();
