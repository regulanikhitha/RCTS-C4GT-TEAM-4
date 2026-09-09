import React, { useRef, useState } from 'react';
import { X, Upload, Send, FileText, CheckCircle2 } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';

const PERMISSION_TYPES = [
  'Medical Leave',
  'Personal Work',
  'Family Function',
  'College Exam',
  'Internship/Job Interview',
  'Other',
];

export default function PermissionModal({ onClose, onSuccess }) {
  const fileInputRef = useRef(null);

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

  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);

  // NEW: controls the completion screen
  const [submitted, setSubmitted] = useState(false);

  const set = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // =====================================================
  // FILE SELECTION
  // =====================================================

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    // Maximum 5 MB
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File must be less than 5MB.');
      e.target.value = '';
      return;
    }

    // Allowed file types
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error('Only PDF, JPG and PNG files are allowed.');
      e.target.value = '';
      return;
    }

    setSelectedFile(file);

    toast.success('Document selected successfully.');
  };

  // =====================================================
  // REMOVE FILE
  // =====================================================

  const removeFile = () => {
    setSelectedFile(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // =====================================================
  // SUBMIT
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.permissionType) {
      toast.error('Please select permission type.');
      return;
    }

    if (!form.fromDate || !form.toDate) {
      toast.error('Please select both dates.');
      return;
    }

    if (new Date(form.toDate) < new Date(form.fromDate)) {
      toast.error('To Date cannot be before From Date.');
      return;
    }

    if (form.durationType !== 'full_day') {
      if (!form.fromTime || !form.toTime) {
        toast.error('Please select From Time and To Time.');
        return;
      }

      if (form.toTime <= form.fromTime) {
        toast.error('To Time must be after From Time.');
        return;
      }
    }

    if (!form.reason.trim()) {
      toast.error('Please enter the reason.');
      return;
    }

    if (!form.declaration) {
      toast.error('Please accept the declaration.');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();

      formData.append('permissionType', form.permissionType);
      formData.append('fromDate', form.fromDate);
      formData.append('toDate', form.toDate);
      formData.append('durationType', form.durationType);

      formData.append(
        'fromTime',
        form.durationType === 'full_day' ? '' : form.fromTime
      );

      formData.append(
        'toTime',
        form.durationType === 'full_day' ? '' : form.toTime
      );

      formData.append('reason', form.reason.trim());
      formData.append('declaration', String(form.declaration));

      if (selectedFile) {
        formData.append('attachment', selectedFile);
      }

      console.log('Submitting permission request...');

      const response = await api.post(
        '/permissions',
        formData
      );

      console.log('Permission submitted successfully:', response.data);

      // =================================================
      // SUCCESS
      // =================================================

      toast.success(
        'Permission request submitted successfully!'
      );

      // Show completion screen instead of immediately
      // closing the modal.
      setSubmitted(true);

      // Refresh parent/dashboard data if available.
      if (onSuccess) {
        onSuccess(response.data);
      }

    } catch (error) {
      console.error('Permission submission error:', error);

      if (error.response?.status === 413) {
        toast.error(
          'File is too large. Please upload a file below 5MB.'
        );
      } else if (error.response?.status === 401) {
        toast.error(
          'Your session expired. Please login again.'
        );
      } else if (error.response?.status === 403) {
        toast.error(
          'You are not allowed to submit permission requests.'
        );
      } else {
        toast.error(
          error.response?.data?.message ||
          'Failed to submit permission request.'
        );
      }

    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // SUCCESS / COMPLETION SCREEN
  // =====================================================

  if (submitted) {
    return (
      <div className="modal-overlay">
        <div
          className="modal"
          style={{
            maxWidth: 760,
            maxHeight: '90vh',
            overflowY: 'auto',
          }}
        >

          {/* HEADER */}

          <div className="modal-header">

            <div className="modal-logo-badge">
              <img
                src="/logo.svg"
                width="44"
                height="44"
                alt="C4GT HUB logo"
              />
            </div>

            <div>
              <div className="modal-title">
                Permission Request
              </div>

              <div className="modal-subtitle">
                Request submission status
              </div>
            </div>

            <Button
              type="button"
              className="modal-close"
              onClick={onClose}
            >
              <X size={18} />
            </Button>

          </div>

          {/* SUCCESS CONTENT */}

          <div
            style={{
              minHeight: 420,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              padding: 40,
            }}
          >

            {/* SUCCESS ICON */}

            <div
              style={{
                width: 76,
                height: 76,
                borderRadius: '50%',
                background: '#eef2ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 22,
                color: 'var(--primary)',
              }}
            >
              <CheckCircle2 size={42} strokeWidth={1.8} />
            </div>

            {/* TITLE */}

            <h2
              style={{
                fontSize: 24,
                fontWeight: 700,
                marginBottom: 12,
              }}
            >
              Permission Request Submitted!
            </h2>

            {/* MESSAGE */}

            <p
              style={{
                color: 'var(--text-muted)',
                fontSize: 14,
                lineHeight: 1.7,
                maxWidth: 480,
                marginBottom: 24,
              }}
            >
              Your permission request has been submitted
              successfully. It is now waiting for approval
              from the administrator or coordinator.
            </p>

            {/* STATUS */}

            <div
              style={{
                padding: '13px 24px',
                borderRadius: 10,
                background: '#fff7ed',
                border: '1px solid #fed7aa',
                marginBottom: 28,
                fontSize: 14,
              }}
            >
              <strong>Status: </strong>

              <span
                style={{
                  color: '#f59e0b',
                  fontWeight: 700,
                }}
              >
                Pending Approval
              </span>
            </div>

            {/* DONE BUTTON */}

            <Button
              type="button"
              className="btn btn-primary btn-lg"
              onClick={onClose}
            >
              Done
            </Button>

          </div>

        </div>
      </div>
    );
  }

  // =====================================================
  // MAIN FORM
  // =====================================================

  return (
    <div
      className="modal-overlay"
      onClick={(e) => {
        if (
          e.target === e.currentTarget &&
          !loading
        ) {
          onClose();
        }
      }}
    >

      <div
        className="modal"
        style={{
          maxWidth: 760,
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >

        {/* =====================================================
            HEADER
        ===================================================== */}

        <div className="modal-header">

          <div className="modal-logo-badge">
            <img
              src="/logo.svg"
              width="44"
              height="44"
              alt="C4GT HUB logo"
            />
          </div>

          <div>
            <div className="modal-title">
              Permission Request Form
            </div>

            <div className="modal-subtitle">
              Fill in the details below to request permission.
            </div>
          </div>

          <Button
            type="button"
            className="modal-close"
            onClick={onClose}
            disabled={loading}
          >
            <X size={18} />
          </Button>

        </div>

        {/* =====================================================
            FORM
        ===================================================== */}

        <form onSubmit={handleSubmit}>

          <div className="modal-body">

            {/* =================================================
                1. MEMBER DETAILS
            ================================================= */}

            <div className="section-heading">
              1. Member Details
            </div>

            <p
              style={{
                fontSize: 12,
                color: 'var(--text-muted)',
                marginBottom: 12,
              }}
            >
              Member details are auto-filled from your account.
            </p>

            {/* =================================================
                2. PERMISSION DETAILS
            ================================================= */}

            <div className="section-heading">
              2. Permission Details
            </div>

            <div
              className="form-row form-row-3"
              style={{ marginBottom: 14 }}
            >

              {/* Permission Type */}

              <div
                className="form-group"
                style={{ marginBottom: 0 }}
              >
                <Label className="form-label">
                  Permission Type{' '}
                  <span className="required">*</span>
                </Label>

                <Select value={form.permissionType} onValueChange={(value) => set('permissionType', value)} required>
                  <SelectTrigger className="form-input"><SelectValue placeholder="Select Permission Type" /></SelectTrigger>
                  <SelectContent>{PERMISSION_TYPES.map((type) => <SelectItem key={type} value={type}>{type}</SelectItem>)}</SelectContent>
                </Select>
              </div>

              {/* From Date */}

              <div
                className="form-group"
                style={{ marginBottom: 0 }}
              >
                <Label className="form-label">
                  From Date{' '}
                  <span className="required">*</span>
                </Label>

                <Input
                  type="date"
                  className="form-input"
                  required
                  value={form.fromDate}
                  onChange={(e) =>
                    set(
                      'fromDate',
                      e.target.value
                    )
                  }
                />
              </div>

              {/* To Date */}

              <div
                className="form-group"
                style={{ marginBottom: 0 }}
              >
                <Label className="form-label">
                  To Date{' '}
                  <span className="required">*</span>
                </Label>

                <Input
                  type="date"
                  className="form-input"
                  required
                  value={form.toDate}
                  onChange={(e) =>
                    set(
                      'toDate',
                      e.target.value
                    )
                  }
                />
              </div>

            </div>

            {/* =================================================
                DURATION
            ================================================= */}

            <div className="form-group">

              <Label className="form-label">
                Permission Duration{' '}
                <span className="required">*</span>
              </Label>

              <div className="radio-group">

                {[
                  {
                    val: 'full_day',
                    label: 'Full Day',
                  },
                  {
                    val: 'half_day',
                    label: 'Half Day',
                  },
                  {
                    val: 'specific_time',
                    label: 'Specific Time',
                  },
                ].map((option) => (

                  <Label
                    key={option.val}
                    className="radio-option"
                  >

                    <input
                      type="radio"
                      name="durationType"
                      value={option.val}
                      checked={
                        form.durationType ===
                        option.val
                      }
                      onChange={() =>
                        set(
                          'durationType',
                          option.val
                        )
                      }
                    />

                    {option.label}

                  </Label>

                ))}

              </div>

              {form.durationType !== 'full_day' && (

                <div
                  className="form-row form-row-2"
                  style={{ marginTop: 12 }}
                >

                  <div>

                    <Label className="form-label">
                      From Time
                    </Label>

                    <Input
                      type="time"
                      className="form-input"
                      value={form.fromTime}
                      onChange={(e) =>
                        set(
                          'fromTime',
                          e.target.value
                        )
                      }
                    />

                  </div>

                  <div>

                    <Label className="form-label">
                      To Time
                    </Label>

                    <Input
                      type="time"
                      className="form-input"
                      value={form.toTime}
                      onChange={(e) =>
                        set(
                          'toTime',
                          e.target.value
                        )
                      }
                    />

                  </div>

                </div>

              )}

              {form.durationType === 'full_day' && (

                <p
                  style={{
                    fontSize: 11,
                    color: 'var(--warning)',
                    marginTop: 6,
                  }}
                >
                  <strong>Note:</strong>{' '}
                  Full Day permission does not require time.
                </p>

              )}

            </div>

            {/* =================================================
                3 & 4. REASON + DOCUMENT
            ================================================= */}

            <div className="form-row form-row-2">

              {/* REASON */}

              <div>

                <div className="section-heading">
                  3. Reason
                </div>

                <div className="form-group">

                  <Label className="form-label">
                    Reason for Permission{' '}
                    <span className="required">*</span>
                  </Label>

                  <Textarea
                    className="form-input"
                    rows={5}
                    maxLength={500}
                    placeholder="Please provide the reason for your permission request..."
                    required
                    value={form.reason}
                    onChange={(e) =>
                      set(
                        'reason',
                        e.target.value
                      )
                    }
                  />

                  <div className="char-counter">
                    {form.reason.length} / 500
                  </div>

                </div>

              </div>

              {/* DOCUMENT */}

              <div>

                <div className="section-heading">
                  4. Supporting Document
                </div>

                <Label className="form-label">
                  Upload Document (Optional)
                </Label>

                {/* Hidden File Input */}

                <Input
                  ref={fileInputRef}
                  id="permission-file"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                  onChange={handleFileChange}
                  style={{
                    position: 'absolute',
                    width: 1,
                    height: 1,
                    opacity: 0,
                    pointerEvents: 'none',
                  }}
                />

                {/* Upload Box */}

                {!selectedFile ? (

                  <div
                    className="upload-area"
                    role="button"
                    tabIndex={0}
                    onClick={() =>
                      fileInputRef.current?.click()
                    }
                    onKeyDown={(e) => {
                      if (
                        e.key === 'Enter' ||
                        e.key === ' '
                      ) {
                        e.preventDefault();
                        fileInputRef.current?.click();
                      }
                    }}
                    style={{
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >

                    <Upload size={28} />

                    <div className="upload-title">
                      Click to upload
                    </div>

                    <div className="upload-sub">
                      PDF, JPG, PNG (Max. 5MB)
                    </div>

                  </div>

                ) : (

                  /* Selected File */

                  <div
                    style={{
                      border:
                        '1px solid var(--border)',
                      borderRadius: 10,
                      padding: 14,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 10,
                      marginTop: 8,
                    }}
                  >

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        minWidth: 0,
                      }}
                    >

                      <FileText
                        size={28}
                        color="var(--primary)"
                      />

                      <div
                        style={{
                          minWidth: 0,
                        }}
                      >

                        <div
                          style={{
                            fontSize: 13,
                            fontWeight: 600,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {selectedFile.name}
                        </div>

                        <div
                          style={{
                            fontSize: 11,
                            color:
                              'var(--text-muted)',
                          }}
                        >
                          {(
                            selectedFile.size /
                            (1024 * 1024)
                          ).toFixed(2)}{' '}
                          MB
                        </div>

                      </div>

                    </div>

                    <Button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={removeFile}
                      disabled={loading}
                    >
                      <X size={16} />
                    </Button>

                  </div>

                )}

              </div>

            </div>

            {/* =================================================
                5. DECLARATION
            ================================================= */}

            <div
              className="section-heading"
              style={{ marginTop: 16 }}
            >
              5. Declaration
            </div>

            <Label
              className="radio-option"
              style={{
                alignItems: 'flex-start',
                gap: 10,
              }}
            >

              <Checkbox checked={form.declaration} onCheckedChange={(checked) => set('declaration', checked === true)} style={{ marginTop: 2 }} />

              <span
                style={{
                  fontSize: 13,
                  color: 'var(--text-secondary)',
                }}
              >
                I confirm that the information provided
                above is correct and the permission request
                is genuine.
              </span>

            </Label>

          </div>

          {/* =================================================
              FOOTER
          ================================================= */}

          <div className="modal-footer">

            <Button
              type="button"
              className="btn btn-outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={loading}
            >

              {loading ? (
                'Submitting…'
              ) : (
                <>
                  <Send size={15} />
                  Submit Permission Request
                </>
              )}

            </Button>

          </div>

        </form>

      </div>

    </div>
  );
}