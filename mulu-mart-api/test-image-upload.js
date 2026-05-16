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

// Submit the form using built-in http module
const http = require('http');
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5NWY5NDE1MjgxMjQxMzE5YWVhYjcyNSIsImlhdCI6MTc2Nzg3MTUwOSwiZXhwIjoxNzcwNDYzNTA5fQ.5SuJQfTTwES8QhR5PUPwcsQKV8yOxBNojcD3xUzqKWI';

// Get the form data as a buffer
const formLength = form.getLengthSync();
const postData = Buffer.alloc(formLength);
let offset = 0;

form.on('data', (chunk) => {
  chunk.copy(postData, offset);
  offset += chunk.length;
});

form.on('end', () => {
  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/v1/ads',
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': form.getHeaders()['content-type'],
      'Content-Length': postData.length
    }
  };

  const req = http.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    res.on('end', () => {
      console.log('Test ad created:', JSON.parse(data));
    });
  });

  req.write(postData);
  req.end();
});

form.submit();

// Clean up test file
setTimeout(() => {
  fs.unlinkSync(testImagePath);
}, 1000);
