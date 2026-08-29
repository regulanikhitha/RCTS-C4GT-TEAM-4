import React from 'react';
import TopBar from '../components/TopBar';
import { BookOpen } from 'lucide-react';

export default function AdmissionPortal() {
  return (
    <>
      <TopBar title="Admission Portal" />
      <div className="page-content">
        <div className="empty-state" style={{ marginTop: 60 }}>
          <BookOpen size={48} />
          <h3>Admission Portal</h3>
          <p>Admission management features coming soon.</p>
        </div>
      </div>
    </>
  );
}
