const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');
const { registerUser, loginUser, getUserDetails } = require('../controllers/authController');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', authMiddleware, getUserDetails);

module.exports = router;
