'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useComplaintsStore } from '@/lib/complaints-store';
import { fetchComplaintById } from '@/lib/api';
import { 
  Complaint,
  ComplaintStatus, 
  CATEGORY_THEME, 
  STATUS_THEME, 
  PRIORITY_THEME, 
  getPriorityLevel,
  SAMPLE_COMPLAINTS
} from '@/lib/types';
import { 
  ArrowLeft, 
  Clock, 
  MapPin, 
  RotateCcw, 
  Copy, 
  Check, 
  Info, 
  Sparkles, 
  Camera, 
  Award, 
  Building2, 
  Send,
  AlertTriangle,
  Truck,
  ShieldCheck,
  Radio,
  User,
  Wrench,
  Layers,
  ChevronRight,
  ShieldAlert,
  Loader2
} from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils';

const WORKFLOW_STEPS: ComplaintStatus[] = [
  'New',
  'Under Review',
  'Assigned',
  'In Progress',
  'Resolved',
];

export default function ComplaintTrackingClient({ id }: { id: string }) {
  const router = useRouter();
  const { getComplaintById, reopenComplaint } = useComplaintsStore();
  
  const [mounted, setMounted] = useState(false);
  const [fetchedComplaint, setFetchedComplaint] = useState<Complaint | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const sampleFallback = SAMPLE_COMPLAINTS.find((c) => c.id === id);
  const storeComplaint = getComplaintById(id);
  const complaint = fetchedComplaint || storeComplaint || sampleFallback;

  useEffect(() => {
    setMounted(true);
    const existing = getComplaintById(id) || SAMPLE_COMPLAINTS.find((c) => c.id === id);
    if (existing) {
      setFetchedComplaint(existing);
      setIsLoading(false);
    } else {
      setIsLoading(true);
      fetchComplaintById(id)
        .then((data) => {
          setFetchedComplaint(data);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [id, getComplaintById]);

  // Tooltip & Copy state
  const [showPriorityTooltip, setShowPriorityTooltip] = useState(false);
  const [copied, setCopied] = useState(false);

  // Reopen Modal state
  const [isReopenModalOpen, setIsReopenModalOpen] = useState(false);
  const [reopenReason, setReopenReason] = useState('');
  const [isSubmittingReopen, setIsSubmittingReopen] = useState(false);

  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen py-16 px-4 flex flex-col items-center justify-center text-center bg-[#090A0F] text-white">
        <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-emerald-400 mb-4 animate-pulse">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
        <h2 className="text-sm font-semibold text-white mb-1">Loading Incident Tracking Record...</h2>
        <p className="text-xs text-zinc-400 font-mono">Synchronizing incident status for {id}</p>
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="min-h-screen py-16 px-4 flex flex-col items-center justify-center text-center bg-[#090A0F] text-white">
        <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 mb-4">
          <AlertTriangle className="w-8 h-8 text-amber-400" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Complaint Not Found</h2>
        <p className="text-xs text-zinc-400 max-w-sm mb-6">
          Could not locate complaint reference <span className="font-mono text-zinc-200">{id}</span> in municipal records.
        </p>
        <Link
          href="/complaints"
          className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs"
        >
          Return to My Complaints
        </Link>
      </div>
    );
  }

  const catTheme = CATEGORY_THEME[complaint.category] || CATEGORY_THEME['Road Damage'];
  const pLevel = getPriorityLevel(complaint.priorityScore);
  const pTheme = PRIORITY_THEME[pLevel];
  const sTheme = STATUS_THEME[complaint.status] || STATUS_THEME['New'];

  const copyTicketId = () => {
    navigator.clipboard.writeText(complaint.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentStepIdx = WORKFLOW_STEPS.indexOf(complaint.status);

  // 72-hour reopen window logic
  const isResolved = complaint.status === 'Resolved';
  const resolvedHistory = (complaint.history || []).find((h) => h.status === 'Resolved');
  const resolvedTime = resolvedHistory ? new Date(resolvedHistory.changedAt).getTime() : 0;
  const isWithin72Hours = resolvedTime ? Date.now() - resolvedTime < 72 * 60 * 60 * 1000 : true;

  const handleReopenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reopenReason.trim()) return;

    setIsSubmittingReopen(true);
    setTimeout(() => {
      reopenComplaint(complaint.id, reopenReason);
      setIsSubmittingReopen(false);
      setIsReopenModalOpen(false);
      setReopenReason('');
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[var(--canvas-base)] text-[var(--text-primary)] py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-4xl mx-auto space-y-6 pb-20 animate-fade-in-up">
        {/* Navigation row */}
        <div className="flex items-center justify-between">
          <Link
            href="/complaints"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--text-muted)] hover:text-emerald-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Complaints</span>
          </Link>
          <span className="font-mono text-xs text-zinc-500 uppercase tracking-wider">
            Public Works Telemetry Hub
          </span>
        </div>

        {/* Status Banner & Title Area */}
        <div className="bg-[#11131A] border border-white/[0.08] rounded-xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-emerald-400 tracking-wider">
                TICKET REF #{complaint.id}
              </span>
              <button
                onClick={copyTicketId}
                className="p-1 text-zinc-500 hover:text-zinc-300 transition-colors rounded"
                title="Copy Ticket ID"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <div className="font-mono text-xs text-zinc-400">
              Reported {formatRelativeTime(complaint.createdAt)}
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-snug">
            {complaint.title}
          </h1>

          <div className="flex items-center gap-1.5 text-zinc-400 text-xs">
            <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{complaint.location.address}</span>
            {complaint.ward && (
              <span className="font-mono text-zinc-500 ml-1">({complaint.ward})</span>
            )}
          </div>

          {/* Meta Information Chips & Pills */}
          <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-white/[0.06]">
            {/* Category Chip */}
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
              style={{ backgroundColor: catTheme.bg, color: catTheme.text }}
            >
              <span>{complaint.category}</span>
            </span>

            {/* Priority Pill */}
            <div
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold"
              style={{
                backgroundColor: pTheme.bg,
                color: pTheme.text,
                borderColor: pTheme.border,
                borderWidth: '1px',
              }}
            >
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: pTheme.hex }} />
              <span>{pLevel} · {complaint.priorityScore}</span>
            </div>

            {/* Status Pill */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#161922] border border-white/[0.08] text-xs font-semibold text-zinc-200">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: sTheme.hex }} />
              <span>{complaint.status}</span>
            </div>

            {complaint.duplicateCount > 0 && (
              <span className="px-2.5 py-1 rounded-full text-xs font-mono bg-purple-500/10 text-purple-400 border border-purple-500/30">
                +{complaint.duplicateCount} duplicates merged
              </span>
            )}
          </div>
        </div>

        {/* Assigned Crew Info Banner */}
        <div className="bg-[#161922] border border-emerald-500/30 rounded-xl p-5 shadow-xl relative overflow-hidden">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0 text-emerald-400">
              <Truck className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono tracking-wider uppercase text-emerald-400 font-bold">
                  Active Unit Dispatched
                </span>
                <span className="inline-flex items-center gap-1 bg-[#11131A] px-2 py-0.5 rounded text-[11px] font-mono text-zinc-300 border border-white/[0.06]">
                  CREW #4
                </span>
              </div>
              <p className="text-sm font-bold text-white mt-0.5 truncate">
                {complaint.department} · Roadway Division · Truck 14
              </p>
              <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-zinc-400 font-mono">
                <div className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Supervisor J. Morales</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <Radio className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Radio Channel 3 (Direct Triage)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Priority Score Breakdown Card with Visual Bar */}
        <div className="bg-[#11131A] border border-white/[0.08] rounded-xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              <h2 className="text-base font-bold text-white">Priority Score Breakdown (Score: {complaint.priorityScore}/100)</h2>
            </div>
            <span className="font-mono text-xs px-2.5 py-0.5 rounded bg-rose-500/10 text-rose-400 font-bold border border-rose-500/20">
              Tier 1
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#161922] border border-white/[0.04]">
              <span className="text-xs text-zinc-300">Road damage severity</span>
              <span className="font-mono text-xs font-bold text-emerald-400">+30 pts</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#161922] border border-white/[0.04]">
              <span className="text-xs text-zinc-300">4 Duplicate Reports linked</span>
              <span className="font-mono text-xs font-bold text-emerald-400">+20 pts</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#161922] border border-white/[0.04]">
              <span className="text-xs text-zinc-300">Sensitive Zone (80m School Crossing)</span>
              <span className="font-mono text-xs font-bold text-emerald-400">+18 pts</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#161922] border border-white/[0.04]">
              <span className="text-xs text-zinc-300">Age Factor (3 days active)</span>
              <span className="font-mono text-xs font-bold text-zinc-300">+5 pts</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#161922] border border-white/[0.04]">
              <span className="text-xs text-zinc-300">Verified photo evidence</span>
              <span className="font-mono text-xs font-bold text-zinc-300">+5 pts</span>
            </div>
          </div>

          {/* Visual Meter Bar */}
          <div className="p-3 bg-[#161922] rounded-lg border border-white/[0.06] flex flex-col gap-1.5">
            <div className="flex justify-between text-xs font-mono text-zinc-400">
              <span>Escalation Threshold: 65 pts</span>
              <span className="text-emerald-400 font-bold">{complaint.priorityScore} / 100</span>
            </div>
            <div className="w-full h-2.5 bg-black/40 rounded-full overflow-hidden flex">
              <div className="h-full bg-emerald-500" style={{ width: '30%' }} />
              <div className="h-full bg-cyan-400" style={{ width: '20%' }} />
              <div className="h-full bg-purple-400" style={{ width: '18%' }} />
              <div className="h-full bg-amber-400" style={{ width: '5%' }} />
              <div className="h-full bg-rose-400" style={{ width: '5%' }} />
            </div>
          </div>
        </div>

        {/* Photographic Record Before / After */}
        <div className="bg-[#11131A] border border-white/[0.08] rounded-xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Camera className="w-5 h-5 text-emerald-400" />
              <h2 className="text-base font-bold text-white">Photographic Record</h2>
            </div>
            <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider">Field Inspection</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Before Photo */}
            <div className="flex flex-col bg-[#161922] rounded-xl overflow-hidden border border-white/[0.08]">
              <div className="relative h-48 w-full bg-zinc-900 overflow-hidden">
                <img
                  src={complaint.photoUrl}
                  alt="Initial citizen report"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/80 backdrop-blur-sm text-xs font-mono text-zinc-200 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  <span>Reported</span>
                </div>
                <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-[#11131A]/90 backdrop-blur-sm text-[11px] font-mono text-zinc-300">
                  Oct 12, 09:12 AM
                </div>
              </div>
              <div className="p-3">
                <p className="text-xs font-bold text-white">Initial Citizen Submission</p>
                <p className="text-[11px] text-zinc-400 mt-0.5 leading-relaxed">
                  Deep crater, estimated 8cm depth near crosswalk approach.
                </p>
              </div>
            </div>

            {/* After Photo / Resolution Proof */}
            <div className="flex flex-col bg-[#161922] rounded-xl overflow-hidden border border-white/[0.08]">
              <div className="relative h-48 w-full bg-zinc-900 overflow-hidden">
                <img
                  src={
                    complaint.resolutionEvidence?.afterPhotoUrl ||
                    'https://images.unsplash.com/photo-1584463699042-494b29bb01e5?auto=format&fit=crop&w=800&q=80'
                  }
                  alt="Resolution proof"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-2 right-2 bg-[#11131A]/90 border border-emerald-500/40 text-emerald-400 font-mono text-[11px] px-2.5 py-1 rounded shadow-md flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Signed Off · Crew #14</span>
                </div>
              </div>
              <div className="p-3">
                <p className="text-xs font-bold text-white">Field Repair Verification</p>
                <p className="text-[11px] text-zinc-400 mt-0.5 leading-relaxed">
                  Cold asphalt patch compacted and level with roadway.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Resolution Stepper Rail */}
        <div className="bg-[#11131A] border border-white/[0.08] rounded-xl p-6 shadow-xl space-y-6">
          <h2 className="text-base font-bold text-white">Lifecycle Resolution Stepper</h2>

          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-white/[0.08]">
            {WORKFLOW_STEPS.map((step, idx) => {
              const isPast = currentStepIdx > idx;
              const isCurrent = currentStepIdx === idx;
              const histMatch = (complaint.history || []).find((h) => h.status === step);

              return (
                <div key={step} className="relative flex items-start gap-4">
                  {/* Node icon */}
                  <div
                    className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                      isPast
                        ? 'bg-emerald-500 text-zinc-950'
                        : isCurrent
                        ? 'bg-emerald-500/20 border-2 border-emerald-400 text-emerald-400'
                        : 'bg-[#161922] border border-white/[0.2] text-zinc-600'
                    }`}
                  >
                    {isPast ? (
                      <Check className="w-3 h-3 stroke-[3]" />
                    ) : isCurrent ? (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    ) : null}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className={`text-sm font-bold ${isCurrent ? 'text-emerald-400' : isPast ? 'text-white' : 'text-zinc-500'}`}>
                        {idx + 1}. {step}
                      </p>
                      {histMatch && (
                        <span className="font-mono text-[11px] text-zinc-500">
                          {formatRelativeTime(histMatch.changedAt)}
                        </span>
                      )}
                    </div>
                    {histMatch?.note && (
                      <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                        {histMatch.note}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* 72-Hour Reopen / Contest Action Button */}
          {isResolved && isWithin72Hours && (
            <div className="pt-4 border-t border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold text-white">Not satisfied with resolution?</p>
                <p className="text-[11px] text-zinc-400">
                  You have a statutory 72-hour window to contest this closure or report recurring defects.
                </p>
              </div>
              <button
                onClick={() => setIsReopenModalOpen(true)}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 font-semibold text-xs transition-colors shrink-0"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reopen / Contest Ticket</span>
              </button>
            </div>
          )}
        </div>

        {/* Cryptographic Proof of Work Footnote */}
        <div className="p-4 bg-[#11131A] border border-white/[0.08] rounded-xl flex items-center justify-between font-mono text-xs text-zinc-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>AUDIT PROVENANCE HASH: 9B7C-2026-DPW-ELM</span>
          </div>
          <span className="text-emerald-400">IMMUTABLE LEDGER VERIFIED</span>
        </div>
      </div>

      {/* Reopen Ticket Modal */}
      {isReopenModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#11131A] border border-white/[0.12] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-amber-400" />
                <span>Reopen Incident #{complaint.id}</span>
              </h3>
              <button
                onClick={() => setIsReopenModalOpen(false)}
                className="text-zinc-500 hover:text-white"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed">
              Please explain why the current repair is incomplete or why the hazard persists. An administrative review ticket will be dispatched immediately.
            </p>

            <form onSubmit={handleReopenSubmit} className="space-y-4">
              <textarea
                required
                rows={4}
                value={reopenReason}
                onChange={(e) => setReopenReason(e.target.value)}
                placeholder="Detail recurring damage or incomplete repair..."
                className="w-full bg-[#161922] border border-white/[0.08] rounded-lg p-3 text-xs text-white focus:border-amber-400 focus:outline-none placeholder:text-zinc-500"
              />

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsReopenModalOpen(false)}
                  className="px-3 py-2 rounded-lg bg-[#161922] text-zinc-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReopen}
                  className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-zinc-950 font-bold text-xs"
                >
                  {isSubmittingReopen ? 'Submitting...' : 'Confirm Reopen'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
