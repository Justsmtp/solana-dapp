// src/config/solana.js
const { Connection, clusterApiUrl } = require('@solana/web3.js');

const getConnection = () => {
  const network = process.env.SOLANA_NETWORK || 'devnet';
  const rpcUrl = process.env.SOLANA_RPC_URL || clusterApiUrl(network);
  
  return new Connection(rpcUrl, 'confirmed');
};

const NETWORKS = {
  devnet: 'devnet',
  testnet: 'testnet',
  'mainnet-beta': 'mainnet-beta'
};

const getCurrentNetwork = () => {
  return process.env.SOLANA_NETWORK || 'devnet';
};

module.exports = {
  getConnection,
  NETWORKS,
  getCurrentNetwork
};