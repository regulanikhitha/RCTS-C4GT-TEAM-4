import React, { useState } from 'react';
import TopBar from '../components/TopBar';
import { Download, BarChart2 } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function Reports() {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);

  const downloadPDF = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/attendance/report/${date}`, { responseType: 'blob' });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url; a.download = `C4GT_Attendance_${date}.pdf`;
      a.click(); URL.revokeObjectURL(url);
      toast.success('Report downloaded!');
    } catch {
      toast.error('Failed to generate report. Make sure the backend is running.');
    } finally { setLoading(false); }
  };

  return (
    <>
      <TopBar title="Reports" />
      <div className="page-content">
        <div className="card" style={{ maxWidth: 500 }}>
          <div className="card-header">
            <span className="card-title"><BarChart2 size={16} style={{ marginRight: 8, verticalAlign: 'middle' }} />Generate Attendance Report</span>
          </div>
          <div className="card-body">
            <div className="form-group">
              <label className="form-label">Select Date</label>
              <input type="date" className="form-input" value={date} onChange={e => setDate(e.target.value)} />
            </div>
            <button className="btn btn-primary w-full" onClick={downloadPDF} disabled={loading}>
              <Download size={15} /> {loading ? 'Generating…' : 'Download PDF Report'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
