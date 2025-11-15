// routes/transactions.js - Transaction Routes

const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const authMiddleware = require('../middleware/auth');

// All protected routes (require JWT token)
router.get('/balance', authMiddleware, transactionController.getBalance);
router.post('/purchase', authMiddleware, transactionController.initiateTransaction);
router.post('/confirm', authMiddleware, transactionController.confirmTransaction);
router.get('/history', authMiddleware, transactionController.getTransactionHistory);

module.exports = router;