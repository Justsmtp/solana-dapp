// src/routes/transaction.routes.js
const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transaction.controller');
const auth = require('../middleware/auth');

// @route   GET /api/transactions
// @desc    Get user transactions with pagination
// @access  Private
router.get('/', auth, transactionController.getUserTransactions);

// @route   GET /api/transactions/stats
// @desc    Get transaction statistics
// @access  Private
router.get('/stats', auth, transactionController.getTransactionStats);

// @route   GET /api/transactions/daily-volume
// @desc    Get daily transaction volume
// @access  Private
router.get('/daily-volume', auth, transactionController.getDailyVolume);

// @route   GET /api/transactions/export
// @desc    Export transactions to CSV
// @access  Private
router.get('/export', auth, transactionController.exportTransactions);

// @route   DELETE /api/transactions/cleanup
// @desc    Delete old transactions
// @access  Private
router.delete('/cleanup', auth, transactionController.cleanupOldTransactions);

// @route   GET /api/transactions/:signature
// @desc    Get transaction by signature
// @access  Private
router.get('/:signature', auth, transactionController.getTransactionBySignature);

module.exports = router;