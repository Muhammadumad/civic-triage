'use client';

import React, { useEffect, useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-8 h-8 rounded-lg bg-white/[0.05] border border-white/10 animate-pulse" />
    );
  }

  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      className={`relative inline-flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-300 border ${
        isDark
          ? 'bg-[var(--surface-elevated)] border-[var(--border-subtle)] text-amber-400 hover:text-amber-300 hover:border-amber-400/40 hover:shadow-[0_0_12px_rgba(251,191,36,0.25)]'
          : 'bg-[var(--surface-elevated)] border-[var(--border-subtle)] text-slate-700 hover:text-slate-900 hover:border-emerald-500/40 hover:shadow-sm'
      }`}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      <div className="relative w-4 h-4 flex items-center justify-center">
        {isDark ? (
          <Sun className="w-4 h-4 transition-transform duration-300 rotate-0 scale-100 text-amber-400" />
        ) : (
          <Moon className="w-4 h-4 transition-transform duration-300 -rotate-12 scale-100 text-slate-700" />
        )}
      </div>
    </button>
  );
}
