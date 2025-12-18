// src/services/solana.service.js
const { PublicKey, LAMPORTS_PER_SOL } = require('@solana/web3.js');
const { getConnection } = require('../config/solana');

class SolanaService {
  constructor() {
    this.connection = getConnection();
  }

  // Get SOL balance for a wallet
  async getBalance(walletAddress) {
    try {
      const publicKey = new PublicKey(walletAddress);
      const balance = await this.connection.getBalance(publicKey);
      
      return {
        lamports: balance,
        sol: balance / LAMPORTS_PER_SOL
      };
    } catch (error) {
      throw new Error(`Failed to fetch balance: ${error.message}`);
    }
  }

  // Get token accounts for a wallet
  async getTokenAccounts(walletAddress) {
    try {
      const publicKey = new PublicKey(walletAddress);
      const tokenAccounts = await this.connection.getParsedTokenAccountsByOwner(
        publicKey,
        { programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA') }
      );

      return tokenAccounts.value.map(account => ({
        mint: account.account.data.parsed.info.mint,
        amount: account.account.data.parsed.info.tokenAmount.uiAmount,
        decimals: account.account.data.parsed.info.tokenAmount.decimals,
        owner: account.account.data.parsed.info.owner
      }));
    } catch (error) {
      throw new Error(`Failed to fetch token accounts: ${error.message}`);
    }
  }

  // Get recent transactions for a wallet
  async getTransactionHistory(walletAddress, limit = 20) {
    try {
      const publicKey = new PublicKey(walletAddress);
      const signatures = await this.connection.getSignaturesForAddress(
        publicKey,
        { limit }
      );

      const transactions = await Promise.all(
        signatures.map(async (sig) => {
          try {
            const tx = await this.connection.getParsedTransaction(
              sig.signature,
              { maxSupportedTransactionVersion: 0 }
            );

            return {
              signature: sig.signature,
              blockTime: sig.blockTime,
              slot: sig.slot,
              err: sig.err,
              fee: tx?.meta?.fee || 0,
              status: sig.err ? 'failed' : 'confirmed',
              instructions: tx?.transaction?.message?.instructions || []
            };
          } catch (error) {
            console.error(`Error fetching transaction ${sig.signature}:`, error);
            return null;
          }
        })
      );

      return transactions.filter(tx => tx !== null);
    } catch (error) {
      throw new Error(`Failed to fetch transaction history: ${error.message}`);
    }
  }

  // Verify transaction signature
  async verifyTransaction(signature) {
    try {
      const status = await this.connection.getSignatureStatus(signature);
      
      return {
        exists: status.value !== null,
        confirmed: status.value?.confirmationStatus === 'confirmed' || 
                   status.value?.confirmationStatus === 'finalized',
        finalized: status.value?.confirmationStatus === 'finalized',
        err: status.value?.err
      };
    } catch (error) {
      throw new Error(`Failed to verify transaction: ${error.message}`);
    }
  }

  // Get transaction details
  async getTransactionDetails(signature) {
    try {
      const transaction = await this.connection.getParsedTransaction(
        signature,
        { maxSupportedTransactionVersion: 0 }
      );

      if (!transaction) {
        throw new Error('Transaction not found');
      }

      return {
        signature,
        blockTime: transaction.blockTime,
        slot: transaction.slot,
        fee: transaction.meta.fee,
        success: transaction.meta.err === null,
        err: transaction.meta.err,
        instructions: transaction.transaction.message.instructions,
        preBalances: transaction.meta.preBalances,
        postBalances: transaction.meta.postBalances
      };
    } catch (error) {
      throw new Error(`Failed to fetch transaction details: ${error.message}`);
    }
  }

  // Check if wallet exists on Solana
  async validateWallet(walletAddress) {
    try {
      const publicKey = new PublicKey(walletAddress);
      const accountInfo = await this.connection.getAccountInfo(publicKey);
      
      return {
        valid: true,
        exists: accountInfo !== null,
        balance: accountInfo ? accountInfo.lamports / LAMPORTS_PER_SOL : 0
      };
    } catch (error) {
      return {
        valid: false,
        exists: false,
        error: error.message
      };
    }
  }

  // Get network status
  async getNetworkStatus() {
    try {
      const version = await this.connection.getVersion();
      const slot = await this.connection.getSlot();
      const blockTime = await this.connection.getBlockTime(slot);
      const epoch = await this.connection.getEpochInfo();

      return {
        version: version['solana-core'],
        currentSlot: slot,
        blockTime,
        epoch: epoch.epoch,
        slotIndex: epoch.slotIndex,
        slotsInEpoch: epoch.slotsInEpoch
      };
    } catch (error) {
      throw new Error(`Failed to fetch network status: ${error.message}`);
    }
  }
}

module.exports = new SolanaService();