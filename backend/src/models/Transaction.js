// src/models/Transaction.js
const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  walletAddress: {
    type: String,
    required: true,
    lowercase: true,
    index: true
  },
  signature: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  type: {
    type: String,
    enum: ['send', 'receive', 'swap', 'nft_mint', 'nft_transfer', 'stake', 'unstake', 'other'],
    required: true
  },
  amount: {
    type: Number,
    default: 0
  },
  tokenMint: {
    type: String,
    default: null
  },
  fromAddress: {
    type: String,
    lowercase: true
  },
  toAddress: {
    type: String,
    lowercase: true
  },
  blockTime: {
    type: Date,
    required: true
  },
  slot: {
    type: Number,
    required: true
  },
  fee: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['confirmed', 'finalized', 'failed'],
    default: 'confirmed'
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Compound indexes for efficient queries
transactionSchema.index({ walletAddress: 1, blockTime: -1 });
transactionSchema.index({ signature: 1, status: 1 });
transactionSchema.index({ type: 1, createdAt: -1 });

module.exports = mongoose.model('Transaction', transactionSchema);