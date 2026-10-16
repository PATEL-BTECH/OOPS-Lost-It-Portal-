import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  HelpCircle, 
  Upload, 
  MapPin, 
  Calendar, 
  Tag, 
  FileText, 
  Phone, 
  Gift, 
  CheckCircle2, 
  AlertCircle,
  X
} from 'lucide-react';
import { getCategories, createLostItem } from '../services/items.service';

const ReportLost = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Controlled form state
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    brand: '',
    color: '',
    lastSeenLocation: '',
    dateLost: new Date().toISOString().split('T')[0],
    description: '',
    rewardOffered: '',
    contactPhone: ''
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
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCats();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setError('Photo exceeds maximum 2 MB limit. Please select a smaller image.');
      return;
    }

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Only JPG, PNG, and WebP image formats are supported.');
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

      const response = await createLostItem(data);
      if (response.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/items');
        }, 1500);
      }
    } catch (err) {
      setError(err.message || 'Failed to submit lost item report.');
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
        boxShadow: '0 10px 25px -5px rgba(109, 40, 217, 0.06)'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
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
            <HelpCircle size={26} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.6rem', color: '#0f172a' }}>Report a Lost Item</h1>
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
              Broadcast your missing belonging across the university portal to enable matching.
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
            <CheckCircle2 size={20} /> Report registered! Redirecting to campus feed...
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
              placeholder="e.g. Blue Dell Laptop Charger, Silver Casio Scientific Calculator"
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
                Date Lost <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="date"
                name="dateLost"
                required
                value={formData.dateLost}
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

          {/* Last Seen Location */}
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
              Last Seen Location <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="text"
              name="lastSeenLocation"
              required
              value={formData.lastSeenLocation}
              onChange={handleChange}
              placeholder="e.g. Central Library 1st Floor Study Cubicle, Canteen Table 4"
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
                Brand / Manufacturer
              </label>
              <input
                type="text"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                placeholder="e.g. Apple, Dell, Casio, Milton"
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
                Primary Color
              </label>
              <input
                type="text"
                name="color"
                value={formData.color}
                onChange={handleChange}
                placeholder="e.g. Matte Black, Navy Blue, Silver"
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

          {/* Description */}
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
              Detailed Description <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <textarea
              name="description"
              rows={4}
              required
              value={formData.description}
              onChange={handleChange}
              placeholder="Provide identifiable traits, stickers, scratches, case color, or unique markers..."
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

          {/* Photo Upload with GridFS Preview */}
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
              Item Photo (Stored via MongoDB GridFS — Max 2 MB)
            </label>
            
            {photoPreview ? (
              <div style={{
                position: 'relative',
                display: 'inline-block',
                borderRadius: '12px',
                overflow: 'hidden',
                border: '2px solid #7c3aed'
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
                border: '2px dashed #c4b5fd',
                borderRadius: '12px',
                padding: '1.75rem',
                backgroundColor: '#f5f3ff',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}>
                <Upload size={32} color="#7c3aed" style={{ marginBottom: '0.5rem' }} />
                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#6d28d9' }}>
                  Click to select photo
                </span>
                <span style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.2rem' }}>
                  Supports JPEG, PNG, WebP up to 2 MB
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

          {/* Reward & Contact */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
                Reward Offered (Optional)
              </label>
              <input
                type="text"
                name="rewardOffered"
                value={formData.rewardOffered}
                onChange={handleChange}
                placeholder="e.g. Free cafeteria coffee, ₹200 treat"
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
                Contact Phone / WhatsApp (Optional)
              </label>
              <input
                type="tel"
                name="contactPhone"
                value={formData.contactPhone}
                onChange={handleChange}
                placeholder="e.g. +91 98765 43210"
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

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="btn-primary"
            style={{ width: '100%', padding: '0.875rem', fontSize: '1rem', marginTop: '0.5rem' }}
          >
            {submitting ? 'Streaming Photo & Submitting...' : 'Post Lost Item Report'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ReportLost;
