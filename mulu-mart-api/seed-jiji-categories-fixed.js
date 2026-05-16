const mongoose = require('mongoose');
const Category = require('./src/models/Category');
require('dotenv').config();

// Jiji Ethiopia category structure (based on real Jiji categories)
const jijiCategories = {
  "Electronics": {
    icon: 'electronics',
    featured: true,
    sortOrder: 1,
    description: 'Electronic devices, gadgets, and accessories',
    subcategories: {
      "Mobile Phones": {
        icon: 'phone',
        sortOrder: 1,
        subcategories: [
          { name: 'Smartphones', icon: 'smartphone', sortOrder: 1 },
          { name: 'Feature Phones', icon: 'phone', sortOrder: 2 },
          { name: 'Phone Accessories', icon: 'headphones', sortOrder: 3 },
          { name: 'Tablets', icon: 'tablet', sortOrder: 4 },
          { name: 'Smart Watches', icon: 'watch', sortOrder: 5 },
          { name: 'Phone Cases & Covers', icon: 'case', sortOrder: 6 }
        ]
      },
      "Computers & Laptops": {
        icon: 'laptop',
        sortOrder: 2,
        subcategories: [
          { name: 'Laptops', icon: 'laptop', sortOrder: 1 },
          { name: 'Desktop Computers', icon: 'desktop', sortOrder: 2 },
          { name: 'Computer Accessories', icon: 'keyboard', sortOrder: 3 },
          { name: 'Monitors', icon: 'monitor', sortOrder: 4 },
          { name: 'Printers & Scanners', icon: 'printer', sortOrder: 5 },
          { name: 'Computer Components', icon: 'chip', sortOrder: 6 },
          { name: 'Storage Devices', icon: 'storage', sortOrder: 7 }
        ]
      },
      "TV & Audio": {
        icon: 'tv',
        sortOrder: 3,
        subcategories: [
          { name: 'Televisions', icon: 'tv', sortOrder: 1 },
          { name: 'Home Theater Systems', icon: 'speaker', sortOrder: 2 },
          { name: 'Audio Players', icon: 'music', sortOrder: 3 },
          { name: 'Headphones & Earphones', icon: 'headphones', sortOrder: 4 },
          { name: 'Speakers', icon: 'speaker', sortOrder: 5 },
          { name: 'Radio & Audio Systems', icon: 'radio', sortOrder: 6 }
        ]
      },
      "Cameras & Photography": {
        icon: 'camera',
        sortOrder: 4,
        subcategories: [
          { name: 'Digital Cameras', icon: 'camera', sortOrder: 1 },
          { name: 'DSLR Cameras', icon: 'dslr', sortOrder: 2 },
          { name: 'Camera Accessories', icon: 'lens', sortOrder: 3 },
          { name: 'Video Cameras', icon: 'video', sortOrder: 4 },
          { name: 'Drones', icon: 'drone', sortOrder: 5 },
          { name: 'Binoculars & Telescopes', icon: 'binoculars', sortOrder: 6 }
        ]
      },
      "Gaming & Consoles": {
        icon: 'gamepad',
        sortOrder: 5,
        subcategories: [
          { name: 'Gaming Consoles', icon: 'console', sortOrder: 1 },
          { name: 'Video Games', icon: 'game', sortOrder: 2 },
          { name: 'Gaming Accessories', icon: 'controller', sortOrder: 3 },
          { name: 'Gaming Chairs', icon: 'chair', sortOrder: 4 },
          { name: 'Virtual Reality (VR)', icon: 'vr', sortOrder: 5 }
        ]
      }
    }
  },
  "Vehicles": {
    icon: 'car',
    featured: true,
    sortOrder: 2,
    description: 'Cars, motorcycles, and transportation',
    subcategories: {
      "Cars": {
        icon: 'car',
        sortOrder: 1,
        subcategories: [
          { name: 'Sedan', icon: 'sedan', sortOrder: 1 },
          { name: 'SUV', icon: 'suv', sortOrder: 2 },
          { name: 'Hatchback', icon: 'hatchback', sortOrder: 3 },
          { name: 'Coupe', icon: 'coupe', sortOrder: 4 },
          { name: 'Convertible', icon: 'convertible', sortOrder: 5 },
          { name: 'Trucks & Pickups', icon: 'truck', sortOrder: 6 },
          { name: 'Van & Minibus', icon: 'van', sortOrder: 7 },
          { name: 'Wagon', icon: 'wagon', sortOrder: 8 }
        ]
      },
      "Motorcycles": {
        icon: 'motorcycle',
        sortOrder: 2,
        subcategories: [
          { name: 'Sport Bikes', icon: 'sportbike', sortOrder: 1 },
          { name: 'Cruiser', icon: 'cruiser', sortOrder: 2 },
          { name: 'Scooter', icon: 'scooter', sortOrder: 3 },
          { name: 'Off-road & Dirt Bike', icon: 'dirtbike', sortOrder: 4 },
          { name: 'Motorcycle Accessories', icon: 'helmet', sortOrder: 5 },
          { name: 'Electric Motorcycles', icon: 'electric-bike', sortOrder: 6 }
        ]
      },
      "Heavy Vehicles": {
        icon: 'truck',
        sortOrder: 3,
        subcategories: [
          { name: 'Trucks', icon: 'truck', sortOrder: 1 },
          { name: 'Trailers', icon: 'trailer', sortOrder: 2 },
          { name: 'Buses', icon: 'bus', sortOrder: 3 },
          { name: 'Construction Equipment', icon: 'tractor', sortOrder: 4 },
          { name: 'Agricultural Equipment', icon: 'tractor', sortOrder: 5 }
        ]
      },
      "Vehicle Parts & Accessories": {
        icon: 'wrench',
        sortOrder: 4,
        subcategories: [
          { name: 'Engine Parts', icon: 'engine', sortOrder: 1 },
          { name: 'Body Parts', icon: 'car-body', sortOrder: 2 },
          { name: 'Wheels & Tires', icon: 'wheel', sortOrder: 3 },
          { name: 'Car Electronics', icon: 'car-electronics', sortOrder: 4 },
          { name: 'Oil & Lubricants', icon: 'oil', sortOrder: 5 },
          { name: 'Car Accessories', icon: 'accessories', sortOrder: 6 }
        ]
      },
      "Boats & Watercraft": {
        icon: 'boat',
        sortOrder: 5,
        subcategories: [
          { name: 'Speed Boats', icon: 'speedboat', sortOrder: 1 },
          { name: 'Fishing Boats', icon: 'fishing-boat', sortOrder: 2 },
          { name: 'Jet Skis', icon: 'jetski', sortOrder: 3 },
          { name: 'Boat Accessories', icon: 'anchor', sortOrder: 4 },
          { name: 'Boat Engines', icon: 'boat-engine', sortOrder: 5 }
        ]
      }
    }
  },
  "Property": {
    icon: 'home',
    featured: true,
    sortOrder: 3,
    description: 'Real estate and property rentals',
    subcategories: {
      "For Sale: Houses & Apartments": {
        icon: 'house-sale',
        sortOrder: 1,
        subcategories: [
          { name: 'Apartments', icon: 'apartment', sortOrder: 1 },
          { name: 'Houses', icon: 'house', sortOrder: 2 },
          { name: 'Villas', icon: 'villa', sortOrder: 3 },
          { name: 'Townhouses', icon: 'townhouse', sortOrder: 4 },
          { name: 'Land & Plots', icon: 'land', sortOrder: 5 },
          { name: 'Commercial Properties', icon: 'commercial', sortOrder: 6 }
        ]
      },
      "For Rent: Houses & Apartments": {
        icon: 'house-rent',
        sortOrder: 2,
        subcategories: [
          { name: 'Apartments for Rent', icon: 'apartment-rent', sortOrder: 1 },
          { name: 'Houses for Rent', icon: 'house-rent', sortOrder: 2 },
          { name: 'Rooms for Rent', icon: 'room', sortOrder: 3 },
          { name: 'Commercial Spaces for Rent', icon: 'office-rent', sortOrder: 4 },
          { name: 'Short Term Rentals', icon: 'short-term', sortOrder: 5 }
        ]
      },
      "Commercial Property": {
        icon: 'building',
        sortOrder: 3,
        subcategories: [
          { name: 'Office Spaces', icon: 'office', sortOrder: 1 },
          { name: 'Shops & Retail', icon: 'shop', sortOrder: 2 },
          { name: 'Warehouses', icon: 'warehouse', sortOrder: 3 },
          { name: 'Hotels & Restaurants', icon: 'hotel', sortOrder: 4 },
          { name: 'Industrial Properties', icon: 'industrial', sortOrder: 5 }
        ]
      }
    }
  },
  "Home & Garden": {
    icon: 'home',
    featured: true,
    sortOrder: 4,
    description: 'Furniture, appliances, and garden supplies',
    subcategories: {
      "Furniture": {
        icon: 'sofa',
        sortOrder: 1,
        subcategories: [
          { name: 'Living Room Furniture', icon: 'sofa', sortOrder: 1 },
          { name: 'Bedroom Furniture', icon: 'bed', sortOrder: 2 },
          { name: 'Kitchen & Dining', icon: 'dining', sortOrder: 3 },
          { name: 'Office Furniture', icon: 'desk', sortOrder: 4 },
          { name: 'Outdoor Furniture', icon: 'outdoor', sortOrder: 5 },
          { name: 'Kids Furniture', icon: 'kids-furniture', sortOrder: 6 }
        ]
      },
      "Home Appliances": {
        icon: 'blender',
        sortOrder: 2,
        subcategories: [
          { name: 'Kitchen Appliances', icon: 'kitchen', sortOrder: 1 },
          { name: 'Laundry Appliances', icon: 'washing', sortOrder: 2 },
          { name: 'Cleaning Appliances', icon: 'vacuum', sortOrder: 3 },
          { name: 'Air Conditioners', icon: 'ac', sortOrder: 4 },
          { name: 'Heating & Cooling', icon: 'heating', sortOrder: 5 },
          { name: 'Small Appliances', icon: 'blender', sortOrder: 6 }
        ]
      },
      "Garden & Outdoor": {
        icon: 'tree',
        sortOrder: 3,
        subcategories: [
          { name: 'Garden Tools', icon: 'tools', sortOrder: 1 },
          { name: 'Plants & Seeds', icon: 'plant', sortOrder: 2 },
          { name: 'Outdoor Equipment', icon: 'outdoor-equipment', sortOrder: 3 },
          { name: 'BBQ & Grills', icon: 'bbq', sortOrder: 4 },
          { name: 'Patio & Outdoor Decor', icon: 'patio', sortOrder: 5 },
          { name: 'Pools & Spa', icon: 'pool', sortOrder: 6 }
        ]
      },
      "Home Decor": {
        icon: 'decor',
        sortOrder: 4,
        subcategories: [
          { name: 'Lighting', icon: 'lamp', sortOrder: 1 },
          { name: 'Curtains & Blinds', icon: 'curtains', sortOrder: 2 },
          { name: 'Rugs & Carpets', icon: 'rug', sortOrder: 3 },
          { name: 'Wall Decor', icon: 'picture', sortOrder: 4 },
          { name: 'Cushions & Pillows', icon: 'cushion', sortOrder: 5 }
        ]
      }
    }
  },
  "Fashion & Beauty": {
    icon: 'shirt',
    featured: true,
    sortOrder: 5,
    description: 'Clothing, shoes, and beauty products',
    subcategories: {
      "Men's Fashion": {
        icon: 'man',
        sortOrder: 1,
        subcategories: [
          { name: "Men's Clothing", icon: 'shirt', sortOrder: 1 },
          { name: "Men's Shoes", icon: 'shoes', sortOrder: 2 },
          { name: "Men's Accessories", icon: 'watch', sortOrder: 3 },
          { name: "Men's Bags", icon: 'bag', sortOrder: 4 },
          { name: "Men's Watches", icon: 'watch', sortOrder: 5 },
          { name: "Men's Grooming", icon: 'grooming', sortOrder: 6 }
        ]
      },
      "Women's Fashion": {
        icon: 'woman',
        sortOrder: 2,
        subcategories: [
          { name: "Women's Clothing", icon: 'dress', sortOrder: 1 },
          { name: "Women's Shoes", icon: 'heels', sortOrder: 2 },
          { name: "Women's Accessories", icon: 'jewelry', sortOrder: 3 },
          { name: "Women's Bags", icon: 'handbag', sortOrder: 4 },
          { name: "Women's Watches", icon: 'watch', sortOrder: 5 },
          { name: "Women's Jewelry", icon: 'jewelry', sortOrder: 6 }
        ]
      },
      "Kids & Baby": {
        icon: 'baby',
        sortOrder: 3,
        subcategories: [
          { name: "Kids' Clothing", icon: 'kids-clothes', sortOrder: 1 },
          { name: "Kids' Shoes", icon: 'kids-shoes', sortOrder: 2 },
          { name: 'Baby Products', icon: 'baby-products', sortOrder: 3 },
          { name: 'Toys & Games', icon: 'toys', sortOrder: 4 },
          { name: 'Kids Furniture', icon: 'kids-furniture', sortOrder: 5 },
          { name: 'Strollers & Car Seats', icon: 'stroller', sortOrder: 6 }
        ]
      },
      "Beauty & Health": {
        icon: 'cosmetics',
        sortOrder: 4,
        subcategories: [
          { name: 'Makeup', icon: 'makeup', sortOrder: 1 },
          { name: 'Skincare', icon: 'skincare', sortOrder: 2 },
          { name: 'Hair Care', icon: 'hair', sortOrder: 3 },
          { name: 'Fragrances', icon: 'perfume', sortOrder: 4 },
          { name: 'Personal Care', icon: 'personal-care', sortOrder: 5 },
          { name: 'Health & Wellness', icon: 'health', sortOrder: 6 }
        ]
      }
    }
  },
  "Jobs": {
    icon: 'briefcase',
    featured: true,
    sortOrder: 6,
    description: 'Employment opportunities and services',
    subcategories: {
      "IT & Technology": {
        icon: 'computer',
        sortOrder: 1,
        subcategories: [
          { name: 'Software Development', icon: 'code', sortOrder: 1 },
          { name: 'IT Support', icon: 'support', sortOrder: 2 },
          { name: 'Network Administration', icon: 'network', sortOrder: 3 },
          { name: 'Data Science', icon: 'data', sortOrder: 4 },
          { name: 'Cybersecurity', icon: 'security', sortOrder: 5 },
          { name: 'UI/UX Design', icon: 'design', sortOrder: 6 }
        ]
      },
      "Sales & Marketing": {
        icon: 'marketing',
        sortOrder: 2,
        subcategories: [
          { name: 'Sales Executive', icon: 'sales', sortOrder: 1 },
          { name: 'Digital Marketing', icon: 'digital', sortOrder: 2 },
          { name: 'Content Marketing', icon: 'content', sortOrder: 3 },
          { name: 'Brand Management', icon: 'brand', sortOrder: 4 },
          { name: 'Market Research', icon: 'research', sortOrder: 5 },
          { name: 'Public Relations', icon: 'pr', sortOrder: 6 }
        ]
      },
      "Education & Training": {
        icon: 'education',
        sortOrder: 3,
        subcategories: [
          { name: 'Teaching', icon: 'teaching', sortOrder: 1 },
          { name: 'Training & Development', icon: 'training', sortOrder: 2 },
          { name: 'Academic Research', icon: 'research', sortOrder: 3 },
          { name: 'Online Education', icon: 'online', sortOrder: 4 },
          { name: 'Curriculum Development', icon: 'curriculum', sortOrder: 5 },
          { name: 'Educational Administration', icon: 'admin', sortOrder: 6 }
        ]
      },
      "Finance & Accounting": {
        icon: 'finance',
        sortOrder: 4,
        subcategories: [
          { name: 'Accounting', icon: 'accounting', sortOrder: 1 },
          { name: 'Financial Analysis', icon: 'analysis', sortOrder: 2 },
          { name: 'Bookkeeping', icon: 'bookkeeping', sortOrder: 3 },
          { name: 'Tax Services', icon: 'tax', sortOrder: 4 },
          { name: 'Investment Banking', icon: 'banking', sortOrder: 5 },
          { name: 'Insurance', icon: 'insurance', sortOrder: 6 }
        ]
      }
    }
  },
  "Services": {
    icon: 'service',
    featured: true,
    sortOrder: 7,
    description: 'Professional and personal services',
    subcategories: {
      "Home Services": {
        icon: 'home-service',
        sortOrder: 1,
        subcategories: [
          { name: 'Plumbing', icon: 'plumber', sortOrder: 1 },
          { name: 'Electrical Work', icon: 'electrician', sortOrder: 2 },
          { name: 'Carpentry', icon: 'carpenter', sortOrder: 3 },
          { name: 'Cleaning Services', icon: 'cleaning', sortOrder: 4 },
          { name: 'Pest Control', icon: 'pest', sortOrder: 5 },
          { name: 'Home Repair', icon: 'repair', sortOrder: 6 }
        ]
      },
      "Business Services": {
        icon: 'business',
        sortOrder: 2,
        subcategories: [
          { name: 'Consulting', icon: 'consulting', sortOrder: 1 },
          { name: 'Accounting & Finance', icon: 'accounting', sortOrder: 2 },
          { name: 'Legal Services', icon: 'legal', sortOrder: 3 },
          { name: 'Web Development', icon: 'web', sortOrder: 4 },
          { name: 'Marketing & Advertising', icon: 'marketing', sortOrder: 5 },
          { name: 'Business Consulting', icon: 'consulting', sortOrder: 6 }
        ]
      },
      "Personal Services": {
        icon: 'personal',
        sortOrder: 3,
        subcategories: [
          { name: 'Beauty & Salon', icon: 'salon', sortOrder: 1 },
          { name: 'Fitness & Training', icon: 'fitness', sortOrder: 2 },
          { name: 'Photography', icon: 'photography', sortOrder: 3 },
          { name: 'Event Planning', icon: 'event', sortOrder: 4 },
          { name: 'Tutoring', icon: 'tutoring', sortOrder: 5 },
          { name: 'Translation Services', icon: 'translation', sortOrder: 6 }
        ]
      },
      "Transportation & Logistics": {
        icon: 'logistics',
        sortOrder: 4,
        subcategories: [
          { name: 'Moving Services', icon: 'moving', sortOrder: 1 },
          { name: 'Cargo & Freight', icon: 'cargo', sortOrder: 2 },
          { name: 'Courier Services', icon: 'courier', sortOrder: 3 },
          { name: 'Storage Services', icon: 'storage', sortOrder: 4 },
          { name: 'Vehicle Rental', icon: 'rental', sortOrder: 5 },
          { name: 'Delivery Services', icon: 'delivery', sortOrder: 6 }
        ]
      }
    }
  }
};

