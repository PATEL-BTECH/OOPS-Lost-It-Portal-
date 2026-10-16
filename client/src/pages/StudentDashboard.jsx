import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  User, 
  Search, 
  PlusCircle, 
  HelpCircle, 
  Bell, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck, 
  FileText,
  Package
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import AnnouncementBanner from '../components/AnnouncementBanner';

const StudentDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="student-dashboard" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <AnnouncementBanner />
      {/* Welcome Header */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        padding: '2rem',
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <img
            src={user?.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.name || 'Student')}`}
            alt={user?.name}
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              border: '2px solid #7c3aed',
              backgroundColor: '#ede9fe'
            }}
          />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <h1 style={{ fontSize: '1.5rem', color: '#0f172a' }}>Welcome, {user?.name}</h1>
              <StatusBadge status="operational" label={user?.role} />
            </div>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.2rem' }}>
              {user?.email} • Verified GSFC University Student
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <a href="/report-lost" className="btn-primary" style={{ textDecoration: 'none' }}>
            <PlusCircle size={16} /> Report Lost Item
          </a>
          <a href="/report-found" className="btn-secondary" style={{ textDecoration: 'none', borderColor: '#059669', color: '#059669' }}>
            <Package size={16} /> Report Found Item
          </a>
          <a href="/items" className="btn-secondary" style={{ textDecoration: 'none' }}>
            <Search size={16} /> Browse Items
          </a>
        </div>
      </div>

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">My Lost Reports</span>
            <div className="metric-icon-wrap"><HelpCircle size={18} /></div>
          </div>
          <div className="metric-value">0</div>
          <div className="metric-detail">Active reports awaiting recovery</div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">Found Items Reported</span>
            <div className="metric-icon-wrap"><PlusCircle size={18} /></div>
          </div>
          <div className="metric-value">0</div>
          <div className="metric-detail">Submitted to campus registry</div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">My Claims</span>
            <div className="metric-icon-wrap"><FileText size={18} /></div>
          </div>
          <div className="metric-value">0</div>
          <div className="metric-detail">Claims under ownership verification</div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">Smart Matches</span>
            <div className="metric-icon-wrap"><Sparkles size={18} /></div>
          </div>
          <div className="metric-value">0</div>
          <div className="metric-detail">Automated AI/Rule match suggestions</div>
        </div>
      </div>

      {/* Account Verification Details Card */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        padding: '1.75rem',
        border: '1px solid #e2e8f0'
      }}>
        <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ShieldCheck size={20} color="#7c3aed" /> University Credentials &amp; Session Info
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', fontSize: '0.9rem' }}>
          <div style={{ padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
            <span style={{ color: '#64748b', display: 'block', fontSize: '0.78rem' }}>ACCOUNT ID</span>
            <code>{user?.id}</code>
          </div>
          <div style={{ padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
            <span style={{ color: '#64748b', display: 'block', fontSize: '0.78rem' }}>AUTHORIZED DOMAIN</span>
            <strong>@gsfcuniversity.ac.in</strong>
          </div>
          <div style={{ padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
            <span style={{ color: '#64748b', display: 'block', fontSize: '0.78rem' }}>AUTH TYPE</span>
            <span>Google Identity / JWT HttpOnly Cookie</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
