import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
  Package,
  RefreshCw,
  Clock,
  ArrowRight,
  MapPin,
  Calendar,
  AlertCircle,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis 
} from 'recharts';
import StatusBadge from '../components/StatusBadge';
import AnnouncementBanner from '../components/AnnouncementBanner';
import { getMyLostReports, getMyFoundReports, getPhotoUrl } from '../services/items.service';
import { getMyClaims } from '../services/claims.service';
import { getMyMatches } from '../services/matching.service';

const COLORS = ['#7c3aed', '#059669', '#3b82f6', '#f59e0b'];

const StudentDashboard = () => {
  const { user } = useAuth();
  const [lostItems, setLostItems] = useState([]);
  const [foundItems, setFoundItems] = useState([]);
  const [claims, setClaims] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('lost');

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [lostRes, foundRes, claimsRes, matchesRes] = await Promise.all([
        getMyLostReports().catch(() => []),
        getMyFoundReports().catch(() => []),
        getMyClaims().catch(() => []),
        getMyMatches().catch(() => [])
      ]);

      setLostItems(lostRes || []);
      setFoundItems(foundRes || []);
      setClaims(claimsRes || []);
      setMatches(matchesRes || []);
    } catch (err) {
      console.warn('Error fetching student dashboard records:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const pendingClaims = claims.filter((c) => c.status === 'pending');
  const approvedClaims = claims.filter((c) => c.status === 'approved');
  const releasedClaims = claims.filter((c) => c.status === 'handed_over');

  const chartData = [
    { name: 'Lost Reports', count: lostItems.length, color: '#7c3aed' },
    { name: 'Found Reports', count: foundItems.length, color: '#059669' },
    { name: 'Claims', count: claims.length, color: '#3b82f6' },
    { name: 'Smart Matches', count: matches.length, color: '#f59e0b' }
  ];

  const totalActivities = lostItems.length + foundItems.length + claims.length + matches.length;

  return (
    <div className="student-dashboard" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <AnnouncementBanner />

      {/* Welcome Header */}
      <div style={{
        background: 'linear-gradient(135deg, #4c1d95 0%, #6d28d9 100%)',
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
            src={user?.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.name || 'Student')}`}
            alt={user?.name}
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              border: '3px solid rgba(255, 255, 255, 0.5)',
              backgroundColor: '#5b21b6'
            }}
          />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: '1.6rem', color: '#ffffff', margin: 0, fontWeight: 700 }}>
                Welcome, {user?.name || 'GSFCU Student'}
              </h1>
              <StatusBadge status="operational" label="STUDENT PORTAL" />
            </div>
            <p style={{ color: '#ddd6fe', fontSize: '0.9rem', marginTop: '0.25rem', margin: 0 }}>
              {user?.email} • GSFC University Student ID: {user?.studentId || 'Verified'}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link to="/report-lost" className="btn-primary" style={{ backgroundColor: '#ffffff', color: '#6d28d9', borderColor: '#ffffff', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}>
            <PlusCircle size={16} /> Report Lost Item
          </Link>
          <Link to="/report-found" className="btn-secondary" style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: '#ffffff', borderColor: 'rgba(255,255,255,0.3)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Package size={16} /> Report Found Item
          </Link>
          <button onClick={fetchDashboardData} className="btn-secondary" style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: '#ffffff', borderColor: 'rgba(255,255,255,0.3)', padding: '0.6rem', display: 'flex', alignItems: 'center' }}>
            <RefreshCw size={16} className={loading ? 'spin' : ''} />
          </button>
        </div>
      </div>

      {/* Action Notification for Approved Claims */}
      {approvedClaims.length > 0 && (
        <div style={{
          backgroundColor: '#ecfdf5',
          border: '2px solid #6ee7b7',
          borderRadius: '12px',
          padding: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ backgroundColor: '#10b981', color: '#ffffff', width: '42px', height: '42px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle2 size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', color: '#065f46', margin: 0, fontWeight: 700 }}>
                Action Required: {approvedClaims.length} Approved Claim Ready for Pickup!
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#047857', margin: '0.2rem 0 0' }}>
                Your ownership claim has been approved by admin. Please visit the Campus Security Desk with your Student ID card to collect your item.
              </p>
            </div>
          </div>
          <Link
            to="/claims/my"
            className="btn-primary"
            style={{ backgroundColor: '#059669', borderColor: '#059669', textDecoration: 'none', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
          >
            View Claim &amp; Instructions <ArrowRight size={14} />
          </Link>
        </div>
      )}

      {/* Live Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
        <div className="metric-card" onClick={() => setActiveTab('lost')} style={{ cursor: 'pointer', border: activeTab === 'lost' ? '2px solid #7c3aed' : '1px solid #e2e8f0' }}>
          <div className="metric-header">
            <span className="metric-title">My Lost Reports</span>
            <div className="metric-icon-wrap" style={{ color: '#7c3aed', backgroundColor: '#f5f3ff' }}>
              <HelpCircle size={18} />
            </div>
          </div>
          <div className="metric-value">{lostItems.length}</div>
          <div className="metric-detail">{lostItems.filter((i) => i.status === 'lost').length} active reports awaiting recovery</div>
        </div>

        <div className="metric-card" onClick={() => setActiveTab('found')} style={{ cursor: 'pointer', border: activeTab === 'found' ? '2px solid #059669' : '1px solid #e2e8f0' }}>
          <div className="metric-header">
            <span className="metric-title">Found Items Reported</span>
            <div className="metric-icon-wrap" style={{ color: '#059669', backgroundColor: '#ecfdf5' }}>
              <Package size={18} />
            </div>
          </div>
          <div className="metric-value">{foundItems.length}</div>
          <div className="metric-detail">Submitted to campus custody registry</div>
        </div>

        <div className="metric-card" onClick={() => setActiveTab('claims')} style={{ cursor: 'pointer', border: activeTab === 'claims' ? '2px solid #3b82f6' : '1px solid #e2e8f0' }}>
          <div className="metric-header">
            <span className="metric-title">My Claims</span>
            <div className="metric-icon-wrap" style={{ color: '#3b82f6', backgroundColor: '#eff6ff' }}>
              <FileText size={18} />
            </div>
          </div>
          <div className="metric-value">{claims.length}</div>
          <div className="metric-detail">
            {pendingClaims.length} pending • {approvedClaims.length} approved • {releasedClaims.length} released
          </div>
        </div>

        <div className="metric-card" onClick={() => setActiveTab('matches')} style={{ cursor: 'pointer', border: activeTab === 'matches' ? '2px solid #f59e0b' : '1px solid #e2e8f0' }}>
          <div className="metric-header">
            <span className="metric-title">Smart Match Alerts</span>
            <div className="metric-icon-wrap" style={{ color: '#f59e0b', backgroundColor: '#fef3c7' }}>
              <Sparkles size={18} />
            </div>
          </div>
          <div className="metric-value">{matches.length}</div>
          <div className="metric-detail">Automated AI rule match suggestions</div>
        </div>
      </div>

      {/* Visual Activity Analytics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          padding: '1.5rem',
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <h3 style={{ fontSize: '1.1rem', color: '#0f172a', margin: '0 0 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={18} color="#7c3aed" /> Activity Distribution
          </h3>

          {totalActivities === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#64748b' }}>
              <p style={{ fontSize: '0.875rem' }}>No portal activity yet. Report a lost item or submit a claim to view charts.</p>
            </div>
          ) : (
            <div style={{ height: '220px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#7c3aed" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          padding: '1.5rem',
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', color: '#0f172a', margin: '0 0 0.5rem' }}>
              Claims &amp; Recovery Health
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 1rem' }}>
              Lifecycle tracking for student submissions at GSFC University.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                  <span style={{ color: '#475569', fontWeight: 600 }}>Active Lost Reports</span>
                  <span style={{ color: '#7c3aed', fontWeight: 700 }}>{lostItems.length} items</span>
                </div>
                <div style={{ width: '100%', height: '8px', backgroundColor: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${lostItems.length > 0 ? 100 : 0}%`, height: '100%', backgroundColor: '#7c3aed' }}></div>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                  <span style={{ color: '#475569', fontWeight: 600 }}>Claims Approved / Completed</span>
                  <span style={{ color: '#059669', fontWeight: 700 }}>
                    {approvedClaims.length + releasedClaims.length} / {claims.length || 1}
                  </span>
                </div>
                <div style={{ width: '100%', height: '8px', backgroundColor: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ 
                    width: `${claims.length > 0 ? Math.round(((approvedClaims.length + releasedClaims.length) / claims.length) * 100) : 0}%`, 
                    height: '100%', 
                    backgroundColor: '#059669' 
                  }}></div>
                </div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.5rem' }}>
            <Link to="/items" className="btn-secondary" style={{ flex: 1, textDecoration: 'none', textAlign: 'center', fontSize: '0.85rem' }}>
              <Search size={14} /> Search Database
            </Link>
            <Link to="/claims/my" className="btn-primary" style={{ flex: 1, textDecoration: 'none', textAlign: 'center', fontSize: '0.85rem' }}>
              Track My Claims
            </Link>
          </div>
        </div>
      </div>

      {/* Tabs Navigation for Activity Panels */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem', overflowX: 'auto' }}>
        <button
          onClick={() => setActiveTab('lost')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.65rem 1.25rem',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: activeTab === 'lost' ? '#7c3aed' : 'transparent',
            color: activeTab === 'lost' ? '#ffffff' : '#475569',
            fontWeight: 600,
            fontSize: '0.875rem',
            cursor: 'pointer',
            whiteSpace: 'nowrap'
          }}
        >
          <HelpCircle size={18} /> My Lost Items ({lostItems.length})
        </button>

        <button
          onClick={() => setActiveTab('claims')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.65rem 1.25rem',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: activeTab === 'claims' ? '#7c3aed' : 'transparent',
            color: activeTab === 'claims' ? '#ffffff' : '#475569',
            fontWeight: 600,
            fontSize: '0.875rem',
            cursor: 'pointer',
            whiteSpace: 'nowrap'
          }}
        >
          <FileText size={18} /> My Claims ({claims.length})
        </button>

        <button
          onClick={() => setActiveTab('matches')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.65rem 1.25rem',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: activeTab === 'matches' ? '#7c3aed' : 'transparent',
            color: activeTab === 'matches' ? '#ffffff' : '#475569',
            fontWeight: 600,
            fontSize: '0.875rem',
            cursor: 'pointer',
            whiteSpace: 'nowrap'
          }}
        >
          <Sparkles size={18} /> Suggested Matches ({matches.length})
        </button>

        <button
          onClick={() => setActiveTab('found')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.65rem 1.25rem',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: activeTab === 'found' ? '#7c3aed' : 'transparent',
            color: activeTab === 'found' ? '#ffffff' : '#475569',
            fontWeight: 600,
            fontSize: '0.875rem',
            cursor: 'pointer',
            whiteSpace: 'nowrap'
          }}
        >
          <Package size={18} /> Found Items Reported ({foundItems.length})
        </button>
      </div>

      {/* TAB CONTENT 1: MY LOST ITEMS */}
      {activeTab === 'lost' && (
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          padding: '1.75rem',
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <h2 style={{ fontSize: '1.25rem', color: '#0f172a', margin: 0 }}>
              Lost Items Reported by Me ({lostItems.length})
            </h2>
            <Link to="/report-lost" className="btn-primary" style={{ textDecoration: 'none', fontSize: '0.85rem' }}>
              <PlusCircle size={15} /> File New Lost Report
            </Link>
          </div>

          {lostItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#64748b' }}>
              <HelpCircle size={40} color="#cbd5e1" style={{ margin: '0 auto 0.75rem' }} />
              <p style={{ margin: '0 0 1rem', fontSize: '0.95rem' }}>You haven't reported any lost items yet.</p>
              <Link to="/report-lost" className="btn-primary" style={{ textDecoration: 'none' }}>
                Report a Lost Item
              </Link>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
              {lostItems.map((item) => (
                <div
                  key={item._id}
                  style={{
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '1.25rem',
                    backgroundColor: '#ffffff',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#7c3aed', backgroundColor: '#f5f3ff', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                        {item.category?.name || 'Item'}
                      </span>
                      <StatusBadge status={item.status} />
                    </div>
                    <h3 style={{ fontSize: '1.1rem', color: '#0f172a', margin: '0.35rem 0' }}>{item.name}</h3>
                    <p style={{ fontSize: '0.825rem', color: '#64748b', margin: '0.2rem 0', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <MapPin size={14} /> Last seen: {item.lastSeenLocation}
                    </p>
                    <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '0.2rem 0', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Calendar size={14} /> Reported: {new Date(item.dateLost || item.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Link to={`/items/lost/${item._id}`} style={{ fontSize: '0.85rem', color: '#7c3aed', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      View Details <ChevronRight size={14} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT 2: MY CLAIMS */}
      {activeTab === 'claims' && (
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          padding: '1.75rem',
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)'
        }}>
          <h2 style={{ fontSize: '1.25rem', color: '#0f172a', marginBottom: '1.25rem' }}>
            My Claims Status ({claims.length})
          </h2>

          {claims.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#64748b' }}>
              <FileText size={40} color="#cbd5e1" style={{ margin: '0 auto 0.75rem' }} />
              <p style={{ margin: '0 0 1rem', fontSize: '0.95rem' }}>You have not submitted any ownership claims.</p>
              <Link to="/items" className="btn-secondary" style={{ textDecoration: 'none' }}>
                Browse Found Items
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {claims.map((claim) => (
                <div
                  key={claim._id}
                  style={{
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '1.25rem',
                    backgroundColor: claim.status === 'approved' ? '#f0fdf4' : '#ffffff',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '1rem'
                  }}
                >
                  <div style={{ maxWidth: '650px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                      <StatusBadge status={claim.status} />
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        Filed on {new Date(claim.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 style={{ fontSize: '1.15rem', color: '#0f172a', margin: '0 0 0.25rem' }}>
                      {claim.foundItem?.name || 'Found Article'}
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: '#475569', margin: '0 0 0.5rem' }}>
                      Proof provided: "{claim.evidenceDescription}"
                    </p>
                    {claim.status === 'approved' && (
                      <div style={{ fontSize: '0.85rem', color: '#15803d', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <CheckCircle2 size={16} /> Ready for collection! Visit Campus Security Desk with your Student ID.
                      </div>
                    )}
                    {claim.handoverDetails?.digitalReceiptNumber && (
                      <div style={{ fontSize: '0.8rem', color: '#059669', marginTop: '0.25rem' }}>
                        Digital Receipt: <code>{claim.handoverDetails.digitalReceiptNumber}</code>
                      </div>
                    )}
                  </div>

                  <Link to="/claims/my" className="btn-secondary" style={{ textDecoration: 'none', fontSize: '0.85rem' }}>
                    View Full Claim
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT 3: SUGGESTED MATCHES */}
      {activeTab === 'matches' && (
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          padding: '1.75rem',
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)'
        }}>
          <h2 style={{ fontSize: '1.25rem', color: '#0f172a', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={20} color="#f59e0b" /> Automated AI Match Suggestions ({matches.length})
          </h2>

          {matches.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#64748b' }}>
              <Sparkles size={40} color="#cbd5e1" style={{ margin: '0 auto 0.75rem' }} />
              <p style={{ margin: 0, fontSize: '0.95rem' }}>No automated match suggestions at this moment.</p>
              <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem' }}>When a found item matches your lost report details, it will appear here automatically.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
              {matches.map((m) => {
                const score = Math.round(m.similarityScore * 100);
                return (
                  <div
                    key={m._id}
                    style={{
                      border: '1px solid #fed7aa',
                      borderRadius: '12px',
                      padding: '1.25rem',
                      backgroundColor: '#fffaf5',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#c2410c', backgroundColor: '#ffedd5', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                          {score}% SIMILARITY
                        </span>
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                          Matched {new Date(m.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <h4 style={{ fontSize: '1rem', color: '#0f172a', margin: '0.25rem 0' }}>
                        Possible match for: "{m.lostItem?.name}"
                      </h4>
                      <div style={{ fontSize: '0.85rem', color: '#475569', marginTop: '0.4rem' }}>
                        Found Article: <strong>{m.foundItem?.name}</strong>
                        <br />
                        Location: {m.foundItem?.locationFound}
                      </div>
                    </div>

                    <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                      <Link
                        to={`/items/found/${m.foundItem?._id}`}
                        className="btn-primary"
                        style={{ flex: 1, backgroundColor: '#ea580c', borderColor: '#ea580c', textDecoration: 'none', textAlign: 'center', fontSize: '0.85rem' }}
                      >
                        Claim This Item
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT 4: FOUND ITEMS REPORTED */}
      {activeTab === 'found' && (
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          padding: '1.75rem',
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <h2 style={{ fontSize: '1.25rem', color: '#0f172a', margin: 0 }}>
              Found Articles I Submitted ({foundItems.length})
            </h2>
            <Link to="/report-found" className="btn-secondary" style={{ textDecoration: 'none', fontSize: '0.85rem', borderColor: '#059669', color: '#059669' }}>
              <Package size={15} /> Report Another Found Item
            </Link>
          </div>

          {foundItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#64748b' }}>
              <Package size={40} color="#cbd5e1" style={{ margin: '0 auto 0.75rem' }} />
              <p style={{ margin: '0 0 1rem', fontSize: '0.95rem' }}>You haven't reported any found items yet.</p>
              <Link to="/report-found" className="btn-secondary" style={{ textDecoration: 'none' }}>
                Turn In a Found Belonging
              </Link>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
              {foundItems.map((item) => (
                <div
                  key={item._id}
                  style={{
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '1.25rem',
                    backgroundColor: '#ffffff',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#059669', backgroundColor: '#ecfdf5', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                        {item.category?.name || 'Item'}
                      </span>
                      <StatusBadge status={item.status} />
                    </div>
                    <h3 style={{ fontSize: '1.1rem', color: '#0f172a', margin: '0.35rem 0' }}>{item.name}</h3>
                    <p style={{ fontSize: '0.825rem', color: '#64748b', margin: '0.2rem 0' }}>
                      Found at: <strong>{item.locationFound}</strong>
                    </p>
                    <p style={{ fontSize: '0.8rem', color: '#047857', margin: '0.2rem 0' }}>
                      Storage: <em>{item.storageLocation}</em>
                    </p>
                  </div>

                  <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid #f1f5f9' }}>
                    <Link to={`/items/found/${item._id}`} style={{ fontSize: '0.85rem', color: '#059669', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      View Custody Details <ChevronRight size={14} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Account Verification Details Card */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        padding: '1.75rem',
        border: '1px solid #e2e8f0'
      }}>
        <h2 style={{ fontSize: '1.15rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ShieldCheck size={20} color="#7c3aed" /> University Credentials &amp; Session Info
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', fontSize: '0.875rem' }}>
          <div style={{ padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
            <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase' }}>Account ID</span>
            <code>{user?.id || user?._id}</code>
          </div>
          <div style={{ padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
            <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase' }}>Domain Authorization</span>
            <strong style={{ color: '#059669' }}>@gsfcuniversity.ac.in</strong>
          </div>
          <div style={{ padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
            <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase' }}>Active Role</span>
            <strong style={{ textTransform: 'capitalize' }}>{user?.role || 'student'}</strong>
          </div>
          <div style={{ padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
            <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase' }}>Profile Management</span>
            <Link to="/profile" style={{ color: '#7c3aed', fontWeight: 600, textDecoration: 'none' }}>
              Manage Account &amp; Role Requests &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
