/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/immutability */
import React, { useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useAuth } from '../contexts/AuthContext';
import { useSolana } from '../contexts/SolanaContext';
import { 
  FiRefreshCw, 
  FiTrendingUp, 
  FiActivity,
  FiDollarSign,
  FiClock
} from 'react-icons/fi';
import { Link } from 'react-router-dom';  // ADD THIS IMPORT
import StatCard from '../components/StatCard';
import BalanceCard from '../components/BalanceCard';
import TransactionCard from '../components/TransactionCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';
import api from '../config/api';

const Dashboard = () => {
  const { publicKey } = useWallet();
  const { user } = useAuth();
  const { 
    balance, 
    transactions, 
    tokens, 
    loading, 
    refreshData,
    syncTransactions 
  } = useSolana();

  const [stats, setStats] = useState(null);
  const [dailyVolume, setDailyVolume] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchStats();
    fetchDailyVolume();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/users/stats');
      if (response.data.success) {
        setStats(response.data.data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchDailyVolume = async () => {
    try {
      const response = await api.get('/transactions/daily-volume?days=7');
      if (response.data.success) {
        const formattedData = response.data.data.dailyVolume.map(item => ({
          date: item._id,
          volume: item.volume,
          count: item.count
        }));
        setDailyVolume(formattedData);
      }
    } catch (error) {
      console.error('Error fetching daily volume:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      refreshData(),
      fetchStats(),
      fetchDailyVolume()
    ]);
    toast.success('Data refreshed!');
    setRefreshing(false);
  };

  const handleSync = async () => {
    await syncTransactions();
    await fetchStats();
  };

  return (
    <div className="space-y-6 relative">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, <span className="gradient-text">{user?.username || 'Anon'}</span>
          </h1>
          <p className="text-gray-400">
            Here's what's happening with your wallet today
          </p>
        </div>
        <div className="flex items-center space-x-3 mt-4 md:mt-0">
          <button
            onClick={handleSync}
            className="btn-secondary flex items-center space-x-2"
            disabled={loading}
          >
            <FiActivity className={loading ? 'animate-spin' : ''} />
            <span>Sync</span>
          </button>
          <button
            onClick={handleRefresh}
            className="btn-primary flex items-center space-x-2"
            disabled={refreshing}
          >
            <FiRefreshCw className={refreshing ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Balance Card */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <BalanceCard />
        </div>
        <StatCard
          title="Token Count"
          value={tokens.length}
          icon={FiDollarSign}
          color="purple"
        />
      </div>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Transactions"
          value={stats?.totalTransactions || 0}
          icon={FiActivity}
          color="primary"
        />
        <StatCard
          title="Total Volume"
          value={`${(stats?.totalVolume || 0).toFixed(4)} SOL`}
          icon={FiTrendingUp}
          color="green"
        />
        <StatCard
          title="Total Fees"
          value={`${(stats?.totalFees || 0).toFixed(6)} SOL`}
          icon={FiDollarSign}
          color="pink"
        />
        <StatCard
          title="Avg Amount"
          value={`${(stats?.avgAmount || 0).toFixed(4)} SOL`}
          icon={FiClock}
          color="purple"
        />
      </div>

      {/* Chart */}
      {dailyVolume.length > 0 && (
        <div className="card">
          <h3 className="text-xl font-semibold mb-6">7-Day Activity</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailyVolume}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis 
                dataKey="date" 
                stroke="rgba(255,255,255,0.5)"
                fontSize={12}
              />
              <YAxis 
                stroke="rgba(255,255,255,0.5)"
                fontSize={12}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: '#fff'
                }}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#0ea5e9"
                strokeWidth={2}
                dot={{ fill: '#0ea5e9' }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Recent Transactions */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold">Recent Transactions</h3>
          <Link
            to="/transactions"
            className="text-primary-400 hover:text-primary-300 text-sm font-medium"
          >
            View All →
          </Link>
        </div>

        {loading ? (
          <div className="py-12">
            <LoadingSpinner text="Loading transactions..." />
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-12">
            <FiActivity className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No transactions found</p>
            <button
              onClick={handleSync}
              className="mt-4 btn-primary"
            >
              Sync Transactions
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {transactions.slice(0, 5).map((tx) => (
              <TransactionCard key={tx.signature} transaction={tx} />
            ))}
          </div>
        )}
      </div>

      {/* Tokens */}
      {tokens.length > 0 && (
        <div className="card">
          <h3 className="text-xl font-semibold mb-6">Your Tokens</h3>
          <div className="space-y-3">
            {tokens.map((token, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
              >
                <div>
                  <p className="font-medium text-gray-300">Token</p>
                  <p className="text-sm text-gray-500 font-mono">
                    {token.mint.slice(0, 8)}...{token.mint.slice(-8)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-primary-400">
                    {token.amount} tokens
                  </p>
                  <p className="text-sm text-gray-500">
                    {token.decimals} decimals
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard; 