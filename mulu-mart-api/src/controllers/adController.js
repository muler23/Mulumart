// controllers/adController.js
const path = require('path');
const Ad = require('../models/Ad');
const Category = require('../models/Category');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Helper function to delete images from Cloudinary
const deleteCloudinaryImages = async (images) => {
  if (!images || images.length === 0) return;
  
  const deletePromises = images.map(image => {
    if (image.publicId && image.publicId.startsWith('mulu-mart/')) {
      return cloudinary.uploader.destroy(image.publicId);
    }
    return Promise.resolve();
  });
  
  try {
    await Promise.all(deletePromises);
  } catch (error) {
    console.error('Error deleting images from Cloudinary:', error);
  }
};

// @desc    Get all ads with filtering and pagination
// @route   GET /api/v1/ads
// @access  Public
exports.getAds = asyncHandler(async (req, res, next) => {
  let query = {};

  // Category filter
  if (req.query.category) {
    const category = await Category.findOne({ slug: req.query.category });
    if (category) query.category = category._id;
  }

  // Price filter
  if (req.query.minPrice || req.query.maxPrice) {
    query.price = {};
    if (req.query.minPrice) query.price.$gte = parseFloat(req.query.minPrice);
    if (req.query.maxPrice) query.price.$lte = parseFloat(req.query.maxPrice);
  }

  // Condition filter
  if (req.query.condition) query.condition = req.query.condition;

  // Search filter
  if (req.query.search) query.$text = { $search: req.query.search };

  // Only active ads
  query.status = 'active';

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;

  // Execute query
  const ads = await Ad.find(query)
    .populate('postedBy', 'name email')
    .populate('category', 'name slug')
    .sort({ isPromoted: -1, priorityScore: -1, createdAt: -1 })
    .skip(startIndex)
    .limit(limit);

  const total = await Ad.countDocuments(query);

  const pagination = {
    page,
    limit,
    total,
    pages: Math.ceil(total / limit)
  };

  // Process image URLs to include full server URL
  const processedAds = ads.map(ad => {
    const adObj = ad.toObject();
    
    if (adObj.images && adObj.images.length > 0) {
      adObj.images = adObj.images.map(image => {
        // If it's already a full URL (Cloudinary), return as is
        if (image.url && (image.url.startsWith('http://') || image.url.startsWith('https://'))) {
          return image;
        }
        // Otherwise, treat as local path
        let fullUrl;
        if (image.url.startsWith('/')) {
          // Already starts with /, just add host
          fullUrl = `${req.protocol}://${req.get('host')}${image.url}`;
        } else {
          // Relative path, add /uploads/ads/
          fullUrl = `${req.protocol}://${req.get('host')}/uploads/ads/${image.url}`;
        }
        return {
          ...image,
          url: fullUrl
        };
      });
    }
    
    return adObj;
  });

  res.status(200).json({
    success: true,
    count: ads.length,
    pagination,
    data: processedAds
  });
});

// @desc    Get single ad
// @route   GET /api/v1/ads/:id
// @access  Public
exports.getAd = asyncHandler(async (req, res, next) => {
  const ad = await Ad.findById(req.params.id)
    .populate('postedBy', 'name email phone')
    .populate('category', 'name');

  if (!ad) return next(new ErrorResponse(`Ad not found with id ${req.params.id}`, 404));

  ad.views += 1;
  await ad.save();

  // Process image URLs to include full server URL
  const adObj = ad.toObject();
  
  if (adObj.images && adObj.images.length > 0) {
    adObj.images = adObj.images.map(image => {
      // If it's already a full URL (Cloudinary), return as is
      if (image.url && (image.url.startsWith('http://') || image.url.startsWith('https://'))) {
        return image;
      }
      // Otherwise, treat as local path
      let fullUrl;
      if (image.url.startsWith('/')) {
        // Already starts with /, just add host
        fullUrl = `${req.protocol}://${req.get('host')}${image.url}`;
      } else {
        // Relative path, add /uploads/ads/
        fullUrl = `${req.protocol}://${req.get('host')}/uploads/ads/${image.url}`;
      }
      return {
        ...image,
        url: fullUrl
      };
    });
  }

  res.status(200).json({ success: true, data: adObj });
});

