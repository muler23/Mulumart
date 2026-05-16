const axios = require('axios');

async function createTestUser() {
  console.log('👤 Creating Test User...');
  
  try {
    // Create a test user first
    const createUserResponse = await axios.post('http://localhost:5005/api/v1/auth/register', {
      name: 'Test User',
      email: `testuser${Date.now()}@mulumart.com`, // Use unique email
      password: 'testpassword123',
      passwordConfirm: 'testpassword123', // Add password confirmation
      role: 'user'
    });
    
    if (createUserResponse.status === 201) {
      console.log('✅ Test user created successfully');
      
      // Now login with the created user
      const loginResponse = await axios.post('http://localhost:5005/api/v1/auth/login', {
        email: 'test@mulumart.com',
        password: 'testpassword123'
      });
      
      if (loginResponse.status === 200) {
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
          title: 'Authenticated Test Ad - Final System Test',
          description: 'Testing authenticated ad creation with all required fields properly set',
          price: 299.99,
          category: firstCategory._id, // Use real ObjectId
          condition: 'new',
          city: 'Addis Ababa',
          country: 'Ethiopia'
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
          console.log('📊 Posted By:', createResponse.data?.data?.postedBy?.name);
          console.log('📊 Contact Info:', createResponse.data?.data?.contactInfo);
        } else {
          console.log('❌ FAILED:', createResponse.status);
          console.log('❌ ERROR:', createResponse.data?.message);
        }
      } else {
        console.log('❌ Login failed:', loginResponse.data?.message);
      }
    } else {
      console.log('❌ User creation failed:', createUserResponse.data?.message);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('❌ Response:', error.response.data);
    }
  }
}

createTestUser();
