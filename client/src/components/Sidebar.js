// src/components/Sidebar.js
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const navItems = [
  { icon: '📊', label: 'Dashboard', path: '/dashboard' },
  { icon: '💸', label: 'Transactions', path: '/transactions' },
  { icon: '🎯', label: 'Budgets', path: '/budgets' },
  { icon: '📈', label: 'Reports', path: '/reports' },
];

const Sidebar = ({ mobileOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    toast.info('Logged out successfully');
    navigate('/login');
  };

  const handleNav = (path) => {
    navigate(path);
    if (onClose) onClose();
  };

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 99,
            display: 'none',
          }}
        />
      )}

      <aside className={`sidebar ${mobileOpen ? 'open' : ''}`}>
        {/* Logo */}
        <div className="logo">
          <div className="logo-icon">💰</div>
          <div className="logo-text">
            SpendWise
            <span>Smart Tracker</span>
          </div>
        </div>

        {/* Navigation */}
        <div className="nav-section">Main Menu</div>
        {navItems.map((item) => (
          <button
            key={item.path}
            className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
            onClick={() => handleNav(item.path)}
          >
            <span className="icon">{item.icon}</span>
            {item.label}
          </button>
        ))}

        {/* User section at bottom */}
        <div style={{ marginTop: 'auto' }}>
          <div className="nav-section">Account</div>

          {/* User info */}
          <div
            style={{
              padding: '10px 12px',
              background: 'var(--bg-card)',
              borderRadius: 'var(--radius-sm)',
              marginBottom: 8,
              border: '1px solid var(--border)',
            }}
          >
            <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)' }}>
              {user?.name}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
              {user?.email}
            </div>
            <div
              style={{
                display: 'inline-block',
                marginTop: 6,
                background: 'rgba(16,216,132,0.1)',
                color: 'var(--accent-green)',
                fontSize: 10,
                padding: '2px 8px',
                borderRadius: 10,
                border: '1px solid rgba(16,216,132,0.2)',
                fontWeight: 600,
              }}
            >
              {user?.currency}
            </div>
          </div>

          <button className="nav-link" onClick={handleLogout}>
            <span className="icon">🚪</span>
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
