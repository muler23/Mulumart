const Promotion = require('./src/models/Promotion');
const Ad = require('./src/models/Ad');
const mongoose = require('mongoose');

async function testSimplePromotion() {
  try {
    console.log('🔍 Testing Simple Promotion Creation...');
    
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mulumart');
    console.log('✅ Connected to MongoDB');
    
    // Find a test ad
    const testAd = await Ad.findOne();
    if (!testAd) {
      console.log('❌ No ads found');
      return;
    }
    
    console.log('✅ Found test ad:', testAd.title);
    
    // Create promotion with minimal required fields
    const promotionData = {
      ad: testAd._id,
      tier: 'bronze',
      price: 5,
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      paymentStatus: 'pending'
    };
    
    console.log('📝 Creating promotion with data:', promotionData);
    
    const promotion = await Promotion.create(promotionData);
    console.log('✅ Promotion created successfully!');
    console.log('✅ Promotion ID:', promotion._id);
    console.log('✅ Promotion tier:', promotion.tier);
    console.log('✅ Promotion price:', promotion.price);
    console.log('✅ Promotion endDate:', promotion.endDate);
    
    console.log('✅ Promotion system test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('❌ Error stack:', error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

testSimplePromotion();
