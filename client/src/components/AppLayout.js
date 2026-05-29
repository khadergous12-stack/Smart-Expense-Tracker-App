// src/components/AppLayout.js
// Wrapper that provides sidebar + main content layout
import React, { useState } from 'react';
import Sidebar from './Sidebar';

const AppLayout = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="app-shell">
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <main className="main-content">
        {/* Mobile menu toggle */}
        <button
          onClick={() => setMobileOpen(true)}
          style={{
            display: 'none', // shown only via CSS on mobile
            marginBottom: 16,
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            color: 'var(--text-primary)',
            padding: '8px 14px',
            borderRadius: 8,
            cursor: 'pointer',
            fontSize: 18,
          }}
          className="mobile-menu-btn"
        >
          ☰
        </button>
        {children}
      </main>
    </div>
  );
};

export default AppLayout;
