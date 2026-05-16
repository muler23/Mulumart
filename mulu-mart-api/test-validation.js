const axios = require('axios');

async function testValidation() {
  console.log('🔍 Testing Validation Middleware...');
  
  try {
    // Test with minimal data that should pass
    const validData = {
      title: 'Test Ad',
      description: 'Test ad description',
      price: 100,
      category: '69689801ff458879c75b94f6', // Valid category ID
      condition: 'new',
      city: 'Addis Ababa',
      country: 'Ethiopia'
    };
    
    console.log('📝 Testing with valid data...');
    const response1 = await axios.post('http://localhost:5005/api/v1/ads', validData);
    console.log('Status:', response1.status);
    console.log('Response:', response1.data);
    
    if (response1.status === 201) {
      console.log('✅ SUCCESS: Valid data passed validation');
    } else {
      console.log('❌ FAILED: Valid data failed validation');
      console.log('❌ Status:', response1.status);
      console.log('❌ Error:', response1.data?.message);
    }
    
    // Test with missing title
    const invalidData1 = {
      description: 'Test ad description',
      price: 100,
      category: '69689801ff458879c75b94f6', // Valid category ID
      condition: 'new',
      city: 'Addis Ababa',
      country: 'Ethiopia'
    };
    
    console.log('\n📝 Testing with missing title...');
    const response2 = await axios.post('http://localhost:5005/api/v1/ads', invalidData1);
    console.log('Status:', response2.status);
    console.log('Response:', response2.data);
    
    if (response2.status === 400) {
      console.log('✅ SUCCESS: Missing title correctly rejected');
      console.log('❌ Error:', response2.data?.message);
    } else {
      console.log('❌ Unexpected status:', response2.status);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testValidation();
