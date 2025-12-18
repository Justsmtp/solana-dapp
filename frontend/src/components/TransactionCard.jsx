import React from 'react';
import {
  FiExternalLink,
  FiCheck,
  FiX,
  FiClock,
} from 'react-icons/fi';

const TransactionCard = ({ transaction }) => {
  const formatDate = (timestamp) =>
    new Date(timestamp * 1000).toLocaleString();

  const truncateSignature = (signature) =>
    `${signature.slice(0, 8)}...${signature.slice(-8)}`;

  const getStatusIcon = (status) => {
    if (status === 'confirmed' || status === 'finalized') {
      return <FiCheck className="w-5 h-5 text-green-400" />;
    }
    if (status === 'failed') {
      return <FiX className="w-5 h-5 text-red-400" />;
    }
    return <FiClock className="w-5 h-5 text-yellow-400" />;
  };

  const getStatusStyles = (status) => {
    if (status === 'confirmed' || status === 'finalized') {
      return 'text-green-400 bg-green-500/10 border-green-500/30';
    }
    if (status === 'failed') {
      return 'text-red-400 bg-red-500/10 border-red-500/30';
    }
    return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
  };

  const explorerUrl = `https://explorer.solana.com/tx/${transaction.signature}?cluster=devnet`;

  return (
    <div className="card hover:scale-[1.02] transition-all cursor-pointer">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {getStatusIcon(transaction.status)}
          <div>
            <p className="font-mono text-sm text-gray-300">
              {truncateSignature(transaction.signature)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {formatDate(transaction.blockTime)}
            </p>
          </div>
        </div>

        <a
          href={explorerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 rounded-lg hover:bg-white/5 transition-colors"
        >
          <FiExternalLink className="w-4 h-4 text-gray-400 hover:text-primary-400" />
        </a>
      </div>

      {/* Status + Fee */}
      <div className="flex items-center justify-between">
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusStyles(
            transaction.status
          )}`}
        >
          {transaction.status}
        </span>

        {transaction.fee && (
          <p className="text-sm text-gray-400">
            Fee: {(transaction.fee / 1e9).toFixed(6)} SOL
          </p>
        )}
      </div>

      {/* Slot */}
      <div className="mt-4 pt-4 border-t border-white/10">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Slot</span>
          <span className="text-gray-300">
            {transaction.slot?.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default TransactionCard;
