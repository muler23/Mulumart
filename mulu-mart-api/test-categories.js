const axios = require('axios');

async function testCategories() {
  try {
    console.log('🔍 Testing categories API...');
    
    // Test basic categories
    console.log('\n1. Testing /categories:');
    const basicResponse = await axios.get('http://localhost:5005/api/v1/categories');
    console.log('Basic categories:', basicResponse.data);
    
    // Test nested categories
    console.log('\n2. Testing /categories/nested:');
    const nestedResponse = await axios.get('http://localhost:5005/api/v1/categories/nested');
    console.log('Nested categories:', nestedResponse.data);
    console.log('Nested categories data:', nestedResponse.data.data);
    console.log('Number of main categories:', nestedResponse.data.data?.length || 0);
    
    if (nestedResponse.data.data && nestedResponse.data.data.length > 0) {
      console.log('\n3. First category structure:');
      console.log(JSON.stringify(nestedResponse.data.data[0], null, 2));
    }
    
  } catch (error) {
    console.error('❌ Error testing categories:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testCategories();
