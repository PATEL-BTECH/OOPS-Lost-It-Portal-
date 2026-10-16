import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  Tag, 
  User, 
  ShieldCheck, 
  HelpCircle, 
  Package, 
  Trash2, 
  FileCheck, 
  Lock,
  Gift,
  Share2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { 
  getLostItemById, 
  getFoundItemById, 
  deleteLostItem, 
  deleteFoundItem, 
  getPhotoUrl 
} from '../services/items.service';
import { getItemMatches } from '../services/matching.service';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';

const ItemDetail = () => {
  const { type, id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [matches, setMatches] = useState([]);

  const isLost = type === 'lost';

  useEffect(() => {
    const fetchItem = async () => {
      setLoading(true);
      setError(null);
      try {
        let data;
        if (isLost) {
          data = await getLostItemById(id);
        } else {
          data = await getFoundItemById(id);
        }
        setItem(data);

        // Fetch match suggestions
        try {
          const matchData = await getItemMatches(id, type);
          setMatches(matchData);
        } catch (matchErr) {
          console.warn('Could not load matches:', matchErr);
        }
      } catch (err) {
        setError(err.message || 'Item details could not be loaded.');
      } finally {
        setLoading(false);
      }
    };
    fetchItem();
  }, [type, id, isLost]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this report? This will permanently remove its record and photo.')) {
      return;
    }

    setDeleting(true);
    try {
      if (isLost) {
        await deleteLostItem(id);
      } else {
        await deleteFoundItem(id);
      }
      navigate('/items');
    } catch (err) {
      alert(`Deletion failed: ${err.message}`);
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem 1rem' }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid #ede9fe',
          borderTopColor: '#7c3aed',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
          margin: '0 auto 1rem'
        }} />
        <p style={{ color: '#64748b' }}>Loading item record...</p>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div style={{ maxWidth: '540px', margin: '4rem auto', textAlign: 'center', padding: '2rem', backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
        <AlertCircle size={40} color="#ef4444" style={{ margin: '0 auto 1rem' }} />
        <h2 style={{ fontSize: '1.4rem', color: '#0f172a', marginBottom: '0.5rem' }}>Item Record Not Found</h2>
        <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>{error || 'This report may have been resolved or deleted.'}</p>
        <Link to="/items" className="btn-primary">
          <ArrowLeft size={16} /> Return to Feed
        </Link>
      </div>
    );
  }

  const photoUrl = getPhotoUrl(item.photo);
  const isOwner = user && item.reportedBy && (user.id === item.reportedBy._id || user.id === item.reportedBy);
  const isAdmin = user && user.role === 'admin';
  const canManage = isOwner || isAdmin;

  const dateStr = new Date(isLost ? item.dateLost : item.dateFound).toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div style={{ maxWidth: '960px', margin: '1.5rem auto', padding: '0 1rem' }}>
      {/* Back button */}
      <Link to="/items" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#64748b', fontSize: '0.9rem', marginBottom: '1.25rem', fontWeight: 500 }}>
        <ArrowLeft size={16} /> Back to Campus Belongings Feed
      </Link>

      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '20px',
        border: '1px solid #e2e8f0',
        overflow: 'hidden',
        boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)'
      }}>
        {/* Top Header Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: photoUrl ? 'repeat(auto-fit, minmax(320px, 1fr))' : '1fr',
          borderBottom: '1px solid #e2e8f0'
        }}>
          {/* Photo Column (GridFS Stream) */}
          {photoUrl && (
            <div style={{
              backgroundColor: '#0f172a',
              maxHeight: '440px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden'
            }}>
              <img
                src={photoUrl}
                alt={item.name}
                style={{ width: '100%', height: '100%', objectFit: 'contain', maxHeight: '440px' }}
              />
            </div>
          )}

          {/* Quick Details Box */}
          <div style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
              <span style={{
                backgroundColor: isLost ? '#ede9fe' : '#ecfdf5',
                color: isLost ? '#6d28d9' : '#047857',
                fontSize: '0.8rem',
                fontWeight: 700,
                padding: '0.3rem 0.75rem',
                borderRadius: '9999px',
                textTransform: 'uppercase'
              }}>
                {isLost ? 'LOST ITEM REPORT' : 'FOUND ITEM RECORD'}
              </span>

              <StatusBadge status={item.status} />
            </div>

            <h1 style={{ fontSize: '1.75rem', color: '#0f172a', fontWeight: 800 }}>
              {item.name}
            </h1>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.925rem', color: '#475569' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Tag size={16} color="#7c3aed" />
                <span>Category: <strong>{item.category?.name || 'General'}</strong></span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MapPin size={16} color="#7c3aed" />
                <span>{isLost ? 'Last Seen:' : 'Found at:'} <strong>{isLost ? item.lastSeenLocation : item.locationFound}</strong></span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Calendar size={16} color="#7c3aed" />
                <span>Date: <strong>{dateStr}</strong></span>
              </div>
            </div>

            {/* Reporter Profile Box */}
            <div style={{
              marginTop: 'auto',
              padding: '1rem',
              backgroundColor: '#f8fafc',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              gap: '0.875rem'
            }}>
              <img
                src={item.reportedBy?.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(item.reportedBy?.name || 'User')}`}
                alt={item.reportedBy?.name}
                style={{ width: '42px', height: '42px', borderRadius: '50%', border: '2px solid #7c3aed' }}
              />
              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600, display: 'block' }}>
                  {isLost ? 'REPORTED BY' : 'FOUND BY'}
                </span>
                <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>
                  {item.reportedBy?.name || 'University Member'}
                </span>
                <span style={{ fontSize: '0.8rem', color: '#64748b', display: 'block' }}>
                  {item.reportedBy?.email}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Extended Body Content */}
        <div style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Description Section */}
          <div>
            <h2 style={{ fontSize: '1.2rem', color: '#0f172a', marginBottom: '0.75rem' }}>
              Item Description &amp; Visual Identifiers
            </h2>
            <p style={{ color: '#334155', lineHeight: 1.7, fontSize: '1rem', whiteSpace: 'pre-line' }}>
              {item.description}
            </p>
          </div>

          {/* Attributes Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            padding: '1.5rem',
            backgroundColor: '#f8fafc',
            borderRadius: '12px',
            border: '1px solid #e2e8f0'
          }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600, display: 'block' }}>
                Brand
              </span>
              <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>
                {item.brand || 'Unspecified'}
              </strong>
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600, display: 'block' }}>
                Color
              </span>
              <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>
                {item.color || 'Unspecified'}
              </strong>
            </div>

            {!isLost && (
              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600, display: 'block' }}>
                  Custody Location
                </span>
                <strong style={{ fontSize: '0.95rem', color: '#047857' }}>
                  {item.storageLocation}
                </strong>
              </div>
            )}

            {isLost && item.rewardOffered && (
              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600, display: 'block' }}>
                  Reward
                </span>
                <strong style={{ fontSize: '0.95rem', color: '#7c3aed' }}>
                  🎁 {item.rewardOffered}
                </strong>
              </div>
            )}
          </div>

          {/* Verification Details (Visible only to owner / staff) */}
          {!isLost && item.verificationDetails && (
            <div style={{
              backgroundColor: '#fef3c7',
              border: '1px solid #fde68a',
              borderRadius: '12px',
              padding: '1.25rem',
              color: '#92400e'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                <Lock size={16} /> Confidential Verification Question (Staff / Finder View)
              </div>
              <p style={{ fontSize: '0.9rem', lineHeight: 1.5 }}>
                {item.verificationDetails}
              </p>
            </div>
          )}

          {/* Smart Match Suggestions (Rule-based Matching Engine) */}
          {matches.length > 0 && (
            <div style={{
              backgroundColor: '#f5f3ff',
              border: '1px solid #ddd6fe',
              borderRadius: '16px',
              padding: '1.5rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <h3 style={{ fontSize: '1.15rem', color: '#5b21b6', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Sparkles size={20} color="#7c3aed" /> Rule-Based Smart Match Suggestions ({matches.length})
                </h3>
                <span style={{ fontSize: '0.8rem', color: '#6d28d9', fontWeight: 600 }}>
                  Automated similarity scoring engine
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                {matches.map((m) => {
                  const targetItem = isLost ? m.foundItem : m.lostItem;
                  const targetType = isLost ? 'found' : 'lost';
                  if (!targetItem) return null;

                  return (
                    <div
                      key={m._id}
                      style={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #c4b5fd',
                        borderRadius: '12px',
                        padding: '1rem 1.25rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '1rem'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                          <span style={{
                            backgroundColor: '#7c3aed',
                            color: '#ffffff',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            padding: '0.2rem 0.6rem',
                            borderRadius: '9999px'
                          }}>
                            {m.similarityScore}% SIMILARITY
                          </span>
                          <strong style={{ fontSize: '1rem', color: '#0f172a' }}>{targetItem.name}</strong>
                        </div>
                        <p style={{ fontSize: '0.825rem', color: '#64748b' }}>
                          Category: {targetItem.category?.name || 'General'} • Brand: {targetItem.brand || 'N/A'} • Color: {targetItem.color || 'N/A'}
                        </p>
                      </div>

                      <Link
                        to={`/items/${targetType}/${targetItem._id}`}
                        className="btn-primary"
                        style={{ padding: '0.45rem 0.85rem', fontSize: '0.825rem' }}
                      >
                        Inspect Match
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Action Row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              {!isLost && item.status === 'available' && (
                <Link
                  to={`/claims/new/${item._id}`}
                  className="btn-primary"
                  style={{ textDecoration: 'none' }}
                >
                  <FileCheck size={16} /> Claim This Item
                </Link>
              )}

              {isLost && item.status === 'open' && (
                <button
                  className="btn-primary"
                  style={{ backgroundColor: '#059669', borderColor: '#059669' }}
                  onClick={() => alert('Found this item? Report a match or hand it to GSFC Campus Security!')}
                >
                  <CheckCircle2 size={16} /> I Found This Item
                </button>
              )}
            </div>

            {canManage && (
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="btn-danger-outline"
                style={{ padding: '0.6rem 1rem' }}
              >
                <Trash2 size={16} /> {deleting ? 'Deleting...' : 'Delete Report'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemDetail;
