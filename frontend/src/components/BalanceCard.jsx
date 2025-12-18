import React from 'react';
import { SiSolana } from 'react-icons/si';
import { FiRefreshCw } from 'react-icons/fi';
import { useSolana } from '../contexts/SolanaContext';

const BalanceCard = () => {
  const { balance, fetchBalance } = useSolana();
  const [refreshing, setRefreshing] = React.useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchBalance();
    setTimeout(() => setRefreshing(false), 1000);
  };

  return (
    <div className="card bg-gradient-to-br from-primary-500/20 to-purple-600/20 border-primary-500/30">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-primary-500/20 rounded-xl flex items-center justify-center">
            <SiSolana className="w-6 h-6 text-primary-400" />
          </div>
          <div>
            <p className="text-sm text-gray-400">Total Balance</p>
            <p className="text-xs text-gray-500">Solana Devnet</p>
          </div>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="p-2 rounded-lg hover:bg-white/5 transition-colors"
        >
          <FiRefreshCw className={`w-5 h-5 text-primary-400 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="space-y-2">
        <p className="text-4xl font-bold gradient-text">
          {balance.toFixed(4)} SOL
        </p>
        <p className="text-sm text-gray-400">
          ≈ ${(balance * 100).toFixed(2)} USD
        </p>
      </div>

      <div className="mt-6 pt-4 border-t border-white/10">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-400">Network Status</span>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-green-400">Active</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BalanceCard;