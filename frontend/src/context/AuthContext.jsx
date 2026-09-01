import React, { createContext, useContext, useState } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

const DEMO_USERS = {
  'admin@c4gt.com': {
    email: 'admin@c4gt.com',
    password: 'Admin@123',
    role: 'admin',
    name: 'System Administrator',
    redirect: '/admin-dashboard',
  },
  'meenachittuluri@gmail.com': {
    email: 'meenachittuluri@gmail.com',
    password: '23JN1A45C0',
    role: 'coordinator',
    name: 'Chittuluri Meena',
    redirect: '/coordinator-dashboard',
  },
  'bhavanisanakrdavuluri1094@gmail.com': {
    email: 'bhavanisanakrdavuluri1094@gmail.com',
    password: '23B21A4268',
    role: 'student',
    name: 'Bhavani Sankar Davuluri',
    redirect: '/student-dashboard',
  },
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const u = localStorage.getItem('c4gt_user');
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  });

  const [adminSearch, setAdminSearchState] = useState(() => {
    try {
      return localStorage.getItem('c4gt_admin_search') || '';
    } catch {
      return '';
    }
  });

  const [loading, setLoading] = useState(false);

  const setAdminSearch = (value) => {
    const nextValue =
      typeof value === 'function' ? value(adminSearch) : value;

    setAdminSearchState(nextValue);

    try {
      localStorage.setItem('c4gt_admin_search', nextValue || '');
    } catch {}
  };

  const login = async (email, password) => {
    setLoading(true);

    try {
      const normalizedEmail = email?.trim().toLowerCase();

      // Real backend login
      const { data } = await api.post('/auth/login', {
        email: normalizedEmail,
        password,
      });

      localStorage.setItem('c4gt_token', data.token);
      localStorage.setItem('c4gt_user', JSON.stringify(data.user));

      setUser(data.user);

      const redirectByRole = {
        admin: '/admin-dashboard',
        coordinator: '/coordinator-dashboard',
        student: '/student-dashboard',
      };

      return {
        ok: true,
        redirect:
          redirectByRole[data.user.role] || '/dashboard',
        user: data.user,
      };
    } catch (err) {
      // Demo fallback
      const demoUser = DEMO_USERS[normalizedEmail];

      if (demoUser && demoUser.password === password) {
        const userData = {
          email: demoUser.email,
          name: demoUser.name,
          role: demoUser.role,
        };

        localStorage.setItem('c4gt_token', 'demo-token');
        localStorage.setItem(
          'c4gt_user',
          JSON.stringify(userData)
        );

        setUser(userData);

        return {
          ok: true,
          redirect: demoUser.redirect,
          user: userData,
        };
      }

      return {
        ok: false,
        message:
          err.response?.data?.message || 'Login failed',
      };
    } finally {
      setLoading(false);
    }
  };

  // Logout and move to landing page
  const logout = () => {
    localStorage.removeItem('c4gt_token');
    localStorage.removeItem('c4gt_user');

    setUser(null);

    window.location.href = '/';
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        adminSearch,
        setAdminSearch,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}