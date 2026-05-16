const axios = require('axios');

async function testAuthenticatedAdCreation() {
  console.log('🧪 Testing Authenticated Ad Creation...');
  
  try {
    // First, login to get authentication token
    const loginResponse = await axios.post('http://localhost:5005/api/v1/auth/login', {
      email: 'test@example.com',
      password: 'testpassword123'
    });
    
    if (loginResponse.status !== 200) {
      console.log('❌ Login failed:', loginResponse.data?.message);
      return;
    }
    
    const token = loginResponse.data?.token;
    console.log('✅ Login successful, token obtained');
    
    // Get categories to use real category ID
    const categoriesResponse = await axios.get('http://localhost:5005/api/v1/categories');
    const firstCategory = categoriesResponse.data?.data?.[0];
    
    if (!firstCategory) {
      console.log('❌ No categories found');
      return;
    }
    
    console.log(`📂 Using category: ${firstCategory.name} (${firstCategory._id})`);
    
    // Test authenticated ad creation
    const testAdData = {
      title: 'Authenticated Test Ad - System Verification Complete',
      description: 'Testing authenticated ad creation with all required fields properly set',
      price: 299.99,
      category: firstCategory._id, // Use real ObjectId
      condition: 'new',
      city: 'Addis Ababa',
      country: 'Ethiopia',
      postedBy: '507f1f77bcf86b799' // Valid ObjectId for postedBy
    };
    
    const config = {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };
    
    console.log('📝 Sending authenticated request...');
    const createResponse = await axios.post('http://localhost:5005/api/v1/ads', testAdData, config);
    
    if (createResponse.status === 201) {
      console.log('🎉 SUCCESS: Ad created with authentication!');
      console.log('📊 Ad ID:', createResponse.data?.data?._id);
      console.log('📊 Ad Title:', createResponse.data?.data?.title);
      console.log('📊 Category:', createResponse.data?.data?.category?.name);
      console.log('📊 Price:', createResponse.data?.data?.price);
    } else {
      console.log('❌ FAILED:', createResponse.status);
      console.log('❌ ERROR:', createResponse.data?.message);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('❌ Response:', error.response.data);
    }
  }
}

testAuthenticatedAdCreation();
