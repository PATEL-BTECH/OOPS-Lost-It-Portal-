import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  ShieldCheck, 
  LayoutDashboard, 
  PlusCircle, 
  Package, 
  Search, 
  FileText, 
  Users, 
  BarChart3, 
  Activity, 
  Boxes, 
  Receipt, 
  Bell, 
  LogOut, 
  User, 
  ChevronRight,
  Menu,
  X,
  GraduationCap,
  Sparkles,
  Lock,
  Compass
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';
import BRANDING from '../config/branding';

const Sidebar = ({ mobileOpen, setMobileOpen }) => {
  const { user, isAuthenticated, logout, isStudent, isAdmin, isSecurity } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Student Links
  const studentLinks = [
    { to: '/dashboard', label: 'My Dashboard', icon: LayoutDashboard },
    { to: '/report-lost', label: 'Report Lost Item', icon: PlusCircle, badge: 'Lost' },
    { to: '/report-found', label: 'Report Found Item', icon: Package, badge: 'Found' },
    { to: '/items', label: 'Browse Catalog', icon: Search },
    { to: '/claims/my', label: 'My Claims', icon: FileText },
    { to: '/profile', label: 'Account & Session', icon: User }
  ];

  // Admin Links
  const adminLinks = [
    { to: '/admin', label: 'Admin Console', icon: LayoutDashboard },
    { to: '/items', label: 'Full Item Catalog', icon: Search },
    { to: '/report-found', label: 'Intake Found Item', icon: Package },
    { to: '/claims/my', label: 'Claims History', icon: FileText },
    { to: '/profile', label: 'Account & Session', icon: User }
  ];

  // Security Staff Links
  const securityLinks = [
    { to: '/security', label: 'Custody Desk & Lockers', icon: Boxes },
    { to: '/items', label: 'Browse Catalog', icon: Search },
    { to: '/report-found', label: 'Intake Found Item', icon: Package },
    { to: '/profile', label: 'Account & Session', icon: User }
  ];

  const links = isAdmin ? adminLinks : isSecurity ? securityLinks : studentLinks;

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(4px)',
            zIndex: 40
          }}
        />
      )}

      {/* Sidebar Container */}
      <aside
        style={{
          width: '280px',
          height: '100vh',
          backgroundColor: '#ffffff',
          borderRight: '1px solid #e2e8f0',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: 50,
          transition: 'transform 0.25s ease-in-out',
          transform: mobileOpen ? 'translateX(0)' : 'translateX(0)', // Controlled on desktop, drawer on mobile
          boxShadow: '4px 0 24px -2px rgba(0,0,0,0.03)'
        }}
        className={`sidebar-nav ${mobileOpen ? 'mobile-visible' : ''}`}
      >
        {/* Top: Brand & Logo */}
        <div>
          <div style={{
            padding: '1.5rem 1.25rem',
            borderBottom: '1px solid #f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <NavLink
              to="/"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                textDecoration: 'none',
                color: 'inherit'
              }}
              onClick={() => setMobileOpen(false)}
            >
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #7c3aed, #4c1d95)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                boxShadow: '0 4px 10px rgba(124, 58, 237, 0.3)'
              }}>
                <ShieldCheck size={22} />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '1rem', color: '#0f172a', lineHeight: 1.2 }}>
                  Campus <span style={{ color: '#7c3aed' }}>Lost &amp; Found</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
                  {BRANDING.university}
                </div>
              </div>
            </NavLink>

            {/* Mobile Close Button */}
            <button
              onClick={() => setMobileOpen(false)}
              className="mobile-close-btn"
              style={{
                background: 'transparent',
                border: 'none',
                color: '#64748b',
                cursor: 'pointer',
                padding: '0.25rem',
                display: 'none' // Enabled via media query in SCSS
              }}
            >
              <X size={20} />
            </button>
          </div>

          {/* User Persona Tag */}
          {isAuthenticated && (
            <div style={{
              margin: '1rem 1.25rem 0.5rem',
              padding: '0.75rem 1rem',
              borderRadius: '12px',
              backgroundColor: user?.role === 'admin' ? '#eff6ff' : user?.role === 'security' ? '#ecfdf5' : '#f5f3ff',
              border: `1px solid ${user?.role === 'admin' ? '#bfdbfe' : user?.role === 'security' ? '#a7f3d0' : '#ddd6fe'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 700, color: user?.role === 'admin' ? '#1d4ed8' : user?.role === 'security' ? '#047857' : '#6d28d9' }}>
                  {user?.role} Portal
                </div>
                <div style={{ fontSize: '0.825rem', fontWeight: 600, color: '#0f172a', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user?.name}
                </div>
              </div>

              {/* In-app Notification Bell */}
              <NotificationBell />
            </div>
          )}

          {/* Navigation Links */}
          <nav style={{ padding: '0.75rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', padding: '0.5rem 0.75rem 0.25rem', letterSpacing: '0.05em' }}>
              Navigation Menu
            </div>

            {links.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.to;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '10px',
                    textDecoration: 'none',
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    color: isActive ? '#7c3aed' : '#475569',
                    backgroundColor: isActive ? '#f5f3ff' : 'transparent',
                    borderLeft: isActive ? '3px solid #7c3aed' : '3px solid transparent',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Icon size={18} color={isActive ? '#7c3aed' : '#64748b'} />
                    <span>{link.label}</span>
                  </div>

                  {link.badge && (
                    <span style={{
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      padding: '0.1rem 0.45rem',
                      borderRadius: '6px',
                      backgroundColor: link.badge === 'Lost' ? '#ede9fe' : '#ecfdf5',
                      color: link.badge === 'Lost' ? '#6d28d9' : '#047857'
                    }}>
                      {link.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}

            {/* Public Discovery Link */}
            <NavLink
              to="/"
              onClick={() => setMobileOpen(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.65rem 0.85rem',
                borderRadius: '10px',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '0.875rem',
                color: location.pathname === '/' ? '#7c3aed' : '#475569',
                backgroundColor: location.pathname === '/' ? '#f5f3ff' : 'transparent',
                borderLeft: location.pathname === '/' ? '3px solid #7c3aed' : '3px solid transparent'
              }}
            >
              <Compass size={18} color={location.pathname === '/' ? '#7c3aed' : '#64748b'} />
              <span>Public Portal Home</span>
            </NavLink>
          </nav>
        </div>

        {/* Bottom Profile & Sign-Out Section */}
        <div style={{
          padding: '1.25rem',
          borderTop: '1px solid #f1f5f9',
          backgroundColor: '#fafafa'
        }}>
          {isAuthenticated ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <img
                  src={user?.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.name || 'User')}`}
                  alt=""
                  style={{ width: '38px', height: '38px', borderRadius: '50%', backgroundColor: '#ede9fe', border: '1px solid #cbd5e1' }}
                />
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                    {user?.name}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                    {user?.email}
                  </div>
                </div>
              </div>

              <button
                onClick={handleLogout}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  width: '100%',
                  padding: '0.55rem',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  backgroundColor: '#ffffff',
                  color: '#dc2626',
                  fontWeight: 600,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  transition: 'background-color 0.15s ease'
                }}
              >
                <LogOut size={14} /> End University Session
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <NavLink
                to="/login"
                onClick={() => setMobileOpen(false)}
                className="btn-primary"
                style={{ textDecoration: 'none', textAlign: 'center', fontSize: '0.85rem', padding: '0.6rem' }}
              >
                Sign In With Google
              </NavLink>
              <NavLink
                to="/register"
                onClick={() => setMobileOpen(false)}
                className="btn-secondary"
                style={{ textDecoration: 'none', textAlign: 'center', fontSize: '0.85rem', padding: '0.6rem' }}
              >
                New Student Register
              </NavLink>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
