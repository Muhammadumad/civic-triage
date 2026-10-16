'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  AlertTriangle, 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  Send, 
  Building2, 
  Flame, 
  ShieldAlert, 
  ExternalLink,
  HelpCircle,
  FileText
} from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    ward: '',
    topic: '',
    complaintId: '',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setFormData({
        fullName: '',
        email: '',
        ward: '',
        topic: '',
        complaintId: '',
        message: '',
      });
    }, 700);
  };

  return (
    <div className="min-h-screen bg-[var(--canvas-base)] text-[var(--text-primary)] py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-6xl mx-auto flex flex-col gap-8 animate-fade-in-up">
        {/* 1. Breadcrumb navigation */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-mono text-[var(--text-muted)]">
          <Link href="/" className="hover:text-[var(--accent-primary)] transition-colors">Home</Link>
          <span>/</span>
          <span className="text-[var(--accent-primary)] font-semibold">Contact & Public Safety Directory</span>
        </nav>

        {/* 2. Top Urgent Safety Notice */}
        <section className="w-full bg-[var(--accent-primary-subtle)] border border-[var(--accent-primary-border)] rounded-md p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--accent-primary)] mt-2 shrink-0" />
            <div className="flex flex-col">
              <h2 className="font-editorial text-2xl text-[var(--accent-primary)]">
                Notice: Not for Immediate Life-Safety Emergencies
              </h2>
              <p className="text-sm text-[var(--text-secondary)] mt-1 max-w-3xl leading-relaxed">
                CivicPulse processes non-emergency urban maintenance requests. If you are reporting a gas leak, fire, active flooding inside structures, or an accident involving injuries, contact emergency services immediately.
              </p>
            </div>
          </div>

          {/* Emergency Numbers Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border border-[var(--accent-primary-border)] bg-[var(--surface-card)] divide-y sm:divide-y-0 sm:divide-x divide-[var(--border-subtle)] rounded-sm mt-4 overflow-hidden tabular-nums">
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-xs uppercase font-mono font-bold text-[var(--text-muted)]">Police Rescue</span>
              <span className="text-sm font-mono font-bold text-[var(--accent-primary)]">911 / 15</span>
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-xs uppercase font-mono font-bold text-[var(--text-muted)]">Fire & Rescue</span>
              <span className="text-sm font-mono font-bold text-[var(--accent-primary)]">16</span>
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-xs uppercase font-mono font-bold text-[var(--text-muted)]">Ambulance Corps</span>
              <span className="text-sm font-mono font-bold text-[var(--accent-primary)]">1122</span>
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-xs uppercase font-mono font-bold text-[var(--text-muted)]">Gas Hazard Line</span>
              <span className="text-sm font-mono font-bold text-[var(--accent-primary)]">1199</span>
            </div>
          </div>
        </section>

        {/* 3. Main Section: Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Citizen Inquiry Form (~60%) */}
          <section className="lg:col-span-7 flex flex-col bg-[var(--surface-card)] border border-[var(--border-subtle)] rounded-md p-6 sm:p-8">
            <header className="mb-6">
              <h1 className="font-editorial text-3xl text-[var(--text-primary)] tracking-tight">
                General Inquiries & Municipal Feedback
              </h1>
              <p className="text-sm text-[var(--text-secondary)] mt-1">
                Submit questions regarding open tickets, municipal service policies, or platform technical feedback.
              </p>
            </header>

            {isSubmitted && (
              <div className="mb-6 p-4 rounded-sm bg-[var(--surface-secondary)] border border-[var(--border-strong)] text-[var(--status-resolved)] text-sm flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <div>
                  <strong>Ticket logged: #INQ-2026-781</strong>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">Your inquiry has been queued for departmental review. A response will be dispatched within 24 business hours.</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-mono uppercase tracking-wider font-semibold text-[var(--text-primary)]">
                    Full Name <span className="text-[var(--accent-primary)]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="Jane Doe"
                    className="w-full bg-[var(--surface-elevated)] border border-[var(--border-subtle)] rounded-sm px-3.5 py-2.5 text-sm text-[var(--text-primary)] focus:border-[var(--accent-primary)] focus:outline-none placeholder:text-[var(--text-muted)]/50 transition-colors"
                  />
                </div>

                {/* Email Address */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-mono uppercase tracking-wider font-semibold text-[var(--text-primary)]">
                    Email Address <span className="text-[var(--accent-primary)]">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="citizen@domain.gov"
                    className="w-full bg-[var(--surface-elevated)] border border-[var(--border-subtle)] rounded-sm px-3.5 py-2.5 text-sm text-[var(--text-primary)] focus:border-[var(--accent-primary)] focus:outline-none placeholder:text-[var(--text-muted)]/50 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Ward / District */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-mono uppercase tracking-wider font-semibold text-[var(--text-primary)]">
                    Ward / District <span className="text-[var(--accent-primary)]">*</span>
                  </label>
                  <select
                    required
                    value={formData.ward}
                    onChange={(e) => setFormData({ ...formData, ward: e.target.value })}
                    className="w-full bg-[var(--surface-elevated)] border border-[var(--border-subtle)] rounded-sm px-3 py-2.5 text-sm text-[var(--text-primary)] focus:border-[var(--accent-primary)] focus:outline-none transition-colors"
                  >
                    <option value="" disabled>Select jurisdiction</option>
                    <option value="ward_1">Ward 1 (Central)</option>
                    <option value="ward_2">Ward 2 (East)</option>
                    <option value="ward_3">Ward 3 (West)</option>
                    <option value="ward_4">Ward 4 (North Elmwood)</option>
                    <option value="ward_5">Ward 5 (South)</option>
                  </select>
                </div>

                {/* Inquiry Topic */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-mono uppercase tracking-wider font-semibold text-[var(--text-primary)]">
                    Inquiry Topic <span className="text-[var(--accent-primary)]">*</span>
                  </label>
                  <select
                    required
                    value={formData.topic}
                    onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                    className="w-full bg-[var(--surface-elevated)] border border-[var(--border-subtle)] rounded-sm px-3 py-2.5 text-sm text-[var(--text-primary)] focus:border-[var(--accent-primary)] focus:outline-none transition-colors"
                  >
                    <option value="" disabled>Select classification</option>
                    <option value="complaint_followup">Complaint Follow-up</option>
                    <option value="system_defect">System Defect</option>
                    <option value="dept_partnership">Department Partnership</option>
                    <option value="records_foia">Records & FOIA</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              {/* Related Complaint ID */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono uppercase tracking-wider font-semibold text-[var(--text-primary)]">
                    Related Complaint ID
                  </label>
                  <span className="text-[10px] font-mono text-[var(--text-muted)]">Optional</span>
                </div>
                <input
                  type="text"
                  value={formData.complaintId}
                  onChange={(e) => setFormData({ ...formData, complaintId: e.target.value })}
                  placeholder="e.g. CP-2026-9041"
                  className="w-full bg-[var(--surface-elevated)] border border-[var(--border-subtle)] rounded-sm px-3.5 py-2.5 text-sm font-mono text-[var(--text-primary)] focus:border-[var(--accent-primary)] focus:outline-none placeholder:text-[var(--text-muted)]/50 transition-colors"
                />
              </div>

              {/* Message Body */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-mono uppercase tracking-wider font-semibold text-[var(--text-primary)]">
                  Message Body <span className="text-[var(--accent-primary)]">*</span>
                </label>
                <textarea
                  required
                  rows={5}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Please describe your inquiry or detail the maintenance ticket in question..."
                  className="w-full bg-[var(--surface-elevated)] border border-[var(--border-subtle)] rounded-sm p-3 text-sm text-[var(--text-primary)] focus:border-[var(--accent-primary)] focus:outline-none placeholder:text-[var(--text-muted)]/50 resize-y transition-colors"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="stitch-btn-primary inline-flex items-center justify-center gap-2 disabled:opacity-50 text-sm py-3 px-6 rounded-sm cursor-pointer"
                >
                  <span>{isSubmitting ? 'Transmitting...' : 'Submit Inquiry'}</span>
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          </section>

          {/* Right Column: Municipal Directory & Operations (~40%) */}
          <aside className="lg:col-span-5 flex flex-col bg-[var(--surface-card)] border border-[var(--border-subtle)] rounded-md p-6 sm:p-8 gap-6">
            <div className="flex items-start justify-between pb-4 border-b border-[var(--border-subtle)]">
              <div>
                <h2 className="font-editorial text-2xl text-[var(--text-primary)]">
                  Municipal Service Center
                </h2>
                <p className="text-xs font-mono text-[var(--text-muted)] uppercase mt-0.5">
                  Directorate of Urban Infrastructure & Citizen Operations
                </p>
              </div>
              <Building2 className="w-6 h-6 text-[var(--accent-primary)] shrink-0" />
            </div>

            <div className="flex flex-col gap-4 text-sm">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[var(--accent-primary)] shrink-0 mt-1" />
                <div>
                  <strong className="text-[var(--text-primary)] block">City Hall Operations Annex</strong>
                  <p className="text-xs text-[var(--text-secondary)]">410 Metro Boulevard, Suite 300<br />Municipal Core, MC 02110</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-[var(--accent-primary)] shrink-0 mt-1" />
                <div>
                  <strong className="text-[var(--text-primary)] block">Intake & Public Window Hours</strong>
                  <p className="text-xs text-[var(--text-secondary)]">Monday – Friday: 08:00 – 17:00 EST<br />Dispatch Telemetry: 24/7 Automated</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-[var(--accent-primary)] shrink-0 mt-1" />
                <div>
                  <strong className="text-[var(--text-primary)] block">Department Hotlines</strong>
                  <div className="text-xs text-[var(--text-secondary)] mt-1 space-y-1 font-mono tabular-nums">
                    <p>Public Works: <span className="text-[var(--text-primary)] font-semibold">(555) 019-4821</span></p>
                    <p>Sanitation Bureau: <span className="text-[var(--text-primary)] font-semibold">(555) 019-4822</span></p>
                    <p>Water Authority: <span className="text-[var(--text-primary)] font-semibold">(555) 019-4823</span></p>
                    <p>Electrical Grid: <span className="text-[var(--text-primary)] font-semibold">(555) 019-4824</span></p>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-[var(--accent-primary)] shrink-0 mt-1" />
                <div>
                  <strong className="text-[var(--text-primary)] block">Direct Inquiries</strong>
                  <p className="text-xs font-mono text-[var(--accent-primary)] mt-0.5">ops-dispatch@civicpulse.gov</p>
                </div>
              </div>
            </div>

            {/* Quick Link Card */}
            <div className="p-4 rounded-sm bg-[var(--surface-elevated)] border border-[var(--border-subtle)] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[var(--accent-primary)]" />
                <span className="text-xs font-semibold text-[var(--text-primary)]">FOIA & Public Records Desk</span>
              </div>
              <Link href="/faq" className="text-xs font-mono font-bold text-[var(--accent-primary)] hover:underline">
                View FAQs →
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
