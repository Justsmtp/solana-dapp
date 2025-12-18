/* eslint-disable no-unused-vars */
/* eslint-disable react-refresh/only-export-components */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import bs58 from 'bs58';
import toast from 'react-hot-toast';
import api from '../config/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const { publicKey, signMessage, connected } = useWallet();
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is authenticated on mount
  useEffect(() => {
    if (token) {
      verifyToken();
    }
  }, [token]);

  // Verify token with backend
  const verifyToken = async () => {
    try {
      const response = await api.get('/auth/verify');
      if (response.data.success) {
        setUser(response.data.data.user);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Token verification failed:', error);
      logout();
    }
  };

  // Login function
  const login = async () => {
    if (!connected || !publicKey || !signMessage) {
      toast.error('Please connect your wallet first');
      return;
    }

    setLoading(true);
    try {
      const walletAddress = publicKey.toString();

      // Step 1: Get nonce from backend
      const nonceResponse = await api.get(`/auth/nonce/${walletAddress}`);
      const { nonce, message } = nonceResponse.data.data;

      // Step 2: Sign message with wallet
      const encodedMessage = new TextEncoder().encode(message);
      const signedMessage = await signMessage(encodedMessage);
      const signature = bs58.encode(signedMessage);

      // Step 3: Send signature to backend for verification
      const loginResponse = await api.post('/auth/login', {
        walletAddress,
        signature,
        message,
      });

      if (loginResponse.data.success) {
        const { token, user } = loginResponse.data.data;
        localStorage.setItem('token', token);
        setToken(token);
        setUser(user);
        setIsAuthenticated(true);
        toast.success('Successfully logged in!');
        return true;
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.response?.data?.message || 'Login failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    toast.success('Logged out successfully');
  };

  // Update profile
  const updateProfile = async (profileData) => {
    try {
      const response = await api.put('/users/profile', profileData);
      if (response.data.success) {
        setUser(response.data.data.user);
        toast.success('Profile updated successfully');
        return true;
      }
    } catch (error) {
      console.error('Update profile error:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
      return false;
    }
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated,
    login,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};