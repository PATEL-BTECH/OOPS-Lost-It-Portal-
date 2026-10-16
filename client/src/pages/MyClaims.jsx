import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileCheck, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Package, 
  ShieldCheck, 
  FileText, 
  Receipt, 
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { getMyClaims } from '../services/claims.service';
import { getPhotoUrl } from '../services/items.service';
import StatusBadge from '../components/StatusBadge';

const MyClaims = () => {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchClaims = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getMyClaims();
        setClaims(data);
      } catch (err) {
        setError('Failed to load your submitted claims.');
      } finally {
        setLoading(false);
      }
    };
    fetchClaims();
  }, []);

  const filteredClaims = filter === 'all' 
    ? claims 
    : claims.filter((c) => c.status === filter);

  return (
    <div className="my-claims-page" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header Banner */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        padding: '2rem',
        border: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', color: '#0f172a' }}>My Ownership Claims</h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
            Track the status of your claims, administrative approvals, and campus security handover receipts.
          </p>
        </div>

        <Link to="/items?type=found" className="btn-secondary" style={{ textDecoration: 'none' }}>
          <Package size={16} /> Browse Found Items Feed
        </Link>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {[
          { id: 'all', label: `All Claims (${claims.length})` },
          { id: 'pending', label: `Pending (${claims.filter(c => c.status === 'pending').length})` },
          { id: 'approved', label: `Approved (${claims.filter(c => c.status === 'approved').length})` },
          { id: 'handed_over', label: `Handed Over (${claims.filter(c => c.status === 'handed_over').length})` },
          { id: 'rejected', label: `Rejected (${claims.filter(c => c.status === 'rejected').length})` }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '9999px',
              border: 'none',
              backgroundColor: filter === tab.id ? '#7c3aed' : '#ffffff',
              color: filter === tab.id ? '#ffffff' : '#64748b',
              border: filter === tab.id ? '1px solid #7c3aed' : '1px solid #cbd5e1',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: 'all 0.15s'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
          <div style={{
            width: '36px',
            height: '36px',
            border: '3px solid #ede9fe',
            borderTopColor: '#7c3aed',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 1rem'
          }} />
          <p style={{ color: '#64748b' }}>Loading your claim history...</p>
        </div>
      ) : error ? (
        <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '1.5rem', borderRadius: '12px', textAlign: 'center' }}>
          {error}
        </div>
      ) : filteredClaims.length === 0 ? (
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '4rem 2rem',
          textAlign: 'center',
          border: '1px solid #e2e8f0'
        }}>
          <FileCheck size={48} color="#cbd5e1" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.25rem', color: '#0f172a', marginBottom: '0.5rem' }}>No Claims in this Category</h3>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            If you lost something on campus, browse the found items list and submit an ownership claim.
          </p>
          <Link to="/items?type=found" className="btn-primary" style={{ textDecoration: 'none' }}>
            Browse Found Items
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {filteredClaims.map((claim) => {
            const item = claim.foundItem;
            const photoUrl = item ? getPhotoUrl(item.photo) : null;
            const isApproved = claim.status === 'approved';
            const isHandedOver = claim.status === 'handed_over';
            const isRejected = claim.status === 'rejected';

            return (
              <div
                key={claim._id}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '16px',
                  border: isApproved ? '2px solid #8b5cf6' : isHandedOver ? '2px solid #10b981' : '1px solid #e2e8f0',
                  padding: '1.75rem',
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.04)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1.25rem'
                }}
              >
                {/* Header Row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    {photoUrl && (
                      <img
                        src={photoUrl}
                        alt={item?.name}
                        style={{ width: '56px', height: '56px', borderRadius: '10px', objectFit: 'cover' }}
                      />
                    )}
                    <div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#7c3aed', textTransform: 'uppercase' }}>
                        {item?.category?.name || 'Item Claim'}
                      </span>
                      <h2 style={{ fontSize: '1.25rem', color: '#0f172a', margin: '0.2rem 0' }}>
                        {item?.name || 'Found Belonging'}
                      </h2>
                      <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                        Claim ID: <code>{claim._id}</code> • Submitted: {new Date(claim.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div>
                    <StatusBadge status={claim.status} pulse={isApproved} />
                  </div>
                </div>

                {/* Evidence Provided */}
                <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.9rem' }}>
                  <strong style={{ display: 'block', fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                    Ownership Evidence Submitted:
                  </strong>
                  <p style={{ color: '#334155', whiteSpace: 'pre-line' }}>{claim.evidenceDescription}</p>
                </div>

                {/* Approved Alert Banner */}
                {isApproved && (
                  <div style={{
                    backgroundColor: '#ede9fe',
                    border: '1px solid #c4b5fd',
                    borderRadius: '12px',
                    padding: '1.25rem',
                    color: '#4c1d95',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.75rem'
                  }}>
                    <ShieldCheck size={24} style={{ flexShrink: 0, marginTop: '2px', color: '#7c3aed' }} />
                    <div>
                      <strong style={{ fontSize: '1rem', display: 'block', marginBottom: '0.25rem' }}>
                        🎉 Claim Approved by Campus Administration!
                      </strong>
                      <p style={{ fontSize: '0.875rem', lineHeight: 1.5, marginBottom: '0.5rem' }}>
                        {claim.decisionReason || 'Your ownership evidence has been verified.'}
                      </p>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#6d28d9' }}>
                        📍 Next Step: Report to the <strong>Campus Security Desk ({item?.storageLocation})</strong> with your official GSFC University Student ID card to collect your belonging.
                      </div>
                    </div>
                  </div>
                )}

                {/* Handover Completed Digital Receipt Banner */}
                {isHandedOver && claim.handoverDetails?.digitalReceiptNumber && (
                  <div style={{
                    backgroundColor: '#ecfdf5',
                    border: '1px solid #a7f3d0',
                    borderRadius: '12px',
                    padding: '1.25rem',
                    color: '#065f46'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                      <Receipt size={20} color="#059669" />
                      <strong style={{ fontSize: '1rem' }}>Official Digital Handover Receipt</strong>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', fontSize: '0.85rem' }}>
                      <div>
                        <span style={{ color: '#047857', display: 'block', fontSize: '0.75rem' }}>RECEIPT NUMBER</span>
                        <code style={{ fontSize: '0.95rem', fontWeight: 700, color: '#065f46' }}>
                          {claim.handoverDetails.digitalReceiptNumber}
                        </code>
                      </div>
                      <div>
                        <span style={{ color: '#047857', display: 'block', fontSize: '0.75rem' }}>STUDENT ID VERIFIED</span>
                        <strong>{claim.handoverDetails.claimantIdProof}</strong>
                      </div>
                      <div>
                        <span style={{ color: '#047857', display: 'block', fontSize: '0.75rem' }}>HANDOVER DATE</span>
                        <span>{new Date(claim.handoverDetails.handoverDate).toLocaleString()}</span>
                      </div>
                      <div>
                        <span style={{ color: '#047857', display: 'block', fontSize: '0.75rem' }}>VERIFIED BY</span>
                        <span>{claim.handoverDetails.verifiedBy?.name || 'Campus Security Desk'}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Rejected Banner */}
                {isRejected && (
                  <div style={{
                    backgroundColor: '#fef2f2',
                    border: '1px solid #fecaca',
                    borderRadius: '12px',
                    padding: '1rem',
                    color: '#991b1b',
                    fontSize: '0.875rem'
                  }}>
                    <strong>Claim Decision: Rejected.</strong> Feedback: {claim.decisionReason || 'Provided evidence does not match recorded item specifics.'}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyClaims;