// @desc    Create ad
// @route   POST /api/v1/ads
// @access  Private
exports.createAd = asyncHandler(async (req, res, next) => {
  console.log('=== MINIMAL CREATE AD ===');
  
  try {
    // Check if user is authenticated
    if (!req.user || !req.user.id) {
      return next(new ErrorResponse('Authentication required', 401));
    }
    
    if (!req.body) {
      return next(new ErrorResponse('Request body is required', 400));
    }
    
    // Create minimal ad data without any complex processing
    const adData = {
      title: req.body.title,
      description: req.body.description,
      price: req.body.price,
      category: req.body.category,
      condition: req.body.condition,
      location: {
        city: req.body.city || 'Addis Ababa',
        country: req.body.country || 'Ethiopia'
      },
      postedBy: req.user.id,
      status: 'active'
    };
    
    console.log('Creating ad with minimal data:', adData);
    
    // Create ad directly without any middleware or complex logic
    const ad = await Ad.create(adData);
    console.log('✅ Ad created successfully:', ad._id);
    
    res.status(201).json({
      success: true,
      message: 'Ad created successfully',
      data: ad
    });
    
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

// @desc    Update ad
// @route   PUT /api/v1/ads/:id
// @access  Private
exports.updateAd = asyncHandler(async (req, res, next) => {
  let ad = await Ad.findById(req.params.id);
  if (!ad) return next(new ErrorResponse(`Ad not found with id ${req.params.id}`, 404));

  if (ad.postedBy.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse(`Not authorized to update this ad`, 401));
  }

  ad = await Ad.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  res.status(200).json({ success: true, data: ad });
});

// @desc    Delete ad
// @route   DELETE /api/v1/ads/:id
// @access  Private
exports.deleteAd = asyncHandler(async (req, res, next) => {
  const ad = await Ad.findById(req.params.id);
  if (!ad) return next(new ErrorResponse(`Ad not found with id ${req.params.id}`, 404));

  if (ad.postedBy.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse(`Not authorized to delete this ad`, 401));
  }

  // Delete local files from uploads/ads directory
  const fs = require('fs').promises;
  ad.images.forEach(async image => {
    if (image.url && image.url.startsWith('/uploads/ads/')) {
      const filename = image.url.replace('/uploads/ads/', '');
      const filePath = path.join(__dirname, '../../public/uploads/ads', filename);
      try {
        if (await fs.access(filePath)) {
          await fs.unlink(filePath);
          console.log('Deleted local file:', filePath);
        }
      } catch (error) {
        console.error('Error deleting local file:', error);
      }
    }
  });

  await ad.remove();
  res.status(200).json({ success: true, data: {} });
});

// @desc    Upload multiple images for ad
// @route   POST /api/v1/ads/:id/images
// @access  Private
exports.uploadMultipleImages = asyncHandler(async (req, res, next) => {
  console.log('=== UPLOAD MULTIPLE IMAGES CONTROLLER ===');
  console.log('Request method:', req.method);
  console.log('Request URL:', req.url);
  console.log('Request params:', req.params);
  console.log('Request headers:', req.headers['content-type']);
  console.log('Body exists:', !!req.body);
  console.log('Files exist:', !!req.files);
  
  const ad = await Ad.findById(req.params.id);
  if (!ad) return next(new ErrorResponse(`Ad not found with id ${req.params.id}`, 404));

  // Temporarily skip authorization for testing
  // if (ad.postedBy.toString() !== req.user?.id && req.user?.role !== 'admin') {
  //   return next(new ErrorResponse(`Not authorized to update this ad`, 401));
  // }

  // For now, just return success without processing images
  console.log('📸 Image upload request received for ad:', ad._id);
  
  res.status(200).json({
    success: true,
    message: 'Image upload endpoint is working (temporarily bypassed)',
    adId: ad._id,
    receivedFiles: req.files ? req.files.length : 0
  });
});

// @desc    Upload photo for ad
// @route   PUT /api/v1/ads/:id/photo
// @access  Private
exports.adPhotoUpload = asyncHandler(async (req, res, next) => {
  const ad = await Ad.findById(req.params.id);
  if (!ad) return next(new ErrorResponse(`Ad not found with id ${req.params.id}`, 404));

  if (ad.postedBy.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse(`Not authorized to update this ad`, 401));
  }

  if (!req.files || !req.files.file) return next(new ErrorResponse(`Please upload a file`, 400));

  const file = req.files.file;
  if (!file.mimetype.startsWith('image')) return next(new ErrorResponse(`Please upload an image`, 400));
  if (file.size > process.env.MAX_FILE_UPLOAD) return next(new ErrorResponse(`File too large`, 400));

  // Generate unique filename
  const uniqueSuffix = Date.now() + '_' + Math.round(Math.random() * 1E9);
  const ext = path.extname(file.name);
  const filename = `photo_${ad._id}_${uniqueSuffix}${ext}`;

  // Ensure uploads/ads directory exists
  const fs = require('fs');
  const uploadDir = path.join(__dirname, '../../public/uploads/ads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const uploadPath = path.join(uploadDir, filename);

  file.mv(uploadPath, async (err) => {
    if (err) {
      console.error('File move error:', err);
      return next(new ErrorResponse(`Problem with file upload`, 500));
    }
    
    const isPrimary = !ad.images.some(img => img.isPrimary);

    Ad.findByIdAndUpdate(req.params.id, {
      $push: { images: { url: `/uploads/ads/${filename}`, isPrimary } }
    }).then(() => {
      res.status(200).json({ success: true, data: filename });
    }).catch((error) => {
      console.error('Error updating ad:', error);
      return next(new ErrorResponse(`Problem with file upload`, 500));
    });
  });
});

// @desc    Upload multiple images and videos for ad (no auth required)
// @route   POST /api/v1/ads/:id/images
// @access  Public
exports.uploadImagesPublic = asyncHandler(async (req, res, next) => {
  console.log('=== FINAL MEDIA UPLOAD CONTROLLER ===');
  console.log('Request method:', req.method);
  console.log('Request params:', req.params);
  console.log('Request files:', req.files);
  
  const ad = await Ad.findById(req.params.id);
  if (!ad) return next(new ErrorResponse(`Ad not found with id ${req.params.id}`, 404));

  // Get files from upload.fields() middleware
  const files = req.files?.images || [];
  console.log('📸 Files array:', files);
  console.log('📸 Files length:', files.length);
  
  if (!files || files.length === 0) {
    return next(new ErrorResponse(`Please upload at least one image or video`, 400));
  }

  // Process files and save to database
  const uploadedMedia = [];
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    console.log(`📸 Processing file ${i}:`, file.originalname);
    console.log(`📸 File path:`, file.path);
    
    // Generate unique filename
    const uniqueSuffix = Date.now() + '_' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const filename = `media_${ad._id}_${i}_${uniqueSuffix}${ext}`;
    
    // File is already saved by multer.diskStorage, just rename/move it
    const fs = require('fs');
    try {
      // Move the file from multer's temporary location to our desired location
      const uploadPath = path.join(__dirname, '../../public/uploads/ads', filename);
      const uploadDir = path.dirname(uploadPath);
      
      // Ensure directory exists
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      
      // Move the file
      fs.renameSync(file.path, uploadPath);
      console.log(`✅ File saved: ${filename}`);
      
      uploadedMedia.push({
        url: `/uploads/ads/${filename}`,
        publicId: filename,
        isPrimary: i === 0 && ad.images.length === 0,
        type: file.mimetype.startsWith('image/') ? 'image' : 'video'
      });
    } catch (err) {
      console.error('❌ File processing error:', err);
      return next(new ErrorResponse(`Failed to save file ${file.originalname}`, 500));
    }
  }
  
  // Update ad with new media
  try {
    ad.images.push(...uploadedMedia);
    await ad.save();
    
    console.log('🎉 FINAL Ad images:', ad.images);
    console.log('🎉 Media upload complete!');

    res.status(200).json({
      success: true,
      message: `${uploadedMedia.length} media files uploaded successfully`,
      data: uploadedMedia
    });
  } catch (error) {
    console.error('❌ Database save error:', error);
    return next(new ErrorResponse(error.message, 500));
  }
});

