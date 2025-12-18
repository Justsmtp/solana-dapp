// src/utils/helpers.js
const { REGEX, SOLANA } = require('../config/constants');

/**
 * Validate Solana wallet address format
 */
const isValidSolanaAddress = (address) => {
  if (!address || typeof address !== 'string') return false;
  return REGEX.SOLANA_ADDRESS.test(address);
};

/**
 * Validate email format
 */
const isValidEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  return REGEX.EMAIL.test(email);
};

/**
 * Validate username format
 */
const isValidUsername = (username) => {
  if (!username || typeof username !== 'string') return false;
  return REGEX.USERNAME.test(username);
};

/**
 * Convert lamports to SOL
 */
const lamportsToSol = (lamports) => {
  return lamports / SOLANA.LAMPORTS_PER_SOL;
};

/**
 * Convert SOL to lamports
 */
const solToLamports = (sol) => {
  return Math.floor(sol * SOLANA.LAMPORTS_PER_SOL);
};

/**
 * Format wallet address (truncate middle)
 */
const formatWalletAddress = (address, startChars = 4, endChars = 4) => {
  if (!address) return '';
  if (address.length <= startChars + endChars) return address;
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
};

/**
 * Generate random nonce
 */
const generateNonce = () => {
  return Math.floor(Math.random() * 1000000).toString();
};

/**
 * Sanitize user input
 */
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input.trim().replace(/[<>]/g, '');
};

/**
 * Calculate pagination metadata
 */
const getPaginationMetadata = (page, limit, total) => {
  const totalPages = Math.ceil(total / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;
  
  return {
    currentPage: page,
    totalPages,
    totalItems: total,
    itemsPerPage: limit,
    hasNextPage,
    hasPrevPage
  };
};

/**
 * Format date to readable string
 */
const formatDate = (date) => {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Sleep/delay function
 */
const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Retry function with exponential backoff
 */
const retryWithBackoff = async (fn, maxRetries = 3, baseDelay = 1000) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      
      const delay = baseDelay * Math.pow(2, i);
      await sleep(delay);
    }
  }
};

/**
 * Create success response
 */
const successResponse = (data, message = 'Success') => {
  return {
    success: true,
    message,
    data
  };
};

/**
 * Create error response
 */
const errorResponse = (message, error = null) => {
  const response = {
    success: false,
    message
  };
  
  if (error && process.env.NODE_ENV === 'development') {
    response.error = error.message;
    response.stack = error.stack;
  }
  
  return response;
};

/**
 * Parse sort query
 */
const parseSort = (sortQuery) => {
  if (!sortQuery) return { createdAt: -1 };
  
  const sort = {};
  const parts = sortQuery.split(',');
  
  parts.forEach(part => {
    const [field, order] = part.split(':');
    sort[field] = order === 'asc' ? 1 : -1;
  });
  
  return sort;
};

/**
 * Remove sensitive fields from object
 */
const removeSensitiveFields = (obj, fields = ['password', 'nonce', '__v']) => {
  const cleaned = { ...obj };
  fields.forEach(field => delete cleaned[field]);
  return cleaned;
};

/**
 * Check if string is valid JSON
 */
const isValidJSON = (str) => {
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
};

/**
 * Calculate percentage
 */
const calculatePercentage = (value, total) => {
  if (total === 0) return 0;
  return ((value / total) * 100).toFixed(2);
};

/**
 * Truncate string
 */
const truncateString = (str, maxLength = 50) => {
  if (!str || str.length <= maxLength) return str;
  return `${str.slice(0, maxLength)}...`;
};

/**
 * Deep clone object
 */
const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

/**
 * Check if object is empty
 */
const isEmpty = (obj) => {
  if (obj === null || obj === undefined) return true;
  if (Array.isArray(obj) || typeof obj === 'string') return obj.length === 0;
  return Object.keys(obj).length === 0;
};

module.exports = {
  isValidSolanaAddress,
  isValidEmail,
  isValidUsername,
  lamportsToSol,
  solToLamports,
  formatWalletAddress,
  generateNonce,
  sanitizeInput,
  getPaginationMetadata,
  formatDate,
  sleep,
  retryWithBackoff,
  successResponse,
  errorResponse,
  parseSort,
  removeSensitiveFields,
  isValidJSON,
  calculatePercentage,
  truncateString,
  deepClone,
  isEmpty
};