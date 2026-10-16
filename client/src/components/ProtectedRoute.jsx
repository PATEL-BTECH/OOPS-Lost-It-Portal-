import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute Component
 * Guards routes by checking authentication status and role permissions.
 */
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{
        minHeight: '60vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1rem'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid #ede9fe',
          borderTopColor: '#7c3aed',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite'
        }} />
        <p style={{ color: '#64748b', fontSize: '0.95rem' }}>Verifying campus credentials...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login preserving destination
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role authorization
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return (
      <div style={{
        maxWidth: '540px',
        margin: '4rem auto',
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        padding: '2.5rem',
        border: '1px solid #fee2e2',
        boxShadow: '0 10px 25px -5px rgba(239, 68, 68, 0.08)',
        textAlign: 'center'
      }}>
        <div style={{
          width: '60px',
          height: '60px',
          backgroundColor: '#fef2f2',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.25rem',
          color: '#ef4444'
        }}>
          <ShieldAlert size={32} />
        </div>
        <h2 style={{ fontSize: '1.4rem', color: '#0f172a', marginBottom: '0.5rem' }}>
          Restricted Portal Access
        </h2>
        <p style={{ color: '#475569', fontSize: '0.95rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
          Your account role is <strong>{user.role.toUpperCase()}</strong>. Access to this section requires 
          <strong> {allowedRoles.join(' or ').toUpperCase()}</strong> privileges.
        </p>
        <Link to="/dashboard" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
          <ArrowLeft size={16} /> Return to Your Dashboard
        </Link>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
