// controllers/searchController.js
const Ad = require('../models/Ad');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const geocoder = require('../utils/geocoder');

// @desc    Search ads
// @route   GET /api/v1/search
// @access  Public
exports.searchAds = asyncHandler(async (req, res, next) => {
  const { q, category, location, minPrice, maxPrice, condition, sort, page = 1, limit = 10 } = req.query;

  // Build query object
  const query = { isActive: true, isApproved: true };

  // Search by keyword
  if (q) {
    query.$or = [
      { title: { $regex: q, $options: 'i' } },
      { description: { $regex: q, $options: 'i' } }
    ];
  }

  // Filter by category
  if (category) {
    // Check if it's a valid category ID
    const categoryDoc = await Category.findById(category);
    if (!categoryDoc) {
      return next(new ErrorResponse(`Category not found with id of ${category}`, 404));
    }
    
    // Get all child categories
    const getChildCategories = async (categoryId) => {
      const categories = await Category.find({ parentCategory: categoryId });
      let result = [categoryId];
      
      for (const cat of categories) {
        const childCategories = await getChildCategories(cat._id);
        result = [...result, ...childCategories];
      }
      
      return result;
    };

    const categoryIds = await getChildCategories(category);
    query.category = { $in: categoryIds };
  }

  // Filter by location
  if (location) {
    const loc = await geocoder.geocode(location);
    if (loc && loc.length > 0) {
      const { latitude, longitude } = loc[0];
      
      // Find ads within 50 miles
      const radius = 50 / 3963.2; // Earth's radius in miles
      
      query.location = {
        $geoWithin: { $centerSphere: [[longitude, latitude], radius] }
      };
    } else {
      // If geocoding fails, try a simple text search
      query['location.address'] = { $regex: location, $options: 'i' };
    }
  }

  // Filter by price range
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }

  // Filter by condition
  if (condition) {
    query.condition = { $in: condition.split(',') };
  }

  // Build sort
  let sortBy = '-createdAt'; // Default sort by newest
  if (sort) {
    const sortOptions = {
      newest: '-createdAt',
      oldest: 'createdAt',
      'price-asc': 'price',
      'price-desc': '-price'
    };
    sortBy = sortOptions[sort] || sort;
  }

  // Execute query
  const skip = (page - 1) * limit;

  const [ads, total] = await Promise.all([
    Ad.find(query)
      .sort(sortBy)
      .skip(skip)
      .limit(Number(limit))
      .populate('user', 'name rating')
      .populate('category', 'name'),
    Ad.countDocuments(query)
  ]);

  // Calculate pagination
  const pages = Math.ceil(total / limit);
  const hasNextPage = page < pages;
  const hasPreviousPage = page > 1;

  res.status(200).json({
    success: true,
    count: ads.length,
    total,
    pages,
    page: Number(page),
    hasNextPage,
    hasPreviousPage,
    data: ads
  });
});

// @desc    Get search suggestions
// @route   GET /api/v1/search/suggestions
// @access  Public
exports.getSearchSuggestions = asyncHandler(async (req, res, next) => {
  const { q } = req.query;

  if (!q) {
    return res.status(200).json({
      success: true,
      data: []
    });
  }

  // Search in titles
  const titles = await Ad.aggregate([
    {
      $match: {
        title: { $regex: q, $options: 'i' },
        isActive: true,
        isApproved: true
      }
    },
    {
      $group: {
        _id: { $toLower: '$title' },
        count: { $sum: 1 }
      }
    },
    {
      $project: {
        _id: 0,
        text: '$_id',
        count: 1
      }
    },
    { $sort: { count: -1 } },
    { $limit: 5 }
  ]);

  // Search in categories
  const categories = await Category.aggregate([
    {
      $match: {
        name: { $regex: q, $options: 'i' },
        isActive: true
      }
    },
    {
      $project: {
        _id: 0,
        text: '$name',
        type: 'category'
      }
    },
    { $limit: 3 }
  ]);

  // Search in locations
  const locations = await Ad.aggregate([
    {
      $match: {
        'location.address': { $regex: q, $options: 'i' },
        isActive: true,
        isApproved: true
      }
    },
    {
      $group: {
        _id: { $toLower: '$location.address' },
        count: { $sum: 1 }
      }
    },
    {
      $project: {
        _id: 0,
        text: '$_id',
        count: 1,
        type: 'location'
      }
    },
    { $sort: { count: -1 } },
    { $limit: 3 }
  ]);

  // Combine and deduplicate results
  const suggestions = [
    ...titles,
    ...categories,
    ...locations
  ].sort((a, b) => (b.count || 0) - (a.count || 0))
   .slice(0, 10);

  res.status(200).json({
    success: true,
    data: suggestions
  });
});

// @desc    Get popular searches
// @route   GET /api/v1/search/popular
// @access  Public
exports.getPopularSearches = asyncHandler(async (req, res, next) => {
  // In a production app, you might want to track actual searches
  // and return the most popular ones. For now, we'll return some defaults.
  const popularSearches = [
    { text: 'iPhone', count: 1250 },
    { text: 'Laptop', count: 980 },
    { text: 'Car', count: 876 },
    { text: 'Apartment for rent', count: 765 },
    { text: 'Bicycle', count: 654 },
    { text: 'Furniture', count: 543 },
    { text: 'Job', count: 432 },
    { text: 'Motorcycle', count: 321 },
    { text: 'Camera', count: 210 },
    { text: 'Books', count: 198 }
  ];

  res.status(200).json({
    success: true,
    data: popularSearches
  });
});