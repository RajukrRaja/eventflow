// routes/userRoutes.js
const express = require('express');
const { register, login } = require('../controllers/user.controller');
const auth = require('../middleware/auth.middleware');
const router = express.Router();

// Register a new user
router.post('/register', register);

// Login user
router.post('/login', login);

// Protected route: Get user profile (for testing auth)
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await require('../models').User.findByPk(req.user.id, {
      attributes: ['id', 'email', 'role'],
    });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;