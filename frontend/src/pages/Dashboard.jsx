import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  UserCheck,
  UserX,
  Percent,
  ClipboardList,
  FileText,
  UserPlus,
  Download,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts';

import TopBar from '../components/TopBar';
import StatCard from '../components/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { ChartContainer, ChartTooltipContent } from '../components/ui/chart';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const TODAY = new Date().toISOString().split('T')[0];

const TEAMS = [
  'ALL',
  'TEAM-1',
  'TEAM-2',
  'TEAM-3',
  'TEAM-4',
  'TEAM-5',
  'TEAM-6',
  'TEAM-7',
  'TEAM-8',
  'TEAM-9',
];

export default function Dashboard() {
  const { user, adminSearch } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [dailyData, setDailyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTeam, setSelectedTeam] = useState('ALL');

  const fetchData = useCallback(async () => {
    setLoading(true);

    try {
      const [statsRes, dailyRes] = await Promise.all([
        api.get(`/attendance/stats?date=${TODAY}`),
        api.get(`/attendance?date=${TODAY}`),
      ]);

      setStats(statsRes.data);
      setDailyData(dailyRes.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Search filter
  const searchQuery = (adminSearch || '').trim().toLowerCase();

  // Team + Search filter
  const filteredMembers = dailyData?.members
    ? dailyData.members.filter((member) => {
        const matchesTeam =
          selectedTeam === 'ALL' || member.team === selectedTeam;

        const haystack = [
          member.name,
          member.role,
          member.department,
          member.memberId,
          member.email,
          member.team,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        const matchesSearch =
          !searchQuery || haystack.includes(searchQuery);

        return matchesTeam && matchesSearch;
      })
    : [];

  // Calculate statistics for selected team/search
  const filteredStats = (() => {
    // No filters → use backend statistics
    if (selectedTeam === 'ALL' && !searchQuery) {
      return {
        totalMembers: stats?.totalMembers ?? 0,
        present: stats?.present ?? 0,
        absent: stats?.absent ?? 0,
        attendancePercentage: stats?.attendancePercentage ?? 0,
      };
    }

    const totalMembers = filteredMembers.length;

    const present = filteredMembers.filter(
      (member) => member.status === 'Present'
    ).length;

    const absent = filteredMembers.filter(
      (member) => member.status === 'Absent'
    ).length;

    const attendancePercentage =
      totalMembers > 0
        ? Math.round((present / totalMembers) * 100)
        : 0;

    return {
      totalMembers,
      present,
      absent,
      attendancePercentage,
    };
  })();

  // Role-wise attendance
  const roleRows = (() => {
    if (!filteredMembers.length) return [];

    const ORDERED_ROLES = ['Lead', 'Senior Developer', 'Junior Developer'];
    const roles = {
      Lead: { total: 0, present: 0, absent: 0 },
      'Senior Developer': { total: 0, present: 0, absent: 0 },
      'Junior Developer': { total: 0, present: 0, absent: 0 },
    };

    filteredMembers.forEach((member) => {
      const isLead =
        /lead/i.test(member.role) || /lead/i.test(member.department);
      let role = 'Unknown';

      if (isLead) {
        role = 'Lead';
      } else if (
        /senior/i.test(member.role) ||
        /senior/i.test(member.department)
      ) {
        role = 'Senior Developer';
      } else if (
        /junior/i.test(member.role) ||
        /junior/i.test(member.department)
      ) {
        role = 'Junior Developer';
      } else if (member.role) {
        role = member.role;
      }

      if (!roles[role]) {
        roles[role] = {
          total: 0,
          present: 0,
          absent: 0,
        };
      }

      roles[role].total++;

      if (member.status === 'Present') {
        roles[role].present++;
      } else if (member.status === 'Absent') {
        roles[role].absent++;
      }
    });

    return Object.entries(roles).sort(([a], [b]) => {
      const indexA = ORDERED_ROLES.indexOf(a);
      const indexB = ORDERED_ROLES.indexOf(b);
      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      return a.localeCompare(b);
    });
  })();

  // Quick actions
  const QUICK = [
    {
      icon: <ClipboardList size={18} />,
      title: 'Mark Attendance',
      sub: 'Mark present or absent',
      color: 'purple',
      to: '/attendance',
    },
    {
      icon: <FileText size={18} />,
      title: 'Permission Dashboard',
      sub: 'View & approve requests',
      color: 'blue',
      to: '/permission-dashboard',
    },
    {
      icon: <UserPlus size={18} />,
      title: 'Coordinator Dashboard',
      sub: 'Review team operations',
      color: 'green',
      to: '/coordinator-dashboard',
    },
    {
      icon: <Download size={18} />,
      title: 'Student Dashboard',
      sub: 'Track learner activity',
      color: 'orange',
      to: '/student-dashboard',
    },
  ];

  // Bar chart data
  const chartData = roleRows.map(([role, data]) => ({
    name: role,
    present: data.present,
    absent: data.absent,
  }));

  // Donut chart data
  const statusData = [
    {
      name: 'Present',
      value: filteredStats.present,
      color: '#0f766e',
    },
    {
      name: 'Absent',
      value: filteredStats.absent,
      color: '#e11d48',
    },
  ];



  return (
    <>
      <TopBar title="Dashboard" hideSearch />

      <div className="page-content">

        {/* PAGE HEADER */}
        <div className="page-header">
          <h1>
            Welcome back,{' '}
            {user?.name?.split(' ')[0] || 'Coordinator'}! 👋
          </h1>

          <p>
            Here's what's happening in C4GT Hub today.
          </p>

          {/* TEAM SELECTOR */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginTop: '18px',
              marginBottom: '24px',
              flexWrap: 'wrap',
            }}
          >
            <label
              htmlFor="admin-team-select"
              style={{
                fontWeight: 600,
                fontSize: '14px',
              }}
            >
              Select Team:
            </label>

            <select
              id="admin-team-select"
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
              style={{
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                background: '#fff',
                minWidth: '150px',
                outline: 'none',
              }}
            >
              {TEAMS.map((team) => (
                <option key={team} value={team}>
                  {team === 'ALL' ? 'All Teams' : team}
                </option>
              ))}
            </select>

            <span
              style={{
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--text-muted)',
              }}
            >
              {selectedTeam === 'ALL'
                ? 'Showing all teams'
                : `Showing ${selectedTeam}`}
            </span>

            {searchQuery && (
              <span
                style={{
                  fontSize: '13px',
                  color: 'var(--text-muted)',
                }}
              >
                Search: <strong>"{adminSearch}"</strong>
              </span>
            )}
          </div>
        </div>

        {/* STAT CARDS */}
        <div className="stat-grid">

          <StatCard
            icon={<Users size={22} color="#2563eb" />}
            label="Total Members"
            value={loading ? '–' : filteredStats.totalMembers}
            sub={
              searchQuery
                ? 'Filtered results'
                : selectedTeam === 'ALL'
                ? 'All Registered Members'
                : `${selectedTeam} Members`
            }
            colorClass="blue"
          />

          <StatCard
            icon={<UserCheck size={22} color="#16a34a" />}
            label="Present Today"
            value={loading ? '–' : filteredStats.present}
            sub="Today's Attendance"
            colorClass="green"
          />

          <StatCard
            icon={<UserX size={22} color="#dc2626" />}
            label="Absent Today"
            value={loading ? '–' : filteredStats.absent}
            sub="Today's Absence"
            colorClass="red"
          />

          <StatCard
            icon={<Percent size={22} color="#7c3aed" />}
            label="Attendance %"
            value={
              loading
                ? '–'
                : `${filteredStats.attendancePercentage}%`
            }
            sub={
              searchQuery
                ? 'Filtered attendance'
                : "Today's Percentage"
            }
            colorClass="purple"
          />

        </div>

        {/* MAIN DASHBOARD GRID */}
        <div className="dashboard-grid">

          {/* ATTENDANCE OVERVIEW */}
          <Card>

            <CardHeader>
              <CardTitle>
                Today's Attendance Overview
                {selectedTeam !== 'ALL'
                  ? ` - ${selectedTeam}`
                  : ''}
              </CardTitle>

              <div
                style={{
                  display: 'flex',
                  gap: 8,
                  alignItems: 'center',
                }}
              >
                <span
                  style={{
                    fontSize: 12,
                    color: 'var(--text-muted)',
                  }}
                >
                  {searchQuery
                    ? `Filtered by: "${adminSearch}"`
                    : new Date().toLocaleDateString(
                        'en-IN',
                        {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          weekday: 'long',
                        }
                      )}
                </span>

                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => navigate('/attendance')}
                >
                  View All
                </button>
              </div>
            </CardHeader>
            

            <CardContent className="table-wrap">

              {loading ? (
                <div className="loading-state">
                  <div className="spinner" />
                  <p>Loading attendance…</p>
                </div>
              ) : (
                <table className="overview-table">

                  <thead>
                    <tr>
                      <th>Role</th>
                      <th>Total Members</th>
                      <th>Present</th>
                      <th>Absent</th>
                      <th>Attendance %</th>
                      <th>Status</th>
                    </tr>
                  </thead>

                  <tbody>

                    {roleRows.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          style={{
                            textAlign: 'center',
                            color: 'var(--text-muted)',
                            padding: 32,
                          }}
                        >
                          No attendance data available
                          for this selection today.
                        </td>
                      </tr>
                    ) : (
                      <>
                        {roleRows.map(([role, data]) => {

                          const percentage =
                            data.total > 0
                              ? (
                                  (data.present /
                                    data.total) *
                                  100
                                ).toFixed(1)
                              : 0;

                          const barColor =
                            percentage >= 80
                              ? '#16a34a'
                              : percentage >= 60
                              ? '#d97706'
                              : '#dc2626';

                          return (
                            <tr key={role}>

                              <td>
                                <span
                                  style={{
                                    fontWeight: 600,
                                  }}
                                >
                                  {role}
                                </span>
                              </td>

                              <td>{data.total}</td>

                              <td
                                style={{
                                  color: '#16a34a',
                                  fontWeight: 600,
                                }}
                              >
                                {data.present}
                              </td>

                              <td
                                style={{
                                  color: '#dc2626',
                                  fontWeight: 600,
                                }}
                              >
                                {data.absent}
                              </td>

                              <td
                                style={{
                                  fontWeight: 700,
                                  color: barColor,
                                }}
                              >
                                {percentage}%
                              </td>

                              <td>
                                <div
                                  style={{
                                    height: 7,
                                    background: '#e2e8f0',
                                    borderRadius: 4,
                                    width: 70,
                                    overflow: 'hidden',
                                  }}
                                >
                                  <div
                                    style={{
                                      height: '100%',
                                      width: `${percentage}%`,
                                      background: barColor,
                                      borderRadius: 4,
                                      transition:
                                        'width 0.5s ease',
                                    }}
                                  />
                                </div>
                              </td>

                            </tr>
                          );
                        })}

                        {/* TOTAL ROW */}
                        <tr
                          style={{
                            background: '#f8fafc',
                          }}
                        >
                          <td
                            style={{
                              fontWeight: 700,
                            }}
                          >
                            Total
                          </td>

                          <td
                            style={{
                              fontWeight: 700,
                            }}
                          >
                            {filteredStats.totalMembers}
                          </td>

                          <td
                            style={{
                              fontWeight: 700,
                              color: '#16a34a',
                            }}
                          >
                            {filteredStats.present}
                          </td>

                          <td
                            style={{
                              fontWeight: 700,
                              color: '#dc2626',
                            }}
                          >
                            {filteredStats.absent}
                          </td>

                          <td
                            style={{
                              fontWeight: 700,
                            }}
                          >
                            {filteredStats.attendancePercentage}%
                          </td>

                          <td />
                        </tr>
                      </>
                    )}

                  </tbody>

                </table>
              )}

            </CardContent>
          </Card>

          {/* QUICK ACTIONS */}
          <div>

            <Card style={{ marginBottom: 16 }}>

              <CardHeader>
                <CardTitle>
                  Quick Actions
                </CardTitle>
              </CardHeader>

              <CardContent
                style={{
                  padding: '12px 16px',
                }}
              >

                <div className="quick-actions">

                  {QUICK.map((quickAction) => (
                    <div
                      key={quickAction.title}
                      className="quick-action-item"
                      onClick={() =>
                        navigate(quickAction.to)
                      }
                    >

                      <div
                        className={`qa-icon ${quickAction.color}`}
                      >
                        {quickAction.icon}
                      </div>

                      <div className="qa-text">

                        <div className="qa-title">
                          {quickAction.title}
                        </div>

                        <div className="qa-sub">
                          {quickAction.sub}
                        </div>

                      </div>

                    </div>
                  ))}

                </div>

              </CardContent>
            </Card>

            {/* TODAY'S DATE */}
            <Card>

              <CardHeader>
                <CardTitle>
                  Today's Date
                </CardTitle>
              </CardHeader>

              <CardContent
                style={{
                  textAlign: 'center',
                }}
              >

                <div
                  style={{
                    fontSize: 56,
                    fontWeight: 900,
                    color: 'var(--primary)',
                    lineHeight: 1,
                  }}
                >
                  {new Date().getDate()}
                </div>

                <div
                  style={{
                    fontSize: 14,
                    color: 'var(--text-muted)',
                    marginTop: 4,
                  }}
                >
                  {new Date().toLocaleDateString(
                    'en-IN',
                    {
                      month: 'long',
                      year: 'numeric',
                    }
                  )}
                </div>

                <div
                  style={{
                    marginTop: 16,
                    fontSize: 24,
                    fontWeight: 800,
                    color: 'var(--success)',
                  }}
                >
                  {filteredStats.attendancePercentage}%
                </div>

                <div
                  style={{
                    fontSize: 11,
                    color: 'var(--text-muted)',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                  }}
                >
                  Attendance Today
                </div>

              </CardContent>

            </Card>

          </div>

        </div>

        {/* CHARTS */}
        <div className="dashboard-chart-grid">

          {/* BAR CHART */}
          <Card>

            <CardHeader>
              <CardTitle>
                Attendance by Role
                {selectedTeam !== 'ALL'
                  ? ` - ${selectedTeam}`
                  : ''}
              </CardTitle>
            </CardHeader>

            <CardContent>

              {chartData.length === 0 ? (
                <div
                  style={{
                    textAlign: 'center',
                    padding: 40,
                    color: 'var(--text-muted)',
                  }}
                >
                  No attendance data available.
                </div>
              ) : (
                <ChartContainer
                  config={{
                    present: {
                      color: '#0f766e',
                    },
                    absent: {
                      color: '#e11d48',
                    },
                  }}
                >

                  <ResponsiveContainer
                    width="100%"
                    height="100%"
                  >

                    <BarChart
                      data={chartData}
                      margin={{
                        top: 8,
                        right: 8,
                        left: -20,
                        bottom: 0,
                      }}
                    >

                      <XAxis
                        dataKey="name"
                        tick={{
                          fontSize: 11,
                        }}
                        axisLine={false}
                        tickLine={false}
                      />

                      <YAxis
                        allowDecimals={false}
                        tick={{
                          fontSize: 11,
                        }}
                        axisLine={false}
                        tickLine={false}
                      />

                      <ChartTooltipContent />

                      <Bar
                        dataKey="present"
                        name="Present"
                        fill="var(--chart-present)"
                        radius={[
                          4,
                          4,
                          0,
                          0,
                        ]}
                      />

                      <Bar
                        dataKey="absent"
                        name="Absent"
                        fill="var(--chart-absent)"
                        radius={[
                          4,
                          4,
                          0,
                          0,
                        ]}
                      />

                    </BarChart>

                  </ResponsiveContainer>

                </ChartContainer>
              )}

            </CardContent>
          </Card>

          {/* DONUT CHART */}
          <Card>

            <CardHeader>
              <CardTitle>
                Today's Status Mix
                {selectedTeam !== 'ALL'
                  ? ` - ${selectedTeam}`
                  : ''}
              </CardTitle>
            </CardHeader>

            <CardContent className="donut-card-content">

              <ChartContainer
                config={{
                  present: {
                    color: '#0f766e',
                  },
                  absent: {
                    color: '#e11d48',
                  },
                }}
                height={220}
              >

                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >

                  <PieChart>

                    <Pie
                      data={statusData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={62}
                      outerRadius={84}
                      paddingAngle={4}
                      stroke="none"
                    >

                      {statusData.map((entry) => (
                        <Cell
                          key={entry.name}
                          fill={entry.color}
                        />
                      ))}

                    </Pie>

                    <ChartTooltipContent />

                  </PieChart>

                </ResponsiveContainer>

                <div className="donut-total">

                  <strong>
                    {filteredStats.attendancePercentage}%
                  </strong>

                  <span>
                    attendance
                  </span>

                </div>

              </ChartContainer>

              <div className="chart-legend">

                {statusData.map((entry) => (
                  <span key={entry.name}>

                    <i
                      style={{
                        background: entry.color,
                      }}
                    />

                    {entry.name}{' '}

                    <strong>
                      {entry.value}
                    </strong>

                  </span>
                ))}

              </div>

            </CardContent>

          </Card>

        </div>

      </div>
    </>
  );
}