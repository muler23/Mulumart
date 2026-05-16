const mongoose = require('mongoose');
const slugify = require('slugify');

const CategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a category name'],
      unique: true,
      trim: true,
      maxlength: [50, 'Name cannot be more than 50 characters'],
    },
    slug: String,
    description: {
      type: String,
      maxlength: [500, 'Description cannot be more than 500 characters'],
    },
    parentCategory: {
      type: mongoose.Schema.ObjectId,
      ref: 'Category',
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    icon: {
      type: String,
      default: 'category',
    },
    featured: {
      type: Boolean,
      default: false,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
    image: {
      type: String,
      default: 'no-photo.jpg',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Create category slug from the name
CategorySchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// Reverse populate with virtuals
CategorySchema.virtual('subcategories', {
  ref: 'Category',
  localField: '_id',
  foreignField: 'parentCategory',
  justOne: false,
});

// Cascade delete subcategories when a category is deleted
CategorySchema.pre('remove', async function (next) {
  await this.model('Category').deleteMany({ parentCategory: this._id });
  next();
});

// Static method to get the count of ads in a category
CategorySchema.statics.getAdCount = async function (categoryId) {
  const obj = await this.aggregate([
    {
      $match: { _id: mongoose.Types.ObjectId(categoryId) },
    },
    {
      $lookup: {
        from: 'ads',
        localField: '_id',
        foreignField: 'category',
        as: 'ads',
      },
    },
    {
      $project: {
        adCount: { $size: '$ads' },
      },
    },
  ]);

  try {
    await this.model('Category').findByIdAndUpdate(categoryId, {
      adCount: obj[0] ? obj[0].adCount : 0,
    });
  } catch (err) {
    console.error(err);
  }
};

// Call getAdCount after save or remove of an ad
CategorySchema.post('save', function () {
  this.constructor.getAdCount(this._id);
});

CategorySchema.post('remove', function () {
  this.constructor.getAdCount(this._id);
});

module.exports = mongoose.model('Category', CategorySchema);
