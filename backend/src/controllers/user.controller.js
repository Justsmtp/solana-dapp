// src/controllers/user.controller.js
const User = require('../models/User');
const Transaction = require('../models/Transaction');

class UserController {
  // Get current user profile
  async getProfile(req, res) {
    try {
      const user = await User.findOne({ 
        walletAddress: req.walletAddress 
      }).select('-nonce');

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Get transaction stats
      const stats = await Transaction.aggregate([
        { $match: { walletAddress: user.walletAddress } },
        {
          $group: {
            _id: '$type',
            count: { $sum: 1 },
            totalAmount: { $sum: '$amount' }
          }
        }
      ]);

      res.json({
        success: true,
        data: {
          user,
          stats
        }
      });

    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch profile',
        error: error.message
      });
    }
  }

  // Update user profile
  async updateProfile(req, res) {
    try {
      const { username, email, bio, avatar, preferences } = req.body;

      const user = await User.findOne({ 
        walletAddress: req.walletAddress 
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Update fields
      if (username !== undefined) user.username = username;
      if (email !== undefined) user.email = email;
      if (bio !== undefined) user.bio = bio;
      if (avatar !== undefined) user.avatar = avatar;
      if (preferences !== undefined) {
        user.preferences = { ...user.preferences, ...preferences };
      }

      await user.save();

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: { user }
      });

    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update profile',
        error: error.message
      });
    }
  }

  // Get user by wallet address
  async getUserByWallet(req, res) {
    try {
      const { walletAddress } = req.params;

      const user = await User.findOne({ 
        walletAddress: walletAddress.toLowerCase() 
      }).select('-nonce -email');

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        data: { user }
      });

    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch user',
        error: error.message
      });
    }
  }

  // Get user statistics
  async getUserStats(req, res) {
    try {
      const stats = await Transaction.aggregate([
        { $match: { walletAddress: req.walletAddress } },
        {
          $group: {
            _id: null,
            totalTransactions: { $sum: 1 },
            totalVolume: { $sum: '$amount' },
            totalFees: { $sum: '$fee' },
            avgAmount: { $avg: '$amount' }
          }
        }
      ]);

      const recentActivity = await Transaction.find({ 
        walletAddress: req.walletAddress 
      })
      .sort({ blockTime: -1 })
      .limit(10);

      res.json({
        success: true,
        data: {
          stats: stats[0] || {
            totalTransactions: 0,
            totalVolume: 0,
            totalFees: 0,
            avgAmount: 0
          },
          recentActivity
        }
      });

    } catch (error) {
      console.error('Get stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch statistics',
        error: error.message
      });
    }
  }
}

module.exports = new UserController();