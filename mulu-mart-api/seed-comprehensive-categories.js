const mongoose = require('mongoose');
const Category = require('./src/models/Category');

// Comprehensive category seeder with subcategories for ALL main categories
const categories = [
  { name: 'Electronics', icon: 'electronics', featured: true, sortOrder: 1, parent: null },
  { name: 'Vehicles', icon: 'car', featured: true, sortOrder: 2, parent: null },
  { name: 'Property', icon: 'home', featured: true, sortOrder: 3, parent: null },
  { name: 'Home & Garden', icon: 'home', featured: true, sortOrder: 4, parent: null },
  { name: 'Fashion & Beauty', icon: 'shirt', featured: true, sortOrder: 5, parent: null },
  { name: 'Jobs', icon: 'briefcase', featured: true, sortOrder: 6, parent: null },
  { name: 'Services', icon: 'service', featured: true, sortOrder: 7, parent: null }
];

// Subcategories for each main category
const subcategoriesData = {
  'Electronics': [
    { name: 'Mobile Phones', icon: 'phone', sortOrder: 1 },
    { name: 'Computers & Laptops', icon: 'laptop', sortOrder: 2 },
    { name: 'TV & Audio', icon: 'tv', sortOrder: 3 },
    { name: 'Gaming & Consoles', icon: 'gamepad', sortOrder: 4 },
    { name: 'Cameras & Photo', icon: 'camera', sortOrder: 5 }
  ],
  'Vehicles': [
    { name: 'Cars', icon: 'car', sortOrder: 1 },
    { name: 'Motorcycles', icon: 'motorcycle', sortOrder: 2 },
    { name: 'Trucks & Buses', icon: 'truck', sortOrder: 3 },
    { name: 'Boats & Marine', icon: 'ship', sortOrder: 4 },
    { name: 'Vehicle Parts', icon: 'wrench', sortOrder: 5 }
  ],
  'Property': [
    { name: 'Houses & Apartments', icon: 'home', sortOrder: 1 },
    { name: 'Land & Plots', icon: 'map', sortOrder: 2 },
    { name: 'Commercial Property', icon: 'building', sortOrder: 3 },
    { name: 'Vacation Rentals', icon: 'umbrella', sortOrder: 4 }
  ],
  'Home & Garden': [
    { name: 'Furniture', icon: 'sofa', sortOrder: 1 },
    { name: 'Kitchen Appliances', icon: 'blender', sortOrder: 2 },
    { name: 'Garden & Outdoor', icon: 'tree', sortOrder: 3 },
    { name: 'Home Decor', icon: 'paint-brush', sortOrder: 4 }
  ],
  'Fashion & Beauty': [
    { name: "Men's Clothing", icon: 'shirt', sortOrder: 1 },
    { name: "Women's Clothing", icon: 'dress', sortOrder: 2 },
    { name: 'Shoes & Footwear', icon: 'shoe', sortOrder: 3 },
    { name: 'Jewelry & Accessories', icon: 'gem', sortOrder: 4 },
    { name: 'Beauty & Personal Care', icon: 'sparkles', sortOrder: 5 }
  ],
  'Jobs': [
    { name: 'IT & Software', icon: 'computer', sortOrder: 1 },
    { name: 'Accounting & Finance', icon: 'calculator', sortOrder: 2 },
    { name: 'Education & Training', icon: 'graduation-cap', sortOrder: 3 },
    { name: 'Healthcare & Medical', icon: 'heart', sortOrder: 4 },
    { name: 'Sales & Marketing', icon: 'megaphone', sortOrder: 5 }
  ],
  'Services': [
    { name: 'Web Development', icon: 'code', sortOrder: 1 },
    { name: 'Design & Creative', icon: 'palette', sortOrder: 2 },
    { name: 'Writing & Translation', icon: 'pen', sortOrder: 3 },
    { name: 'Consulting & Business', icon: 'briefcase', sortOrder: 4 },
    { name: 'Repair & Maintenance', icon: 'wrench', sortOrder: 5 }
  ]
};

