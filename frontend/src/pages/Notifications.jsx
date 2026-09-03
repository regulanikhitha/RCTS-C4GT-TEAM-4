import React, { useState, useEffect, useMemo } from 'react';
import {
  Bell,
  Plus,
  Calendar,
  Clock,
  Users,
  Search,
  Filter,
  Edit2,
  Trash2,
  Send,
  Eye,
  X,
  CheckCircle2,
  FileText,
  AlertCircle,
  Sparkles,
  Info,
  ChevronRight,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import TopBar from '../components/TopBar';
import api from '../api/axios';

// Initial sample data for rich out-of-the-box demonstration
const INITIAL_NOTIFICATIONS = [
  {
    _id: 'notif-1',
    title: 'GSoC & C4GT Mentorship Orientation Session',
    type: 'Mentor Meeting',
    fromDate: '2026-09-03',
    toDate: '2026-09-03',
    time: '04:00 PM - 05:30 PM',
    message:
      'Mandatory orientation session for all members on open-source mentorship tracks, milestone review expectations, and weekly syncs. Join via Google Meet link shared on Slack.',
    sendTo: 'All Members (81)',
    status: 'published',
    createdBy: { name: 'Chittuluri Meena', role: 'coordinator' },
    createdAt: '2026-09-03T08:00:00.000Z',
  },
  {
    _id: 'notif-2',
    title: 'C4GT CodeSprint #4: Open Source Hackathon',
    type: 'Coding Contest',
    fromDate: '2026-09-05',
    toDate: '2026-09-07',
    time: '10:00 AM Onwards',
    message:
      '48-Hour Open Source Sprint! Submit PRs to partner repositories to earn points and claim top developer badges. Guidelines and leaderboards will be updated on the portal.',
    sendTo: 'All Members (81)',
    status: 'published',
    createdBy: { name: 'System Administrator', role: 'admin' },
    createdAt: '2026-09-02T10:30:00.000Z',
  },
  {
    _id: 'notif-3',
    title: 'National Festival Holiday Notice',
    type: 'Holiday',
    fromDate: '2026-09-10',
    toDate: '2026-09-10',
    time: 'All Day',
    message:
      'The hub workspace and scheduled physical lab sessions will remain closed on September 10th. Normal operations resume the following day.',
    sendTo: 'All Members (81)',
    status: 'published',
    createdBy: { name: 'System Administrator', role: 'admin' },
    createdAt: '2026-09-01T09:00:00.000Z',
  },
  {
    _id: 'notif-4',
    title: 'AI & Data Engineering Masterclass by Guest Speakers',
    type: 'Event',
    fromDate: '2026-09-12',
    toDate: '2026-09-12',
    time: '02:00 PM - 04:00 PM',
    message:
      'Interactive workshop on scaling vector databases and LLM orchestration with practical code walkthroughs.',
    sendTo: 'All Members (81)',
    status: 'published',
    createdBy: { name: 'Chittuluri Meena', role: 'coordinator' },
    createdAt: '2026-08-30T14:15:00.000Z',
  },
  {
    _id: 'notif-5',
    title: 'Mid-Term Attendance & Permission Compliance Review',
    type: 'Other',
    fromDate: '2026-08-25',
    toDate: '2026-08-28',
    time: '05:00 PM',
    message:
      'All members must verify their attendance records and submit pending leave permission requests before the deadline.',
    sendTo: 'All Members (81)',
    status: 'published',
    createdBy: { name: 'System Administrator', role: 'admin' },
    createdAt: '2026-08-24T11:00:00.000Z',
  },
  {
    _id: 'notif-6',
    title: '[Draft] Upcoming Project Review Schedule for Q3',
    type: 'Mentor Meeting',
    fromDate: '2026-09-18',
    toDate: '2026-09-20',
    time: '03:00 PM - 05:00 PM',
    message:
      'Draft outline for upcoming individual team syncs. Do not publish until final reviewer dates are confirmed.',
    sendTo: 'All Members (81)',
    status: 'draft',
    createdBy: { name: 'System Administrator', role: 'admin' },
    createdAt: '2026-09-02T16:00:00.000Z',
  },
];

const NOTIFICATION_TYPES = [
  'Holiday',
  'Event',
  'Coding Contest',
  'Tech Session',
  'Other',
];

export default function Notifications() {
  const { user } = useAuth();
  const isAdminOrCoordinator =
    user?.role === 'admin' || user?.role === 'coordinator';
  const isStudent = user?.role === 'student';

  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem('c4gt_notifications');
      return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  });

  const [activeTab, setActiveTab] = useState('all');
  const [selectedType, setSelectedType] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Delete Confirmation State
  const [deletingId, setDeletingId] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    type: 'Event',
    fromDate: new Date().toISOString().split('T')[0],
    toDate: new Date().toISOString().split('T')[0],
    time: '',
    message: '',
    sendTo: 'All Members (81)',
  });

  // Save to localStorage when notifications change
  useEffect(() => {
    try {
      localStorage.setItem('c4gt_notifications', JSON.stringify(notifications));
    } catch (e) {
      console.error('Failed to save notifications to localStorage', e);
    }
  }, [notifications]);

  // Fetch notifications from API if available
  useEffect(() => {
    let isMounted = true;
    const fetchApiNotifications = async () => {
      setLoading(true);
      try {
        const { data } = await api.get('/notifications');
        if (data && data.success && Array.isArray(data.data) && data.data.length > 0) {
          if (isMounted) setNotifications(data.data);
        }
      } catch (err) {
        // Fallback to local state if backend is offline or unseeded
        console.log('API backend not unreachable or empty, using local state.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchApiNotifications();
    return () => {
      isMounted = false;
    };
  }, []);

  // Helper to compute date status
  const getNotificationTimeframe = (fromDateStr, toDateStr) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const from = new Date(fromDateStr);
    from.setHours(0, 0, 0, 0);

    const to = new Date(toDateStr);
    to.setHours(23, 59, 59, 999);

    if (today >= from && today <= to) {
      return 'today';
    } else if (today < from) {
      return 'upcoming';
    } else {
      return 'past';
    }
  };

  // Filtered notifications
  const processedNotifications = useMemo(() => {
    return notifications.map((n) => ({
      ...n,
      timeframe: getNotificationTimeframe(n.fromDate, n.toDate),
    }));
  }, [notifications]);

  // Category counts
  const counts = useMemo(() => {
    const publishedOnly = processedNotifications.filter(
      (n) => n.status === 'published'
    );
    const pool = isAdminOrCoordinator ? processedNotifications : publishedOnly;

    return {
      all: pool.length,
      today: pool.filter((n) => n.timeframe === 'today' && n.status === 'published').length,
      upcoming: pool.filter((n) => n.timeframe === 'upcoming' && n.status === 'published').length,
      past: pool.filter((n) => n.timeframe === 'past' && n.status === 'published').length,
      drafts: processedNotifications.filter((n) => n.status === 'draft').length,
    };
  }, [processedNotifications, isAdminOrCoordinator]);

  // Final filtered items to display
  const displayedNotifications = useMemo(() => {
    return processedNotifications.filter((item) => {
      // Role enforcement for students
      if (isStudent && item.status !== 'published') return false;

      // Tab Filter
      if (activeTab === 'today' && (item.timeframe !== 'today' || item.status === 'draft')) return false;
      if (activeTab === 'upcoming' && (item.timeframe !== 'upcoming' || item.status === 'draft')) return false;
      if (activeTab === 'past' && (item.timeframe !== 'past' || item.status === 'draft')) return false;
      if (activeTab === 'drafts' && item.status !== 'draft') return false;

      // Type Filter
      if (selectedType !== 'All' && item.type !== selectedType) return false;

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesMsg = item.message.toLowerCase().includes(q);
        const matchesType = item.type.toLowerCase().includes(q);
        if (!matchesTitle && !matchesMsg && !matchesType) return false;
      }

      return true;
    });
  }, [processedNotifications, activeTab, selectedType, searchQuery, isStudent]);

  // Handle Form Open
  const handleOpenCreateModal = () => {
    setEditingItem(null);
    setFormData({
      title: '',
      type: 'Event',
      fromDate: new Date().toISOString().split('T')[0],
      toDate: new Date().toISOString().split('T')[0],
      time: '',
      message: '',
      sendTo: 'All Members (81)',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      type: item.type,
      fromDate: item.fromDate ? item.fromDate.split('T')[0] : '',
      toDate: item.toDate ? item.toDate.split('T')[0] : '',
      time: item.time || '',
      message: item.message,
      sendTo: 'All Members (81)',
    });
    setIsModalOpen(true);
  };

  // Handle Save (Draft or Publish)
  const handleSave = async (targetStatus) => {
    if (!formData.title.trim()) {
      toast.error('Please provide a notification title');
      return;
    }
    if (!formData.fromDate || !formData.toDate) {
      toast.error('Please select both From Date and To Date');
      return;
    }
    if (!formData.message.trim()) {
      toast.error('Please enter the message content');
      return;
    }

    const payload = {
      ...formData,
      status: targetStatus,
      sendTo: 'All Members (81)',
      createdBy: {
        name: user?.name || 'Administrator',
        role: user?.role || 'admin',
      },
    };

    try {
      if (editingItem) {
        // Try backend API update
        try {
          await api.put(`/notifications/${editingItem._id}`, payload);
        } catch {
          // fallback
        }
        setNotifications((prev) =>
          prev.map((n) =>
            n._id === editingItem._id
              ? { ...n, ...payload, updatedAt: new Date().toISOString() }
              : n
          )
        );
        toast.success(
          targetStatus === 'draft'
            ? 'Notification updated as Draft'
            : 'Notification updated and Published!'
        );
      } else {
        // Try backend API create
        let newNotif = {
          _id: 'notif-' + Date.now(),
          ...payload,
          createdAt: new Date().toISOString(),
        };

        try {
          const res = await api.post('/notifications', payload);
          if (res.data && res.data.data) {
            newNotif = res.data.data;
          }
        } catch {
          // fallback
        }

        setNotifications((prev) => [newNotif, ...prev]);
        toast.success(
          targetStatus === 'draft'
            ? 'Notification saved as Draft'
            : 'Notification published to All Members (81)!'
        );
      }

      setIsModalOpen(false);
    } catch (err) {
      toast.error('An error occurred while saving notification');
    }
  };

  // Handle Delete
  const handleDelete = async (id) => {
    try {
      try {
        await api.delete(`/notifications/${id}`);
      } catch { }
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      toast.success('Notification removed successfully');
      setDeletingId(null);
    } catch (err) {
      toast.error('Failed to delete notification');
    }
  };

  // Handle Toggle Status (Publish / Unpublish)
  const handleToggleStatus = async (item) => {
    const nextStatus = item.status === 'published' ? 'draft' : 'published';
    try {
      try {
        await api.patch(`/notifications/${item._id}/publish`);
      } catch { }

      setNotifications((prev) =>
        prev.map((n) =>
          n._id === item._id ? { ...n, status: nextStatus } : n
        )
      );

      toast.success(
        nextStatus === 'published'
          ? 'Notification is now Published to all members!'
          : 'Notification moved to Drafts'
      );
    } catch (err) {
      toast.error('Failed to change publish status');
    }
  };

  // Color mappings for Pastel UI badges
  const getTypeBadgeStyle = (type) => {
    switch (type) {
      case 'Holiday':
        return { bg: '#fce7f3', color: '#9d174d', border: '#fbcfe8', icon: '🌴' };
      case 'Event':
        return { bg: '#e0e7ff', color: '#3730a3', border: '#c7d2fe', icon: '🎉' };
      case 'Coding Contest':
        return { bg: '#fef3c7', color: '#92400e', border: '#fde68a', icon: '💻' };
      case 'Mentor Meeting':
        return { bg: '#ccfbf1', color: '#115e59', border: '#99f6e4', icon: '👥' };
      case 'Other':
      default:
        return { bg: '#f3e8ff', color: '#6b21a8', border: '#e9d5ff', icon: '📌' };
    }
  };

  const formatDateRange = (fromStr, toStr) => {
    if (!fromStr) return '';
    const f = new Date(fromStr);
    const t = toStr ? new Date(toStr) : f;

    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    const fromFormatted = f.toLocaleDateString('en-US', options);
    const toFormatted = t.toLocaleDateString('en-US', options);

    if (fromFormatted === toFormatted) {
      return fromFormatted;
    }
    return `${fromFormatted} – ${toFormatted}`;
  };

  return (
    <div className="notifications-page-container">
      <TopBar title="Notification Center" hideSearch />

      <div className="notifications-main-content">
        {/* Banner Header */}
        <div className="notif-hero-banner">
          <div className="hero-left">
            <div className="hero-icon-wrapper">
              <Bell className="hero-bell-icon" size={26} />
            </div>
            <div>
              <h2>C4GT Hub Notifications</h2>
              <p>
                {isAdminOrCoordinator
                  ? 'Create, schedule, and broadcast announcements to all 81 hub members.'
                  : 'Stay updated with holidays, upcoming events, mentorship meetings, and coding contests.'}
              </p>
            </div>
          </div>

          {isAdminOrCoordinator && (
            <button
              className="btn-create-notification"
              onClick={handleOpenCreateModal}
            >
              <Plus size={18} />
              <span>Create Notification</span>
            </button>
          )}

          {isStudent && (
            <div className="student-view-badge">
              <Eye size={16} />
              <span>Student View Mode (Read-Only)</span>
            </div>
          )}
        </div>

        {/* Info notice bar for students */}
        {isStudent && (
          <div className="student-info-alert">
            <Info size={18} className="info-icon" />
            <span>
              All notifications below are automatically targeted to <strong>All Members (81)</strong>. You have view-only access.
            </span>
          </div>
        )}

        {/* Filter & Control Toolbar */}
        <div className="notif-toolbar">
          {/* Tabs */}
          <div className="notif-tabs">
            <button
              className={`tab-item ${activeTab === 'all' ? 'active' : ''}`}
              onClick={() => setActiveTab('all')}
            >
              All
              <span className="tab-badge">{counts.all}</span>
            </button>
            <button
              className={`tab-item ${activeTab === 'today' ? 'active' : ''}`}
              onClick={() => setActiveTab('today')}
            >
              Today
              <span className="tab-badge today-badge">{counts.today}</span>
            </button>
            <button
              className={`tab-item ${activeTab === 'upcoming' ? 'active' : ''}`}
              onClick={() => setActiveTab('upcoming')}
            >
              Upcoming
              <span className="tab-badge upcoming-badge">{counts.upcoming}</span>
            </button>
            <button
              className={`tab-item ${activeTab === 'past' ? 'active' : ''}`}
              onClick={() => setActiveTab('past')}
            >
              Past
              <span className="tab-badge past-badge">{counts.past}</span>
            </button>
            {isAdminOrCoordinator && (
              <button
                className={`tab-item ${activeTab === 'drafts' ? 'active' : ''}`}
                onClick={() => setActiveTab('drafts')}
              >
                Drafts
                <span className="tab-badge draft-badge">{counts.drafts}</span>
              </button>
            )}
          </div>

          {/* Category Select */}
          <div className="notif-filters">
            <div className="type-select-box">
              <Filter size={15} className="filter-icon" />
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
              >
                <option value="All">All Types</option>
                {NOTIFICATION_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Notifications Grid / List */}
        <div className="notifications-grid">
          {displayedNotifications.length === 0 ? (
            <div className="notif-empty-state">
              <div className="empty-icon-box">
                <Bell size={32} />
              </div>
              <h3>No Notifications Found</h3>
              <p>
                {searchQuery || selectedType !== 'All'
                  ? 'No notifications match your search filters.'
                  : activeTab === 'drafts'
                    ? 'There are currently no saved drafts.'
                    : `No ${activeTab} notifications available at this moment.`}
              </p>
              {isAdminOrCoordinator && (
                <button
                  className="btn-secondary-create"
                  onClick={handleOpenCreateModal}
                >
                  <Plus size={16} /> Create First Notification
                </button>
              )}
            </div>
          ) : (
            displayedNotifications.map((item) => {
              const typeStyle = getTypeBadgeStyle(item.type);
              return (
                <div
                  key={item._id}
                  className={`notif-card ${item.status === 'draft' ? 'card-draft' : ''
                    }`}
                >
                  {/* Top Meta Bar */}
                  <div className="card-top-meta">
                    <span
                      className="type-pill"
                      style={{
                        backgroundColor: typeStyle.bg,
                        color: typeStyle.color,
                        borderColor: typeStyle.border,
                      }}
                    >
                      <span className="type-emoji">{typeStyle.icon}</span>
                      {item.type}
                    </span>

                    <div className="card-right-badges">
                      {/* Send To Badge */}
                      <span className="audience-pill" title="Audience">
                        <Users size={13} />
                        {item.sendTo || 'All Members (81)'}
                      </span>

                      {/* Status Badge (Admin/Coordinator) */}
                      {isAdminOrCoordinator && (
                        <span
                          className={`status-pill ${item.status === 'published' ? 'pub' : 'draft'
                            }`}
                        >
                          {item.status === 'published' ? (
                            <>
                              <CheckCircle2 size={12} /> Published
                            </>
                          ) : (
                            <>
                              <FileText size={12} /> Draft
                            </>
                          )}
                        </span>
                      )}

                      {/* Timeframe Pill for Students */}
                      {isStudent && (
                        <span
                          className={`timeframe-pill timeframe-${item.timeframe}`}
                        >
                          {item.timeframe === 'today'
                            ? 'Today'
                            : item.timeframe === 'upcoming'
                              ? 'Upcoming'
                              : 'Past'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Title & Body */}
                  <h3 className="notif-card-title">{item.title}</h3>
                  <p className="notif-card-msg">{item.message}</p>

                  {/* Schedule Details */}
                  <div className="card-schedule-footer">
                    <div className="schedule-info">
                      <div className="date-badge">
                        <Calendar size={14} />
                        <span>{formatDateRange(item.fromDate, item.toDate)}</span>
                      </div>
                      {item.time && (
                        <div className="time-badge">
                          <Clock size={14} />
                          <span>{item.time}</span>
                        </div>
                      )}
                    </div>

                    {/* Author & Actions */}
                    <div className="card-footer-action-row">
                      <span className="author-tag">
                        By {item.createdBy?.name || 'Admin'}
                      </span>

                      {isAdminOrCoordinator && (
                        <div className="card-action-btns">
                          <button
                            className="action-icon-btn publish-btn"
                            title={
                              item.status === 'published'
                                ? 'Unpublish / Move to Drafts'
                                : 'Publish Now'
                            }
                            onClick={() => handleToggleStatus(item)}
                          >
                            {item.status === 'published' ? (
                              <Eye size={15} />
                            ) : (
                              <Send size={15} />
                            )}
                          </button>
                          <button
                            className="action-icon-btn edit-btn"
                            title="Edit Notification"
                            onClick={() => handleOpenEditModal(item)}
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            className="action-icon-btn delete-btn"
                            title="Delete Notification"
                            onClick={() => setDeletingId(item._id)}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Create / Edit Modal (Admin & Coordinator Only) */}
      {isModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content-card">
            <div className="modal-header">
              <div className="modal-title-box">
                <div className="modal-icon-badge">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h3>
                    {editingItem
                      ? 'Edit Notification'
                      : 'Create New Notification'}
                  </h3>
                  <p>
                    Broadcast updates to all members across C4GT Hub workspace.
                  </p>
                </div>
              </div>
              <button
                className="modal-close-btn"
                onClick={() => setIsModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-body-form">
              {/* Title Field */}
              <div className="form-group">
                <label>
                  Notification Title <span className="req">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. GSoC Mentorship Orientation & Q&A"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                />
              </div>

              {/* Grid: Type & Send To */}
              <div className="form-row-2">
                <div className="form-group">
                  <label>
                    Notification Type <span className="req">*</span>
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value })
                    }
                  >
                    {NOTIFICATION_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Send To (Audience)</label>
                  <div className="fixed-sendto-input">
                    <Users size={16} />
                    <span>All Members (81)</span>
                  </div>
                  <small className="help-text">
                    Automatically targets all 81 active hub members.
                  </small>
                </div>
              </div>

              {/* Grid: From Date, To Date & Time */}
              <div className="form-row-3">
                <div className="form-group">
                  <label>
                    From Date <span className="req">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.fromDate}
                    onChange={(e) =>
                      setFormData({ ...formData, fromDate: e.target.value })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>
                    To Date <span className="req">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.toDate}
                    onChange={(e) =>
                      setFormData({ ...formData, toDate: e.target.value })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Time (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. 10:00 AM - 01:00 PM"
                    value={formData.time}
                    onChange={(e) =>
                      setFormData({ ...formData, time: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* Message Content */}
              <div className="form-group">
                <label>
                  Message / Announcement Body <span className="req">*</span>
                </label>
                <textarea
                  rows={4}
                  placeholder="Provide complete details, instructions, meeting links, or guidelines for members..."
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="modal-footer-actions">
              <button
                className="btn-cancel"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </button>
              <div className="modal-right-actions">
                <button
                  className="btn-draft"
                  onClick={() => handleSave('draft')}
                >
                  <FileText size={16} /> Save Draft
                </button>
                <button
                  className="btn-publish"
                  onClick={() => handleSave('published')}
                >
                  <Send size={16} /> Publish
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="modal-backdrop">
          <div className="confirm-delete-modal">
            <div className="confirm-icon-box">
              <AlertCircle size={28} />
            </div>
            <h3>Delete Notification?</h3>
            <p>
              Are you sure you want to delete this notification? This action cannot be undone.
            </p>
            <div className="confirm-actions">
              <button
                className="btn-cancel"
                onClick={() => setDeletingId(null)}
              >
                Cancel
              </button>
              <button
                className="btn-confirm-delete"
                onClick={() => handleDelete(deletingId)}
              >
                Delete Notification
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
