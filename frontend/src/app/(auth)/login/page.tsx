'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { usePersona } from '@/context/PersonaContext';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  ArrowRight, 
  ArrowLeft,
  Sparkles, 
  UserCheck, 
  AlertCircle,
  CheckCircle2,
  KeyRound
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login } = usePersona();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both your email address and password.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const user = await login(email, password);
      setSuccess(true);
      setTimeout(() => {
        const searchRedirect = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('redirect') : null;
        if (searchRedirect && (user.role === 'admin' || !searchRedirect.startsWith('/admin'))) {
          router.push(searchRedirect);
        } else if (user.role === 'admin') {
          router.push('/admin');
        } else {
          router.push('/complaints');
        }
      }, 700);
    } catch (err: any) {
      if (err.message === 'Failed to fetch' || err.name === 'TypeError') {
        setError('Cannot connect to the backend server. The cloud server may be starting up (takes ~30s on free tier). You can click below to continue in Demo Mode.');
      } else {
        setError(err.message || 'Authentication failed. Please verify your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
  };

  const handleDirectDemoLogin = async (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
    setLoading(true);
    try {
      const user = await login(demoEmail, demoPass);
      setSuccess(true);
      setTimeout(() => {
        const searchRedirect = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('redirect') : null;
        if (searchRedirect && (user.role === 'admin' || !searchRedirect.startsWith('/admin'))) {
          router.push(searchRedirect);
        } else if (user.role === 'admin') {
          router.push('/admin');
        } else {
          router.push('/complaints');
        }
      }, 400);
    } catch (err: any) {
      setError(err.message || 'Demo authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Top Return Row */}
        <div className="flex items-center justify-start">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/5 dark:bg-white/5 border border-[var(--border-subtle)] text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-black/10 dark:hover:bg-white/10 transition-all group"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400 group-hover:-translate-x-0.5 transition-transform" />
            <span>Return to Home</span>
          </Link>
        </div>

        {/* Brand Header */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 dark:text-emerald-400 shadow-[0_0_24px_rgba(16,185,129,0.2)]">
            <Lock className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
              Sign In to CivicPulse
            </h1>
            <p className="text-sm text-[var(--text-muted)] mt-1">
              Access your civic complaint portal or municipal triage command center
            </p>
          </div>
        </div>

        {/* Main Form Card */}
        <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-[var(--border-subtle)] shadow-xl relative">
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs space-y-2.5 animate-in fade-in">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
                <div className="flex-1 leading-relaxed">{error}</div>
              </div>
              <div className="pt-2 border-t border-red-500/20 flex flex-wrap items-center justify-between gap-2">
                <span className="text-[11px] text-[var(--text-muted)]">Want to test right now?</span>
                <button
                  type="button"
                  onClick={() => handleDirectDemoLogin('admin@demo.com', 'admin123')}
                  className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  Continue as Demo Admin →
                </button>
              </div>
            </div>
          )}

          {success && (
            <div className="mb-5 flex items-center gap-2 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Authentication successful! Redirecting...</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. resident@demo.com"
                  required
                  disabled={loading}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/5 dark:bg-white/5 border border-[var(--border-subtle)] text-[var(--text-primary)] placeholder-[var(--text-muted)] text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                Password
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={loading}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/5 dark:bg-white/5 border border-[var(--border-subtle)] text-[var(--text-primary)] placeholder-[var(--text-muted)] text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-[0.99] text-slate-950 font-semibold text-sm transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Verifying Credentials...</span>
                </div>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Demo Credential Autofill Helpers */}
            <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between text-[11px] text-[var(--text-muted)]">
              <span>Demo Quick Fill:</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleFillDemo('admin@demo.com', 'admin123')}
                  className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
                >
                  Admin
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => handleFillDemo('resident@demo.com', 'resident123')}
                  className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-semibold hover:underline"
                >
                  Resident
                </button>
              </div>
            </div>
          </form>

          <div className="mt-6 pt-5 border-t border-[var(--border-subtle)] text-center">
            <p className="text-xs text-[var(--text-muted)]">
              New to CivicPulse?{' '}
              <Link
                href="/register"
                className="text-emerald-600 dark:text-emerald-400 font-semibold underline underline-offset-4"
              >
                Create a resident account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
