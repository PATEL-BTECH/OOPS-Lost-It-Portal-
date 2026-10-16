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
  Check,
  AlertCircle
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import { getClaims, recordHandover } from '../services/claims.service';
import { getFoundItems } from '../services/items.service';

const INITIAL_LOCKERS = [
  { id: 'LKR-A1', label: 'Locker A-01', zone: 'Zone A (Electronics)', capacity: 'Safe', occupied: false, item: null },
  { id: 'LKR-A2', label: 'Locker A-02', zone: 'Zone A (Electronics)', capacity: 'Safe', occupied: true, item: 'HP Pavilion Laptop 15' },
  { id: 'LKR-A3', label: 'Locker A-03', zone: 'Zone A (Electronics)', capacity: 'Safe', occupied: false, item: null },
  { id: 'LKR-A4', label: 'Locker A-04', zone: 'Zone A (Electronics)', capacity: 'Safe', occupied: true, item: 'boAt Airdopes 141' },
  { id: 'LKR-B1', label: 'Locker B-01', zone: 'Zone B (Wallets & IDs)', capacity: 'Vault', occupied: true, item: 'Brown Leather Wallet' },
  { id: 'LKR-B2', label: 'Locker B-02', zone: 'Zone B (Wallets & IDs)', capacity: 'Vault', occupied: false, item: null },
  { id: 'LKR-B3', label: 'Locker B-03', zone: 'Zone B (Wallets & IDs)', capacity: 'Vault', occupied: true, item: 'GSFCU Student ID Card' },
  { id: 'LKR-B4', label: 'Locker B-04', zone: 'Zone B (Wallets & IDs)', capacity: 'Vault', occupied: false, item: null },
  { id: 'LKR-C1', label: 'Locker C-01', zone: 'Zone C (Keys & Accessories)', capacity: 'Bin', occupied: false, item: null },
  { id: 'LKR-C2', label: 'Locker C-02', zone: 'Zone C (Keys & Accessories)', capacity: 'Bin', occupied: true, item: 'Honda Bike Key with Blue Ribbon' },
  { id: 'LKR-C3', label: 'Locker C-03', zone: 'Zone C (Keys & Accessories)', capacity: 'Bin', occupied: false, item: null },
  { id: 'LKR-C4', label: 'Locker C-04', zone: 'Zone C (Keys & Accessories)', capacity: 'Bin', occupied: false, item: null },
  { id: 'LKR-D1', label: 'Locker D-01', zone: 'Zone D (Bags & Sports)', capacity: 'Bay', occupied: true, item: 'Blue Wildcraft Backpack' },
  { id: 'LKR-D2', label: 'Locker D-02', zone: 'Zone D (Bags & Sports)', capacity: 'Bay', occupied: false, item: null },
  { id: 'LKR-D3', label: 'Locker D-03', zone: 'Zone D (Bags & Sports)', capacity: 'Bay', occupied: false, item: null },
  { id: 'LKR-D4', label: 'Locker D-04', zone: 'Zone D (Bags & Sports)', capacity: 'Bay', occupied: false, item: null },
];

