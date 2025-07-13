const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const { register, login, getMe, updateFCMToken } = require('../controllers/auth');
const { protect } = require('../middleware/auth');

// Validation middleware
const registerValidation = [
  check('name', 'Name is required').not().isEmpty(),
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
  check('phone', 'Please include a valid phone number').matches(/^\+?[\d\s-]{10,}$/)
];

const loginValidation = [
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Password is required').exists()
];

// Routes
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.get('/me', protect, getMe);
router.put('/fcm-token', protect, updateFCMToken);

module.exports = router; 