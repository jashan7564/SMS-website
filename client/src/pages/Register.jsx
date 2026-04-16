import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import SvgBackground from '../components/SvgBackground';
import { Icon } from '../components/Icons';

function StrengthBar({ password }) {
  const checks = [
    { label: '8+ chars',   ok: password.length >= 8 },
    { label: 'Uppercase',  ok: /[A-Z]/.test(password) },
    { label: 'Number',     ok: /\d/.test(password) },
    { label: 'Symbol',     ok: /[^A-Za-z0-9]/.test(password) },
  ];
  const score = checks.filter(c => c.ok).length;
  const cols = ['var(--danger)', 'var(--warn)', 'var(--warn)', 'var(--success)', 'var(--success)'];
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  if (!password) return null;
  return (
    <div className="scale-in" style={{ marginTop: '8px' }}>
      <div style={{ display: 'flex', gap: '3px', marginBottom: '6px' }}>
        {[0,1,2,3].map(i => (
          <div key={i} style={{ flex: 1, height: '3px', borderRadius: '2px', background: i < score ? cols[score] : 'var(--muted3)', transition: 'background 0.3s' }} />
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {checks.map(c => (
            <span key={c.label} style={{ fontSize: '11px', fontFamily: 'DM Mono, monospace', color: c.ok ? 'var(--success)' : 'var(--muted2)', display: 'flex', alignItems: 'center', gap: '3px', transition: 'color 0.2s' }}>
              <Icon name={c.ok ? 'check' : 'minus'} size={10} strokeWidth={2.5} />
              {c.label}
            </span>
          ))}
        </div>
        {score > 0 && <span style={{ fontSize: '11px', fontFamily: 'Syne, sans-serif', fontWeight: 700, color: cols[score] }}>{labels[score]}</span>}
      </div>
    </div>
  );
}

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [mounted, setMounted] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => { const t = setTimeout(() => setMounted(true), 60); return () => clearTimeout(t); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/register', form);
      toast('Account created! Please sign in.', 'success');
      navigate('/');
    } catch (err) {
      toast(err.response?.data?.message || 'Registration failed', 'error');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
      <SvgBackground variant="auth" />
      <div style={{
        width: '100%', maxWidth: '420px', padding: '24px', position: 'relative', zIndex: 1,
        opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(20px)',
        transition: 'opacity 0.55s cubic-bezier(0.34,1.2,0.64,1), transform 0.55s cubic-bezier(0.34,1.2,0.64,1)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '28px', letterSpacing: '-0.8px', color: 'var(--text)' }}>
            SMS<span style={{ color: 'var(--accent)' }}>Pro</span>
          </div>
          <div style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '4px' }}>Create your account</div>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(20px)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: '20px', padding: '32px', boxShadow: '0 8px 40px rgba(99,102,241,0.1)' }}>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '22px', marginTop: 0, marginBottom: '5px', color: 'var(--text)' }}>Get started</h2>
          <p style={{ color: 'var(--muted)', fontSize: '13.5px', marginBottom: '24px', marginTop: 0 }}>Fill in your details below</p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {[
              { key: 'name',  label: 'Full Name',  type: 'text',  icon: 'user',  ph: 'John Doe' },
              { key: 'email', label: 'Email',       type: 'email', icon: 'mail',  ph: 'you@company.com' },
            ].map(f => (
              <div key={f.key}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--muted)', marginBottom: '6px', fontFamily: 'Syne, sans-serif', textTransform: 'uppercase', letterSpacing: '0.09em' }}>{f.label}</label>
                <div className="inp-icon-wrap">
                  <span className="icon-left"><Icon name={f.icon} size={14} /></span>
                  <input className="inp" type={f.type} placeholder={f.ph} value={form[f.key]}
                    onChange={e => setForm({ ...form, [f.key]: e.target.value })} required />
                </div>
              </div>
            ))}

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--muted)', marginBottom: '6px', fontFamily: 'Syne, sans-serif', textTransform: 'uppercase', letterSpacing: '0.09em' }}>Password</label>
              <div className="inp-icon-wrap" style={{ position: 'relative' }}>
                <span className="icon-left"><Icon name="lock" size={14} /></span>
                <input className="inp" type={showPwd ? 'text' : 'password'} placeholder="Min. 8 characters"
                  value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required style={{ paddingRight: '40px' }} />
                <button type="button" onClick={() => setShowPwd(v => !v)}
                  style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted2)', display: 'flex', alignItems: 'center', padding: '4px', transition: 'color 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--muted2)'}
                ><Icon name={showPwd ? 'eyeOff' : 'eye'} size={15} /></button>
              </div>
              <StrengthBar password={form.password} />
            </div>

            <button className="btn btn-primary" type="submit" disabled={loading || !form.name || !form.email || !form.password} style={{ height: '44px', marginTop: '4px' }}>
              {loading ? <span className="spinner" /> : <Icon name="user" size={15} />}
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>

          <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '13.5px', color: 'var(--muted)' }}>
            Already have an account?{' '}
            <Link to="/" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 700 }}>Sign in →</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
