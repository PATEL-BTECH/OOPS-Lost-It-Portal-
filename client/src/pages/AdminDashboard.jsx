import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  ShieldCheck, 
  Users, 
  AlertTriangle, 
  FileCheck, 
  BarChart3, 
  Lock, 
  Crown, 
  Check, 
  X, 
  Eye, 
  RefreshCw,
  Bell,
  Trash2,
  Search,
  UserX,
  UserCheck,
  TrendingUp,
  Activity,
  Layers,
  Send,
  Calendar,
  Clock,
  Filter
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import StatusBadge from '../components/StatusBadge';
import { getClaims, reviewClaim } from '../services/claims.service';
import { 
  getAnalytics, 
  getUsers, 
  updateUserRole, 
  toggleUserBlock, 
  getAuditLogs, 
  getAnnouncements, 
  createAnnouncement, 
  deleteAnnouncement 
} from '../services/admin.service';

const TABS = [
  { id: 'analytics', label: 'Analytics & Insights', icon: BarChart3 },
  { id: 'claims', label: 'Claims Moderation Queue', icon: FileCheck },
  { id: 'users', label: 'User Directory & Roles', icon: Users },
  { id: 'announcements', label: 'Campus Broadcasts', icon: Bell },
  { id: 'audit', label: 'Security Audit Trail', icon: Activity }
];

