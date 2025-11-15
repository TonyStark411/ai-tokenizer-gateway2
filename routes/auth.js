// routes/auth.js - Authentication Routes

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');

// Public routes
router.post('/connect', authController.connectWallet);

// Protected routes
router.get('/profile', authMiddleware, authController.getProfile);

module.exports = router;