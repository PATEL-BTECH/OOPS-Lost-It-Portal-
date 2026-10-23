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

const GoogleIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </svg>
);

const Register = () => {
  const { user, isAuthenticated, loginWithGoogle, authError, clearError } = useAuth();
  const navigate = useNavigate();
  const googleBtnRef = useRef(null);
  const [submitting, setSubmitting] = useState(false);

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      if (!user.phone || !user.studentId) {
        navigate('/complete-profile', { replace: true });
      } else if (user.role === 'admin') {
        navigate('/admin', { replace: true });
      } else if (user.role === 'security') {
        navigate('/security', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
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
            theme: 'filled_blue',
            size: 'large',
            type: 'standard',
            shape: 'pill',
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
      // If contact number or student ID is not set yet, ask student onboarding questions
      if (!result.user.phone || !result.user.studentId) {
        navigate('/complete-profile');
      } else {
        navigate('/dashboard');
      }
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
        boxShadow: '0 20px 25px -5px rgba(109, 40, 217, 0.12), 0 8px 10px -6px rgba(109, 40, 217, 0.06)',
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
            width: '64px',
            height: '64px',
            backgroundColor: 'rgba(255, 255, 255, 0.18)',
            backdropFilter: 'blur(10px)',
            borderRadius: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem',
            color: '#ffffff',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            boxShadow: '0 8px 16px rgba(0, 0, 0, 0.15)'
          }}>
            <UserPlus size={32} />
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
            padding: '0.4rem 0.95rem',
            borderRadius: '9999px',
            fontSize: '0.8rem',
            marginTop: '1.25rem',
            fontWeight: 600,
            border: '1px solid rgba(255, 255, 255, 0.3)'
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

          {/* DASHY GOOGLE SIGN-UP HERO CARD */}
          <div style={{
            background: 'linear-gradient(145deg, #ffffff 0%, #f5f3ff 100%)',
            border: '2px solid #ddd6fe',
            borderRadius: '20px',
            padding: '1.75rem 1.5rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: '1rem',
            boxShadow: '0 10px 25px -5px rgba(124, 58, 237, 0.12)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Top decorative gradient glow */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: 'linear-gradient(90deg, #4285F4, #EA4335, #FBBC05, #34A853)'
            }} />

            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: '#ede9fe',
              color: '#6d28d9',
              padding: '0.25rem 0.75rem',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              <Sparkles size={13} /> Instant Campus SSO
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                backgroundColor: '#ffffff',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid #e2e8f0'
              }}>
                <GoogleIcon />
              </div>
              <div style={{ textAlign: 'left' }}>
                <h2 style={{ fontSize: '1.15rem', color: '#0f172a', margin: 0, fontWeight: 700 }}>
                  Sign up with Google
                </h2>
                <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0.15rem 0 0' }}>
                  Use your official @gsfcuniversity.ac.in account
                </p>
              </div>
            </div>

            {/* Google Sign-Up Container */}
            <div style={{
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '48px',
              marginTop: '0.5rem'
            }}>
              {googleClientId ? (
                <div 
                  ref={googleBtnRef} 
                  style={{ 
                    minHeight: '44px',
                    display: 'flex',
                    justifyContent: 'center',
                    transform: 'scale(1.02)'
                  }} 
                />
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#7c3aed', fontSize: '0.875rem', fontWeight: 600, marginTop: '0.75rem' }}>
                  <span className="spin-icon">⏳</span> Verifying university domain credentials...
                </div>
              )}
            </div>

            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
              One-click setup • Your profile will be linked securely
            </div>
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
            Already have an account?{' '}
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
