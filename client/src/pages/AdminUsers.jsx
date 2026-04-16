import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { ConfirmModal } from '../components/Modal';
import { Icon } from '../components/Icons';

function AddCreditsForm({ onSuccess }) {
  const [form, setForm] = useState({ userId: '', amount: '' });
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.userId || !form.amount) return;
    setLoading(true);
    try {
      const { data } = await api.post('/admin/credits', { userId: Number(form.userId), amount: Number(form.amount) });
      toast(`Credits added. New balance: ${data.newBalance}`, 'success');
      setForm({ userId: '', amount: '' });
      onSuccess();
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to add credits', 'error');
    }
    setLoading(false);
  };

  return (
    <div className="card fade-up delay-1" style={{ padding: '22px', marginBottom: '20px' }}>
      <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '15px', margin: '0 0 16px', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Icon name="credit" size={15} color="var(--accent3)" />
        Add Credits to User
      </h3>
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--muted)', marginBottom: '6px', fontFamily: 'Syne, sans-serif', textTransform: 'uppercase', letterSpacing: '0.09em' }}>User ID</label>
          <div className="inp-icon-wrap">
            <span className="icon-left"><Icon name="user" size={13} /></span>
            <input className="inp" style={{ width: '140px' }} placeholder="123" value={form.userId}
              onChange={e => setForm({ ...form, userId: e.target.value })} required />
          </div>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--muted)', marginBottom: '6px', fontFamily: 'Syne, sans-serif', textTransform: 'uppercase', letterSpacing: '0.09em' }}>Amount</label>
          <div className="inp-icon-wrap">
            <span className="icon-left"><Icon name="plus" size={13} /></span>
            <input className="inp" style={{ width: '140px' }} placeholder="100" type="number" min="1"
              value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} required />
          </div>
        </div>
        <button className="btn btn-success" type="submit" disabled={loading} style={{ height: '42px', gap: '7px' }}>
          {loading ? <span className="spinner spinner-dark" /> : <Icon name="plus" size={14} color="var(--success)" />}
          Add Credits
        </button>
      </form>
    </div>
  );
}

