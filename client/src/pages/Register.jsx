import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  GraduationCap, 
  AlertCircle, 
  CheckCircle, 
  Lock, 
  Sparkles,
  Info,
  ArrowRight,
  UserPlus
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import BRANDING from '../config/branding';

const Register = () => {
  const { user, isAuthenticated, loginWithGoogle, authError, clearError } = useAuth();
  const navigate = useNavigate();
  const googleBtnRef = useRef(null);
  const [submitting, setSubmitting] = useState(false);

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'admin') navigate('/admin', { replace: true });
      else if (user.role === 'security') navigate('/security', { replace: true });
      else navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  // Handle Google Identity Services (GIS) Initialization
  useEffect(() => {
    clearError();

    const initializeGsi = () => {
      if (window.google?.accounts?.id && googleClientId && googleBtnRef.current) {
        try {
          window.google.accounts.id.initialize({
            client_id: googleClientId,
            callback: handleGoogleResponse,
            auto_select: false,
            cancel_on_tap_outside: true
          });

          window.google.accounts.id.renderButton(googleBtnRef.current, {
            theme: 'outline',
            size: 'large',
            type: 'standard',
            shape: 'rectangular',
            text: 'signup_with',
            logo_alignment: 'left',
            width: 320
          });
        } catch (err) {
          console.error('Error initializing Google Sign-In:', err);
        }
      }
    };

    if (!window.google?.accounts) {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = initializeGsi;
      document.body.appendChild(script);
    } else {
      initializeGsi();
    }
  }, [googleClientId]);

  const handleGoogleResponse = async (response) => {
    if (!response.credential) return;
    setSubmitting(true);
    // Explicitly enforce that new registrations default to 'student' role
    const result = await loginWithGoogle(response.credential, 'student');
    setSubmitting(false);

    if (result.success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="register-page" style={{
      maxWidth: '520px',
      margin: '2rem auto',
      padding: '0 1rem'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '24px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 20px 25px -5px rgba(109, 40, 217, 0.1), 0 8px 10px -6px rgba(109, 40, 217, 0.05)',
        overflow: 'hidden'
      }}>
        {/* Violet University Brand Header */}
        <div style={{
          background: 'linear-gradient(135deg, #4c1d95 0%, #6d28d9 50%, #7c3aed 100%)',
          padding: '2.5rem 2rem',
          color: '#ffffff',
          textAlign: 'center'
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            backgroundColor: 'rgba(255, 255, 255, 0.18)',
            backdropFilter: 'blur(10px)',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem',
            color: '#ffffff',
            border: '1px solid rgba(255, 255, 255, 0.3)'
          }}>
            <UserPlus size={30} />
          </div>
          <h1 style={{ fontSize: '1.65rem', color: '#ffffff', marginBottom: '0.35rem', fontWeight: 800 }}>
            Student Registration
          </h1>
          <p style={{ fontSize: '0.9rem', color: '#ddd6fe', margin: 0 }}>
            {BRANDING.appName} • {BRANDING.university}
          </p>

          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            padding: '0.35rem 0.85rem',
            borderRadius: '9999px',
            fontSize: '0.785rem',
            marginTop: '1.25rem',
            fontWeight: 600,
            border: '1px solid rgba(255, 255, 255, 0.25)'
          }}>
            <GraduationCap size={15} /> Authorized Domain: {BRANDING.domain}
          </div>
        </div>

        {/* Card Body */}
        <div style={{ padding: '2.25rem 2rem' }}>
          {/* Error Notice */}
          {authError && (
            <div style={{
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#991b1b',
              padding: '1rem',
              borderRadius: '12px',
              marginBottom: '1.5rem',
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.65rem'
            }}>
              <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong>Registration Notice:</strong>
                <div style={{ marginTop: '0.2rem' }}>{authError}</div>
              </div>
            </div>
          )}

          {/* Registration Rules Notice */}
          <div style={{
            backgroundColor: '#f5f3ff',
            border: '1px solid #ddd6fe',
            borderRadius: '14px',
            padding: '1.25rem',
            marginBottom: '2rem',
            fontSize: '0.85rem',
            color: '#4c1d95',
            lineHeight: 1.55
          }}>
            <div style={{ fontWeight: 700, marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Info size={16} color="#6d28d9" /> Verified Student Enrollment Policy
            </div>
            All students are automatically assigned the default <strong>Student</strong> role upon first authentication with your university Google account.
            <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#6d28d9', fontStyle: 'italic' }}>
              Privileged roles (Admin, Security Custodian) cannot be self-selected and require formal Administrator approval.
            </div>
          </div>

          {/* Google Sign-Up Container */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
            {googleClientId ? (
              <div ref={googleBtnRef} style={{ minHeight: '44px' }} />
            ) : (
              <div style={{
                width: '100%',
                backgroundColor: '#fffbeb',
                border: '1px solid #fde68a',
                padding: '1rem',
                borderRadius: '10px',
                color: '#92400e',
                fontSize: '0.85rem'
              }}>
                Please ensure <code>VITE_GOOGLE_CLIENT_ID</code> is configured in <code>client/.env</code>.
              </div>
            )}

            {submitting && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#7c3aed', fontSize: '0.875rem', fontWeight: 600 }}>
                <span className="spin-icon">⏳</span> Verifying university domain credentials...
              </div>
            )}
          </div>

          {/* Link to Login */}
          <div style={{
            marginTop: '2rem',
            paddingTop: '1.5rem',
            borderTop: '1px solid #f1f5f9',
            textAlign: 'center',
            fontSize: '0.875rem',
            color: '#64748b'
          }}>
            Already registered on the portal?{' '}
            <Link to="/login" style={{ color: '#7c3aed', fontWeight: 700, textDecoration: 'none' }}>
              Sign In Here <ArrowRight size={14} style={{ verticalAlign: 'middle' }} />
            </Link>
          </div>
        </div>

        {/* Security Footer */}
        <div style={{
          backgroundColor: '#f8fafc',
          borderTop: '1px solid #e2e8f0',
          padding: '0.875rem',
          textAlign: 'center',
          fontSize: '0.785rem',
          color: '#64748b'
        }}>
          Protected by Campus Access Gate • University Single Sign-On (SSO)
        </div>
      </div>
    </div>
  );
};

export default Register;
