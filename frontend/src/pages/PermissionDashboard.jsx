import React, { useEffect, useState, useCallback } from 'react';
import { Plus, Eye, X, Check, Clock, ChevronLeft, ChevronRight, CheckCircle2, XCircle, Filter } from 'lucide-react';
import TopBar from '../components/TopBar';
import PermissionModal from '../components/PermissionModal';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function PermissionDashboard() {
  const { user, adminSearch } = useAuth();
  const isAdmin = user?.role === 'admin' || user?.role === 'coordinator';
  const isStudent = user?.role === 'student';

  const [activeTab, setActiveTab] = useState(isStudent ? 'My Requests' : 'All Requests');
  const [statusFilter, setStatusFilter] = useState('all');
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState(null);
  const [page, setPage] = useState(1);
  const [actionLoading, setActionLoading] = useState(false);
  const PER_PAGE = 8;

  const fetchPermissions = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/permissions');
      setPermissions(data.permissions || []);
    } catch (_) {
      setPermissions([]);
      toast.error('Unable to load permission requests right now.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPermissions(); }, [fetchPermissions]);

  const searchQuery = (adminSearch || '').trim().toLowerCase();

  const filteredPermissions = permissions.filter((p) => {
    // Tab filter for student
    if (isStudent && activeTab === 'My Requests') {
      const matchUser = p.user === user?._id || p.user?._id === user?._id || p.memberEmail === user?.email || p.memberId === user?.memberId;
      if (!matchUser && permissions.length > 0 && p.memberEmail && user?.email) {
        return false;
      }
    }

    // Status filter dropdown
    if (statusFilter !== 'all' && p.status !== statusFilter) {
      return false;
    }

    // Search query
    if (!searchQuery) return true;
    const haystack = [p.memberName, p.memberId, p.role, p.permissionType, p.status, p._id].filter(Boolean).join(' ').toLowerCase();
    return haystack.includes(searchQuery);
  });

  const counts = {
    pending: permissions.filter((p) => p.status === 'pending').length,
    approved: permissions.filter((p) => p.status === 'approved').length,
    rejected: permissions.filter((p) => p.status === 'rejected').length,
    total: permissions.length,
  };

  const paginated = filteredPermissions.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const totalPages = Math.ceil(filteredPermissions.length / PER_PAGE);

  const formatDateRange = (from, to) => {
    const f = from ? new Date(from).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '–';
    const t = to ? new Date(to).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '–';
    return `${f} – ${t}`;
  };

  const handleReview = async (id, newStatus) => {
    setActionLoading(true);
    try {
      await api.put(`/permissions/${id}/status`, { status: newStatus });
      toast.success(`Request marked as ${newStatus}`);
      setSelected(null);
      fetchPermissions();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update request');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <>
      <TopBar title="Permission Dashboard" hideSearch />
      <div className="page-content">

        {/* HEADER CONTROLS */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 16,
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          {/* STUDENT VIEW: Tabs for My Requests */}
          {isStudent ? (
            <div
              className="permission-tabs"
              style={{
                marginBottom: 0,
                borderBottom: 'none'
              }}
            >
              <button
                className={`p-tab ${activeTab === 'My Requests' ? 'active' : ''}`}
                onClick={() => setActiveTab('My Requests')}
              >
                My Requests
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
                Permission Requests Management
              </span>
            </div>
          )}

          {/* RIGHT SIDE CONTROLS: Status Dropdown & New Request for Student */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginLeft: 'auto', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Filter size={14} style={{ color: 'var(--text-muted)' }} />
              <select
                className="form-input"
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                style={{
                  padding: '7px 12px',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  minWidth: 170,
                }}
              >
                <option value="all">All Requests ({counts.total})</option>
                <option value="pending">Pending ({counts.pending})</option>
                <option value="approved">Approved ({counts.approved})</option>
                <option value="rejected">Rejected ({counts.rejected})</option>
              </select>
            </div>

            {/* ONLY STUDENT SEES NEW REQUEST BUTTON */}
            {isStudent && (
              <button
                className="btn btn-primary"
                onClick={() => setShowForm(true)}
              >
                <Plus size={15} /> New Request
              </button>
            )}
          </div>
        </div>

        {/* STATS CARDS */}
        <div className="permission-stats">
          {[
            {
              key: 'pending',
              label: 'Pending',
              val: counts.pending,
              color: 'orange'
            },
            {
              key: 'approved',
              label: 'Approved',
              val: counts.approved,
              color: 'green'
            },
            {
              key: 'rejected',
              label: 'Rejected',
              val: counts.rejected,
              color: 'red'
            },
            {
              key: 'all',
              label: 'Total Requested',
              val: counts.total,
              color: 'blue'
            },
          ].map((s) => (
            <div
              key={s.label}
              className={`p-stat-card ${statusFilter === s.key ? 'active' : ''}`}
              onClick={() => { setStatusFilter(s.key); setPage(1); }}
              style={{
                cursor: 'pointer',
                border: statusFilter === s.key ? '2px solid var(--primary)' : undefined,
                transition: 'all 0.15s ease',
              }}
              title={`Filter by ${s.label}`}
            >
              <div className={`p-stat-icon ${s.color}`}>
                {s.color === 'orange'
                  ? <Clock size={18} />
                  : s.color === 'green'
                  ? <Check size={18} />
                  : s.color === 'red'
                  ? <X size={18} />
                  : <Eye size={18} />
                }
              </div>
              <div>
                <div className="p-stat-val">{s.val}</div>
                <div className="p-stat-label">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="card">

          <div className="table-wrap">

            {loading ? (

              <div className="loading-state">
                <div className="spinner" />
                <p>Loading requests…</p>
              </div>

            ) : paginated.length === 0 ? (

              <div className="empty-state">

                <Clock size={40} />

                <h3>
                  No permission requests
                </h3>

                <p>
                  Submit a new request using the button above.
                </p>

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

                  {paginated.map((p) => (

                    <tr key={p._id}>

                      <td
                        style={{
                          fontFamily: 'monospace',
                          fontSize: 12,
                          color: 'var(--primary)',
                          fontWeight: 600
                        }}
                      >
                        PER-
                        {String(p._id)
                          .slice(-4)
                          .toUpperCase()}
                      </td>

                      <td style={{ fontWeight: 600 }}>
                        {p.memberName}
                      </td>

                      <td>
                        <span
                          style={{
                            fontSize: 12,
                            color: 'var(--text-secondary)'
                          }}
                        >
                          {p.role}
                        </span>
                      </td>

                      <td style={{ fontSize: 12 }}>
                        {formatDateRange(
                          p.fromDate,
                          p.toDate
                        )}
                      </td>

                      <td
                        style={{
                          fontSize: 12,
                          color: 'var(--text-muted)',
                          maxWidth: 160,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {p.permissionType}
                      </td>

                      <td>
                        <span
                          className={`badge badge-${p.status}`}
                        >
                          {p.status}
                        </span>
                      </td>

                      <td>

                        <div
                          style={{
                            display: 'flex',
                            gap: 6
                          }}
                        >

                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => setSelected(p)}
                            title="View Details"
                            style={{ color: 'var(--primary)' }}
                          >
                            <Eye size={14} />
                          </button>

                          {isAdmin && p.status === 'pending' && (
                            <>
                              <button
                                className="btn btn-ghost btn-sm"
                                style={{ color: '#16a34a' }}
                                onClick={() => handleReview(p._id, 'approved')}
                                title="Approve Request"
                                disabled={actionLoading}
                              >
                                <CheckCircle2 size={15} />
                              </button>
                              <button
                                className="btn btn-ghost btn-sm"
                                style={{ color: '#dc2626' }}
                                onClick={() => handleReview(p._id, 'rejected')}
                                title="Reject Request"
                                disabled={actionLoading}
                              >
                                <XCircle size={15} />
                              </button>
                            </>
                          )}

                        </div>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            )}

          </div>

          {totalPages > 1 && (

            <div className="pagination">

              <button
                className="page-num"
                onClick={() =>
                  setPage((p) =>
                    Math.max(1, p - 1)
                  )
                }
                disabled={page === 1}
              >
                <ChevronLeft size={14} />
              </button>

              {Array.from(
                {
                  length: totalPages
                },
                (_, i) => i + 1
              ).map((n) => (

                <button
                  key={n}
                  className={`page-num ${
                    page === n ? 'active' : ''
                  }`}
                  onClick={() => setPage(n)}
                >
                  {n}
                </button>

              ))}

              <button
                className="page-num"
                onClick={() =>
                  setPage((p) =>
                    Math.min(
                      totalPages,
                      p + 1
                    )
                  )
                }
                disabled={page === totalPages}
              >
                <ChevronRight size={14} />
              </button>

            </div>

          )}

        </div>

      </div>

      {showForm && (
        <PermissionModal
          onClose={() => setShowForm(false)}
          onSuccess={fetchPermissions}
        />
      )}

      {selected && (

        <div
          className="modal-overlay"
          onClick={(e) =>
            e.target === e.currentTarget &&
            setSelected(null)
          }
        >

          <div
            className="modal"
            style={{ maxWidth: 560 }}
          >

            <div className="modal-header">

              <div>

                <div className="modal-title">
                  Permission Request Details
                </div>

                <div className="modal-subtitle">
                  PER-
                  {String(selected._id)
                    .slice(-4)
                    .toUpperCase()}
                </div>

              </div>

              <button
                className="modal-close"
                onClick={() =>
                  setSelected(null)
                }
              >
                <X size={18} />
              </button>

            </div>

            <div className="modal-body">

              {[
                ['Member Name', selected.memberName],
                ['Member ID', selected.memberId || '–'],
                ['Email', selected.memberEmail || '–'],
                ['Role', selected.role],
                [
                  'From – To',
                  `${formatDateRange(
                    selected.fromDate,
                    selected.toDate
                  )}`
                ],
                [
                  'Permission Type',
                  selected.permissionType
                ],
                [
                  'Duration',
                  selected.durationType?.replace(
                    '_',
                    ' '
                  )
                ],
                ['Reason', selected.reason],
                ['Status', selected.status],
                selected.adminComment ? ['Admin Comment', selected.adminComment] : null,
              ].filter(Boolean).map(([k, v]) => (

                <div
                  key={k}
                  style={{
                    display: 'flex',
                    gap: 12,
                    marginBottom: 12
                  }}
                >

                  <div
                    style={{
                      width: 140,
                      fontSize: 12,
                      fontWeight: 600,
                      color: 'var(--text-muted)',
                      flexShrink: 0
                    }}
                  >
                    {k}
                  </div>

                  <div
                    style={{
                      fontSize: 13,
                      color: 'var(--text-primary)'
                    }}
                  >

                    {k === 'Status'
                      ? (
                        <span
                          className={`badge badge-${v}`}
                        >
                          {v}
                        </span>
                      )
                      : v
                    }

                  </div>

                </div>

              ))}

            </div>

            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>

              <button
                className="btn btn-outline"
                onClick={() =>
                  setSelected(null)
                }
              >
                Close
              </button>

              {isAdmin && selected.status === 'pending' && (
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    className="btn btn-danger btn-sm"
                    disabled={actionLoading}
                    onClick={() => handleReview(selected._id, 'rejected')}
                  >
                    <XCircle size={14} /> Reject
                  </button>
                  <button
                    className="btn btn-success btn-sm"
                    disabled={actionLoading}
                    onClick={() => handleReview(selected._id, 'approved')}
                  >
                    <CheckCircle2 size={14} /> Approve
                  </button>
                </div>
              )}

            </div>

          </div>

        </div>

      )}

    </>
  );
}