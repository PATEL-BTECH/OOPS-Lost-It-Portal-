import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

/**
 * AWT Syllabus Requirement: Class-based React ErrorBoundary
 * Catches JavaScript errors anywhere in the child component tree,
 * logs errors, and displays a graceful fallback UI instead of crashing the app.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error details to console or an audit service
    console.error('[ErrorBoundary caught an error]:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f8fafc',
          padding: '2rem'
        }}>
          <div style={{
            maxWidth: '560px',
            width: '100%',
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: '2.5rem',
            border: '1px solid #fecaca',
            boxShadow: '0 10px 25px -5px rgba(239, 68, 68, 0.1)',
            textAlign: 'center'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              backgroundColor: '#fef2f2',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem',
              color: '#ef4444'
            }}>
              <AlertTriangle size={32} />
            </div>

            <h2 style={{ fontSize: '1.5rem', color: '#0f172a', marginBottom: '0.75rem' }}>
              Something Went Wrong
            </h2>

            <p style={{ color: '#475569', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
              The application encountered an unexpected runtime error. This incident has been logged by the React ErrorBoundary.
            </p>

            {this.state.error && (
              <div style={{
                textAlign: 'left',
                backgroundColor: '#1e293b',
                color: '#f8fafc',
                padding: '1rem',
                borderRadius: '8px',
                fontSize: '0.825rem',
                overflowX: 'auto',
                marginBottom: '1.5rem',
                fontFamily: 'monospace'
              }}>
                {this.state.error.toString()}
              </div>
            )}

            <button
              onClick={this.handleReload}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: '#7c3aed',
                color: '#ffffff',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '0.95rem',
                cursor: 'pointer'
              }}
            >
              <RefreshCw size={18} /> Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
