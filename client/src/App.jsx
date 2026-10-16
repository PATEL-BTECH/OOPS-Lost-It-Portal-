import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  LogIn, 
  LogOut, 
  Search, 
  PlusCircle, 
  HelpCircle, 
  Package, 
  Layers, 
  LayoutDashboard 
} from 'lucide-react';
import ErrorBoundary from './components/ErrorBoundary';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import Login from './pages/Login';
import StudentDashboard from './pages/StudentDashboard';
import AdminDashboard from './pages/AdminDashboard';
import SecurityDashboard from './pages/SecurityDashboard';
import BrowseItems from './pages/BrowseItems';
import ItemDetail from './pages/ItemDetail';
import ReportLost from './pages/ReportLost';
import ReportFound from './pages/ReportFound';
import SubmitClaim from './pages/SubmitClaim';
import MyClaims from './pages/MyClaims';

import './styles/App.scss';

import NotificationBell from './components/NotificationBell';

// Top Navbar Component consuming AuthContext
const NavigationBar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-brand">
          <div className="brand-icon">
            <ShieldCheck size={24} />
          </div>
          <div>
            <div className="brand-title">
              Campus <span>Lost &amp; Found</span>
            </div>
          </div>
          <span className="brand-badge">GSFC Univ</span>
        </Link>

        <div className="nav-actions">
          {/* Public items feed */}
          <Link to="/items" style={{ color: '#475569', fontWeight: 600, fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Search size={15} /> Browse Items
          </Link>

          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
              <Link to="/report-lost" style={{ color: '#7c3aed', fontWeight: 600, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <HelpCircle size={15} /> Report Lost
              </Link>

              <Link to="/report-found" style={{ color: '#059669', fontWeight: 600, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Package size={15} /> Report Found
              </Link>

              <Link to="/claims/my" style={{ color: '#7c3aed', fontWeight: 600, fontSize: '0.85rem' }}>
                My Claims
              </Link>

              {user?.role === 'admin' && (
                <Link to="/admin" style={{ color: '#4f46e5', fontWeight: 600, fontSize: '0.85rem' }}>
                  Admin Panel
                </Link>
              )}

              {user?.role === 'security' && (
                <Link to="/security" style={{ color: '#059669', fontWeight: 600, fontSize: '0.85rem' }}>
                  Security Desk
                </Link>
              )}

              <Link to="/dashboard" style={{ color: '#7c3aed', fontWeight: 600, fontSize: '0.85rem' }}>
                Dashboard
              </Link>

              {/* Notification Bell */}
              <NotificationBell />

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                backgroundColor: '#ede9fe',
                padding: '0.3rem 0.6rem',
                borderRadius: '9999px'
              }}>
                <img
                  src={user?.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.name || 'U')}`}
                  alt={user?.name}
                  style={{ width: '22px', height: '22px', borderRadius: '50%' }}
                />
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#6d28d9' }}>
                  {user?.name?.split(' ')[0]}
                </span>
              </div>

              <button
                onClick={handleLogout}
                className="btn-secondary"
                style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem' }}
                title="Sign out of university session"
              >
                <LogOut size={13} />
              </button>
            </div>
          ) : (
            <Link to="/login" className="btn-primary" style={{ padding: '0.45rem 1rem', fontSize: '0.85rem' }}>
              <LogIn size={15} /> Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <div className="app-wrapper">
            <NavigationBar />

            <main className="main-content">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/items" element={<BrowseItems />} />
                <Route path="/items/:type/:id" element={<ItemDetail />} />

                {/* Role Protected Actions */}
                <Route
                  path="/report-lost"
                  element={
                    <ProtectedRoute allowedRoles={['student', 'admin', 'security']}>
                      <ReportLost />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/report-found"
                  element={
                    <ProtectedRoute allowedRoles={['student', 'admin', 'security']}>
                      <ReportFound />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/claims/new/:foundItemId"
                  element={
                    <ProtectedRoute allowedRoles={['student', 'admin', 'security']}>
                      <SubmitClaim />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/claims/my"
                  element={
                    <ProtectedRoute allowedRoles={['student', 'admin', 'security']}>
                      <MyClaims />
                    </ProtectedRoute>
                  }
                />

                {/* Role Protected Dashboards */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['student', 'admin', 'security']}>
                      <StudentDashboard />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/security"
                  element={
                    <ProtectedRoute allowedRoles={['security', 'admin']}>
                      <SecurityDashboard />
                    </ProtectedRoute>
                  }
                />

                {/* 404 Route */}
                <Route
                  path="*"
                  element={
                    <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
                      <h2 style={{ fontSize: '1.75rem', color: '#0f172a' }}>404 — Page Not Found</h2>
                      <p style={{ marginTop: '0.5rem', color: '#64748b' }}>
                        The requested university route does not exist.
                      </p>
                      <Link to="/" className="btn-primary" style={{ marginTop: '1.25rem' }}>
                        Back to Portal Home
                      </Link>
                    </div>
                  }
                />
              </Routes>
            </main>

            <footer className="footer">
              <p>
                GSFC University Campus Lost &amp; Found Portal • Built with React, Express, MongoDB &amp; SCSS
              </p>
              <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                Academic Project Team: Nand Patel • Priyanshi • Krisha • Neerja
              </p>
            </footer>
          </div>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
