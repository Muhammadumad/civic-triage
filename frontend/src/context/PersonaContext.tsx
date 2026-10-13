'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, DEMO_USERS } from '@/lib/types';

interface PersonaContextType {
  role: 'resident' | 'admin';
  currentUser: User;
  setRole: (role: 'resident' | 'admin') => void;
  toggleRole: () => void;
}

const PersonaContext = createContext<PersonaContextType | undefined>(undefined);

export function PersonaProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleState] = useState<'resident' | 'admin'>('resident');

  useEffect(() => {
    const saved = localStorage.getItem('civicpulse_persona');
    if (saved === 'resident' || saved === 'admin') {
      setRoleState(saved);
    }
  }, []);

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

  const currentUser = DEMO_USERS[role];

  return (
    <PersonaContext.Provider value={{ role, currentUser, setRole, toggleRole }}>
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
