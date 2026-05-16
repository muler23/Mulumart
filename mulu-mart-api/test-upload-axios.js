const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Create a simple test image file (1x1 pixel PNG)
const testImagePath = path.join(__dirname, 'test-image.png');
const testImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
fs.writeFileSync(testImagePath, Buffer.from(testImageBase64, 'base64'));

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5NWY5NDE1MjgxMjQxMzE5YWVhYjcyNSIsImlhdCI6MTc2Nzg3MTUwOSwiZXhwIjoxNzcwNDYzNTA5fQ.5SuJQfTTwES8QhR5PUPwcsQKV8yOxBNojcD3xUzqKWI';

async function testAdCreation() {
  try {
    console.log('🔼 Testing ad creation with image...');
    
    // Create form data
    const form = new FormData();
    form.append('title', 'Test Ad with Image via Axios');
    form.append('description', 'This ad has an image uploaded via axios');
    form.append('price', '200');
    form.append('category', '695f87c67e9c2ca616e231b2');
    form.append('condition', 'new');
    form.append('location[city]', 'Addis Ababa');
    form.append('location[country]', 'Ethiopia');
    form.append('images', fs.createReadStream(testImagePath), 'test-image-axios.png');

    const response = await axios.post('http://localhost:5005/api/v1/ads', form, {
      headers: {
        ...form.getHeaders(),
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('✅ Ad created successfully:', response.data);
    
    // Test image upload to existing ad
    if (response.data.data?._id) {
      await testImageUpload(response.data.data._id);
    }
    
  } catch (error) {
    console.error('❌ Error creating ad:', error.response?.data || error.message);
  }
}

async function testImageUpload(adId) {
  try {
    console.log('\n🔼 Testing image upload to existing ad:', adId);
    
    const uploadForm = new FormData();
    uploadForm.append('images', fs.createReadStream(testImagePath), 'upload-axios.png');
    
    const uploadResponse = await axios.post(`http://localhost:5005/api/v1/ads/${adId}/images`, uploadForm, {
      headers: uploadForm.getHeaders()
    });

    console.log('✅ Image upload successful:', uploadResponse.data);
    
  } catch (error) {
    console.error('❌ Error uploading image:', error.response?.data || error.message);
  }
}

// Run the test
testAdCreation().then(() => {
  // Clean up test file
  setTimeout(() => {
    try {
      fs.unlinkSync(testImagePath);
      console.log('🧹 Test file cleaned up');
    } catch (e) {
      console.log('Cleanup error:', e.message);
    }
  }, 2000);
}).catch(console.error);
