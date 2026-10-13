import React from 'react';
import Link from 'next/link';
import { FileText, AlertTriangle, Scale, ShieldCheck } from 'lucide-react';

export const metadata = {
  title: 'Terms of Municipal Service — CivicPulse',
  description: 'Terms and conditions governing citizen complaint submission, SLA commitments, and emergency reporting boundaries.',
};

export default function TermsPage() {
  const sections = [
    { id: 'acceptable-use', label: '1. Acceptable Public Service Use' },
    { id: 'false-reporting', label: '2. False Reporting & Penalties' },
    { id: 'dispatch-slas', label: '3. Municipal Dispatch SLAs' },
    { id: 'reopen-terms', label: '4. 72-Hour Reopen Terms' },
    { id: 'liability', label: '5. Limitation of Municipal Liability' },
  ];

  return (
    <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-10">
      {/* Header */}
      <div className="space-y-2 border-b border-white/[0.08] pb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
          <Scale className="w-3.5 h-3.5" />
          <span>Municipal User Charter</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Terms of Municipal Service
        </h1>
        <p className="text-xs text-zinc-400 font-mono">
          Last Revised: October 2026 | Authorized City Technology Agreement
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Sticky Left Navigation (4 cols) */}
        <div className="lg:col-span-4 sticky top-24 space-y-4">
          <div className="p-5 rounded-2xl glass-card border border-white/[0.08] space-y-3">
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
              Terms Outline
            </span>
            <nav className="space-y-1.5 text-xs">
              {sections.map((sec) => (
                <a
                  key={sec.id}
                  href={`#${sec.id}`}
                  className="block px-3 py-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors font-medium"
                >
                  {sec.label}
                </a>
              ))}
            </nav>
          </div>

          <div className="p-5 rounded-2xl bg-amber-950/20 border border-amber-500/30 text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-amber-400">
              <AlertTriangle className="w-4 h-4" />
              <span>Not for 911 Emergencies</span>
            </div>
            <p className="text-zinc-300 leading-relaxed text-[11px]">
              CivicPulse is exclusively for non-life-threatening infrastructure hazards. Always dial 911 for fires, crimes in progress, or medical emergencies.
            </p>
          </div>
        </div>

        {/* Content Column (8 cols) */}
        <div className="lg:col-span-8 space-y-10 text-xs sm:text-sm text-zinc-300 leading-relaxed">
          {/* Section 1 */}
          <section id="acceptable-use" className="space-y-3 scroll-mt-28">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-white/[0.08] pb-2">
              <span className="text-emerald-400">1.</span>
              <span>Acceptable Public Service Use</span>
            </h2>
            <p>
              By accessing CivicPulse, citizens agree to use the platform solely for reporting bona fide municipal infrastructure defects, sanitation hazards, water conduit failures, electrical outages, or stormwater blockages within official city boundaries.
            </p>
          </section>

          {/* Section 2 */}
          <section id="false-reporting" className="space-y-3 scroll-mt-28">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-white/[0.08] pb-2">
              <span className="text-emerald-400">2.</span>
              <span>False Reporting & Penalties</span>
            </h2>
            <p>
              Intentionally fabricating emergency hazards, submitting malicious imagery, or automated spamming of the triage dispatch queue is a violation of municipal administrative code.
            </p>
            <p className="text-xs text-zinc-400">
              The city reserves the right to rate-limit or revoke digital intake privileges for bad-faith submitters following administrative review.
            </p>
          </section>

          {/* Section 3 */}
          <section id="dispatch-slas" className="space-y-3 scroll-mt-28">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-white/[0.08] pb-2">
              <span className="text-emerald-400">3.</span>
              <span>Municipal Dispatch SLAs</span>
            </h2>
            <p>
              Target resolution times (e.g., &lt;4 hours for High Priority, &lt;24 hours for Medium Priority) represent operational service targets, not strict legal guarantees. Dispatch timelines may be subject to weather emergencies, natural disasters, or concurrent critical incidents.
            </p>
          </section>

          {/* Section 4 */}
          <section id="reopen-terms" className="space-y-3 scroll-mt-28">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-white/[0.08] pb-2">
              <span className="text-emerald-400">4.</span>
              <span>72-Hour Reopen Protections</span>
            </h2>
            <p>
              Residents who believe a completed ticket was insufficiently repaired may trigger a single "Reopen" action within 72 hours of closure. Reopened tickets require a brief reason statement and are elevated to municipal supervisory inspection.
            </p>
          </section>

          {/* Section 5 */}
          <section id="liability" className="space-y-3 scroll-mt-28">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-white/[0.08] pb-2">
              <span className="text-emerald-400">5.</span>
              <span>Limitation of Municipal Liability</span>
            </h2>
            <p>
              Filing a report on CivicPulse acknowledges municipal receipt but does not create an actionable individual duty of care beyond established statutory sovereign immunity provisions.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
