const mongoose = require('mongoose');
const User = require('../src/models/User');
require('dotenv').config();

const checkUsers = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/mulumart');
    console.log('✅ Connected to MongoDB');

    const users = await User.find({});
    console.log('Users created:');
    users.forEach(user => {
      console.log(`- ${user.username} (${user.email}) - Role: ${user.role}`);
    });

    await mongoose.connection.close();
    console.log('✅ Database connection closed');
  } catch (error) {
    console.error('❌ Error:', error);
  }
};

checkUsers();
