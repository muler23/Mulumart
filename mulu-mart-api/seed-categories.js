const mongoose = require('mongoose');
const Category = require('./src/models/Category');
require('dotenv').config();

console.log('Starting seeder...');
console.log('MONGODB_URI:', process.env.MONGODB_URI);

// Connect to database
const connectDB = require('./src/config/db');
connectDB().then(() => {
  console.log('Database connected, starting seeding...');
  seedCategories();
}).catch(err => {
  console.error('Database connection failed:', err);
  process.exit(1);
});

// Comprehensive hierarchical categories like Jiji
const categories = [
  // Main Category: Electronics
  {
    name: 'Electronics',
    icon: 'electronics',
    featured: true,
    sortOrder: 1,
    description: 'Electronic devices, gadgets, and accessories',
    subcategories: [
      {
        name: 'Mobile Phones',
        icon: 'phone',
        sortOrder: 1,
        subcategories: [
          { name: 'Smartphones', icon: 'smartphone', sortOrder: 1 },
          { name: 'Feature Phones', icon: 'phone', sortOrder: 2 },
          { name: 'Phone Accessories', icon: 'headphones', sortOrder: 3 },
          { name: 'Tablets', icon: 'tablet', sortOrder: 4 }
        ]
      },
      {
        name: 'Computers & Laptops',
        icon: 'laptop',
        sortOrder: 2,
        subcategories: [
          { name: 'Laptops', icon: 'laptop', sortOrder: 1 },
          { name: 'Desktop Computers', icon: 'desktop', sortOrder: 2 },
          { name: 'Computer Accessories', icon: 'keyboard', sortOrder: 3 },
          { name: 'Monitors', icon: 'monitor', sortOrder: 4 },
          { name: 'Printers & Scanners', icon: 'printer', sortOrder: 5 }
        ]
      },
      {
        name: 'TV & Audio',
        icon: 'tv',
        sortOrder: 3,
        subcategories: [
          { name: 'Televisions', icon: 'tv', sortOrder: 1 },
          { name: 'Home Theater Systems', icon: 'speaker', sortOrder: 2 },
          { name: 'Audio Players', icon: 'music', sortOrder: 3 },
          { name: 'Headphones & Earphones', icon: 'headphones', sortOrder: 4 },
          { name: 'Speakers', icon: 'speaker', sortOrder: 5 }
        ]
      },
      {
        name: 'Cameras & Photography',
        icon: 'camera',
        sortOrder: 4,
        subcategories: [
          { name: 'Digital Cameras', icon: 'camera', sortOrder: 1 },
          { name: 'DSLR Cameras', icon: 'dslr', sortOrder: 2 },
          { name: 'Camera Accessories', icon: 'lens', sortOrder: 3 },
          { name: 'Video Cameras', icon: 'video', sortOrder: 4 }
        ]
      },
      {
        name: 'Gaming & Consoles',
        icon: 'gamepad',
        sortOrder: 5,
        subcategories: [
          { name: 'Gaming Consoles', icon: 'console', sortOrder: 1 },
          { name: 'Video Games', icon: 'game', sortOrder: 2 },
          { name: 'Gaming Accessories', icon: 'controller', sortOrder: 3 }
        ]
      }
    ]
  },

  // Main Category: Vehicles
  {
    name: 'Vehicles',
    icon: 'car',
    featured: true,
    sortOrder: 2,
    description: 'Cars, motorcycles, and transportation',
    subcategories: [
      {
        name: 'Cars',
        icon: 'car',
        sortOrder: 1,
        subcategories: [
          { name: 'Sedan', icon: 'sedan', sortOrder: 1 },
          { name: 'SUV', icon: 'suv', sortOrder: 2 },
          { name: 'Hatchback', icon: 'hatchback', sortOrder: 3 },
          { name: 'Coupe', icon: 'coupe', sortOrder: 4 },
          { name: 'Convertible', icon: 'convertible', sortOrder: 5 },
          { name: 'Trucks & Pickups', icon: 'truck', sortOrder: 6 },
          { name: 'Van & Minibus', icon: 'van', sortOrder: 7 }
        ]
      },
      {
        name: 'Motorcycles',
        icon: 'motorcycle',
        sortOrder: 2,
        subcategories: [
          { name: 'Sport Bikes', icon: 'sportbike', sortOrder: 1 },
          { name: 'Cruiser', icon: 'cruiser', sortOrder: 2 },
          { name: 'Scooter', icon: 'scooter', sortOrder: 3 },
          { name: 'Off-road & Dirt Bike', icon: 'dirtbike', sortOrder: 4 },
          { name: 'Motorcycle Accessories', icon: 'helmet', sortOrder: 5 }
        ]
      },
      {
        name: 'Heavy Vehicles',
        icon: 'truck',
        sortOrder: 3,
        subcategories: [
          { name: 'Trucks', icon: 'truck', sortOrder: 1 },
          { name: 'Trailers', icon: 'trailer', sortOrder: 2 },
          { name: 'Buses', icon: 'bus', sortOrder: 3 },
          { name: 'Construction Equipment', icon: 'tractor', sortOrder: 4 }
        ]
      },
      {
        name: 'Vehicle Parts & Accessories',
        icon: 'wrench',
        sortOrder: 4,
        subcategories: [
          { name: 'Engine Parts', icon: 'engine', sortOrder: 1 },
          { name: 'Body Parts', icon: 'car-body', sortOrder: 2 },
          { name: 'Wheels & Tires', icon: 'wheel', sortOrder: 3 },
          { name: 'Car Electronics', icon: 'car-electronics', sortOrder: 4 },
          { name: 'Oil & Lubricants', icon: 'oil', sortOrder: 5 }
        ]
      },
      {
        name: 'Boats & Watercraft',
        icon: 'boat',
        sortOrder: 5,
        subcategories: [
          { name: 'Speed Boats', icon: 'speedboat', sortOrder: 1 },
          { name: 'Fishing Boats', icon: 'fishing-boat', sortOrder: 2 },
          { name: 'Jet Skis', icon: 'jetski', sortOrder: 3 },
          { name: 'Boat Accessories', icon: 'anchor', sortOrder: 4 }
        ]
      }
    ]
  },

  // Main Category: Property
  {
    name: 'Property',
    icon: 'home',
    featured: true,
    sortOrder: 3,
    description: 'Real estate and property rentals',
    subcategories: [
      {
        name: 'For Sale: Houses & Apartments',
        icon: 'house-sale',
        sortOrder: 1,
        subcategories: [
          { name: 'Apartments', icon: 'apartment', sortOrder: 1 },
          { name: 'Houses', icon: 'house', sortOrder: 2 },
          { name: 'Villas', icon: 'villa', sortOrder: 3 },
          { name: 'Townhouses', icon: 'townhouse', sortOrder: 4 },
          { name: 'Land & Plots', icon: 'land', sortOrder: 5 }
        ]
      },
      {
        name: 'For Rent: Houses & Apartments',
        icon: 'house-rent',
        sortOrder: 2,
        subcategories: [
          { name: 'Apartments for Rent', icon: 'apartment-rent', sortOrder: 1 },
          { name: 'Houses for Rent', icon: 'house-rent', sortOrder: 2 },
          { name: 'Rooms for Rent', icon: 'room', sortOrder: 3 },
          { name: 'Commercial Spaces', icon: 'office', sortOrder: 4 }
        ]
      },
      {
        name: 'Commercial Property',
        icon: 'building',
        sortOrder: 3,
        subcategories: [
          { name: 'Office Spaces', icon: 'office', sortOrder: 1 },
          { name: 'Shops & Retail', icon: 'shop', sortOrder: 2 },
          { name: 'Warehouses', icon: 'warehouse', sortOrder: 3 },
          { name: 'Hotels & Restaurants', icon: 'hotel', sortOrder: 4 }
        ]
      }
    ]
  },

  // Main Category: Home & Garden
  {
    name: 'Home & Garden',
    icon: 'home',
    featured: true,
    sortOrder: 4,
    description: 'Furniture, appliances, and garden supplies',
    subcategories: [
      {
        name: 'Furniture',
        icon: 'sofa',
        sortOrder: 1,
        subcategories: [
          { name: 'Living Room Furniture', icon: 'sofa', sortOrder: 1 },
          { name: 'Bedroom Furniture', icon: 'bed', sortOrder: 2 },
          { name: 'Kitchen & Dining', icon: 'dining', sortOrder: 3 },
          { name: 'Office Furniture', icon: 'desk', sortOrder: 4 },
          { name: 'Outdoor Furniture', icon: 'outdoor', sortOrder: 5 }
        ]
      },
      {
        name: 'Home Appliances',
        icon: 'blender',
        sortOrder: 2,
        subcategories: [
          { name: 'Kitchen Appliances', icon: 'kitchen', sortOrder: 1 },
          { name: 'Laundry Appliances', icon: 'washing', sortOrder: 2 },
          { name: 'Cleaning Appliances', icon: 'vacuum', sortOrder: 3 },
          { name: 'Air Conditioners', icon: 'ac', sortOrder: 4 }
        ]
      },
      {
        name: 'Garden & Outdoor',
        icon: 'tree',
        sortOrder: 3,
        subcategories: [
          { name: 'Garden Tools', icon: 'tools', sortOrder: 1 },
          { name: 'Plants & Seeds', icon: 'plant', sortOrder: 2 },
          { name: 'Outdoor Equipment', icon: 'outdoor-equipment', sortOrder: 3 },
          { name: 'BBQ & Grills', icon: 'bbq', sortOrder: 4 }
        ]
      }
    ]
  },

  // Main Category: Fashion & Beauty
  {
    name: 'Fashion & Beauty',
    icon: 'shirt',
    featured: true,
    sortOrder: 5,
    description: 'Clothing, shoes, and beauty products',
    subcategories: [
      {
        name: "Men's Fashion",
        icon: 'man',
        sortOrder: 1,
        subcategories: [
          { name: "Men's Clothing", icon: 'shirt', sortOrder: 1 },
          { name: "Men's Shoes", icon: 'shoes', sortOrder: 2 },
          { name: "Men's Accessories", icon: 'watch', sortOrder: 3 },
          { name: "Men's Bags", icon: 'bag', sortOrder: 4 }
        ]
      },
      {
        name: "Women's Fashion",
        icon: 'woman',
        sortOrder: 2,
        subcategories: [
          { name: "Women's Clothing", icon: 'dress', sortOrder: 1 },
          { name: "Women's Shoes", icon: 'heels', sortOrder: 2 },
          { name: "Women's Accessories", icon: 'jewelry', sortOrder: 3 },
          { name: "Women's Bags", icon: 'handbag', sortOrder: 4 }
        ]
      },
      {
        name: 'Kids & Baby',
        icon: 'baby',
        sortOrder: 3,
        subcategories: [
          { name: "Kids' Clothing", icon: 'kids-clothes', sortOrder: 1 },
          { name: "Kids' Shoes", icon: 'kids-shoes', sortOrder: 2 },
          { name: 'Baby Products', icon: 'baby-products', sortOrder: 3 },
          { name: 'Toys & Games', icon: 'toys', sortOrder: 4 }
        ]
      },
      {
        name: 'Beauty & Health',
        icon: 'cosmetics',
        sortOrder: 4,
        subcategories: [
          { name: 'Makeup', icon: 'makeup', sortOrder: 1 },
          { name: 'Skincare', icon: 'skincare', sortOrder: 2 },
          { name: 'Hair Care', icon: 'hair', sortOrder: 3 },
          { name: 'Fragrances', icon: 'perfume', sortOrder: 4 }
        ]
      }
    ]
  },

  // Main Category: Jobs
  {
    name: 'Jobs',
    icon: 'briefcase',
    featured: true,
    sortOrder: 6,
    description: 'Employment opportunities and services',
    subcategories: [
      {
        name: 'IT & Technology',
        icon: 'computer',
        sortOrder: 1,
        subcategories: [
          { name: 'Software Development', icon: 'code', sortOrder: 1 },
          { name: 'IT Support', icon: 'support', sortOrder: 2 },
          { name: 'Network Administration', icon: 'network', sortOrder: 3 },
          { name: 'Data Science', icon: 'data', sortOrder: 4 }
        ]
      },
      {
        name: 'Sales & Marketing',
        icon: 'marketing',
        sortOrder: 2,
        subcategories: [
          { name: 'Sales Executive', icon: 'sales', sortOrder: 1 },
          { name: 'Digital Marketing', icon: 'digital', sortOrder: 2 },
          { name: 'Content Marketing', icon: 'content', sortOrder: 3 },
          { name: 'Brand Management', icon: 'brand', sortOrder: 4 }
        ]
      },
      {
        name: 'Education & Training',
        icon: 'education',
        sortOrder: 3,
        subcategories: [
          { name: 'Teaching', icon: 'teaching', sortOrder: 1 },
          { name: 'Training & Development', icon: 'training', sortOrder: 2 },
          { name: 'Academic Research', icon: 'research', sortOrder: 3 },
          { name: 'Online Education', icon: 'online', sortOrder: 4 }
        ]
      }
    ]
  },

  // Main Category: Services
  {
    name: 'Services',
    icon: 'service',
    featured: true,
    sortOrder: 7,
    description: 'Professional and personal services',
    subcategories: [
      {
        name: 'Home Services',
        icon: 'home-service',
        sortOrder: 1,
        subcategories: [
          { name: 'Plumbing', icon: 'plumber', sortOrder: 1 },
          { name: 'Electrical Work', icon: 'electrician', sortOrder: 2 },
          { name: 'Carpentry', icon: 'carpenter', sortOrder: 3 },
          { name: 'Cleaning Services', icon: 'cleaning', sortOrder: 4 }
        ]
      },
      {
        name: 'Business Services',
        icon: 'business',
        sortOrder: 2,
        subcategories: [
          { name: 'Consulting', icon: 'consulting', sortOrder: 1 },
          { name: 'Accounting & Finance', icon: 'accounting', sortOrder: 2 },
          { name: 'Legal Services', icon: 'legal', sortOrder: 3 },
          { name: 'Web Development', icon: 'web', sortOrder: 4 }
        ]
      },
      {
        name: 'Personal Services',
        icon: 'personal',
        sortOrder: 3,
        subcategories: [
          { name: 'Beauty & Salon', icon: 'salon', sortOrder: 1 },
          { name: 'Fitness & Training', icon: 'fitness', sortOrder: 2 },
          { name: 'Photography', icon: 'photography', sortOrder: 3 },
          { name: 'Event Planning', icon: 'event', sortOrder: 4 }
        ]
      }
    ]
  }
];

