import React, { useEffect, useState, useCallback } from 'react';
import { Plus, Trash2, Edit2, X, Search, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import TopBar from '../components/TopBar';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

const ROLES = ['Junior Developer', 'Senior Developer', 'Lead'];

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
  const [editingMember, setEditingMember] = useState(null);
  const [form, setForm] = useState({ memberId: '', name: '', email: '', role: 'Junior Developer', team: '', department: 'Engineering', phone: '' });
  const [editForm, setEditForm] = useState({ memberId: '', name: '', email: '', role: 'Junior Developer', team: '', department: '', phone: '', isActive: true });
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
      'LEAD': 'lead',
      'Lead': 'lead',
      'Junior Developer': 'junior developer',
      'Senior Developer': 'senior developer'
    };

    const normalizedMemberRole =
      (m.role || '').trim().toLowerCase();
    const normalizedMemberDept =
      (m.department || '').trim().toLowerCase();

    const normalizedSelectedRole =
      (roleAliases[roleFilter] || roleFilter || '')
        .trim()
        .toLowerCase();

    let matchRole = true;
    if (normalizedSelectedRole) {
      if (normalizedSelectedRole === 'lead') {
        matchRole = normalizedMemberRole.includes('lead') || normalizedMemberDept.includes('lead');
      } else if (normalizedSelectedRole.includes('senior')) {
        matchRole = (normalizedMemberRole.includes('senior') || normalizedMemberDept.includes('senior')) && !normalizedMemberDept.includes('lead') && !normalizedMemberRole.includes('lead');
      } else if (normalizedSelectedRole.includes('junior')) {
        matchRole = normalizedMemberRole.includes('junior') || normalizedMemberDept.includes('junior');
      } else {
        matchRole = normalizedMemberRole === normalizedSelectedRole;
      }
    }

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
      setForm({ memberId: '', name: '', email: '', role: 'Junior Developer', team: '', department: 'Engineering', phone: '' });
      fetchMembers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create member');
    } finally { setSaving(false); }
  };

  const handleEditClick = (m) => {
    setEditingMember(m);
    setEditForm({
      memberId: m.memberId || '',
      name: m.name || '',
      email: m.email || '',
      role: m.role || 'Junior Developer',
      team: m.team || '',
      department: m.department || '',
      phone: m.phone || '',
      isActive: m.isActive !== undefined ? m.isActive : true,
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put(`/members/${editingMember.memberId}`, editForm);
      toast.success('Member updated successfully!');
      setEditingMember(null);
      fetchMembers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update member');
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

  const roleColor = (role, dept) => {
    if (/lead/i.test(role) || /lead/i.test(dept)) return '#059669';
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
            <Button className="btn btn-primary" onClick={() => setShowForm(true)}>
              <Plus size={15} /> Add Member
            </Button>
          )}
        </div>

        {/* Filters */}
        <div className="card" style={{ marginBottom: 20, padding: '16px 20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <Label className="form-label" style={{ fontSize: 12 }}>Role</Label>
              <Select value={roleFilter || 'all'} onValueChange={value => { setRoleFilter(value === 'all' ? '' : value); setPage(1); }}><SelectTrigger className="form-input" style={{ fontSize: 13 }}><SelectValue /></SelectTrigger><SelectContent className="members-filter-select"><SelectItem value="all">All Roles</SelectItem><SelectItem value="Junior Developer">Junior Developer</SelectItem><SelectItem value="Senior Developer">Senior Developer</SelectItem><SelectItem value="Lead">Lead</SelectItem></SelectContent></Select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <Label className="form-label" style={{ fontSize: 12 }}>Team</Label>
              <Select value={teamFilter || 'all'} onValueChange={value => { setTeamFilter(value === 'all' ? '' : value); setPage(1); }}><SelectTrigger className="form-input" style={{ fontSize: 13 }}><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All Teams</SelectItem>{teams.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <Label className="form-label" style={{ fontSize: 12 }}>Department</Label>
              <Select value={departmentFilter || 'all'} onValueChange={value => { setDepartmentFilter(value === 'all' ? '' : value); setPage(1); }}><SelectTrigger className="form-input" style={{ fontSize: 13 }}><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All Departments</SelectItem>{departments.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent></Select>
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
                            <div style={{ width: 32, height: 32, borderRadius: '50%', background: `${roleColor(m.role, m.department)}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: roleColor(m.role, m.department), flexShrink: 0 }}>
                              {m.name?.split(' ').map(n => n[0]).slice(0, 2).join('')}
                            </div>
                            <span style={{ fontWeight: 600 }}>{m.name}</span>
                          </div>
                        </td>
                        <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{m.email}</td>
                        <td>
                          <span style={{ fontSize: 12, fontWeight: 600, color: roleColor(m.role, m.department), background: `${roleColor(m.role, m.department)}15`, padding: '2px 8px', borderRadius: 4 }}>{m.role}</span>
                        </td>
                        <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{m.team || '–'}</td>
                        <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{m.department}</td>
                        <td>
                          <Badge className={`badge ${m.isActive ? 'badge-present' : 'badge-absent'}`} style={{ fontSize: 11 }}>
                            {m.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <Button variant="ghost" className="btn btn-ghost btn-sm" title="View Details" onClick={() => setSelectedMember(m)} style={{ color: 'var(--primary)' }}>
                              <Eye size={13} />
                            </Button>
                            {isAdmin && (
                              <>
                                <Button variant="ghost" className="btn btn-ghost btn-sm" title="Edit" onClick={() => handleEditClick(m)} style={{ color: 'var(--primary)' }}><Edit2 size={13} /></Button>
                                <Button variant="ghost" className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)' }} title="Delete" onClick={() => handleDelete(m.memberId)}><Trash2 size={13} /></Button>
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
                      <Button
                        className="btn btn-outline btn-sm"
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                      >
                        <ChevronLeft size={14} />
                      </Button>
                      <Button
                        className="btn btn-outline btn-sm"
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                      >
                        <ChevronRight size={14} />
                      </Button>
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
                  <div style={{ width: 50, height: 50, borderRadius: '50%', background: `${roleColor(selectedMember.role, selectedMember.department)}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700, color: roleColor(selectedMember.role, selectedMember.department) }}>
                    {selectedMember.name?.split(' ').map(n => n[0]).slice(0, 2).join('')}
                  </div>
                  <div>
                    <div className="modal-title">{selectedMember.name}</div>
                    <div className="modal-subtitle">{selectedMember.memberId}</div>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="modal-close" onClick={() => setSelectedMember(null)}><X size={18} /></Button>
              </div>
              <div className="modal-body">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                  <div>
                    <Label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Email</Label>
                    <div style={{ fontSize: 14, fontWeight: 500, marginTop: 4 }}>{selectedMember.email}</div>
                  </div>
                  <div>
                    <Label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Role</Label>
                    <div style={{ fontSize: 14, fontWeight: 500, marginTop: 4, color: roleColor(selectedMember.role, selectedMember.department) }}>{selectedMember.role}</div>
                  </div>
                  <div>
                    <Label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Team</Label>
                    <div style={{ fontSize: 14, fontWeight: 500, marginTop: 4 }}>{selectedMember.team || '–'}</div>
                  </div>
                  <div>
                    <Label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Department</Label>
                    <div style={{ fontSize: 14, fontWeight: 500, marginTop: 4 }}>{selectedMember.department}</div>
                  </div>
                  <div>
                    <Label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Status</Label>
                    <div style={{ marginTop: 4 }}>
                      <Badge className={`badge ${selectedMember.isActive ? 'badge-present' : 'badge-absent'}`}>
                        {selectedMember.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <Label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Phone</Label>
                    <div style={{ fontSize: 14, fontWeight: 500, marginTop: 4 }}>{selectedMember.phone || '–'}</div>
                  </div>
                </div>
              </div>
              {isAdmin && (
                <div className="modal-footer" style={{ borderTop: '1px solid var(--border)', paddingTop: 14 }}>
                  <Button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => {
                      const target = selectedMember;
                      setSelectedMember(null);
                      handleEditClick(target);
                    }}
                    style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}
                  >
                    <Edit2 size={13} /> Edit Member
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Edit Member Modal */}
        {editingMember && (
          <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setEditingMember(null)}>
            <div className="modal" style={{ maxWidth: 520 }}>
              <div className="modal-header">
                <div>
                  <div className="modal-title">Edit Member</div>
                  <div className="modal-subtitle">Update details for {editingMember.memberId}</div>
                </div>
                <Button variant="ghost" size="icon" className="modal-close" onClick={() => setEditingMember(null)}><X size={18} /></Button>
              </div>
              <form onSubmit={handleUpdate}>
                <div className="modal-body">
                  <div className="form-row form-row-2">
                    <div className="form-group">
                      <Label className="form-label">Member ID</Label>
                      <Input className="form-input" disabled value={editForm.memberId} style={{ background: '#f8fafc', cursor: 'not-allowed', color: 'var(--text-muted)' }} />
                    </div>
                    <div className="form-group">
                      <Label className="form-label">Full Name <span className="required">*</span></Label>
                      <Input className="form-input" required value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} placeholder="John Doe" />
                    </div>
                  </div>
                  <div className="form-group">
                    <Label className="form-label">Email <span className="required">*</span></Label>
                    <Input type="email" className="form-input" required value={editForm.email} onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))} placeholder="john@domain.com" />
                  </div>
                  <div className="form-row form-row-2">
                    <div className="form-group">
                      <Label className="form-label">Role</Label>
                      <Select value={editForm.role} onValueChange={value => setEditForm(f => ({ ...f, role: value }))}><SelectTrigger className="form-input"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Junior Developer">Junior Developer</SelectItem><SelectItem value="Senior Developer">Senior Developer</SelectItem><SelectItem value="Lead">Lead</SelectItem><SelectItem value="User">User</SelectItem></SelectContent></Select>
                    </div>
                    <div className="form-group">
                      <Label className="form-label">Team</Label>
                      <Select value={editForm.team} onValueChange={value => setEditForm(f => ({ ...f, team: value }))}><SelectTrigger className="form-input"><SelectValue placeholder="No Team" /></SelectTrigger><SelectContent>{teams.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select>
                    </div>
                  </div>
                  <div className="form-row form-row-2">
                    <div className="form-group">
                      <Label className="form-label">Department</Label>
                      <Input className="form-input" value={editForm.department} onChange={e => setEditForm(f => ({ ...f, department: e.target.value }))} placeholder="Department" />
                    </div>
                    <div className="form-group">
                      <Label className="form-label">Status</Label>
                      <Select value={editForm.isActive ? 'true' : 'false'} onValueChange={value => setEditForm(f => ({ ...f, isActive: value === 'true' }))}><SelectTrigger className="form-input"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="true">Active</SelectItem><SelectItem value="false">Inactive</SelectItem></SelectContent></Select>
                    </div>
                  </div>
                  <div className="form-group">
                    <Label className="form-label">Phone</Label>
                    <Input className="form-input" value={editForm.phone} onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))} placeholder="+91 9876543210" />
                  </div>
                </div>
                <div className="modal-footer">
                  <Button type="button" variant="outline" className="btn btn-outline" onClick={() => setEditingMember(null)}>Cancel</Button>
                  <Button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save Changes'}</Button>
                </div>
              </form>
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
                <Button variant="ghost" size="icon" className="modal-close" onClick={() => setShowForm(false)}><X size={18} /></Button>
              </div>
              <form onSubmit={handleCreate}>
                <div className="modal-body">
                  <div className="form-row form-row-2">
                    <div className="form-group">
                      <Label className="form-label">Member ID <span className="required">*</span></Label>
                      <Input className="form-input" required value={form.memberId} onChange={e => setForm(f => ({ ...f, memberId: e.target.value }))} placeholder="C4GT001" />
                    </div>
                    <div className="form-group">
                      <Label className="form-label">Full Name <span className="required">*</span></Label>
                      <Input className="form-input" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="John Doe" />
                    </div>
                  </div>
                  <div className="form-group">
                    <Label className="form-label">Email <span className="required">*</span></Label>
                    <Input type="email" className="form-input" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="john@kiet.edu" />
                  </div>
                  <div className="form-row form-row-2">
                    <div className="form-group">
                      <Label className="form-label">Role</Label>
                      <Select value={form.role} onValueChange={value => setForm(f => ({ ...f, role: value }))}><SelectTrigger className="form-input"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Junior Developer">Junior Developer</SelectItem><SelectItem value="Senior Developer">Senior Developer</SelectItem><SelectItem value="Lead">Lead</SelectItem><SelectItem value="User">User</SelectItem></SelectContent></Select>
                    </div>
                    <div className="form-group">
                      <Label className="form-label">Team</Label>
                      <Select value={form.team} onValueChange={value => setForm(f => ({ ...f, team: value }))}><SelectTrigger className="form-input"><SelectValue placeholder="No Team" /></SelectTrigger><SelectContent>{teams.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select>
                    </div>
                  </div>
                  <div className="form-group">
                    <Label className="form-label">Department</Label>
                    <Input className="form-input" value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <Label className="form-label">Phone</Label>
                    <Input className="form-input" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+91 9876543210" />
                  </div>
                </div>
                <div className="modal-footer">
                  <Button type="button" variant="outline" className="btn btn-outline" onClick={() => setShowForm(false)}>Cancel</Button>
                  <Button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Create Member'}</Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
