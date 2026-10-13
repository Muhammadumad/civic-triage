import React from 'react';
import Link from 'next/link';
import { Activity, Home, ArrowLeft, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-16 text-center">
      <div className="max-w-md w-full space-y-6">
        {/* Glowing 404 Beacon */}
        <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-emerald-500/20 blur-xl animate-pulse" />
          <div className="relative w-20 h-20 rounded-2xl bg-[#11131A] border border-emerald-500/40 shadow-[0_0_25px_rgba(16,185,129,0.25)] flex items-center justify-center text-emerald-400">
            <Activity className="w-10 h-10" />
          </div>
        </div>

        <div className="space-y-2">
          <span className="font-mono text-xs font-bold text-emerald-400 uppercase tracking-widest px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/20">
            Error 404 — Page Not Found
          </span>
          <h1 className="text-3xl font-extrabold text-white tracking-tight pt-2">
            Lost in the Municipal Grid?
          </h1>
          <p className="text-xs text-zinc-400 leading-relaxed max-w-sm mx-auto">
            The civic route or incident reference you requested could not be located in the current municipal spatial database.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all"
          >
            <Home className="w-4 h-4" />
            <span>Return to Incident Feed</span>
          </Link>

          <Link
            href="/faq"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#161922] hover:bg-[#1c202b] text-white border border-white/10 text-xs font-semibold transition-all"
          >
            <Search className="w-4 h-4 text-emerald-400" />
            <span>Search FAQ</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
