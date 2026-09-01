import React, { useEffect, useState } from 'react';
import { Users } from 'lucide-react';
import TopBar from '../components/TopBar';
import api from '../api/axios';

export default function CoordinatorDashboard() {
  const [members, setMembers] = useState([]);
  const [teamFilter, setTeamFilter] = useState('');

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const { data } = await api.get('/members');
        setMembers(data.members || []);
      } catch (_) {
        setMembers([]);
      }
    };

    fetchMembers();
  }, []);

  // Get unique teams
  const teams = [
    ...new Set(
      members
        .map(member => member.team)
        .filter(team => team && team.trim() !== '')
    )
  ].sort();

  // Filter members team-wise
  const teamMembers = teamFilter
    ? members.filter(
        member =>
          (member.team || '').trim().toLowerCase() ===
          teamFilter.trim().toLowerCase()
      )
    : members;

  return (
    <>
      <TopBar title="Coordinator Dashboard" />

      <div className="page-content">

        <div className="page-header">
          <h1>Coordinator Dashboard</h1>
          <p>
            Manage team attendance, attendance rate, and operational updates.
          </p>
        </div>

        {/* TEAM-WISE FILTER */}
        <div
          className="card"
          style={{
            marginBottom: 20,
            padding: '16px 20px'
          }}
        >
          <div
            className="form-group"
            style={{ marginBottom: 0 }}
          >
            <label
              className="form-label"
              style={{ fontSize: 12 }}
            >
              <Users
                size={14}
                style={{
                  verticalAlign: 'middle',
                  marginRight: 6
                }}
              />
              Team
            </label>

            <select
              className="form-input"
              value={teamFilter}
              onChange={e => setTeamFilter(e.target.value)}
              style={{ fontSize: 13 }}
            >
              <option value="">All Teams</option>

              {teams.map(team => (
                <option
                  key={team}
                  value={team}
                >
                  {team}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* EXISTING STAT CARDS */}
        <div className="stat-grid">

          <div className="stat-card blue">
            <div className="stat-label">Teams</div>
            <div className="stat-value">9</div>
            <div className="stat-sub">Active teams</div>
          </div>

          <div className="stat-card green">
            <div className="stat-label">Present</div>
            <div className="stat-value">76</div>
            <div className="stat-sub">Members present</div>
          </div>

          <div className="stat-card red">
            <div className="stat-label">Pending</div>
            <div className="stat-value">12</div>
            <div className="stat-sub">Action required</div>
          </div>

          <div className="stat-card purple">
            <div className="stat-label">Attendance</div>
            <div className="stat-value">86%</div>
            <div className="stat-sub">This week</div>
          </div>

        </div>

        {/* SELECTED TEAM MEMBERS */}
        {teamFilter && (
          <div
            className="card"
            style={{ marginTop: 20 }}
          >

            <div
              style={{
                padding: '16px 20px',
                borderBottom: '1px solid var(--border)'
              }}
            >
              <h3
                style={{
                  fontSize: 16,
                  fontWeight: 700
                }}
              >
                {teamFilter}
              </h3>

              <p
                style={{
                  fontSize: 12,
                  color: 'var(--text-muted)',
                  marginTop: 4
                }}
              >
                {teamMembers.length} member
                {teamMembers.length !== 1 ? 's' : ''}
              </p>
            </div>

            <div className="table-wrap">

              {teamMembers.length === 0 ? (

                <div className="empty-state">
                  <Users size={40} />

                  <h3>
                    No members found
                  </h3>

                  <p>
                    No members are assigned to this team.
                  </p>
                </div>

              ) : (

                <table>

                  <thead>
                    <tr>
                      <th>Member ID</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Department</th>
                      <th>Status</th>
                    </tr>
                  </thead>

                  <tbody>

                    {teamMembers.map(member => (

                      <tr key={member._id}>

                        <td
                          style={{
                            fontFamily: 'monospace',
                            fontSize: 12,
                            fontWeight: 700,
                            color: 'var(--primary)'
                          }}
                        >
                          {member.memberId}
                        </td>

                        <td
                          style={{
                            fontWeight: 600
                          }}
                        >
                          {member.name}
                        </td>

                        <td
                          style={{
                            fontSize: 12,
                            color: 'var(--text-secondary)'
                          }}
                        >
                          {member.email}
                        </td>

                        <td
                          style={{
                            fontSize: 12
                          }}
                        >
                          {member.role}
                        </td>

                        <td
                          style={{
                            fontSize: 12,
                            color: 'var(--text-muted)'
                          }}
                        >
                          {member.department || '–'}
                        </td>

                        <td>
                          <span
                            className={`badge ${
                              member.isActive
                                ? 'badge-present'
                                : 'badge-absent'
                            }`}
                            style={{ fontSize: 11 }}
                          >
                            {member.isActive
                              ? 'Active'
                              : 'Inactive'}
                          </span>
                        </td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              )}

            </div>
          </div>
        )}

      </div>
    </>
  );
}