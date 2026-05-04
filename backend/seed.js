require('dotenv').config();
const mongoose = require('mongoose');

// Admin credentials come from .env — NOT stored in database
// This seed only creates a test student account

const connectDB = require('./config/db');
const User = require('./models/User');

(async () => {
  await connectDB();

  // Check if test student already exists
  const exists = await User.findOne({ email: 'student@devopsacademy.com' });
  if (exists) {
    console.log('⚠️  Test student already exists — skipping.');
    process.exit(0);
  }

  await User.create({
    name:      'Test Student',
    email:     'student@devopsacademy.com',
    password:  'Student@1234',
    studentId: 'STU-2025-001',
    role:      'student',
  });

  console.log('✅ Test student created');
  console.log('   Email:     student@devopsacademy.com');
  console.log('   Password:  Student@1234');
  console.log('   StudentID: STU-2025-001');
  console.log('');
  console.log('✅ Admin credentials (from .env — NOT in database):');
  console.log('   Username:', process.env.ADMIN_USERNAME);
  console.log('   Login at: /adminlogin');

  process.exit(0);
})();