const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('analytics');
  
  // Analytics State
  const [analytics, setAnalytics] = useState(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);

  // Claims Queue State
  const [claims, setClaims] = useState([]);
  const [loadingClaims, setLoadingClaims] = useState(true);
  const [reviewingId, setReviewingId] = useState(null);

  // Users Management State
  const [usersList, setUsersList] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Announcements State
  const [announcements, setAnnouncements] = useState([]);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({ title: '', content: '', priority: 'normal' });
  const [postingAnnouncement, setPostingAnnouncement] = useState(false);

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  // Global load function
  const fetchAnalyticsData = async () => {
    setLoadingAnalytics(true);
    try {
      const res = await getAnalytics();
      setAnalytics(res);
    } catch (err) {
      console.warn('Failed to load analytics:', err);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const fetchClaimsQueue = async () => {
    setLoadingClaims(true);
    try {
      const data = await getClaims({ status: 'pending' });
      setClaims(data.claims || []);
    } catch (err) {
      console.warn('Could not load claims queue:', err);
    } finally {
      setLoadingClaims(false);
    }
  };

  const fetchUsersData = async () => {
    setLoadingUsers(true);
    try {
      const params = {};
      if (userSearch) params.search = userSearch;
      if (userRoleFilter) params.role = userRoleFilter;
      const res = await getUsers(params);
      setUsersList(res.users || []);
    } catch (err) {
      console.warn('Could not load users:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchAnnouncementsData = async () => {
    setLoadingAnnouncements(true);
    try {
      const res = await getAnnouncements();
      setAnnouncements(res.announcements || []);
    } catch (err) {
      console.warn('Could not load announcements:', err);
    } finally {
      setLoadingAnnouncements(false);
    }
  };

  const fetchAuditLogsData = async () => {
    setLoadingLogs(true);
    try {
      const res = await getAuditLogs();
      setAuditLogs(res.logs || []);
    } catch (err) {
      console.warn('Could not load audit logs:', err);
    } finally {
      setLoadingLogs(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchAnalyticsData();
    fetchClaimsQueue();
  }, []);

  // Tab switch loading
  useEffect(() => {
    if (activeTab === 'users') fetchUsersData();
    if (activeTab === 'announcements') fetchAnnouncementsData();
    if (activeTab === 'audit') fetchAuditLogsData();
    if (activeTab === 'analytics') fetchAnalyticsData();
  }, [activeTab]);

  // Handle Review
  const handleReview = async (claimId, decisionStatus) => {
    const defaultReason = decisionStatus === 'approved' 
      ? 'Ownership evidence matches recorded distinguishing features.' 
      : 'Evidence provided is insufficient or does not match item details.';

    const decisionReason = window.prompt(
      `Enter reason for ${decisionStatus.toUpperCase()} decision (sent to claimant):`,
      defaultReason
    );

    if (!decisionReason || decisionReason.trim().length < 5) {
      alert('A decision reason with at least 5 characters is required.');
      return;
    }

    setReviewingId(claimId);
    try {
      await reviewClaim(claimId, { status: decisionStatus, decisionReason: decisionReason.trim() });
      setClaims((prev) => prev.filter((c) => c._id !== claimId));
      alert(`Claim marked as ${decisionStatus.toUpperCase()}. Notification dispatched to claimant.`);
      fetchAnalyticsData();
    } catch (err) {
      alert(`Error reviewing claim: ${err.message}`);
    } finally {
      setReviewingId(null);
    }
  };

  // Handle User Role Change
  const handleRoleChange = async (userId, newRole) => {
    if (!window.confirm(`Are you sure you want to change this user's role to ${newRole.toUpperCase()}?`)) {
      return;
    }
    try {
      await updateUserRole(userId, newRole);
      alert('User role updated successfully.');
      fetchUsersData();
    } catch (err) {
      alert(`Failed to update role: ${err.message}`);
    }
  };

  // Handle User Block Toggle
  const handleToggleBlock = async (userId, currentBlocked) => {
    const action = currentBlocked ? 'unblock' : 'block';
    if (!window.confirm(`Are you sure you want to ${action} this user?`)) {
      return;
    }
    try {
      await toggleUserBlock(userId);
      alert(`User has been ${action}ed.`);
      fetchUsersData();
    } catch (err) {
      alert(`Action failed: ${err.message}`);
    }
  };

  // Handle Create Announcement
  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    if (!newAnnouncement.title.trim() || !newAnnouncement.content.trim()) {
      alert('Please fill in both title and announcement details.');
      return;
    }
    setPostingAnnouncement(true);
    try {
      await createAnnouncement(newAnnouncement);
      setNewAnnouncement({ title: '', content: '', priority: 'normal' });
      alert('Campus announcement broadcasted successfully!');
      fetchAnnouncementsData();
    } catch (err) {
      alert(`Failed to post announcement: ${err.message}`);
    } finally {
      setPostingAnnouncement(false);
    }
  };

  // Handle Delete Announcement
  const handleDeleteAnnouncement = async (id) => {
    if (!window.confirm('Delete this announcement?')) return;
    try {
      await deleteAnnouncement(id);
      setAnnouncements((prev) => prev.filter((a) => a._id !== id));
    } catch (err) {
      alert(`Error deleting announcement: ${err.message}`);
    }
  };

  const metrics = analytics?.metrics || {
    totalLost: 0,
    totalFound: 0,
    totalHandedOver: 0,
    pendingClaims: claims.length,
    totalUsers: 0,
    recoveryRate: 0
  };

  return (
    <div className="admin-dashboard" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
        borderRadius: '16px',
        padding: '2rem',
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1.5rem',
        boxShadow: '0 10px 25px -5px rgba(49, 46, 129, 0.25)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: '#4338ca',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fbbf24',
            border: '2px solid rgba(251, 191, 36, 0.4)'
          }}>
            <Crown size={32} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <h1 style={{ fontSize: '1.6rem', color: '#ffffff', margin: 0 }}>Administration Console</h1>
              <StatusBadge status="operational" label="ADMINISTRATOR" />
            </div>
            <p style={{ color: '#c7d2fe', fontSize: '0.9rem', marginTop: '0.3rem', margin: 0 }}>
              Logged in as: <strong>{user?.name}</strong> ({user?.email}) • Module Lead: Nand Patel
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button 
            onClick={() => {
              if (activeTab === 'analytics') fetchAnalyticsData();
              if (activeTab === 'claims') fetchClaimsQueue();
              if (activeTab === 'users') fetchUsersData();
              if (activeTab === 'announcements') fetchAnnouncementsData();
              if (activeTab === 'audit') fetchAuditLogsData();
            }} 
            className="btn-secondary" 
            style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: '#ffffff', borderColor: 'rgba(255,255,255,0.2)' }}
          >
            <RefreshCw size={16} /> Refresh Current Tab
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        borderBottom: '2px solid #e2e8f0',
        paddingBottom: '0.5rem',
        overflowX: 'auto'
      }}>
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.65rem 1.25rem',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: isActive ? '#4338ca' : 'transparent',
                color: isActive ? '#ffffff' : '#475569',
                fontWeight: 600,
                fontSize: '0.9rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap'
              }}
            >
              <Icon size={18} />
              {tab.label}
              {tab.id === 'claims' && claims.length > 0 && (
                <span style={{
                  backgroundColor: isActive ? '#fbbf24' : '#ef4444',
                  color: isActive ? '#1e1b4b' : '#ffffff',
                  borderRadius: '12px',
                  padding: '0.1rem 0.5rem',
                  fontSize: '0.75rem',
                  fontWeight: 700
                }}>
                  {claims.length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: ANALYTICS & INSIGHTS */}
      {activeTab === 'analytics' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Key Metric Highlights */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
            <div className="metric-card">
              <div className="metric-header">
                <span className="metric-title">Lost Items Reported</span>
                <div className="metric-icon-wrap" style={{ color: '#8b5cf6', backgroundColor: '#f5f3ff' }}>
                  <TrendingUp size={18} />
                </div>
              </div>
              <div className="metric-value">{metrics.totalLost}</div>
              <div className="metric-detail">Logged by campus community</div>
            </div>

            <div className="metric-card">
              <div className="metric-header">
                <span className="metric-title">Found Items Deposited</span>
                <div className="metric-icon-wrap" style={{ color: '#10b981', backgroundColor: '#ecfdf5' }}>
                  <Layers size={18} />
                </div>
              </div>
              <div className="metric-value">{metrics.totalFound}</div>
              <div className="metric-detail">Safe custody at Security Desk</div>
            </div>

            <div className="metric-card">
              <div className="metric-header">
                <span className="metric-title">Successfully Recovered</span>
                <div className="metric-icon-wrap" style={{ color: '#0284c7', backgroundColor: '#e0f2fe' }}>
                  <ShieldCheck size={18} />
                </div>
              </div>
              <div className="metric-value">{metrics.totalHandedOver}</div>
              <div className="metric-detail">{metrics.recoveryRate}% Overall Return Rate</div>
            </div>

            <div className="metric-card">
              <div className="metric-header">
                <span className="metric-title">Pending Claims</span>
                <div className="metric-icon-wrap" style={{ color: '#f59e0b', backgroundColor: '#fef3c7' }}>
                  <FileCheck size={18} />
                </div>
              </div>
              <div className="metric-value">{claims.length}</div>
              <div className="metric-detail">Awaiting administrative decision</div>
            </div>

            <div className="metric-card">
              <div className="metric-header">
                <span className="metric-title">Authorized Users</span>
                <div className="metric-icon-wrap" style={{ color: '#ec4899', backgroundColor: '#fdf2f8' }}>
                  <Users size={18} />
                </div>
              </div>
              <div className="metric-value">{metrics.totalUsers}</div>
              <div className="metric-detail">@gsfcuniversity.ac.in accounts</div>
            </div>
          </div>

          {/* Recharts Visualizations Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '1.5rem' }}>
            {/* Chart 1: Category Volume (Bar Chart) */}
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              padding: '1.5rem',
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)'
            }}>
              <h3 style={{ fontSize: '1.1rem', color: '#0f172a', marginBottom: '0.25rem' }}>
                Inventory by Category (Lost vs Found)
              </h3>
              <p style={{ color: '#64748b', fontSize: '0.825rem', marginBottom: '1.25rem' }}>
                Volume breakdown across registered university property classes
              </p>

              <div style={{ height: '300px', width: '100%' }}>
                {analytics?.categoryDistribution?.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.categoryDistribution}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="lost" name="Lost Items" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="found" name="Found Items" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                    Loading category distribution...
                  </div>
                )}
              </div>
            </div>

            {/* Chart 2: Portal Item Lifecycle (Pie / Donut Chart) */}
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              padding: '1.5rem',
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)'
            }}>
              <h3 style={{ fontSize: '1.1rem', color: '#0f172a', marginBottom: '0.25rem' }}>
                Item Status &amp; Recovery Lifecycle
              </h3>
              <p style={{ color: '#64748b', fontSize: '0.825rem', marginBottom: '1.25rem' }}>
                Proportional distribution of active catalog items
              </p>

              <div style={{ height: '300px', width: '100%' }}>
                {analytics?.statusDonut?.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analytics.statusDonut}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={95}
                        paddingAngle={5}
                        label
                      >
                        {analytics.statusDonut.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                    Loading status breakdown...
                  </div>
                )}
              </div>
            </div>

            {/* Chart 3: Monthly Recovery Velocity (Area Chart) */}
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              padding: '1.5rem',
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)',
              gridColumn: '1 / -1'
            }}>
              <h3 style={{ fontSize: '1.1rem', color: '#0f172a', marginBottom: '0.25rem' }}>
                6-Month Recovery &amp; Intake Trajectory
              </h3>
              <p style={{ color: '#64748b', fontSize: '0.825rem', marginBottom: '1.25rem' }}>
                Cumulative incident volume vs verified student return handovers
              </p>

              <div style={{ height: '280px', width: '100%' }}>
                {analytics?.monthlyTrends?.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analytics.monthlyTrends}>
                      <defs>
                        <linearGradient id="colorFound" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorRecovered" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0284c7" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#0284c7" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Legend />
                      <Area type="monotone" dataKey="found" name="Deposited Found Items" stroke="#10b981" fillOpacity={1} fill="url(#colorFound)" />
                      <Area type="monotone" dataKey="recovered" name="Handed Over to Owner" stroke="#0284c7" fillOpacity={1} fill="url(#colorRecovered)" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                    Loading monthly velocity...
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CLAIMS MODERATION QUEUE */}
      {activeTab === 'claims' && (
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          padding: '1.75rem',
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid #f1f5f9' }}>
            <div>
              <h2 style={{ fontSize: '1.3rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                <FileCheck size={22} color="#7c3aed" /> Ownership Claims Review Queue ({claims.length})
              </h2>
              <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '0.25rem', margin: 0 }}>
                Evaluate evidence submitted by claimants against confidential records before authorizing security handover.
              </p>
            </div>
          </div>

          {loadingClaims ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <p style={{ color: '#64748b' }}>Loading claim submissions...</p>
            </div>
          ) : claims.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#64748b' }}>
              <Check size={36} color="#10b981" style={{ margin: '0 auto 0.75rem' }} />
              <h3 style={{ fontSize: '1.1rem', color: '#0f172a' }}>All Claims Reviewed!</h3>
              <p style={{ fontSize: '0.875rem' }}>There are no pending claims awaiting administrative verification right now.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {claims.map((c) => {
                const item = c.foundItem;
                return (
                  <div
                    key={c._id}
                    style={{
                      border: '1px solid #cbd5e1',
                      borderRadius: '12px',
                      padding: '1.5rem',
                      backgroundColor: '#f8fafc',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '1rem'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                      <div>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#7c3aed', textTransform: 'uppercase' }}>
                          CLAIMANT: {c.claimant?.name}
                        </span>
                        <h3 style={{ fontSize: '1.2rem', color: '#0f172a', margin: '0.2rem 0' }}>
                          Item: {item?.name}
                        </h3>
                        <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>
                          Email: <strong>{c.claimant?.email}</strong> • Phone: {c.contactPhone || 'N/A'} • Submitted: {new Date(c.createdAt).toLocaleDateString()}
                        </p>
                      </div>

                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                        <button
                          onClick={() => handleReview(c._id, 'approved')}
                          disabled={reviewingId === c._id}
                          className="btn-primary"
                          style={{ backgroundColor: '#059669', borderColor: '#059669', padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                        >
                          <Check size={16} /> Approve Claim
                        </button>

                        <button
                          onClick={() => handleReview(c._id, 'rejected')}
                          disabled={reviewingId === c._id}
                          className="btn-danger-outline"
                          style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                        >
                          <X size={16} /> Reject Claim
                        </button>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                      <div style={{ backgroundColor: '#ffffff', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <strong style={{ fontSize: '0.785rem', color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '0.35rem' }}>
                          Student's Submitted Evidence:
                        </strong>
                        <p style={{ fontSize: '0.9rem', color: '#1e293b', whiteSpace: 'pre-line', margin: 0 }}>
                          {c.evidenceDescription}
                        </p>
                      </div>

                      <div style={{ backgroundColor: '#fef3c7', padding: '1rem', borderRadius: '8px', border: '1px solid #fde68a' }}>
                        <strong style={{ fontSize: '0.785rem', color: '#92400e', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.35rem' }}>
                          <Lock size={14} /> Finder's Confidential Clue (Staff Reference):
                        </strong>
                        <p style={{ fontSize: '0.9rem', color: '#78350f', whiteSpace: 'pre-line', margin: 0 }}>
                          {item?.verificationDetails || 'No private clue was specified by the finder.'}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: USER DIRECTORY & ROLES */}
      {activeTab === 'users' && (
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          padding: '1.75rem',
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.3rem', color: '#0f172a', margin: 0 }}>University User Accounts</h2>
              <p style={{ color: '#64748b', fontSize: '0.875rem', margin: '0.25rem 0 0' }}>
                Manage role-based privileges (`student`, `admin`, `security`) and account access
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative' }}>
                <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '10px' }} />
                <input
                  type="text"
                  placeholder="Search name or email..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') fetchUsersData(); }}
                  style={{
                    padding: '0.5rem 0.75rem 0.5rem 2.25rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.875rem'
                  }}
                />
              </div>

              <select
                value={userRoleFilter}
                onChange={(e) => {
                  setUserRoleFilter(e.target.value);
                  setTimeout(fetchUsersData, 50);
                }}
                style={{
                  padding: '0.5rem 0.75rem',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.875rem'
                }}
              >
                <option value="">All Roles</option>
                <option value="student">Students</option>
                <option value="admin">Administrators</option>
                <option value="security">Security Staff</option>
              </select>

              <button onClick={fetchUsersData} className="btn-secondary" style={{ padding: '0.5rem 0.85rem' }}>
                Filter
              </button>
            </div>
          </div>

          {loadingUsers ? (
            <p style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>Loading user directory...</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#475569' }}>
                    <th style={{ padding: '0.75rem' }}>User Profile</th>
                    <th style={{ padding: '0.75rem' }}>Domain Email</th>
                    <th style={{ padding: '0.75rem' }}>System Role</th>
                    <th style={{ padding: '0.75rem' }}>Account Status</th>
                    <th style={{ padding: '0.75rem', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {usersList.map((u) => (
                    <tr key={u.id || u._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '0.75rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <img
                            src={u.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=4338ca&color=fff`}
                            alt=""
                            style={{ width: '36px', height: '36px', borderRadius: '50%' }}
                          />
                          <div>
                            <div style={{ fontWeight: 600, color: '#0f172a' }}>{u.name}</div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>ID: {u.studentId || 'N/A'}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '0.75rem', color: '#334155' }}>{u.email}</td>
                      <td style={{ padding: '0.75rem' }}>
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u.id || u._id, e.target.value)}
                          disabled={u.id === user?._id || u._id === user?._id}
                          style={{
                            padding: '0.35rem 0.5rem',
                            borderRadius: '6px',
                            border: '1px solid #cbd5e1',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            backgroundColor: u.role === 'admin' ? '#eff6ff' : u.role === 'security' ? '#ecfdf5' : '#f8fafc',
                            color: u.role === 'admin' ? '#1d4ed8' : u.role === 'security' ? '#047857' : '#334155'
                          }}
                        >
                          <option value="student">student</option>
                          <option value="security">security</option>
                          <option value="admin">admin</option>
                        </select>
                      </td>
                      <td style={{ padding: '0.75rem' }}>
                        {u.isBlocked ? (
                          <span style={{ color: '#dc2626', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                            <UserX size={14} /> Suspended
                          </span>
                        ) : (
                          <span style={{ color: '#059669', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                            <UserCheck size={14} /> Active
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                        {u.id !== user?._id && u._id !== user?._id && (
                          <button
                            onClick={() => handleToggleBlock(u.id || u._id, u.isBlocked)}
                            className={u.isBlocked ? 'btn-secondary' : 'btn-danger-outline'}
                            style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
                          >
                            {u.isBlocked ? 'Unblock' : 'Suspend'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: CAMPUS BROADCASTS (ANNOUNCEMENTS) */}
      {activeTab === 'announcements' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Create Announcement Card */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            padding: '1.75rem',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)'
          }}>
            <h2 style={{ fontSize: '1.3rem', color: '#0f172a', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Send size={20} color="#4338ca" /> Broadcast Campus Notice
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
              Broadcast alerts to all students on the homepage regarding lost items, security drives, or found custody deadlines.
            </p>

            <form onSubmit={handleCreateAnnouncement} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '1rem' }}>
                <input
                  type="text"
                  placeholder="Notice Title (e.g. 'Found: Gold Ring in Science Block A')"
                  value={newAnnouncement.title}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                  style={{
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.9rem'
                  }}
                  required
                />

                <select
                  value={newAnnouncement.priority}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, priority: e.target.value })}
                  style={{
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.9rem'
                  }}
                >
                  <option value="normal">Priority: Normal</option>
                  <option value="urgent">Priority: Urgent / High</option>
                  <option value="low">Priority: Info / Low</option>
                </select>
              </div>

              <textarea
                placeholder="Details of the announcement, instructions for students to visit security post..."
                rows={3}
                value={newAnnouncement.content}
                onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
                style={{
                  padding: '0.65rem 0.85rem',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.9rem',
                  resize: 'vertical'
                }}
                required
              />

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="submit"
                  disabled={postingAnnouncement}
                  className="btn-primary"
                  style={{ backgroundColor: '#4338ca', borderColor: '#4338ca' }}
                >
                  <Send size={16} /> Broadcast Notice
                </button>
              </div>
            </form>
          </div>

          {/* Active Announcements List */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            padding: '1.75rem',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)'
          }}>
            <h3 style={{ fontSize: '1.2rem', color: '#0f172a', marginBottom: '1rem' }}>
              Active Campus Notices ({announcements.length})
            </h3>

            {loadingAnnouncements ? (
              <p style={{ color: '#64748b', textAlign: 'center', padding: '2rem' }}>Loading notices...</p>
            ) : announcements.length === 0 ? (
              <p style={{ color: '#64748b', textAlign: 'center', padding: '2rem' }}>No active notices currently published.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {announcements.map((a) => (
                  <div
                    key={a._id}
                    style={{
                      border: '1px solid #e2e8f0',
                      borderRadius: '10px',
                      padding: '1.25rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      backgroundColor: a.priority === 'urgent' ? '#fff1f2' : '#f8fafc'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                        <h4 style={{ margin: 0, fontSize: '1.05rem', color: '#0f172a' }}>{a.title}</h4>
                        <span style={{
                          fontSize: '0.7rem',
                          textTransform: 'uppercase',
                          fontWeight: 700,
                          padding: '0.15rem 0.5rem',
                          borderRadius: '4px',
                          backgroundColor: a.priority === 'urgent' ? '#ef4444' : '#64748b',
                          color: '#ffffff'
                        }}>
                          {a.priority}
                        </span>
                      </div>
                      <p style={{ margin: '0.25rem 0 0.5rem', fontSize: '0.875rem', color: '#334155' }}>
                        {a.content}
                      </p>
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                        Posted by {a.author?.name || 'Administrator'} • {new Date(a.createdAt).toLocaleString()}
                      </span>
                    </div>

                    <button
                      onClick={() => handleDeleteAnnouncement(a._id)}
                      className="btn-danger-outline"
                      style={{ padding: '0.4rem', border: 'none' }}
                      title="Delete Announcement"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: SECURITY AUDIT TRAIL */}
      {activeTab === 'audit' && (
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          padding: '1.75rem',
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)'
        }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.3rem', color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Activity size={22} color="#0284c7" /> Administrative Action Audit Log
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.875rem', margin: '0.25rem 0 0' }}>
              Immutable audit stream for security compliance, role promotions, and portal actions
            </p>
          </div>

          {loadingLogs ? (
            <p style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>Loading audit log...</p>
          ) : auditLogs.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>No audit records generated yet.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#475569' }}>
                    <th style={{ padding: '0.75rem' }}>Timestamp</th>
                    <th style={{ padding: '0.75rem' }}>Actor</th>
                    <th style={{ padding: '0.75rem' }}>Action Code</th>
                    <th style={{ padding: '0.75rem' }}>Resource</th>
                    <th style={{ padding: '0.75rem' }}>Event Details</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map((log) => (
                    <tr key={log._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '0.75rem', color: '#64748b', whiteSpace: 'nowrap' }}>
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td style={{ padding: '0.75rem', fontWeight: 600, color: '#0f172a' }}>
                        {log.user?.name || 'System'} ({log.user?.role || 'admin'})
                      </td>
                      <td style={{ padding: '0.75rem' }}>
                        <code style={{
                          backgroundColor: '#f1f5f9',
                          padding: '0.2rem 0.4rem',
                          borderRadius: '4px',
                          color: '#4338ca',
                          fontWeight: 600,
                          fontSize: '0.75rem'
                        }}>
                          {log.action}
                        </code>
                      </td>
                      <td style={{ padding: '0.75rem', color: '#475569' }}>
                        {log.targetResource || 'N/A'}
                      </td>
                      <td style={{ padding: '0.75rem', color: '#334155' }}>
                        {log.details}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
