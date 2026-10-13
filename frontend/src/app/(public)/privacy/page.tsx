import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Lock, Eye, FileText, CheckCircle2 } from 'lucide-react';

export const metadata = {
  title: 'Privacy Policy & GPS Governance — CivicPulse',
  description: 'CivicPulse citizen privacy policy, automated visual anonymization, and Open311 data minimization standards.',
};

export default function PrivacyPage() {
  const sections = [
    { id: 'gps-handling', label: '1. GPS & Location Data' },
    { id: 'image-blurring', label: '2. Automated Image Anonymization' },
    { id: 'data-minimization', label: '3. Data Minimization & Retention' },
    { id: 'open-governance', label: '4. Open Governance & FOIA' },
    { id: 'citizen-rights', label: '5. Citizen Rights & Opt-Out' },
  ];

  return (
    <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-10">
      {/* Header */}
      <div className="space-y-2 border-b border-white/[0.08] pb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
          <Lock className="w-3.5 h-3.5" />
          <span>Statutory Privacy & Data Protection</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Citizen Privacy Policy & GPS Governance
        </h1>
        <p className="text-xs text-zinc-400 font-mono">
          Effective Date: October 2026 | ISO 18091 & SOC2 Type II Certified
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Sticky Left Navigation (4 cols) */}
        <div className="lg:col-span-4 sticky top-24 space-y-4">
          <div className="p-5 rounded-2xl glass-card border border-white/[0.08] space-y-3">
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
              Policy Table of Contents
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

          <div className="p-5 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              <span>Zero Commercial Monetization</span>
            </div>
            <p className="text-zinc-300 leading-relaxed text-[11px]">
              CivicPulse does not sell, track, or share citizen mobile telemetry with advertisers or non-governmental data brokers.
            </p>
          </div>
        </div>

        {/* Content Column (8 cols) */}
        <div className="lg:col-span-8 space-y-10 text-xs sm:text-sm text-zinc-300 leading-relaxed">
          {/* Section 1 */}
          <section id="gps-handling" className="space-y-3 scroll-mt-28">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-white/[0.08] pb-2">
              <span className="text-emerald-400">1.</span>
              <span>GPS & Spatial Coordinates Handling</span>
            </h2>
            <p>
              When submitting a complaint, CivicPulse captures latitude and longitude coordinates strictly to route municipal service crews to the hazard location.
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-zinc-400 text-xs">
              <li>High-precision coordinates are only accessible to authorized field dispatchers.</li>
              <li>Public incident heatmaps fuzz coordinates to the nearest parcel or street block center to preserve resident privacy.</li>
              <li>We never log continuous background GPS location; geolocation is queried exclusively at the instant of report submission.</li>
            </ul>
          </section>

          {/* Section 2 */}
          <section id="image-blurring" className="space-y-3 scroll-mt-28">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-white/[0.08] pb-2">
              <span className="text-emerald-400">2.</span>
              <span>Automated Image Anonymization Pipeline</span>
            </h2>
            <p>
              Photos uploaded by citizens pass through an automated visual sanitization model before permanent storage in municipal records:
            </p>
            <div className="p-4 rounded-xl bg-[#090A0F] border border-white/5 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Facial & License Plate Masking</span>
              </div>
              <p className="text-zinc-400">
                Any human faces or vehicular registration plates detected within the field of view are automatically obscured via Gaussian blur filters.
              </p>
            </div>
          </section>

          {/* Section 3 */}
          <section id="data-minimization" className="space-y-3 scroll-mt-28">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-white/[0.08] pb-2">
              <span className="text-emerald-400">3.</span>
              <span>Data Minimization & Retention Schedule</span>
            </h2>
            <p>
              In accordance with municipal retention regulations, citizen contact details provided for status updates are kept only for the duration of the active resolution cycle plus 90 days.
            </p>
            <p>
              Aggregated infrastructure statistics (e.g. &ldquo;45 potholes repaired in District 3&rdquo;) are permanently retained in municipal open data archives with all identifying personal links purged.
            </p>
          </section>

          {/* Section 4 */}
          <section id="open-governance" className="space-y-3 scroll-mt-28">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-white/[0.08] pb-2">
              <span className="text-emerald-400">4.</span>
              <span>Open Governance & FOIA Compliance</span>
            </h2>
            <p>
              CivicPulse reports are considered public service tickets subject to state Freedom of Information Act (FOIA) and sunshine ordinances.
            </p>
            <p>
              Under state law, non-identifying complaint summaries, locations, dispatch timelines, and official resolution photos are publicly inspectable by any citizen or journalist.
            </p>
          </section>

          {/* Section 5 */}
          <section id="citizen-rights" className="space-y-3 scroll-mt-28">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-white/[0.08] pb-2">
              <span className="text-emerald-400">5.</span>
              <span>Citizen Rights & Anonymous Reporting</span>
            </h2>
            <p>
              Every resident retains the unconditional right to file civic complaints anonymously without providing names, emails, or telephone numbers. Anonymous reports receive identical algorithmic triage priority based strictly on physical hazard severity.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
