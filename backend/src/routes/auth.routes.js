// src/routes/auth.routes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const validateWalletSignature = require('../middleware/validateWallet');
const auth = require('../middleware/auth');

// @route   GET /api/auth/nonce/:walletAddress
// @desc    Get nonce for wallet signature
// @access  Public
router.get('/nonce/:walletAddress', authController.getNonce);

// @route   POST /api/auth/login
// @desc    Verify signature and login
// @access  Public
router.post('/login', validateWalletSignature, authController.login);

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', auth, authController.logout);

// @route   GET /api/auth/verify
// @desc    Verify current token
// @access  Private
router.get('/verify', auth, authController.verifyToken);

module.exports = router;