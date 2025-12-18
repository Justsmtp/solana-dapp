import React, { useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';
import { Toaster } from 'react-hot-toast';

// Import contexts
import { AuthProvider } from './contexts/AuthContext';
import { SolanaProvider } from './contexts/SolanaContext';

// Import pages
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Transactions from './pages/Transactions';

// Import wallet adapter CSS
import '@solana/wallet-adapter-react-ui/styles.css';

function App() {
  // Set up Solana network
  const network = WalletAdapterNetwork.Devnet;
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  // Set up wallets
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
    ],
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <AuthProvider>
            <SolanaProvider>
              <Router>
                <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900">
                  {/* Animated background */}
                  <div className="fixed inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute w-96 h-96 bg-primary-500/10 rounded-full blur-3xl -top-48 -left-48 animate-pulse-slow"></div>
                    <div className="absolute w-96 h-96 bg-purple-500/10 rounded-full blur-3xl top-1/2 right-0 animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
                    <div className="absolute w-96 h-96 bg-pink-500/10 rounded-full blur-3xl -bottom-48 left-1/3 animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
                  </div>

                  <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route element={<Layout />}>
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/profile" element={<Profile />} />
                      <Route path="/transactions" element={<Transactions />} />
                    </Route>
                  </Routes>

                  {/* Toast notifications */}
                  <Toaster
                    position="top-right"
                    toastOptions={{
                      duration: 4000,
                      style: {
                        background: '#1e293b',
                        color: '#fff',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '12px',
                      },
                      success: {
                        iconTheme: {
                          primary: '#0ea5e9',
                          secondary: '#fff',
                        },
                      },
                      error: {
                        iconTheme: {
                          primary: '#ef4444',
                          secondary: '#fff',
                        },
                      },
                    }}
                  />
                </div>
              </Router>
            </SolanaProvider>
          </AuthProvider>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

export default App;