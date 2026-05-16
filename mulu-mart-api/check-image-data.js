const mongoose = require('mongoose');
const Ad = require('./src/models/Ad');

// Connect to database
require('dotenv').config();
const connectDB = require('./src/config/db');
connectDB();

const checkImageData = async () => {
  try {
    console.log('Checking complete image data in database...');
    
    const ad = await Ad.findById('6960b195e3f8bed63a18a5a9');
    
    if (ad) {
      console.log('Ad found:', ad.title);
      console.log('Images in database:');
      
      for (const image of ad.images) {
        console.log(`- URL: "${image.url}"`);
        console.log(`- PublicId: "${image.publicId}"`);
        console.log(`- IsPrimary: ${image.isPrimary}`);
        console.log(`- Image Object:`, JSON.stringify(image, null, 2));
        console.log('');
      }
    } else {
      console.log('Ad not found');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

checkImageData();
