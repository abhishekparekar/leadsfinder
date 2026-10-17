import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [users, setUsers] = useState([
    { uid: 'user_admin_01', displayName: 'Aditya Shinde (Founder)', email: 'aditya@icoded.in', role: 'Admin' },
    { uid: 'user_sales_01', displayName: 'Pooja Deshmukh (Sales Lead)', email: 'pooja@icoded.in', role: 'Sales' },
    { uid: 'user_sales_02', displayName: 'Rohan Patil (SDR)', email: 'rohan@icoded.in', role: 'Sales' },
    { uid: 'user_analyst_01', displayName: 'Sneha More (Market Analyst)', email: 'sneha@icoded.in', role: 'Analyst' }
  ]);
  const [currentUser, setCurrentUser] = useState(users[0]);

  useEffect(() => {
    api.getUsers().then(data => {
      if (Array.isArray(data) && data.length > 0) {
        setUsers(data);
        setCurrentUser(data[0]);
      }
    }).catch(console.error);
  }, []);

  const switchUser = (uid) => {
    const found = users.find(u => u.uid === uid);
    if (found) setCurrentUser(found);
  };

  const isAdmin = currentUser?.role === 'Admin';
  const isSales = currentUser?.role === 'Sales' || isAdmin;
  const isAnalyst = currentUser?.role === 'Analyst';
  const canSendEmail = isAdmin || currentUser?.role === 'Sales';
  const canExport = isAdmin || currentUser?.role === 'Sales';
  const canEditSettings = isAdmin;

  return (
    <AuthContext.Provider value={{
      currentUser,
      users,
      switchUser,
      isAdmin,
      isSales,
      isAnalyst,
      canSendEmail,
      canExport,
      canEditSettings
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
