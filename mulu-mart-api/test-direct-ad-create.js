const mongoose = require('mongoose');
const Ad = require('./src/models/Ad');

async function testDirectAdCreate() {
  console.log('🔍 Testing Direct Ad Creation...');
  
  try {
    // Test direct database connection
    console.log('\n📋 Step 1: Testing direct database connection...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mulu-mart');
    console.log('✅ Database connected');
    
    // Test creating a simple ad directly without any middleware
    console.log('\n📋 Step 2: Testing direct Ad.create...');
    const minimalAd = {
      title: 'Test Ad Direct',
      description: 'Test description direct',
      price: 100,
      category: '507f1f77bcf86b799', // Valid ObjectId
      condition: 'new',
      city: 'Addis Ababa',
      country: 'Ethiopia',
      postedBy: '507f1f77bcf86b799' // Valid ObjectId
    };
    
    console.log('Creating ad with data:', minimalAd);
    
    // Create ad without any middleware or validation
    const ad = await Ad.create(minimalAd);
    console.log('✅ Ad created successfully:', ad._id);
    console.log('✅ Ad title:', ad.title);
    console.log('✅ Ad category:', ad.category);
    
    await mongoose.disconnect();
    console.log('🔌 Database disconnected');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('❌ Stack trace:', error.stack);
  }
}

testDirectAdCreate();
