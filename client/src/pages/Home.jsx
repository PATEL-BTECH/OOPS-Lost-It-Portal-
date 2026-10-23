import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  Server, 
  Database, 
  Cpu, 
  Activity, 
  RefreshCw, 
  CheckCircle2, 
  Users, 
  GraduationCap, 
  Bug,
  Compass,
  Search,
  PlusCircle,
  Package,
  FileCheck,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Lock,
  Layers,
  HelpCircle,
  Clock
} from 'lucide-react';
import { checkHealth } from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import AnnouncementBanner from '../components/AnnouncementBanner';
import BRANDING from '../config/branding';

const Home = () => {
  const { user, isAdmin, isAuthenticated } = useAuth();
  const [healthData, setHealthData] = useState(null);
  const [loadingHealth, setLoadingHealth] = useState(true);
  const [healthError, setHealthError] = useState(null);
  const [lastChecked, setLastChecked] = useState(null);
  const [simulateError, setSimulateError] = useState(false);

  // Fetch safe health metrics from backend
  const fetchHealth = useCallback(async () => {
    setLoadingHealth(true);
    setHealthError(null);
    try {
      const data = await checkHealth();
      setHealthData(data);
      setLastChecked(new Date().toLocaleTimeString());
    } catch (err) {
      console.error('Failed to connect to backend:', err);
      setHealthError(err.message || 'Unable to establish connection with Express backend.');
    } finally {
      setLoadingHealth(false);
    }
  }, []);

  useEffect(() => {
    fetchHealth();
  }, [fetchHealth]);

  // AWT Syllabus ErrorBoundary Demonstrator
  if (simulateError) {
    throw new Error('AWT Evaluation Test: Intentional error thrown to demonstrate class-based React ErrorBoundary.');
  }

  const steps = [
    {
      num: '01',
      title: 'Report Your Belonging',
      desc: 'Lost something? File a lost report with category, location, and date. Found an item? Deposit it at the Security Custody Post and record a confidential verification clue.',
      icon: PlusCircle,
      color: '#7c3aed'
    },
    {
      num: '02',
      title: 'Automated Smart Matching',
      desc: 'Our 6-factor similarity engine computes scores (Category 35%, Name 25%, Brand 15%, Color 10%, Location 10%, Date 5%) to instantly notify potential owners.',
      icon: Sparkles,
      color: '#0284c7'
    },
    {
      num: '03',
      title: 'Claim & Evidence Review',
      desc: 'Students submit ownership proof (e.g. unique scratches, serial numbers). Portal Administrators review evidence against the finder\'s private clue.',
      icon: FileCheck,
      color: '#f59e0b'
    },
    {
      num: '04',
      title: 'Custody Handover & Receipt',
      desc: 'Upon approval, visit the Campus Security Desk with your Student ID card. Security staff verify credentials and issue a digital tamper-evident receipt.',
      icon: ShieldCheck,
      color: '#059669'
    }
  ];

  return (
    <div className="home-page" style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      <AnnouncementBanner />

      {/* Hero Presentation Card */}
      <section className="hero-card" style={{
        background: 'linear-gradient(135deg, #4c1d95 0%, #6d28d9 45%, #7c3aed 100%)',
        borderRadius: '24px',
        padding: '3.5rem 3rem',
        color: '#ffffff',
        boxShadow: '0 20px 25px -5px rgba(109, 40, 217, 0.25)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ maxWidth: '780px' }}>
          <div className="hero-tag" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            backgroundColor: 'rgba(255, 255, 255, 0.18)',
            padding: '0.4rem 0.9rem',
            borderRadius: '9999px',
            fontSize: '0.825rem',
            fontWeight: 600,
            marginBottom: '1.25rem',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <GraduationCap size={16} /> {BRANDING.university} • {BRANDING.academicProgram}
          </div>

          <h1 style={{ fontSize: '2.6rem', fontWeight: 800, lineHeight: 1.15, margin: '0 0 1rem', color: '#ffffff' }}>
            Campus <span style={{ color: '#fbbf24' }}>Lost &amp; Found</span> Portal
          </h1>

          <p style={{ fontSize: '1.1rem', color: '#e9d5ff', lineHeight: 1.6, margin: '0 0 2rem' }}>
            The official centralized university platform engineered with <strong>React (Vite)</strong>, 
            <strong> Express.js</strong>, and <strong>MongoDB GridFS</strong> to streamline reporting, rule-based 
            matching, and verified physical recovery of campus belongings.
          </p>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to="/report-lost" className="btn-primary" style={{
              backgroundColor: '#fbbf24',
              color: '#4c1d95',
              borderColor: '#fbbf24',
              fontWeight: 700,
              padding: '0.75rem 1.5rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              textDecoration: 'none',
              borderRadius: '10px'
            }}>
              <PlusCircle size={18} /> Report Lost Item
            </Link>

            <Link to="/report-found" className="btn-secondary" style={{
              backgroundColor: 'rgba(255,255,255,0.15)',
              color: '#ffffff',
              borderColor: 'rgba(255,255,255,0.3)',
              fontWeight: 700,
              padding: '0.75rem 1.5rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              textDecoration: 'none',
              borderRadius: '10px'
            }}>
              <Package size={18} /> Report Found Item
            </Link>

            <Link to="/items" className="btn-secondary" style={{
              backgroundColor: 'rgba(255,255,255,0.1)',
              color: '#ffffff',
              borderColor: 'rgba(255,255,255,0.2)',
              fontWeight: 600,
              padding: '0.75rem 1.25rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              textDecoration: 'none',
              borderRadius: '10px'
            }}>
              <Search size={18} /> Browse Public Catalog
            </Link>
          </div>
        </div>
      </section>

      {/* Section: 4-Step Recovery Process */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', color: '#0f172a', fontWeight: 800, margin: '0 0 0.35rem' }}>
            How Property Recovery Works
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.95rem', margin: 0 }}>
            Step-by-step verified workflow designed to prevent fraudulent claims and ensure secure custody handovers.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
          {steps.map((st) => {
            const Icon = st.icon;
            return (
              <div
                key={st.num}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '16px',
                  padding: '1.75rem',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                  position: 'relative'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    backgroundColor: `${st.color}15`,
                    color: st.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Icon size={22} />
                  </div>
                  <span style={{ fontSize: '1.3rem', fontWeight: 800, color: '#e2e8f0' }}>{st.num}</span>
                </div>

                <h3 style={{ fontSize: '1.15rem', color: '#0f172a', margin: '0.25rem 0 0', fontWeight: 700 }}>
                  {st.title}
                </h3>

                <p style={{ color: '#64748b', fontSize: '0.875rem', lineHeight: 1.5, margin: 0 }}>
                  {st.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Section: Safe System Status & Backend Operational Health */}
      <section style={{
        backgroundColor: '#ffffff',
        borderRadius: '20px',
        border: '1px solid #e2e8f0',
        padding: '2rem',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.5rem',
          paddingBottom: '1rem',
          borderBottom: '1px solid #f1f5f9'
        }}>
          <div>
            <h2 style={{ fontSize: '1.3rem', color: '#0f172a', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Activity size={22} color="#7c3aed" /> System Operational Status
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '0.2rem 0 0' }}>
              Real-time service health, database state, and environment diagnostics.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={fetchHealth}
              disabled={loadingHealth}
              className="btn-secondary"
              style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem' }}
            >
              <RefreshCw size={14} className={loadingHealth ? 'spin-icon' : ''} />
              {loadingHealth ? 'Pinging...' : 'Refresh Health'}
            </button>

            <button
              onClick={() => setSimulateError(true)}
              className="btn-danger-outline"
              style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem' }}
              title="Test React ErrorBoundary lifecycle"
            >
              <Bug size={14} /> Test ErrorBoundary
            </button>
          </div>
        </div>

        {healthError && (
          <div style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#991b1b',
            padding: '1rem',
            borderRadius: '10px',
            marginBottom: '1.5rem',
            fontSize: '0.875rem'
          }}>
            <strong>Connection Notice:</strong> {healthError}
          </div>
        )}

        {/* Operational Indicators */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1rem' }}>
          <div style={{ padding: '1.25rem', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.785rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Express API</span>
              <Server size={18} color="#7c3aed" />
            </div>
            <div style={{ marginBottom: '0.25rem' }}>
              {healthData ? (
                <StatusBadge status="operational" label="ACTIVE (PORT 5000)" pulse={true} />
              ) : (
                <StatusBadge status="connecting" label="PINGING..." />
              )}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
              {lastChecked ? `Verified at ${lastChecked}` : 'Checking...'}
            </div>
          </div>

          <div style={{ padding: '1.25rem', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.785rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Database Engine</span>
              <Database size={18} color="#059669" />
            </div>
            <div style={{ marginBottom: '0.25rem' }}>
              {healthData?.database?.connected ? (
                <StatusBadge status="connected" label="MONGODB CONNECTED" />
              ) : (
                <StatusBadge status="warning" label="OFFLINE" />
              )}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
              Database: <code>{healthData?.database?.name || 'campus_lost_found'}</code>
            </div>
          </div>

          <div style={{ padding: '1.25rem', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.785rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Node Runtime</span>
              <Cpu size={18} color="#0284c7" />
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>
              {healthData?.system?.nodeVersion || 'Node.js v24'}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
              Platform: {healthData?.system?.platform || 'win32'} • Uptime: {healthData?.uptimeSeconds ? `${healthData.uptimeSeconds}s` : 'active'}
            </div>
          </div>

          <div style={{ padding: '1.25rem', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.785rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Domain Policy</span>
              <GraduationCap size={18} color="#f59e0b" />
            </div>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>
              {BRANDING.domain}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
              Strictly restricted to university identities
            </div>
          </div>
        </div>

        {/* Safe Administrator Diagnostic Link */}
        {isAdmin && (
          <div style={{
            marginTop: '1.25rem',
            padding: '0.75rem 1rem',
            backgroundColor: '#ede9fe',
            borderRadius: '8px',
            fontSize: '0.8rem',
            color: '#5b21b6',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span>🔒 Administrator Mode: Comprehensive metrics, audit trails, and user management available in Console.</span>
            <Link to="/admin" style={{ color: '#6d28d9', fontWeight: 700, textDecoration: 'none' }}>
              Open Admin Console →
            </Link>
          </div>
        )}
      </section>

      {/* Team Ownership Matrix (Academic Requirement) */}
      <section style={{
        backgroundColor: '#ffffff',
        borderRadius: '20px',
        border: '1px solid #e2e8f0',
        padding: '2rem'
      }}>
        <h2 style={{ fontSize: '1.3rem', color: '#0f172a', fontWeight: 800, margin: '0 0 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Users size={22} color="#7c3aed" /> Module Ownership Matrix
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
          {[
            {
              name: 'Nand Patel',
              role: 'Lead Full-Stack / System Architect',
              modules: 'Google OAuth 2.0 / GIS, RBAC, Admin Console, Recharts Visualizations, System Integration'
            },
            {
              name: 'Priyanshi',
              role: 'Lost Items & Discovery Lead',
              modules: 'Lost-Item Reporting, Search & Category Filters, Item Detail Views, Location Querying'
            },
            {
              name: 'Krisha',
              role: 'Found Items & Smart Matching Lead',
              modules: 'Found-Item Reporting, 6-Factor Rule-Based Smart Matching Engine, Notifications System, Nodemailer'
            },
            {
              name: 'Neerja',
              role: 'Claims & Security Operations Lead',
              modules: 'Claim Submission & Ownership Verification, Security Storage Lockers (A-01 to D-04), Digital Handover Receipts'
            }
          ].map((m) => (
            <div key={m.name} style={{
              padding: '1.25rem',
              backgroundColor: '#f8fafc',
              borderRadius: '12px',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#0f172a' }}>{m.name}</div>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#7c3aed', margin: '0.15rem 0 0.5rem' }}>{m.role}</div>
              <div style={{ fontSize: '0.825rem', color: '#64748b', lineHeight: 1.4 }}>{m.modules}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
