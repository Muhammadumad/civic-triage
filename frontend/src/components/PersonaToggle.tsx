'use client';

import React from 'react';
import { usePersona } from '@/context/PersonaContext';
import { UserCheck, ShieldCheck } from 'lucide-react';

export function PersonaToggle() {
  const { role, setRole } = usePersona();

  return (
    <div className="flex items-center gap-1.5 p-1 rounded-full bg-[#11131A] border border-white/10 shadow-inner">
      <button
        type="button"
        onClick={() => setRole('resident')}
        className={`flex min-w-[92px] items-center justify-center gap-1.5 whitespace-nowrap px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
          role === 'resident'
            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.25)]'
            : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5 border border-transparent'
        }`}
      >
        <UserCheck className="w-3.5 h-3.5" />
        <span>Resident</span>
      </button>

      <button
        type="button"
        onClick={() => setRole('admin')}
        className={`flex min-w-[102px] items-center justify-center gap-1.5 whitespace-nowrap px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
          role === 'admin'
            ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-[0_0_12px_rgba(99,102,241,0.25)]'
            : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5 border border-transparent'
        }`}
      >
        <ShieldCheck className="w-3.5 h-3.5" />
        <span>City Admin</span>
      </button>
    </div>
  );
}
