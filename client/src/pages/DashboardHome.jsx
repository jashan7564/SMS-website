import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/StatCard';
import { Icon } from '../components/Icons';

const statusBadge = (s) => {
  const map = { delivered: 'badge-success', sent: 'badge-info', failed: 'badge-danger', queued: 'badge-warn' };
  return <span className={`badge ${map[s] || 'badge-muted'}`}>{s}</span>;
};

function QuickCard({ iconName, title, desc, color, colorLight, to }) {
  const [hov, setHov] = useState(false);

  return (
    <a href={to} style={{ textDecoration: 'none' }}>
      <div
        className="card card-lift"
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{
          padding: '18px 20px',
          cursor: 'pointer',
          borderLeft: `3px solid ${hov ? color : 'transparent'}`,
          transition: 'all 0.22s',
        }}
      >
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '9px',
            background: colorLight,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '12px',
            transition: 'transform 0.2s',
            transform: hov ? 'scale(1.1)' : 'scale(1)',
          }}
        >
          <Icon name={iconName} size={17} color={color} />
        </div>

        <div
          style={{
            fontFamily: 'Syne, sans-serif',
            fontWeight: 700,
            fontSize: '14px',
            marginBottom: '3px',
            color: 'var(--text)',
          }}
        >
          {title}
        </div>

        <div style={{ fontSize: '12px', color: 'var(--muted)' }}>
          {desc}
        </div>
      </div>
    </a>
  );
}

export default function DashboardHome() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/sms/stats').then(r => r.data).catch(() => null),
      api.get('/sms/my-messages?limit=6').then(r => r.data.messages || []).catch(() => []),
    ]).then(([s, r]) => { setStats(s); setRecent(r); setLoading(false); });
  }, []);

  const h = new Date().getHours();
  const greeting = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
  const delivPct = stats?.total ? Math.round((stats.delivered / stats.total) * 100) || 0 : 0;

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '28px' }} className="fade-up">
        <p style={{ fontSize: '13px', color: 'var(--muted)', fontFamily: 'DM Mono, monospace', marginBottom: '4px', marginTop: 0 }}>
          {greeting}
        </p>
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '30px', margin: 0, letterSpacing: '-0.5px', color: 'var(--text)' }}>
          {user?.name}
        </h1>
        <p style={{ color: 'var(--muted)', margin: '5px 0 0', fontSize: '14px' }}>
          Here's your messaging overview
        </p>
      </div>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '14px', marginBottom: '24px' }}>
        <div className="fade-up delay-1"><StatCard iconName="credit"    label="Credits"   value={user?.credits ?? 0} sub="available balance"  color="var(--accent3)"  /></div>
        <div className="fade-up delay-2"><StatCard iconName="send"      label="Total Sent" value={stats?.total ?? 0}   sub="all time"           color="var(--accent)"   /></div>
        <div className="fade-up delay-3"><StatCard iconName="delivered" label="Delivered"  value={stats?.delivered ?? 0} sub={`${delivPct}% rate`}  color="var(--success)"  /></div>
        <div className="fade-up delay-4"><StatCard iconName="failed"    label="Failed"     value={stats?.failed ?? 0}  sub="check history"      color="var(--danger)"   /></div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '20px' }}>
        <div>
          {/* Delivery rate */}
          {stats?.total > 0 && (
            <div className="card fade-up delay-3" style={{ padding: '20px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '14px', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Icon name="trending" size={16} color="var(--accent)" />
                  Delivery Rate
                </span>
                <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '14px', color: 'var(--success)', fontWeight: 600 }}>{delivPct}%</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${delivPct}%` }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '12px', color: 'var(--muted)', fontFamily: 'DM Mono, monospace' }}>
                <span style={{ color: 'var(--success)' }}>{stats.delivered} delivered</span>
                <span style={{ color: 'var(--danger)' }}>{stats.failed} failed</span>
              </div>
            </div>
          )}

          {/* Recent messages */}
          <div className="card fade-up delay-4" style={{ padding: '22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '15px', margin: 0, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Icon name="history" size={16} color="var(--muted)" />
                Recent Messages
              </h2>
              <a href="/dashboard/history" style={{ fontSize: '13px', color: 'var(--accent)', textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                View all <Icon name="arrow_right" size={13} />
              </a>
            </div>

            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: '40px' }} />)}
              </div>
            ) : recent.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">
                  <Icon name="send" size={40} color="var(--muted3)" strokeWidth={1.2} />
                </div>
                <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, color: 'var(--muted2)', marginBottom: '5px' }}>No messages yet</div>
                <div style={{ fontSize: '13px' }}>Send your first SMS to see it here</div>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="tbl">
                  <thead><tr><th>Recipient</th><th>Country</th><th>Provider</th><th>Status</th><th>Date</th></tr></thead>
                  <tbody>
                    {recent.map((msg, i) => (
                      <tr key={msg.id} style={{ animation: `fade-up 0.3s ${i * 0.04}s both` }}>
                        <td style={{ fontFamily: 'DM Mono, monospace', color: 'var(--text2)', fontWeight: 500 }}>{msg.recipient_number}</td>
                        <td>{msg.country}</td>
                        <td><span className={`badge ${msg.provider === 'twilio' ? 'badge-info' : 'badge-muted'}`}>{msg.provider}</span></td>
                        <td>{statusBadge(msg.status)}</td>
                        <td style={{ fontFamily: 'DM Mono, monospace', fontSize: '12px' }}>{new Date(msg.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Quick actions */}
        <div className="fade-up delay-2" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '13px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: '2px' }}>
            Quick Actions
          </div>
          <QuickCard iconName="send"    title="Send SMS"     desc="Single message"  color="var(--accent)"  colorLight="var(--accent-light)"  to="/dashboard/send" />
          <QuickCard iconName="bulk"    title="Bulk Upload"  desc="Mass messaging"  color="var(--accent2)" colorLight="var(--accent2-light)" to="/dashboard/bulk" />
          <QuickCard iconName="history" title="History"      desc="View all logs"   color="var(--accent3)" colorLight="var(--accent3-light)" to="/dashboard/history" />

          {/* Provider info card */}
          <div className="card" style={{ padding: '16px', marginTop: '4px' }}>
            <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '12px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: '12px' }}>
              Smart Routing
            </div>
            {[
              { label: 'India (+91)', provider: 'MSG91', color: 'var(--accent)' },
              { label: 'International', provider: 'Twilio', color: 'var(--accent3)' },
            ].map(r => (
              <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                  <Icon name="globe" size={13} color={r.color} />
                  <span style={{ fontSize: '12.5px', color: 'var(--muted)' }}>{r.label}</span>
                </div>
                <span className="badge badge-info" style={{ fontSize: '11px' }}>{r.provider}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
