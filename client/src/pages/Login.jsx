import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import SvgBackground from '../components/SvgBackground';
import { Icon } from '../components/Icons';

function LogoSvg() {
  return (
    <svg width="52" height="52" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="52" height="52" rx="16" fill="#6366f1" />
      <rect width="52" height="52" rx="16" fill="url(#logoGrad)" />
      <defs>
        <linearGradient id="logoGrad" x1="0" y1="0" x2="52" y2="52" gradientUnits="userSpaceOnUse">
          <stop stopColor="#818cf8" />
          <stop offset="1" stopColor="#6366f1" />
        </linearGradient>
      </defs>
      {/* Envelope */}
      <rect x="12" y="16" width="28" height="20" rx="3" fill="white" fillOpacity="0.95" />
      <path d="M12 19l14 9 14-9" stroke="#6366f1" strokeWidth="1.8" strokeLinecap="round" />
      {/* Signal waves top right */}
      <path d="M35 11 Q38 8 41 11" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.7" />
      <path d="M33 9 Q38 4 43 9" stroke="white" strokeWidth="1.3" strokeLinecap="round" fill="none" opacity="0.4" />
    </svg>
  );
}

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [shake, setShake] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => { const t = setTimeout(() => setMounted(true), 60); return () => clearTimeout(t); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', form);
      login(data.token, data.user);
      toast('Welcome back, ' + data.user.name + '!', 'success');
      navigate(data.user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      toast(err.response?.data?.message || 'Login failed', 'error');
      setShake(true); setTimeout(() => setShake(false), 420);
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', position: 'relative', overflow: 'hidden' }}>
      <SvgBackground variant="auth" />

      {/* Left panel – hero */}
      <div style={{
        flex: '0 0 42%', display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '60px 56px', position: 'relative', zIndex: 1,
      }} className="hidden-mobile">
        <div className="fade-up">
          <div style={{ marginBottom: '32px' }}>
            <LogoSvg />
          </div>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '40px', color: 'var(--text)', lineHeight: 1.15, margin: '0 0 16px', letterSpacing: '-1px' }}>
            Reach everyone,<br />
            <span className="text-gradient">instantly.</span>
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '15px', lineHeight: 1.7, maxWidth: '340px', margin: 0 }}>
            Enterprise-grade SMS delivery with smart routing, real-time analytics, and 99.9% uptime.
          </p>

          <div style={{ marginTop: '40px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {[
              { icon: 'zap', label: 'Smart routing via MSG91 & Twilio', color: 'var(--accent)' },
              { icon: 'shield', label: 'JWT-secured, enterprise-ready', color: 'var(--success)' },
              { icon: 'trending', label: 'Real-time delivery analytics', color: 'var(--accent2)' },
            ].map(f => (
              <div key={f.label} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: f.color === 'var(--accent)' ? 'var(--accent-light)' : f.color === 'var(--success)' ? 'var(--success-light)' : 'var(--accent2-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon name={f.icon} size={15} color={f.color} />
                </div>
                <span style={{ fontSize: '13.5px', color: 'var(--muted)', fontWeight: 500 }}>{f.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel – form */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '32px 24px', position: 'relative', zIndex: 1,
      }}>
        <div style={{
          width: '100%', maxWidth: '400px',
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(20px)',
          transition: 'opacity 0.55s cubic-bezier(0.34,1.2,0.64,1), transform 0.55s cubic-bezier(0.34,1.2,0.64,1)',
        }}>
          <div
            style={{
              background: 'rgba(255,255,255,0.9)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(99,102,241,0.15)',
              borderRadius: '20px',
              padding: '36px 32px',
              boxShadow: '0 8px 40px rgba(99,102,241,0.1), 0 2px 8px rgba(15,23,42,0.06)',
              ...(shake ? { animation: 'shake 0.4s ease' } : {}),
            }}
          >
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '24px', marginTop: 0, marginBottom: '6px', color: 'var(--text)' }}>
              Sign in
            </h2>
            <p style={{ color: 'var(--muted)', fontSize: '14px', marginBottom: '28px', marginTop: 0 }}>
              Enter your credentials to continue
            </p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--muted)', marginBottom: '7px', fontFamily: 'Syne, sans-serif', textTransform: 'uppercase', letterSpacing: '0.09em' }}>
                  Email address
                </label>
                <div className="inp-icon-wrap">
                  <span className="icon-left"><Icon name="mail" size={14} /></span>
                  <input className="inp" type="email" placeholder="you@company.com" value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })} required autoComplete="email" />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--muted)', marginBottom: '7px', fontFamily: 'Syne, sans-serif', textTransform: 'uppercase', letterSpacing: '0.09em' }}>
                  Password
                </label>
                <div className="inp-icon-wrap" style={{ position: 'relative' }}>
                  <span className="icon-left"><Icon name="lock" size={14} /></span>
                  <input className="inp" type={showPwd ? 'text' : 'password'} placeholder="••••••••"
                    value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                    required autoComplete="current-password" style={{ paddingRight: '40px' }} />
                  <button type="button" onClick={() => setShowPwd(v => !v)}
                    style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted2)', display: 'flex', alignItems: 'center', padding: '4px', borderRadius: '5px', transition: 'color 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--muted2)'}
                  >
                    <Icon name={showPwd ? 'eyeOff' : 'eye'} size={15} />
                  </button>
                </div>
              </div>

              <button className="btn btn-primary" type="submit" disabled={loading || !form.email || !form.password}
                style={{ height: '44px', fontSize: '14px', marginTop: '4px' }}>
                {loading ? <span className="spinner" /> : <Icon name="arrow_right" size={15} />}
                {loading ? 'Signing in…' : 'Sign in'}
              </button>
            </form>

            <div style={{ marginTop: '22px', textAlign: 'center', fontSize: '13.5px', color: 'var(--muted)' }}>
              No account?{' '}
              <Link to="/register" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 700 }}>
                Create one →
              </Link>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '18px', display: 'flex', justifyContent: 'center', gap: '20px', fontSize: '11.5px', color: 'var(--muted2)', fontFamily: 'DM Mono, monospace' }}>
            {['JWT Secured', 'End-to-end encrypted', '99.9% uptime'].map(t => (
              <span key={t} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Icon name="check" size={11} color="var(--success)" strokeWidth={2.5} />
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
