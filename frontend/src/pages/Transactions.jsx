/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect } from 'react';
import { useSolana } from '../contexts/SolanaContext';
import { 
  FiRefreshCw, 
  FiDownload, 
  FiFilter,
  FiSearch,
  FiActivity
} from 'react-icons/fi';
import TransactionCard from '../components/TransactionCard';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import api from '../config/api';

const Transactions = () => {
  const { transactions, loading, fetchTransactions, syncTransactions } = useSolana();
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredTransactions, setFilteredTransactions] = useState([]);

  useEffect(() => {
    let filtered = [...transactions];

    // Apply type filter
    if (filter !== 'all') {
      filtered = filtered.filter(tx => tx.status === filter);
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(tx =>
        tx.signature.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredTransactions(filtered);
  }, [transactions, filter, searchTerm]);

  const handleRefresh = async () => {
    await fetchTransactions(50);
    toast.success('Transactions refreshed!');
  };

  const handleSync = async () => {
    await syncTransactions();
  };

  const handleExport = async () => {
    try {
      const response = await api.get('/transactions/export', {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `transactions-${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success('Transactions exported successfully!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export transactions');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">
            <span className="gradient-text">Transactions</span>
          </h1>
          <p className="text-gray-400">
            View and manage your transaction history
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
            className="btn-secondary flex items-center space-x-2"
            disabled={loading}
          >
            <FiRefreshCw className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
          <button
            onClick={handleExport}
            className="btn-primary flex items-center space-x-2"
          >
            <FiDownload />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by signature..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-12"
            />
          </div>

          {/* Filter Buttons */}
          <div className="flex items-center space-x-2">
            <FiFilter className="text-gray-400" />
            {['all', 'confirmed', 'finalized', 'failed'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filter === status
                    ? 'bg-primary-500 text-white'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-3 gap-6">
        <div className="card">
          <p className="text-sm text-gray-400 mb-1">Total</p>
          <p className="text-2xl font-bold">{transactions.length}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-400 mb-1">Confirmed</p>
          <p className="text-2xl font-bold text-green-400">
            {transactions.filter(tx => tx.status === 'confirmed' || tx.status === 'finalized').length}
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-400 mb-1">Failed</p>
          <p className="text-2xl font-bold text-red-400">
            {transactions.filter(tx => tx.status === 'failed').length}
          </p>
        </div>
      </div>

      {/* Transactions List */}
      <div className="card">
        {loading ? (
          <div className="py-12">
            <LoadingSpinner text="Loading transactions..." />
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="text-center py-12">
            <FiActivity className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 mb-2">No transactions found</p>
            {searchTerm && (
              <p className="text-sm text-gray-500">
                Try adjusting your search or filters
              </p>
            )}
            <button
              onClick={handleSync}
              className="mt-4 btn-primary"
            >
              Sync Transactions
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTransactions.map((tx) => (
              <TransactionCard key={tx.signature} transaction={tx} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Transactions;