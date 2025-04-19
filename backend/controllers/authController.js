const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

const validateInput = (email, password, full_name, role) => {
  if (!email || !password || !full_name || !role) {
    return 'All fields (email, password, full_name, role) are required';
  }
  if (typeof password !== 'string' || password.length < 6) {
    return 'Password must be a string with at least 6 characters';
  }
  if (!['attendee', 'organizer'].includes(role)) {
    return 'Role must be either attendee or organizer';
  }
  return null;
};

const registerUser = async (req, res) => {
  try {
    const { full_name, email, password, role } = req.body;
    const validationError = validateInput(email, password, full_name, role);
    if (validationError) return res.status(400).json({ message: validationError });

    const userExists = await User.findOne({ where: { email } });
    if (userExists) return res.status(400).json({ message: 'Email already registered' });

    const user = await User.create({ full_name, email, password, role });

    const token = jwt.sign(
      { id: user.user_id, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '1d' }
    );

    return res.status(201).json({
      token,
      user: {
        id: user.user_id,
        full_name: user.full_name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Register Error:', error);
    return res.status(500).json({ message: 'Server error during registration' });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password || typeof password !== 'string') {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password.trim(), user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user.user_id, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '1d' }
    );

    return res.json({
      token,
      user: {
        id: user.user_id,
        full_name: user.full_name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login Error:', error);
    return res.status(500).json({ message: 'Server error during login' });
  }
};

const getUserDetails = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['user_id', 'full_name', 'email', 'role', 'is_verified']
    });

    if (!user) return res.status(404).json({ message: 'User not found' });
    return res.json(user);
  } catch (error) {
    console.error('Get User Details Error:', error);
    return res.status(500).json({ message: 'Server error fetching user details' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserDetails
};
