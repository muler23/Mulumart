const axios = require('axios');

async function testFinalCategories() {
  try {
    console.log('🔍 Testing final category structure...');
    
    const response = await axios.get('http://localhost:5005/api/v1/categories/nested');
    console.log('Categories response:', response.data);
    
    if (response.data.success && response.data.data.length > 0) {
      const electronics = response.data.data.find(cat => cat.name === 'Electronics');
      if (electronics) {
        console.log('\n📱 Electronics Structure:');
        console.log('Main:', electronics.name);
        console.log('Subcategories:', electronics.subcategories.map(sub => sub.name));
        
        const mobilePhones = electronics.subcategories.find(sub => sub.name === 'Mobile Phones');
        if (mobilePhones) {
          console.log('Mobile Phones sub-subcategories:', mobilePhones.subcategories?.map(subSub => subSub.name) || []);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Error testing categories:', error.message);
  }
}

testFinalCategories();
