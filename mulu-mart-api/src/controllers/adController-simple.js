const Ad = require('../models/Ad');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// Simplified createAd function
exports.createAdSimple = asyncHandler(async (req, res, next) => {
  console.log('=== SIMPLE CREATE AD ===');
  
  try {
    console.log('Request received');
    console.log('Body exists:', !!req.body);
    
    if (!req.body) {
      return next(new ErrorResponse('Request body is required', 400));
    }
    
    // Create minimal ad data
    const adData = {
      title: req.body.title,
      description: req.body.description,
      price: req.body.price,
      category: req.body.category,
      condition: req.body.condition,
      city: req.body.city,
      country: req.body.country || 'Ethiopia',
      postedBy: req.user?.id || '507f1f77bcf86b799'
    };
    
    console.log('Creating ad with data:', adData);
    
    // Create ad without complex logic
    const ad = await Ad.create(adData);
    console.log('✅ Ad created successfully:', ad._id);
    
    res.status(201).json({
      success: true,
      message: 'Ad created successfully',
      data: ad
    });
    
  } catch (error) {
    console.error('❌ Error creating ad:', error.message);
    return next(error);
  }
});
