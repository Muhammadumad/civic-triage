'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { usePersona } from '@/context/PersonaContext';
import { 
  UserPlus, 
  Mail, 
  User, 
  Lock, 
  KeyRound, 
  ArrowRight, 
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  ShieldAlert
} from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = usePersona();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Please provide your full name.');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setError('Please provide a valid email address.');
      return;
    }

    if (password.length < 6) {
      setError('Password must contain at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    try {
      setLoading(true);
      await register(name.trim(), email.trim(), password);
      setSuccess(true);
      setTimeout(() => {
        router.push('/complaints/new');
      }, 700);
    } catch (err: any) {
      if (err.message === 'Failed to fetch' || err.name === 'TypeError') {
        setError('Cannot connect to the backend server. The cloud server may be starting up (takes ~30s on free tier). You can also sign in with a demo account.');
      } else {
        setError(err.message || 'Registration failed. Please try again.');
      }
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
          <span className="font-mono text-[11px] text-[var(--text-muted)]">ENROLL // SC-01</span>
        </div>

        {/* Form Card */}
        <div className="bg-[var(--surface-card)] border border-[var(--border-subtle)]">
          {/* Brand Header */}
          <div className="p-6 sm:p-8 border-b border-[var(--border-subtle)] bg-[var(--surface-elevated)]">
            <div className="flex items-center justify-between mb-3">
              <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--brand-primary)] font-semibold">
                CITIZEN REGISTRATION
              </span>
              <UserPlus className="w-4 h-4 text-[var(--text-muted)]" />
            </div>
            <h1 className="font-editorial text-3xl text-[var(--text-primary)]">
              Create a Resident Account
            </h1>
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              Register to track your municipal complaints across devices.
            </p>
          </div>

          <div className="p-6 sm:p-8 space-y-5">
            {/* Security / Role Notice */}
            <div className="flex items-start gap-2.5 p-3 bg-[var(--surface-elevated)] border border-[var(--border-subtle)] text-[var(--text-secondary)] text-xs">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-[var(--brand-primary)]" />
              <span>
                Public sign-up creates a <strong>Verified Resident</strong> profile. Municipal dispatcher credentials are provisioned by city administration.
              </span>
            </div>

            {error && (
              <div className="p-3.5 bg-[var(--priority-high-bg)] border border-[var(--priority-high-border)] text-[var(--priority-high-text)] text-xs space-y-2.5">
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div className="flex-1 leading-relaxed">{error}</div>
                </div>
                <div className="pt-2 border-t border-[var(--priority-high-border)] flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[11px] text-[var(--text-secondary)]">Already registered?</span>
                  <Link
                    href="/login"
                    className="font-mono text-xs font-semibold text-[var(--brand-primary)] hover:underline"
                  >
                    Sign in with Demo →
                  </Link>
                </div>
              </div>
            )}

            {success && (
              <div className="flex items-center gap-2 p-3.5 bg-[var(--surface-elevated)] border border-[var(--border-strong)] text-[var(--text-primary)] font-mono text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
                <span>ACCOUNT CREATED · REDIRECTING...</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block font-mono text-[11px] uppercase tracking-wider font-semibold text-[var(--text-secondary)] mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Alex Morgan"
                    required
                    disabled={loading}
                    className="w-full pl-10 pr-4 py-2.5 bg-[var(--surface-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)] placeholder-[var(--text-muted)] text-sm focus:outline-none focus:border-[var(--text-primary)] transition-colors"
                  />
                </div>
              </div>

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
                    placeholder="alex@example.com"
                    required
                    disabled={loading}
                    className="w-full pl-10 pr-4 py-2.5 bg-[var(--surface-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)] placeholder-[var(--text-muted)] text-sm focus:outline-none focus:border-[var(--text-primary)] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono text-[11px] uppercase tracking-wider font-semibold text-[var(--text-secondary)] mb-1.5">
                  Password (min. 6 characters)
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

              <div>
                <label className="block font-mono text-[11px] uppercase tracking-wider font-semibold text-[var(--text-secondary)] mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
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
                    <span>Creating Account...</span>
                  </div>
                ) : (
                  <>
                    <span>Register Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="pt-5 border-t border-[var(--border-subtle)] text-center">
              <p className="text-xs text-[var(--text-secondary)]">
                Already registered?{' '}
                <Link
                  href="/login"
                  className="text-[var(--brand-primary)] font-semibold underline underline-offset-4"
                >
                  Sign in to your account
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
