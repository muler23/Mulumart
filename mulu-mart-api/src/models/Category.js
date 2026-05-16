const mongoose = require('mongoose');
const slugify = require('slugify');

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a category name'],
      unique: true,
      trim: true,
      maxlength: [50, 'Category name cannot be more than 50 characters'],
      index: true // Add index for faster queries
    },
    slug: {
      type: String,
      index: true // Add index for faster queries
    },
    description: {
      type: String,
      trim: true,
    },
    parent: {
      type: mongoose.Schema.ObjectId,
      ref: 'Category',
      index: true // Add index for faster queries
    },
    icon: {
      type: String,
      default: 'category',
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true // Add index for faster queries
    },
    featured: {
      type: Boolean,
      default: false,
    },
    sortOrder: {
      type: Number,
      default: 0,
      index: true // Add index for faster queries
    },
    image: String,
    seoTitle: String,
    seoDescription: String,
    seoKeywords: [String],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for subcategories
categorySchema.virtual('subcategories', {
  ref: 'Category',
  localField: '_id',
  foreignField: 'parent',
});

// Virtual for ads count
categorySchema.virtual('adCount', {
  ref: 'Ad',
  localField: '_id',
  foreignField: 'category',
  count: true,
});

// Create slug from name (temporarily disabled for seeding)
// categorySchema.pre('save', function (next) {
//   this.slug = slugify(this.name, { lower: true });
//   next();
// });

// Populate subcategories when finding a category (temporarily disabled)
// categorySchema.pre(/^find/, function (next) {
//   this.populate({
//     path: 'subcategories',
//     select: 'name slug icon',
//   });
//   next();
// });

// Static method to get featured categories
categorySchema.statics.getFeatured = function () {
  return this.find({ featured: true, isActive: true })
    .sort('sortOrder')
    .select('name slug icon')
    .limit(8);
};

// Static method to get categories with subcategories
categorySchema.statics.getNestedCategories = async function () {
  const categories = await this.find({ parent: null, isActive: true })
    .sort('sortOrder')
    .select('name slug icon')
    .lean();

  for (const category of categories) {
    const subcategories = await this.find({ parent: category._id, isActive: true })
      .sort('sortOrder')
      .select('name slug icon')
      .lean();
    
    if (subcategories.length > 0) {
      category.subcategories = subcategories;
    }
  }

  return categories;
};

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
