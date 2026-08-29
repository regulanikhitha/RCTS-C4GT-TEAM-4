import React, { useState } from 'react';
import { X, Upload, Send } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const PERMISSION_TYPES = [
  'Medical Leave', 'Personal Work', 'Family Function',
  'College Exam', 'Internship/Job Interview', 'Other',
];

export default function PermissionModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({
    permissionType: '',
    fromDate: '',
    toDate: '',
    durationType: 'full_day',
    fromTime: '',
    toTime: '',
    reason: '',
    declaration: false,
  });
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.declaration) {
      toast.error('Please accept the declaration');
      return;
    }
    setLoading(true);
    try {
      await api.post('/permissions', {
        ...form,
        fromTime: form.durationType === 'full_day' ? null : form.fromTime,
        toTime: form.durationType === 'full_day' ? null : form.toTime,
      });
      toast.success('Permission request submitted!');
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 760 }}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-logo-badge">
            <span>C4GT HUB</span>
            <span>@KIET</span>
          </div>
          <div>
            <div className="modal-title">Permission Request Form</div>
            <div className="modal-subtitle">Fill in the details below to request permission.</div>
          </div>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* 1. Member Details */}
            <div className="section-heading">1. Member Details</div>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>
              Member details are auto-filled from your account.
            </p>

            {/* 2. Permission Details */}
            <div className="section-heading">2. Permission Details</div>
            <div className="form-row form-row-3" style={{ marginBottom: 14 }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Permission Type <span className="required">*</span></label>
                <select
                  className="form-input"
                  required
                  value={form.permissionType}
                  onChange={e => set('permissionType', e.target.value)}
                >
                  <option value="">Select Permission Type</option>
                  {PERMISSION_TYPES.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">From Date <span className="required">*</span></label>
                <input type="date" className="form-input" required
                  value={form.fromDate} onChange={e => set('fromDate', e.target.value)} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">To Date <span className="required">*</span></label>
                <input type="date" className="form-input" required
                  value={form.toDate} onChange={e => set('toDate', e.target.value)} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Permission Duration <span className="required">*</span></label>
              <div className="radio-group">
                {[
                  { val: 'full_day', label: 'Full Day' },
                  { val: 'half_day', label: 'Half Day' },
                  { val: 'specific_time', label: 'Specific Time' },
                ].map(opt => (
                  <label key={opt.val} className="radio-option">
                    <input type="radio" name="durationType" value={opt.val}
                      checked={form.durationType === opt.val}
                      onChange={() => set('durationType', opt.val)} />
                    {opt.label}
                  </label>
                ))}
              </div>
              {form.durationType !== 'full_day' && (
                <div className="form-row form-row-2" style={{ marginTop: 12 }}>
                  <div>
                    <label className="form-label">From Time</label>
                    <input type="time" className="form-input"
                      value={form.fromTime} onChange={e => set('fromTime', e.target.value)} />
                  </div>
                  <div>
                    <label className="form-label">To Time</label>
                    <input type="time" className="form-input"
                      value={form.toTime} onChange={e => set('toTime', e.target.value)} />
                  </div>
                </div>
              )}
              {form.durationType === 'full_day' && (
                <p style={{ fontSize: 11, color: 'var(--warning)', marginTop: 6 }}>
                  <strong>Note:</strong> If you select Full Day, time fields will be disabled.
                </p>
              )}
            </div>

            {/* 3 & 4 */}
            <div className="form-row form-row-2">
              <div>
                <div className="section-heading">3. Reason</div>
                <div className="form-group">
                  <label className="form-label">Reason for Permission <span className="required">*</span></label>
                  <textarea
                    className="form-input"
                    rows={5}
                    maxLength={500}
                    placeholder="Please provide the reason for your permission request..."
                    required
                    value={form.reason}
                    onChange={e => set('reason', e.target.value)}
                  />
                  <div className="char-counter">{form.reason.length} / 500</div>
                </div>
              </div>
              <div>
                <div className="section-heading">4. Supporting Document</div>
                <label className="form-label">Upload Document (Optional)</label>
                <div className="upload-area">
                  <Upload size={28} />
                  <div className="upload-title">Click to upload or drag and drop</div>
                  <div className="upload-sub">PDF, JPG, PNG (Max. 5MB)</div>
                </div>
              </div>
            </div>

            {/* 5. Declaration */}
            <div className="section-heading" style={{ marginTop: 16 }}>5. Declaration</div>
            <label className="radio-option" style={{ alignItems: 'flex-start', gap: 10 }}>
              <input type="checkbox" style={{ marginTop: 2, accentColor: 'var(--primary)' }}
                checked={form.declaration}
                onChange={e => set('declaration', e.target.checked)} />
              <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                I confirm that the information provided above is correct and the permission request is genuine.
              </span>
            </label>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
              {loading ? 'Submitting…' : <><Send size={15} /> Submit Permission Request</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
