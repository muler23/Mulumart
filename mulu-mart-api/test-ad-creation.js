const axios = require('axios');
const mongoose = require('mongoose');

async function testAdCreation() {
  console.log('🧪 Testing Ad Creation Validation...');
  
  const testCases = [
    {
      name: 'Test with string category',
      data: {
        title: 'Test Ad For System Verification',
        description: 'Testing string category validation with complete data',
        price: 100,
        category: 'electronics', // Should work with improved validation
        condition: 'new',
        city: 'Test City',
        country: 'Test Country',
        postedBy: '507f1f77bcf86b799' // Add required postedBy field
      }
    },
    {
      name: 'Test with ObjectId category',
      data: {
        title: 'Test Ad For System Verification',
        description: 'Testing ObjectId category validation with complete data',
        price: 100,
        category: '507f1f77bcf86b799', // Use valid ObjectId
        condition: 'new',
        city: 'Test City',
        country: 'Test Country',
        postedBy: '507f1f77bcf86b799' // Add required postedBy field
      }
    },
    {
      name: 'Test without category',
      data: {
        title: 'Test Ad For System Verification',
        description: 'Testing without category field but with other required fields',
        price: 100,
        condition: 'new',
        city: 'Test City',
        country: 'Test Country',
        postedBy: '507f1f77bcf86b799' // Add required postedBy field
      }
    }
  ];

  for (const testCase of testCases) {
    try {
      console.log(`📝 Testing: ${testCase.name}`);
      const response = await axios.post('http://localhost:5005/api/v1/ads', testCase.data);
      
      if (response.status === 201) {
        console.log(`✅ ${testCase.name} - SUCCESS: Ad created`);
      } else {
        console.log(`❌ ${testCase.name} - FAILED: ${response.status} - ${response.data?.message}`);
      }
    } catch (error) {
      console.log(`❌ ${testCase.name} - ERROR: ${error.message}`);
      console.log(`❌ ${testCase.name} - STATUS: ${error.response?.status}`);
      console.log(`❌ ${testCase.name} - RESPONSE:`, error.response?.data);
      console.log(`❌ ${testCase.name} - STACK:`, error.stack);
    }
  }

  console.log('📊 Ad Creation Test Complete');
}

testAdCreation();
