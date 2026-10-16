'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowUpRight, Globe2 } from 'lucide-react';

export function Footer() {
  const pathname = usePathname();

  if (pathname === '/login' || pathname === '/register') {
    return null;
  }

  return (
    <footer className="mt-auto border-t border-[var(--border-subtle)] bg-[var(--surface-card)] text-[var(--text-primary)] w-full">
      {/* Upper Architectural Standards Grid (Exposed 1px borders) */}
      <div className="border-b border-[var(--border-subtle)] bg-[var(--surface-elevated)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[var(--border-subtle)] border-x border-[var(--border-subtle)]">
            <div className="p-5 flex flex-col justify-between gap-2">
              <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-widest text-[var(--text-muted)]">
                <span>STD // 01</span>
                <span className="text-[var(--text-primary)] font-semibold">VERIFIED</span>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-[var(--text-primary)]">Open311 Protocol</h4>
                <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">
                  Interoperable civic issue ledger compliant with municipal transparency mandates.
                </p>
              </div>
            </div>

            <div className="p-5 flex flex-col justify-between gap-2">
              <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-widest text-[var(--text-muted)]">
                <span>STD // 02</span>
                <span className="text-[var(--text-primary)] font-semibold">ISO 18091</span>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-[var(--text-primary)]">Auditable Triage Math</h4>
                <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">
                  Deterministic 0–100 priority scoring with transparent factor breakdowns.
                </p>
              </div>
            </div>

            <div className="p-5 flex flex-col justify-between gap-2">
              <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-widest text-[var(--text-muted)]">
                <span>STD // 03</span>
                <span className="text-[var(--text-primary)] font-semibold">ZERO TRACKING</span>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-[var(--text-primary)]">Citizen Privacy First</h4>
                <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">
                  Anonymous reporting option, stripped personal EXIF, and strict data minimization.
                </p>
              </div>
            </div>

            <div className="p-5 flex flex-col justify-between gap-2">
              <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-widest text-[var(--text-muted)]">
                <span>STD // 04</span>
                <span className="text-[var(--text-primary)] font-semibold">WCAG 2.1 AA</span>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-[var(--text-primary)]">Accessible Civic Utility</h4>
                <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">
                  High-contrast editorial typography engineered for 360px mobile field conditions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Architectural Columns */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          {/* Brand Col (5 cols) */}
          <div className="md:col-span-5 space-y-4 pr-0 md:pr-8">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 bg-[var(--text-primary)] text-[var(--canvas-base)] flex items-center justify-center font-mono text-xs font-bold">
                CP
              </div>
              <span className="font-editorial text-2xl tracking-tight text-[var(--text-primary)]">
                CivicPulse Municipal Ledger
              </span>
            </div>

            <p className="text-sm text-[var(--text-secondary)] max-w-md leading-relaxed">
              Public works intake, spatial duplicate clustering, and deterministic dispatch routing. Built so authorities fix the highest-impact hazards first and residents can inspect every step.
            </p>

            <div className="pt-2 flex items-center gap-3 font-mono text-xs text-[var(--text-secondary)]">
              <span className="inline-block w-2 h-2 bg-[var(--brand-primary)]" />
              <span>DISPATCH DAEMON: ACTIVE · 99.98% UPTIME</span>
            </div>
          </div>

          {/* Citizen Portal (2 cols) */}
          <div className="md:col-span-2">
            <h5 className="font-mono text-[11px] font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-4">
              Citizen Portal
            </h5>
            <ul className="space-y-2.5 text-xs font-medium text-[var(--text-secondary)]">
              <li>
                <Link href="/complaints/new" className="hover:text-[var(--brand-primary)] transition-colors inline-flex items-center gap-1">
                  <span>File New Report</span>
                  <ArrowUpRight className="w-3 h-3" />
                </Link>
              </li>
              <li>
                <Link href="/complaints" className="hover:text-[var(--brand-primary)] transition-colors">
                  Track Submissions
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-[var(--brand-primary)] transition-colors">
                  System Architecture
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-[var(--brand-primary)] transition-colors">
                  Triage FAQ & SLA
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[var(--brand-primary)] transition-colors">
                  Hotlines & Directory
                </Link>
              </li>
            </ul>
          </div>

          {/* Municipal Divisions (3 cols) */}
          <div className="md:col-span-3">
            <h5 className="font-mono text-[11px] font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-4">
              Dispatch Divisions
            </h5>
            <ul className="space-y-2.5 text-xs text-[var(--text-secondary)]">
              <li className="flex justify-between border-b border-[var(--border-subtle)] pb-1.5">
                <span className="font-medium text-[var(--text-primary)]">Public Works</span>
                <span className="font-mono text-[var(--text-muted)]">Roads · 48h SLA</span>
              </li>
              <li className="flex justify-between border-b border-[var(--border-subtle)] pb-1.5">
                <span className="font-medium text-[var(--text-primary)]">Sanitation Bureau</span>
                <span className="font-mono text-[var(--text-muted)]">Waste · 12h SLA</span>
              </li>
              <li className="flex justify-between border-b border-[var(--border-subtle)] pb-1.5">
                <span className="font-medium text-[var(--text-primary)]">Water & Utilities</span>
                <span className="font-mono text-[var(--text-muted)]">Mains · 18h SLA</span>
              </li>
              <li className="flex justify-between border-b border-[var(--border-subtle)] pb-1.5">
                <span className="font-medium text-[var(--text-primary)]">Electrical Grid</span>
                <span className="font-mono text-[var(--text-muted)]">Lighting · 24h SLA</span>
              </li>
              <li className="flex justify-between pb-1">
                <span className="font-medium text-[var(--text-primary)]">Stormwater Div</span>
                <span className="font-mono text-[var(--text-muted)]">Drains · 24h SLA</span>
              </li>
            </ul>
          </div>

          {/* Governance (2 cols) */}
          <div className="md:col-span-2">
            <h5 className="font-mono text-[11px] font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-4">
              Governance
            </h5>
            <ul className="space-y-2.5 text-xs font-medium text-[var(--text-secondary)]">
              <li>
                <Link href="/admin/rules" className="hover:text-[var(--brand-primary)] transition-colors">
                  Scoring Rules Config
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-[var(--brand-primary)] transition-colors">
                  Dispatcher Console
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-[var(--text-primary)] transition-colors">
                  Privacy & Geodata
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-[var(--text-primary)] transition-colors">
                  Terms of Civic Use
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Architectural Colophon */}
        <div className="mt-12 pt-6 border-t border-[var(--border-subtle)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 font-mono text-[11px] text-[var(--text-muted)]">
          <p>© 2026 CIVICPULSE MUNICIPAL SYSTEMS · PROBLEM SC-01 TRIAGE ARCHITECTURE</p>
          <div className="flex items-center gap-6">
            <span className="inline-flex items-center gap-1.5 text-[var(--text-secondary)]">
              <Globe2 className="w-3.5 h-3.5" />
              <span>MUNICIPAL DISTRICTS 01–05</span>
            </span>
            <span>BUILD 2026.10</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
export default Footer;

