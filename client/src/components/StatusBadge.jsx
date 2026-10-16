import React from 'react';

/**
 * AWT Syllabus Requirement: React.memo for reusable performance-optimized component
 * Renders status badges (operational, connected, disconnected, warning, etc.)
 * Only re-renders if props (status, label, pulse) actually change.
 */
const StatusBadge = React.memo(({ status = 'operational', label, pulse = false }) => {
  const getColors = () => {
    switch (status) {
      case 'operational':
      case 'connected':
      case 'success':
        return {
          bg: '#ecfdf5',
          text: '#065f46',
          border: '#a7f3d0',
          dot: '#10b981'
        };
      case 'connecting':
      case 'warning':
      case 'pending':
        return {
          bg: '#fffbeb',
          text: '#92400e',
          border: '#fde68a',
          dot: '#f59e0b'
        };
      case 'error':
      case 'disconnected':
      case 'failed':
        return {
          bg: '#fef2f2',
          text: '#991b1b',
          border: '#fecaca',
          dot: '#ef4444'
        };
      default:
        return {
          bg: '#f1f5f9',
          text: '#475569',
          border: '#e2e8f0',
          dot: '#94a3b8'
        };
    }
  };

  const colors = getColors();
  const displayLabel = label || status.toUpperCase();

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.45rem',
        padding: '0.25rem 0.75rem',
        borderRadius: '9999px',
        fontSize: '0.785rem',
        fontWeight: 600,
        backgroundColor: colors.bg,
        color: colors.text,
        border: `1px solid ${colors.border}`,
        letterSpacing: '0.025em',
        textTransform: 'uppercase'
      }}
    >
      <span
        style={{
          width: '7px',
          height: '7px',
          borderRadius: '50%',
          backgroundColor: colors.dot,
          boxShadow: pulse ? `0 0 8px ${colors.dot}` : 'none'
        }}
      />
      {displayLabel}
    </span>
  );
});

StatusBadge.displayName = 'StatusBadge';

export default StatusBadge;
