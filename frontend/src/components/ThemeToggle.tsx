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
          ? 'bg-[#161922] border-white/10 text-amber-400 hover:text-amber-300 hover:border-amber-400/40 hover:shadow-[0_0_12px_rgba(251,191,36,0.25)]'
          : 'bg-[#F6F5F1] border-[#E2DFD7] text-[#1B365D] hover:text-[#002046] hover:border-[#1B365D]/40 hover:shadow-[0_0_12px_rgba(27,54,93,0.15)]'
      }`}
      title={isDark ? 'Switch to Stitch Light Mode' : 'Switch to Stitch Dark Mode'}
    >
      <div className="relative w-4 h-4 flex items-center justify-center">
        {isDark ? (
          <Sun className="w-4 h-4 transition-transform duration-300 rotate-0 scale-100 text-amber-400" />
        ) : (
          <Moon className="w-4 h-4 transition-transform duration-300 -rotate-12 scale-100 text-[#1B365D]" />
        )}
      </div>
    </button>
  );
}
