import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useAuth } from '../contexts/AuthContext';
import { 
  FiUser, 
  FiMail, 
  FiEdit2, 
  FiSave,
  FiCopy,
  FiCheck,
  FiCamera
} from 'react-icons/fi';
import { SiSolana } from 'react-icons/si';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../config/api';

const Profile = () => {
  const { publicKey } = useWallet();
  const { user, updateProfile } = useAuth();
  
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    bio: '',
    avatar: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
        bio: user.bio || '',
        avatar: user.avatar || '',
      });
    }
    fetchUserStats();
  }, [user]);

  const fetchUserStats = async () => {
    try {
      const response = await api.get('/users/stats');
      if (response.data.success) {
        setStats(response.data.data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async () => {
    setSaving(true);
    const success = await updateProfile(formData);
    if (success) {
      setEditing(false);
    }
    setSaving(false);
  };

  const handleCopyAddress = () => {
    if (publicKey) {
      navigator.clipboard.writeText(publicKey.toString());
      setCopied(true);
      toast.success('Address copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const truncateAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 8)}...${address.slice(-8)}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner text="Loading profile..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">
            <span className="gradient-text">Profile</span>
          </h1>
          <p className="text-gray-400">Manage your account settings and preferences</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Info */}
          <div className="card">
            <div className="flex items-start justify-between mb-6">
              <h2 className="text-xl font-semibold">Personal Information</h2>
              {!editing ? (
                <button
                  onClick={() => setEditing(true)}
                  className="btn-secondary flex items-center space-x-2"
                >
                  <FiEdit2 className="w-4 h-4" />
                  <span>Edit</span>
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setEditing(false);
                      setFormData({
                        username: user?.username || '',
                        email: user?.email || '',
                        bio: user?.bio || '',
                        avatar: user?.avatar || '',
                      });
                    }}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="btn-primary flex items-center space-x-2"
                  >
                    {saving ? (
                      <>
                        <div className="spinner w-4 h-4 border-2"></div>
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <FiSave className="w-4 h-4" />
                        <span>Save</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Avatar */}
            <div className="flex items-center space-x-6 mb-6">
              <div className="relative group">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center text-3xl font-bold text-white">
                  {formData.avatar ? (
                    <img
                      src={formData.avatar}
                      alt="Avatar"
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span>{formData.username?.charAt(0)?.toUpperCase() || 'A'}</span>
                  )}
                </div>
                {editing && (
                  <button className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <FiCamera className="w-6 h-6 text-white" />
                  </button>
                )}
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-1">
                  {formData.username || 'Anonymous'}
                </h3>
                <p className="text-sm text-gray-400">
                  Member since {new Date(user?.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  <div className="flex items-center space-x-2">
                    <FiUser className="w-4 h-4" />
                    <span>Username</span>
                  </div>
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  disabled={!editing}
                  placeholder="Enter your username"
                  className="input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  <div className="flex items-center space-x-2">
                    <FiMail className="w-4 h-4" />
                    <span>Email</span>
                  </div>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={!editing}
                  placeholder="Enter your email"
                  className="input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Bio
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  disabled={!editing}
                  placeholder="Tell us about yourself"
                  rows="4"
                  maxLength="500"
                  className="input resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.bio.length}/500 characters
                </p>
              </div>
            </div>
          </div>

          {/* Wallet Info */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-6">Wallet Information</h2>
            
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-gradient-to-r from-primary-500/10 to-purple-500/10 border border-primary-500/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Wallet Address</span>
                  <button
                    onClick={handleCopyAddress}
                    className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                  >
                    {copied ? (
                      <FiCheck className="w-4 h-4 text-green-400" />
                    ) : (
                      <FiCopy className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                </div>
                <p className="font-mono text-lg">
                  {truncateAddress(publicKey?.toString())}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-white/5">
                  <p className="text-sm text-gray-400 mb-1">Network</p>
                  <div className="flex items-center space-x-2">
                    <SiSolana className="w-5 h-5 text-primary-400" />
                    <p className="font-semibold">Solana Devnet</p>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-white/5">
                  <p className="text-sm text-gray-400 mb-1">Status</p>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <p className="font-semibold text-green-400">Connected</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Sidebar */}
        <div className="space-y-6">
          {/* Account Stats */}
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Account Stats</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                <span className="text-sm text-gray-400">Total Transactions</span>
                <span className="font-semibold text-primary-400">
                  {stats?.totalTransactions || 0}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                <span className="text-sm text-gray-400">Total Volume</span>
                <span className="font-semibold text-green-400">
                  {(stats?.totalVolume || 0).toFixed(4)} SOL
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                <span className="text-sm text-gray-400">Total Fees</span>
                <span className="font-semibold text-purple-400">
                  {(stats?.totalFees || 0).toFixed(6)} SOL
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                <span className="text-sm text-gray-400">Avg Transaction</span>
                <span className="font-semibold text-pink-400">
                  {(stats?.avgAmount || 0).toFixed(4)} SOL
                </span>
              </div>
            </div>
          </div>

          {/* Activity */}
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
            <div className="space-y-3">
              {stats?.recentActivity?.slice(0, 5).map((activity, index) => (
                <div
                  key={index}
                  className="p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <p className="text-sm text-gray-300 mb-1">{activity.type}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(activity.timestamp).toLocaleString()}
                  </p>
                </div>
              )) || (
                <p className="text-sm text-gray-400 text-center py-4">
                  No recent activity
                </p>
              )}
            </div>
          </div>

          {/* Preferences */}
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Preferences</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Theme</span>
                <select className="input py-2 px-3">
                  <option value="dark">Dark</option>
                  <option value="light">Light</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Notifications</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;