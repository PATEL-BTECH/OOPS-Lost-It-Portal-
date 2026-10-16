import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ShieldCheck, 
  GraduationCap, 
  AlertCircle, 
  CheckCircle, 
  UserCheck, 
  KeyRound, 
  ShieldAlert,
  Sparkles,
  Info
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const { user, isAuthenticated, loginWithGoogle, loginDevUser, authError, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const googleBtnRef = useRef(null);

  const [activeTab, setActiveTab] = useState('google'); // 'google' | 'dev'
  const [submitting, setSubmitting] = useState(false);
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [selectedRole, setSelectedRole] = useState('student');

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
  const from = location.state?.from?.pathname || '/dashboard';

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

    // Check if GIS script is loaded
    const initializeGsi = () => {
      if (window.google && window.google.accounts && googleClientId && googleBtnRef.current) {
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
            text: 'continue_with',
            logo_alignment: 'left',
            width: 320
          });
        } catch (err) {
          console.error('Error initializing Google Sign-In:', err);
        }
      }
    };

    // Dynamically inject Google GIS script if not present
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

  // Handle Google OAuth Credential Callback
  const handleGoogleResponse = async (response) => {
    if (!response.credential) return;
    setSubmitting(true);
    const result = await loginWithGoogle(response.credential);
    setSubmitting(false);

    if (result.success) {
      const role = result.user.role;
      if (role === 'admin') navigate('/admin');
      else if (role === 'security') navigate('/security');
      else navigate(from);
    }
  };

  // Quick Dev Login for Lab Evaluations
  const handleDevLogin = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const result = await loginDevUser({
      role: selectedRole,
      name: customName || undefined,
      email: customEmail || undefined
    });
    setSubmitting(false);

    if (result.success) {
      if (result.user.role === 'admin') navigate('/admin');
      else if (result.user.role === 'security') navigate('/security');
      else navigate(from);
    }
  };

  return (
    <div className="login-page" style={{
      maxWidth: '520px',
      margin: '2.5rem auto',
      padding: '0 1rem'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '20px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 10px 25px -5px rgba(109, 40, 217, 0.08)',
        overflow: 'hidden'
      }}>
        {/* Header Header */}
        <div style={{
          background: 'linear-gradient(135deg, #7c3aed, #5b21b6)',
          padding: '2.5rem 2rem',
          color: '#ffffff',
          textAlign: 'center'
        }}>
          <div style={{
            width: '56px',
            height: '56px',
            backgroundColor: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(8px)',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem',
            color: '#ffffff'
          }}>
            <ShieldCheck size={32} />
          </div>
          <h1 style={{ fontSize: '1.6rem', color: '#ffffff', marginBottom: '0.4rem', fontWeight: 700 }}>
            Campus Lost &amp; Found
          </h1>
          <p style={{ fontSize: '0.9rem', color: '#ddd6fe' }}>
            Official University Property Recovery Portal
          </p>

          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            padding: '0.3rem 0.8rem',
            borderRadius: '9999px',
            fontSize: '0.785rem',
            marginTop: '1rem',
            fontWeight: 500
          }}>
            <GraduationCap size={14} /> Domain: @gsfcuniversity.ac.in
          </div>
        </div>

        {/* Tab Switcher */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid #e2e8f0',
          backgroundColor: '#f8fafc'
        }}>
          <button
            onClick={() => setActiveTab('google')}
            style={{
              flex: 1,
              padding: '0.875rem',
              border: 'none',
              background: activeTab === 'google' ? '#ffffff' : 'transparent',
              borderBottom: activeTab === 'google' ? '2px solid #7c3aed' : 'none',
              color: activeTab === 'google' ? '#7c3aed' : '#64748b',
              fontWeight: 600,
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem'
            }}
          >
            <Sparkles size={16} /> Google OAuth 2.0
          </button>
          <button
            onClick={() => setActiveTab('dev')}
            style={{
              flex: 1,
              padding: '0.875rem',
              border: 'none',
              background: activeTab === 'dev' ? '#ffffff' : 'transparent',
              borderBottom: activeTab === 'dev' ? '2px solid #7c3aed' : 'none',
              color: activeTab === 'dev' ? '#7c3aed' : '#64748b',
              fontWeight: 600,
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem'
            }}
          >
            <KeyRound size={16} /> Lab Role Testing
          </button>
        </div>

        {/* Card Body */}
        <div style={{ padding: '2rem' }}>
          {/* Error Notice */}
          {authError && (
            <div style={{
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#991b1b',
              padding: '0.875rem 1rem',
              borderRadius: '10px',
              marginBottom: '1.5rem',
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.6rem'
            }}>
              <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>{authError}</div>
            </div>
          )}

          {activeTab === 'google' ? (
            <div>
              {/* Domain Restriction Notice */}
              <div style={{
                backgroundColor: '#f5f3ff',
                border: '1px solid #ddd6fe',
                borderRadius: '10px',
                padding: '1rem',
                marginBottom: '1.75rem',
                fontSize: '0.85rem',
                color: '#4c1d95',
                lineHeight: 1.5
              }}>
                <div style={{ fontWeight: 600, marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Info size={16} /> University Domain Restriction
                </div>
                You must sign in using your official <strong>@gsfcuniversity.ac.in</strong> email account. Personal Gmail addresses are automatically rejected.
              </div>

              {/* Google Button Container */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                {googleClientId ? (
                  <div ref={googleBtnRef} style={{ minHeight: '44px' }} />
                ) : (
                  <div style={{
                    width: '100%',
                    backgroundColor: '#fffbeb',
                    border: '1px solid #fde68a',
                    padding: '1.25rem',
                    borderRadius: '10px',
                    color: '#92400e',
                    fontSize: '0.875rem',
                    textAlign: 'left'
                  }}>
                    <strong style={{ display: 'block', marginBottom: '0.5rem' }}>
                      ⚙️ Google Client ID Not Configured
                    </strong>
                    To enable live Google Sign-In, set <code>VITE_GOOGLE_CLIENT_ID</code> in <code>client/.env</code>.
                    <br /><br />
                    <em>Use the <strong>Lab Role Testing</strong> tab above to sign in as Student, Admin, or Security Staff immediately!</em>
                  </div>
                )}

                {submitting && (
                  <p style={{ color: '#7c3aed', fontSize: '0.875rem', fontWeight: 500 }}>
                    Verifying Google credentials with university server...
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div>
              <div style={{
                backgroundColor: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: '10px',
                padding: '0.875rem 1rem',
                marginBottom: '1.25rem',
                fontSize: '0.825rem',
                color: '#166534',
                lineHeight: 1.5
              }}>
                <strong>AWT Lab Evaluator Mode:</strong> Test role-based authorization without needing external Google Cloud credentials setup.
              </div>

              <form onSubmit={handleDevLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
                    Select Test Role
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                    {[
                      { role: 'student', label: 'Student' },
                      { role: 'admin', label: 'Admin' },
                      { role: 'security', label: 'Security' }
                    ].map((item) => (
                      <button
                        type="button"
                        key={item.role}
                        onClick={() => setSelectedRole(item.role)}
                        style={{
                          padding: '0.625rem',
                          borderRadius: '8px',
                          border: selectedRole === item.role ? '2px solid #7c3aed' : '1px solid #cbd5e1',
                          backgroundColor: selectedRole === item.role ? '#ede9fe' : '#ffffff',
                          color: selectedRole === item.role ? '#6d28d9' : '#475569',
                          fontWeight: 600,
                          fontSize: '0.85rem',
                          cursor: 'pointer'
                        }}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
                    User Display Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder={selectedRole === 'admin' ? 'Nand Patel' : 'GSFC University Member'}
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

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
                    University Email
                  </label>
                  <input
                    type="email"
                    value={customEmail}
                    onChange={(e) => setCustomEmail(e.target.value)}
                    placeholder={`${selectedRole}@gsfcuniversity.ac.in`}
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

                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary"
                  style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem' }}
                >
                  {submitting ? 'Signing In...' : `Sign In as ${selectedRole.toUpperCase()}`}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div style={{
          backgroundColor: '#f8fafc',
          borderTop: '1px solid #e2e8f0',
          padding: '1rem',
          textAlign: 'center',
          fontSize: '0.8rem',
          color: '#64748b'
        }}>
          Protected by Campus Security • Cookies encrypted with SameSite Lax
        </div>
      </div>
    </div>
  );
};

export default Login;
