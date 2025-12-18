// src/controllers/transaction.controller.js
const Transaction = require('../models/Transaction');
const { successResponse, errorResponse, getPaginationMetadata } = require('../utils/helpers');
const { PAGINATION } = require('../config/constants');
const logger = require('../utils/logger');

class TransactionController {
  // Get user transactions with pagination
  async getUserTransactions(req, res) {
    try {
      const { page = 1, limit = PAGINATION.DEFAULT_LIMIT, type, status } = req.query;
      const skip = (parseInt(page) - 1) * parseInt(limit);

      // Build query
      const query = { walletAddress: req.walletAddress };
      if (type) query.type = type;
      if (status) query.status = status;

      // Execute query with pagination
      const [transactions, total] = await Promise.all([
        Transaction.find(query)
          .sort({ blockTime: -1 })
          .skip(skip)
          .limit(parseInt(limit))
          .lean(),
        Transaction.countDocuments(query)
      ]);

      const pagination = getPaginationMetadata(
        parseInt(page),
        parseInt(limit),
        total
      );

      res.json(successResponse({
        transactions,
        pagination
      }));

    } catch (error) {
      logger.error('Get user transactions error:', error);
      res.status(500).json(errorResponse('Failed to fetch transactions', error));
    }
  }

  // Get transaction by signature
  async getTransactionBySignature(req, res) {
    try {
      const { signature } = req.params;

      const transaction = await Transaction.findOne({ signature }).lean();

      if (!transaction) {
        return res.status(404).json(errorResponse('Transaction not found'));
      }

      res.json(successResponse({ transaction }));

    } catch (error) {
      logger.error('Get transaction error:', error);
      res.status(500).json(errorResponse('Failed to fetch transaction', error));
    }
  }

  // Get transaction statistics
  async getTransactionStats(req, res) {
    try {
      const walletAddress = req.walletAddress;
      const { startDate, endDate } = req.query;

      // Build date filter
      const dateFilter = {};
      if (startDate) dateFilter.$gte = new Date(startDate);
      if (endDate) dateFilter.$lte = new Date(endDate);

      const matchStage = { walletAddress };
      if (Object.keys(dateFilter).length > 0) {
        matchStage.blockTime = dateFilter;
      }

      // Aggregate statistics
      const stats = await Transaction.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: null,
            totalTransactions: { $sum: 1 },
            totalAmount: { $sum: '$amount' },
            totalFees: { $sum: '$fee' },
            avgAmount: { $avg: '$amount' },
            avgFee: { $avg: '$fee' }
          }
        }
      ]);

      // Transaction types breakdown
      const typeBreakdown = await Transaction.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: '$type',
            count: { $sum: 1 },
            totalAmount: { $sum: '$amount' }
          }
        }
      ]);

      // Status breakdown
      const statusBreakdown = await Transaction.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);

      // Recent activity (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const recentCount = await Transaction.countDocuments({
        walletAddress,
        blockTime: { $gte: sevenDaysAgo }
      });

      res.json(successResponse({
        stats: stats[0] || {
          totalTransactions: 0,
          totalAmount: 0,
          totalFees: 0,
          avgAmount: 0,
          avgFee: 0
        },
        typeBreakdown,
        statusBreakdown,
        recentActivity: {
          last7Days: recentCount
        }
      }));

    } catch (error) {
      logger.error('Get transaction stats error:', error);
      res.status(500).json(errorResponse('Failed to fetch statistics', error));
    }
  }

  // Get daily transaction volume
  async getDailyVolume(req, res) {
    try {
      const { days = 30 } = req.query;
      const walletAddress = req.walletAddress;

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(days));

      const dailyVolume = await Transaction.aggregate([
        {
          $match: {
            walletAddress,
            blockTime: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: '$blockTime'
              }
            },
            count: { $sum: 1 },
            volume: { $sum: '$amount' },
            fees: { $sum: '$fee' }
          }
        },
        { $sort: { _id: 1 } }
      ]);

      res.json(successResponse({ dailyVolume }));

    } catch (error) {
      logger.error('Get daily volume error:', error);
      res.status(500).json(errorResponse('Failed to fetch daily volume', error));
    }
  }

  // Delete old transactions (cleanup)
  async cleanupOldTransactions(req, res) {
    try {
      const { days = 90 } = req.query;
      
      // Only allow admin or authenticated user to cleanup their own
      const walletAddress = req.walletAddress;

      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - parseInt(days));

      const result = await Transaction.deleteMany({
        walletAddress,
        blockTime: { $lt: cutoffDate }
      });

      logger.info(`Cleaned up ${result.deletedCount} transactions for ${walletAddress}`);

      res.json(successResponse({
        deleted: result.deletedCount,
        message: `Removed transactions older than ${days} days`
      }));

    } catch (error) {
      logger.error('Cleanup transactions error:', error);
      res.status(500).json(errorResponse('Failed to cleanup transactions', error));
    }
  }

  // Export transactions to CSV
  async exportTransactions(req, res) {
    try {
      const walletAddress = req.walletAddress;
      const { startDate, endDate, type } = req.query;

      const query = { walletAddress };
      if (startDate || endDate) {
        query.blockTime = {};
        if (startDate) query.blockTime.$gte = new Date(startDate);
        if (endDate) query.blockTime.$lte = new Date(endDate);
      }
      if (type) query.type = type;

      const transactions = await Transaction.find(query)
        .sort({ blockTime: -1 })
        .lean();

      // Format as CSV
      const csv = [
        'Signature,Type,Amount,Fee,Status,Date',
        ...transactions.map(tx => 
          `${tx.signature},${tx.type},${tx.amount},${tx.fee},${tx.status},${tx.blockTime}`
        )
      ].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=transactions.csv');
      res.send(csv);

    } catch (error) {
      logger.error('Export transactions error:', error);
      res.status(500).json(errorResponse('Failed to export transactions', error));
    }
  }
}

module.exports = new TransactionController();