const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth.middleware');

router.post('/register', authController.registerUser);
router.post('/login', authController.loginUser);
router.get('/me', authMiddleware, authController.getUserDetails);

module.exports = router;
