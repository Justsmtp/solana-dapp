/* eslint-disable react-refresh/only-export-components */
/* eslint-disable no-unused-vars */
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import toast from 'react-hot-toast';
import api from '../config/api';

const SolanaContext = createContext();

export const useSolana = () => {
  const context = useContext(SolanaContext);
  if (!context) {
    throw new Error('useSolana must be used within SolanaProvider');
  }
  return context;
};

export const SolanaProvider = ({ children }) => {
  const { publicKey, connected } = useWallet();
  const { connection } = useConnection();
  
  const [balance, setBalance] = useState(0);
  const [tokens, setTokens] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [networkStatus, setNetworkStatus] = useState(null);

  // Fetch balance when wallet connects
  useEffect(() => {
    if (connected && publicKey) {
      fetchBalance();
      fetchTokens();
      fetchTransactions();
    } else {
      setBalance(0);
      setTokens([]);
      setTransactions([]);
    }
  }, [connected, publicKey]);

  // Fetch network status on mount
  useEffect(() => {
    fetchNetworkStatus();
  }, []);

  // Fetch SOL balance
  const fetchBalance = async () => {
    if (!publicKey) return;

    try {
      const walletAddress = publicKey.toString();
      const response = await api.get(`/solana/balance/${walletAddress}`);
      
      if (response.data.success) {
        setBalance(response.data.data.sol);
      }
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  };

  // Fetch token accounts
  const fetchTokens = async () => {
    if (!publicKey) return;

    try {
      const walletAddress = publicKey.toString();
      const response = await api.get(`/solana/tokens/${walletAddress}`);
      
      if (response.data.success) {
        setTokens(response.data.data.tokens);
      }
    } catch (error) {
      console.error('Error fetching tokens:', error);
    }
  };

  // Fetch transaction history
  const fetchTransactions = async (limit = 20) => {
    if (!publicKey) return;

    setLoading(true);
    try {
      const walletAddress = publicKey.toString();
      const response = await api.get(`/solana/transactions/${walletAddress}?limit=${limit}`);
      
      if (response.data.success) {
        setTransactions(response.data.data.transactions);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast.error('Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  };

  // Sync transactions to database
  const syncTransactions = async () => {
    if (!publicKey) return;

    setLoading(true);
    try {
      const response = await api.post('/solana/sync?limit=50');
      
      if (response.data.success) {
        toast.success(`Synced ${response.data.data.saved} new transactions`);
        await fetchTransactions();
      }
    } catch (error) {
      console.error('Error syncing transactions:', error);
      toast.error('Failed to sync transactions');
    } finally {
      setLoading(false);
    }
  };

  // Fetch network status
  const fetchNetworkStatus = async () => {
    try {
      const response = await api.get('/solana/network');
      
      if (response.data.success) {
        setNetworkStatus(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching network status:', error);
    }
  };

  // Validate wallet address
  const validateWallet = async (address) => {
    try {
      const response = await api.get(`/solana/validate/${address}`);
      return response.data;
    } catch (error) {
      console.error('Error validating wallet:', error);
      return { success: false, data: { valid: false } };
    }
  };

  // Verify transaction
  const verifyTransaction = async (signature) => {
    try {
      const response = await api.get(`/solana/verify/${signature}`);
      return response.data;
    } catch (error) {
      console.error('Error verifying transaction:', error);
      return null;
    }
  };

  // Refresh all data
  const refreshData = async () => {
    await Promise.all([
      fetchBalance(),
      fetchTokens(),
      fetchTransactions(),
      fetchNetworkStatus(),
    ]);
  };

  const value = {
    balance,
    tokens,
    transactions,
    loading,
    networkStatus,
    fetchBalance,
    fetchTokens,
    fetchTransactions,
    syncTransactions,
    validateWallet,
    verifyTransaction,
    refreshData,
  };

  return <SolanaContext.Provider value={value}>{children}</SolanaContext.Provider>;
};