const axios = require('axios');

async function fixAdCreation() {
  console.log('🔧 Fixing Ad Creation Issues...');
  
  try {
    // Step 1: Test basic authentication
    console.log('\n📋 Step 1: Testing authentication...');
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
    
    // Step 2: Test different ad creation scenarios
    const testCases = [
      {
        name: 'Minimal valid data',
        data: {
          title: 'Test Ad',
          description: 'Test ad description',
          price: 100,
          category: '69689801ff458879c75b94f6', // Valid category ID
          condition: 'new',
          city: 'Addis Ababa',
          country: 'Ethiopia',
          postedBy: '507f1f77bcf86b799' // Valid ObjectId
        }
      },
      {
        name: 'Missing title',
        data: {
          description: 'Test ad description',
          price: 100,
          category: '69689801ff458879c75b94f6',
          condition: 'new',
          city: 'Addis Ababa',
          country: 'Ethiopia'
          // Missing title field
        }
      },
      {
        name: 'Invalid category',
        data: {
          title: 'Test Ad',
          description: 'Test ad description',
          price: 100,
          category: 'invalid-category-id', // Invalid ObjectId
          condition: 'new',
          city: 'Addis Ababa',
          country: 'Ethiopia'
        }
      },
      {
        name: 'Missing required fields',
        data: {
          description: 'Test ad description',
          price: 100,
          // Missing category and condition
          city: 'Addis Ababa',
          country: 'Ethiopia'
        }
      }
    ];
    
    const config = {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };
    
    for (const testCase of testCases) {
      console.log(`\n📋 Testing: ${testCase.name}`);
      
      try {
        const response = await axios.post('http://localhost:5005/api/v1/ads', testCase.data, config);
        console.log('Status:', response.status);
        console.log('Response:', response.data);
        
        if (response.status === 201) {
          console.log(`✅ SUCCESS: ${testCase.name}`);
        } else {
          console.log(`❌ FAILED: ${testCase.name}`);
          console.log(`❌ Status:`, response.status);
          console.log(`❌ Error:`, response.data?.message);
          
          if (response.data?.error?.errors) {
            console.log('❌ Validation Errors:');
            Object.keys(response.data.error.errors).forEach(field => {
              console.log(`  - ${field}:`, response.data.error.errors[field]);
            });
          }
        }
      } catch (error) {
        console.log('❌ EXCEPTION: ${testCase.name}:', error.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Fatal error:', error.message);
  }
}

fixAdCreation();
