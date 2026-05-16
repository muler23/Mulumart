const axios = require('axios');

async function testCategories() {
  console.log('🧪 Testing Categories...');
  
  try {
    const response = await axios.get('http://localhost:5005/api/v1/categories');
    console.log('✅ Categories found:', response.data?.data?.length);
    
    if (response.data?.data) {
      console.log('📂 Available Categories:');
      response.data.data.forEach((cat, index) => {
        console.log(`${index + 1}. ${cat.name} (${cat._id}) - ${cat.slug}`);
      });
    }
    
    // Test with actual category ID from database
    const firstCategory = response.data?.data?.[0];
    if (firstCategory) {
      console.log(`\n🧪 Testing with real category: ${firstCategory.name} (${firstCategory._id})`);
      
      const testAdData = {
        title: 'Test Ad With Real Category',
        description: 'Testing with actual category from database',
        price: 100,
        category: firstCategory._id, // Use real ObjectId
        condition: 'new',
        city: 'Test City',
        country: 'Test Country',
        postedBy: '507f1f77bcf86b799'
      };
      
      try {
        const createResponse = await axios.post('http://localhost:5005/api/v1/ads', testAdData);
        if (createResponse.status === 201) {
          console.log('✅ SUCCESS: Ad created with real category');
          console.log('📊 Ad ID:', createResponse.data?.data?._id);
        } else {
          console.log('❌ FAILED:', createResponse.status, createResponse.data?.message);
          console.log('❌ RESPONSE:', createResponse.data);
        }
      } catch (error) {
        console.log('❌ ERROR:', error.message);
        console.log('❌ RESPONSE:', error.response?.data);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testCategories();
