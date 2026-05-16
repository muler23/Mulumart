const axios = require('axios');

async function testServerStatus() {
  console.log('🔍 Testing Server Status...');
  
  try {
    // Test basic server connectivity
    console.log('\n📋 Step 1: Testing basic connectivity...');
    const response1 = await axios.get('http://localhost:5005/api/v1/ads', { timeout: 5000 });
    console.log('Status:', response1.status);
    console.log('Response:', response1.data);
    
    // Test categories endpoint
    console.log('\n📋 Step 2: Testing categories endpoint...');
    const response2 = await axios.get('http://localhost:5005/api/v1/categories', { timeout: 5000 });
    console.log('Status:', response2.status);
    console.log('Categories found:', response2.data?.data?.length);
    
    // Test auth endpoint
    console.log('\n📋 Step 3: Testing auth endpoint...');
    const response3 = await axios.post('http://localhost:5005/api/v1/auth/login', {
      email: 'test@mulumart.com',
      password: 'testpassword123'
    }, { timeout: 5000 });
    console.log('Status:', response3.status);
    console.log('Login successful:', response3.status === 200);
    
    // Test socket.io endpoint
    console.log('\n📋 Step 4: Testing socket.io...');
    try {
      const io = require('socket.io-client');
      const socket = io('http://localhost:5005');
      
      socket.on('connect', () => {
        console.log('✅ Socket.io connected successfully');
        socket.disconnect();
      });
      
      socket.on('connect_error', (error) => {
        console.log('❌ Socket.io connection error:', error.message);
      });
      
      socket.on('disconnect', () => {
        console.log('🔌 Socket.io disconnected');
      });
      
      // Set timeout
      setTimeout(() => {
        if (!socket.connected) {
          console.log('❌ Socket.io connection timeout');
          socket.disconnect();
        }
      }, 5000);
      
    } catch (error) {
      console.log('❌ Socket.io test error:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Server test failed:', error.message);
  }
}

testServerStatus();
