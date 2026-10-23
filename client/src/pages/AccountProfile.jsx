import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  ShieldCheck, 
  User, 
  Mail, 
  KeyRound, 
  Clock, 
  Calendar, 
  CheckCircle, 
  AlertTriangle, 
  Send, 
  Lock, 
  Sparkles,
  Layers,
  GraduationCap,
  ShieldAlert
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import BRANDING from '../config/branding';

const AccountProfile = () => {
  const { user, getSessionInfo, requestRoleElevation, refreshUser } = useAuth();
  const [sessionData, setSessionData] = useState(null);
  const [loadingSession, setLoadingSession] = useState(true);

  // Role Request State
  const [requestedRole, setRequestedRole] = useState('security');
  const [requestReason, setRequestReason] = useState('');
  const [submittingRequest, setSubmittingRequest] = useState(false);
  const [requestSuccessMsg, setRequestSuccessMsg] = useState(null);
  const [requestErrMsg, setRequestErrMsg] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchSession = async () => {
      try {
        const res = await getSessionInfo();
        if (isMounted && res.success) {
          setSessionData(res.session);
        }
      } catch (err) {
        console.warn('Failed to load session details:', err);
      } finally {
        if (isMounted) setLoadingSession(false);
      }
    };

    fetchSession();
    return () => { isMounted = false; };
  }, [getSessionInfo]);

  const handleRoleRequestSubmit = async (e) => {
    e.preventDefault();
    if (!requestReason.trim() || requestReason.trim().length < 10) {
      setRequestErrMsg('Please provide a descriptive reason (minimum 10 characters).');
      return;
    }

    setSubmittingRequest(true);
    setRequestErrMsg(null);
    setRequestSuccessMsg(null);

    try {
      const res = await requestRoleElevation(requestedRole, requestReason.trim());
      if (res.data?.success || res.success) {
        setRequestSuccessMsg(res.data?.message || res.message || 'Request submitted successfully.');
        setRequestReason('');
        await refreshUser();
      }
    } catch (err) {
      setRequestErrMsg(err.message || 'Failed to submit role elevation request.');
    } finally {
      setSubmittingRequest(false);
    }
  };

  return (
    <div className="account-profile-page" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #4c1d95, #6d28d9)',
        borderRadius: '16px',
        padding: '2rem',
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1.5rem',
        boxShadow: '0 10px 25px -5px rgba(109, 40, 217, 0.25)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <img
            src={user?.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.name || 'User')}`}
            alt={user?.name}
            style={{
              width: '68px',
              height: '68px',
              borderRadius: '50%',
              border: '3px solid #ffffff',
              backgroundColor: '#ede9fe'
            }}
          />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <h1 style={{ fontSize: '1.6rem', color: '#ffffff', margin: 0 }}>{user?.name}</h1>
              <StatusBadge status="operational" label={user?.role?.toUpperCase()} />
            </div>
            <p style={{ color: '#ddd6fe', fontSize: '0.9rem', marginTop: '0.3rem', margin: 0 }}>
              {user?.email} • Verified {BRANDING.university} Member
            </p>
          </div>
        </div>

        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.15)',
          padding: '0.6rem 1rem',
          borderRadius: '10px',
          fontSize: '0.825rem',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <GraduationCap size={16} />
          <span>Domain: <strong>{BRANDING.domain}</strong></span>
        </div>
      </div>

      {/* Grid: 2 Columns (Identity & Session Info, Role Governance) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.75rem' }}>
        {/* Card 1: Verified Identity & Security Session Details */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          padding: '1.75rem',
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)'
        }}>
          <h2 style={{ fontSize: '1.25rem', color: '#0f172a', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldCheck size={22} color="#7c3aed" /> Account &amp; Session Credentials
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
            Authorized university identity verified against backend authentication policy.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.875rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
              <span style={{ color: '#64748b', fontWeight: 600 }}>Internal User ID:</span>
              <code style={{ color: '#4338ca', fontWeight: 600 }}>{user?.id || user?._id}</code>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
              <span style={{ color: '#64748b', fontWeight: 600 }}>University Email:</span>
              <span style={{ color: '#0f172a', fontWeight: 600 }}>{user?.email}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
              <span style={{ color: '#64748b', fontWeight: 600 }}>Email Verification:</span>
              <span style={{ color: '#059669', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <CheckCircle size={16} /> Verified via Google
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
              <span style={{ color: '#64748b', fontWeight: 600 }}>Assigned System Role:</span>
              <span style={{
                textTransform: 'uppercase',
                fontWeight: 700,
                color: user?.role === 'admin' ? '#4f46e5' : user?.role === 'security' ? '#059669' : '#7c3aed'
              }}>
                {user?.role}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
              <span style={{ color: '#64748b', fontWeight: 600 }}>Authentication Method:</span>
              <span style={{ color: '#334155' }}>
                {user?.authMethod === 'dev' ? 'Lab Development Switcher' : 'Google Identity Services (GIS)'}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
              <span style={{ color: '#64748b', fontWeight: 600 }}>Session Protocol:</span>
              <span style={{ color: '#059669', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Lock size={14} /> HttpOnly Cookie JWT (7 Days)
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
              <span style={{ color: '#64748b', fontWeight: 600 }}>Last Active Login:</span>
              <span style={{ color: '#334155' }}>
                {user?.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : 'Active Session'}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
              <span style={{ color: '#64748b', fontWeight: 600 }}>Account Registered:</span>
              <span style={{ color: '#334155' }}>
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Active Member'}
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Role Governance & Administrator Approval Workflow */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          padding: '1.75rem',
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', color: '#0f172a', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <KeyRound size={22} color="#059669" /> Role Assignment &amp; Privileges
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              In accordance with university security policy, privileged access (Admin / Security) can only be assigned by authorized Administrators.
            </p>

            {/* Current Request Status Banner */}
            {user?.roleRequest && user.roleRequest.status === 'pending' && (
              <div style={{
                backgroundColor: '#fef3c7',
                border: '1px solid #fde68a',
                padding: '1rem',
                borderRadius: '10px',
                marginBottom: '1.5rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#92400e', fontWeight: 700, fontSize: '0.875rem' }}>
                  <Clock size={16} /> Pending Role Elevation Request
                </div>
                <p style={{ margin: '0.4rem 0 0', color: '#78350f', fontSize: '0.825rem', lineHeight: 1.5 }}>
                  You requested the <strong>{user.roleRequest.requestedRole?.toUpperCase()}</strong> role on{' '}
                  {new Date(user.roleRequest.requestedAt).toLocaleDateString()}. An administrator will review your justification.
                </p>
                <div style={{ marginTop: '0.4rem', fontSize: '0.785rem', color: '#92400e', fontStyle: 'italic' }}>
                  Reason submitted: "{user.roleRequest.reason}"
                </div>
              </div>
            )}

            {user?.roleRequest && user.roleRequest.status === 'approved' && (
              <div style={{
                backgroundColor: '#ecfdf5',
                border: '1px solid #a7f3d0',
                padding: '1rem',
                borderRadius: '10px',
                marginBottom: '1.5rem',
                color: '#065f46'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700 }}>
                  <CheckCircle size={16} /> Elevation Approved
                </div>
                <p style={{ margin: '0.2rem 0 0', fontSize: '0.825rem' }}>
                  Your request for elevated privileges was approved by administration.
                </p>
              </div>
            )}

            {/* Role Elevation Form for Students */}
            {user?.role === 'student' && user?.roleRequest?.status !== 'pending' && (
              <form onSubmit={handleRoleRequestSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{
                  backgroundColor: '#f5f3ff',
                  border: '1px solid #ddd6fe',
                  padding: '1rem',
                  borderRadius: '10px',
                  fontSize: '0.825rem',
                  color: '#4c1d95'
                }}>
                  <strong>Staff or Lab Assistant?</strong>
                  <br />
                  If you are assigned to Campus Security Desk or Portal Administration, submit a formal role elevation request below.
                </div>

                {requestErrMsg && (
                  <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '0.75rem', borderRadius: '8px', fontSize: '0.825rem' }}>
                    {requestErrMsg}
                  </div>
                )}

                {requestSuccessMsg && (
                  <div style={{ backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', color: '#065f46', padding: '0.75rem', borderRadius: '8px', fontSize: '0.825rem' }}>
                    {requestSuccessMsg}
                  </div>
                )}

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                    Requested Privilege Role
                  </label>
                  <select
                    value={requestedRole}
                    onChange={(e) => setRequestedRole(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.8rem',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.875rem'
                    }}
                  >
                    <option value="security">Campus Security Staff (Locker custody, handover desk)</option>
                    <option value="admin">Portal Administrator (Full moderation, user accounts)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                    Official Justification / Department Reason
                  </label>
                  <textarea
                    rows={3}
                    value={requestReason}
                    onChange={(e) => setRequestReason(e.target.value)}
                    placeholder="State your university employee/student ID, department, and supervisory approval reason..."
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.8rem',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.875rem',
                      resize: 'vertical'
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingRequest}
                  className="btn-primary"
                  style={{ alignSelf: 'flex-start', padding: '0.6rem 1.25rem' }}
                >
                  <Send size={16} /> {submittingRequest ? 'Submitting...' : 'Submit Elevation Request'}
                </button>
              </form>
            )}

            {user?.role === 'admin' && (
              <div style={{
                backgroundColor: '#eff6ff',
                border: '1px solid #bfdbfe',
                padding: '1.25rem',
                borderRadius: '10px',
                color: '#1e40af'
              }}>
                <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.95rem' }}>👑 Administrator Access Level</h4>
                <p style={{ margin: 0, fontSize: '0.85rem', lineHeight: 1.5 }}>
                  You hold top-level system authority. You can promote, reassign, or suspend user accounts under the <strong>User Accounts</strong> tab in the Admin Console.
                </p>
                <a
                  href="/admin"
                  className="btn-primary"
                  style={{ display: 'inline-flex', marginTop: '1rem', textDecoration: 'none', fontSize: '0.85rem', padding: '0.5rem 1rem' }}
                >
                  Open Admin User Management
                </a>
              </div>
            )}

            {user?.role === 'security' && (
              <div style={{
                backgroundColor: '#ecfdf5',
                border: '1px solid #a7f3d0',
                padding: '1.25rem',
                borderRadius: '10px',
                color: '#065f46'
              }}>
                <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.95rem' }}>🛡️ Security Custodian Access Level</h4>
                <p style={{ margin: 0, fontSize: '0.85rem', lineHeight: 1.5 }}>
                  You are authorized to manage Campus Physical Lockers, inspect claimant student IDs, and record in-person handovers with digital receipts.
                </p>
                <a
                  href="/security"
                  className="btn-secondary"
                  style={{ display: 'inline-flex', marginTop: '1rem', textDecoration: 'none', fontSize: '0.85rem', padding: '0.5rem 1rem', borderColor: '#059669', color: '#059669' }}
                >
                  Open Security Custody Desk
                </a>
              </div>
            )}
          </div>

          <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1rem', marginTop: '1.5rem', fontSize: '0.785rem', color: '#94a3b8' }}>
            Security compliance enforced by backend middleware • Changes audited in AuditLog
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountProfile;
