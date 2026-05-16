const mongoose = require('mongoose');
const Ad = require('./src/models/Ad');

async function testDatabaseDirect() {
  console.log('🔍 Testing Database Direct Connection...');
  
  try {
    // Test database connection
    console.log('\n📋 Step 1: Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mulu-mart');
    console.log('✅ Database connected successfully');
    
    // Test basic database operation
    console.log('\n📋 Step 2: Testing basic database operation...');
    const count = await Ad.countDocuments();
    console.log(`✅ Found ${count} ads in database`);
    
    // Test simple ad creation without any complexity
    console.log('\n📋 Step 3: Testing simple ad creation...');
    const startTime = Date.now();
    
    const simpleAd = {
      title: 'Test Ad Direct',
      description: 'Test description direct',
      price: 100,
      category: '507f1f77bcf86b799', // Valid ObjectId
      condition: 'new',
      city: 'Addis Ababa',
      country: 'Ethiopia',
      postedBy: '507f1f77bcf86b799', // Valid ObjectId
      status: 'active'
    };
    
    console.log('Creating ad with data:', simpleAd);
    
    // Create ad with timeout tracking
    const ad = await Promise.race([
      Ad.create(simpleAd),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Database operation timeout')), 10000)
      )
    ]);
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log(`✅ Ad created successfully in ${duration}ms:`, ad._id);
    console.log('✅ Ad title:', ad.title);
    console.log('✅ Ad category:', ad.category);
    
    await mongoose.disconnect();
    console.log('🔌 Database disconnected');
    
  } catch (error) {
    console.error('❌ Database test failed:', error.message);
    console.error('❌ Error details:', error);
    
    try {
      await mongoose.disconnect();
      console.log('🔌 Database disconnected');
    } catch (disconnectError) {
      console.error('❌ Disconnect error:', disconnectError.message);
    }
  }
}

testDatabaseDirect();
