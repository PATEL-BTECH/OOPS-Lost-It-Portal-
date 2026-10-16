import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  FileCheck, 
  ShieldCheck, 
  Upload, 
  ArrowLeft, 
  AlertCircle, 
  CheckCircle2, 
  Lock, 
  Phone, 
  Info,
  X
} from 'lucide-react';
import { getFoundItemById, getPhotoUrl } from '../services/items.service';
import { createClaim } from '../services/claims.service';

const SubmitClaim = () => {
  const { foundItemId } = useParams();
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
  const [loadingItem, setLoadingItem] = useState(true);
  const [evidenceDescription, setEvidenceDescription] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [proofPhoto, setProofPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchFoundItem = async () => {
      try {
        const data = await getFoundItemById(foundItemId);
        setItem(data);
      } catch (err) {
        setError('Unable to load found item record.');
      } finally {
        setLoadingItem(false);
      }
    };
    fetchFoundItem();
  }, [foundItemId]);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setError('Proof photo exceeds 2 MB limit.');
      return;
    }

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Only JPG, PNG, and WebP images are allowed.');
      return;
    }

    setError(null);
    setProofPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const removePhoto = () => {
    setProofPhoto(null);
    setPhotoPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!evidenceDescription.trim()) {
      setError('Please provide proof or description proving your ownership.');
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      const data = new FormData();
      data.append('foundItemId', foundItemId);
      data.append('evidenceDescription', evidenceDescription);
      if (contactPhone) data.append('contactPhone', contactPhone);
      if (proofPhoto) data.append('proofPhoto', proofPhoto);

      const response = await createClaim(data);
      if (response.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/claims/my');
        }, 1500);
      }
    } catch (err) {
      setError(err.message || 'Failed to submit claim.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingItem) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem 1rem' }}>
        <div style={{
          width: '36px',
          height: '36px',
          border: '3px solid #ede9fe',
          borderTopColor: '#7c3aed',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
          margin: '0 auto 1rem'
        }} />
        <p style={{ color: '#64748b' }}>Loading item verification details...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '760px', margin: '1.5rem auto', padding: '0 1rem' }}>
      <Link to={`/items/found/${foundItemId}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#64748b', fontSize: '0.9rem', marginBottom: '1.25rem', fontWeight: 500 }}>
        <ArrowLeft size={16} /> Back to Item Record
      </Link>

      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '20px',
        border: '1px solid #e2e8f0',
        padding: '2.5rem',
        boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.75rem' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            backgroundColor: '#ede9fe',
            color: '#7c3aed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <FileCheck size={26} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.6rem', color: '#0f172a' }}>Submit Ownership Claim</h1>
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
              Module Lead: Neerja • Administrative Review by Nand Patel
            </p>
          </div>
        </div>

        {/* Item Summary Card */}
        {item && (
          <div style={{
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            marginBottom: '1.75rem'
          }}>
            {item.photo && (
              <img
                src={getPhotoUrl(item.photo)}
                alt={item.name}
                style={{ width: '64px', height: '64px', borderRadius: '8px', objectFit: 'cover' }}
              />
            )}
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#059669', textTransform: 'uppercase' }}>
                CLAIMING FOUND BELONGING
              </span>
              <h3 style={{ fontSize: '1.15rem', color: '#0f172a', margin: '0.15rem 0' }}>{item.name}</h3>
              <p style={{ fontSize: '0.825rem', color: '#64748b' }}>
                Found at: <strong>{item.locationFound}</strong> • Custody: {item.storageLocation}
              </p>
            </div>
          </div>
        )}

        {/* Confidential Evidence Guidance */}
        <div style={{
          backgroundColor: '#f5f3ff',
          border: '1px solid #ddd6fe',
          borderRadius: '12px',
          padding: '1.25rem',
          marginBottom: '1.5rem',
          fontSize: '0.875rem',
          color: '#4c1d95',
          lineHeight: 1.5
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, marginBottom: '0.25rem' }}>
            <Lock size={16} /> Private Proof of Ownership Guidance
          </div>
          To prevent fraudulent claims, campus administration cross-references your submission against the finder's confidential records. Describe distinguishing features not visible in the public photo (e.g. engravings, stickers, exact contents, purchase date, or lockscreen clues).
        </div>

        {error && (
          <div style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#991b1b',
            padding: '0.875rem 1rem',
            borderRadius: '10px',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.9rem'
          }}>
            <AlertCircle size={18} /> {error}
          </div>
        )}

        {success && (
          <div style={{
            backgroundColor: '#ecfdf5',
            border: '1px solid #a7f3d0',
            color: '#065f46',
            padding: '1rem',
            borderRadius: '10px',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.95rem'
          }}>
            <CheckCircle2 size={20} /> Claim registered successfully! Redirecting to your claims dashboard...
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
              Detailed Ownership Evidence <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <textarea
              rows={5}
              required
              value={evidenceDescription}
              onChange={(e) => setEvidenceDescription(e.target.value)}
              placeholder="Describe unique identifying marks, contents inside, bill details, or answers to any secret questions..."
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                border: '1px solid #cbd5e1',
                borderRadius: '10px',
                fontSize: '0.95rem',
                outline: 'none',
                resize: 'vertical'
              }}
            />
          </div>

          {/* Contact Phone */}
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
              Contact Phone / WhatsApp (For Security Dispatch)
            </label>
            <input
              type="tel"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              placeholder="+91 98765 43210"
              style={{
                width: '100%',
                padding: '0.625rem 0.875rem',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                fontSize: '0.9rem',
                outline: 'none'
              }}
            />
          </div>

          {/* Proof Photo / Receipt Upload */}
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
              Optional Supporting Proof Photo (Receipt, ID, or Past Photo — Max 2 MB)
            </label>
            
            {photoPreview ? (
              <div style={{ position: 'relative', display: 'inline-block', borderRadius: '10px', overflow: 'hidden', border: '2px solid #7c3aed' }}>
                <img src={photoPreview} alt="Proof" style={{ maxHeight: '160px', display: 'block' }} />
                <button
                  type="button"
                  onClick={removePhoto}
                  style={{
                    position: 'absolute',
                    top: '6px',
                    right: '6px',
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '50%',
                    width: '24px',
                    height: '24px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '1rem',
                border: '2px dashed #cbd5e1',
                borderRadius: '10px',
                backgroundColor: '#f8fafc',
                cursor: 'pointer'
              }}>
                <Upload size={24} color="#7c3aed" />
                <span style={{ fontSize: '0.875rem', color: '#475569' }}>
                  Click to attach purchase receipt or ownership evidence photo
                </span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handlePhotoChange}
                  style={{ display: 'none' }}
                />
              </label>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary"
            style={{ width: '100%', padding: '0.875rem', fontSize: '1rem', marginTop: '0.5rem' }}
          >
            {submitting ? 'Submitting Claim Evidence...' : 'Submit Claim for Administrative Verification'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SubmitClaim;
