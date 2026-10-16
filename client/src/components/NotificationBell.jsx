import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Check, Sparkles, AlertCircle, Info, ExternalLink } from 'lucide-react';
import { 
  getNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead 
} from '../services/notifications.service';
import { useAuth } from '../context/AuthContext';

const NotificationBell = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  const fetchNotifs = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const data = await getNotifications();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (err) {
      // Ignore polling errors silently
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchNotifs();
    // Poll notifications every 30 seconds
    const interval = setInterval(fetchNotifs, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifs]);

  // Handle outside click to close
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = async (notif) => {
    if (!notif.isRead) {
      await markNotificationAsRead(notif._id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === notif._id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
    setOpen(false);
    if (notif.link) {
      navigate(notif.link);
    }
  };

  const handleMarkAllRead = async () => {
    await markAllNotificationsAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  if (!isAuthenticated) return null;

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          position: 'relative',
          backgroundColor: '#f1f5f9',
          border: '1px solid #e2e8f0',
          borderRadius: '50%',
          width: '38px',
          height: '38px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          color: '#475569',
          transition: 'background-color 0.2s'
        }}
        title="Notifications"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '-3px',
              right: '-3px',
              backgroundColor: '#ef4444',
              color: '#ffffff',
              fontSize: '0.7rem',
              fontWeight: 700,
              borderRadius: '9999px',
              minWidth: '18px',
              height: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 4px',
              border: '2px solid #ffffff'
            }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {open && (
        <div
          style={{
            position: 'absolute',
            top: '46px',
            right: '0',
            width: '340px',
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e2e8f0',
            zIndex: 100,
            overflow: 'hidden'
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '0.875rem 1rem',
              borderBottom: '1px solid #f1f5f9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a' }}>
              Notifications
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                style={{
                  border: 'none',
                  background: 'none',
                  color: '#7c3aed',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.2rem'
                }}
              >
                <Check size={13} /> Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div style={{ maxHeight: '360px', overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <div style={{ padding: '2rem 1rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.875rem' }}>
                <Bell size={28} style={{ margin: '0 auto 0.5rem', opacity: 0.5 }} />
                No notifications right now
              </div>
            ) : (
              notifications.map((notif) => {
                const isMatch = notif.type === 'match_suggestion';
                return (
                  <div
                    key={notif._id}
                    onClick={() => handleNotificationClick(notif)}
                    style={{
                      padding: '0.875rem 1rem',
                      borderBottom: '1px solid #f8fafc',
                      backgroundColor: notif.isRead ? '#ffffff' : '#f5f3ff',
                      cursor: 'pointer',
                      display: 'flex',
                      gap: '0.75rem',
                      transition: 'background-color 0.15s'
                    }}
                  >
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        backgroundColor: isMatch ? '#ede9fe' : '#e0f2fe',
                        color: isMatch ? '#7c3aed' : '#0284c7',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      {isMatch ? <Sparkles size={16} /> : <Info size={16} />}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontSize: '0.85rem',
                          fontWeight: notif.isRead ? 600 : 700,
                          color: '#0f172a',
                          marginBottom: '0.2rem'
                        }}
                      >
                        {notif.title}
                      </div>
                      <div style={{ fontSize: '0.785rem', color: '#475569', lineHeight: 1.4 }}>
                        {notif.message}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.35rem' }}>
                        {new Date(notif.createdAt).toLocaleDateString()} • {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
