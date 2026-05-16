const mongoose = require('mongoose');
const User = require('../src/models/User');
require('dotenv').config();

const fixUserRole = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/mulumart');
    console.log('✅ Connected to MongoDB');

    // Find user with invalid role "adminn"
    const user = await User.findOne({ email: 'mulugetaabebe@gmail.com' });
    
    if (user && user.role === 'adminn') {
      // Fix role to "admin" - use updateOne to bypass validation
      await User.updateOne(
        { email: 'mulugetaabebe@gmail.com' },
        { role: 'admin' }
      );
      console.log('✅ Fixed role for mulugetaabebe@gmail.com from "adminn" to "admin"');
    } else {
      console.log('⚠️ User not found or role is not "adminn"');
    }

    // Show all users with their roles
    const users = await User.find({});
    console.log('\n👥 All Users:');
    users.forEach(user => {
      console.log(`- ${user.name} (${user.email}) - Role: ${user.role}`);
    });

    await mongoose.connection.close();
    console.log('✅ Database connection closed');

  } catch (error) {
    console.error('❌ Error:', error);
  }
};

fixUserRole();
