import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

const DEMO_USERS = {
  'admin@c4gt.com': {
    email: 'admin@c4gt.com',
    password: 'admin123',
    role: 'admin',
    name: 'Admin User',
    redirect: '/admin-dashboard',
  },
  'coordinator@c4gt.com': {
    email: 'coordinator@c4gt.com',
    password: 'coordinator123',
    role: 'coordinator',
    name: 'Coordinator User',
    redirect: '/coordinator-dashboard',
  },
  'student@c4gt.com': {
    email: 'student@c4gt.com',
    password: 'student123',
    role: 'student',
    name: 'Student User',
    redirect: '/student-dashboard',
  },
  'permission@c4gt.com': {
    email: 'permission@c4gt.com',
    password: 'permission123',
    role: 'permission',
    name: 'Permission User',
    redirect: '/permission-dashboard',
  },
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const u = localStorage.getItem('c4gt_user');
      return u ? JSON.parse(u) : null;
    } catch { return null; }
  });
  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const demoUser = DEMO_USERS[email?.trim().toLowerCase()];
      if (demoUser && demoUser.password === password) {
        const userData = {
          email: demoUser.email,
          name: demoUser.name,
          role: demoUser.role,
        };
        localStorage.setItem('c4gt_token', 'demo-token');
        localStorage.setItem('c4gt_user', JSON.stringify(userData));
        setUser(userData);
        return { ok: true, redirect: demoUser.redirect, user: userData };
      }

      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('c4gt_token', data.token);
      localStorage.setItem('c4gt_user', JSON.stringify(data.user));
      setUser(data.user);
      return { ok: true, redirect: '/admin-dashboard', user: data.user };
    } catch (err) {
      return { ok: false, message: err.response?.data?.message || 'Login failed' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('c4gt_token');
    localStorage.removeItem('c4gt_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
