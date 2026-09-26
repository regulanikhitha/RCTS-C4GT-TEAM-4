import React, { useEffect, useState } from 'react';
import { Users } from 'lucide-react';
import TopBar from '../components/TopBar';
import api from '../api/axios';
import { Badge } from '../components/ui/badge';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

const getTodayString = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function CoordinatorDashboard() {
  const [members, setMembers] = useState([]);
  const [teamFilter, setTeamFilter] = useState('');
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

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

  useEffect(() => {
    let isMounted = true;
    const fetchTodayStats = async () => {
      setStatsLoading(true);
      try {
        const todayDate = getTodayString();
        const teamParam = teamFilter ? `&team=${encodeURIComponent(teamFilter)}` : '';
        const { data } = await api.get(`/attendance/stats?date=${todayDate}${teamParam}`);
        if (isMounted) setStats(data);
      } catch (_) {
        if (isMounted) setStats(null);
      } finally {
        if (isMounted) setStatsLoading(false);
      }
    };

    fetchTodayStats();
    return () => {
      isMounted = false;
    };
  }, [teamFilter]);

  // Get unique teams
  const teams = [
    ...new Set(
      members
        .map(member => member.team)
        .filter(team => team && team.trim() !== '')
    )
  ].sort();

  // Filter members team-wise
  // If no team is selected, show ALL members
  const teamMembers = teamFilter
    ? members.filter(
        member =>
          (member.team || '').trim().toLowerCase() ===
          teamFilter.trim().toLowerCase()
      )
    : members;

  const totalCount = stats?.totalMembers ?? teamMembers.length;
  const presentCount = stats?.present ?? 0;
  const absentCount = stats?.absent ?? (totalCount > presentCount ? totalCount - presentCount : 0);
  const todayPercentage = stats?.attendancePercentage !== undefined
    ? Number(stats.attendancePercentage).toFixed(1).replace(/\.0$/, '')
    : totalCount > 0
      ? Math.round((presentCount / totalCount) * 100)
      : 0;

  return (
    <>
      <TopBar title="Coordinator Dashboard" />

      <div className="page-content">

        <div className="page-header">
          <h1>Coordinator Dashboard</h1>
          <p>
            Manage team attendance, today's attendance rate, and operational updates.
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
            <Label
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
            </Label>

            <Select value={teamFilter || 'all'} onValueChange={value => setTeamFilter(value === 'all' ? '' : value)}>
              <SelectTrigger className="form-input" style={{ fontSize: 13 }}><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Teams</SelectItem>
                {teams.map(team => <SelectItem key={team} value={team}>{team}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* STAT CARDS */}
        <div className="stat-grid">

          <div className="stat-card blue">
            <div className="stat-label">Teams</div>
            <div className="stat-value">{teams.length || 9}</div>
            <div className="stat-sub">Active teams</div>
          </div>

          <div className="stat-card green">
            <div className="stat-label">Present</div>
            <div className="stat-value">{statsLoading ? '...' : presentCount}</div>
            <div className="stat-sub">Marked today</div>
          </div>

          <div className="stat-card red">
            <div className="stat-label">Absent / Pending</div>
            <div className="stat-value">{statsLoading ? '...' : absentCount}</div>
            <div className="stat-sub">Not marked present</div>
          </div>

          <div className="stat-card purple">
            <div className="stat-label">Today's Attendance</div>
            <div className="stat-value">{statsLoading ? '...' : `${todayPercentage}%`}</div>
            <div className="stat-sub">Today's percentage</div>
          </div>

        </div>

        {/* TEAM MEMBERS */}
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
              {teamFilter || 'All Teams'}
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
                  No members are available.
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
                        <Badge
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
                        </Badge>
                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            )}

          </div>
        </div>

      </div>
    </>
  );
}