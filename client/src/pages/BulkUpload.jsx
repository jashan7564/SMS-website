import React, { useState, useRef } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Icon } from '../components/Icons';

export default function BulkUpload() {
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const fileRef = useRef();
  const { updateCredits } = useAuth();
  const toast = useToast();

  const handleFile = (f) => {
    if (!f) return;
    const ext = f.name.split('.').pop().toLowerCase();
    if (!['csv','xlsx','xls'].includes(ext)) { toast('Only CSV and Excel files allowed', 'error'); return; }
    setFile(f); setResult(null);
  };

  const handleDrop = (e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); };
  const fmt = (b) => b < 1024 ? b + ' B' : b < 1048576 ? (b/1024).toFixed(1) + ' KB' : (b/1048576).toFixed(1) + ' MB';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;
    setLoading(true); setResult(null);
    try {
      const fd = new FormData(); fd.append('file', file);
      const { data } = await api.post('/sms/bulk-send', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setResult(data);
      if (data.creditsRemaining !== undefined) updateCredits(data.creditsRemaining);
      toast(`Bulk send complete — ${data.successCount} sent, ${data.failCount} failed`, data.failCount === 0 ? 'success' : 'info');
      setFile(null);
    } catch (err) { toast(err.response?.data?.message || 'Bulk upload failed', 'error'); }
    finally { setLoading(false); }
  };

  return (
    <div>
      <div style={{ marginBottom: '28px' }} className="fade-up">
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '28px', margin: 0, letterSpacing: '-0.5px', color: 'var(--text)' }}>Bulk Upload</h1>
        <p style={{ color: 'var(--muted)', margin: '5px 0 0', fontSize: '14px' }}>Upload CSV or Excel to send SMS to multiple recipients</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '22px', alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Drop zone */}
          <div className="fade-up delay-1"
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
            style={{
              border: `2px dashed ${dragging ? 'var(--accent)' : file ? 'var(--success)' : 'var(--border-strong)'}`,
              borderRadius: '14px', padding: '44px 32px', textAlign: 'center', cursor: 'pointer',
              transition: 'all 0.22s', background: dragging ? 'var(--accent-light)' : file ? 'var(--success-light)' : 'var(--surface)',
              boxShadow: dragging ? '0 0 0 3px rgba(99,102,241,0.1)' : 'var(--shadow-sm)',
            }}
          >
            <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls" style={{ display: 'none' }} onChange={e => handleFile(e.target.files[0])} />
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '14px' }}>
              <Icon name={file ? 'logs' : 'upload'} size={36} color={file ? 'var(--success)' : dragging ? 'var(--accent)' : 'var(--muted2)'} strokeWidth={1.2} />
            </div>
            {file ? (
              <>
                <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '15px', marginBottom: '4px', color: 'var(--text)' }}>{file.name}</div>
                <div style={{ fontSize: '13px', color: 'var(--success)', fontFamily: 'DM Mono, monospace' }}>{fmt(file.size)} · Ready to upload</div>
                <button className="btn btn-ghost" style={{ marginTop: '14px', fontSize: '12px' }} onClick={e => { e.stopPropagation(); setFile(null); }}>
                  <Icon name="x" size={13} /> Remove file
                </button>
              </>
            ) : (
              <>
                <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '15px', marginBottom: '5px', color: 'var(--text)' }}>
                  {dragging ? 'Drop to upload' : 'Drop your file here'}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--muted)' }}>or click to browse · CSV, XLSX, XLS</div>
              </>
            )}
          </div>

          {file && (
            <button className="btn btn-primary fade-up" onClick={handleSubmit} disabled={loading} style={{ height: '46px', fontSize: '14px' }}>
              {loading ? <span className="spinner" /> : <Icon name="upload" size={16} />}
              {loading ? 'Processing…' : 'Upload & Send All'}
            </button>
          )}

          {loading && (
            <div className="card fade-up" style={{ padding: '18px' }}>
              <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 600, fontSize: '13.5px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text)' }}>
                <span className="spinner spinner-dark" /> Sending messages…
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: '100%', animation: 'progress-pulse 1.5s ease-in-out infinite' }} />
              </div>
            </div>
          )}

          {result && (
            <div className="card scale-in" style={{ padding: '22px', borderColor: '#bbf7d0', background: '#f0fdf4' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '15px', marginBottom: '18px', color: 'var(--success)' }}>
                <Icon name="delivered" size={17} color="var(--success)" /> Bulk Send Complete
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '14px' }}>
                {[{ l: 'Total', v: result.totalRows, c: 'var(--text)' }, { l: 'Sent', v: result.successCount, c: 'var(--success)' }, { l: 'Failed', v: result.failCount, c: 'var(--danger)' }].map(s => (
                  <div key={s.l} style={{ textAlign: 'center', padding: '14px', background: 'white', borderRadius: '9px', border: '1px solid var(--border)' }}>
                    <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '26px', color: s.c }}>{s.v}</div>
                    <div style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'Syne, sans-serif', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '3px' }}>{s.l}</div>
                  </div>
                ))}
              </div>
              {result.invalidRows > 0 && (
                <div style={{ padding: '10px 12px', background: 'var(--warn-light)', border: '1px solid #fde68a', borderRadius: '8px', fontSize: '13px', color: 'var(--warn)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Icon name="warning" size={14} color="var(--warn)" />
                  {result.invalidRows} rows had invalid phone numbers and were skipped
                </div>
              )}
            </div>
          )}
        </div>

        {/* Guide */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="card fade-up delay-2" style={{ padding: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <Icon name="info" size={15} color="var(--accent)" />
              <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '13px', color: 'var(--text)' }}>File Format Guide</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { col: 'recipient_number', req: true,  note: 'With country code' },
                { col: 'message_text',     req: false, note: 'Default used if empty' },
                { col: 'country',          req: false, note: 'Defaults to India' },
              ].map(({ col, req, note }) => (
                <div key={col} style={{ padding: '10px 12px', background: 'var(--bg2)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                    <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '12px', color: 'var(--accent)' }}>{col}</span>
                    <span className={`badge ${req ? 'badge-danger' : 'badge-muted'}`} style={{ fontSize: '10px' }}>{req ? 'required' : 'optional'}</span>
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--muted2)' }}>{note}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="card fade-up delay-3" style={{ padding: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <Icon name="template" size={15} color="var(--accent2)" />
              <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '13px', color: 'var(--text)' }}>Example Row</span>
            </div>
            <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '11.5px', color: 'var(--muted)', background: 'var(--bg2)', borderRadius: '8px', padding: '12px', lineHeight: '1.8', border: '1px solid var(--border)' }}>
              <span style={{ color: 'var(--accent3)' }}>+919876543210</span>,<br />
              <span style={{ color: 'var(--success)' }}>Hello from SMSPro!</span>,<br />
              <span style={{ color: 'var(--warn)' }}>India</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
