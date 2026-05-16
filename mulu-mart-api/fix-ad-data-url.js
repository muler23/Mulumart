const mongoose = require('mongoose');
const Ad = require('./src/models/Ad');

// Connect to database
require('dotenv').config();
const connectDB = require('./src/config/db');
connectDB();

const fixAdImages = async () => {
  try {
    // Find the ad with image
    const ad = await Ad.findOne({ 'images.publicId': 'test-image' });
    
    if (ad) {
      // Update with data URL instead of file URL
      ad.images = [
        {
          url: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
          publicId: 'test-image',
          isPrimary: true
        }
      ];
      
      await ad.save();
      console.log('Ad updated with data URL image:', ad);
    } else {
      console.log('No ad found with test-image');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error updating ad:', error);
    process.exit(1);
  }
};

fixAdImages();
