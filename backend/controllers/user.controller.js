const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const validator = require('validator');
const { User, AuditLog } = require('../models');
require('dotenv').config();

const sendResponse = (res, status, data) => res.status(status).json(data);

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined in environment variables');
}

const register = async (req, res) => {
  const { email, password, role } = req.body;

  try {
    if (!email || !password || !role) {
      return sendResponse(res, 400, { error: 'Email, password, and role are required' });
    }

    if (!validator.isEmail(email)) {
      return sendResponse(res, 400, { error: 'Invalid email format' });
    }

    if (!validator.isLength(password, { min: 8 })) {
      return sendResponse(res, 400, { error: 'Password must be at least 8 characters long' });
    }

    if (!/(?=.*[A-Z])/.test(password)) {
      return sendResponse(res, 400, { error: 'Password must contain at least one uppercase letter' });
    }

    if (!/(?=.*\d)/.test(password)) {
      return sendResponse(res, 400, { error: 'Password must contain at least one number' });
    }

    if (!/(?=.*[!@#$%^&*()_+={}\[\]|\\:;,.<>?])/.test(password)) {
      return sendResponse(res, 400, { error: 'Password must contain at least one special character' });
    }

    if (!['attendee', 'organizer'].includes(role)) {
      return sendResponse(res, 400, { error: 'Role must be attendee or organizer' });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return sendResponse(res, 409, { error: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({
      email: validator.normalizeEmail(email),
      password: hashedPassword,
      role,
    });

    if (user && user.id) {
      await AuditLog.create({
        action: 'REGISTER',
        userId: user.id,
        details: `User ${email} registered with role ${role}`,
      });
      return sendResponse(res, 201, { message: 'Registration successful' });
    }

    return sendResponse(res, 500, { error: 'Failed to create user' });
  } catch (error) {
    console.error('Registration error:', error.message, error.stack);
    return sendResponse(res, 500, { error: 'Internal server error' });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return sendResponse(res, 400, { error: 'Email and password required' });
    }

    if (!validator.isEmail(email)) {
      return sendResponse(res, 400, { error: 'Invalid email format' });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return sendResponse(res, 401, { error: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return sendResponse(res, 401, { error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    if (user && user.id) {
      await AuditLog.create({
        action: 'LOGIN',
        userId: user.id,
        details: `User ${email} logged in`,
      });
    } else {
      console.error('User not found for AuditLog');
    }

    return sendResponse(res, 200, {
      token,
      role: user.role, // Added role to response
      message: 'Login successful',
    });
  } catch (error) {
    console.error('Login error:', error.message, error.stack);
    return sendResponse(res, 500, { error: 'Internal server error' });
  }
};

module.exports = { register, login };