const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');
const { registerUser, loginUser, getUserDetails } = require('../controllers/authController');

// Health check endpoint for debugging
router.get('/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Auth API is running' });
});

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', authMiddleware, getUserDetails);

module.exports = router;