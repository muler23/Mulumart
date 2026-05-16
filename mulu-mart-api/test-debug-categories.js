const axios = require('axios');

async function debugCategories() {
  console.log('🔍 Debugging Categories...');
  
  try {
    const response = await axios.get('http://localhost:5005/api/v1/categories', { timeout: 5000 });
    console.log('✅ Categories found:', response.data?.data?.length);
    
    if (response.data?.data && response.data.data.length > 0) {
      const firstCategory = response.data.data[0];
      console.log(`\n🔍 Testing lookup for: "${firstCategory.name}"`);
      
      // Simple test - just try to create ad with the first category ID directly
      console.log('🔍 Testing ad creation with category ID:', firstCategory._id);
      
      const testAdData = {
        title: 'Debug Test Ad',
        description: 'Testing category lookup with direct ID',
        price: 100,
        category: firstCategory._id, // Use real ObjectId directly
        condition: 'new',
        city: 'Test City',
        country: 'Ethiopia',
        postedBy: '507f1f77bcf86b799'
      };
      
      // Get auth token (assuming we have one)
      const loginResponse = await axios.post('http://localhost:5005/api/v1/auth/login', {
        email: 'test@mulumart.com',
        password: 'testpassword123'
      });
      
      if (loginResponse.status === 200) {
        const token = loginResponse.data?.token;
        console.log('✅ Login successful');
        
        const config = {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          timeout: 5000
        };
        
        try {
          const createResponse = await axios.post('http://localhost:5005/api/v1/ads', testAdData, config);
          console.log('🎉 SUCCESS: Ad created with authentication!');
          console.log('📊 Ad ID:', createResponse.data?.data?._id);
          console.log('📊 Status:', createResponse.status);
        } catch (error) {
          console.log('❌ Ad creation failed:', error.message);
          if (error.response) {
            console.log('❌ Response:', error.response.data);
          }
        }
      } else {
        console.log('❌ Login failed:', loginResponse.data?.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

debugCategories();
