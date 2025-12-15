// src/routes/solana.routes.js
const express = require('express');
const router = express.Router();
const solanaController = require('../controllers/solana.controller');
const auth = require('../middleware/auth');

// @route   GET /api/solana/balance
// @desc    Get wallet balance (authenticated user)
// @access  Private
router.get('/balance', auth, solanaController.getBalance);

// @route   GET /api/solana/balance/:walletAddress
// @desc    Get balance for any wallet
// @access  Public
router.get('/balance/:walletAddress', solanaController.getBalance);

// @route   GET /api/solana/tokens
// @desc    Get token accounts (authenticated user)
// @access  Private
router.get('/tokens', auth, solanaController.getTokenAccounts);

// @route   GET /api/solana/tokens/:walletAddress
// @desc    Get token accounts for any wallet
// @access  Public
router.get('/tokens/:walletAddress', solanaController.getTokenAccounts);

// @route   GET /api/solana/transactions
// @desc    Get transaction history (authenticated user)
// @access  Private
router.get('/transactions', auth, solanaController.getTransactionHistory);

// @route   GET /api/solana/transactions/:walletAddress
// @desc    Get transaction history for any wallet
// @access  Public
router.get('/transactions/:walletAddress', solanaController.getTransactionHistory);

// @route   POST /api/solana/sync
// @desc    Sync transactions to database
// @access  Private
router.post('/sync', auth, solanaController.syncTransactions);

// @route   GET /api/solana/verify/:signature
// @desc    Verify transaction signature
// @access  Public
router.get('/verify/:signature', solanaController.verifyTransaction);

// @route   GET /api/solana/network
// @desc    Get network status
// @access  Public
router.get('/network', solanaController.getNetworkStatus);

// @route   GET /api/solana/validate/:walletAddress
// @desc    Validate wallet address
// @access  Public
router.get('/validate/:walletAddress', solanaController.validateWallet);

module.exports = router;