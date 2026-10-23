import React, { useState } from 'react';
import { Menu, ShieldCheck } from 'lucide-react';
import Sidebar from './Sidebar';
import BRANDING from '../config/branding';

const AppLayout = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="portal-app-layout" style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {/* Sidebar Navigation */}
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* Main Content Area */}
      <div
        className="portal-main-wrapper"
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          marginLeft: '280px', // Offset by sidebar width on desktop
          transition: 'margin-left 0.25s ease'
        }}
      >
        {/* Mobile Top Header (Visible only on mobile screens <= 1024px) */}
        <header
          className="portal-mobile-topbar"
          style={{
            display: 'none', // Overridden by CSS media query
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.875rem 1.25rem',
            backgroundColor: '#ffffff',
            borderBottom: '1px solid #e2e8f0',
            position: 'sticky',
            top: 0,
            zIndex: 30
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: '#7c3aed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff'
            }}>
              <ShieldCheck size={18} />
            </div>
            <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0f172a' }}>
              {BRANDING.shortName}
            </span>
          </div>

          <button
            onClick={() => setMobileOpen(true)}
            style={{
              padding: '0.4rem',
              backgroundColor: '#f1f5f9',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              cursor: 'pointer',
              color: '#334155',
              display: 'flex',
              alignItems: 'center'
            }}
            aria-label="Open Navigation Menu"
          >
            <Menu size={20} />
          </button>
        </header>

        {/* Page Body Viewport */}
        <main style={{ flex: 1, padding: '2rem 2.5rem', maxWidth: '1440px', width: '100%', margin: '0 auto', boxSizing: 'border-box' }} className="portal-page-container">
          {children}
        </main>

        {/* Standardized University Footer */}
        <footer style={{
          padding: '1.25rem 2.5rem',
          backgroundColor: '#ffffff',
          borderTop: '1px solid #e2e8f0',
          fontSize: '0.8rem',
          color: '#64748b',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }} className="portal-footer">
          <div>
            <strong>{BRANDING.appName}</strong> • {BRANDING.university}
          </div>
          <div style={{ color: '#94a3b8' }}>
            {BRANDING.academicProgram} • {BRANDING.team}
          </div>
        </footer>
      </div>
    </div>
  );
};

export default AppLayout;
