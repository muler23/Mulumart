const axios = require('axios');

async function testSimpleAd() {
  console.log('🧪 Testing Simple Ad Creation...');
  
  try {
    // Test with minimal required fields only
    const minimalAdData = {
      title: 'Simple Test Ad',
      description: 'Minimal test ad',
      price: 100,
      category: '69689801ff458879c75b94f6', // Electronics category ID
      condition: 'new',
      city: 'Addis Ababa',
      country: 'Ethiopia',
      postedBy: '507f1f77bcf86b799' // Add back postedBy field
    };
    
    console.log('\n📝 Testing with authentication...');
    
    // First login
    const loginResponse = await axios.post('http://localhost:5005/api/v1/auth/login', {
      email: 'test@mulumart.com',
      password: 'testpassword123'
    });
    
    if (loginResponse.status !== 200) {
      console.log('❌ Login failed:', loginResponse.data?.message);
      return;
    }
    
    const token = loginResponse.data?.token;
    console.log('✅ Login successful');
    
    // Test authenticated ad creation
    const config = {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };
    
    const response2 = await axios.post('http://localhost:5005/api/v1/ads', minimalAdData, config);
    console.log('Status:', response2.status);
    console.log('Response:', response2.data);
    
    if (response2.status === 201) {
      console.log('🎉 SUCCESS: Authenticated ad creation works!');
    } else {
      console.log('❌ Authenticated ad creation failed');
      console.log('❌ Status:', response2.status);
      console.log('❌ Full Response:', JSON.stringify(response2.data, null, 2));
      console.log('❌ Error Message:', response2.data?.message || 'No error message');
      console.log('❌ Error Details:', response2.data?.error || 'No error details');
      
      // Log validation errors specifically
      if (response2.data?.error?.errors) {
        console.log('❌ Validation Errors:');
        Object.keys(response2.data.error.errors).forEach(field => {
          console.log(`  - ${field}:`, response2.data.error.errors[field]);
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testSimpleAd();
