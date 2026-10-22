import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('leadpilot_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('leadpilot_token') || null;
  });

  const [loading, setLoading] = useState(true);

  // Verify session on mount if token exists
  useEffect(() => {
    const checkAuth = async () => {
      const savedToken = localStorage.getItem('leadpilot_token');
      if (savedToken) {
        try {
          const res = await api.getMe();
          if (res?.user) {
            setCurrentUser(res.user);
            localStorage.setItem('leadpilot_user', JSON.stringify(res.user));
          }
        } catch (err) {
          console.warn('Session verification failed, logging out:', err.message);
          // Only clear if server explicitly rejected
          if (err.message.includes('expired') || err.message.includes('authenticate')) {
            logout();
          }
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    const res = await api.login({ email, password });
    if (res?.user && res?.token) {
      setCurrentUser(res.user);
      setToken(res.token);
      localStorage.setItem('leadpilot_token', res.token);
      localStorage.setItem('leadpilot_user', JSON.stringify(res.user));
      return res.user;
    }
    throw new Error('Invalid response from login server');
  };

  const register = async ({ displayName, email, password, companyName }) => {
    const res = await api.register({ displayName, email, password, companyName });
    if (res?.user && res?.token) {
      setCurrentUser(res.user);
      setToken(res.token);
      localStorage.setItem('leadpilot_token', res.token);
      localStorage.setItem('leadpilot_user', JSON.stringify(res.user));
      return res.user;
    }
    throw new Error('Invalid response from registration server');
  };

  const logout = () => {
    setCurrentUser(null);
    setToken(null);
    localStorage.removeItem('leadpilot_token');
    localStorage.removeItem('leadpilot_user');
  };

  const isAuthenticated = Boolean(currentUser && token);

  return (
    <AuthContext.Provider value={{
      currentUser,
      token,
      loading,
      isAuthenticated,
      login,
      register,
      logout,
      isAdmin: true,
      isSales: true,
      isAnalyst: false,
      canSendEmail: true,
      canExport: true,
      canEditSettings: true
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
