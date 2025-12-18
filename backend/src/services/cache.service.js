// src/services/cache.service.js
const NodeCache = require('node-cache');
const { CACHE_TTL } = require('../config/constants');
const logger = require('../utils/logger');

class CacheService {
  constructor() {
    // Create cache instance with default TTL of 60 seconds
    this.cache = new NodeCache({
      stdTTL: 60,
      checkperiod: 120,
      useClones: false
    });

    // Log cache events
    this.cache.on('set', (key, value) => {
      logger.debug(`Cache set: ${key}`);
    });

    this.cache.on('del', (key, value) => {
      logger.debug(`Cache deleted: ${key}`);
    });

    this.cache.on('expired', (key, value) => {
      logger.debug(`Cache expired: ${key}`);
    });
  }

  /**
   * Get value from cache
   */
  get(key) {
    try {
      const value = this.cache.get(key);
      if (value !== undefined) {
        logger.debug(`Cache hit: ${key}`);
        return value;
      }
      logger.debug(`Cache miss: ${key}`);
      return null;
    } catch (error) {
      logger.error('Cache get error:', error);
      return null;
    }
  }

  /**
   * Set value in cache with optional TTL
   */
  set(key, value, ttl = CACHE_TTL.BALANCE) {
    try {
      const success = this.cache.set(key, value, ttl);
      if (success) {
        logger.debug(`Cache set successful: ${key} (TTL: ${ttl}s)`);
      }
      return success;
    } catch (error) {
      logger.error('Cache set error:', error);
      return false;
    }
  }

  /**
   * Delete value from cache
   */
  del(key) {
    try {
      const count = this.cache.del(key);
      logger.debug(`Cache deleted: ${key} (count: ${count})`);
      return count > 0;
    } catch (error) {
      logger.error('Cache delete error:', error);
      return false;
    }
  }

  /**
   * Delete multiple keys
   */
  delMultiple(keys) {
    try {
      const count = this.cache.del(keys);
      logger.debug(`Cache deleted multiple: ${count} keys`);
      return count;
    } catch (error) {
      logger.error('Cache delete multiple error:', error);
      return 0;
    }
  }

  /**
   * Clear all cache
   */
  flush() {
    try {
      this.cache.flushAll();
      logger.info('Cache flushed');
      return true;
    } catch (error) {
      logger.error('Cache flush error:', error);
      return false;
    }
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return this.cache.getStats();
  }

  /**
   * Get all keys
   */
  keys() {
    return this.cache.keys();
  }

  /**
   * Check if key exists
   */
  has(key) {
    return this.cache.has(key);
  }

  /**
   * Get or set pattern (lazy loading)
   */
  async getOrSet(key, fetchFunction, ttl = CACHE_TTL.BALANCE) {
    try {
      // Try to get from cache
      let value = this.get(key);
      
      if (value !== null) {
        return value;
      }

      // If not in cache, fetch and store
      logger.debug(`Fetching data for cache key: ${key}`);
      value = await fetchFunction();
      
      if (value !== null && value !== undefined) {
        this.set(key, value, ttl);
      }

      return value;
    } catch (error) {
      logger.error('Cache getOrSet error:', error);
      throw error;
    }
  }

  /**
   * Cache balance with wallet-specific key
   */
  cacheBalance(walletAddress, balance) {
    const key = `balance:${walletAddress}`;
    return this.set(key, balance, CACHE_TTL.BALANCE);
  }

  /**
   * Get cached balance
   */
  getCachedBalance(walletAddress) {
    const key = `balance:${walletAddress}`;
    return this.get(key);
  }

  /**
   * Cache transactions
   */
  cacheTransactions(walletAddress, transactions) {
    const key = `transactions:${walletAddress}`;
    return this.set(key, transactions, CACHE_TTL.TRANSACTIONS);
  }

  /**
   * Get cached transactions
   */
  getCachedTransactions(walletAddress) {
    const key = `transactions:${walletAddress}`;
    return this.get(key);
  }

  /**
   * Cache network status
   */
  cacheNetworkStatus(status) {
    const key = 'network:status';
    return this.set(key, status, CACHE_TTL.NETWORK_STATUS);
  }

  /**
   * Get cached network status
   */
  getCachedNetworkStatus() {
    const key = 'network:status';
    return this.get(key);
  }

  /**
   * Invalidate wallet-related caches
   */
  invalidateWalletCache(walletAddress) {
    const patterns = [
      `balance:${walletAddress}`,
      `transactions:${walletAddress}`,
      `tokens:${walletAddress}`,
      `profile:${walletAddress}`
    ];
    return this.delMultiple(patterns);
  }

  /**
   * Get cache size
   */
  getSize() {
    return this.keys().length;
  }

  /**
   * Get TTL for a key
   */
  getTtl(key) {
    return this.cache.getTtl(key);
  }
}

module.exports = new CacheService();