const SecurityDashboard = () => {
  const { user } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState('handover');
  const [approvedClaims, setApprovedClaims] = useState([]);
  const [completedHandovers, setCompletedHandovers] = useState([]);
  const [lockers, setLockers] = useState(INITIAL_LOCKERS);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  const fetchSecurityData = async () => {
    setLoading(true);
    try {
      const [approvedRes, completedRes] = await Promise.all([
        getClaims({ status: 'approved' }),
        getClaims({ status: 'handed_over' })
      ]);
      setApprovedClaims(approvedRes.claims || []);
      setCompletedHandovers(completedRes.claims || []);
    } catch (err) {
      console.warn('Failed to load security claims data:', err);
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
      'GSFCU-2023-'
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

      alert(`✅ Handover Complete!\nDigital Receipt #: ${res.receiptNumber}\nItem record closed.`);
      fetchSecurityData();
    } catch (err) {
      alert(`Handover record failed: ${err.message}`);
    } finally {
      setProcessingId(null);
    }
  };

  const occupiedCount = lockers.filter((l) => l.occupied).length;
  const occupancyPercentage = Math.round((occupiedCount / lockers.length) * 100);

  return (
    <div className="security-dashboard" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #064e3b, #047857)',
        borderRadius: '16px',
        padding: '2rem',
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1.5rem',
        boxShadow: '0 10px 25px -5px rgba(4, 120, 87, 0.2)'
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <h1 style={{ fontSize: '1.5rem', color: '#ffffff', margin: 0 }}>Campus Security Custody Desk</h1>
              <StatusBadge status="operational" label="SECURITY STAFF" />
            </div>
            <p style={{ color: '#a7f3d0', fontSize: '0.9rem', marginTop: '0.2rem', margin: 0 }}>
              Logged in as: {user?.name} ({user?.email}) • Module Lead: Neerja
            </p>
          </div>
        </div>

        <button onClick={fetchSecurityData} className="btn-secondary" style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: '#ffffff', borderColor: 'rgba(255,255,255,0.3)' }}>
          <RefreshCw size={16} /> Refresh Desk
        </button>
      </div>

      {/* Security Stat Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">Approved For Handover</span>
            <div className="metric-icon-wrap" style={{ color: '#3b82f6', backgroundColor: '#eff6ff' }}>
              <Clock size={18} />
            </div>
          </div>
          <div className="metric-value">{approvedClaims.length}</div>
          <div className="metric-detail">Awaiting claimant in-person ID check</div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">Locker Occupancy</span>
            <div className="metric-icon-wrap" style={{ color: '#8b5cf6', backgroundColor: '#f5f3ff' }}>
              <Boxes size={18} />
            </div>
          </div>
          <div className="metric-value">{occupiedCount} / {lockers.length}</div>
          <div className="metric-detail">{occupancyPercentage}% lockers in physical custody</div>
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
            <span className="metric-title">Campus Custody Gate</span>
            <div className="metric-icon-wrap" style={{ color: '#f59e0b', backgroundColor: '#fef3c7' }}>
              <MapPin size={18} />
            </div>
          </div>
          <div className="metric-value">Main Post</div>
          <div className="metric-detail">GSFC University Central Desk</div>
        </div>
      </div>

      {/* Desk Sub Navigation */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem' }}>
        <button
          onClick={() => setActiveSubTab('handover')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.6rem 1.2rem',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: activeSubTab === 'handover' ? '#047857' : 'transparent',
            color: activeSubTab === 'handover' ? '#ffffff' : '#475569',
            fontWeight: 600,
            fontSize: '0.875rem',
            cursor: 'pointer'
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
            padding: '0.6rem 1.2rem',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: activeSubTab === 'lockers' ? '#047857' : 'transparent',
            color: activeSubTab === 'lockers' ? '#ffffff' : '#475569',
            fontWeight: 600,
            fontSize: '0.875rem',
            cursor: 'pointer'
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
            padding: '0.6rem 1.2rem',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: activeSubTab === 'archive' ? '#047857' : 'transparent',
            color: activeSubTab === 'archive' ? '#ffffff' : '#475569',
            fontWeight: 600,
            fontSize: '0.875rem',
            cursor: 'pointer'
          }}
        >
          <Receipt size={18} /> Receipts &amp; Archive ({completedHandovers.length})
        </button>
      </div>

      {/* SUB-VIEW 1: HANDOVER QUEUE */}
      {activeSubTab === 'handover' && (
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          padding: '1.75rem',
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)'
        }}>
          <h2 style={{ fontSize: '1.3rem', color: '#0f172a', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <UserCheck size={22} color="#059669" /> In-Person Identity Verification &amp; Release Queue ({approvedClaims.length})
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
            These claims have been verified by administration. When the student presents their physical Student ID card, verify credentials and record the handover.
          </p>

          {loading ? (
            <p style={{ color: '#64748b', textAlign: 'center', padding: '2rem' }}>Loading approved claims...</p>
          ) : approvedClaims.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2.5rem', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', color: '#64748b' }}>
              <CheckCircle size={32} color="#10b981" style={{ margin: '0 auto 0.5rem' }} />
              <h3 style={{ fontSize: '1.1rem', color: '#0f172a' }}>No Items Waiting for Handover</h3>
              <p style={{ fontSize: '0.85rem' }}>All approved claims have been released to their rightful owners.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {approvedClaims.map((claim) => {
                const item = claim.foundItem;
                return (
                  <div
                    key={claim._id}
                    style={{
                      border: '1px solid #a7f3d0',
                      borderRadius: '12px',
                      padding: '1.5rem',
                      backgroundColor: '#f0fdf4',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '1rem'
                    }}
                  >
                    <div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#047857', textTransform: 'uppercase' }}>
                        APPROVED FOR RELEASE
                      </span>
                      <h3 style={{ fontSize: '1.2rem', color: '#064e3b', margin: '0.2rem 0' }}>
                        {item?.name}
                      </h3>
                      <p style={{ fontSize: '0.85rem', color: '#065f46', lineHeight: 1.4, margin: 0 }}>
                        Claimant: <strong>{claim.claimant?.name}</strong> ({claim.claimant?.email}) • Phone: {claim.contactPhone || 'N/A'}
                        <br />
                        Custody Location: <strong>{item?.storageLocation}</strong>
                        <br />
                        Admin Approval Note: <em>"{claim.decisionReason || 'Evidence verified'}"</em>
                      </p>
                    </div>

                    <button
                      onClick={() => handlePerformHandover(claim._id, claim.claimant?.name)}
                      disabled={processingId === claim._id}
                      className="btn-primary"
                      style={{ backgroundColor: '#059669', borderColor: '#059669', padding: '0.65rem 1.25rem' }}
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

      {/* SUB-VIEW 2: PHYSICAL LOCKERS */}
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
                <Boxes size={22} color="#047857" /> Central Custody Lockers &amp; Storage Bins
              </h2>
              <p style={{ color: '#64748b', fontSize: '0.875rem', margin: '0.25rem 0 0' }}>
                Physical security locker map located at Ground Floor Security Post, Admin Block
              </p>
            </div>

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', fontSize: '0.85rem' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ width: '12px', height: '12px', backgroundColor: '#ef4444', borderRadius: '3px' }}></span>
                Occupied ({occupiedCount})
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ width: '12px', height: '12px', backgroundColor: '#10b981', borderRadius: '3px' }}></span>
                Available ({lockers.length - occupiedCount})
              </span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem' }}>
            {lockers.map((lkr) => (
              <div
                key={lkr.id}
                style={{
                  border: `2px solid ${lkr.occupied ? '#fca5a5' : '#86efac'}`,
                  borderRadius: '12px',
                  padding: '1.25rem',
                  backgroundColor: lkr.occupied ? '#fef2f2' : '#f0fdf4',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                  position: 'relative'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700, fontSize: '1rem', color: '#0f172a' }}>{lkr.label}</span>
                  <span style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    padding: '0.15rem 0.5rem',
                    borderRadius: '4px',
                    backgroundColor: lkr.occupied ? '#dc2626' : '#16a34a',
                    color: '#ffffff'
                  }}>
                    {lkr.occupied ? 'Occupied' : 'Vacant'}
                  </span>
                </div>

                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  {lkr.zone} • {lkr.capacity}
                </div>

                <div style={{
                  marginTop: '0.5rem',
                  padding: '0.5rem',
                  borderRadius: '6px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  fontSize: '0.825rem',
                  minHeight: '44px',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  {lkr.occupied ? (
                    <span style={{ color: '#991b1b', fontWeight: 500 }}>
                      📦 {lkr.item}
                    </span>
                  ) : (
                    <span style={{ color: '#16a34a', fontStyle: 'italic' }}>
                      Ready for newly deposited item
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-VIEW 3: ARCHIVE & RECEIPTS */}
      {activeSubTab === 'archive' && (
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          padding: '1.75rem'
        }}>
          <h2 style={{ fontSize: '1.2rem', color: '#0f172a', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Receipt size={20} color="#7c3aed" /> Completed Handover Archive &amp; Digital Receipts ({completedHandovers.length})
          </h2>

          {completedHandovers.length === 0 ? (
            <p style={{ color: '#64748b', fontSize: '0.875rem' }}>No completed handovers recorded yet.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#475569' }}>
                    <th style={{ padding: '0.75rem' }}>Receipt #</th>
                    <th style={{ padding: '0.75rem' }}>Item</th>
                    <th style={{ padding: '0.75rem' }}>Claimant</th>
                    <th style={{ padding: '0.75rem' }}>Verified ID Proof</th>
                    <th style={{ padding: '0.75rem' }}>Handover Date</th>
                    <th style={{ padding: '0.75rem' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {completedHandovers.map((c) => (
                    <tr key={c._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '0.75rem' }}>
                        <code style={{ color: '#059669', fontWeight: 700 }}>
                          {c.handoverDetails?.digitalReceiptNumber || 'N/A'}
                        </code>
                      </td>
                      <td style={{ padding: '0.75rem', fontWeight: 600 }}>{c.foundItem?.name}</td>
                      <td style={{ padding: '0.75rem' }}>{c.claimant?.name}</td>
                      <td style={{ padding: '0.75rem' }}>{c.handoverDetails?.claimantIdProof || 'Verified in Person'}</td>
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
    </div>
  );
};

export default SecurityDashboard;
