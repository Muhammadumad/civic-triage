'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, DEMO_USERS } from '@/lib/types';
import { loginUser, registerUser, logoutUser, fetchCurrentUser } from '@/lib/api';

interface PersonaContextType {
  role: 'resident' | 'admin';
  currentUser: User;
  isAuthenticated: boolean;
  token: string | null;
  setRole: (role: 'resident' | 'admin') => void;
  toggleRole: () => void;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string) => Promise<User>;
  logout: () => void;
}

const PersonaContext = createContext<PersonaContextType | undefined>(undefined);

export function PersonaProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleState] = useState<'resident' | 'admin'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('civicpulse_persona');
      if (saved === 'resident' || saved === 'admin') {
        return saved;
      }
    }
    return 'resident';
  });

  const [token, setToken] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('civicpulse_token');
    }
    return null;
  });

  const [authProfile, setAuthProfile] = useState<User | null>(() => {
    if (typeof window !== 'undefined') {
      const rawUser = localStorage.getItem('civicpulse_user');
      if (rawUser) {
        try {
          return JSON.parse(rawUser);
        } catch {
          return null;
        }
      }
    }
    return null;
  });

  useEffect(() => {
    // Validate session in background if token exists
    if (token) {
      if (token.startsWith('demo_token_')) {
        const raw = typeof window !== 'undefined' ? localStorage.getItem('civicpulse_user') : null;
        if (raw) {
          try {
            const u = JSON.parse(raw);
            setAuthProfile(u);
            setRoleState(u.role);
            return;
          } catch {}
        }
      }

      fetchCurrentUser().then((user) => {
        if (user) {
          setAuthProfile(user);
          setRoleState(user.role);
        } else {
          // If token was rejected and no local fallback exists, clear session
          const storedUser = typeof window !== 'undefined' ? localStorage.getItem('civicpulse_user') : null;
          if (!storedUser) {
            setToken(null);
            setAuthProfile(null);
            logoutUser();
          }
        }
      });
    }
  }, [token]);

  const setRole = (newRole: 'resident' | 'admin') => {
    setRoleState(newRole);
    if (typeof window !== 'undefined') {
      localStorage.setItem('civicpulse_persona', newRole);
    }
  };

  const toggleRole = () => {
    const next = role === 'resident' ? 'admin' : 'resident';
    setRole(next);
  };

  const login = async (email: string, password: string): Promise<User> => {
    const result = await loginUser(email, password);
    setToken(result.token);
    setAuthProfile(result.user);
    setRole(result.user.role);
    return result.user;
  };

  const register = async (name: string, email: string, password: string): Promise<User> => {
    const result = await registerUser(name, email, password);
    setToken(result.token);
    setAuthProfile(result.user);
    setRole(result.user.role);
    return result.user;
  };

  const logout = () => {
    logoutUser();
    setToken(null);
    setAuthProfile(null);
    setRoleState('resident');
    if (typeof window !== 'undefined') {
      localStorage.removeItem('civicpulse_persona');
      localStorage.removeItem('civicpulse_token');
      localStorage.removeItem('civicpulse_user');
    }
  };

  const isAuthenticated = Boolean(token && authProfile);
  const effectiveRole: 'resident' | 'admin' = isAuthenticated && authProfile ? (authProfile.role === 'admin' ? 'admin' : 'resident') : 'resident';
  
  const currentUser: User = authProfile || {
    id: 'guest',
    name: 'Guest Resident',
    email: '',
    role: 'resident',
  };

  return (
    <PersonaContext.Provider
      value={{
        role: effectiveRole,
        currentUser,
        isAuthenticated,
        token,
        setRole,
        toggleRole,
        login,
        register,
        logout,
      }}
    >
      {children}
    </PersonaContext.Provider>
  );
}

export function usePersona() {
  const context = useContext(PersonaContext);
  if (!context) {
    throw new Error('usePersona must be used within a PersonaProvider');
  }
  return context;
}
