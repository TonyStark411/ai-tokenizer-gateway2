// routes/services.js - Services Routes

const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/adminCheck');

// Public routes
router.get('/', serviceController.getAllServices);
router.get('/search', serviceController.searchServices);
router.get('/:serviceId', serviceController.getServiceDetails);

// Protected routes (Admin only)
router.post('/register', authMiddleware, adminMiddleware, serviceController.registerService);

module.exports = router;