import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  FiHome, 
  FiActivity, 
  FiUser, 
  FiTrendingUp 
} from 'react-icons/fi';

const Sidebar = () => {
  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: FiHome },
    { name: 'Transactions', path: '/transactions', icon: FiActivity },
    { name: 'Profile', path: '/profile', icon: FiUser },
  ];

  return (
    <aside className="fixed left-0 top-16 bottom-0 w-64 glass border-r border-white/10 hidden lg:block">
      <nav className="p-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                isActive
                  ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium">{item.name}</span>
          </NavLink>
        ))}

        {/* Stats Card */}
        <div className="mt-8 p-4 rounded-xl bg-gradient-to-br from-primary-500/10 to-purple-500/10 border border-primary-500/20">
          <div className="flex items-center space-x-2 mb-2">
            <FiTrendingUp className="w-5 h-5 text-primary-400" />
            <span className="font-semibold text-primary-400">Network</span>
          </div>
          <p className="text-sm text-gray-400">
            Connected to Solana Devnet
          </p>
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;