const jwt  = require('jsonwebtoken');
const User = require('../models/User');

// POST /api/admin/login
exports.adminLogin = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password)
      return res.status(400).json({ message: 'All fields required' });

    // Compare against .env — NOT database
    if (
      username !== process.env.ADMIN_USERNAME ||
      password !== process.env.ADMIN_PASSWORD
    ) {
      return res.status(401).json({ message: 'Invalid admin credentials' });
    }

    const token = jwt.sign(
      { role: 'admin', username },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: { name: 'Admin', role: 'admin' },
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/admin/students  — admin only
exports.getStudents = async (_req, res) => {
  try {
    const students = await User
      .find({ role: 'student' })
      .select('name email studentId createdAt')
      .sort({ createdAt: -1 });

    res.json({ total: students.length, students });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
