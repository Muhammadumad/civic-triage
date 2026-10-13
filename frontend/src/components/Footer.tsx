'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  ShieldCheck, 
  Award, 
  CheckCircle2, 
  ExternalLink, 
  HeartHandshake, 
  Activity,
  Lock,
  Globe2
} from 'lucide-react';

export function Footer() {
  const pathname = usePathname();

  // Do not render Footer on login or registration pages
  if (pathname === '/login' || pathname === '/register') {
    return null;
  }

  return (
    <footer className="mt-auto border-t border-[var(--border-subtle)] bg-[var(--canvas-base)] backdrop-blur-md transition-colors duration-300 w-full overflow-hidden">
      {/* Upper service standards badge row */}
      <div className="border-b border-[var(--border-subtle)] bg-[var(--surface-card)] transition-colors duration-300 w-full overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-[var(--text-primary)]">Open311 Standard</h4>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                  Interoperable civic issue protocol compliant with federal transparency guidelines.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-[var(--text-primary)]">ISO 18091 Certified</h4>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                  Audited local government quality management with SLA-backed response targets.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400 shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-[var(--text-primary)]">Citizen Privacy First</h4>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                  Zero commercial tracking, anonymized location aggregation, and SOC2 Type II compliance.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-[var(--text-primary)]">WCAG 2.1 AA</h4>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                  Full assistive screen-reader support and high contrast accessibility profiles.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Brand info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.22)]">
                <Activity className="w-4 h-4" />
              </div>
              <span className="text-lg font-bold text-[var(--text-primary)] tracking-tight">
                Civic<span className="text-emerald-500 dark:text-emerald-400">Pulse</span>
              </span>
            </div>

            <p className="text-sm text-[var(--text-secondary)] max-w-sm leading-relaxed">
              Real-time civic complaint triage engine utilizing multimodal AI duplicate detection,
              geographic severity scoring, and intelligent dispatch routing for modern municipal operations.
            </p>

            <div className="flex items-center gap-2 pt-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-mono text-[var(--text-secondary)]">
                Municipal Dispatch Engine: <span className="text-emerald-600 dark:text-emerald-400 font-semibold">ONLINE (99.98% SLA)</span>
              </span>
            </div>
          </div>

          {/* Quick Routes */}
          <div>
            <h5 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-primary)] mb-4">
              Citizen Portal
            </h5>
            <ul className="space-y-2.5 text-sm text-[var(--text-secondary)]">
              <li>
                <Link href="/complaints/new" className="hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors">
                  File New Complaint
                </Link>
              </li>
              <li>
                <Link href="/complaints" className="hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors">
                  Track Submissions
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors">
                  About CivicPulse
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors">
                  Contact & Hotlines
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors">
                  Triage FAQ & Help
                </Link>
              </li>
            </ul>
          </div>

          {/* Municipal Departments */}
          <div>
            <h5 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-primary)] mb-4">
              Integrated Services
            </h5>
            <ul className="space-y-2.5 text-sm text-[var(--text-secondary)]">
              <li>
                <span className="text-[var(--text-primary)] font-medium">Public Works:</span> Road & Sidewalks
              </li>
              <li>
                <span className="text-[var(--text-primary)] font-medium">Sanitation:</span> Solid Waste & Litter
              </li>
              <li>
                <span className="text-[var(--text-primary)] font-medium">Water Board:</span> Mains & Hydrants
              </li>
              <li>
                <span className="text-[var(--text-primary)] font-medium">Electrical Grid:</span> Illumination
              </li>
              <li>
                <span className="text-[var(--text-primary)] font-medium">Stormwater:</span> Drainage & Flooding
              </li>
            </ul>
          </div>

          {/* Standards & Legal */}
          <div>
            <h5 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-primary)] mb-4">
              Governance & Legal
            </h5>
            <ul className="space-y-2.5 text-sm text-[var(--text-secondary)]">
              <li>
                <Link href="/privacy" className="hover:text-[var(--text-primary)] transition-colors">
                  Privacy Policy & GPS
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-[var(--text-primary)] transition-colors">
                  Terms of Municipal Use
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-[var(--text-primary)] transition-colors">
                  Public Service Charter
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[var(--text-primary)] transition-colors">
                  Emergency Hotlines
                </Link>
              </li>
              <li>
                <Link href="/admin/rules" className="hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors">
                  Scoring Rule Config (Admin)
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-[var(--border-subtle)] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--text-muted)]">
          <p>© 2026 CivicPulse Systems. Authorized Municipal Technology Platform.</p>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
              <Globe2 className="w-3.5 h-3.5" />
              <span>San Francisco Civic District 10</span>
            </span>
            <span className="font-mono text-[var(--text-muted)]">v1.0.0-rc2</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
export default Footer;
