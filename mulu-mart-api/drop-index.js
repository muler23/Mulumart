const mongoose = require('mongoose');
require('dotenv').config();

// Connect to database
const connectDB = require('./src/config/db');

// Drop the problematic index
const dropIndex = async () => {
  try {
    // Wait for connection
    await connectDB();
    
    const db = mongoose.connection.db;
    const collection = db.collection('ads');
    
    // List all indexes
    const indexes = await collection.listIndexes().toArray();
    console.log('Current indexes:', indexes);
    
    // Drop the location 2dsphere index if it exists
    const locationIndex = indexes.find(index => index.key && index.key.location && index.key.location === '2dsphere');
    if (locationIndex) {
      console.log('Dropping location index:', locationIndex.name);
      await collection.dropIndex(locationIndex.name);
      console.log('Location index dropped successfully');
    } else {
      console.log('No location 2dsphere index found');
    }
    
    // Drop the coordinates 2dsphere index if it exists
    const coordinatesIndex = indexes.find(index => index.key && index.key.coordinates && index.key.coordinates === '2dsphere');
    if (coordinatesIndex) {
      console.log('Dropping coordinates index:', coordinatesIndex.name);
      await collection.dropIndex(coordinatesIndex.name);
      console.log('Coordinates index dropped successfully');
    } else {
      console.log('No coordinates 2dsphere index found');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error dropping index:', error);
    process.exit(1);
  }
};

// Run the script
dropIndex();
