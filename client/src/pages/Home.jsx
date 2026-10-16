import React, { useState, useEffect, useCallback } from 'react';
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
  Compass
} from 'lucide-react';
import { checkHealth } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import AnnouncementBanner from '../components/AnnouncementBanner';

const Home = () => {
  // Controlled component state (AWT syllabus: React hooks)
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastChecked, setLastChecked] = useState(null);
  const [simulateError, setSimulateError] = useState(false);

  // Fetch health data from backend API
  const fetchHealth = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await checkHealth();
      setHealthData(data);
      setLastChecked(new Date().toLocaleTimeString());
    } catch (err) {
      console.error('Failed to connect to backend:', err);
      setError(err.message || 'Unable to establish connection with Express backend.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHealth();
  }, [fetchHealth]);

  // Intentional trigger to demonstrate ErrorBoundary in AWT lab
  if (simulateError) {
    throw new Error('AWT Evaluation Test: Intentional error thrown to demonstrate class-based React ErrorBoundary.');
  }

  const teamMembers = [
    {
      name: 'Nand Patel',
      role: 'Lead Full-Stack / Auth & Admin',
      modules: 'Google OAuth 2.0, Admin Moderation, User Management, Analytics with Recharts, Central Integration'
    },
    {
      name: 'Priyanshi',
      role: 'Lost Items & Discovery',
      modules: 'Lost-Item Reporting, Search & Category Filters, Item Detail Views, Location Querying'
    },
    {
      name: 'Krisha',
      role: 'Found Items & Smart Matching',
      modules: 'Found-Item Reporting, Rule-Based Smart Matching Engine, Notifications System, Nodemailer'
    },
    {
      name: 'Neerja',
      role: 'Claims & Security Operations',
      modules: 'Claim Submission & Ownership Verification, Security Staff Storage Desk, Handover Receipts'
    }
  ];

  const awtConcepts = [
    'React Components & JSX',
    'Props & Event Handling',
    'React Hooks (useState, useEffect, useCallback)',
    'React.memo Optimization (StatusBadge)',
    'Class-based ErrorBoundary Lifecycle',
    'Sass/SCSS Modular Theming',
    'Express.js Modular Routing',
    'Middleware Pipeline & Central Error Handler',
    'Mongoose ODM & Connection Management',
    'CORS & Cookie Security Architecture'
  ];

  return (
    <div className="home-page">
      <AnnouncementBanner />

      {/* Hero Presentation Card */}
      <section className="hero-card">
        <div className="hero-tag">
          <GraduationCap size={16} /> Software Engineering & Advanced Web Technology Project
        </div>
        <h1>
          Campus <span className="highlight">Lost &amp; Found</span> Portal
        </h1>
        <p>
          A centralized, role-based university portal engineered with <strong>React (Vite)</strong>, 
          <strong> Express.js</strong>, <strong>Mongoose</strong>, and <strong>MongoDB GridFS</strong> 
          to streamline reporting, matching, and recovering campus belongings.
        </p>

        <div className="hero-controls">
          <button 
            className="btn-primary" 
            onClick={fetchHealth} 
            disabled={loading}
            id="btn-refresh-health"
          >
            <RefreshCw size={16} className={loading ? 'spin-icon' : ''} />
            {loading ? 'Pinging Server...' : 'Ping Backend API'}
          </button>

          <button 
            className="btn-secondary"
            onClick={() => window.open('http://localhost:5000/api/health', '_blank')}
          >
            <Server size={16} /> Open Raw Endpoint
          </button>

          <button 
            className="btn-danger-outline"
            onClick={() => setSimulateError(true)}
            title="Click to trigger intentional error caught by ErrorBoundary"
          >
            <Bug size={16} /> Test ErrorBoundary
          </button>
        </div>
      </section>

      {/* Metrics & Diagnostics Grid */}
      <section className="grid-cards">
        {/* Express Server Status */}
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">Express API Status</span>
            <div className="metric-icon-wrap">
              <Server size={20} />
            </div>
          </div>
          <div className="metric-value">
            {error ? (
              <StatusBadge status="error" label="OFFLINE" />
            ) : healthData ? (
              <StatusBadge status="operational" label="OPERATIONAL" pulse={true} />
            ) : (
              <StatusBadge status="connecting" label="CHECKING..." />
            )}
          </div>
          <div className="metric-detail">
            Port 5000 • {lastChecked ? `Checked at ${lastChecked}` : 'Connecting...'}
          </div>
        </div>

        {/* MongoDB Database Status */}
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">MongoDB Connection</span>
            <div className="metric-icon-wrap">
              <Database size={20} />
            </div>
          </div>
          <div className="metric-value">
            {healthData?.database?.connected ? (
              <StatusBadge status="connected" label="CONNECTED" />
            ) : (
              <StatusBadge status="warning" label={healthData?.database?.status || 'DISCONNECTED'} />
            )}
          </div>
          <div className="metric-detail">
            Host: {healthData?.database?.host || 'Pending configuration'} • DB: {healthData?.database?.name || 'campus_lost_found'}
          </div>
        </div>

        {/* Server Runtime & Node */}
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">Backend Runtime</span>
            <div className="metric-icon-wrap">
              <Cpu size={20} />
            </div>
          </div>
          <div className="metric-value">
            {healthData?.system?.nodeVersion || 'Node.js'}
          </div>
          <div className="metric-detail">
            Platform: {healthData?.system?.platform || 'win32'} • Uptime: {healthData?.uptimeSeconds ? `${healthData.uptimeSeconds}s` : '0s'}
          </div>
        </div>

        {/* Phase Progress */}
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">Active Milestone</span>
            <div className="metric-icon-wrap">
              <Compass size={20} />
            </div>
          </div>
          <div className="metric-value">
            Phase 6 / 7
          </div>
          <div className="metric-detail">
            Dashboards, Recharts &amp; Locker Custody Operational
          </div>
        </div>
      </section>

      {/* Diagnostics Raw Panel */}
      <section className="diagnostics-panel">
        <div className="panel-header">
          <h2>
            <Activity size={20} color="#7c3aed" /> 
            Live Health Diagnostics Response
          </h2>
          <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
            Endpoint: <code>GET /api/health</code>
          </span>
        </div>

        {loading && !healthData && (
          <p style={{ color: '#64748b', padding: '1rem' }}>Connecting to server...</p>
        )}

        {error && (
          <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '1rem', borderRadius: '8px' }}>
            <strong>Connection Notice:</strong> {error}
            <div style={{ fontSize: '0.85rem', marginTop: '0.5rem', color: '#7f1d1d' }}>
              Ensure the Express server is running on port 5000: <code>npm run dev</code> inside <code>server/</code>.
            </div>
          </div>
        )}

        {healthData && (
          <pre className="raw-json">
            {JSON.stringify(healthData, null, 2)}
          </pre>
        )}
      </section>

      {/* Team Ownership Matrix */}
      <section className="team-section">
        <h2 className="section-title">
          <Users size={22} color="#7c3aed" /> Team Responsibilities &amp; Module Ownership
        </h2>
        <div className="team-grid">
          {teamMembers.map((member) => (
            <div key={member.name} className="member-card">
              <div className="member-name">{member.name}</div>
              <div className="member-role">{member.role}</div>
              <div className="member-modules">{member.modules}</div>
            </div>
          ))}
        </div>
      </section>

      {/* AWT Syllabus Topics Demonstrated */}
      <section className="syllabus-card">
        <h3>
          <CheckCircle2 size={20} color="#10b981" style={{ verticalAlign: 'middle', marginRight: '6px' }} />
          AWT &amp; SE Concepts Validated in Phase 1
        </h3>
        <div className="syllabus-tags">
          {awtConcepts.map((concept) => (
            <span key={concept} className="concept-tag">
              ✓ {concept}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
