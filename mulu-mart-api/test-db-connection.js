const mongoose = require('mongoose');

async function testDatabaseConnection() {
  console.log('🔍 Testing Database Connection...');
  
  try {
    // Test basic MongoDB connection
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mulu-mart', {
      // Remove deprecated options
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
      
      // Add modern options
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      bufferCommands: false
      // bufferMaxEntries: 0 // This was causing the error
    });
    
    console.log('✅ MongoDB connected successfully');
    
    // Test Category model query
    const Category = require('./src/models/Category');
    
    console.log('🔍 Testing Category model...');
    const count = await Category.countDocuments();
    console.log(`✅ Category count: ${count}`);
    
    if (count > 0) {
      const categories = await Category.find({}).limit(5);
      console.log('✅ Sample categories:');
      categories.forEach((cat, index) => {
        console.log(`  ${index + 1}. ${cat.name} (${cat._id})`);
      });
      
      // Test findOne query
      const firstCategory = categories[0];
      console.log(`\n🔍 Testing findOne for: ${firstCategory.name}`);
      
      const foundCategory = await Category.findOne({ name: firstCategory.name });
      console.log(`🔍 Result: ${foundCategory ? 'FOUND' : 'NOT FOUND'}`);
      
      if (foundCategory) {
        console.log('✅ Database query working correctly');
      } else {
        console.log('❌ findOne query failed');
      }
    }
    
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Database disconnected');
  }
}

testDatabaseConnection();
