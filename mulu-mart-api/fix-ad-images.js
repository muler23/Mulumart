const mongoose = require('mongoose');
const Ad = require('./src/models/Ad');

// Connect to database
require('dotenv').config();
const connectDB = require('./src/config/db');
connectDB();

const fixAdImages = async () => {
  try {
    // Find an existing ad
    const ad = await Ad.findOne();
    
    if (ad) {
      // Update with proper image structure
      ad.images = [
        {
          url: 'http://localhost:5000/uploads/test-image.png',
          publicId: 'test-image',
          isPrimary: true
        }
      ];
      
      await ad.save();
      console.log('Ad updated with image data:', ad);
    } else {
      console.log('No ads found to update');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error updating ad:', error);
    process.exit(1);
  }
};

fixAdImages();
