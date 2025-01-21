const express = require('express');
const router = express.Router();
const { signup, signin, sendResetEmail, resetPassword, verifyResetToken } = require('../controllers/authController');

// Sign-up route
router.post('/signup', signup);

// Sign-in route
router.post('/signin', signin);

// Password reset request route
router.post('/reset-password', sendResetEmail);

// verify token
router.get('/verify-reset-password',verifyResetToken);

// Password reset with token route
router.post('/reset-password/:token', resetPassword);

module.exports = router;
