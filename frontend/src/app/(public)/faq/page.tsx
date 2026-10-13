'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  HelpCircle, 
  Search, 
  ChevronDown, 
  ChevronUp, 
  Sparkles, 
  Layers, 
  Award, 
  ShieldCheck, 
  ArrowRight 
} from 'lucide-react';

interface FaqItem {
  id: string;
  category: string;
  question: string;
  answer: string;
}

const FAQ_DATA: FaqItem[] = [
  {
    id: 'dup-1',
    category: 'Duplicate Handling',
    question: 'How does CivicPulse detect and cluster duplicate complaints?',
    answer: 'When a resident reports an issue, our spatial engine scans a 120-meter radius for existing complaints within the same category. Next, our neural embedding model calculates visual cosine similarity on the submitted imagery. If similarity exceeds 85%, the new report is automatically clustered into the master ticket. The citizen still gets their own distinct tracking reference, but field crews receive one unified emergency ticket to avoid redundant crew deployment.'
  },
  {
    id: 'dup-2',
    category: 'Duplicate Handling',
    question: 'Does merging my complaint as a duplicate lower its urgency?',
    answer: 'No! In fact, the opposite occurs. Every confirmed duplicate citizen report adds multiplier points to the Priority Score (up to +25 points). A pothole reported by 6 separate residents within a few hours elevates rapidly from Medium to High Priority, triggering accelerated municipal dispatch.'
  },
  {
    id: 'score-1',
    category: 'Priority Scores',
    question: 'How is the Priority Score (0 to 100) mathematically calculated?',
    answer: 'The Priority Score is calculated using a deterministic multi-factor rubric: Category Severity Base (up to 35 pts) + Duplicate Count Multiplier (up to 25 pts) + Sensitive Zone Proximity (up to 20 pts for school, hospital, and transit corridors) + Elapsed Unresolved Age (up to 15 pts) + Verified Photo EXIF data (up to 5 pts). Scores ≥ 70 are classified High, 40–69 Medium, and < 40 Low.'
  },
  {
    id: 'score-2',
    category: 'Priority Scores',
    question: 'What are the municipal response SLAs for each priority tier?',
    answer: 'High Priority (≥70) incidents trigger automated notification to on-duty crews within 30 minutes, with target field containment under 4 hours. Medium Priority (40–69) targets crew inspection within 24 hours. Low Priority (<40) issues are batched into routine bi-weekly maintenance schedules.'
  },
  {
    id: 'evid-1',
    category: 'Evidence Verification',
    question: 'What is the Resolution Evidence Card and verified "After Photo"?',
    answer: 'Before a ticket can be transitioned to "Resolved", municipal field technicians must upload high-resolution photographic proof of completed work (e.g., cleared culvert, sealed pothole, restored luminaire). Citizens can inspect this side-by-side with their original submission.'
  },
  {
    id: 'evid-2',
    category: 'Evidence Verification',
    question: 'What is the 72-Hour "Reopen Issue" protection policy?',
    answer: 'Citizens have an active 72-hour reopen window following ticket closure. If a repair fails or debris was only partially cleared, you can click "Reopen Issue" with an explanation note. The ticket is immediately elevated back to supervisory inspection without requiring you to re-file.'
  },
  {
    id: 'priv-1',
    category: 'Privacy & Data',
    question: 'Is my personal contact information displayed publicly?',
    answer: 'Never. CivicPulse strictly implements ISO 18091 and Open311 data minimization. You can file completely anonymously, or provide contact details solely for SMS dispatch updates. Names, phone numbers, and facial features captured in photos are encrypted and never shown on public map feeds.'
  }
];

export default function HelpCenterPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [expandedId, setExpandedId] = useState<string | null>('dup-1');

  const categories = ['All', 'Duplicate Handling', 'Priority Scores', 'Evidence Verification', 'Privacy & Data'];

  const filteredFaqs = FAQ_DATA.filter((item) => {
    const matchesCat = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch =
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const toggleAccordion = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-10">
      {/* Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Municipal Citizen Knowledge Base</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Frequently Asked Questions
        </h1>
        <p className="text-sm text-zinc-400 leading-relaxed">
          Find answers regarding automated AI classification, priority scoring rubrics, duplicate clustering, and verification protocols.
        </p>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-5 h-5 text-zinc-400 absolute left-4 top-3.5" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search questions by keyword (e.g. duplicate, 72 hours, priority score, after photo)..."
          className="w-full pl-12 pr-4 py-3 rounded-2xl bg-[#090A0F] border border-white/10 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-emerald-500 transition-colors shadow-lg"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-4 top-3.5 text-xs text-zinc-400 hover:text-white"
          >
            Clear
          </button>
        )}
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === cat
                ? 'bg-emerald-500 text-slate-950 shadow-[0_0_14px_rgba(16,185,129,0.3)]'
                : 'bg-[#11131A] text-zinc-400 hover:text-white border border-white/5'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Searchable Accordion List */}
      <div className="space-y-4">
        {filteredFaqs.length > 0 ? (
          filteredFaqs.map((faq) => {
            const isExpanded = expandedId === faq.id;
            return (
              <div
                key={faq.id}
                className={`rounded-2xl glass-card border transition-all ${
                  isExpanded ? 'border-emerald-500/40 bg-[#161922]' : 'border-white/[0.08] hover:border-white/20'
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleAccordion(faq.id)}
                  className="w-full p-5 sm:p-6 text-left flex items-start justify-between gap-4"
                >
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                      {faq.category}
                    </span>
                    <h3 className="text-sm sm:text-base font-bold text-white">
                      {faq.question}
                    </h3>
                  </div>

                  <div className="p-1 rounded-lg bg-white/5 text-zinc-400 shrink-0 mt-1">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-5 sm:px-6 pb-6 pt-1 border-t border-white/[0.04] text-xs sm:text-sm text-zinc-300 leading-relaxed animate-in slide-in-from-top-1">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="p-12 rounded-2xl glass-panel border border-white/10 text-center space-y-2">
            <HelpCircle className="w-8 h-8 text-zinc-500 mx-auto" />
            <h4 className="text-sm font-bold text-white">No Matching Questions Found</h4>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto">
              Try adjusting your search terms or reach out through our Contact Directory.
            </p>
          </div>
        )}
      </div>

      {/* Still need help callout */}
      <div className="p-6 rounded-2xl glass-panel border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <div>
          <span className="font-bold text-white block">Need direct municipal assistance?</span>
          <span className="text-zinc-400">Our customer relations desk is available during business hours.</span>
        </div>
        <Link
          href="/contact"
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold transition-colors"
        >
          <span>Contact Directory</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
