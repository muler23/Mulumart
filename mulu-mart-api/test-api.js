const axios = require('axios');
const mongoose = require('mongoose');

async function testAPI() {
  console.log('🧪 Testing API Connection...');
  
  try {
    // Test categories endpoint
    const categoriesResponse = await axios.get('http://localhost:5005/api/v1/categories');
    console.log('✅ Categories response:', categoriesResponse.data?.data?.length, 'categories found');
    
    // Test ads endpoint (GET request)
    const adsResponse = await axios.get('http://localhost:5005/api/v1/ads?limit=5');
    console.log('✅ Ads response:', adsResponse.data?.data?.length, 'ads found');
    
    // Test POST request to create ad (without images first)
    const testAdData = {
      title: 'Test Ad System Verification',
      description: 'This is a test ad for comprehensive system verification',
      price: 100,
      category: 'electronics', // Use simple string for now
      condition: 'new',
      city: 'Addis Ababa',
      country: 'Ethiopia'
    };
    
    const createResponse = await axios.post('http://localhost:5005/api/v1/ads', testAdData);
    console.log('✅ Ad creation response:', createResponse.data);
    console.log('✅ Ad created successfully:', createResponse.data?.success);
    
    console.log('🎉 API Test Complete - Core functionality is working!');
    
  } catch (error) {
    console.error('❌ API Test Failed:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('🔌 Server is not running on port 5005');
    } else if (error.code === 'ENOTFOUND') {
      console.log('🔌 Server not found at localhost:5005');
    } else {
      console.log('❌ Server Error:', error.response?.status, error.response?.data);
    }
  }
}

testAPI();
