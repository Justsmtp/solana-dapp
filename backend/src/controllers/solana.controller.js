// src/controllers/solana.controller.js
const solanaService = require('../services/solana.service');
const Transaction = require('../models/Transaction');
const User = require('../models/User');

class SolanaController {
  // Get wallet balance
  async getBalance(req, res) {
    try {
      const walletAddress = req.walletAddress || req.params.walletAddress;

      const balance = await solanaService.getBalance(walletAddress);

      res.json({
        success: true,
        data: {
          walletAddress,
          ...balance
        }
      });

    } catch (error) {
      console.error('Get balance error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch balance',
        error: error.message
      });
    }
  }

  // Get token accounts
  async getTokenAccounts(req, res) {
    try {
      const walletAddress = req.walletAddress || req.params.walletAddress;

      const tokens = await solanaService.getTokenAccounts(walletAddress);

      res.json({
        success: true,
        data: {
          walletAddress,
          tokens,
          count: tokens.length
        }
      });

    } catch (error) {
      console.error('Get token accounts error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch token accounts',
        error: error.message
      });
    }
  }

  // Get transaction history
  async getTransactionHistory(req, res) {
    try {
      const walletAddress = req.walletAddress || req.params.walletAddress;
      const limit = parseInt(req.query.limit) || 20;

      const transactions = await solanaService.getTransactionHistory(
        walletAddress, 
        limit
      );

      res.json({
        success: true,
        data: {
          walletAddress,
          transactions,
          count: transactions.length
        }
      });

    } catch (error) {
      console.error('Get transaction history error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch transaction history',
        error: error.message
      });
    }
  }

  // Sync transactions to database
  async syncTransactions(req, res) {
    try {
      const walletAddress = req.walletAddress;
      const limit = parseInt(req.query.limit) || 50;

      // Fetch transactions from Solana
      const transactions = await solanaService.getTransactionHistory(
        walletAddress,
        limit
      );

      // Save to database
      let savedCount = 0;
      let updatedCount = 0;

      for (const tx of transactions) {
        const existingTx = await Transaction.findOne({ 
          signature: tx.signature 
        });

        if (!existingTx) {
          await Transaction.create({
            walletAddress,
            signature: tx.signature,
            type: 'other',
            amount: 0,
            blockTime: new Date(tx.blockTime * 1000),
            slot: tx.slot,
            fee: tx.fee / 1e9, // Convert lamports to SOL
            status: tx.status
          });
          savedCount++;
        } else if (existingTx.status !== tx.status) {
          existingTx.status = tx.status;
          await existingTx.save();
          updatedCount++;
        }
      }

      // Update user transaction count
      await User.findOneAndUpdate(
        { walletAddress },
        { $inc: { transactionCount: savedCount } }
      );

      res.json({
        success: true,
        message: 'Transactions synced successfully',
        data: {
          fetched: transactions.length,
          saved: savedCount,
          updated: updatedCount
        }
      });

    } catch (error) {
      console.error('Sync transactions error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to sync transactions',
        error: error.message
      });
    }
  }

  // Verify transaction
  async verifyTransaction(req, res) {
    try {
      const { signature } = req.params;

      const verification = await solanaService.verifyTransaction(signature);
      
      let details = null;
      if (verification.exists) {
        details = await solanaService.getTransactionDetails(signature);
      }

      res.json({
        success: true,
        data: {
          signature,
          verification,
          details
        }
      });

    } catch (error) {
      console.error('Verify transaction error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to verify transaction',
        error: error.message
      });
    }
  }

  // Get network status
  async getNetworkStatus(req, res) {
    try {
      const status = await solanaService.getNetworkStatus();

      res.json({
        success: true,
        data: status
      });

    } catch (error) {
      console.error('Get network status error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch network status',
        error: error.message
      });
    }
  }

  // Validate wallet
  async validateWallet(req, res) {
    try {
      const { walletAddress } = req.params;

      const validation = await solanaService.validateWallet(walletAddress);

      res.json({
        success: true,
        data: {
          walletAddress,
          ...validation
        }
      });

    } catch (error) {
      console.error('Validate wallet error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to validate wallet',
        error: error.message
      });
    }
  }
}

module.exports = new SolanaController();