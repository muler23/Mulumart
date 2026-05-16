const axios = require('axios');
const mongoose = require('mongoose');

async function comprehensiveTest() {
  console.log('🧪 COMPREHENSIVE SYSTEM TEST STARTING...');
  console.log('=' .repeat(50));
  
  const results = {
    api: { status: 'unknown', details: '' },
    auth: { status: 'unknown', details: '' },
    chat: { status: 'unknown', details: '' },
    categories: { status: 'unknown', details: '' },
    payments: { status: 'unknown', details: '' },
    security: { status: 'unknown', details: '' }
  };

  try {
    // Test 1: API Connectivity
    console.log('📍 Test 1: API Connectivity');
    const healthResponse = await axios.get('http://localhost:5005/api/v1/health').catch(() => {});
    if (healthResponse.status === 200) {
      results.api = { status: '✅ PASS', details: 'Health endpoint working' };
    } else {
      results.api = { status: '❌ FAIL', details: 'Health endpoint not responding' };
    }

    // Test 2: Categories
    console.log('📂 Test 2: Categories');
    try {
      const categoriesResponse = await axios.get('http://localhost:5005/api/v1/categories');
      if (categoriesResponse.status === 200 && categoriesResponse.data?.data?.length > 0) {
        results.categories = { status: '✅ PASS', details: `${categoriesResponse.data.data.length} categories found` };
      } else {
        results.categories = { status: '❌ FAIL', details: 'Categories not working' };
      }
    } catch (error) {
      results.categories = { status: '❌ FAIL', details: error.message };
    }

    // Test 3: Ad Creation (without images)
    console.log('📝 Test 3: Ad Creation');
    try {
      const testAdData = {
        title: 'System Test Ad',
        description: 'Comprehensive test ad for system verification',
        price: 99.99,
        category: 'electronics', // Should fail validation
        condition: 'new',
        city: 'Test City',
        country: 'Test Country'
      };

      const createResponse = await axios.post('http://localhost:5005/api/v1/ads', testAdData);
      if (createResponse.status === 201) {
        results.api = { status: '✅ PASS', details: 'Ad creation successful' };
      } else {
        results.api = { status: '❌ FAIL', details: `Status ${createResponse.status}: ${createResponse.data?.message}` };
      }
    } catch (error) {
      results.api = { status: '❌ FAIL', details: error.message };
    }

    // Test 4: Ad Creation (with proper ObjectId)
    console.log('🔧 Test 4: Ad Creation with ObjectId');
    try {
      const mongoose = require('mongoose');
      const validCategoryId = new mongoose.Types.ObjectId('507f1f77bcf86b799');
      const testAdData2 = {
        title: 'System Test Ad 2',
        description: 'Test ad with proper ObjectId category',
        price: 199.99,
        category: validCategoryId,
        condition: 'new',
        city: 'Test City',
        country: 'Test Country'
      };

      const createResponse2 = await axios.post('http://localhost:5005/api/v1/ads', testAdData2);
      if (createResponse2.status === 201) {
        results.api = { status: '✅ PASS', details: 'Ad creation with ObjectId successful' };
      } else {
        results.api = { status: '❌ FAIL', details: `Status ${createResponse2.status}: ${createResponse2.data?.message}` };
      }
    } catch (error) {
      results.api = { status: '❌ FAIL', details: error.message };
    }

    // Test 5: Authentication
    console.log('🔐 Test 5: Authentication');
    try {
      // Test login endpoint
      const loginData = {
        email: 'test@example.com',
        password: 'testpassword123'
      };
      
      const loginResponse = await axios.post('http://localhost:5005/api/v1/auth/login', loginData);
      if (loginResponse.status === 200) {
        results.auth = { status: '✅ PASS', details: 'Login successful' };
      } else {
        results.auth = { status: '❌ FAIL', details: 'Login failed' };
      }
    } catch (error) {
      results.auth = { status: '❌ FAIL', details: error.message };
    }

    // Test 6: Chat System (Socket.io)
    console.log('💬 Test 6: Chat System');
    try {
      const io = require('socket.io-client');
      const socket = io('http://localhost:5005');
      
      socket.on('connect', () => {
        console.log('✅ Socket connected successfully');
        results.chat = { status: '✅ PASS', details: 'Socket.io connection working' };
        socket.disconnect();
      });
      
      socket.on('connect_error', (error) => {
        results.chat = { status: '❌ FAIL', details: `Socket connection failed: ${error.message}` };
      });
      
      setTimeout(() => {
        if (!socket.connected) {
          results.chat = { status: '❌ FAIL', details: 'Socket connection timeout' };
        }
      }, 5000);
    } catch (error) {
      results.chat = { status: '❌ FAIL', details: error.message };
    }

    // Test 7: Payment System
    console.log('💳 Test 7: Payment System');
    try {
      // Test promotion creation
      const promotionData = {
        ad: '507f1f77bcf86b799', // Valid ObjectId
        tier: 'bronze',
        paymentMethod: 'credit_card'
      };
      
      const promotionResponse = await axios.post('http://localhost:5005/api/v1/promotions', promotionData);
      if (promotionResponse.status === 201) {
        results.payments = { status: '✅ PASS', details: 'Promotion creation successful' };
      } else {
        results.payments = { status: '❌ FAIL', details: `Status ${promotionResponse.status}: ${promotionResponse.data?.message}` };
      }
    } catch (error) {
      results.payments = { status: '❌ FAIL', details: error.message };
    }

  } catch (error) {
    console.error('❌ Comprehensive test error:', error.message);
  }

  console.log('=' .repeat(50));
  console.log('📊 TEST RESULTS:');
  console.log('API Status:', results.api.status);
  console.log('Auth Status:', results.auth.status);
  console.log('Chat Status:', results.chat.status);
  console.log('Categories Status:', results.categories.status);
  console.log('Payments Status:', results.payments.status);
  console.log('=' .repeat(50));

  // Generate summary
  const allTestsPassed = Object.values(results).every(result => result.status === '✅ PASS');
  
  if (allTestsPassed) {
    console.log('🎉 ALL SYSTEMS WORKING PERFECTLY!');
  } else {
    console.log('⚠️ SOME SYSTEMS HAVE ISSUES:');
    }

  return results;
}

// Run the comprehensive test
comprehensiveTest();
