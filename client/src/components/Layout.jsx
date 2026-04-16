import React from 'react';
import Sidebar from './Sidebar';
import SvgBackground from './SvgBackground';

export default function Layout({ children }) {
  return (
    <div style={{ position: 'relative', minHeight: '100vh', background: 'var(--bg)' }}>
      <SvgBackground variant="mesh" />
      <Sidebar onClose={() => setMobileOpen(false)} isMobile />
      <main
        className="main-content fade-up"
        style={{ position: 'relative', zIndex: 1 }}
      >
        {children}
      </main>
    </div>
  );
}
