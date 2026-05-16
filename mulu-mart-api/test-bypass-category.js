const axios = require('axios');

async function testBypassCategory() {
  console.log('🔍 Testing Ad Creation Bypassing Category Lookup...');
  
  try {
    // Test with minimal data and hardcoded category ID
    const testData = {
      title: 'Test Ad',
      description: 'Test description',
      price: 100,
      category: '69689801ff458879c75b94f6', // Electronics category ID
      condition: 'new',
      city: 'Addis Ababa',
      country: 'Ethiopia'
    };
    
    console.log('\n📝 Testing authentication...');
    const loginResponse = await axios.post('http://localhost:5005/api/v1/auth/login', {
      email: 'test@mulumart.com',
      password: 'testpassword123'
    }, { timeout: 5000 });
    
    if (loginResponse.status === 200) {
      const token = loginResponse.data?.token;
      console.log('✅ Login successful');
      
      const response = await axios.post('http://localhost:5005/api/v1/ads', testData, {
        timeout: 5000,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Status:', response.status);
      console.log('Response:', response.data);
      
      if (response.status === 201) {
        console.log('🎉 SUCCESS: Ad created successfully!');
        console.log('📊 Ad ID:', response.data?.data?._id);
      } else {
        console.log('❌ FAILED: Ad creation failed');
        console.log('❌ Error:', response.data?.message);
        console.log('❌ Status:', response.status);
        
        if (response.data?.error) {
          console.log('❌ Error Details:', response.data.error);
        }
      }
    } else {
      console.log('❌ Login failed:', loginResponse.data?.message);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('❌ Response data:', error.response.data);
    }
  }
}

testBypassCategory();
