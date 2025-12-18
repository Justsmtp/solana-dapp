import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useAuth } from '../contexts/AuthContext';
import {
  FiZap,
  FiShield,
  FiTrendingUp,
  FiUsers,
  FiCheckCircle,
  FiArrowRight,
} from 'react-icons/fi';
import { SiSolana } from 'react-icons/si';
import toast from 'react-hot-toast';

const colorMap = {
  primary: {
    bg: 'from-primary-500/20 to-primary-600/20',
    text: 'text-primary-400',
  },
  purple: {
    bg: 'from-purple-500/20 to-purple-600/20',
    text: 'text-purple-400',
  },
  green: {
    bg: 'from-green-500/20 to-green-600/20',
    text: 'text-green-400',
  },
  pink: {
    bg: 'from-pink-500/20 to-pink-600/20',
    text: 'text-pink-400',
  },
};

const LandingPage = () => {
  const navigate = useNavigate();
  const { connected } = useWallet();
  const { login, loading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleGetStarted = async () => {
    if (!connected) {
      toast.error('Please connect your wallet first');
      return;
    }

    const success = await login();
    if (success) {
      navigate('/dashboard');
    }
  };

  const features = [
    {
      icon: FiZap,
      title: 'Lightning Fast',
      description: 'Built on Solana for instant transactions and low fees',
      color: 'primary',
    },
    {
      icon: FiShield,
      title: 'Secure & Safe',
      description: 'Your keys, your crypto. Non-custodial and decentralized',
      color: 'purple',
    },
    {
      icon: FiTrendingUp,
      title: 'Real-time Analytics',
      description: 'Track your portfolio and transactions in real-time',
      color: 'green',
    },
    {
      icon: FiUsers,
      title: 'Community Driven',
      description: 'Join thousands of users in the Web3 revolution',
      color: 'pink',
    },
  ];

  const stats = [
    { value: '10K+', label: 'Active Users' },
    { value: '$100M+', label: 'Total Volume' },
    { value: '1M+', label: 'Transactions' },
    { value: '99.9%', label: 'Uptime' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="absolute inset-0 bg-primary-500/20 blur-3xl animate-pulse-slow"></div>
              <div className="relative w-24 h-24 bg-gradient-to-br from-primary-400 to-purple-500 rounded-3xl flex items-center justify-center shadow-2xl">
                <SiSolana className="w-12 h-12 text-white" />
              </div>
            </div>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="gradient-text">Welcome to the Future</span>
            <br />
            <span className="text-white">of Web3</span>
          </h1>

          <p className="text-xl text-gray-400 mb-12 max-w-3xl mx-auto">
            Connect your Solana wallet and experience the next generation of
            decentralized applications.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            {!connected ? (
              <WalletMultiButton className="!rounded-xl !px-8 !py-4 !text-lg" />
            ) : (
              <button
                onClick={handleGetStarted}
                disabled={loading}
                className="btn-primary px-8 py-4 flex items-center gap-2"
              >
                {loading ? 'Authenticating...' : 'Get Started'}
                <FiArrowRight />
              </button>
            )}

            <a
              href="#features"
              className="btn-secondary text-lg px-8 py-4"
            >
              Learn More
            </a>
          </div>

          <div className="flex justify-center gap-6 text-gray-400 text-sm">
            <span className="flex items-center gap-1">
              <FiCheckCircle className="text-green-400" /> Audited
            </span>
            <span className="flex items-center gap-1">
              <FiCheckCircle className="text-green-400" /> Non-Custodial
            </span>
            <span className="flex items-center gap-1">
              <FiCheckCircle className="text-green-400" /> Open Source
            </span>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <div key={i} className="card text-center">
              <p className="text-4xl font-bold gradient-text">{stat.value}</p>
              <p className="text-gray-400">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, i) => (
            <div key={i} className="card-hover">
              <div
                className={`w-14 h-14 bg-gradient-to-br ${colorMap[feature.color].bg} rounded-xl flex items-center justify-center mb-4`}
              >
                <feature.icon
                  className={`w-7 h-7 ${colorMap[feature.color].text}`}
                />
              </div>
              <h3 className="text-xl font-semibold">{feature.title}</h3>
              <p className="text-gray-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 border-t border-white/10 text-center">
        <p className="text-gray-400 text-sm">
          © 2024 Solana dApp. Built for Web3.
        </p>
      </footer>
    </div>
  );
};

export default LandingPage;
