// src/routes/user.routes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const auth = require('../middleware/auth');

// @route   GET /api/users/profile
// @desc    Get current user profile
// @access  Private
router.get('/profile', auth, userController.getProfile);

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, userController.updateProfile);

// @route   GET /api/users/stats
// @desc    Get user statistics
// @access  Private
router.get('/stats', auth, userController.getUserStats);

// @route   GET /api/users/:walletAddress
// @desc    Get user by wallet address
// @access  Public
router.get('/:walletAddress', userController.getUserByWallet);

module.exports = router;