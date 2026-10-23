import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  ShieldCheck, 
  Package, 
  CheckCircle, 
  Archive, 
  UserCheck, 
  MapPin, 
  Clock, 
  Receipt, 
  RefreshCw, 
  Search, 
  FileText, 
  Boxes, 
  KeyRound, 
  PlusCircle, 
  Check, 
  AlertCircle, 
  X,
  History,
  Building,
  Info
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import { getClaims, recordHandover } from '../services/claims.service';
import { getFoundItems, getPhotoUrl } from '../services/items.service';
import { getLockers, assignLocker, vacateLocker } from '../services/locker.service';

const SecurityDashboard = () => {
  const { user } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState('handover');
  const [approvedClaims, setApprovedClaims] = useState([]);
  const [completedHandovers, setCompletedHandovers] = useState([]);
  const [lockers, setLockers] = useState([]);
  const [custodyLocations, setCustodyLocations] = useState([]);
  const [lockerSummary, setLockerSummary] = useState({ total: 16, occupied: 0, vacant: 16, occupancyRate: 0 });
  const [availableItems, setAvailableItems] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [selectedZone, setSelectedZone] = useState('ALL');

  // Modals state
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [activeLockerForHistory, setActiveLockerForHistory] = useState(null);

  // Assignment form state
  const [assignForm, setAssignForm] = useState({
    lockerId: '',
    foundItemId: '',
    custodyLocationId: 'CENTRAL_DESK',
    notes: ''
  });
  const [submittingAssign, setSubmittingAssign] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchSecurityData = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const [approvedRes, completedRes, lockerRes, itemsRes] = await Promise.all([
        getClaims({ status: 'approved' }).catch(() => ({ claims: [] })),
        getClaims({ status: 'handed_over' }).catch(() => ({ claims: [] })),
        getLockers().catch(() => ({ lockers: [], custodyLocations: [], summary: {} })),
        getFoundItems({ status: 'available' }).catch(() => ({ items: [] }))
      ]);

      setApprovedClaims(approvedRes.claims || []);
      setCompletedHandovers(completedRes.claims || []);
      setLockers(lockerRes.lockers || []);
      setCustodyLocations(lockerRes.custodyLocations || []);
      if (lockerRes.summary) {
        setLockerSummary(lockerRes.summary);
      }
      setAvailableItems(itemsRes.items || []);
    } catch (err) {
      console.warn('Failed to load security claims data:', err);
      setErrorMsg('Failed to fetch some security desk data. Please refresh.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSecurityData();
  }, []);

  const handlePerformHandover = async (claimId, claimantName) => {
    const claimantIdProof = window.prompt(
      `In-Person Identity Verification for: ${claimantName}\n\nEnter verified University Student ID or Govt ID Number:`,
      'GSFCU-2024-'
    );

    if (!claimantIdProof || claimantIdProof.trim().length < 3) {
      alert('Verification cancelled: Valid student ID proof number is required.');
      return;
    }

    const handoverNotes = window.prompt(
      'Enter physical custody handover remarks:',
      'Physical item inspected by claimant. Identity verified against university records. Released.'
    );

    setProcessingId(claimId);
    try {
      const res = await recordHandover(claimId, {
        claimantIdProof: claimantIdProof.trim(),
        handoverNotes: handoverNotes || 'Claimant verified in person. Item released.'
      });

      alert(`✅ Handover Complete!\nDigital Receipt #: ${res.receiptNumber}\nItem record closed and storage locker vacated.`);
      fetchSecurityData();
    } catch (err) {
      alert(`Handover record failed: ${err.message}`);
    } finally {
      setProcessingId(null);
    }
  };

  const handleOpenAssignModal = (preselectedLockerId = '') => {
    setAssignForm({
      lockerId: preselectedLockerId,
      foundItemId: '',
      custodyLocationId: custodyLocations[1]?.id || 'CENTRAL_DESK',
      notes: ''
    });
    setErrorMsg('');
    setSuccessMsg('');
    setAssignModalOpen(true);
  };

  const handleSubmitAssignment = async (e) => {
    e.preventDefault();
    if (!assignForm.lockerId) {
      setErrorMsg('Please select a target vacant locker.');
      return;
    }
    if (!assignForm.foundItemId) {
      setErrorMsg('Please select a found item to deposit.');
      return;
    }

    setSubmittingAssign(true);
    setErrorMsg('');
    try {
      await assignLocker(assignForm);
      setSuccessMsg('Item securely locked into locker and custody record updated!');
      setTimeout(() => {
        setAssignModalOpen(false);
        setSuccessMsg('');
      }, 1200);
      fetchSecurityData();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to assign item to locker.');
    } finally {
      setSubmittingAssign(false);
    }
  };

  const handleVacateLocker = async (locker) => {
    const reason = window.prompt(
      `Vacate Locker ${locker.lockerNumber} (${locker.label})?\n\nEnter reason for relocating or clearing custody:`,
      'Item transferred to secondary vault or verification inspection'
    );

    if (!reason || reason.trim().length < 5) {
      alert('Operation cancelled: An audit reason of at least 5 characters is required.');
      return;
    }

    try {
      await vacateLocker(locker._id, { reason: reason.trim() });
      alert(`Locker ${locker.lockerNumber} successfully vacated.`);
      fetchSecurityData();
    } catch (err) {
      alert(`Failed to vacate locker: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleViewHistory = (locker) => {
    setActiveLockerForHistory(locker);
    setHistoryModalOpen(true);
  };

  const filteredLockers = selectedZone === 'ALL' 
    ? lockers 
    : lockers.filter((l) => l.zone === selectedZone);

  const vacantLockers = lockers.filter((l) => l.status === 'vacant');

  return (
    <div className="security-dashboard" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #064e3b 0%, #047857 100%)',
        borderRadius: '16px',
        padding: '2rem',
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1.5rem',
        boxShadow: '0 10px 25px -5px rgba(4, 120, 87, 0.25)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: '#059669',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            border: '2px solid rgba(255, 255, 255, 0.3)'
          }}>
            <ShieldCheck size={32} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: '1.5rem', color: '#ffffff', margin: 0, fontWeight: 700 }}>
                Campus Security Custody Desk
              </h1>
              <StatusBadge status="operational" label="SECURITY STAFF" />
            </div>
            <p style={{ color: '#a7f3d0', fontSize: '0.9rem', marginTop: '0.3rem', margin: 0 }}>
              Staff: <strong>{user?.name}</strong> ({user?.email}) • Lead: Neerja (Custody &amp; Lockers)
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button 
            onClick={() => handleOpenAssignModal()}
            className="btn-primary" 
            style={{ backgroundColor: '#10b981', borderColor: '#10b981', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <PlusCircle size={16} /> Assign Item to Locker
          </button>
          <button 
            onClick={fetchSecurityData} 
            className="btn-secondary" 
            style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: '#ffffff', borderColor: 'rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <RefreshCw size={16} className={loading ? 'spin' : ''} /> Refresh Desk
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">Approved For Handover</span>
            <div className="metric-icon-wrap" style={{ color: '#3b82f6', backgroundColor: '#eff6ff' }}>
              <Clock size={18} />
            </div>
          </div>
          <div className="metric-value">{approvedClaims.length}</div>
          <div className="metric-detail">Awaiting claimant student ID check</div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">Physical Locker Occupancy</span>
            <div className="metric-icon-wrap" style={{ color: '#8b5cf6', backgroundColor: '#f5f3ff' }}>
              <Boxes size={18} />
            </div>
          </div>
          <div className="metric-value">
            {lockerSummary.occupied} / {lockerSummary.total || lockers.length}
          </div>
          <div className="metric-detail">
            {lockerSummary.occupancyRate}% in custody • {lockerSummary.vacant} vacant
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">Completed Handovers</span>
            <div className="metric-icon-wrap" style={{ color: '#059669', backgroundColor: '#ecfdf5' }}>
              <CheckCircle size={18} />
            </div>
          </div>
          <div className="metric-value">{completedHandovers.length}</div>
          <div className="metric-detail">Digital receipts issued &amp; archived</div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">Active Intake Posts</span>
            <div className="metric-icon-wrap" style={{ color: '#f59e0b', backgroundColor: '#fef3c7' }}>
              <Building size={18} />
            </div>
          </div>
          <div className="metric-value">{custodyLocations.length || 5} Posts</div>
          <div className="metric-detail">Option B Configured Campus Gates</div>
        </div>
      </div>

      {/* Desk Sub Navigation */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem', overflowX: 'auto' }}>
        <button
          onClick={() => setActiveSubTab('handover')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.65rem 1.25rem',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: activeSubTab === 'handover' ? '#047857' : 'transparent',
            color: activeSubTab === 'handover' ? '#ffffff' : '#475569',
            fontWeight: 600,
            fontSize: '0.875rem',
            cursor: 'pointer',
            whiteSpace: 'nowrap'
          }}
        >
          <UserCheck size={18} /> In-Person Handover Queue ({approvedClaims.length})
        </button>

        <button
          onClick={() => setActiveSubTab('lockers')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.65rem 1.25rem',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: activeSubTab === 'lockers' ? '#047857' : 'transparent',
            color: activeSubTab === 'lockers' ? '#ffffff' : '#475569',
            fontWeight: 600,
            fontSize: '0.875rem',
            cursor: 'pointer',
            whiteSpace: 'nowrap'
          }}
        >
          <Boxes size={18} /> Physical Storage Lockers ({lockers.length})
        </button>

        <button
          onClick={() => setActiveSubTab('archive')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.65rem 1.25rem',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: activeSubTab === 'archive' ? '#047857' : 'transparent',
            color: activeSubTab === 'archive' ? '#ffffff' : '#475569',
            fontWeight: 600,
            fontSize: '0.875rem',
            cursor: 'pointer',
            whiteSpace: 'nowrap'
          }}
        >
          <Receipt size={18} /> Handover Archive ({completedHandovers.length})
        </button>

        <button
          onClick={() => setActiveSubTab('custody_posts')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.65rem 1.25rem',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: activeSubTab === 'custody_posts' ? '#047857' : 'transparent',
            color: activeSubTab === 'custody_posts' ? '#ffffff' : '#475569',
            fontWeight: 600,
            fontSize: '0.875rem',
            cursor: 'pointer',
            whiteSpace: 'nowrap'
          }}
        >
          <MapPin size={18} /> Campus Custody Posts ({custodyLocations.length})
        </button>
      </div>

      {/* SUB-VIEW 1: IN-PERSON HANDOVER QUEUE */}
      {activeSubTab === 'handover' && (
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          padding: '1.75rem',
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)'
        }}>
          <div style={{ marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.25rem', color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <UserCheck size={22} color="#047857" /> Pending In-Person Physical Handovers
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.875rem', margin: '0.25rem 0 0' }}>
              These claims have passed academic admin review. Security staff must physically verify the student's ID card before releasing the item.
            </p>
          </div>

          {approvedClaims.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#64748b' }}>
              <CheckCircle size={44} color="#10b981" style={{ margin: '0 auto 0.75rem' }} />
              <h3 style={{ fontSize: '1.1rem', color: '#0f172a', margin: '0 0 0.25rem' }}>All Caught Up</h3>
              <p style={{ fontSize: '0.875rem', margin: 0 }}>No approved claims awaiting physical handover at this time.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {approvedClaims.map((claim) => {
                const item = claim.foundItem;
                return (
                  <div
                    key={claim._id}
                    style={{
                      border: '1px solid #bbf7d0',
                      borderRadius: '12px',
                      padding: '1.25rem',
                      backgroundColor: '#f0fdf4',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '1rem'
                    }}
                  >
                    <div style={{ maxWidth: '650px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#047857', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          APPROVED FOR HANDOVER
                        </span>
                        {item?.category?.name && (
                          <span style={{ fontSize: '0.75rem', backgroundColor: '#e2e8f0', color: '#475569', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                            {item.category.name}
                          </span>
                        )}
                      </div>
                      <h3 style={{ fontSize: '1.2rem', color: '#064e3b', margin: '0 0 0.35rem' }}>
                        {item?.name}
                      </h3>
                      <p style={{ fontSize: '0.875rem', color: '#065f46', lineHeight: 1.5, margin: 0 }}>
                        Claimant: <strong>{claim.claimant?.name}</strong> ({claim.claimant?.email}) • Phone: {claim.contactPhone || 'N/A'}
                        <br />
                        Current Custody Location: <strong>{item?.storageLocation || 'Security Central Desk'}</strong>
                        <br />
                        Admin Approval Justification: <em>"{claim.decisionReason || 'Evidence verified by administration'}"</em>
                      </p>
                    </div>

                    <button
                      onClick={() => handlePerformHandover(claim._id, claim.claimant?.name)}
                      disabled={processingId === claim._id}
                      className="btn-primary"
                      style={{ backgroundColor: '#059669', borderColor: '#059669', padding: '0.65rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                    >
                      <UserCheck size={16} /> Verify ID &amp; Release Item
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SUB-VIEW 2: PHYSICAL LOCKERS (16 LOCKERS) */}
      {activeSubTab === 'lockers' && (
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          padding: '1.75rem',
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.3rem', color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Boxes size={22} color="#047857" /> Central Custody Lockers (Zones A - D)
              </h2>
              <p style={{ color: '#64748b', fontSize: '0.875rem', margin: '0.25rem 0 0' }}>
                16 initialized physical lockers. State is derived strictly from assignment &amp; handover releases.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', gap: '0.25rem', backgroundColor: '#f1f5f9', padding: '0.25rem', borderRadius: '8px' }}>
                {['ALL', 'Zone A', 'Zone B', 'Zone C', 'Zone D'].map((zone) => (
                  <button
                    key={zone}
                    onClick={() => setSelectedZone(zone)}
                    style={{
                      border: 'none',
                      padding: '0.35rem 0.75rem',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      backgroundColor: selectedZone === zone ? '#047857' : 'transparent',
                      color: selectedZone === zone ? '#ffffff' : '#64748b'
                    }}
                  >
                    {zone}
                  </button>
                ))}
              </div>

              <button
                onClick={() => handleOpenAssignModal()}
                className="btn-primary"
                style={{ backgroundColor: '#047857', borderColor: '#047857', padding: '0.45rem 0.9rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
              >
                <PlusCircle size={15} /> Deposit Item
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.25rem' }}>
            {filteredLockers.map((lkr) => {
              const isOccupied = lkr.status === 'occupied';
              const item = lkr.currentFoundItem;

              return (
                <div
                  key={lkr._id || lkr.lockerNumber}
                  style={{
                    border: `2px solid ${isOccupied ? '#fca5a5' : '#86efac'}`,
                    borderRadius: '12px',
                    padding: '1.25rem',
                    backgroundColor: isOccupied ? '#fef2f2' : '#f0fdf4',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.6rem',
                    position: 'relative'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, fontSize: '1.05rem', color: '#0f172a' }}>
                      {lkr.lockerNumber}
                    </span>
                    <span style={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      padding: '0.2rem 0.55rem',
                      borderRadius: '4px',
                      backgroundColor: isOccupied ? '#dc2626' : '#16a34a',
                      color: '#ffffff'
                    }}>
                      {lkr.status.toUpperCase()}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    {lkr.label} • <strong>{lkr.capacityType || 'Bin'}</strong>
                  </div>

                  <div style={{
                    marginTop: '0.25rem',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    fontSize: '0.85rem',
                    minHeight: '60px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center'
                  }}>
                    {isOccupied && item ? (
                      <div>
                        <div style={{ fontWeight: 600, color: '#991b1b', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          📦 {item.name}
                        </div>
                        {item.category?.name && (
                          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.15rem' }}>
                            Type: {item.category.name}
                          </div>
                        )}
                        {lkr.assignedAt && (
                          <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                            Stored: {new Date(lkr.assignedAt).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span style={{ color: '#16a34a', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Check size={14} /> Ready for intake
                      </span>
                    )}
                  </div>

                  {/* Actions for this locker */}
                  <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.4rem', justifyContent: 'flex-end' }}>
                    <button
                      onClick={() => handleViewHistory(lkr)}
                      title="View Locker Audit History"
                      style={{
                        padding: '0.35rem 0.6rem',
                        fontSize: '0.75rem',
                        border: '1px solid #cbd5e1',
                        borderRadius: '6px',
                        backgroundColor: '#ffffff',
                        color: '#475569',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem'
                      }}
                    >
                      <History size={12} /> Log
                    </button>

                    {isOccupied ? (
                      <button
                        onClick={() => handleVacateLocker(lkr)}
                        style={{
                          padding: '0.35rem 0.6rem',
                          fontSize: '0.75rem',
                          border: '1px solid #fecaca',
                          borderRadius: '6px',
                          backgroundColor: '#fee2e2',
                          color: '#b91c1c',
                          cursor: 'pointer',
                          fontWeight: 600
                        }}
                      >
                        Vacate
                      </button>
                    ) : (
                      <button
                        onClick={() => handleOpenAssignModal(lkr._id)}
                        style={{
                          padding: '0.35rem 0.6rem',
                          fontSize: '0.75rem',
                          border: '1px solid #bbf7d0',
                          borderRadius: '6px',
                          backgroundColor: '#dcfce7',
                          color: '#15803d',
                          cursor: 'pointer',
                          fontWeight: 600
                        }}
                      >
                        Assign
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUB-VIEW 3: ARCHIVE & DIGITAL RECEIPTS */}
      {activeSubTab === 'archive' && (
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          padding: '1.75rem',
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)'
        }}>
          <h2 style={{ fontSize: '1.25rem', color: '#0f172a', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Receipt size={20} color="#7c3aed" /> Handover Archive &amp; Tamper-Proof Digital Receipts ({completedHandovers.length})
          </h2>

          {completedHandovers.length === 0 ? (
            <p style={{ color: '#64748b', fontSize: '0.875rem' }}>No completed handovers recorded in system archives yet.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#475569', backgroundColor: '#f8fafc' }}>
                    <th style={{ padding: '0.75rem' }}>Digital Receipt #</th>
                    <th style={{ padding: '0.75rem' }}>Item Name</th>
                    <th style={{ padding: '0.75rem' }}>Claimant</th>
                    <th style={{ padding: '0.75rem' }}>Verified ID Proof</th>
                    <th style={{ padding: '0.75rem' }}>Handover Staff</th>
                    <th style={{ padding: '0.75rem' }}>Date &amp; Time</th>
                    <th style={{ padding: '0.75rem' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {completedHandovers.map((c) => (
                    <tr key={c._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '0.75rem' }}>
                        <code style={{ color: '#059669', fontWeight: 700, backgroundColor: '#ecfdf5', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>
                          {c.handoverDetails?.digitalReceiptNumber || 'N/A'}
                        </code>
                      </td>
                      <td style={{ padding: '0.75rem', fontWeight: 600, color: '#0f172a' }}>
                        {c.foundItem?.name || 'Item'}
                      </td>
                      <td style={{ padding: '0.75rem' }}>
                        {c.claimant?.name}
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{c.claimant?.email}</div>
                      </td>
                      <td style={{ padding: '0.75rem', fontFamily: 'monospace' }}>
                        {c.handoverDetails?.claimantIdProof || 'Verified in Person'}
                      </td>
                      <td style={{ padding: '0.75rem', color: '#475569' }}>
                        {c.handoverDetails?.verifiedBy?.name || 'Security Desk'}
                      </td>
                      <td style={{ padding: '0.75rem', color: '#64748b' }}>
                        {c.handoverDetails?.handoverDate ? new Date(c.handoverDetails.handoverDate).toLocaleString() : 'Recent'}
                      </td>
                      <td style={{ padding: '0.75rem' }}>
                        <StatusBadge status="handed_over" label="RELEASED" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* SUB-VIEW 4: CUSTODY POSTS (OPTION B) */}
      {activeSubTab === 'custody_posts' && (
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          padding: '1.75rem',
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)'
        }}>
          <div style={{ marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.25rem', color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MapPin size={22} color="#047857" /> Configured Campus Custody &amp; Intake Points (Option B)
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.875rem', margin: '0.25rem 0 0' }}>
              Official physical intake locations across the GSFC University campus where found articles are received and logged.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
            {custodyLocations.map((loc) => (
              <div
                key={loc.id}
                style={{
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '1.25rem',
                  backgroundColor: '#f8fafc',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#047857', backgroundColor: '#dcfce7', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                    {loc.zone}
                  </span>
                  <code style={{ fontSize: '0.75rem', color: '#64748b' }}>{loc.id}</code>
                </div>
                <h3 style={{ fontSize: '1.05rem', color: '#0f172a', margin: '0.2rem 0' }}>
                  {loc.name}
                </h3>
                <div style={{ fontSize: '0.825rem', color: '#475569' }}>
                  Building: <strong>{loc.building}</strong>
                </div>
                <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0.25rem 0 0', lineHeight: 1.4 }}>
                  {loc.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ASSIGN TO LOCKER MODAL */}
      {assignModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '520px',
            padding: '2rem',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)',
            position: 'relative'
          }}>
            <button
              onClick={() => setAssignModalOpen(false)}
              style={{
                position: 'absolute',
                top: '1.25rem',
                right: '1.25rem',
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                color: '#64748b'
              }}
            >
              <X size={20} />
            </button>

            <h2 style={{ fontSize: '1.25rem', color: '#0f172a', margin: '0 0 0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <PlusCircle size={20} color="#047857" /> Deposit Item into Custody Locker
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 1.5rem' }}>
              Assign a received found item to a secure physical locker. The locker status will automatically transition to 'Occupied'.
            </p>

            {errorMsg && (
              <div style={{ padding: '0.75rem', backgroundColor: '#fee2e2', color: '#b91c1c', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1rem' }}>
                {errorMsg}
              </div>
            )}
            {successMsg && (
              <div style={{ padding: '0.75rem', backgroundColor: '#dcfce7', color: '#15803d', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1rem' }}>
                {successMsg}
              </div>
            )}

            <form onSubmit={handleSubmitAssignment} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                  Select Target Locker *
                </label>
                <select
                  value={assignForm.lockerId}
                  onChange={(e) => setAssignForm({ ...assignForm, lockerId: e.target.value })}
                  required
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                >
                  <option value="">-- Choose Vacant Locker --</option>
                  {vacantLockers.map((l) => (
                    <option key={l._id} value={l._id}>
                      {l.lockerNumber} - {l.label} ({l.capacityType})
                    </option>
                  ))}
                </select>
                {vacantLockers.length === 0 && (
                  <p style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '0.25rem' }}>
                    All lockers are currently occupied. Vacate or release a locker first.
                  </p>
                )}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                  Select Found Item to Store *
                </label>
                <select
                  value={assignForm.foundItemId}
                  onChange={(e) => setAssignForm({ ...assignForm, foundItemId: e.target.value })}
                  required
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                >
                  <option value="">-- Choose Received Item --</option>
                  {availableItems.map((item) => (
                    <option key={item._id} value={item._id}>
                      {item.name} ({item.category?.name || 'General'}) - Found at: {item.locationFound}
                    </option>
                  ))}
                </select>
                {availableItems.length === 0 && (
                  <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                    No unassigned items available.
                  </p>
                )}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                  Custody Intake Post *
                </label>
                <select
                  value={assignForm.custodyLocationId}
                  onChange={(e) => setAssignForm({ ...assignForm, custodyLocationId: e.target.value })}
                  required
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                >
                  {custodyLocations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name} ({loc.zone})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                  Custody Notes / Inspection Remarks
                </label>
                <input
                  type="text"
                  placeholder="e.g. Verified serial number, enclosed in ziplock bag"
                  value={assignForm.notes}
                  onChange={(e) => setAssignForm({ ...assignForm, notes: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setAssignModalOpen(false)}
                  className="btn-secondary"
                  style={{ padding: '0.65rem 1.25rem' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingAssign || vacantLockers.length === 0}
                  className="btn-primary"
                  style={{ backgroundColor: '#047857', borderColor: '#047857', padding: '0.65rem 1.25rem' }}
                >
                  {submittingAssign ? 'Locking In...' : 'Confirm Deposit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LOCKER HISTORY LOG MODAL */}
      {historyModalOpen && activeLockerForHistory && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '600px',
            padding: '2rem',
            maxHeight: '80vh',
            overflowY: 'auto',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)',
            position: 'relative'
          }}>
            <button
              onClick={() => setHistoryModalOpen(false)}
              style={{
                position: 'absolute',
                top: '1.25rem',
                right: '1.25rem',
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                color: '#64748b'
              }}
            >
              <X size={20} />
            </button>

            <h2 style={{ fontSize: '1.25rem', color: '#0f172a', margin: '0 0 0.25rem' }}>
              Audit History: {activeLockerForHistory.lockerNumber}
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 1.25rem' }}>
              {activeLockerForHistory.label} • Zone: {activeLockerForHistory.zone} ({activeLockerForHistory.capacityType})
            </p>

            {(!activeLockerForHistory.history || activeLockerForHistory.history.length === 0) ? (
              <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
                No custody transactions recorded for this locker yet.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {activeLockerForHistory.history.slice().reverse().map((h, idx) => (
                  <div
                    key={idx}
                    style={{
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      padding: '0.85rem',
                      backgroundColor: '#f8fafc',
                      fontSize: '0.825rem'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                      <strong style={{ color: '#0f172a' }}>{h.itemName || 'Found Item'}</strong>
                      <span style={{ color: '#64748b' }}>
                        {new Date(h.assignedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div style={{ color: '#475569' }}>
                      Status: {h.releasedAt ? (
                        <span style={{ color: '#15803d', fontWeight: 600 }}>
                          Released ({new Date(h.releasedAt).toLocaleDateString()})
                        </span>
                      ) : (
                        <span style={{ color: '#b91c1c', fontWeight: 600 }}>Currently Occupying</span>
                      )}
                    </div>
                    {h.digitalReceiptNumber && (
                      <div style={{ color: '#059669', marginTop: '0.2rem' }}>
                        Receipt: <code>{h.digitalReceiptNumber}</code>
                      </div>
                    )}
                    {h.notes && (
                      <div style={{ color: '#64748b', fontStyle: 'italic', marginTop: '0.25rem' }}>
                        "{h.notes}"
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setHistoryModalOpen(false)}
                className="btn-secondary"
                style={{ padding: '0.5rem 1rem' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SecurityDashboard;
