const axios = require('axios');

async function finalFix() {
  console.log('🔧 FINAL FIX ATTEMPT...');
  
  try {
    // Step 1: Test basic category listing
    console.log('\n📋 Step 1: Testing basic category listing...');
    const categoriesResponse = await axios.get('http://localhost:5005/api/v1/categories');
    
    if (!categoriesResponse.data?.data || categoriesResponse.data.data.length === 0) {
      console.log('❌ No categories found in database');
      return;
    }
    
    console.log(`✅ Found ${categoriesResponse.data.data.length} categories`);
    
    // Step 2: Test category lookup with exact match
    console.log('\n📋 Step 2: Testing category lookup...');
    const firstCategory = categoriesResponse.data.data[0];
    console.log(`🔍 Looking for category: "${firstCategory.name}" (ID: ${firstCategory._id})`);
    
    // Import Category model directly
    const Category = require('./src/models/Category');
    
    // Test with different query approaches
    const tests = [
      { name: 'Exact name match', query: { name: firstCategory.name } },
      { name: 'Case insensitive match', query: { name: { $regex: new RegExp(`^${firstCategory.name}$`, 'i') } } },
      { name: 'ID match', query: { _id: firstCategory._id } }
    ];
    
    for (const test of tests) {
      console.log(`\n🔍 Testing: ${test.name}`);
      try {
        const result = await Category.findOne(test.query);
        console.log(`  Result: ${result ? 'FOUND' : 'NOT FOUND'}`);
        if (result) {
          console.log(`  Found ID: ${result._id}`);
          console.log(`  Found Name: ${result.name}`);
        }
      } catch (error) {
        console.log(`  Error: ${error.message}`);
      }
    }
    
    // Step 3: Test ad creation with proper authentication
    console.log('\n📋 Step 3: Testing authenticated ad creation...');
    
    // First, login to get token
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
    
    // Step 4: Create ad with all required fields
    const testAdData = {
      title: 'Final Test Ad - Complete System Verification',
      description: 'This is a comprehensive test of the ad creation system with all required fields properly configured',
      price: 999.99,
      category: '69689801ff458879c75b94f6', // Use hardcoded Electronics category ID
      condition: 'new',
      city: 'Addis Ababa',
      country: 'Ethiopia',
      postedBy: '507f1f77bcf86b799', // Valid ObjectId
      contactInfo: {
        userId: '507f1f77bcf86b799', // Valid ObjectId
        email: 'test@mulumart.com',
        phone: '+251912345678',
        name: 'Test User'
      }
    };
    
    const config = {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    };
    
    console.log('📝 Sending final test request...');
    const createResponse = await axios.post('http://localhost:5005/api/v1/ads', testAdData, config);
    
    if (createResponse.status === 201) {
      console.log('🎉 SUCCESS: Complete system test passed!');
      console.log('✅ Ad ID:', createResponse.data?.data?._id);
      console.log('✅ Ad Title:', createResponse.data?.data?.title);
      console.log('✅ Category:', createResponse.data?.data?.category?.name || 'N/A');
      console.log('✅ Price:', createResponse.data?.data?.price);
      console.log('✅ Posted By:', createResponse.data?.data?.postedBy?.name || 'N/A');
      console.log('✅ Contact Info:', createResponse.data?.data?.contactInfo ? 'PRESENT' : 'MISSING');
    } else {
      console.log('❌ FINAL TEST FAILED:', createResponse.status);
      console.log('❌ Error:', createResponse.data?.message);
      if (createResponse.data?.error) {
        console.log('❌ Validation Errors:', createResponse.data.error);
      }
    }
    
  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    if (error.response) {
      console.error('❌ Response data:', error.response.data);
    }
  }
}

finalFix();
