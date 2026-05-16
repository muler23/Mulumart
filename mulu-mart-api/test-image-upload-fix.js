const fs = require('fs');
const path = require('path');

console.log('🔍 Checking upload directory structure...');

// Check if public/uploads/ads exists
const uploadDir = path.join(__dirname, 'public', 'uploads', 'ads');
console.log('Upload directory:', uploadDir);
console.log('Directory exists:', fs.existsSync(uploadDir));

if (fs.existsSync(uploadDir)) {
  const files = fs.readdirSync(uploadDir);
  console.log('Files in upload directory:', files);
} else {
  console.log('Creating upload directory...');
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('Directory created:', fs.existsSync(uploadDir));
}

// Check server.js static file configuration
console.log('\n📁 Static file serving:');
console.log('Server should serve files from: /public');
console.log('Uploads should be accessible at: /uploads/ads/filename');

// Test path resolution
const testPath = path.join(__dirname, 'src', 'controllers', 'adController.js');
console.log('\n📍 Path resolution test:');
console.log('adController.js exists:', fs.existsSync(testPath));
console.log('From adController to public/uploads/ads:', path.join(path.dirname(testPath), '../../public/uploads/ads'));

console.log('\n✅ Upload directory structure is ready!');
