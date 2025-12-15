// src/routes/admin.routes.js
const express = require('express');
const router = express.Router();
const { getMetrics, resetMetrics } = require('../middleware/metrics');
const cacheService = require('../services/cache.service');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const logger = require('../utils/logger');

// @route   GET /api/admin/metrics
// @desc    Get application metrics
// @access  Public (should be protected in production)
router.get('/metrics', (req, res) => {
  try {
    const metrics = getMetrics();
    res.json({
      success: true,
      data: metrics
    });
  } catch (error) {
    logger.error('Get metrics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch metrics'
    });
  }
});

// @route   POST /api/admin/metrics/reset
// @desc    Reset metrics
// @access  Public (should be protected in production)
router.post('/metrics/reset', (req, res) => {
  try {
    resetMetrics();
    res.json({
      success: true,
      message: 'Metrics reset successfully'
    });
  } catch (error) {
    logger.error('Reset metrics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset metrics'
    });
  }
});

// @route   GET /api/admin/cache/stats
// @desc    Get cache statistics
// @access  Public (should be protected in production)
router.get('/cache/stats', (req, res) => {
  try {
    const stats = cacheService.getStats();
    const size = cacheService.getSize();
    const keys = cacheService.keys();

    res.json({
      success: true,
      data: {
        stats,
        size,
        sampleKeys: keys.slice(0, 10)
      }
    });
  } catch (error) {
    logger.error('Get cache stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch cache stats'
    });
  }
});

// @route   POST /api/admin/cache/flush
// @desc    Flush all cache
// @access  Public (should be protected in production)
router.post('/cache/flush', (req, res) => {
  try {
    cacheService.flush();
    res.json({
      success: true,
      message: 'Cache flushed successfully'
    });
  } catch (error) {
    logger.error('Flush cache error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to flush cache'
    });
  }
});

// @route   GET /api/admin/database/stats
// @desc    Get database statistics
// @access  Public (should be protected in production)
router.get('/database/stats', async (req, res) => {
  try {
    const [userCount, transactionCount, recentUsers] = await Promise.all([
      User.countDocuments(),
      Transaction.countDocuments(),
      User.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select('walletAddress createdAt lastLogin')
    ]);

    // Get database size info
    const mongoose = require('mongoose');
    const db = mongoose.connection.db;
    const stats = await db.stats();

    res.json({
      success: true,
      data: {
        users: {
          total: userCount,
          recent: recentUsers
        },
        transactions: {
          total: transactionCount
        },
        database: {
          size: stats.dataSize,
          storageSize: stats.storageSize,
          indexes: stats.indexes,
          collections: stats.collections
        }
      }
    });
  } catch (error) {
    logger.error('Get database stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch database stats'
    });
  }
});

// @route   GET /api/admin/system/info
// @desc    Get system information
// @access  Public (should be protected in production)
router.get('/system/info', (req, res) => {
  try {
    const os = require('os');
    
    res.json({
      success: true,
      data: {
        nodejs: {
          version: process.version,
          platform: process.platform,
          arch: process.arch,
          uptime: process.uptime()
        },
        system: {
          hostname: os.hostname(),
          platform: os.platform(),
          cpus: os.cpus().length,
          totalMemory: os.totalmem(),
          freeMemory: os.freemem(),
          loadAverage: os.loadavg()
        },
        process: {
          pid: process.pid,
          memoryUsage: process.memoryUsage(),
          cpuUsage: process.cpuUsage()
        },
        environment: process.env.NODE_ENV
      }
    });
  } catch (error) {
    logger.error('Get system info error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch system info'
    });
  }
});

// @route   GET /api/admin/logs
// @desc    Get recent logs (not recommended for production)
// @access  Public (should be protected in production)
router.get('/logs', (req, res) => {
  const fs = require('fs');
  const path = require('path');

  try {
    const { type = 'combined', lines = 100 } = req.query;
    const logFile = path.join(__dirname, `../../logs/${type}.log`);

    if (!fs.existsSync(logFile)) {
      return res.status(404).json({
        success: false,
        message: 'Log file not found'
      });
    }

    const logs = fs.readFileSync(logFile, 'utf8')
      .split('\n')
      .filter(Boolean)
      .slice(-parseInt(lines));

    res.json({
      success: true,
      data: {
        type,
        count: logs.length,
        logs: logs.map(log => {
          try {
            return JSON.parse(log);
          } catch {
            return log;
          }
        })
      }
    });
  } catch (error) {
    logger.error('Get logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch logs'
    });
  }
});

module.exports = router;