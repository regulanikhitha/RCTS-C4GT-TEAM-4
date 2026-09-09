import React, { useCallback, useEffect, useState } from 'react';
import {
  Plus,
  Eye,
  X,
  Check,
  Clock,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Filter,
  Bell,
  FileText,
} from 'lucide-react';

import TopBar from '../components/TopBar';
import PermissionModal from '../components/PermissionModal';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

export default function PermissionDashboard() {
  const { user, adminSearch } = useAuth();

  const isStudent = user?.role === 'student';
  const canReview = user?.role === 'coordinator';

  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [actionLoading, setActionLoading] = useState(false);
  const [showPendingPopup, setShowPendingPopup] = useState(false);
  const [pendingPopupShown, setPendingPopupShown] = useState(false);

  const PER_PAGE = 8;

  // --------------------------------------------------
  // FETCH
  // --------------------------------------------------

  const fetchPermissions = useCallback(async () => {
    setLoading(true);

    try {
      const { data } = await api.get('/permissions');
      setPermissions(data.permissions || []);
    } catch (error) {
      console.error(error);
      setPermissions([]);
      toast.error('Unable to load permission requests.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  // --------------------------------------------------
  // STATUS
  // ONLY COORDINATOR STATUS IS DISPLAYED
  // --------------------------------------------------

  const getCoordinatorStatus = (permission) =>
    permission?.coordinatorStatus || 'pending';

  const getStatusLabel = (status) => {
    if (status === 'approved') return <><CheckCircle2 size={14} /> Approved</>;
    if (status === 'rejected') return <><XCircle size={14} /> Rejected</>;
    return <><Clock size={14} /> Pending</>;
  };

  const needsReview = (permission) =>
    canReview &&
    getCoordinatorStatus(permission) === 'pending';

  // --------------------------------------------------
  // PENDING POPUP
  // COORDINATOR ONLY
  // --------------------------------------------------

  const pendingPermissions = permissions.filter(needsReview);

  useEffect(() => {
    if (
      canReview &&
      !pendingPopupShown &&
      pendingPermissions.length > 0
    ) {
      setShowPendingPopup(true);
      setPendingPopupShown(true);
    }
  }, [
    canReview,
    pendingPermissions.length,
    pendingPopupShown,
  ]);

  // --------------------------------------------------
  // SEARCH + FILTER
  // --------------------------------------------------

  const search = (adminSearch || '').trim().toLowerCase();

  const filteredPermissions = permissions.filter((p) => {
    // Student sees only own requests
    if (isStudent) {
      const ownRequest =
        p.user === user?._id ||
        p.user?._id === user?._id ||
        p.memberEmail === user?.email ||
        p.memberId === user?.memberId;

      if (!ownRequest) return false;
    }

    const coordinatorStatus = getCoordinatorStatus(p);

    if (
      statusFilter !== 'all' &&
      coordinatorStatus !== statusFilter
    ) {
      return false;
    }

    if (!search) return true;

    return [
      p.memberName,
      p.memberId,
      p.role,
      p.permissionType,
      coordinatorStatus,
      p._id,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
      .includes(search);
  });

  // --------------------------------------------------
  // COUNTS
  // BASED ONLY ON COORDINATOR STATUS
  // --------------------------------------------------

  const counts = {
    pending: permissions.filter(
      (p) => getCoordinatorStatus(p) === 'pending'
    ).length,

    approved: permissions.filter(
      (p) => getCoordinatorStatus(p) === 'approved'
    ).length,

    rejected: permissions.filter(
      (p) => getCoordinatorStatus(p) === 'rejected'
    ).length,

    total: permissions.length,
  };

  const paginated = filteredPermissions.slice(
    (page - 1) * PER_PAGE,
    page * PER_PAGE
  );

  const totalPages = Math.ceil(
    filteredPermissions.length / PER_PAGE
  );

  // --------------------------------------------------
  // DATE
  // --------------------------------------------------

  const formatDateRange = (from, to) => {
    const format = (date) =>
      date
        ? new Date(date).toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })
        : '–';

    return `${format(from)} – ${format(to)}`;
  };

  // --------------------------------------------------
  // APPROVE / REJECT
  // COORDINATOR ONLY
  // --------------------------------------------------

  const handleReview = async (id, status) => {
    if (
      actionLoading ||
      user?.role !== 'coordinator'
    ) {
      return;
    }

    setActionLoading(true);

    try {
      await api.put(`/permissions/${id}`, {
        status,
        adminComment:
          status === 'approved'
            ? 'Permission approved by coordinator.'
            : 'Permission rejected by coordinator.',
      });

      toast.success(
        status === 'approved'
          ? 'Permission approved!'
          : 'Permission rejected!'
      );

      setSelected(null);
      setShowPendingPopup(false);

      await fetchPermissions();
    } catch (error) {
      console.error(error);

      toast.error(
        error.response?.data?.message ||
        'Failed to update permission.'
      );
    } finally {
      setActionLoading(false);
    }
  };

  // --------------------------------------------------
  // VIEW UPLOADED DOCUMENT
  // --------------------------------------------------

  const handleViewAttachment = async (id) => {
    try {
      const response = await api.get(
        `/permissions/${id}/attachment`,
        { responseType: 'blob' }
      );

      const url = URL.createObjectURL(response.data);
      window.open(url, '_blank');

      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
        'Unable to open document.'
      );
    }
  };

  // --------------------------------------------------
  // VIEW GENERATED PDF
  // --------------------------------------------------

  const handleViewPermissionPDF = async (id) => {
    try {
      const response = await api.get(
        `/permissions/${id}/pdf`,
        { responseType: 'blob' }
      );

      const blob = new Blob([response.data], {
        type: 'application/pdf',
      });

      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');

      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
        'Unable to open permission PDF.'
      );
    }
  };

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <>
      <TopBar
        title="Permission Dashboard"
        hideSearch
      />

      <div className="page-content">

        {/* HEADER */}

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 12,
            marginBottom: 16,
            flexWrap: 'wrap',
          }}
        >
          <div>
            <strong style={{ fontSize: 15 }}>
              {isStudent
                ? 'My Permission Requests'
                : 'Permission Requests Management'}
            </strong>
          </div>

          <div
            style={{
              display: 'flex',
              gap: 10,
              alignItems: 'center',
            }}
          >
            <Filter
              size={14}
              style={{ color: 'var(--text-muted)' }}
            />

            <Select value={statusFilter} onValueChange={(value) => { setStatusFilter(value); setPage(1); }}>
              <SelectTrigger className="form-input" style={{
                padding: '7px 12px',
                borderRadius: 8,
                minWidth: 160,
              }}><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Requests ({counts.total})</SelectItem>
                <SelectItem value="pending">Pending ({counts.pending})</SelectItem>
                <SelectItem value="approved">Approved ({counts.approved})</SelectItem>
                <SelectItem value="rejected">Rejected ({counts.rejected})</SelectItem>
              </SelectContent>
            </Select>

            {isStudent && (
              <Button
                className="btn btn-primary"
                onClick={() => setShowForm(true)}
              >
                <Plus size={15} />
                New Request
              </Button>
            )}
          </div>
        </div>

        {/* STATS */}

        <div className="permission-stats">
          {[
            ['pending', 'Pending', counts.pending, 'orange'],
            ['approved', 'Approved', counts.approved, 'green'],
            ['rejected', 'Rejected', counts.rejected, 'red'],
            ['all', 'Total Requested', counts.total, 'blue'],
          ].map(([key, label, value, color]) => (
            <div
              key={key}
              className={`p-stat-card ${statusFilter === key ? 'active' : ''
                }`}
              onClick={() => {
                setStatusFilter(key);
                setPage(1);
              }}
              style={{ cursor: 'pointer' }}
            >
              <div className={`p-stat-icon ${color}`}>
                {color === 'orange' && <Clock size={18} />}
                {color === 'green' && <Check size={18} />}
                {color === 'red' && <X size={18} />}
                {color === 'blue' && <Eye size={18} />}
              </div>

              <div>
                <div className="p-stat-val">
                  {value}
                </div>
                <div className="p-stat-label">
                  {label}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* TABLE */}

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
                <h3>No permission requests</h3>
                <p>No requests found.</p>
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
                    <th>Review Status</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {paginated.map((p) => {
                    const status =
                      getCoordinatorStatus(p);

                    return (
                      <tr key={p._id}>
                        <td
                          style={{
                            fontFamily: 'monospace',
                            fontSize: 12,
                            color: 'var(--primary)',
                            fontWeight: 600,
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
                              color:
                                'var(--text-secondary)',
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
                          }}
                        >
                          {p.permissionType}
                        </td>

                        {/* ONLY COORDINATOR STATUS */}

                        <td>
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 8,
                            }}
                          >
                            <strong
                              style={{ fontSize: 12 }}
                            >
                              Coordinator
                            </strong>

                            <Badge
                              className={`badge badge-${status}`}
                            >
                              {getStatusLabel(status)}
                            </Badge>
                          </div>
                        </td>

                        {/* ACTION */}

                        <td>
                          <div
                            style={{
                              display: 'flex',
                              gap: 8,
                              alignItems: 'center',
                              flexWrap: 'wrap',
                            }}
                          >
                            {/* EVERYONE CAN VIEW */}

                            <Button variant="ghost"
                              className="btn btn-ghost btn-sm"
                              onClick={() =>
                                setSelected(p)
                              }
                              title="View Request"
                              style={{
                                color:
                                  'var(--primary)',
                              }}
                            >
                              <Eye size={14} />
                            </Button>

                            {/* COORDINATOR ONLY */}

                            {needsReview(p) && (
                              <>
                                <Button
                                  className="btn btn-danger"
                                  disabled={actionLoading}
                                  onClick={() =>
                                    handleReview(
                                      p._id,
                                      'rejected'
                                    )
                                  }
                                >
                                  <XCircle size={15} />
                                  Reject
                                </Button>

                                <Button
                                  className="btn btn-success"
                                  disabled={actionLoading}
                                  onClick={() =>
                                    handleReview(
                                      p._id,
                                      'approved'
                                    )
                                  }
                                >
                                  <CheckCircle2
                                    size={15}
                                  />
                                  Approve
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* PAGINATION */}

          {totalPages > 1 && (
            <div className="pagination">
              <Button variant="ghost"
                className="page-num"
                disabled={page === 1}
                onClick={() =>
                  setPage((p) => Math.max(1, p - 1))
                }
              >
                <ChevronLeft size={14} />
              </Button>

              {Array.from(
                { length: totalPages },
                (_, i) => i + 1
              ).map((n) => (
                <Button variant="ghost"
                  key={n}
                  className={`page-num ${page === n ? 'active' : ''
                    }`}
                  onClick={() => setPage(n)}
                >
                  {n}
                </Button>
              ))}

              <Button variant="ghost"
                className="page-num"
                disabled={page === totalPages}
                onClick={() =>
                  setPage((p) =>
                    Math.min(totalPages, p + 1)
                  )
                }
              >
                <ChevronRight size={14} />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* STUDENT NEW REQUEST */}

      {showForm && (
        <PermissionModal
          onClose={() => setShowForm(false)}
          onSuccess={fetchPermissions}
        />
      )}

      {/* REQUEST DETAILS */}

      {selected && (
        <div
          className="modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setSelected(null);
            }
          }}
        >
          <div
            className="modal"
            style={{ maxWidth: 600 }}
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

              <Button variant="ghost" size="icon"
                className="modal-close"
                onClick={() => setSelected(null)}
              >
                <X size={18} />
              </Button>
            </div>

            <div className="modal-body">
              {[
                ['Member Name', selected.memberName],
                ['Member ID', selected.memberId || '–'],
                ['Email', selected.memberEmail || '–'],
                ['Role', selected.role],
                [
                  'From – To',
                  formatDateRange(
                    selected.fromDate,
                    selected.toDate
                  ),
                ],
                [
                  'Permission Type',
                  selected.permissionType,
                ],
                [
                  'Duration',
                  selected.durationType?.replace(
                    '_',
                    ' '
                  ),
                ],
                ['Reason', selected.reason],
                [
                  'Coordinator Status',
                  getCoordinatorStatus(selected),
                ],
              ].map(([label, value]) => (
                <div
                  key={label}
                  style={{
                    display: 'flex',
                    gap: 12,
                    marginBottom: 12,
                  }}
                >
                  <div
                    style={{
                      width: 150,
                      fontSize: 12,
                      fontWeight: 600,
                      color: 'var(--text-muted)',
                    }}
                  >
                    {label}
                  </div>

                  <div
                    style={{
                      fontSize: 13,
                      color: 'var(--text-primary)',
                    }}
                  >
                    {label === 'Coordinator Status' ? (
                      <span
                        className={`badge badge-${value}`}
                      >
                        {getStatusLabel(value)}
                      </span>
                    ) : (
                      value
                    )}
                  </div>
                </div>
              ))}

              {/* UPLOADED DOCUMENT */}

              <div
                style={{
                  marginTop: 15,
                  padding: 14,
                  borderRadius: 10,
                  background:
                    'var(--bg-secondary)',
                  border:
                    '1px solid var(--border)',
                }}
              >
                <strong
                  style={{
                    fontSize: 12,
                    color: 'var(--text-muted)',
                  }}
                >
                  SUPPORTING DOCUMENT
                </strong>

                {selected.attachment?.fileName ? (
                  <div
                    style={{
                      display: 'flex',
                      justifyContent:
                        'space-between',
                      alignItems: 'center',
                      gap: 10,
                      marginTop: 10,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 13,
                        overflow: 'hidden',
                        textOverflow:
                          'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      <FileText size={15} />{' '}
                      {selected.attachment
                        .originalName ||
                        selected.attachment.fileName}
                    </span>

                    <Button
                      className="btn btn-outline"
                      onClick={() =>
                        handleViewAttachment(
                          selected._id
                        )
                      }
                    >
                      <Eye size={15} />
                      View Document
                    </Button>
                  </div>
                ) : (
                  <p
                    style={{
                      fontSize: 12,
                      color: 'var(--text-muted)',
                    }}
                  >
                    No supporting document uploaded.
                  </p>
                )}
              </div>

              {/* GENERATED PDF */}

              <div
                style={{
                  marginTop: 12,
                  padding: 14,
                  borderRadius: 10,
                  background:
                    'var(--bg-secondary)',
                  border:
                    '1px solid var(--border)',
                }}
              >
                <strong
                  style={{
                    fontSize: 12,
                    color: 'var(--text-muted)',
                  }}
                >
                  GENERATED PERMISSION PDF
                </strong>

                <Button
                  className="btn btn-outline"
                  onClick={() =>
                    handleViewPermissionPDF(
                      selected._id
                    )
                  }
                  style={{
                    width: '100%',
                    marginTop: 10,
                    justifyContent: 'center',
                  }}
                >
                  <Eye size={15} />
                  View Generated Permission PDF
                </Button>
              </div>
            </div>

            {/* FOOTER */}

            <div
              className="modal-footer"
              style={{
                display: 'flex',
                justifyContent:
                  'space-between',
                gap: 10,
              }}
            >
              <Button variant="outline"
                className="btn btn-outline"
                onClick={() => setSelected(null)}
              >
                Close
              </Button>

              {/* COORDINATOR ONLY */}

              {needsReview(selected) && (
                <div
                  style={{
                    display: 'flex',
                    gap: 10,
                  }}
                >
                  <Button
                    className="btn btn-danger"
                    disabled={actionLoading}
                    onClick={() =>
                      handleReview(
                        selected._id,
                        'rejected'
                      )
                    }
                  >
                    <XCircle size={16} />
                    Reject
                  </Button>

                  <Button
                    className="btn btn-success"
                    disabled={actionLoading}
                    onClick={() =>
                      handleReview(
                        selected._id,
                        'approved'
                      )
                    }
                  >
                    <CheckCircle2 size={16} />
                    Approve
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* COORDINATOR PENDING POPUP */}

      {canReview && showPendingPopup && (
        <div
          className="modal-overlay"
          style={{ zIndex: 2000 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowPendingPopup(false);
            }
          }}
        >
          <div
            className="modal"
            style={{
              maxWidth: 620,
              width: 'calc(100% - 32px)',
            }}
          >
            <div className="modal-header">
              <div>
                <div className="modal-title">
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                    <Bell size={17} />
                    Pending Permission Requests
                  </span>
                </div>

                <div className="modal-subtitle">
                  {pendingPermissions.length}{' '}
                  request
                  {pendingPermissions.length !== 1
                    ? 's'
                    : ''}{' '}
                  waiting for review
                </div>
              </div>

              <Button
                className="modal-close"
                onClick={() =>
                  setShowPendingPopup(false)
                }
              >
                <X size={18} />
              </Button>
            </div>

            <div className="modal-body">
              {pendingPermissions
                .slice(0, 3)
                .map((p) => (
                  <div
                    key={p._id}
                    style={{
                      padding: 15,
                      marginBottom: 12,
                      borderRadius: 10,
                      border:
                        '1px solid var(--border)',
                      background:
                        'var(--bg-secondary)',
                    }}
                  >
                    <strong>
                      {p.memberName}
                    </strong>

                    <div
                      style={{
                        fontSize: 12,
                        color:
                          'var(--text-muted)',
                        margin: '5px 0 12px',
                      }}
                    >
                      {p.permissionType} •{' '}
                      {formatDateRange(
                        p.fromDate,
                        p.toDate
                      )}
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        gap: 8,
                        flexWrap: 'wrap',
                      }}
                    >
                      <Button
                        className="btn btn-outline"
                        onClick={() => {
                          setShowPendingPopup(
                            false
                          );
                          setSelected(p);
                        }}
                      >
                        <Eye size={15} />
                        View
                      </Button>

                      {p.attachment?.fileName && (
                        <Button
                          className="btn btn-outline"
                          onClick={() =>
                            handleViewAttachment(
                              p._id
                            )
                          }
                        >
                          <Eye size={15} />
                          Document
                        </Button>
                      )}

                      <Button
                        className="btn btn-danger"
                        disabled={actionLoading}
                        onClick={() =>
                          handleReview(
                            p._id,
                            'rejected'
                          )
                        }
                      >
                        <XCircle size={15} />
                        Reject
                      </Button>

                      <Button
                        className="btn btn-success"
                        disabled={actionLoading}
                        onClick={() =>
                          handleReview(
                            p._id,
                            'approved'
                          )
                        }
                      >
                        <CheckCircle2 size={15} />
                        Approve
                      </Button>
                    </div>
                  </div>
                ))}

              {pendingPermissions.length === 0 && (
                <div
                  style={{
                    textAlign: 'center',
                    padding: 20,
                    color: 'var(--text-muted)',
                  }}
                >
                  No pending requests.
                </div>
              )}
            </div>

            <div className="modal-footer">
              <Button variant="outline"
                className="btn btn-outline"
                onClick={() =>
                  setShowPendingPopup(false)
                }
              >
                Review Later
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}