// middleware/upload.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const ErrorResponse = require('../utils/errorResponse');

// Set storage engine
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../public/uploads/ads');

    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(
      null,
      `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
    );
  }
});

// Check file type
function checkFileType(file, cb) {
  // Allowed ext for both images and videos
  const imageTypes = /jpeg|jpg|png|gif|webp/;
  const videoTypes = /mp4|avi|mov|wmv|mkv/;
  
  const extname = path.extname(file.originalname).toLowerCase();
  const mimetype = file.mimetype;
  
  console.log('📸 Checking file:', file.originalname);
  console.log('📸 Extension:', extname);
  console.log('📸 MIME type:', mimetype);
  
  // Check if it's an image
  if (imageTypes.test(extname) && mimetype.startsWith('image/')) {
    console.log('✅ Image file accepted');
    return cb(null, true);
  }
  
  // Check if it's a video
  if (videoTypes.test(extname) && mimetype.startsWith('video/')) {
    console.log('✅ Video file accepted');
    return cb(null, true);
  }
  
  // Reject other file types
  console.log('❌ File rejected - Invalid type');
  cb(new ErrorResponse(`Invalid file type: ${extname}. Only images and videos allowed.`, 400));
}

// Init upload
const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit for videos
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  }
});

// Upload single image
exports.uploadImage = (fieldName) => {
  return (req, res, next) => {
    upload.single(fieldName)(req, res, (err) => {
      if (err) {
        return next(new ErrorResponse(err.message, 400));
      }
      next();
    });
  };
};

// Upload multiple images
exports.uploadImages = (fieldName, maxCount) => {
  return (req, res, next) => {
    console.log('=== UPLOAD MIDDLEWARE ===');
    console.log('Field name:', fieldName);
    console.log('Max count:', maxCount);
    console.log('Request content-type:', req.headers['content-type']);
    
    upload.fields([{ name: fieldName, maxCount: maxCount }])(req, res, (err) => {
      if (err) {
        console.error('❌ Upload middleware error:', err);
        return next(new ErrorResponse(err.message, 400));
      }
      
      console.log('📸 Files after middleware:', req.files);
      console.log('📸 Files field:', req.files?.images);
      console.log('📸 Files length:', req.files?.images?.length);
      
      next();
    });
  };
};