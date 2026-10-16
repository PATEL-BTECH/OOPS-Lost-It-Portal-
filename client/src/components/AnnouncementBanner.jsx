import React, { useState, useEffect } from 'react';
import { Bell, AlertTriangle, Info, X } from 'lucide-react';
import { getAnnouncements } from '../services/admin.service';

const AnnouncementBanner = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchNotices = async () => {
      try {
        const res = await getAnnouncements();
        if (isMounted && res.announcements && res.announcements.length > 0) {
          setAnnouncements(res.announcements);
        }
      } catch (err) {
        // Non-blocking in public view
      }
    };
    fetchNotices();
    return () => { isMounted = false; };
  }, []);

  if (dismissed || announcements.length === 0) return null;

  const latest = announcements[0];
  const isUrgent = latest.priority === 'urgent';

  return (
    <div style={{
      backgroundColor: isUrgent ? '#fef2f2' : '#f5f3ff',
      border: `1px solid ${isUrgent ? '#fecaca' : '#ddd6fe'}`,
      borderRadius: '12px',
      padding: '0.875rem 1.25rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '1rem',
      marginBottom: '1rem',
      boxShadow: '0 2px 4px rgba(0,0,0,0.03)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          backgroundColor: isUrgent ? '#ef4444' : '#7c3aed',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}>
          {isUrgent ? <AlertTriangle size={18} /> : <Bell size={18} />}
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{
              fontSize: '0.7rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              padding: '0.1rem 0.4rem',
              borderRadius: '4px',
              backgroundColor: isUrgent ? '#dc2626' : '#6d28d9',
              color: '#ffffff'
            }}>
              CAMPUS NOTICE
            </span>
            <strong style={{ fontSize: '0.9rem', color: isUrgent ? '#991b1b' : '#4c1d95' }}>
              {latest.title}
            </strong>
          </div>
          <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', color: isUrgent ? '#7f1d1d' : '#5b21b6' }}>
            {latest.content}
          </p>
        </div>
      </div>

      <button
        onClick={() => setDismissed(true)}
        style={{
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          color: isUrgent ? '#991b1b' : '#6d28d9',
          padding: '0.25rem',
          display: 'flex',
          alignItems: 'center'
        }}
        title="Dismiss notice"
      >
        <X size={18} />
      </button>
    </div>
  );
};

export default AnnouncementBanner;
