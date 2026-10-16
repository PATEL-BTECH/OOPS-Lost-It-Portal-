import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Package, 
  Upload, 
  MapPin, 
  Calendar, 
  Tag, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle,
  Lock,
  X
} from 'lucide-react';
import { getCategories, createFoundItem } from '../services/items.service';

const ReportFound = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    brand: '',
    color: '',
    locationFound: '',
    dateFound: new Date().toISOString().split('T')[0],
    description: '',
    handedToSecurity: false,
    storageLocation: 'With Finder (Will surrender to security desk)',
    verificationDetails: ''
  });

  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const cats = await getCategories();
        setCategories(cats);
        if (cats.length > 0) {
          setFormData((prev) => ({ ...prev, category: cats[0]._id }));
        }
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    };
    fetchCats();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setError('Photo exceeds maximum 2 MB limit.');
      return;
    }

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Only JPG, PNG, and WebP images are allowed.');
      return;
    }

    setError(null);
    setSelectedPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const removePhoto = () => {
    setSelectedPhoto(null);
    setPhotoPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const data = new FormData();
      Object.keys(formData).forEach((key) => {
        data.append(key, formData[key]);
      });

      if (selectedPhoto) {
        data.append('photo', selectedPhoto);
      }

      const response = await createFoundItem(data);
      if (response.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/items');
        }, 1500);
      }
    } catch (err) {
      setError(err.message || 'Failed to submit found item report.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '780px', margin: '1.5rem auto', padding: '0 1rem' }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '20px',
        padding: '2.5rem',
        border: '1px solid #e2e8f0',
        boxShadow: '0 10px 25px -5px rgba(5, 150, 105, 0.06)'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            backgroundColor: '#ecfdf5',
            color: '#059669',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Package size={26} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.6rem', color: '#0f172a' }}>Report a Found Item</h1>
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
              Register an item found on campus so the rightful owner can locate and claim it.
            </p>
          </div>
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
            <CheckCircle2 size={20} /> Found item registered in campus registry!
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Item Name */}
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
              Item Name <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Leather Bi-fold Wallet, Wireless Bluetooth Mouse"
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                border: '1px solid #cbd5e1',
                borderRadius: '10px',
                fontSize: '0.95rem',
                outline: 'none'
              }}
            />
          </div>

          {/* Category & Date Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
                Category <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <select
                name="category"
                required
                value={formData.category}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  border: '1px solid #cbd5e1',
                  borderRadius: '10px',
                  fontSize: '0.95rem',
                  outline: 'none',
                  backgroundColor: '#ffffff'
                }}
              >
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
                Date Found <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="date"
                name="dateFound"
                required
                value={formData.dateFound}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  border: '1px solid #cbd5e1',
                  borderRadius: '10px',
                  fontSize: '0.95rem',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          {/* Location Found */}
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
              Where was it found? <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="text"
              name="locationFound"
              required
              value={formData.locationFound}
              onChange={handleChange}
              placeholder="e.g. Mechanical Workshop Bench 3, Academic Block A Washroom"
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                border: '1px solid #cbd5e1',
                borderRadius: '10px',
                fontSize: '0.95rem',
                outline: 'none'
              }}
            />
          </div>

          {/* Brand & Color */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
                Brand (if visible)
              </label>
              <input
                type="text"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                placeholder="e.g. Wildcraft, Sony, Casio"
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  border: '1px solid #cbd5e1',
                  borderRadius: '10px',
                  fontSize: '0.95rem',
                  outline: 'none'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
                Color
              </label>
              <input
                type="text"
                name="color"
                value={formData.color}
                onChange={handleChange}
                placeholder="e.g. Brown, White, Grey"
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  border: '1px solid #cbd5e1',
                  borderRadius: '10px',
                  fontSize: '0.95rem',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          {/* Public Description */}
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
              Public Description <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <textarea
              name="description"
              rows={3}
              required
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe general visual traits visible to all students..."
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

          {/* Private Verification Details (Confidential Box) */}
          <div style={{
            backgroundColor: '#f8fafc',
            border: '1px solid #cbd5e1',
            borderRadius: '12px',
            padding: '1.25rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#0f172a', fontWeight: 600, marginBottom: '0.3rem' }}>
              <Lock size={16} color="#7c3aed" /> Private Ownership Verification Question / Clue
            </div>
            <p style={{ fontSize: '0.825rem', color: '#64748b', marginBottom: '0.75rem' }}>
              <strong>Confidential:</strong> This will <em>NEVER</em> be displayed in public search. Only you and campus security can see it to verify genuine owners.
            </p>
            <textarea
              name="verificationDetails"
              rows={2}
              value={formData.verificationDetails}
              onChange={handleChange}
              placeholder="e.g. Contains ID card ending in ...204, Secret engraving 'To Aman with love', Red keychain inside..."
              style={{
                width: '100%',
                padding: '0.625rem 0.875rem',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                fontSize: '0.875rem',
                outline: 'none'
              }}
            />
          </div>

          {/* Photo Upload */}
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
              Photo of Found Item (Max 2 MB)
            </label>
            
            {photoPreview ? (
              <div style={{
                position: 'relative',
                display: 'inline-block',
                borderRadius: '12px',
                overflow: 'hidden',
                border: '2px solid #059669'
              }}>
                <img
                  src={photoPreview}
                  alt="Preview"
                  style={{ maxHeight: '200px', maxWidth: '100%', display: 'block' }}
                />
                <button
                  type="button"
                  onClick={removePhoto}
                  style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '50%',
                    width: '28px',
                    height: '28px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <label style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px dashed #6ee7b7',
                borderRadius: '12px',
                padding: '1.75rem',
                backgroundColor: '#f0fdf4',
                cursor: 'pointer'
              }}>
                <Upload size={32} color="#059669" style={{ marginBottom: '0.5rem' }} />
                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#047857' }}>
                  Click to select photo
                </span>
                <span style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.2rem' }}>
                  Streamed directly into MongoDB GridFS
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

          {/* Physical Custody Options */}
          <div style={{
            backgroundColor: '#ecfdf5',
            border: '1px solid #a7f3d0',
            borderRadius: '12px',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem'
          }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', fontWeight: 600, color: '#065f46' }}>
              <input
                type="checkbox"
                name="handedToSecurity"
                checked={formData.handedToSecurity}
                onChange={handleChange}
                style={{ width: '18px', height: '18px', accentColor: '#059669' }}
              />
              Have you already handed this item to Campus Security?
            </label>

            <div>
              <label style={{ display: 'block', fontSize: '0.825rem', color: '#065f46', marginBottom: '0.25rem', fontWeight: 500 }}>
                Physical Storage / Custody Location
              </label>
              <input
                type="text"
                name="storageLocation"
                value={formData.storageLocation}
                onChange={handleChange}
                placeholder="e.g. Main Gate Security Guard Cabin, Chemical Dept Reception"
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  border: '1px solid #a7f3d0',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  outline: 'none',
                  backgroundColor: '#ffffff'
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary"
            style={{ width: '100%', padding: '0.875rem', fontSize: '1rem', backgroundColor: '#059669', borderColor: '#059669' }}
          >
            {submitting ? 'Registering with GridFS...' : 'Publish Found Item Report'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ReportFound;
