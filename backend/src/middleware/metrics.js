// src/middleware/metrics.js
const logger = require('../utils/logger');

// Store metrics in memory
const metrics = {
  requests: {
    total: 0,
    success: 0,
    failed: 0,
    byEndpoint: {}
  },
  responseTimes: [],
  errors: []
};

/**
 * Metrics tracking middleware
 */
const metricsMiddleware = (req, res, next) => {
  const startTime = Date.now();
  const endpoint = `${req.method} ${req.path}`;

  // Initialize endpoint metrics
  if (!metrics.requests.byEndpoint[endpoint]) {
    metrics.requests.byEndpoint[endpoint] = {
      count: 0,
      success: 0,
      failed: 0,
      avgResponseTime: 0,
      totalResponseTime: 0
    };
  }

  // Track response
  const originalSend = res.send;
  res.send = function (data) {
    const responseTime = Date.now() - startTime;
    
    // Update metrics
    metrics.requests.total++;
    metrics.requests.byEndpoint[endpoint].count++;
    
    // Track response times
    metrics.responseTimes.push({
      endpoint,
      time: responseTime,
      timestamp: new Date()
    });

    // Keep only last 1000 response times
    if (metrics.responseTimes.length > 1000) {
      metrics.responseTimes.shift();
    }

    // Update endpoint metrics
    const endpointMetrics = metrics.requests.byEndpoint[endpoint];
    endpointMetrics.totalResponseTime += responseTime;
    endpointMetrics.avgResponseTime = 
      endpointMetrics.totalResponseTime / endpointMetrics.count;

    // Track success/failure
    if (res.statusCode >= 200 && res.statusCode < 400) {
      metrics.requests.success++;
      endpointMetrics.success++;
    } else {
      metrics.requests.failed++;
      endpointMetrics.failed++;
    }

    // Log slow requests (> 1000ms)
    if (responseTime > 1000) {
      logger.warn(`Slow request: ${endpoint} took ${responseTime}ms`);
    }

    // Log very slow requests (> 3000ms)
    if (responseTime > 3000) {
      logger.error(`Very slow request: ${endpoint} took ${responseTime}ms`);
    }

    originalSend.call(this, data);
  };

  next();
};

/**
 * Get current metrics
 */
const getMetrics = () => {
  const avgResponseTime = 
    metrics.responseTimes.length > 0
      ? metrics.responseTimes.reduce((sum, m) => sum + m.time, 0) / 
        metrics.responseTimes.length
      : 0;

  // Get slowest endpoints
  const slowestEndpoints = Object.entries(metrics.requests.byEndpoint)
    .map(([endpoint, data]) => ({
      endpoint,
      avgResponseTime: data.avgResponseTime,
      count: data.count
    }))
    .sort((a, b) => b.avgResponseTime - a.avgResponseTime)
    .slice(0, 10);

  // Get most used endpoints
  const mostUsedEndpoints = Object.entries(metrics.requests.byEndpoint)
    .map(([endpoint, data]) => ({
      endpoint,
      count: data.count,
      success: data.success,
      failed: data.failed
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return {
    requests: {
      total: metrics.requests.total,
      success: metrics.requests.success,
      failed: metrics.requests.failed,
      successRate: 
        metrics.requests.total > 0
          ? ((metrics.requests.success / metrics.requests.total) * 100).toFixed(2) + '%'
          : '0%'
    },
    performance: {
      avgResponseTime: Math.round(avgResponseTime),
      slowestEndpoints,
      mostUsedEndpoints
    },
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    timestamp: new Date().toISOString()
  };
};

/**
 * Reset metrics
 */
const resetMetrics = () => {
  metrics.requests = {
    total: 0,
    success: 0,
    failed: 0,
    byEndpoint: {}
  };
  metrics.responseTimes = [];
  metrics.errors = [];
  
  logger.info('Metrics reset');
};

/**
 * Track error
 */
const trackError = (error, req) => {
  metrics.errors.push({
    message: error.message,
    stack: error.stack,
    endpoint: `${req.method} ${req.path}`,
    timestamp: new Date()
  });

  // Keep only last 100 errors
  if (metrics.errors.length > 100) {
    metrics.errors.shift();
  }
};

module.exports = {
  metricsMiddleware,
  getMetrics,
  resetMetrics,
  trackError
};