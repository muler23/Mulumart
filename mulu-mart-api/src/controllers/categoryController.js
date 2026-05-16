// controllers/categoryController.js
const Category = require('../models/Category');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Get all categories
// @route   GET /api/v1/categories
// @access  Public
exports.getCategories = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc    Get single category
// @route   GET /api/v1/categories/:id
// @access  Public
exports.getCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    return next(
      new ErrorResponse(`Category not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: category
  });
});

// @desc    Create category
// @route   POST /api/v1/categories
// @access  Private/Admin
exports.createCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.create(req.body);

  res.status(201).json({
    success: true,
    data: category
  });
});

// @desc    Update category
// @route   PUT /api/v1/categories/:id
// @access  Private/Admin
exports.updateCategory = asyncHandler(async (req, res, next) => {
  let category = await Category.findById(req.params.id);

  if (!category) {
    return next(
      new ErrorResponse(`Category not found with id of ${req.params.id}`, 404)
    );
  }

  category = await Category.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: category
  });
});

// @desc    Delete category
// @route   DELETE /api/v1/categories/:id
// @access  Private/Admin
exports.deleteCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    return next(
      new ErrorResponse(`Category not found with id of ${req.params.id}`, 404)
    );
  }

  await category.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Get category tree
// @route   GET /api/v1/categories/tree
// @access  Public
exports.getCategoryTree = asyncHandler(async (req, res, next) => {
  const categories = await Category.find({ isActive: true })
    .sort('sortOrder')
    .lean();

  // Build category tree
  const buildTree = (parentId = null) => {
    return categories
      .filter(category => {
        if (parentId === null) {
          return !category.parentCategory;
        }
        return category.parentCategory && category.parentCategory.toString() === parentId;
      })
      .map(category => ({
        ...category,
        children: buildTree(category._id.toString())
      }));
  };

  const categoryTree = buildTree();

  res.status(200).json({
    success: true,
    count: categoryTree.length,
    data: categoryTree
  });
});

// @desc    Get category's ads
// @route   GET /api/v1/categories/:id/ads
// @access  Public
exports.getCategoryAds = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    return next(
      new ErrorResponse(`Category not found with id of ${req.params.id}`, 404)
    );
  }

  // Get all child categories including the current one
  const getChildCategories = async (categoryId) => {
    const categories = await Category.find({ parentCategory: categoryId });
    let result = [categoryId];
    
    for (const cat of categories) {
      const childCategories = await getChildCategories(cat._id);
      result = [...result, ...childCategories];
    }
    
    return result;
  };

  const categoryIds = await getChildCategories(req.params.id);

  // Get ads for all categories
  const query = { 
    category: { $in: categoryIds },
    isActive: true,
    isApproved: true
  };

  // Copy req.query
  const reqQuery = { ...req.query };

  // Fields to exclude
  const removeFields = ['select', 'sort', 'page', 'limit'];

  // Loop over removeFields and delete them from reqQuery
  removeFields.forEach(param => delete reqQuery[param]);

  // Create query string
  let queryStr = JSON.stringify(reqQuery);

  // Create operators ($gt, $gte, etc)
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

  // Finding resource
  let adsQuery = Ad.find(JSON.parse(queryStr))
    .where('category')
    .in(categoryIds)
    .where('isActive')
    .equals(true)
    .where('isApproved')
    .equals(true);

  // Select Fields
  if (req.query.select) {
    const fields = req.query.select.split(',').join(' ');
    adsQuery = adsQuery.select(fields);
  }

  // Sort
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    adsQuery = adsQuery.sort(sortBy);
  } else {
    adsQuery = adsQuery.sort('-createdAt');
  }

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 25;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await Ad.countDocuments(query);

  adsQuery = adsQuery.skip(startIndex).limit(limit);

  // Executing query
  const ads = await adsQuery;

  // Pagination result
  const pagination = {};

  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit
    };
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
        limit
    };
  }

  res.status(200).json({
    success: true,
    count: ads.length,
    pagination,
    data: ads
  });
});