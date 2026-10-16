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
      <div className="w-8 h-8 bg-[var(--surface-elevated)] border border-[var(--border-subtle)]" />
    );
  }

  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      className="inline-flex items-center justify-center w-8 h-8 bg-[var(--surface-elevated)] hover:bg-[var(--text-primary)] text-[var(--text-primary)] hover:text-[var(--canvas-base)] border border-[var(--border-subtle)] hover:border-[var(--text-primary)] transition-colors"
      title={isDark ? 'Switch to Paper Light Mode' : 'Switch to Carbon Dark Mode'}
    >
      <div className="relative w-3.5 h-3.5 flex items-center justify-center">
        {isDark ? (
          <Sun className="w-3.5 h-3.5" />
        ) : (
          <Moon className="w-3.5 h-3.5" />
        )}
      </div>
    </button>
  );
}

