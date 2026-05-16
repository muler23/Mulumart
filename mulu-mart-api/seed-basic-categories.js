const mongoose = require('mongoose');
const Category = require('./src/models/Category');

// Simple category seeder
const categories = [
  { name: 'Electronics', icon: 'electronics', featured: true, sortOrder: 1, parent: null },
  { name: 'Vehicles', icon: 'car', featured: true, sortOrder: 2, parent: null },
  { name: 'Property', icon: 'home', featured: true, sortOrder: 3, parent: null },
  { name: 'Home & Garden', icon: 'home', featured: true, sortOrder: 4, parent: null },
  { name: 'Fashion & Beauty', icon: 'shirt', featured: true, sortOrder: 5, parent: null },
  { name: 'Jobs', icon: 'briefcase', featured: true, sortOrder: 6, parent: null },
  { name: 'Services', icon: 'service', featured: true, sortOrder: 7, parent: null }
];

async function seedBasicCategories() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mulumart');
    console.log('Connected to MongoDB');

    // Clear existing categories
    await Category.deleteMany({});
    console.log('Cleared existing categories');

    // Create basic categories
    const createdCategories = await Category.insertMany(categories);
    console.log(`Created ${createdCategories.length} basic categories`);

    // Create some subcategories for Electronics
    const electronicsId = createdCategories.find(c => c.name === 'Electronics')._id;
    const electronicsSubcategories = [
      { name: 'Mobile Phones', icon: 'phone', parent: electronicsId, sortOrder: 1 },
      { name: 'Computers & Laptops', icon: 'laptop', parent: electronicsId, sortOrder: 2 },
      { name: 'TV & Audio', icon: 'tv', parent: electronicsId, sortOrder: 3 }
    ];
    
    const subcategories = await Category.insertMany(electronicsSubcategories);
    console.log(`Created ${subcategories.length} subcategories for Electronics`);

    // Create some sub-subcategories for Mobile Phones
    const mobilePhonesId = subcategories.find(c => c.name === 'Mobile Phones')._id;
    const mobileSubSubcategories = [
      { name: 'Smartphones', icon: 'smartphone', parent: mobilePhonesId, sortOrder: 1 },
      { name: 'Feature Phones', icon: 'phone', parent: mobilePhonesId, sortOrder: 2 },
      { name: 'Phone Accessories', icon: 'headphones', parent: mobilePhonesId, sortOrder: 3 }
    ];
    
    const subSubcategories = await Category.insertMany(mobileSubSubcategories);
    console.log(`Created ${subSubcategories.length} sub-subcategories for Mobile Phones`);

    console.log('\n✅ Categories seeded successfully!');
    console.log('Total categories created:', createdCategories.length + subcategories.length + subSubcategories.length);

  } catch (error) {
    console.error('Error seeding categories:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

seedBasicCategories();
