const jwt  = require('jsonwebtoken');
const User = require('../models/User');

const signToken = (payload, expiresIn = '7d') =>
  jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });

// POST /api/auth/register  — students only
exports.register = async (req, res) => {
  try {
    const { name, email, password, studentId } = req.body;

    if (!name || !email || !password || !studentId)
      return res.status(400).json({ message: 'All fields required' });

    const emailExists = await User.findOne({ email });
    if (emailExists)
      return res.status(409).json({ message: 'Email already registered' });

    const idExists = await User.findOne({ studentId });
    if (idExists)
      return res.status(409).json({ message: 'Student ID already registered' });

    await User.create({ name, email, password, studentId, role: 'student' });

    res.status(201).json({ message: 'Registration successful. Please login.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/auth/login  — students only
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: 'All fields required' });

    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ message: 'Invalid credentials' });

    const token = signToken({ id: user._id, role: user.role });

    res.json({
      token,
      user: {
        id:        user._id,
        name:      user.name,
        email:     user.email,
        studentId: user.studentId,
        role:      user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
