import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Check if session exists on load
  const loadUser = useCallback(async () => {
    setLoading(true);
    setAuthError(null);
    try {
      const response = await api.get('/auth/me');
      if (response.success && response.user) {
        setUser(response.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      // 401 simply means not logged in
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  // Sign in with Google ID token credential
  const loginWithGoogle = async (credential) => {
    setLoading(true);
    setAuthError(null);
    try {
      const response = await api.post('/auth/google', { credential });
      if (response.success && response.user) {
        setUser(response.user);
        return { success: true, user: response.user };
      }
      throw new Error(response.message || 'Google authentication failed.');
    } catch (err) {
      const message = err.message || 'Authentication error. Please try again.';
      setAuthError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  // Developer mode quick-login for evaluation & lab testing
  const loginDevUser = async ({ role = 'student', name, email }) => {
    setLoading(true);
    setAuthError(null);
    try {
      const response = await api.post('/auth/dev-login', { role, name, email });
      if (response.success && response.user) {
        setUser(response.user);
        return { success: true, user: response.user };
      }
      throw new Error(response.message || 'Dev login failed.');
    } catch (err) {
      const message = err.message || 'Dev login error.';
      setAuthError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = async () => {
    setLoading(true);
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.warn('Logout network error:', err);
    } finally {
      setUser(null);
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    authError,
    isAuthenticated: !!user,
    isStudent: user?.role === 'student',
    isAdmin: user?.role === 'admin',
    isSecurity: user?.role === 'security',
    loginWithGoogle,
    loginDevUser,
    logout,
    refreshUser: loadUser,
    clearError: () => setAuthError(null)
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
