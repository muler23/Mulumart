const axios = require('axios');

async function testBasicEndpoint() {
  console.log('🔍 Testing Basic Backend Connectivity...');
  
  try {
    // Test 1: Check if server is responding at all
    console.log('\n📋 Test 1: Basic server connectivity...');
    const response1 = await axios.get('http://localhost:5005/api/v1/ads', { timeout: 2000 });
    console.log('Status:', response1.status);
    console.log('Response:', response1.data);
    
    // Test 2: Check if authentication endpoint works
    console.log('\n📋 Test 2: Authentication endpoint...');
    const response2 = await axios.post('http://localhost:5005/api/v1/auth/login', {
      email: 'test@mulumart.com',
      password: 'testpassword123'
    }, { timeout: 2000 });
    console.log('Status:', response2.status);
    console.log('Response:', response2.data);
    
    // Test 3: Check if categories endpoint works
    console.log('\n📋 Test 3: Categories endpoint...');
    const response3 = await axios.get('http://localhost:5005/api/v1/categories', { timeout: 2000 });
    console.log('Status:', response3.status);
    console.log('Categories found:', response3.data?.data?.length);
    
    // Test 4: Try a simple ad creation with minimal data
    console.log('\n📋 Test 4: Minimal ad creation...');
    const testData = {
      title: 'Test Ad',
      description: 'Test description',
      price: 100,
      category: '69689801ff458879c75b94f6', // Electronics category ID
      condition: 'new',
      city: 'Addis Ababa',
      country: 'Ethiopia'
    };
    
    if (response2.status === 200) {
      const token = response2.data?.token;
      console.log('✅ Token obtained, testing ad creation...');
      
      const response4 = await axios.post('http://localhost:5005/api/v1/ads', testData, {
        timeout: 3000, // Shorter timeout
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Status:', response4.status);
      console.log('Response:', response4.data);
      
      if (response4.status === 201) {
        console.log('🎉 SUCCESS: Ad created successfully!');
      } else {
        console.log('❌ FAILED: Ad creation failed');
        console.log('❌ Error:', response4.data?.message);
        console.log('❌ Status:', response4.status);
        
        if (response4.data?.error) {
          console.log('❌ Error Details:', response4.data.error);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('❌ Response data:', error.response.data);
    }
  }
}

testBasicEndpoint();
