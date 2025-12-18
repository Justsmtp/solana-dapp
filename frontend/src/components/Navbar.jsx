import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useAuth } from '../contexts/AuthContext';
import { FiMenu, FiX, FiLogOut } from 'react-icons/fi';
import { SiSolana } from 'react-icons/si';

const Navbar = () => {
  const { connected } = useWallet();
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-purple-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <SiSolana className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text hidden sm:block">
              Solana dApp
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {connected && isAuthenticated && (
              <>
                <Link
                  to="/dashboard"
                  className="text-gray-300 hover:text-white px-3 py-2 rounded-lg hover:bg-white/5 transition-all"
                >
                  Dashboard
                </Link>
                <Link
                  to="/transactions"
                  className="text-gray-300 hover:text-white px-3 py-2 rounded-lg hover:bg-white/5 transition-all"
                >
                  Transactions
                </Link>
                <Link
                  to="/profile"
                  className="text-gray-300 hover:text-white px-3 py-2 rounded-lg hover:bg-white/5 transition-all"
                >
                  Profile
                </Link>
              </>
            )}

            <WalletMultiButton className="!bg-gradient-to-r !from-primary-500 !to-primary-600 hover:!from-primary-600 hover:!to-primary-700 !rounded-xl !transition-all" />

            {connected && isAuthenticated && (
              <button
                onClick={handleLogout}
                className="btn-secondary flex items-center space-x-2"
              >
                <FiLogOut />
                <span>Logout</span>
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-white/5 transition-colors"
          >
            {mobileMenuOpen ? (
              <FiX className="w-6 h-6" />
            ) : (
              <FiMenu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden glass border-t border-white/10">
          <div className="px-4 py-4 space-y-3">
            {connected && isAuthenticated && (
              <>
                <Link
                  to="/dashboard"
                  className="block text-gray-300 hover:text-white px-3 py-2 rounded-lg hover:bg-white/5 transition-all"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  to="/transactions"
                  className="block text-gray-300 hover:text-white px-3 py-2 rounded-lg hover:bg-white/5 transition-all"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Transactions
                </Link>
                <Link
                  to="/profile"
                  className="block text-gray-300 hover:text-white px-3 py-2 rounded-lg hover:bg-white/5 transition-all"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Profile
                </Link>
              </>
            )}
            
            <div className="pt-3">
              <WalletMultiButton className="!w-full !bg-gradient-to-r !from-primary-500 !to-primary-600 !rounded-xl" />
            </div>

            {connected && isAuthenticated && (
              <button
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                className="w-full btn-secondary flex items-center justify-center space-x-2"
              >
                <FiLogOut />
                <span>Logout</span>
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;