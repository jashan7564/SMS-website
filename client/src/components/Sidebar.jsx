import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ConfirmModal } from './Modal';
import { Icon } from './Icons';

function NavItem({ to, iconName, label, end, badge, onClick }) {
  return (
    <NavLink to={to} end={end} style={{ textDecoration: 'none' }} onClick={onClick}>
      {({ isActive }) => (
        <div className={`nav-item ${isActive ? 'active' : ''}`}>
          <span className="nav-icon"><Icon name={iconName} size={16} strokeWidth={isActive ? 2 : 1.7} /></span>
          <span style={{ flex: 1 }}>{label}</span>
          {badge && (
            <span style={{
              fontSize: '10px', fontFamily: 'DM Mono, monospace',
              background: 'var(--accent-light)', color: 'var(--accent)',
              padding: '1px 7px', borderRadius: '20px',
            }}>{badge}</span>
          )}
        </div>
      )}
    </NavLink>
  );
}

// SMS Pro logo mark SVG
function LogoMark() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="9" fill="#6366f1" />
      <path d="M8 10h16a1 1 0 011 1v8a1 1 0 01-1 1H9l-3 3V11a1 1 0 011-1z" fill="white" fillOpacity="0.9" />
      <path d="M11 14h10M11 17h6" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export default function Sidebar({ onClose, isMobile }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [logoutOpen, setLogoutOpen] = useState(false);
  const initials = user?.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'U';

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <>
      <aside className="sidebar">
        {/* Brand */}
        <div style={{ padding: '22px 18px 18px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <LogoMark />
            <div>
              <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '18px', letterSpacing: '-0.4px', color: 'var(--text)', lineHeight: 1.1 }}>
                SMS<span style={{ color: 'var(--accent)' }}>Pro</span>
              </div>
              <div style={{ fontSize: '10px', color: 'var(--muted2)', fontFamily: 'DM Mono, monospace', letterSpacing: '0.04em' }}>
                Enterprise Platform
              </div>
            </div>
          </div>
          {/* Status pill */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', padding: '4px 10px', borderRadius: '20px', background: 'var(--success-light)', border: '1px solid #bbf7d0' }}>
            <span className="pulse-dot" style={{ '--success': '#16a34a' }} />
            <span style={{ fontSize: '11px', color: 'var(--success)', fontFamily: 'DM Mono, monospace', fontWeight: 500 }}>All systems operational</span>
          </div>
        </div>

        {/* User card */}
        <div style={{ padding: '14px 12px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 10px', borderRadius: '10px', background: 'var(--bg2)', border: '1px solid var(--border)', transition: 'all 0.18s', cursor: 'default' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-strong)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
          >
            <div style={{
              width: '36px', height: '36px', borderRadius: '9px', flexShrink: 0,
              background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '13px', color: 'white',
              boxShadow: 'var(--shadow-accent)',
            }}>
              {initials}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.name}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'DM Mono, monospace', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.email}
              </div>
            </div>
          </div>
          <div style={{ marginTop: '10px', padding: '0 4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', color: 'var(--muted2)', fontFamily: 'Syne, sans-serif', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Credits
            </span>
            <div className="credit-chip">
              <Icon name="credit" size={13} color="var(--accent3)" strokeWidth={2} />
              {user?.credits ?? 0}
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, paddingTop: '10px', overflowY: 'auto' }}>
          <div className="section-label" style={{ marginBottom: '6px' }}>Messaging</div>
          <NavItem to="/dashboard" iconName="dashboard" label="Dashboard" end onClick={onClose} />
          <NavItem to="/dashboard/send" iconName="send" label="Send SMS" />
          <NavItem to="/dashboard/bulk" iconName="bulk" label="Bulk Upload" />
          <NavItem to="/dashboard/history" iconName="history" label="History" />

          {user?.role === 'admin' && (
            <>
              <div className="section-label" style={{ marginTop: '16px', marginBottom: '6px' }}>Administration</div>
              <NavItem to="/admin" iconName="admin" label="Admin Panel" end />
              <NavItem to="/admin/users" iconName="users" label="Users" />
              <NavItem to="/admin/logs" iconName="logs" label="SMS Logs" />
            </>
          )}
        </nav>

        {/* Footer */}
        <div style={{ padding: '12px', borderTop: '1px solid var(--border)' }}>
          <button
            className="btn btn-ghost"
            style={{ width: '100%', fontSize: '13px', justifyContent: 'flex-start', gap: '8px' }}
            onClick={() => {setLogoutOpen(true);
            if (isMobile && onClose) onClose();
            
}}
          >
            <Icon name="logout" size={15} color="var(--muted)" />
            Sign out
          </button>
        </div>
      </aside>

      <ConfirmModal
        open={logoutOpen}
        onClose={() => setLogoutOpen(false)}
        onConfirm={handleLogout}
        title="Sign out?"
        message="You'll be returned to the login screen. Any unsaved work will be lost."
        confirmLabel="Sign out"
        danger
      />
    </>
  );
}