// @desc    Set primary image
// @route   PUT /api/v1/ads/:id/primary/:imageId
// @access  Private
exports.setPrimaryImage = asyncHandler(async (req, res, next) => {
  const { imageId } = req.params;
  if (!imageId) return next(new ErrorResponse(`Please provide an image ID`, 400));

  const ad = await Ad.findById(req.params.id);
  if (!ad) return next(new ErrorResponse(`Ad not found with id ${req.params.id}`, 404));

  if (ad.postedBy.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse(`Not authorized`, 401));
  }

  const image = ad.images.id(imageId);
  if (!image) return next(new ErrorResponse(`Image not found`, 404));

  ad.images.forEach(img => img.isPrimary = false);
  image.isPrimary = true;

  await ad.save();
  res.status(200).json({ success: true, data: ad });
});

// @desc    Delete ad image
// @route   DELETE /api/v1/ads/:id/images/:imageId
// @access  Private
exports.deleteAdImage = asyncHandler(async (req, res, next) => {
  const ad = await Ad.findById(req.params.id);
  if (!ad) return next(new ErrorResponse(`Ad not found with id ${req.params.id}`, 404));

  if (ad.postedBy.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse(`Not authorized`, 401));
  }

  const image = ad.images.id(req.params.imageId);
  if (!image) return next(new ErrorResponse(`Image not found`, 404));
  if (ad.images.length <= 1) return next(new ErrorResponse(`Cannot delete only image`, 400));

  // Delete local file from uploads/ads directory
  const fs = require('fs');
  if (image.url && image.url.startsWith('/uploads/ads/')) {
    const filename = image.url.replace('/uploads/ads/', '');
    const filePath = path.join(__dirname, '../../public/uploads/ads', filename);
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log('Deleted local file:', filePath);
      }
    } catch (error) {
      console.error('Error deleting local file:', error);
    }
  }

  image.remove();
  await ad.save();
  res.status(200).json({ success: true, data: {} });
});

// @desc    Get postedBy's ads
// @route   GET /api/v1/ads/my-ads
// @access  Private
exports.getMyAds = asyncHandler(async (req, res, next) => {
  const ads = await Ad.find({ postedBy: req.user.id });
  res.status(200).json({ success: true, count: ads.length, data: ads });
});
