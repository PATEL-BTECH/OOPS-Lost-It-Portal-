import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './components/AppLayout';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import AccountProfile from './pages/AccountProfile';
import StudentDashboard from './pages/StudentDashboard';
import AdminDashboard from './pages/AdminDashboard';
import SecurityDashboard from './pages/SecurityDashboard';
import BrowseItems from './pages/BrowseItems';
import ItemDetail from './pages/ItemDetail';
import ReportLost from './pages/ReportLost';
import ReportFound from './pages/ReportFound';
import SubmitClaim from './pages/SubmitClaim';
import MyClaims from './pages/MyClaims';

import BRANDING from './config/branding';
import './styles/App.scss';

function App() {
  useEffect(() => {
    document.title = `${BRANDING.appName} • ${BRANDING.university}`;
  }, []);

  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <AppLayout>
            <Routes>
              {/* Public Discovery Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/items" element={<BrowseItems />} />
              <Route path="/items/:type/:id" element={<ItemDetail />} />

              {/* Protected Account Profile & Session Details (Section 6) */}
              <Route
                path="/profile"
                element={
                  <ProtectedRoute allowedRoles={['student', 'admin', 'security']}>
                    <AccountProfile />
                  </ProtectedRoute>
                }
              />

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
                      The requested university portal route does not exist.
                    </p>
                    <Link to="/" className="btn-primary" style={{ marginTop: '1.25rem' }}>
                      Return to Portal Home
                    </Link>
                  </div>
                }
              />
            </Routes>
          </AppLayout>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
