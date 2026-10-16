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
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-[var(--canvas-base)] bg-civic-grid">
      <div className="w-full max-w-md space-y-6">
        {/* Top Return Row */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-[var(--surface-card)] border border-[var(--border-subtle)] font-mono text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-strong)] transition-colors group"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[var(--brand-primary)] group-hover:-translate-x-0.5 transition-transform" />
            <span>RETURN TO LEDGER</span>
          </Link>
          <span className="font-mono text-[11px] text-[var(--text-muted)]">AUTH // SC-01</span>
        </div>

        {/* Main Architectural Dossier Card */}
        <div className="bg-[var(--surface-card)] border border-[var(--border-subtle)]">
          {/* Header Block */}
          <div className="p-6 sm:p-8 border-b border-[var(--border-subtle)] bg-[var(--surface-elevated)]">
            <div className="flex items-center justify-between mb-3">
              <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--brand-primary)] font-semibold">
                SESSION AUTHENTICATION
              </span>
              <Lock className="w-4 h-4 text-[var(--text-muted)]" />
            </div>
            <h1 className="font-editorial text-3xl text-[var(--text-primary)]">
              Sign in to CivicPulse
            </h1>
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              Access your resident tracking ledger or the municipal dispatch console.
            </p>
          </div>

          <div className="p-6 sm:p-8">
            {error && (
              <div className="mb-5 p-3.5 bg-[var(--priority-high-bg)] border border-[var(--priority-high-border)] text-[var(--priority-high-text)] text-xs space-y-2.5">
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div className="flex-1 leading-relaxed">{error}</div>
                </div>
                <div className="pt-2 border-t border-[var(--priority-high-border)] flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[11px] text-[var(--text-secondary)]">Evaluate immediately:</span>
                  <button
                    type="button"
                    onClick={() => handleDirectDemoLogin('admin@demo.com', 'admin123')}
                    className="font-mono text-[11px] font-bold text-[var(--brand-primary)] hover:underline uppercase"
                  >
                    Continue as Demo Admin →
                  </button>
                </div>
              </div>
            )}

            {success && (
              <div className="mb-5 flex items-center gap-2 p-3.5 bg-[var(--surface-elevated)] border border-[var(--border-strong)] text-[var(--text-primary)] font-mono text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
                <span>SESSION VERIFIED · REDIRECTING...</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block font-mono text-[11px] uppercase tracking-wider font-semibold text-[var(--text-secondary)] mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="resident@demo.com"
                    required
                    disabled={loading}
                    className="w-full pl-10 pr-4 py-2.5 bg-[var(--surface-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)] placeholder-[var(--text-muted)] text-sm focus:outline-none focus:border-[var(--text-primary)] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono text-[11px] uppercase tracking-wider font-semibold text-[var(--text-secondary)] mb-1.5">
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
                    className="w-full pl-10 pr-4 py-2.5 bg-[var(--surface-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)] placeholder-[var(--text-muted)] text-sm focus:outline-none focus:border-[var(--text-primary)] transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 flex items-center justify-center gap-2 py-3 px-4 stitch-btn-accent font-mono text-xs uppercase tracking-wider font-semibold disabled:opacity-50"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent animate-spin" />
                    <span>Verifying Credentials...</span>
                  </div>
                ) : (
                  <>
                    <span>Authenticate Session</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Demo Credential Autofill Helpers */}
              <div className="pt-4 border-t border-[var(--border-subtle)] flex items-center justify-between font-mono text-[11px] text-[var(--text-muted)]">
                <span>DEMO PRESETS:</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleFillDemo('admin@demo.com', 'admin123')}
                    className="px-2 py-1 bg-[var(--surface-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)] hover:border-[var(--brand-primary)] font-semibold"
                  >
                    Admin
                  </button>
                  <button
                    type="button"
                    onClick={() => handleFillDemo('resident@demo.com', 'resident123')}
                    className="px-2 py-1 bg-[var(--surface-elevated)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-semibold"
                  >
                    Resident
                  </button>
                </div>
              </div>
            </form>

            <div className="mt-6 pt-5 border-t border-[var(--border-subtle)] text-center">
              <p className="text-xs text-[var(--text-secondary)]">
                New to CivicPulse?{' '}
                <Link
                  href="/register"
                  className="text-[var(--brand-primary)] font-semibold underline underline-offset-4"
                >
                  Create a resident account
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
