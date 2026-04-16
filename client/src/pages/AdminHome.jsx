import React, { useEffect, useState } from 'react';
import api from '../services/api';
import StatCard from '../components/StatCard';
import { Icon } from '../components/Icons';

function HealthBar({ label, value, total, color = 'var(--accent)' }) {
  const pct = total ? Math.round((value / total) * 100) : 0;
  return (
    <div style={{ marginBottom: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
        <span style={{ fontSize: '13px', color: 'var(--muted)', fontWeight: 500 }}>{label}</span>
        <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '13px', color, fontWeight: 600 }}>{pct}%</span>
      </div>
      <div className="progress-bar">
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: '3px', transition: 'width 1s cubic-bezier(0.34, 1.2, 0.64, 1)' }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', fontSize: '11px', color: 'var(--muted2)', fontFamily: 'DM Mono, monospace' }}>
        <span>{value?.toLocaleString()} / {total?.toLocaleString()}</span>
      </div>
    </div>
  );
}

export default function AdminHome() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/stats').then(r => { setStats(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const deliveryPct = stats?.total_sms ? Math.round((stats.delivered / stats.total_sms) * 100) : 0;

  return (
    <div>
      <div style={{ marginBottom: '28px' }} className="fade-up">
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', background: 'var(--danger-light)', border: '1px solid #fecaca', borderRadius: '20px', padding: '4px 12px', marginBottom: '12px' }}>
          <Icon name="shield" size={12} color="var(--danger)" strokeWidth={2} />
          <span style={{ fontSize: '10.5px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--danger)', fontFamily: 'Syne, sans-serif' }}>Admin Access</span>
        </div>
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '28px', margin: 0, letterSpacing: '-0.5px', color: 'var(--text)' }}>Admin Panel</h1>
        <p style={{ color: 'var(--muted)', margin: '5px 0 0', fontSize: '14px' }}>Platform overview and management</p>
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '14px', marginBottom: '24px' }}>
          {[1,2,3,4,5].map(i => <div key={i} className="skeleton" style={{ height: '110px', borderRadius: '14px' }} />)}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '14px', marginBottom: '24px' }}>
          <div className="fade-up delay-1"><StatCard iconName="users"     label="Total Users"      value={stats?.total_users}            color="var(--accent)"  /></div>
          <div className="fade-up delay-2"><StatCard iconName="delivered" label="Active Users"      value={stats?.active_users}           color="var(--success)" /></div>
          <div className="fade-up delay-3"><StatCard iconName="send"      label="Total SMS"         value={stats?.total_sms}              color="var(--accent3)" /></div>
          <div className="fade-up delay-4"><StatCard iconName="credit"    label="Credits in System" value={stats?.total_credits_in_system} color="var(--warn)"    /></div>
          <div className="fade-up delay-5"><StatCard iconName="failed"    label="Failed SMS"        value={stats?.failed}                 color="var(--danger)"  /></div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div className="card fade-up delay-3" style={{ padding: '22px' }}>
          <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, margin: '0 0 16px', fontSize: '15px', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Icon name="zap" size={15} color="var(--accent)" /> Quick Actions
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              { iconName: 'users', label: 'Manage Users', desc: 'View, credit, suspend users',   href: '/admin/users', color: 'var(--accent)'  },
              { iconName: 'logs',  label: 'SMS Logs',     desc: 'Full platform message history', href: '/admin/logs',  color: 'var(--accent2)' },
            ].map(a => (
              <a key={a.href} href={a.href} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '13px 14px', borderRadius: '10px', background: 'var(--bg2)', border: '1px solid var(--border)', textDecoration: 'none', transition: 'all 0.18s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.background = 'var(--accent-light)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg2)'; }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '9px', background: a.color === 'var(--accent)' ? 'var(--accent-light)' : 'var(--accent2-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon name={a.iconName} size={16} color={a.color} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '13.5px', color: 'var(--text)' }}>{a.label}</div>
                  <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '1px' }}>{a.desc}</div>
                </div>
                <Icon name="arrow_right" size={14} color="var(--muted3)" />
              </a>
            ))}
          </div>
        </div>

        <div className="card fade-up delay-4" style={{ padding: '22px' }}>
          <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, margin: '0 0 18px', fontSize: '15px', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Icon name="trending" size={15} color="var(--success)" /> Platform Health
          </h3>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[1,2].map(i => <div key={i} className="skeleton" style={{ height: '52px' }} />)}
            </div>
          ) : stats ? (
            <>
              <HealthBar label="Delivery Rate" value={stats.delivered}    total={stats.total_sms}   color="var(--success)" />
              <HealthBar label="Active Users"  value={stats.active_users} total={stats.total_users} color="var(--accent)"  />
            </>
          ) : (
            <div style={{ color: 'var(--muted)', fontSize: '13px', padding: '20px 0', textAlign: 'center' }}>No data available</div>
          )}
          {stats && (
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
              <span className="badge badge-success"><Icon name="check" size={10} strokeWidth={2.5} /> {deliveryPct}% delivered</span>
              <span className="badge badge-info"><Icon name="users" size={10} /> {stats.total_users} users</span>
              <span className="badge badge-cyan"><Icon name="credit" size={10} /> {stats.total_credits_in_system?.toLocaleString()} credits</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
