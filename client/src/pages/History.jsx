import React, { useEffect, useState, useCallback } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';
import { Icon } from '../components/Icons';

const statusBadge = (s) => {
  const map = { delivered: 'badge-success', sent: 'badge-info', failed: 'badge-danger', queued: 'badge-warn' };
  return <span className={`badge ${map[s] || 'badge-muted'}`}>{s}</span>;
};

function MessageModal({ msg, onClose }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(msg.message_text);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };
  return (
    <Modal open={!!msg} onClose={onClose} title="Message Details" width={520}>
      {msg && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {[
              { label: 'Recipient', val: msg.recipient_number, mono: true },
              { label: 'Country',   val: msg.country },
              { label: 'Provider',  val: <span className="badge badge-info">{msg.provider}</span> },
              { label: 'Status',    val: statusBadge(msg.status) },
              { label: 'Type',      val: <span className={`badge ${msg.is_bulk ? 'badge-warn' : 'badge-muted'}`}>{msg.is_bulk ? 'Bulk' : 'Single'}</span> },
              { label: 'Sent at',   val: new Date(msg.created_at).toLocaleString(), mono: true },
            ].map(row => (
              <div key={row.label} style={{ padding: '11px 13px', background: 'var(--bg2)', borderRadius: '9px', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--muted2)', fontFamily: 'Syne, sans-serif', textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: '4px' }}>{row.label}</div>
                <div style={{ fontSize: '13px', color: 'var(--text)', fontFamily: row.mono ? 'DM Mono, monospace' : 'inherit', fontWeight: row.mono ? 500 : 600 }}>{row.val}</div>
              </div>
            ))}
          </div>
          <div style={{ padding: '14px', background: 'var(--bg2)', borderRadius: '10px', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--muted2)', fontFamily: 'Syne, sans-serif', textTransform: 'uppercase', letterSpacing: '0.09em' }}>Message</span>
              <button onClick={copy} style={{ fontSize: '12px', fontFamily: 'DM Mono, monospace', padding: '3px 10px', borderRadius: '6px', border: `1px solid ${copied ? '#bbf7d0' : 'var(--border-md)'}`, background: copied ? 'var(--success-light)' : 'var(--surface)', color: copied ? 'var(--success)' : 'var(--muted)', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Icon name={copied ? 'check' : 'copy'} size={12} strokeWidth={2} />
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <div style={{ fontSize: '13.5px', color: 'var(--text)', lineHeight: 1.65, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{msg.message_text}</div>
          </div>
        </div>
      )}
    </Modal>
  );
}

const STATUS_FILTERS = ['all', 'delivered', 'sent', 'failed', 'queued'];

export default function History() {
  const [data, setData] = useState({ messages: [], total: 0, pages: 1 });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selected, setSelected] = useState(null);

  const fetchData = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const { data: d } = await api.get(`/sms/my-messages?page=${p}&limit=15`);
      setData(d); setPage(p);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(1); }, [fetchData]);

  const filtered = data.messages.filter(m => {
    const s = !search || m.recipient_number.includes(search) || m.country.toLowerCase().includes(search.toLowerCase());
    const f = statusFilter === 'all' || m.status === statusFilter;
    return s && f;
  });

  return (
    <div>
      <div style={{ marginBottom: '28px' }} className="fade-up">
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '28px', margin: 0, letterSpacing: '-0.5px', color: 'var(--text)' }}>
          Message History
        </h1>
        <p style={{ color: 'var(--muted)', margin: '5px 0 0', fontSize: '14px' }}>{data.total} total messages</p>
      </div>

      <div className="card fade-up delay-1" style={{ padding: '22px' }}>
        {/* Toolbar */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '18px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
            <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', display: 'flex', pointerEvents: 'none' }}>
              <Icon name="search" size={14} color="var(--muted2)" />
            </span>
            <input className="inp" placeholder="Search phone or country…" value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: '38px' }} />
            {search && (
              <button onClick={() => setSearch('')} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted2)', display: 'flex', padding: '2px' }}>
                <Icon name="x" size={14} />
              </button>
            )}
          </div>
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
            {STATUS_FILTERS.map(s => (
              <button key={s} onClick={() => setStatusFilter(s)} className="btn btn-ghost"
                style={{ padding: '7px 13px', fontSize: '12px', ...(statusFilter === s ? { background: 'var(--accent-light)', color: 'var(--accent)', borderColor: 'var(--accent-mid)' } : {}) }}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
          <button className="btn btn-ghost" onClick={() => fetchData(page)} style={{ padding: '7px 13px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Icon name="refresh" size={13} color="var(--muted)" /> Refresh
          </button>
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[1,2,3,4,5].map(i => <div key={i} className="skeleton" style={{ height: '42px' }} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><Icon name="history" size={44} color="var(--muted3)" strokeWidth={1} /></div>
            <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, color: 'var(--muted2)', marginBottom: '5px' }}>
              {search || statusFilter !== 'all' ? 'No matches found' : 'No messages yet'}
            </div>
            <div style={{ fontSize: '13px' }}>{search ? 'Try a different search term' : 'Send your first SMS to get started'}</div>
          </div>
        ) : (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table className="tbl">
                <thead><tr><th>#</th><th>Recipient</th><th>Country</th><th>Message</th><th>Provider</th><th>Status</th><th>Type</th><th>Date</th><th></th></tr></thead>
                <tbody>
                  {filtered.map((msg, i) => (
                    <tr key={msg.id} style={{ animation: `fade-up 0.28s ${i * 0.03}s both` }} onClick={() => setSelected(msg)}>
                      <td style={{ fontFamily: 'DM Mono, monospace', fontSize: '11.5px', color: 'var(--muted2)' }}>{msg.id}</td>
                      <td style={{ fontFamily: 'DM Mono, monospace', color: 'var(--text2)', fontWeight: 500 }}>{msg.recipient_number}</td>
                      <td>{msg.country}</td>
                      <td style={{ maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{msg.message_text}</td>
                      <td><span className={`badge ${msg.provider === 'twilio' ? 'badge-info' : 'badge-muted'}`}>{msg.provider}</span></td>
                      <td>{statusBadge(msg.status)}</td>
                      <td><span className={`badge ${msg.is_bulk ? 'badge-warn' : 'badge-muted'}`}>{msg.is_bulk ? 'Bulk' : 'Single'}</span></td>
                      <td style={{ fontFamily: 'DM Mono, monospace', fontSize: '11.5px', whiteSpace: 'nowrap' }}>{new Date(msg.created_at).toLocaleString()}</td>
                      <td><Icon name="arrow_right" size={14} color="var(--muted3)" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {data.pages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '20px', alignItems: 'center' }}>
                <button className="btn btn-ghost" onClick={() => fetchData(page - 1)} disabled={page <= 1} style={{ padding: '7px 16px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Icon name="arrow_right" size={13} style={{ transform: 'rotate(180deg)' }} /> Prev
                </button>
                <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '13px', color: 'var(--muted)', padding: '0 8px' }}>{page} / {data.pages}</span>
                <button className="btn btn-ghost" onClick={() => fetchData(page + 1)} disabled={page >= data.pages} style={{ padding: '7px 16px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  Next <Icon name="arrow_right" size={13} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
      <MessageModal msg={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
