import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  UserCheck, 
  Phone, 
  CreditCard, 
  Building, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  GraduationCap
} from 'lucide-react';

const DEPARTMENTS = [
  'School of Technology - Computer Science & Engineering',
  'School of Technology - Chemical Engineering',
  'School of Technology - Mechanical Engineering',
  'School of Technology - Fire & Environment Health Safety',
  'School of Science - Biotechnology / Microbiology',
  'School of Science - Chemistry / Data Science',
  'School of Management - BBA / MBA',
  'School of Liberal Arts',
  'Other University Department'
];

const CompleteProfile = () => {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    studentId: user?.studentId || '',
    department: user?.department || DEPARTMENTS[0]
  });

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Auto-fill studentId from email if not already present
  useEffect(() => {
    if (user) {
      let derivedId = user.studentId || '';
      if (!derivedId && user.email) {
        const prefix = user.email.split('@')[0].toUpperCase();
        if (/^[0-9]{2}[A-Z]{2,4}[0-9]{2,6}$/i.test(prefix)) {
          derivedId = prefix;
        }
      }

      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        studentId: derivedId,
        department: user.department || DEPARTMENTS[0]
      });
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.name.trim()) {
      setErrorMsg('Please provide your full legal name.');
      return;
    }
    if (!formData.phone.trim() || formData.phone.trim().length < 8) {
      setErrorMsg('Please enter a valid active contact phone number.');
      return;
    }
    if (!formData.studentId.trim()) {
      setErrorMsg('Please enter your university Student ID or Enrollment number.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await updateProfile(formData);
      if (res.success) {
        setSuccessMsg('Profile verified and saved! Taking you to your dashboard...');
        setTimeout(() => {
          if (user?.role === 'admin') navigate('/admin');
          else if (user?.role === 'security') navigate('/security');
          else navigate('/dashboard');
        }, 1200);
      } else {
        setErrorMsg(res.error || 'Failed to save profile details.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Error updating profile.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      maxWidth: '560px',
      margin: '2.5rem auto',
      padding: '0 1rem'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '24px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 20px 25px -5px rgba(109, 40, 217, 0.1), 0 8px 10px -6px rgba(109, 40, 217, 0.05)',
        overflow: 'hidden'
      }}>
        {/* Violet Banner Header */}
        <div style={{
          background: 'linear-gradient(135deg, #4c1d95 0%, #6d28d9 50%, #7c3aed 100%)',
          padding: '2.25rem 2rem',
          color: '#ffffff',
          textAlign: 'center'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(10px)',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem',
            border: '1px solid rgba(255, 255, 255, 0.3)'
          }}>
            <GraduationCap size={34} color="#ffffff" />
          </div>
          <h1 style={{ fontSize: '1.5rem', margin: 0, fontWeight: 700 }}>
            Complete Your Student Profile
          </h1>
          <p style={{ color: '#ddd6fe', fontSize: '0.9rem', margin: '0.4rem 0 0' }}>
            Help campus security &amp; fellow students easily return your lost belongings
          </p>
        </div>

        {/* Content Body */}
        <div style={{ padding: '2rem' }}>
          {errorMsg && (
            <div style={{
              backgroundColor: '#fee2e2',
              border: '1px solid #fecaca',
              color: '#b91c1c',
              padding: '0.85rem 1rem',
              borderRadius: '10px',
              marginBottom: '1.5rem',
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <AlertCircle size={18} />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div style={{
              backgroundColor: '#dcfce7',
              border: '1px solid #bbf7d0',
              color: '#15803d',
              padding: '0.85rem 1rem',
              borderRadius: '10px',
              marginBottom: '1.5rem',
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <CheckCircle2 size={18} />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Full Name */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                Full Name (as per Student ID) *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. John Doe"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.9rem'
                }}
              />
            </div>

            {/* University Domain Email (Read Only) */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                Official University Email (Verified SSO)
              </label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '10px',
                  border: '1px solid #e2e8f0',
                  backgroundColor: '#f8fafc',
                  color: '#64748b',
                  fontSize: '0.9rem',
                  cursor: 'not-allowed'
                }}
              />
            </div>

            {/* Contact / Phone Number */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                Active Contact Number *
              </label>
              <div style={{ position: 'relative' }}>
                <Phone size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '14px' }} />
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  style={{
                    width: '100%',
                    padding: '0.75rem 0.75rem 0.75rem 2.4rem',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.9rem'
                  }}
                />
              </div>
              <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '0.25rem 0 0' }}>
                Campus Security Desk will call/SMS this number when an item is ready for handover.
              </p>
            </div>

            {/* Student ID / Enrollment Number */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                Student ID / Enrollment Number *
              </label>
              <div style={{ position: 'relative' }}>
                <CreditCard size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '14px' }} />
                <input
                  type="text"
                  required
                  value={formData.studentId}
                  onChange={(e) => setFormData({ ...formData, studentId: e.target.value.toUpperCase() })}
                  placeholder="e.g. 24BT04082"
                  style={{
                    width: '100%',
                    padding: '0.75rem 0.75rem 0.75rem 2.4rem',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.9rem',
                    textTransform: 'uppercase',
                    fontWeight: 600
                  }}
                />
              </div>
              <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '0.25rem 0 0' }}>
                Used for in-person identity verification at security gates before physical item release.
              </p>
            </div>

            {/* Department */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                Academic Department / School *
              </label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.9rem',
                  backgroundColor: '#ffffff'
                }}
              >
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary"
              style={{
                marginTop: '1rem',
                padding: '0.85rem',
                fontSize: '1rem',
                fontWeight: 700,
                backgroundColor: '#7c3aed',
                borderColor: '#7c3aed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                boxShadow: '0 10px 15px -3px rgba(124, 58, 237, 0.3)'
              }}
            >
              {submitting ? 'Saving Details...' : (
                <>
                  Enter Campus Lost &amp; Found Portal <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CompleteProfile;
