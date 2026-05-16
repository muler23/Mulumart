const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a location name'],
      unique: true,
      trim: true,
      maxlength: [100, 'Location name cannot be more than 100 characters'],
    },
    slug: {
      type: String,
      unique: true,
    },
    type: {
      type: String,
      enum: ['country', 'region', 'city', 'neighborhood'],
      default: 'city',
    },
    parent: {
      type: mongoose.Schema.ObjectId,
      ref: 'Location',
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    coordinates: {
      // GeoJSON Point
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
    },
    radius: {
      // For cities/regions, in kilometers
      type: Number,
      default: 10,
    },
    population: Number,
    timezone: String,
    featured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
locationSchema.index({ name: 'text' });
locationSchema.index({ coordinates: '2dsphere' });

// Virtual for sub-locations
locationSchema.virtual('children', {
  ref: 'Location',
  localField: '_id',
  foreignField: 'parent',
});

// Virtual for ads count
locationSchema.virtual('adCount', {
  ref: 'Ad',
  localField: '_id',
  foreignField: 'location',
  count: true,
});

// Create slug from name
locationSchema.pre('save', function (next) {
  this.slug = this.name.toLowerCase().replace(/\s+/g, '-');
  next();
});

// Populate children when finding a location
locationSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'children',
    select: 'name slug type',
  });
  next();
});

// Static method to get featured locations
locationSchema.statics.getFeatured = function () {
  return this.find({ featured: true, isActive: true })
    .sort('name')
    .select('name slug type')
    .limit(10);
};

// Static method to get locations with hierarchy
locationSchema.statics.getNestedLocations = async function () {
  const locations = await this.find({ parent: null, isActive: true })
    .sort('name')
    .select('name slug type')
    .lean();

  for (const location of locations) {
    const children = await this.find({ parent: location._id, isActive: true })
      .sort('name')
      .select('name slug type')
      .lean();
    
    if (children.length > 0) {
      location.children = children;
    }
  }

  return locations;
};

// Static method to find locations near a point
locationSchema.statics.findNearby = function (lng, lat, maxDistance = 10000) {
  return this.find({
    coordinates: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [lng, lat],
        },
        $maxDistance: maxDistance, // in meters
      },
    },
    isActive: true,
  });
};

const Location = mongoose.model('Location', locationSchema);

module.exports = Location;
