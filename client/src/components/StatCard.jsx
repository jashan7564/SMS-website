import React, { useEffect, useRef, useState } from 'react';
import { Icon } from './Icons';

function useCountUp(target, duration = 1100) {
  const [val, setVal] = useState(0);
  const raf = useRef();
  useEffect(() => {
    if (typeof target !== 'number') return;
    const start = Date.now();
    const tick = () => {
      const p = Math.min((Date.now() - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(target * ease));
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [target, duration]);
  return val;
}

const ICON_BG = {
  'var(--accent)':   'var(--accent-light)',
  'var(--success)':  'var(--success-light)',
  'var(--danger)':   'var(--danger-light)',
  'var(--accent3)':  'var(--accent3-light)',
  'var(--accent2)':  'var(--accent2-light)',
  'var(--warn)':     'var(--warn-light)',
};

export default function StatCard({ iconName, label, value, sub, color = 'var(--accent)', delay = 0 }) {
  const numValue = typeof value === 'number' ? value : null;
  const counted = useCountUp(numValue ?? 0);
  const bg = ICON_BG[color] || 'var(--accent-light)';

  return (
    <div className="stat-card fade-up" style={{ animationDelay: `${delay}s` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
        <div style={{
          width: '40px', height: '40px', borderRadius: '10px',
          background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon name={iconName || 'zap'} size={18} color={color} />
        </div>
        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: color, opacity: 0.4, marginTop: '6px' }} />
      </div>
      <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '30px', fontWeight: 800, color: 'var(--text)', lineHeight: 1, marginBottom: '5px' }}>
        {numValue !== null ? counted : (value ?? '—')}
      </div>
      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--muted)', marginBottom: '2px', fontFamily: 'Syne, sans-serif' }}>
        {label}
      </div>
      {sub && <div style={{ fontSize: '11.5px', color: 'var(--muted2)', fontFamily: 'DM Mono, monospace' }}>{sub}</div>}
    </div>
  );
}