// Simple slugify function to avoid dependency issues
function simpleSlugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

async function seedJijiCategoriesFixed() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mulumart');
    console.log('✅ Connected to MongoDB');

    // Clear existing categories
    await Category.deleteMany({});
    console.log('🧹 Cleared existing categories');

    const createdCategories = [];
    let totalCategories = 0;

    // Process each main category
    for (const [mainCategoryName, mainCategoryData] of Object.entries(jijiCategories)) {
      console.log(`\n📁 Processing Main Category: ${mainCategoryName}`);
      
      // Create main category
      const mainCategory = await Category.create({
        name: mainCategoryName,
        icon: mainCategoryData.icon,
        featured: mainCategoryData.featured,
        sortOrder: mainCategoryData.sortOrder,
        description: mainCategoryData.description,
        parent: null,
        isActive: true,
        slug: simpleSlugify(mainCategoryName)
      });
      createdCategories.push(mainCategory);
      totalCategories++;

      console.log(`  ✅ Created: ${mainCategoryName}`);

      // Process subcategories
      for (const [subCategoryName, subCategoryData] of Object.entries(mainCategoryData.subcategories)) {
        console.log(`  📂 Processing Subcategory: ${subCategoryName}`);
        
        // Create subcategory
        const subCategory = await Category.create({
          name: subCategoryName,
          icon: subCategoryData.icon,
          sortOrder: subCategoryData.sortOrder,
          parent: mainCategory._id,
          isActive: true,
          slug: simpleSlugify(subCategoryName)
        });
        createdCategories.push(subCategory);
        totalCategories++;

        console.log(`    ✅ Created: ${subCategoryName}`);

        // Process sub-subcategories
        for (const subSubCategoryData of subCategoryData.subcategories) {
          console.log(`    📄 Processing Sub-Subcategory: ${subSubCategoryData.name}`);
          
          // Create sub-subcategory
          const subSubCategory = await Category.create({
            name: subSubCategoryData.name,
            icon: subSubCategoryData.icon,
            sortOrder: subSubCategoryData.sortOrder,
            parent: subCategory._id,
            isActive: true,
            slug: simpleSlugify(subSubCategoryData.name)
          });
          createdCategories.push(subSubCategory);
          totalCategories++;

          console.log(`      ✅ Created: ${subSubCategoryData.name}`);
        }
      }
    }

    console.log(`\n🎉 Jiji Categories Seeded Successfully!`);
    console.log(`📊 Summary:`);
    console.log(`  - Main Categories: ${Object.keys(jijiCategories).length}`);
    console.log(`  - Total Categories Created: ${totalCategories}`);
    
    // Show hierarchy summary
    console.log(`\n📋 Category Hierarchy:`);
    for (const [mainCategoryName, mainCategoryData] of Object.entries(jijiCategories)) {
      console.log(`📁 ${mainCategoryName}`);
      for (const [subCategoryName, subCategoryData] of Object.entries(mainCategoryData.subcategories)) {
        console.log(`  📂 ${subCategoryName} (${subCategoryData.subcategories.length} sub-subcategories)`);
        for (const subSubCategory of subCategoryData.subcategories) {
          console.log(`    📄 ${subSubCategory.name}`);
        }
      }
    }

  } catch (error) {
    console.error('❌ Error seeding Jiji categories:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the seeder
seedJijiCategoriesFixed();
