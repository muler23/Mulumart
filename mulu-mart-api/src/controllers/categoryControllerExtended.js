const Category = require('../models/Category');

// @desc    Get all categories with hierarchy (like Jiji)
// @route   GET /api/v1/categories/nested
// @access  Public
exports.getNestedCategories = async (req, res, next) => {
  try {
    // Get all main categories (parent: null)
    const mainCategories = await Category.find({ parent: null, isActive: true })
      .sort('sortOrder')
      .lean();

    // For each main category, get its subcategories and sub-subcategories
    const nestedCategories = await Promise.all(
      mainCategories.map(async (mainCategory) => {
        const subcategories = await Category.find({ parent: mainCategory._id, isActive: true })
          .sort('sortOrder')
          .lean();

        // For each subcategory, get its sub-subcategories
        const subcategoriesWithChildren = await Promise.all(
          subcategories.map(async (subcategory) => {
            const subSubcategories = await Category.find({ parent: subcategory._id, isActive: true })
              .sort('sortOrder')
              .lean();

            return {
              ...subcategory,
              subcategories: subSubcategories
            };
          })
        );

        return {
          ...mainCategory,
          subcategories: subcategoriesWithChildren
        };
      })
    );

    res.status(200).json({
      success: true,
      count: nestedCategories.length,
      data: nestedCategories
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get categories by parent ID
// @route   GET /api/v1/categories/parent/:parentId
// @access  Public
exports.getCategoriesByParent = async (req, res, next) => {
  try {
    const { parentId } = req.params;
    
    let query = { parent: null, isActive: true };
    if (parentId !== 'null') {
      query = { parent: parentId, isActive: true };
    }

    const categories = await Category.find(query)
      .sort('sortOrder')
      .select('name slug icon sortOrder')
      .lean();

    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories
    });
  } catch (error) {
    next(error);
  }
};
