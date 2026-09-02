import React, { useEffect, useState, useCallback } from 'react';
import { Plus, Eye, X, Check, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import TopBar from '../components/TopBar';
import PermissionModal from '../components/PermissionModal';
import api from '../api/axios';
import toast from 'react-hot-toast';

const TABS = ['All Requests', 'My Requests'];

export default function PermissionPortal() {
  const [activeTab, setActiveTab] = useState('All Requests');
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState(null); // detail modal
  const [page, setPage] = useState(1);
  const PER_PAGE = 8;

  const fetchPermissions = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/permissions');
      setPermissions(data.permissions || []);
    } catch (_) {
      setPermissions([]);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchPermissions(); }, [fetchPermissions]);

  const counts = {
    pending: permissions.filter(p => p.status === 'pending').length,
    approved: permissions.filter(p => p.status === 'approved').length,
    rejected: permissions.filter(p => p.status === 'rejected').length,
    total: permissions.length,
  };

  const paginated = permissions.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const totalPages = Math.ceil(permissions.length / PER_PAGE);

  const formatDateRange = (from, to) => {
    const f = from ? new Date(from).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '–';
    const t = to ? new Date(to).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '–';
    return `${f} – ${t}`;
  };

  return (
    <>
      <TopBar title="Permission Portal" hideSearch />
      <div className="page-content">
        {/* Tabs + New Request */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div className="permission-tabs" style={{ marginBottom: 0, borderBottom: 'none' }}>
            {TABS.map(t => (
              <button key={t} className={`p-tab ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)}>
                {t}
              </button>
            ))}
          </div>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            <Plus size={15} /> New Request
          </button>
        </div>

        {/* Stats */}
        <div className="permission-stats">
          {[
            { label: 'Pending', val: counts.pending, color: 'orange' },
            { label: 'Approved', val: counts.approved, color: 'green' },
            { label: 'Rejected', val: counts.rejected, color: 'red' },
            { label: 'Total Requests', val: counts.total, color: 'blue' },
          ].map(s => (
            <div key={s.label} className="p-stat-card">
              <div className={`p-stat-icon ${s.color}`}>
                {s.color === 'orange' ? <Clock size={18} /> : s.color === 'green' ? <Check size={18} /> : s.color === 'red' ? <X size={18} /> : <Eye size={18} />}
              </div>
              <div>
                <div className="p-stat-val">{s.val}</div>
                <div className="p-stat-label">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="card">
          <div className="table-wrap">
            {loading ? (
              <div className="loading-state"><div className="spinner" /><p>Loading requests…</p></div>
            ) : paginated.length === 0 ? (
              <div className="empty-state">
                <Clock size={40} />
                <h3>No permission requests</h3>
                <p>Submit a new request using the button above</p>
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Request ID</th>
                    <th>Name</th>
                    <th>Role</th>
                    <th>From – To</th>
                    <th>Reason</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map(p => (
                    <tr key={p._id}>
                      <td style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--primary)', fontWeight: 600 }}>
                        PER-{String(p._id).slice(-4).toUpperCase()}
                      </td>
                      <td style={{ fontWeight: 600 }}>{p.memberName}</td>
                      <td><span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{p.role}</span></td>
                      <td style={{ fontSize: 12 }}>{formatDateRange(p.fromDate, p.toDate)}</td>
                      <td style={{ fontSize: 12, color: 'var(--text-muted)', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.permissionType}</td>
                      <td><span className={`badge badge-${p.status}`}>{p.status}</span></td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn btn-ghost btn-sm" onClick={() => setSelected(p)} title="View Details">
                            <Eye size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button className="page-num" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                <ChevronLeft size={14} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                <button key={n} className={`page-num ${page === n ? 'active' : ''}`} onClick={() => setPage(n)}>{n}</button>
              ))}
              <button className="page-num" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                <ChevronRight size={14} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* New Request Form Modal */}
      {showForm && <PermissionModal onClose={() => setShowForm(false)} onSuccess={fetchPermissions} />}

      {/* Detail Modal */}
      {selected && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setSelected(null)}>
          <div className="modal" style={{ maxWidth: 520 }}>
            <div className="modal-header">
              <div>
                <div className="modal-title">Permission Request</div>
                <div className="modal-subtitle">PER-{String(selected._id).slice(-4).toUpperCase()}</div>
              </div>
              <button className="modal-close" onClick={() => setSelected(null)}><X size={18} /></button>
            </div>
            <div className="modal-body">
              {[
                ['Name', selected.memberName],
                ['Role', selected.role],
                ['From – To', `${formatDateRange(selected.fromDate, selected.toDate)}`],
                ['Permission Type', selected.permissionType],
                ['Duration', selected.durationType?.replace('_', ' ')],
                ['Reason', selected.reason],
                ['Status', selected.status],
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                  <div style={{ width: 140, fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', flexShrink: 0 }}>{k}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-primary)' }}>
                    {k === 'Status' ? <span className={`badge badge-${v}`}>{v}</span> : v}
                  </div>
                </div>
              ))}
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setSelected(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
