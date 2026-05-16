const mongoose = require('mongoose');
const Category = require('./src/models/Category');

async function seedCategories() {
  console.log('🌱 Seeding Categories...');
  
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mulu-mart');
    console.log('✅ Connected to database');
    
    // Clear existing categories
    await Category.deleteMany({});
    console.log('🗑️ Cleared existing categories');
    
    // Seed basic categories
    const categories = [
      {
        name: 'Electronics',
        slug: 'electronics',
        description: 'Electronic devices and gadgets'
      },
      {
        name: 'Vehicles',
        slug: 'vehicles', 
        description: 'Cars, motorcycles, and other vehicles'
      },
      {
        name: 'Real Estate',
        slug: 'real-estate',
        description: 'Properties for sale and rent'
      },
      {
        name: 'Jobs',
        slug: 'jobs',
        description: 'Employment opportunities'
      },
      {
        name: 'Services',
        slug: 'services',
        description: 'Professional services'
      }
    ];
    
    const insertedCategories = await Category.insertMany(categories);
    console.log(`✅ Inserted ${insertedCategories.length} categories`);
    
    console.log('📂 Seeded Categories:');
    insertedCategories.forEach((cat, index) => {
      console.log(`${index + 1}. ${cat.name} (${cat._id})`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Database disconnected');
  }
}

seedCategories();
