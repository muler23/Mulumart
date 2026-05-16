const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// Create a simple test image file (1x1 pixel PNG)
const testImagePath = path.join(__dirname, 'test-image.png');
const testImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
fs.writeFileSync(testImagePath, Buffer.from(testImageBase64, 'base64'));

// Create form data
const form = new FormData();
form.append('title', 'Test Ad with Real Image');
form.append('description', 'This ad has a real image');
form.append('price', '150');
form.append('category', '695f87c67e9c2ca616e231b2');
form.append('condition', 'new');
form.append('location[city]', 'Addis Ababa');
form.append('location[country]', 'Ethiopia');
form.append('images', fs.createReadStream(testImagePath), 'test-image.png');

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5NWY5NDE1MjgxMjQxMzE5YWVhYjcyNSIsImlhdCI6MTc2Nzg3MTUwOSwiZXhwIjoxNzcwNDYzNTA5fQ.5SuJQfTTwES8QhR5PUPwcsQKV8yOxBNojcD3xUzqKWI';

// Submit the form
const options = {
  host: 'localhost',
  port: 5005,
  path: '/api/v1/ads',
  method: 'POST',
  headers: {
    ...form.getHeaders(),
    'Authorization': `Bearer ${token}`
  }
};

const req = form.submit(options, (err, res) => {
  if (err) {
    console.error('❌ Submit error:', err);
    return;
  }

  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const result = JSON.parse(data);
      console.log('✅ Test ad created:', result);
      
      // Test image upload to existing ad
      if (result.data?._id) {
        testImageUpload(result.data._id);
      }
    } catch (e) {
      console.error('❌ Parse error:', e);
      console.log('Raw response:', data);
    }
  });
});

function testImageUpload(adId) {
  console.log('\n🔼 Testing image upload to ad:', adId);
  
  const uploadForm = new FormData();
  uploadForm.append('images', fs.createReadStream(testImagePath), 'upload-test.png');
  
  const uploadOptions = {
    host: 'localhost',
    port: 5005,
    path: `/api/v1/ads/${adId}/images`,
    method: 'POST',
    headers: uploadForm.getHeaders()
  };
  
  const uploadReq = uploadForm.submit(uploadOptions, (err, res) => {
    if (err) {
      console.error('❌ Upload error:', err);
      return;
    }
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const result = JSON.parse(data);
        console.log('✅ Image upload result:', result);
      } catch (e) {
        console.error('❌ Upload parse error:', e);
        console.log('Raw upload response:', data);
      }
    });
  });
}

// Clean up test file
setTimeout(() => {
  try {
    fs.unlinkSync(testImagePath);
  } catch (e) {
    console.log('Cleanup error:', e.message);
  }
}, 5000);
