const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

// Input validation helper
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
  
      // Validate input
      const validationError = validateInput(email, password, full_name, role);
      if (validationError) {
        return res.status(400).json({ message: validationError });
      }
  
      // Check if user exists
      const userExists = await User.findOne({ where: { email } });
      if (userExists) {
        return res.status(400).json({ message: 'Email already registered' });
      }
  
      // Debug input password
      console.log('Register - Raw Password:', password);
  
      // Create user (password will be hashed by beforeCreate hook)
      const user = await User.create({
        full_name,
        email,
        password, // Pass raw password
        role,
      });
  
      // Debug stored hash
      console.log('Register - Stored Hash:', user.password);
  
      // Generate JWT
      const token = jwt.sign({ id: user.user_id }, process.env.JWT_SECRET, {
        expiresIn: '1d',
      });
  
      return res.status(201).json({
        token,
        user: {
          id: user.user_id,
          full_name: user.full_name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      console.error('Register Error:', error);
      return res.status(500).json({ message: 'Server error during registration' });
    }
  };
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    if (typeof password !== 'string') {
      return res.status(400).json({ message: 'Password must be a string' });
    }

    // Normalize password
    const normalizedPassword = password.trim();
    console.log('Login - Raw Password:', password);
    console.log('Login - Normalized Password:', normalizedPassword);

    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Debug password comparison
    console.log('Login - Stored Hash:', user.password);
    const match = await bcrypt.compare(normalizedPassword, user.password);
    console.log('Login - Password Match:', match);

    if (!match) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign({ id: user.user_id }, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });

    return res.json({
      token,
      user: {
        id: user.user_id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login Error:', error);
    return res.status(500).json({ message: 'Server error during login' });
  }
};

const getUserDetails = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['user_id', 'full_name', 'email', 'role', 'is_verified'],
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json(user);
  } catch (error) {
    console.error('Get User Details Error:', error);
    return res.status(500).json({ message: 'Server error fetching user details' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserDetails,
};