export default function AdminUsers() {
  const [data, setData] = useState({ users: [], total: 0, pages: 1 });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [confirmAction, setConfirmAction] = useState(null); // { userId, status, name }
  const [actionLoading, setActionLoading] = useState(false);
  const toast = useToast();

  const fetchUsers = async (p = 1) => {
    setLoading(true);
    try {
      const { data: d } = await api.get(`/admin/users?page=${p}&limit=15`);
      setData(d); setPage(p);
    } catch { toast('Failed to load users', 'error'); }
    setLoading(false);
  };

  useEffect(() => { fetchUsers(1); }, []);

  const handleStatusConfirm = async () => {
    if (!confirmAction) return;
    setActionLoading(true);
    try {
      await api.post('/admin/user-status', { userId: confirmAction.userId, status: confirmAction.status });
      toast(`User ${confirmAction.status === 'suspended' ? 'suspended' : 'reactivated'} successfully`, 'success');
      setConfirmAction(null);
      fetchUsers(page);
    } catch (err) {
      toast(err.response?.data?.message || 'Action failed', 'error');
    }
    setActionLoading(false);
  };

  const filtered = data.users.filter(u =>
    !search || u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div style={{ marginBottom: '28px' }} className="fade-up">
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '28px', margin: 0, letterSpacing: '-0.5px', color: 'var(--text)' }}>
          Users
        </h1>
        <p style={{ color: 'var(--muted)', margin: '5px 0 0', fontSize: '14px' }}>{data.total} registered users</p>
      </div>

      <AddCreditsForm onSuccess={() => fetchUsers(page)} />

      <div className="card fade-up delay-2" style={{ padding: '22px' }}>
        {/* Search bar */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '18px', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: '320px' }}>
            <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', display: 'flex', pointerEvents: 'none' }}>
              <Icon name="search" size={14} color="var(--muted2)" />
            </span>
            <input className="inp" placeholder="Search name or email…" value={search}
              onChange={e => setSearch(e.target.value)} style={{ paddingLeft: '38px' }} />
          </div>
          <button className="btn btn-ghost" onClick={() => fetchUsers(page)} style={{ padding: '8px 14px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Icon name="refresh" size={13} color="var(--muted)" /> Refresh
          </button>
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[1,2,3,4,5].map(i => <div key={i} className="skeleton" style={{ height: '46px' }} />)}
          </div>
        ) : (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table className="tbl">
                <thead>
                  <tr><th>ID</th><th>Name</th><th>Email</th><th>Role</th><th>Credits</th><th>Status</th><th>Joined</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {filtered.map((u, i) => (
                    <tr key={u.id} style={{ animation: `fade-up 0.28s ${i * 0.03}s both` }}>
                      <td style={{ fontFamily: 'DM Mono, monospace', fontSize: '11.5px', color: 'var(--muted2)' }}>{u.id}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '28px', height: '28px', borderRadius: '7px', background: 'linear-gradient(135deg, var(--accent), var(--accent2))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '10px', color: 'white', flexShrink: 0 }}>
                            {u.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
                          </div>
                          <span style={{ fontWeight: 600, color: 'var(--text)', fontSize: '13px' }}>{u.name}</span>
                        </div>
                      </td>
                      <td style={{ fontFamily: 'DM Mono, monospace', fontSize: '12px' }}>{u.email}</td>
                      <td><span className={`badge ${u.role === 'admin' ? 'badge-warn' : 'badge-muted'}`}>{u.role}</span></td>
                      <td>
                        <span style={{ fontFamily: 'DM Mono, monospace', color: 'var(--accent3)', fontWeight: 600, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <Icon name="credit" size={12} color="var(--accent3)" />
                          {u.credits}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${u.status === 'active' ? 'badge-success' : 'badge-danger'}`}>
                          {u.status === 'active' ? <Icon name="check" size={10} strokeWidth={2.5} /> : <Icon name="x" size={10} strokeWidth={2.5} />}
                          {u.status}
                        </span>
                      </td>
                      <td style={{ fontFamily: 'DM Mono, monospace', fontSize: '11.5px' }}>{new Date(u.created_at).toLocaleDateString()}</td>
                      <td>
                        {u.status === 'active' ? (
                          <button className="btn btn-danger" style={{ fontSize: '12px', padding: '5px 11px', gap: '5px' }}
                            onClick={() => setConfirmAction({ userId: u.id, status: 'suspended', name: u.name })}>
                            <Icon name="x" size={12} color="var(--danger)" /> Suspend
                          </button>
                        ) : (
                          <button className="btn btn-success" style={{ fontSize: '12px', padding: '5px 11px', gap: '5px' }}
                            onClick={() => setConfirmAction({ userId: u.id, status: 'active', name: u.name })}>
                            <Icon name="check" size={12} color="var(--success)" strokeWidth={2.5} /> Reactivate
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {data.pages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '20px', alignItems: 'center' }}>
                <button className="btn btn-ghost" onClick={() => fetchUsers(page - 1)} disabled={page <= 1} style={{ padding: '7px 16px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Icon name="arrow_right" size={13} style={{ transform: 'rotate(180deg)' }} /> Prev
                </button>
                <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '13px', color: 'var(--muted)', padding: '0 8px' }}>{page} / {data.pages}</span>
                <button className="btn btn-ghost" onClick={() => fetchUsers(page + 1)} disabled={page >= data.pages} style={{ padding: '7px 16px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  Next <Icon name="arrow_right" size={13} />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <ConfirmModal
        open={!!confirmAction}
        onClose={() => setConfirmAction(null)}
        onConfirm={handleStatusConfirm}
        title={confirmAction?.status === 'suspended' ? 'Suspend user?' : 'Reactivate user?'}
        message={`Are you sure you want to ${confirmAction?.status === 'suspended' ? 'suspend' : 'reactivate'} ${confirmAction?.name}? ${confirmAction?.status === 'suspended' ? 'They will lose access to the platform.' : 'They will regain access to the platform.'}`}
        confirmLabel={confirmAction?.status === 'suspended' ? 'Suspend' : 'Reactivate'}
        danger={confirmAction?.status === 'suspended'}
        loading={actionLoading}
      />
    </div>
  );
}
