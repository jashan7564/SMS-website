import React, { useEffect, useState, useCallback } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';
import { Icon } from '../components/Icons';

const statusBadge = (s) => {
  const map = { delivered: 'badge-success', sent: 'badge-info', failed: 'badge-danger', queued: 'badge-warn' };
  return <span className={`badge ${map[s] || 'badge-muted'}`}>{s}</span>;
};

function LogDetailModal({ log, onClose }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(log.message_text);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };
  return (
    <Modal open={!!log} onClose={onClose} title="Log Entry Details" width={540}>
      {log && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* User info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px', background: 'var(--bg2)', borderRadius: '10px', border: '1px solid var(--border)' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'linear-gradient(135deg, var(--accent), var(--accent2))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '14px', color: 'white', flexShrink: 0 }}>
              {log.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text)', fontFamily: 'Syne, sans-serif' }}>{log.name}</div>
              <div style={{ fontSize: '12px', color: 'var(--muted)', fontFamily: 'DM Mono, monospace' }}>{log.email}</div>
            </div>
            <div style={{ marginLeft: 'auto' }}>
              {statusBadge(log.status)}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {[
              { label: 'Recipient', val: log.recipient_number, mono: true },
              { label: 'Country',   val: log.country },
              { label: 'Provider',  val: <span className="badge badge-info">{log.provider}</span> },
              { label: 'Type',      val: <span className={`badge ${log.is_bulk ? 'badge-warn' : 'badge-muted'}`}>{log.is_bulk ? 'Bulk' : 'Single'}</span> },
              { label: 'Credits Used', val: log.credits_used, mono: true },
              { label: 'Sent at',   val: new Date(log.created_at).toLocaleString(), mono: true },
            ].map(row => (
              <div key={row.label} style={{ padding: '10px 13px', background: 'var(--bg2)', borderRadius: '9px', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--muted2)', fontFamily: 'Syne, sans-serif', textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: '4px' }}>{row.label}</div>
                <div style={{ fontSize: '13px', color: 'var(--text)', fontFamily: row.mono ? 'DM Mono, monospace' : 'inherit', fontWeight: row.mono ? 500 : 600 }}>{row.val}</div>
              </div>
            ))}
          </div>

          {log.message_text && (
            <div style={{ padding: '14px', background: 'var(--bg2)', borderRadius: '10px', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--muted2)', fontFamily: 'Syne, sans-serif', textTransform: 'uppercase', letterSpacing: '0.09em' }}>Message Content</span>
                <button onClick={copy} style={{ fontSize: '12px', padding: '3px 10px', borderRadius: '6px', border: `1px solid ${copied ? '#bbf7d0' : 'var(--border-md)'}`, background: copied ? 'var(--success-light)' : 'var(--surface)', color: copied ? 'var(--success)' : 'var(--muted)', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '5px', fontFamily: 'DM Mono, monospace' }}>
                  <Icon name={copied ? 'check' : 'copy'} size={11} strokeWidth={2} />
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <div style={{ fontSize: '13.5px', color: 'var(--text)', lineHeight: 1.65, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{log.message_text}</div>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}

const STATUS_FILTERS = ['all', 'delivered', 'sent', 'failed', 'queued'];

export default function AdminLogs() {
  const [data, setData] = useState({ logs: [], total: 0, pages: 1 });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selected, setSelected] = useState(null);

  const fetchLogs = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const { data: d } = await api.get(`/admin/sms-logs?page=${p}&limit=15`);
      setData(d); setPage(p);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { fetchLogs(1); }, [fetchLogs]);

  const filtered = data.logs.filter(l => {
    const matchSearch = !search ||
      l.recipient_number?.includes(search) ||
      l.email?.toLowerCase().includes(search.toLowerCase()) ||
      l.name?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || l.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div>
      <div style={{ marginBottom: '28px' }} className="fade-up">
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '28px', margin: 0, letterSpacing: '-0.5px', color: 'var(--text)' }}>
          SMS Logs
        </h1>
        <p style={{ color: 'var(--muted)', margin: '5px 0 0', fontSize: '14px' }}>{data.total} total messages across all users</p>
      </div>

      <div className="card fade-up delay-1" style={{ padding: '22px' }}>
        {/* Toolbar */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '18px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
            <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', display: 'flex', pointerEvents: 'none' }}>
              <Icon name="search" size={14} color="var(--muted2)" />
            </span>
            <input className="inp" placeholder="Search phone, name, email…" value={search}
              onChange={e => setSearch(e.target.value)} style={{ paddingLeft: '38px' }} />
            {search && (
              <button onClick={() => setSearch('')} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted2)', display: 'flex', padding: '2px' }}>
                <Icon name="x" size={14} />
              </button>
            )}
          </div>
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
            {STATUS_FILTERS.map(s => (
              <button key={s} onClick={() => setStatusFilter(s)} className="btn btn-ghost"
                style={{ padding: '7px 12px', fontSize: '12px', ...(statusFilter === s ? { background: 'var(--accent-light)', color: 'var(--accent)', borderColor: 'var(--accent-mid)' } : {}) }}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
          <button className="btn btn-ghost" onClick={() => fetchLogs(page)} style={{ padding: '7px 13px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Icon name="refresh" size={13} color="var(--muted)" /> Refresh
          </button>
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[1,2,3,4,5].map(i => <div key={i} className="skeleton" style={{ height: '52px' }} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><Icon name="logs" size={44} color="var(--muted3)" strokeWidth={1} /></div>
            <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, color: 'var(--muted2)', marginBottom: '5px' }}>
              {search || statusFilter !== 'all' ? 'No matches found' : 'No logs yet'}
            </div>
            <div style={{ fontSize: '13px' }}>Messages will appear here once sent</div>
          </div>
        ) : (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table className="tbl">
                <thead>
                  <tr><th>User</th><th>Recipient</th><th>Country</th><th>Provider</th><th>Status</th><th>Type</th><th>Credits</th><th>Date</th><th></th></tr>
                </thead>
                <tbody>
                  {filtered.map((log, i) => (
                    <tr key={log.id} style={{ animation: `fade-up 0.28s ${i * 0.03}s both` }} onClick={() => setSelected(log)}>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: '13px' }}>{log.name}</div>
                        <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '11px', color: 'var(--muted2)' }}>{log.email}</div>
                      </td>
                      <td style={{ fontFamily: 'DM Mono, monospace', color: 'var(--text2)', fontWeight: 500 }}>{log.recipient_number}</td>
                      <td>{log.country}</td>
                      <td><span className={`badge ${log.provider === 'twilio' ? 'badge-info' : 'badge-muted'}`}>{log.provider}</span></td>
                      <td>{statusBadge(log.status)}</td>
                      <td><span className={`badge ${log.is_bulk ? 'badge-warn' : 'badge-muted'}`}>{log.is_bulk ? 'Bulk' : 'Single'}</span></td>
                      <td>
                        <span style={{ fontFamily: 'DM Mono, monospace', color: 'var(--warn)', fontWeight: 600, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Icon name="credit" size={11} color="var(--warn)" />
                          {log.credits_used}
                        </span>
                      </td>
                      <td style={{ fontFamily: 'DM Mono, monospace', fontSize: '11.5px', whiteSpace: 'nowrap' }}>{new Date(log.created_at).toLocaleString()}</td>
                      <td><Icon name="arrow_right" size={14} color="var(--muted3)" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {data.pages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '20px', alignItems: 'center' }}>
                <button className="btn btn-ghost" onClick={() => fetchLogs(page - 1)} disabled={page <= 1} style={{ padding: '7px 16px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Icon name="arrow_right" size={13} style={{ transform: 'rotate(180deg)' }} /> Prev
                </button>
                <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '13px', color: 'var(--muted)', padding: '0 8px' }}>{page} / {data.pages}</span>
                <button className="btn btn-ghost" onClick={() => fetchLogs(page + 1)} disabled={page >= data.pages} style={{ padding: '7px 16px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  Next <Icon name="arrow_right" size={13} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
      <LogDetailModal log={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
