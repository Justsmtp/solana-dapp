// src/controllers/auth.controller.js
const User = require('../models/User');
const tokenService = require('../services/token.service');

class AuthController {
  // Get nonce for wallet signature
  async getNonce(req, res) {
    try {
      const { walletAddress } = req.params;

      if (!walletAddress) {
        return res.status(400).json({
          success: false,
          message: 'Wallet address is required'
        });
      }

      // Find or create user
      let user = await User.findOne({ walletAddress: walletAddress.toLowerCase() });

      if (!user) {
        // Create new user with random nonce
        user = new User({
          walletAddress: walletAddress.toLowerCase(),
          nonce: Math.floor(Math.random() * 1000000).toString()
        });
        await user.save();
      } else {
        // Generate new nonce for existing user
        user.nonce = Math.floor(Math.random() * 1000000).toString();
        await user.save();
      }

      res.json({
        success: true,
        data: {
          nonce: user.nonce,
          message: `Sign this message to authenticate with nonce: ${user.nonce}`
        }
      });

    } catch (error) {
      console.error('Get nonce error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate nonce',
        error: error.message
      });
    }
  }

  // Verify signature and login
  async login(req, res) {
    try {
      const { walletAddress } = req.validatedWallet 
        ? { walletAddress: req.validatedWallet } 
        : req.body;

      // Find user
      const user = await User.findOne({ 
        walletAddress: walletAddress.toLowerCase() 
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found. Please get a nonce first.'
        });
      }

      // Update last login
      await user.updateLastLogin();

      // Generate JWT token
      const token = tokenService.generateToken(user.walletAddress);
      const refreshToken = tokenService.generateRefreshToken(user.walletAddress);

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          token,
          refreshToken,
          user: {
            walletAddress: user.walletAddress,
            username: user.username,
            email: user.email,
            avatar: user.avatar,
            createdAt: user.createdAt
          }
        }
      });

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Login failed',
        error: error.message
      });
    }
  }

  // Logout (client-side token removal, optional server-side blacklist)
  async logout(req, res) {
    try {
      res.json({
        success: true,
        message: 'Logout successful'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Logout failed',
        error: error.message
      });
    }
  }

  // Verify current token
  async verifyToken(req, res) {
    try {
      res.json({
        success: true,
        message: 'Token is valid',
        data: {
          walletAddress: req.walletAddress,
          user: {
            walletAddress: req.user.walletAddress,
            username: req.user.username
          }
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Token verification failed',
        error: error.message
      });
    }
  }
}

module.exports = new AuthController();