const Promotion = require('./src/models/Promotion');
const Ad = require('./src/models/Ad');
const mongoose = require('mongoose');

async function testPromotionSystem() {
  try {
    console.log('🔍 Testing Promotion System...');
    
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mulumart');
    console.log('✅ Connected to MongoDB');
    
    // Check if Promotion model exists
    console.log('✅ Promotion model available:', !!Promotion);
    
    // Check if Ad model exists
    console.log('✅ Ad model available:', !!Ad);
    
    // Test creating a promotion
    const testAd = await Ad.findOne();
    if (testAd) {
      console.log('✅ Found test ad:', testAd.title);
      
      // Test promotion creation
      const tierConfig = {
        bronze: { days: 7, price: 5 },
        silver: { days: 14, price: 10 },
        gold: { days: 30, price: 20 }
      };
      
      const config = tierConfig['bronze'];
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + config.days);
      
      const promotionData = {
        ad: testAd._id,
        tier: 'bronze',
        price: config.price,
        endDate,
        paymentStatus: 'pending'
      };
      
      console.log('📝 Creating promotion with data:', promotionData);
      
      const promotion = await Promotion.create(promotionData);
      console.log('✅ Promotion created successfully:', promotion._id);
      
      // Test Ad promotion update
      testAd.isPromoted = true;
      testAd.promotionTier = 'bronze';
      testAd.promotionExpiresAt = promotion.endDate;
      
      // Test calculatePriorityScore method
      console.log('📊 Testing calculatePriorityScore...');
      testAd.calculatePriorityScore();
      console.log('✅ Priority score calculated:', testAd.priorityScore);
      
      await testAd.save();
      console.log('✅ Ad updated with promotion');
      
    } else {
      console.log('❌ No ads found in database');
    }
    
    console.log('✅ Promotion system test completed successfully!');
    
  } catch (error) {
    console.error('❌ Promotion system test failed:', error.message);
    console.error('❌ Error stack:', error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

testPromotionSystem();
