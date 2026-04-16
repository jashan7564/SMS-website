import React, { useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Icon } from '../components/Icons';

const COUNTRIES = ['India','USA','UK','Canada','Australia','Germany','France','UAE','Singapore','Japan','Brazil','Mexico'];

const TEMPLATES = [
  { label: 'OTP Code',   icon: 'shield', text: 'Your OTP is {{code}}. Valid for 10 minutes. Do not share with anyone.' },
  { label: 'Welcome',    icon: 'star',   text: 'Welcome to {{company}}! Your account is now active. Reply STOP to unsubscribe.' },
  { label: 'Reminder',   icon: 'history',text: 'Hi {{name}}, this is a reminder about your appointment on {{date}} at {{time}}.' },
  { label: 'Promotion',  icon: 'zap',    text: 'Exclusive offer! Use code {{code}} for 20% off your next order. Valid till {{date}}.' },
];

export default function SendSms() {
  const [form, setForm] = useState({ recipient_number: '', country: 'India', message_text: '' });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const { user, updateCredits } = useAuth();
  const toast = useToast();

  const charCount = form.message_text.length;
  const smsCount = Math.ceil(charCount / 160) || 1;
  const pct = Math.min(100, (charCount / 1600) * 100);
  const barColor = charCount > 1400 ? 'var(--danger)' : charCount > 900 ? 'var(--warn)' : 'var(--accent)';

  const applyTemplate = (t) => {
    setForm(f => ({ ...f, message_text: t.text }));
    setShowTemplates(false);
    toast(`Template "${t.label}" applied`, 'info');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setResult(null);
    try {
      const { data } = await api.post('/sms/send', form);
      setResult({ ok: true, ...data });
      updateCredits(data.creditsRemaining);
      toast('SMS sent successfully!', 'success');
      setForm({ recipient_number: '', country: 'India', message_text: '' });
    } catch (err) {
      const msg = err.response?.data?.message || 'SMS send failed';
      setResult({ ok: false, message: msg });
      toast(msg, 'error');
    } finally { setLoading(false); }
  };

  return (
    <div>
      <div style={{ marginBottom: '28px' }} className="fade-up">
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '28px', margin: 0, letterSpacing: '-0.5px', color: 'var(--text)' }}>
          Send SMS
        </h1>
        <p style={{ color: 'var(--muted)', margin: '5px 0 0', fontSize: '14px' }}>
          Send a message to any phone number worldwide
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '22px', alignItems: 'start' }}>
        {/* Compose form */}
        <div className="card fade-up delay-1" style={{ padding: '26px' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--muted)', marginBottom: '6px', fontFamily: 'Syne, sans-serif', textTransform: 'uppercase', letterSpacing: '0.09em' }}>
                  Phone Number
                </label>
                <div className="inp-icon-wrap">
                  <span className="icon-left"><Icon name="phone" size={14} /></span>
                  <input className="inp" placeholder="+91 9876543210" value={form.recipient_number}
                    onChange={e => setForm({ ...form, recipient_number: e.target.value })} required />
                </div>
                <div style={{ fontSize: '11px', color: 'var(--muted2)', marginTop: '4px', fontFamily: 'DM Mono, monospace' }}>Include country code</div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--muted)', marginBottom: '6px', fontFamily: 'Syne, sans-serif', textTransform: 'uppercase', letterSpacing: '0.09em' }}>
                  Country
                </label>
                <div className="inp-icon-wrap">
                  <span className="icon-left"><Icon name="globe" size={14} /></span>
                  <select className="inp" value={form.country} onChange={e => setForm({ ...form, country: e.target.value })} style={{ paddingLeft: '40px' }}>
                    {COUNTRIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Message */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--muted)', fontFamily: 'Syne, sans-serif', textTransform: 'uppercase', letterSpacing: '0.09em' }}>
                  Message
                </label>
                <button type="button" className="btn btn-ghost" style={{ fontSize: '12px', padding: '5px 11px', height: 'auto', gap: '5px' }}
                  onClick={() => setShowTemplates(v => !v)}>
                  <Icon name="template" size={13} color="var(--muted)" />
                  Templates
                  <Icon name="chevron_down" size={12} color="var(--muted)" style={{ transform: showTemplates ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                </button>
              </div>

              {showTemplates && (
                <div className="slide-down" style={{ marginBottom: '12px', border: '1px solid var(--border-md)', borderRadius: '10px', overflow: 'hidden' }}>
                  {TEMPLATES.map((t, i) => (
                    <div key={t.label} onClick={() => applyTemplate(t)}
                      style={{ padding: '11px 14px', cursor: 'pointer', borderBottom: i < TEMPLATES.length - 1 ? '1px solid var(--border)' : 'none', transition: 'background 0.15s', display: 'flex', alignItems: 'flex-start', gap: '10px' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-light)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <div style={{ width: '28px', height: '28px', borderRadius: '7px', background: 'var(--accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '1px' }}>
                        <Icon name={t.icon} size={13} color="var(--accent)" />
                      </div>
                      <div>
                        <div style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--text)', fontFamily: 'Syne, sans-serif', marginBottom: '2px' }}>{t.label}</div>
                        <div style={{ fontSize: '12px', color: 'var(--muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '360px' }}>{t.text}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <textarea className="inp" placeholder="Type your message here…" value={form.message_text}
                onChange={e => setForm({ ...form, message_text: e.target.value })} required maxLength={1600} style={{ minHeight: '130px' }} />

              {/* Char counter */}
              <div style={{ marginTop: '8px' }}>
                <div className="progress-bar">
                  <div style={{ height: '100%', width: `${pct}%`, background: barColor, borderRadius: '3px', transition: 'width 0.3s, background 0.3s' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px', fontSize: '11px', fontFamily: 'DM Mono, monospace', color: charCount > 1400 ? 'var(--danger)' : 'var(--muted2)' }}>
                  <span>{charCount}/1600 chars</span>
                  <span>{smsCount} SMS segment{smsCount > 1 ? 's' : ''}</span>
                </div>
              </div>
            </div>

            <button className="btn btn-primary" type="submit"
              disabled={loading || !form.recipient_number || !form.message_text || (user?.credits ?? 0) < 1}
              style={{ height: '46px', fontSize: '14px', gap: '8px' }}>
              {loading ? <span className="spinner" /> : <Icon name="send" size={16} />}
              {loading ? 'Sending…' : 'Send Message'}
            </button>

            {(user?.credits ?? 0) < 1 && (
              <div className="scale-in" style={{ padding: '12px 14px', borderRadius: '10px', background: 'var(--danger-light)', border: '1px solid #fecaca', fontSize: '13px', color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Icon name="warning" size={15} color="var(--danger)" />
                Insufficient credits. Contact admin to top up.
              </div>
            )}
          </form>
        </div>

        {/* Right panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Credits */}
          <div className="stat-card fade-up delay-2">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <Icon name="credit" size={15} color="var(--accent3)" />
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--muted)', fontFamily: 'Syne, sans-serif', textTransform: 'uppercase', letterSpacing: '0.09em' }}>Credit Balance</span>
            </div>
            <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '38px', fontWeight: 800, color: 'var(--text)', lineHeight: 1 }}>
              {user?.credits ?? 0}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--muted2)', fontFamily: 'DM Mono, monospace', marginTop: '5px' }}>1 credit per SMS</div>
          </div>

          {/* Routing */}
          <div className="card fade-up delay-3" style={{ padding: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <Icon name="globe" size={15} color="var(--accent)" />
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--muted)', fontFamily: 'Syne, sans-serif', textTransform: 'uppercase', letterSpacing: '0.09em' }}>Smart Routing</span>
            </div>
            {[
              { label: 'India (+91)', provider: 'MSG91', color: 'var(--accent)' },
              { label: 'International', provider: 'Twilio', color: 'var(--accent3)' },
            ].map(r => (
              <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 12px', background: 'var(--bg2)', borderRadius: '8px', border: '1px solid var(--border)', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Icon name="send" size={12} color={r.color} />
                  <span style={{ fontSize: '12.5px', color: 'var(--muted)' }}>{r.label}</span>
                </div>
                <span className="badge badge-info" style={{ fontSize: '11px' }}>{r.provider}</span>
              </div>
            ))}
          </div>

          {/* Result */}
          {result && (
            <div className="card scale-in" style={{ padding: '18px', borderColor: result.ok ? '#bbf7d0' : '#fecaca', background: result.ok ? '#f0fdf4' : '#fef2f2' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '14px', color: result.ok ? 'var(--success)' : 'var(--danger)' }}>
                <Icon name={result.ok ? 'delivered' : 'failed'} size={16} color={result.ok ? 'var(--success)' : 'var(--danger)'} />
                {result.ok ? 'Message Sent' : 'Send Failed'}
              </div>
              {result.ok ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
                  {[
                    { label: 'Provider', val: <span className="badge badge-info">{result.provider}</span> },
                    { label: 'Status', val: <span className="badge badge-success">{result.status}</span> },
                  ].map(row => (
                    <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                      <span style={{ color: 'var(--muted)' }}>{row.label}</span>
                      {row.val}
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ fontSize: '13px', color: 'var(--danger)' }}>{result.message}</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
