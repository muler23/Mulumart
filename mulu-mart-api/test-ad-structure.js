const Ad = require('./src/models/Ad');
const mongoose = require('mongoose');

async function testAdStructure() {
  try {
    console.log('🔍 Testing Ad Structure...');
    
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mulumart');
    console.log('✅ Connected to MongoDB');
    
    // Find a test ad
    const ad = await Ad.findOne();
    if (ad) {
      console.log('✅ Found test ad');
      console.log('📝 Ad structure:');
      console.log('- ad.postedBy:', ad.postedBy);
      console.log('- ad.contactInfo:', ad.contactInfo);
      console.log('- ad.title:', ad.title);
      console.log('- Full ad object:', JSON.stringify(ad, null, 2));
    } else {
      console.log('❌ No ads found');
    }
    
    console.log('✅ Ad structure test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

testAdStructure();
