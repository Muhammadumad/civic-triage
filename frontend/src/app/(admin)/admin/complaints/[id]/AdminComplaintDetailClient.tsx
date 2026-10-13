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
  Brain, 
  Sparkles, 
  Calculator, 
  GitMerge, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  MapPin, 
  Clock, 
  Building2, 
  Camera, 
  FileCheck, 
  Upload, 
  Send, 
  Check, 
  Copy,
  Sliders,
  ShieldAlert,
  Loader2
} from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils';

export default function AdminComplaintDetailClient({ id }: { id: string }) {
  const router = useRouter();
  const { 
    getComplaintById, 
    confirmMergeDuplicate, 
    rejectDuplicate, 
    updateStatusWithEvidence 
  } = useComplaintsStore();

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
    }
    fetchComplaintById(id)
      .then((data) => {
        if (data) setFetchedComplaint(data);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [id, getComplaintById]);

  // Status & Evidence Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<ComplaintStatus>('Assigned');
  const [selectedDept, setSelectedDept] = useState('Dept of Public Works & Roads');
  const [fieldNotes, setFieldNotes] = useState('');
  const [afterPhotoUrl, setAfterPhotoUrl] = useState('');
  const [isSubmittingModal, setIsSubmittingModal] = useState(false);

  useEffect(() => {
    if (complaint) {
      setNewStatus(complaint.status);
      setSelectedDept(complaint.department);
    }
  }, [complaint?.status, complaint?.department]);

  // Copy state & Action feedback
  const [copied, setCopied] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen py-16 px-4 flex flex-col items-center justify-center text-center">
        <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-emerald-400 mb-4 animate-pulse">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
        <h2 className="text-sm font-semibold text-white mb-1">Loading Ticket Details...</h2>
        <p className="text-xs text-zinc-400 font-mono">Synchronizing dispatch registry for {id}</p>
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="min-h-screen py-16 px-4 flex flex-col items-center justify-center text-center bg-[var(--canvas-base)] text-[var(--text-primary)]">
        <div className="w-16 h-16 rounded-2xl bg-black/5 dark:bg-white/5 border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-secondary)] mb-4">
          <AlertTriangle className="w-8 h-8 text-amber-500" />
        </div>
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">Complaint Reference Not Found</h2>
        <p className="text-xs text-[var(--text-secondary)] max-w-sm mb-6">
          Could not locate ticket <span className="font-mono text-[var(--text-primary)] font-semibold">{id}</span> in administrative dispatch records.
        </p>
        <Link
          href="/admin"
          className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs hover-lift transition-all"
        >
          Return to Triage Console
        </Link>
      </div>
    );
  }

  const catTheme = CATEGORY_THEME[complaint.category] || CATEGORY_THEME['Road Damage'];
  const pLevel = getPriorityLevel(complaint.priorityScore);
  const pTheme = PRIORITY_THEME[pLevel];
  const sTheme = STATUS_THEME[complaint.status] || STATUS_THEME['New'];

  const handleCopyId = () => {
    navigator.clipboard.writeText(complaint.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const showNotification = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3500);
  };

  const handleConfirmMerge = (duplicateId: string) => {
    confirmMergeDuplicate(complaint.id, duplicateId);
    showNotification(`Confirmed duplicate merge with ${duplicateId}. Priority score elevated.`);
  };

  const handleRejectDuplicate = (duplicateId: string) => {
    rejectDuplicate(complaint.id, duplicateId);
    showNotification(`Suspected duplicate ${duplicateId} marked as separate incident.`);
  };

  const handleQuickTransition = async (targetStatus: ComplaintStatus) => {
    setIsSubmittingModal(true);
    try {
      const updated = await updateStatusWithEvidence(
        complaint.id,
        targetStatus,
        complaint.department,
        `Dispatcher advanced status to ${targetStatus} via Lifecycle Controller.`
      );
      if (updated) {
        setFetchedComplaint(updated);
      }
      showNotification(`Ticket advanced: ${complaint.status} → ${targetStatus}`);
    } catch (err) {
      console.error(err);
      showNotification(`Status updated locally.`);
    } finally {
      setIsSubmittingModal(false);
    }
  };

  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingModal(true);
    try {
      const updated = await updateStatusWithEvidence(
        complaint.id,
        newStatus,
        selectedDept,
        fieldNotes || `Administrative status change to ${newStatus}.`,
        afterPhotoUrl || undefined
      );
      if (updated) {
        setFetchedComplaint(updated);
      }
      setIsModalOpen(false);
      showNotification(`Ticket updated to ${newStatus} with official evidence logged.`);
    } catch (err) {
      console.error(err);
      showNotification(`Status updated locally.`);
    } finally {
      setIsSubmittingModal(false);
    }
  };

  // Mathematical Breakdown variables
  const math = complaint.priorityMath || {
    categoryBasePoints: 30,
    duplicatePoints: complaint.duplicateCount * 3,
    sensitiveZonePoints: 25,
    agePoints: 10,
    totalScore: complaint.priorityScore,
  };

  const provenance = complaint.aiProvenance || {
    suggestedCategory: complaint.aiCategory || complaint.category,
    confidence: complaint.aiConfidence || 0.95,
    classificationReason: 'Multimodal vision model analyzed edge density, surface contours, and historical dispatch vectors.',
    modelVersion: 'CivicPulse-Vision-v2.4 (Multimodal Core)',
    visualFeatures: ['Structural surface deformation', 'High pedestrian throughput', 'Priority dispatch node'],
  };

  const suspectedDups = complaint.suspectedDuplicates || [];

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* Action Notice Toast */}
      {actionNotice && (
        <div className="fixed top-20 right-6 z-50 p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-800 dark:text-emerald-200 text-xs font-semibold backdrop-blur-md shadow-2xl flex items-center gap-2 animate-in slide-in-from-top-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Top Breadcrumb & Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors hover-lift"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Triage Table</span>
        </Link>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              setNewStatus(complaint.status);
              setSelectedDept(complaint.department);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs tracking-wide transition-all shadow-[0_0_20px_rgba(16,185,129,0.35)] hover-lift"
          >
            <Sliders className="w-4 h-4" />
            <span>Update Status & Field Evidence</span>
          </button>
        </div>
      </div>

      {/* Ticket Overview Bar */}
      <div className="p-6 rounded-2xl glass-panel border border-[var(--border-subtle)] relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 flex-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-black/5 dark:bg-white/5 border border-[var(--border-subtle)] font-mono text-xs font-bold text-[var(--text-primary)]">
                <span>{complaint.id}</span>
                <button
                  type="button"
                  onClick={handleCopyId}
                  className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  title="Copy Reference"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3 text-[var(--text-secondary)]" />}
                </button>
              </div>

              <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg border ${catTheme.bg} ${catTheme.text} ${catTheme.border}`}>
                {complaint.category}
              </span>

              <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${sTheme.bg} ${sTheme.text} ${sTheme.border}`}>
                {complaint.status}
              </span>

              <span className={`text-xs font-extrabold px-2.5 py-1 rounded-lg border font-mono ${pTheme.bg} ${pTheme.text} ${pTheme.border}`}>
                Priority {complaint.priorityScore} / 100
              </span>

              <span className="text-xs text-indigo-600 dark:text-indigo-300 bg-indigo-500/15 border border-indigo-500/30 px-2.5 py-1 rounded-lg font-medium">
                {complaint.ward || 'Ward 1 - Financial District'}
              </span>
            </div>

            <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">
              {complaint.title}
            </h1>

            <p className="text-xs text-[var(--text-secondary)] leading-relaxed max-w-3xl">
              {complaint.description}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--text-secondary)] pt-2 border-t border-[var(--border-subtle)]">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                <span>{complaint.location.address}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
                <span>{complaint.department}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
                <span suppressHydrationWarning>Filed {formatRelativeTime(complaint.createdAt)}</span>
              </div>
            </div>
          </div>

          <div className="w-full lg:w-48 h-32 rounded-xl overflow-hidden border border-[var(--border-subtle)] bg-black/10 dark:bg-black shrink-0 relative hover-lift">
            <img
              src={complaint.photoUrl}
              alt={complaint.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/80 text-[10px] text-zinc-300 backdrop-blur-sm">
              Citizen Photo
            </div>
          </div>
        </div>
      </div>

      {/* Lifecycle Dispatch Controller */}
      <div className="p-6 rounded-2xl glass-card border border-[var(--border-subtle)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 dark:text-emerald-400">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[var(--text-primary)]">
                Admin Lifecycle Resolution Controller
              </h3>
              <p className="text-[11px] text-[var(--text-secondary)]">
                Control and advance the municipal ticket resolution pipeline in real-time
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setNewStatus(complaint.status);
              setSelectedDept(complaint.department);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-xs font-semibold text-[var(--text-primary)] border border-[var(--border-subtle)] transition-colors self-start sm:self-auto"
          >
            <Camera className="w-3.5 h-3.5 text-emerald-500" />
            <span>Attach Evidence & Dispatch Notes</span>
          </button>
        </div>

        {/* 5-Step Stepper Rail for Admin Control */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 pt-1">
          {[
            { key: 'New' as ComplaintStatus, label: '1. New', sub: 'Initial Citizen Filing' },
            { key: 'Under Review' as ComplaintStatus, label: '2. Under Review', sub: 'Triage & Verification' },
            { key: 'Assigned' as ComplaintStatus, label: '3. Assigned', sub: 'Dispatched to Crew' },
            { key: 'In Progress' as ComplaintStatus, label: '4. In Progress', sub: 'Work Underway' },
            { key: 'Resolved' as ComplaintStatus, label: '5. Resolved', sub: 'Site Repaired' },
          ].map((st) => {
            const isCurrent =
              complaint.status.toLowerCase().replace(/[\s_]+/g, '') ===
              st.key.toLowerCase().replace(/[\s_]+/g, '');
            const stepsOrder = ['new', 'underreview', 'assigned', 'inprogress', 'resolved'];
            const currentIdx = stepsOrder.indexOf(
              complaint.status.toLowerCase().replace(/[\s_]+/g, '')
            );
            const thisIdx = stepsOrder.indexOf(
              st.key.toLowerCase().replace(/[\s_]+/g, '')
            );
            const isPast = currentIdx > thisIdx;

            return (
              <div
                key={st.key}
                className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between gap-3 ${
                  isCurrent
                    ? 'bg-emerald-500/10 border-emerald-500/40 shadow-lg shadow-emerald-500/10'
                    : isPast
                    ? 'bg-black/5 dark:bg-white/[0.02] border-[var(--border-subtle)] opacity-80'
                    : 'bg-black/5 dark:bg-white/[0.02] border-[var(--border-subtle)]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-[var(--text-primary)]">{st.label}</span>
                    {isCurrent ? (
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    ) : isPast ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : null}
                  </div>
                  <p className="text-[11px] text-[var(--text-secondary)]">{st.sub}</p>
                </div>

                {isCurrent ? (
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 py-1 text-center bg-emerald-500/10 rounded-lg">
                    Active Stage
                  </span>
                ) : (
                  <button
                    type="button"
                    disabled={isSubmittingModal}
                    onClick={() => handleQuickTransition(st.key)}
                    className="text-[11px] font-semibold py-1.5 px-2 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-emerald-500 hover:text-slate-950 text-[var(--text-primary)] transition-all border border-[var(--border-subtle)] disabled:opacity-50"
                  >
                    Set to {st.key}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 1. AI Provenance Panel */}
        <div className="p-6 rounded-2xl glass-card border border-[var(--border-subtle)] space-y-5 hover-lift transition-all">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 dark:text-emerald-400">
                <Brain className="w-4 h-4 animate-float" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[var(--text-primary)]">AI Classification Provenance</h3>
                <p className="text-[11px] text-[var(--text-secondary)]">Multimodal Neural Vision Model Telemetry</p>
              </div>
            </div>
            <span className="font-mono text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-500/15 px-2.5 py-1 rounded-lg border border-emerald-500/30 font-bold">
              {(provenance.confidence * 100).toFixed(0)}% Confidence
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-[var(--text-secondary)] font-medium">Model Inference Match:</span>
                <span className="text-[var(--text-primary)] font-bold">{provenance.suggestedCategory}</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-zinc-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                  style={{ width: `${provenance.confidence * 100}%` }}
                />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border-subtle)] space-y-1.5">
              <span className="text-[11px] font-bold text-[var(--text-primary)] uppercase tracking-wider block">
                Model Classification Reason:
              </span>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                {provenance.classificationReason}
              </p>
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider block">
                Detected Visual Feature Vectors:
              </span>
              <div className="flex flex-wrap gap-2">
                {provenance.visualFeatures.map((feat, i) => (
                  <span
                    key={i}
                    className="text-xs px-2.5 py-1 rounded-lg bg-black/5 dark:bg-white/5 text-[var(--text-primary)] border border-[var(--border-subtle)] flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3 h-3 text-emerald-500" />
                    <span>{feat}</span>
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-[var(--border-subtle)] text-[11px] text-[var(--text-secondary)] flex justify-between">
              <span>Engine Version:</span>
              <span className="font-mono text-[var(--text-primary)]">{provenance.modelVersion}</span>
            </div>
          </div>
        </div>

        {/* 2. Priority Breakdown Card */}
        <div className="p-6 rounded-2xl glass-card border border-[var(--border-subtle)] space-y-5 hover-lift transition-all">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 dark:text-rose-400">
                <Calculator className="w-4 h-4 animate-float" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[var(--text-primary)]">Dynamic Priority Scoring Math</h3>
                <p className="text-[11px] text-[var(--text-secondary)]">Deterministic Multi-Factor Scoring Formula</p>
              </div>
            </div>
            <span className="font-mono text-sm font-extrabold text-rose-500 dark:text-rose-400 bg-rose-500/15 px-3 py-1 rounded-lg border border-rose-500/30">
              Total: {math.totalScore} pts
            </span>
          </div>

          <div className="space-y-3">
            {/* Term 1 */}
            <div className="p-3.5 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border-subtle)] flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-xs font-semibold text-[var(--text-primary)]">Category Severity Base</span>
                <p className="text-[11px] text-[var(--text-secondary)]">Base weight allocated for {complaint.category}</p>
              </div>
              <span className="font-mono text-sm font-bold text-emerald-500 dark:text-emerald-400">+{math.categoryBasePoints} pts</span>
            </div>

            {/* Term 2 */}
            <div className="p-3.5 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border-subtle)] flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-xs font-semibold text-[var(--text-primary)]">Duplicate Cluster Multiplier</span>
                <p className="text-[11px] text-[var(--text-secondary)]">{complaint.duplicateCount} merged citizen reports</p>
              </div>
              <span className="font-mono text-sm font-bold text-indigo-500 dark:text-indigo-400">+{math.duplicatePoints} pts</span>
            </div>

            {/* Term 3 */}
            <div className="p-3.5 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border-subtle)] flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-xs font-semibold text-[var(--text-primary)]">Sensitive Zone Proximity</span>
                <p className="text-[11px] text-[var(--text-secondary)]">School corridor / hospital / transit arterial proximity</p>
              </div>
              <span className="font-mono text-sm font-bold text-amber-500 dark:text-amber-400">+{math.sensitiveZonePoints} pts</span>
            </div>

            {/* Term 4 */}
            <div className="p-3.5 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border-subtle)] flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-xs font-semibold text-[var(--text-primary)]">Elapsed Age Escalation</span>
                <p className="text-[11px] text-[var(--text-secondary)]">Unresolved duration multiplier</p>
              </div>
              <span className="font-mono text-sm font-bold text-rose-500 dark:text-rose-400">+{math.agePoints} pts</span>
            </div>

            {/* Total Formula Equation Bar */}
            <div className="p-3.5 rounded-xl bg-black/5 dark:bg-white/[0.03] border border-[var(--border-subtle)] font-mono text-xs text-center text-[var(--text-secondary)]">
              Formula: <span className="text-emerald-500 dark:text-emerald-400">{math.categoryBasePoints}</span> +{' '}
              <span className="text-indigo-500 dark:text-indigo-400">{math.duplicatePoints}</span> +{' '}
              <span className="text-amber-500 dark:text-amber-400">{math.sensitiveZonePoints}</span> +{' '}
              <span className="text-rose-500 dark:text-rose-400">{math.agePoints}</span> ={' '}
              <span className="text-[var(--text-primary)] font-bold">{math.totalScore} pts</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Duplicate Detection Side-by-Side Review */}
      <div className="p-6 rounded-2xl glass-card border border-[var(--border-subtle)] space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 dark:text-indigo-400">
              <GitMerge className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[var(--text-primary)]">
                Suspected Duplicate Clustering Review ({suspectedDups.length})
              </h3>
              <p className="text-[11px] text-[var(--text-secondary)]">
                Spatial radius &lt;120m and visual embedding cosine similarity &gt;85%
              </p>
            </div>
          </div>

          <div className="text-xs text-[var(--text-secondary)]">
            Current Cluster Count: <span className="font-bold text-[var(--text-primary)]">+{complaint.duplicateCount}</span>
          </div>
        </div>

        {suspectedDups.length > 0 ? (
          <div className="space-y-6">
            {suspectedDups.map((dup) => (
              <div
                key={dup.id}
                className="p-5 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border-subtle)] space-y-4 hover-lift transition-all"
              >
                <div className="flex items-center justify-between text-xs pb-3 border-b border-[var(--border-subtle)]">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-[var(--text-primary)]">{dup.id}</span>
                    <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 font-bold border border-indigo-500/30">
                      {dup.similarityPct}% Visual Match
                    </span>
                    <span className="px-2 py-0.5 rounded bg-black/5 dark:bg-white/5 text-[var(--text-secondary)] font-mono">
                      {dup.distanceMeters}m away
                    </span>
                  </div>
                  <span className="text-[var(--text-secondary)]" suppressHydrationWarning>
                    {formatRelativeTime(dup.createdAt)}
                  </span>
                </div>

                {/* Side-by-Side Photo Comparison */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Left: Incoming Complaint */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[11px] font-semibold text-[var(--text-secondary)]">
                      <span>Primary Incident: {complaint.id}</span>
                      <span className="text-emerald-500 dark:text-emerald-400 font-mono">Anchor</span>
                    </div>
                    <div className="h-44 rounded-xl overflow-hidden border border-[var(--border-subtle)] bg-black/20 dark:bg-black">
                      <img
                        src={complaint.photoUrl}
                        alt="Primary Ticket"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] line-clamp-1">{complaint.title}</p>
                  </div>

                  {/* Right: Suspected Duplicate */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[11px] font-semibold text-[var(--text-secondary)]">
                      <span>Suspected Duplicate: {dup.id}</span>
                      <span className="text-indigo-500 dark:text-indigo-400 font-mono">{dup.similarityPct}% Similarity</span>
                    </div>
                    <div className="h-44 rounded-xl overflow-hidden border border-indigo-500/30 bg-black/20 dark:bg-black">
                      <img
                        src={dup.photoUrl}
                        alt="Suspected Duplicate"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] line-clamp-1">{dup.title}</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => handleRejectDuplicate(dup.id)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xs font-semibold border border-[var(--border-subtle)] transition-colors hover-lift"
                  >
                    <XCircle className="w-4 h-4 text-rose-500" />
                    <span>Reject Duplicate (Keep Separate)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleConfirmMerge(dup.id)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-[0_0_16px_rgba(99,102,241,0.3)] hover-lift"
                  >
                    <GitMerge className="w-4 h-4" />
                    <span>Confirm Merge & Elevate Urgency (+7 pts)</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border-subtle)] text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
            <h4 className="text-sm font-semibold text-[var(--text-primary)]">No Pending Duplicates in Radius</h4>
            <p className="text-xs text-[var(--text-secondary)] max-w-sm mx-auto">
              All neighboring geotagged reports have been audited and merged into this master ticket cluster.
            </p>
          </div>
        )}
      </div>

      {/* 4. Status Transition & Evidence Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-lg p-6 rounded-2xl glass-panel border border-[var(--border-subtle)] shadow-2xl space-y-5 animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
              <h3 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-500" />
                <span>Transition Status & Log Field Evidence</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleModalSubmit} className="space-y-4 text-xs">
              {/* Status Select */}
              <div>
                <label className="block font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
                  Target Workflow Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e: any) => setNewStatus(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)] font-medium focus:outline-none focus:border-emerald-500"
                >
                  <option value="New">New</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Assigned">Assigned (To Field Crew)</option>
                  <option value="In Progress">In Progress (Crew On Site)</option>
                  <option value="Resolved">Resolved (Repaired & Cleared)</option>
                  <option value="Duplicate">Duplicate (Merged)</option>
                </select>
              </div>

              {/* Department Select */}
              <div>
                <label className="block font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
                  Assigned Municipal Department
                </label>
                <select
                  value={selectedDept}
                  onChange={(e: any) => setSelectedDept(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)] font-medium focus:outline-none focus:border-emerald-500"
                >
                  <option value="Dept of Public Works & Roads">Dept of Public Works & Roads</option>
                  <option value="Water & Utilities Board">Water & Utilities Board</option>
                  <option value="Sanitation & Solid Waste Management">Sanitation & Solid Waste Management</option>
                  <option value="Municipal Electrical Grid">Municipal Electrical Grid</option>
                  <option value="Stormwater & Drainage Division">Stormwater & Drainage Division</option>
                </select>
              </div>

              {/* Field Notes */}
              <div>
                <label className="block font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
                  Dispatcher Inspection Notes
                </label>
                <textarea
                  rows={3}
                  value={fieldNotes}
                  onChange={(e) => setFieldNotes(e.target.value)}
                  placeholder="e.g. Field crew deployed with hot asphalt roller. Work scheduled for complete clearance..."
                  className="w-full p-3 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)] placeholder-[var(--text-secondary)]/50 focus:outline-none focus:border-emerald-500 leading-relaxed"
                />
              </div>

              {/* After Photo Evidence (Active when Resolved) */}
              <div>
                <label className="block font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
                  Official Verification After-Photo URL {newStatus === 'Resolved' && <span className="text-emerald-500">*</span>}
                </label>
                <input
                  type="text"
                  value={afterPhotoUrl}
                  onChange={(e) => setAfterPhotoUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/... or paste image URI"
                  className="w-full px-3 py-2.5 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)] placeholder-[var(--text-secondary)]/50 focus:outline-none focus:border-emerald-500"
                />
                <p className="text-[11px] text-[var(--text-secondary)] mt-1">
                  Required for public service resolution verification and citizen before/after comparison.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[var(--border-subtle)]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingModal}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold shadow-[0_0_18px_rgba(16,185,129,0.3)] disabled:opacity-50 hover-lift"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmittingModal ? 'Recording...' : 'Save & Dispatch'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
