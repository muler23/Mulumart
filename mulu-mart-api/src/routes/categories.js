// routes/categories.js
const express = require('express');
const {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryTree,
  getCategoryAds
} = require('../controllers/categoryController');
const {
  getNestedCategories,
  getCategoriesByParent
} = require('../controllers/categoryControllerExtended');
const { protect, authorize } = require('../middleware/auth');
const advancedResults = require('../middleware/advancedResults');
const Category = require('../models/Category');

const router = express.Router();

// Public routes - specific routes first
router
  .route('/')
  .get(advancedResults(Category), getCategories);

router
  .route('/nested')
  .get(getNestedCategories);

router
  .route('/tree')
  .get(getCategoryTree);

router
  .route('/parent/:parentId')
  .get(getCategoriesByParent);

// Parameterized routes last
router
  .route('/:id')
  .get(getCategory);

router
  .route('/:id/ads')
  .get(getCategoryAds);

// Protected routes (Admin only)
router.use(protect);
router.use(authorize('admin'));

router
  .route('/')
  .post(createCategory);

router
  .route('/:id')
  .put(updateCategory)
  .delete(deleteCategory);

module.exports = router;