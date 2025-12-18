// src/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/database');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const { metricsMiddleware } = require('./middleware/metrics');
const logger = require('./utils/logger');

// Import routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const solanaRoutes = require('./routes/solana.routes');
const transactionRoutes = require('./routes/transaction.routes');
const adminRoutes = require('./routes/admin.routes');

// Initialize express app
const app = express();

// Connect to MongoDB
connectDB();

// Trust proxy (for rate limiting behind reverse proxy)
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : '*',
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev', { stream: logger.stream }));
} else {
  app.use(morgan('combined', { stream: logger.stream }));
}

// Metrics tracking middleware
app.use(metricsMiddleware);

// Rate limiting - General API
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for health check
    return req.path === '/health';
  }
});

app.use('/api/', limiter);

// Stricter rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.'
  }
});

// Health check endpoint (no auth, no rate limit)
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    version: '1.0.0'
  });
});

// API Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/solana', solanaRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/admin', adminRoutes);

// Welcome route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to Solana dApp API',
    version: '1.0.0',
    documentation: '/api/docs',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      users: '/api/users',
      solana: '/api/solana',
      transactions: '/api/transactions',
      admin: '/api/admin'
    },
    network: process.env.SOLANA_NETWORK
  });
});

// API Documentation endpoint
app.get('/api/docs', (req, res) => {
  res.json({
    success: true,
    message: 'API Documentation',
    version: '1.0.0',
    baseUrl: `${req.protocol}://${req.get('host')}`,
    endpoints: {
      authentication: {
        getNonce: 'GET /api/auth/nonce/:walletAddress',
        login: 'POST /api/auth/login',
        logout: 'POST /api/auth/logout',
        verify: 'GET /api/auth/verify'
      },
      users: {
        getProfile: 'GET /api/users/profile',
        updateProfile: 'PUT /api/users/profile',
        getStats: 'GET /api/users/stats',
        getByWallet: 'GET /api/users/:walletAddress'
      },
      solana: {
        getBalance: 'GET /api/solana/balance/:walletAddress',
        getTokens: 'GET /api/solana/tokens/:walletAddress',
        getTransactions: 'GET /api/solana/transactions/:walletAddress',
        syncTransactions: 'POST /api/solana/sync',
        verifyTransaction: 'GET /api/solana/verify/:signature',
        networkStatus: 'GET /api/solana/network',
        validateWallet: 'GET /api/solana/validate/:walletAddress'
      },
      transactions: {
        getUserTransactions: 'GET /api/transactions',
        getStats: 'GET /api/transactions/stats',
        getDailyVolume: 'GET /api/transactions/daily-volume',
        exportTransactions: 'GET /api/transactions/export',
        getBySignature: 'GET /api/transactions/:signature'
      },
      admin: {
        metrics: 'GET /api/admin/metrics',
        cacheStats: 'GET /api/admin/cache/stats',
        databaseStats: 'GET /api/admin/database/stats',
        systemInfo: 'GET /api/admin/system/info'
      }
    }
  });
});

// 404 handler - must be after all routes
app.use(notFound);

// Error handling middleware - must be last
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  logger.info(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║   🚀 Solana dApp Backend Server Started              ║
║                                                       ║
║   📡 Port:        ${PORT}                            ║
║   🌍 Environment: ${process.env.NODE_ENV}            ║
║   🔗 URL:         http://localhost:${PORT}           ║
║   ⛓️  Network:     ${process.env.SOLANA_NETWORK}    ║
║   📚 Docs:        http://localhost:${PORT}/api/docs  ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
const gracefulShutdown = (signal) => {
  logger.info(`${signal} signal received: closing HTTP server`);
  
  server.close(() => {
    logger.info('HTTP server closed');
    
    // Close database connection
    const mongoose = require('mongoose');
    mongoose.connection.close(false, () => {
      logger.info('MongoDB connection closed');
      process.exit(0);
    });
  });

  // Force close after 10 seconds
  setTimeout(() => {
    logger.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Promise Rejection:', err);
  gracefulShutdown('unhandledRejection');
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  gracefulShutdown('uncaughtException');
});

module.exports = app;