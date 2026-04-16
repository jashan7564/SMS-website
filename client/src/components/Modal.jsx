import React, { useEffect, useCallback } from 'react';
import { Icon } from './Icons';

export default function Modal({ open, onClose, title, children, width = 480 }) {
  const handleKey = useCallback((e) => { if (e.key === 'Escape') onClose(); }, [onClose]);
  useEffect(() => {
    if (open) { document.addEventListener('keydown', handleKey); document.body.style.overflow = 'hidden'; }
    return () => { document.removeEventListener('keydown', handleKey); document.body.style.overflow = ''; };
  }, [open, handleKey]);
  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ maxWidth: width }}>
        <button className="modal-close" onClick={onClose}><Icon name="x" size={14} /></button>
        {title && (
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '19px', marginTop: 0, marginBottom: '20px', color: 'var(--text)' }}>
            {title}
          </h2>
        )}
        {children}
      </div>
    </div>
  );
}

export function ConfirmModal({ open, onClose, onConfirm, title, message, confirmLabel = 'Confirm', danger = false, loading = false }) {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <p style={{ color: 'var(--muted)', fontSize: '14px', lineHeight: 1.7, marginTop: 0, marginBottom: '24px' }}>{message}</p>
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
        <button className="btn btn-ghost" onClick={onClose} disabled={loading}>Cancel</button>
        <button className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`} onClick={onConfirm} disabled={loading}>
          {loading ? <span className={`spinner ${danger ? 'spinner-dark' : ''}`} /> : null}
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
