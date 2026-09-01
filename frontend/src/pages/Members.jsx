import React, { useEffect, useState, useCallback } from 'react';
import { Plus, Trash2, Edit2, X, Search, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import TopBar from '../components/TopBar';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const ROLES = ['Junior Developer', 'Senior Developer', 'User', 'JD', 'SD', 'LEAD'];

export default function Members() {
  const { user, adminSearch, setAdminSearch } = useAuth();
  const isAdmin = user?.role === 'admin';
  const canSearch = isAdmin;
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [roleFilter, setRoleFilter] = useState('');
  const [teamFilter, setTeamFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [form, setForm] = useState({ memberId: '', name: '', email: '', role: 'Junior Developer', department: 'Engineering', phone: '' });
  const [saving, setSaving] = useState(false);
  const PER_PAGE = 10;

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/members');
      setMembers(data.members || []);
    } catch (_) { setMembers([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchMembers(); }, [fetchMembers]);

  const search = (adminSearch || '').trim();

  const filtered = members.filter(m => {
    // -------------------------
    // SEARCH FILTER
    // -------------------------
    const searchValue = search.toLowerCase();
    const matchSearch =
      !canSearch ||
      !searchValue ||
      (m.name || '').toLowerCase().includes(searchValue) ||
      (m.memberId || '').toLowerCase().includes(searchValue) ||
      (m.email || '').toLowerCase().includes(searchValue);

    // -------------------------
    // ROLE FILTER
    // -------------------------
    const roleAliases = {
      'JD': 'junior developer',
      'SD': 'senior developer',
      'LEAD': 'lead'
    };

    const normalizedMemberRole =
      (m.role || '').trim().toLowerCase();

    const normalizedSelectedRole =
      (roleAliases[roleFilter] || roleFilter || '')
        .trim()
        .toLowerCase();

    const matchRole =
      !normalizedSelectedRole ||
      normalizedMemberRole === normalizedSelectedRole;

    // -------------------------
    // TEAM FILTER
    // -------------------------
    const normalizedMemberTeam =
      (m.team || '').trim().toLowerCase();

    const normalizedSelectedTeam =
      (teamFilter || '').trim().toLowerCase();

    const matchTeam =
      !normalizedSelectedTeam ||
      normalizedMemberTeam === normalizedSelectedTeam;

    // -------------------------
    // DEPARTMENT FILTER
    // -------------------------
    const normalizedMemberDepartment =
      (m.department || '').trim().toLowerCase();

    const normalizedSelectedDepartment =
      (departmentFilter || '').trim().toLowerCase();

    const matchDepartment =
      !normalizedSelectedDepartment ||
      normalizedMemberDepartment === normalizedSelectedDepartment;

    // -------------------------
    // FINAL RESULT
    // -------------------------
    return (
      matchSearch &&
      matchRole &&
      matchTeam &&
      matchDepartment
    );
  });

  useEffect(() => {
    setPage(1);
  }, [search, roleFilter, teamFilter, departmentFilter]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const teams = [...new Set(members.map(m => m.team).filter(Boolean))].sort();
  const departments = [...new Set(members.map(m => m.department).filter(Boolean))].sort();

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/members', form);
      toast.success('Member created!');
      setShowForm(false);
      setForm({ memberId: '', name: '', email: '', role: 'Junior Developer', department: 'Engineering', phone: '' });
      fetchMembers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create member');
    } finally { setSaving(false); }
  };

  const handleDelete = async (memberId) => {
    if (!confirm(`Delete member ${memberId}?`)) return;
    try {
      await api.delete(`/members/${memberId}`);
      toast.success('Member deleted');
      fetchMembers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    }
  };

  const roleColor = (role) => {
    if (/junior/i.test(role)) return '#2563eb';
    if (/senior/i.test(role)) return '#7c3aed';
    return '#16a34a';
  };

  return (
    <>
      <TopBar title="Members" />
      <div className="page-content">
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700 }}>All Members</h2>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{filtered.length} of {members.length} members</p>
          </div>
          {isAdmin && (
            <button className="btn btn-primary" onClick={() => setShowForm(true)}>
              <Plus size={15} /> Add Member
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="card" style={{ marginBottom: 20, padding: '16px 20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: 12 }}>Role</label>
              <select
                className="form-input"
                value={roleFilter}
                onChange={e => { setRoleFilter(e.target.value); setPage(1); }}
                style={{ fontSize: 13 }}
              >
                <option value="">All Roles</option>
                <option value="JD">Junior Developer</option>
                <option value="SD">Senior Developer</option>
                <option value="LEAD">Lead</option>
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: 12 }}>Team</label>
              <select
                className="form-input"
                value={teamFilter}
                onChange={e => { setTeamFilter(e.target.value); setPage(1); }}
                style={{ fontSize: 13 }}
              >
                <option value="">All Teams</option>
                {teams.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: 12 }}>Department</label>
              <select
                className="form-input"
                value={departmentFilter}
                onChange={e => { setDepartmentFilter(e.target.value); setPage(1); }}
                style={{ fontSize: 13 }}
              >
                <option value="">All Departments</option>
                {departments.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="card">
          <div className="table-wrap">
            {loading ? (
              <div className="loading-state"><div className="spinner" /><p>Loading members…</p></div>
            ) : filtered.length === 0 ? (
              <div className="empty-state">
                <Search size={40} />
                <h3>No members found</h3>
                <p>Try adjusting your filters or search term</p>
              </div>
            ) : (
              <>
                <table>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Member ID</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Team</th>
                      <th>Department</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.map((m, i) => (
                      <tr key={m._id}>
                        <td style={{ color: 'var(--text-muted)' }}>{(page - 1) * PER_PAGE + i + 1}</td>
                        <td style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 700, color: 'var(--primary)' }}>{m.memberId}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ width: 32, height: 32, borderRadius: '50%', background: `${roleColor(m.role)}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: roleColor(m.role), flexShrink: 0 }}>
                              {m.name?.split(' ').map(n => n[0]).slice(0, 2).join('')}
                            </div>
                            <span style={{ fontWeight: 600 }}>{m.name}</span>
                          </div>
                        </td>
                        <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{m.email}</td>
                        <td>
                          <span style={{ fontSize: 12, fontWeight: 600, color: roleColor(m.role), background: `${roleColor(m.role)}15`, padding: '2px 8px', borderRadius: 4 }}>{m.role}</span>
                        </td>
                        <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{m.team || '–'}</td>
                        <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{m.department}</td>
                        <td>
                          <span className={`badge ${m.isActive ? 'badge-present' : 'badge-absent'}`} style={{ fontSize: 11 }}>
                            {m.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button className="btn btn-ghost btn-sm" title="View Details" onClick={() => setSelectedMember(m)} style={{ color: 'var(--primary)' }}>
                              <Eye size={13} />
                            </button>
                            {isAdmin && (
                              <>
                                <button className="btn btn-ghost btn-sm" title="Edit"><Edit2 size={13} /></button>
                                <button className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)' }} title="Delete" onClick={() => handleDelete(m.memberId)}><Trash2 size={13} /></button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderTop: '1px solid var(--border)' }}>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      Page {page} of {totalPages} • {filtered.length} results
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                      >
                        <ChevronLeft size={14} />
                      </button>
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                      >
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Member Detail Modal */}
        {selectedMember && (
          <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setSelectedMember(null)}>
            <div className="modal" style={{ maxWidth: 600 }}>
              <div className="modal-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ width: 50, height: 50, borderRadius: '50%', background: `${roleColor(selectedMember.role)}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700, color: roleColor(selectedMember.role) }}>
                    {selectedMember.name?.split(' ').map(n => n[0]).slice(0, 2).join('')}
                  </div>
                  <div>
                    <div className="modal-title">{selectedMember.name}</div>
                    <div className="modal-subtitle">{selectedMember.memberId}</div>
                  </div>
                </div>
                <button className="modal-close" onClick={() => setSelectedMember(null)}><X size={18} /></button>
              </div>
              <div className="modal-body">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Email</label>
                    <div style={{ fontSize: 14, fontWeight: 500, marginTop: 4 }}>{selectedMember.email}</div>
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Role</label>
                    <div style={{ fontSize: 14, fontWeight: 500, marginTop: 4, color: roleColor(selectedMember.role) }}>{selectedMember.role}</div>
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Team</label>
                    <div style={{ fontSize: 14, fontWeight: 500, marginTop: 4 }}>{selectedMember.team || '–'}</div>
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Department</label>
                    <div style={{ fontSize: 14, fontWeight: 500, marginTop: 4 }}>{selectedMember.department}</div>
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Status</label>
                    <div style={{ marginTop: 4 }}>
                      <span className={`badge ${selectedMember.isActive ? 'badge-present' : 'badge-absent'}`}>
                        {selectedMember.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Phone</label>
                    <div style={{ fontSize: 14, fontWeight: 500, marginTop: 4 }}>{selectedMember.phone || '–'}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Member Modal */}
        {showForm && (
          <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowForm(false)}>
            <div className="modal" style={{ maxWidth: 500 }}>
              <div className="modal-header">
                <div>
                  <div className="modal-title">Add New Member</div>
                  <div className="modal-subtitle">Fill in the member details below</div>
                </div>
                <button className="modal-close" onClick={() => setShowForm(false)}><X size={18} /></button>
              </div>
              <form onSubmit={handleCreate}>
                <div className="modal-body">
                  <div className="form-row form-row-2">
                    <div className="form-group">
                      <label className="form-label">Member ID <span className="required">*</span></label>
                      <input className="form-input" required value={form.memberId} onChange={e => setForm(f => ({ ...f, memberId: e.target.value }))} placeholder="C4GT001" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Full Name <span className="required">*</span></label>
                      <input className="form-input" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="John Doe" />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email <span className="required">*</span></label>
                    <input type="email" className="form-input" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="john@kiet.edu" />
                  </div>
                  <div className="form-row form-row-2">
                    <div className="form-group">
                      <label className="form-label">Role</label>
                      <select className="form-input" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                        {ROLES.map(r => <option key={r}>{r}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Department</label>
                      <input className="form-input" value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone</label>
                    <input className="form-input" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+91 9876543210" />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Create Member'}</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