// Sub-subcategories for key subcategories
const subSubcategoriesData = {
  'Mobile Phones': [
    { name: 'Smartphones', icon: 'smartphone', sortOrder: 1 },
    { name: 'Feature Phones', icon: 'phone', sortOrder: 2 },
    { name: 'Phone Accessories', icon: 'headphones', sortOrder: 3 },
    { name: 'Tablets & iPads', icon: 'tablet', sortOrder: 4 }
  ],
  'Computers & Laptops': [
    { name: 'Laptops', icon: 'laptop', sortOrder: 1 },
    { name: 'Desktop Computers', icon: 'desktop', sortOrder: 2 },
    { name: 'Computer Accessories', icon: 'mouse', sortOrder: 3 },
    { name: 'Monitors & Displays', icon: 'monitor', sortOrder: 4 }
  ],
  'Cars': [
    { name: 'Sedans', icon: 'car', sortOrder: 1 },
    { name: 'SUVs & Crossovers', icon: 'truck', sortOrder: 2 },
    { name: 'Trucks & Pickups', icon: 'truck', sortOrder: 3 },
    { name: 'Motorcycles & Scooters', icon: 'motorcycle', sortOrder: 4 }
  ],
  'Houses & Apartments': [
    { name: 'Apartments for Rent', icon: 'home', sortOrder: 1 },
    { name: 'Houses for Sale', icon: 'building', sortOrder: 2 },
    { name: 'Condos & Townhouses', icon: 'building', sortOrder: 3 },
    { name: 'Rooms for Rent', icon: 'door', sortOrder: 4 }
  ],
  "Men's Clothing": [
    { name: 'Shirts & Tops', icon: 'shirt', sortOrder: 1 },
    { name: 'Pants & Jeans', icon: 'shopping-bag', sortOrder: 2 },
    { name: 'Shoes & Sneakers', icon: 'shoe', sortOrder: 3 },
    { name: 'Accessories', icon: 'watch', sortOrder: 4 }
  ],
  "Women's Clothing": [
    { name: 'Dresses & Skirts', icon: 'dress', sortOrder: 1 },
    { name: 'Tops & Blouses', icon: 'shirt', sortOrder: 2 },
    { name: 'Women\'s Pants & Jeans', icon: 'shopping-bag', sortOrder: 3 },
    { name: 'Shoes & Heels', icon: 'shoe', sortOrder: 4 }
  ],
  'IT & Software': [
    { name: 'Mobile App Development', icon: 'mobile', sortOrder: 1 },
    { name: 'Data Science & AI', icon: 'brain', sortOrder: 2 },
    { name: 'Cybersecurity', icon: 'shield', sortOrder: 3 },
    { name: 'Cloud Computing', icon: 'cloud', sortOrder: 4 }
  ],
  'Web Development': [
    { name: 'Frontend Development', icon: 'code', sortOrder: 1 },
    { name: 'Backend Development', icon: 'server', sortOrder: 2 },
    { name: 'Full Stack Development', icon: 'layers', sortOrder: 3 },
    { name: 'UI/UX Design', icon: 'palette', sortOrder: 4 },
    { name: 'DevOps & Deployment', icon: 'cloud', sortOrder: 5 }
  ]
};

async function seedComprehensiveCategories() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mulumart');
    console.log('Connected to MongoDB');

    // Clear existing categories
    await Category.deleteMany({});
    console.log('Cleared existing categories');

    // Create main categories
    const createdCategories = await Category.insertMany(categories);
    console.log(`Created ${createdCategories.length} main categories`);

    // Create all subcategories
    let totalSubcategories = 0;
    const subcategoryMap = {};

    for (const [mainCategoryName, subcategories] of Object.entries(subcategoriesData)) {
      const mainCategory = createdCategories.find(c => c.name === mainCategoryName);
      if (mainCategory) {
        const subcategoriesWithParent = subcategories.map(sub => ({
          ...sub,
          parent: mainCategory._id
        }));
        
        const createdSubcategories = await Category.insertMany(subcategoriesWithParent);
        subcategoryMap[mainCategoryName] = createdSubcategories;
        totalSubcategories += createdSubcategories.length;
        console.log(`Created ${createdSubcategories.length} subcategories for ${mainCategoryName}`);
      }
    }

    // Create sub-subcategories after all subcategories are created
    let totalSubSubcategories = 0;
    
    // Wait a bit to ensure all subcategories are created
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Fetch all created subcategories
    const allSubcategories = await Category.find({ parent: { $ne: null } });
    
    for (const [subcategoryName, subSubcategories] of Object.entries(subSubcategoriesData)) {
      const parentSubcategory = allSubcategories.find(sc => sc.name === subcategoryName);
      
      if (parentSubcategory) {
        const subSubcategoriesWithParent = subSubcategories.map(subSub => ({
          ...subSub,
          parent: parentSubcategory._id
        }));
        
        const createdSubSubcategories = await Category.insertMany(subSubcategoriesWithParent);
        totalSubSubcategories += createdSubSubcategories.length;
        console.log(`Created ${createdSubSubcategories.length} sub-subcategories for ${subcategoryName}`);
      }
    }

    console.log('\n✅ Comprehensive categories seeded successfully!');
    console.log(`Total created:`);
    console.log(`- Main categories: ${createdCategories.length}`);
    console.log(`- Subcategories: ${totalSubcategories}`);
    console.log(`- Sub-subcategories: ${totalSubSubcategories}`);
    console.log(`- Total: ${createdCategories.length + totalSubcategories + totalSubSubcategories}`);

  } catch (error) {
    console.error('Error seeding categories:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

seedComprehensiveCategories();