async function seedCategories() {
  try {
    console.log('Starting category seeding...');

    // Clear existing categories
    await Category.deleteMany({});
    console.log('Cleared existing categories');

    // Create categories recursively
    const createdCategories = [];

    for (const mainCategory of categories) {
      // Create main category
      const main = await Category.create({
        name: mainCategory.name,
        icon: mainCategory.icon,
        featured: mainCategory.featured,
        sortOrder: mainCategory.sortOrder,
        description: mainCategory.description,
        parent: null
      });
      createdCategories.push(main);
      console.log(`Created main category: ${main.name}`);

      // Create subcategories
      if (mainCategory.subcategories) {
        for (const subCategory of mainCategory.subcategories) {
          const sub = await Category.create({
            name: subCategory.name,
            icon: subCategory.icon,
            sortOrder: subCategory.sortOrder,
            parent: main._id
          });
          createdCategories.push(sub);
          console.log(`  Created subcategory: ${sub.name}`);

          // Create sub-subcategories
          if (subCategory.subcategories) {
            for (const subSubCategory of subCategory.subcategories) {
              const subSub = await Category.create({
                name: subSubCategory.name,
                icon: subSubCategory.icon,
                sortOrder: subSubCategory.sortOrder,
                parent: sub._id
              });
              createdCategories.push(subSub);
              console.log(`    Created sub-subcategory: ${subSub.name}`);
            }
          }
        }
      }
    }

    console.log(`\n✅ Successfully created ${createdCategories.length} categories!`);
    console.log('\n📊 Category Summary:');
    console.log(`- Main Categories: ${categories.length}`);
    console.log(`- Total Categories Created: ${createdCategories.length}`);

    // Show hierarchy summary
    console.log('\n📋 Category Hierarchy:');
    for (const mainCategory of categories) {
      console.log(`📁 ${mainCategory.name}`);
      if (mainCategory.subcategories) {
        for (const subCategory of mainCategory.subcategories) {
          console.log(`  📂 ${subCategory.name}`);
          if (subCategory.subcategories) {
            for (const subSubCategory of subCategory.subcategories) {
              console.log(`    📄 ${subSubCategory.name}`);
            }
          }
        }
      }
    }

  } catch (error) {
    console.error('Error seeding categories:', error);
  } finally {
    process.exit(0);
  }
}