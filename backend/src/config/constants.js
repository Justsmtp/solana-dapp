// src/config/constants.js

// HTTP Status Codes
const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503
};

// Transaction Types
const TRANSACTION_TYPES = {
  SEND: 'send',
  RECEIVE: 'receive',
  SWAP: 'swap',
  NFT_MINT: 'nft_mint',
  NFT_TRANSFER: 'nft_transfer',
  STAKE: 'stake',
  UNSTAKE: 'unstake',
  OTHER: 'other'
};

// Transaction Status
const TRANSACTION_STATUS = {
  CONFIRMED: 'confirmed',
  FINALIZED: 'finalized',
  FAILED: 'failed'
};

// User Themes
const USER_THEMES = {
  DARK: 'dark',
  LIGHT: 'light'
};

// Solana Networks
const SOLANA_NETWORKS = {
  DEVNET: 'devnet',
  TESTNET: 'testnet',
  MAINNET: 'mainnet-beta'
};

// API Response Messages
const MESSAGES = {
  // Success
  SUCCESS: 'Operation successful',
  LOGIN_SUCCESS: 'Login successful',
  LOGOUT_SUCCESS: 'Logout successful',
  PROFILE_UPDATED: 'Profile updated successfully',
  TRANSACTION_SYNCED: 'Transactions synced successfully',
  
  // Errors
  SERVER_ERROR: 'Internal server error',
  INVALID_INPUT: 'Invalid input data',
  UNAUTHORIZED: 'Unauthorized access',
  NOT_FOUND: 'Resource not found',
  VALIDATION_ERROR: 'Validation error',
  
  // Auth
  INVALID_TOKEN: 'Invalid or expired token',
  INVALID_SIGNATURE: 'Invalid wallet signature',
  NONCE_REQUIRED: 'Please get a nonce first',
  
  // Solana
  INVALID_WALLET: 'Invalid Solana wallet address',
  BALANCE_FETCH_ERROR: 'Failed to fetch balance',
  TRANSACTION_FETCH_ERROR: 'Failed to fetch transactions',
  NETWORK_ERROR: 'Solana network error'
};

// Pagination
const PAGINATION = {
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
  DEFAULT_PAGE: 1
};

// Rate Limiting
const RATE_LIMITS = {
  WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  MAX_REQUESTS: 100,
  AUTH_WINDOW_MS: 15 * 60 * 1000,
  AUTH_MAX_REQUESTS: 5
};

// Token Expiry
const TOKEN_EXPIRY = {
  ACCESS_TOKEN: '7d',
  REFRESH_TOKEN: '30d'
};

// Regex Patterns
const REGEX = {
  SOLANA_ADDRESS: /^[1-9A-HJ-NP-Za-km-z]{32,44}$/,
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  USERNAME: /^[a-zA-Z0-9_-]{3,20}$/
};

// Solana Constants
const SOLANA = {
  LAMPORTS_PER_SOL: 1000000000,
  DEFAULT_COMMITMENT: 'confirmed',
  TOKEN_PROGRAM_ID: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'
};

// Cache TTL (Time To Live)
const CACHE_TTL = {
  BALANCE: 30, // 30 seconds
  TRANSACTIONS: 60, // 1 minute
  NETWORK_STATUS: 120, // 2 minutes
  USER_PROFILE: 300 // 5 minutes
};

module.exports = {
  HTTP_STATUS,
  TRANSACTION_TYPES,
  TRANSACTION_STATUS,
  USER_THEMES,
  SOLANA_NETWORKS,
  MESSAGES,
  PAGINATION,
  RATE_LIMITS,
  TOKEN_EXPIRY,
  REGEX,
  SOLANA,
  CACHE_TTL
};