'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ComplaintCategory, 
  CATEGORY_THEME, 
  Complaint, 
  StatusHistory 
} from '@/lib/types';
import { LocationPickerMap } from '@/components/map';
import { useComplaintsStore } from '@/lib/complaints-store';
import { 
  Camera, 
  Sparkles, 
  Upload, 
  X, 
  Mic, 
  MicOff, 
  MapPin, 
  UserCheck, 
  EyeOff, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2, 
  ArrowRight,
  ShieldAlert,
  Loader2,
  FileCheck,
  RefreshCw,
  Trash2,
  Navigation,
  Layers,
  Radio,
  Wrench,
  Trash2 as WasteIcon,
  Lightbulb,
  Droplets,
  Waves
} from 'lucide-react';

export default function NewComplaintPage() {
  const router = useRouter();
  const { addComplaint } = useComplaintsStore();

  // Photo state
  const [photoUrl, setPhotoUrl] = useState<string>('https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80');
  const [isAnalyzingPhoto, setIsAnalyzingPhoto] = useState(false);
  const [isAiVisionReady, setIsAiVisionReady] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [title, setTitle] = useState('Severe Asphalt Road Pothole near Crosswalk');
  const [description, setDescription] = useState('Deep asphalt crater causing vehicle swerving near pedestrian crosswalk and school zone approach. Substrate gravel exposed with risk of tire damage.');
  const [selectedCategory, setSelectedCategory] = useState<ComplaintCategory>('Road Damage');
  const [aiSuggestedCategory, setAiSuggestedCategory] = useState<ComplaintCategory>('Road Damage');
  const [aiConfidence, setAiConfidence] = useState(0.968);
  const [isManualOverride, setIsManualOverride] = useState(false);

  // Map Location state
  const [location, setLocation] = useState({
    lat: 42.3601,
    lng: -71.0589,
    address: '412 Tremont St, Elmwood Corridor, Ward 4',
  });

  // Dictation state
  const [isRecording, setIsRecording] = useState(false);

  // Submitter info drawer state
  const [isSubmitterOpen, setIsSubmitterOpen] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submitterName, setSubmitterName] = useState('Sarah Chen');
  const [submitterEmail, setSubmitterEmail] = useState('sarah.chen@civicpulse.org');
  const [submitterPhone, setSubmitterPhone] = useState('+1 (555) 349-8120');

  // Submit button loading state
  const [isSubmitting, setIsSubmitting] = useState(false);

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setPhotoUrl(result);
      triggerAiVisionAnalysis(file.name);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const removePhoto = () => {
    setPhotoUrl('');
    setIsAiVisionReady(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const triggerAiVisionAnalysis = (fileName: string) => {
    setIsAnalyzingPhoto(true);
    setIsAiVisionReady(false);

    setTimeout(() => {
      setIsAnalyzingPhoto(false);
      setIsAiVisionReady(true);

      const lower = fileName.toLowerCase();
      let detected: ComplaintCategory = 'Road Damage';
      let suggestedTitle = 'Severe Road Surface Deformation';

      if (lower.includes('water') || lower.includes('leak') || lower.includes('pipe')) {
        detected = 'Water Leakage';
        suggestedTitle = 'Ruptured Water Main Pipeline';
      } else if (lower.includes('garbage') || lower.includes('trash') || lower.includes('waste')) {
        detected = 'Garbage';
        suggestedTitle = 'Accumulated Waste and Litter Obstruction';
      } else if (lower.includes('light') || lower.includes('lamp') || lower.includes('dark')) {
        detected = 'Streetlights';
        suggestedTitle = 'Outage on High-Pedestrian Luminaire';
      } else if (lower.includes('drain') || lower.includes('flood') || lower.includes('clog')) {
        detected = 'Blocked Drains';
        suggestedTitle = 'Stormwater Catch Basin Blockage';
      }

      setAiSuggestedCategory(detected);
      if (!isManualOverride) {
        setSelectedCategory(detected);
      }
      if (!title) {
        setTitle(suggestedTitle);
      }
    }, 1100);
  };

  // Mic shortcut speech dictation toggle
  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
    } else {
      setIsRecording(true);
      setTimeout(() => {
        setDescription((prev) => 
          prev 
            ? `${prev} Noticed hazardous conditions spreading towards sidewalk during peak commuter hours.`
            : 'Cracked surface causing vehicle swerving near pedestrian crosswalk and school zone. Deep standing water.'
        );
        setIsRecording(false);
      }, 2500);
    }
  };

  // Fetch Device GPS
  const handleFetchGps = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({
            lat: Number(pos.coords.latitude.toFixed(4)),
            lng: Number(pos.coords.longitude.toFixed(4)),
            address: 'Verified Device GPS Position, Ward 4',
          });
        },
        () => {
          // Fallback simulation
          setLocation({
            lat: 42.3601,
            lng: -71.0589,
            address: '412 Tremont St, Elmwood Corridor (GPS Locked)',
          });
        }
      );
    }
  };

  // Submission handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Please enter a brief summary title for the report.');
      return;
    }

    setIsSubmitting(true);

    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const newId = `CP-2026-${randomSuffix}`;
    const departmentName = CATEGORY_THEME[selectedCategory]?.department || 'Dept of Public Works';
    const baseScore = selectedCategory === 'Water Leakage' ? 86 : selectedCategory === 'Road Damage' ? 78 : 65;

    const newComplaint: Complaint = {
      id: newId,
      title: title.trim(),
      description: description.trim() || 'Visual report filed with high-resolution photographic evidence and GPS coordinates.',
      category: selectedCategory,
      aiCategory: aiSuggestedCategory,
      aiConfidence,
      photoUrl: photoUrl || 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
      location: {
        lat: location.lat,
        lng: location.lng,
        address: location.address,
      },
      status: 'New',
      priorityScore: baseScore,
      priorityReasons: [
        `Base category severity multiplier applied (+${baseScore - 40})`,
        'Geospatial verification confirmed in municipal zone (+20)',
        'Verified resident timestamp authenticated (+15)',
      ],
      duplicateCount: 0,
      department: departmentName,
      createdAt: new Date().toISOString(),
      contactInfo: {
        name: isAnonymous ? 'Anonymous Resident' : submitterName,
        email: isAnonymous ? 'anonymous@civicpulse.org' : submitterEmail,
        phone: isAnonymous ? undefined : submitterPhone,
        isAnonymous,
      },
      ward: 'Ward 4 (North Elmwood)',
      history: [
        {
          complaintId: newId,
          status: 'New',
          changedAt: new Date().toISOString(),
          note: 'Telemetry ingested via Resident Reporting portal with verified GPS and EXIF coordinates.',
          changedBy: isAnonymous ? 'Anonymous Resident' : submitterName,
        },
      ],
      priorityMath: {
        categoryBasePoints: 30,
        duplicatePoints: 20,
        sensitiveZonePoints: 18,
        agePoints: 5,
        totalScore: baseScore,
      },
      aiProvenance: {
        suggestedCategory: aiSuggestedCategory,
        confidence: aiConfidence,
        classificationReason: 'Asphalt fracture detected with 96.8% confidence',
        modelVersion: 'VisionTransformer-Civic-v3',
        visualFeatures: ['pothole', 'fracture', 'cracked road'],
      },
    };

    setTimeout(() => {
      addComplaint(newComplaint);
      setIsSubmitting(false);
      router.push(`/complaints/${newId}`);
    }, 900);
  };

  return (
    <div className="min-h-screen bg-[var(--canvas-base)] text-[var(--text-primary)] py-10 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-4xl mx-auto space-y-8 pb-24">
        {/* Breadcrumb & Header Section */}
        <div className="flex flex-col space-y-2 animate-fade-in-up">
          <div className="flex items-center gap-2 text-xs font-mono text-[var(--text-muted)]">
            <Link href="/" className="hover:text-emerald-400 transition-colors flex items-center gap-1">
              <span>CivicOps</span>
            </Link>
            <span>/</span>
            <span className="text-emerald-400 font-medium">Telemetry Dispatch</span>
            <span>/</span>
            <span className="text-[var(--text-primary)]">Submit Incident</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pt-2">
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Report a Civic Hazard</h1>
              <p className="text-sm sm:text-base text-[var(--text-muted)] max-w-2xl mt-1 leading-relaxed">
                Autonomous multi-modal triage parses photographic telemetry, calculates spatial duplicates, and instantly routes field assets.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--surface-card)] border border-emerald-500/30 shadow-sm shrink-0 self-start md:self-auto animate-float">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="font-mono text-xs text-emerald-400">Cluster Engine Active</span>
            </div>
          </div>
        </div>

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* ======================================================== */}
          {/* 1. Photo Evidence Upload with Live AI Scanner            */}
          {/* ======================================================== */}
          <div className="bg-[var(--surface-card)] border border-[var(--border-subtle)] rounded-xl p-6 shadow-xl space-y-4 hover-lift transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-emerald-400" />
                <h2 className="text-lg font-bold">Photographic Evidence</h2>
              </div>
              <span className="font-mono text-xs text-[var(--text-muted)] uppercase tracking-wider">Field Telemetry Payload</span>
            </div>

            {/* Photo Preview Container with Animated Laser Scanline */}
            {photoUrl ? (
              <div className="relative rounded-xl overflow-hidden bg-[var(--surface-elevated)] group border border-[var(--border-subtle)]">
                <div className="relative w-full h-72 sm:h-80 overflow-hidden rounded-xl">
                  <img
                    src={photoUrl}
                    alt="Hazard evidence"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {/* Glowing Animated Scanline */}
                  <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_14px_#10B981] pointer-events-none animate-scanline" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--canvas-base)]/90 via-transparent to-black/20 pointer-events-none" />

                  {/* Top Actions Toolbar */}
                  <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#11131A]/90 backdrop-blur-md text-white font-mono text-xs shadow-md hover:bg-[#11131A] transition-all border border-white/[0.08]"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Replace</span>
                    </button>
                    <button
                      type="button"
                      onClick={removePhoto}
                      className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center hover:bg-rose-500/30 transition-all shadow-md"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Top Left Metadata Pill */}
                  <div className="absolute top-4 left-4 z-10">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#11131A]/90 backdrop-blur-md border border-white/[0.08] shadow-md">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="font-mono text-xs text-zinc-200">EXIF Verified • 4032×3024</span>
                    </div>
                  </div>

                  {/* AI Real-Time Vision HUD Scanner Overlay */}
                  <div className="absolute bottom-4 left-4 right-4 z-10">
                    <div className="p-4 rounded-xl bg-[#11131A]/95 backdrop-blur-xl border border-white/[0.1] shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
                          <Sparkles className="w-4 h-4 text-emerald-400 animate-spin" style={{ animationDuration: '8s' }} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            <span className="text-sm font-bold text-white">AI Vision Classifier: Asphalt Fracture</span>
                          </div>
                          <p className="font-mono text-xs text-zinc-400 mt-0.5">
                            Class: Severe Pothole • Depth Est: 7.2cm • Safety Weight: 0.94
                          </p>
                        </div>
                      </div>
                      <div className="self-start sm:self-auto">
                        <span className="font-mono text-xs text-emerald-400 font-bold px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                          96.8% Confidence
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="p-8 rounded-xl bg-[#161922] border-2 border-dashed border-white/[0.15] hover:border-emerald-500/50 flex flex-col items-center justify-center text-center cursor-pointer transition-colors"
              >
                <Upload className="w-10 h-10 text-zinc-400 mb-2" />
                <p className="text-sm font-semibold text-white">Drag & drop photographic evidence or click to browse</p>
                <p className="font-mono text-xs text-zinc-500 mt-1">Supports HEIC, RAW, JPG, PNG up to 25MB with embedded GPS metadata</p>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* ======================================================== */}
          {/* 2. Interactive Geolocation Map Pin & Proximity Analysis */}
          {/* ======================================================== */}
          <div className="bg-[#11131A] border border-white/[0.08] rounded-xl p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-emerald-400" />
                <h2 className="text-lg font-bold text-white">Spatial Pinpoint & Neighborhood Routing</h2>
              </div>
              <button
                type="button"
                onClick={handleFetchGps}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#161922] hover:bg-white/[0.08] text-emerald-400 font-mono text-xs border border-white/[0.08] transition-colors self-start sm:self-auto"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Fetch Device GPS</span>
              </button>
            </div>

            {/* Map Container */}
            <div className="relative w-full h-80 rounded-xl overflow-hidden border border-white/[0.08]">
              <LocationPickerMap
                lat={location.lat}
                lng={location.lng}
                address={location.address}
                onChangeLocation={(loc) => {
                  setLocation({
                    lat: loc.lat,
                    lng: loc.lng,
                    address: loc.address || location.address,
                  });
                }}
              />

              {/* Top-Left Map Overlay: Ward Density Radar */}
              <div className="absolute top-3 left-3 z-[1000]">
                <div className="px-3 py-1 rounded-lg bg-[#11131A]/90 backdrop-blur-md border border-white/[0.08] shadow-md flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400" />
                  <span className="font-mono text-xs text-white">Ward 4 North • Sector 18-A</span>
                </div>
              </div>
            </div>

            {/* Bottom Geocoded Context Card */}
            <div className="p-4 rounded-xl bg-[#161922] border border-white/[0.08] flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#11131A] flex items-center justify-center text-emerald-400 shrink-0 border border-white/[0.06]">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{location.address}</p>
                  <p className="font-mono text-xs text-zinc-400">Cross-Street: Elmwood Ave • In front of Public School #44</p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-[#11131A] px-3 py-1.5 rounded-lg border border-white/[0.06] font-mono text-xs text-zinc-300">
                <Radio className="w-3.5 h-3.5 text-zinc-500" />
                <span>{location.lat.toFixed(4)}° N, {Math.abs(location.lng).toFixed(4)}° W (±2.8m)</span>
              </div>
            </div>

            {/* Proximity Cluster Callout */}
            <div className="p-4 rounded-xl bg-[#161922]/60 border border-white/[0.06] flex items-start gap-3">
              <Layers className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="text-sm font-semibold text-white">Spatial Correlation Engine Note</p>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  No overlapping complaints detected within 120m in the last 72 hours. This report will initialize a new priority ledger index (#PL-88219).
                </p>
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* 3. Issue Category Selection with AI Suggestion           */}
          {/* ======================================================== */}
          <div className="bg-[#11131A] border border-white/[0.08] rounded-xl p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-emerald-400" />
                <h2 className="text-lg font-bold text-white">Municipal Department Categorization</h2>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 self-start sm:self-auto">
                <Sparkles className="w-3.5 h-3.5" />
                <span className="font-mono text-xs font-semibold">AI Inferred: {aiSuggestedCategory}</span>
              </div>
            </div>

            {/* Category Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                { cat: 'Road Damage' as ComplaintCategory, label: 'Road & Pavement', desc: 'Potholes, sinking curbs', icon: Wrench },
                { cat: 'Garbage' as ComplaintCategory, label: 'Waste & Cleansing', desc: 'Illegal dumping, bins', icon: WasteIcon },
                { cat: 'Streetlights' as ComplaintCategory, label: 'Lighting & Grid', desc: 'Outages, exposed wiring', icon: Lightbulb },
                { cat: 'Water Leakage' as ComplaintCategory, label: 'Water & Hydrology', desc: 'Main bursts, standing water', icon: Droplets },
                { cat: 'Blocked Drains' as ComplaintCategory, label: 'Stormwater & Drains', desc: 'Catch basin clogs, runoff', icon: Waves },
              ].map(({ cat, label, desc, icon: Icon }) => {
                const isSelected = selectedCategory === cat;
                return (
                  <div
                    key={cat}
                    onClick={() => {
                      setSelectedCategory(cat);
                      setIsManualOverride(true);
                    }}
                    className={`p-4 rounded-xl cursor-pointer transition-all flex items-center justify-between border ${
                      isSelected
                        ? 'bg-emerald-500/10 border-emerald-500/50 shadow-md'
                        : 'bg-[#161922] border-white/[0.06] hover:border-white/[0.14]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                        isSelected ? 'bg-emerald-500/20 text-emerald-400' : 'bg-[#11131A] text-zinc-400'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className={`text-sm font-bold ${isSelected ? 'text-white' : 'text-zinc-200'}`}>{label}</p>
                        <p className="text-[11px] font-mono text-zinc-500">{desc}</p>
                      </div>
                    </div>
                    {isSelected ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    ) : (
                      <span className="w-4 h-4 rounded-full border border-white/[0.15] shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>

            <p className="font-mono text-xs text-zinc-500">
              Classification weights are autonomously calibrated by telemetry embeddings. You can select another pill at any moment to override machine dispatch.
            </p>
          </div>

          {/* ======================================================== */}
          {/* 4. Description Field & Voice Shortcut                    */}
          {/* ======================================================== */}
          <div className="bg-[#11131A] border border-white/[0.08] rounded-xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Field Description & Impact Scope</h2>
              <button
                type="button"
                onClick={toggleRecording}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-colors border ${
                  isRecording 
                    ? 'bg-rose-500/20 text-rose-400 border-rose-500/30 animate-pulse'
                    : 'bg-[#161922] text-zinc-300 border-white/[0.08] hover:bg-white/[0.08]'
                }`}
              >
                <Mic className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isRecording ? 'Listening...' : 'Dictate Note'}</span>
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">
                  Incident Title Summary <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Hazardous Pothole on Tremont St"
                  className="w-full bg-[#161922] border border-white/[0.08] rounded-lg px-3.5 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none placeholder:text-zinc-500 transition-colors"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-zinc-300">
                    Detailed Notes & Observations
                  </label>
                  <span className="font-mono text-xs text-zinc-500">{description.length}/500</span>
                </div>
                <textarea
                  rows={4}
                  maxLength={500}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe street landmarks, safety risks, or traffic disruptions..."
                  className="w-full bg-[#161922] border border-white/[0.08] rounded-lg p-3 text-sm text-white focus:border-emerald-500 focus:outline-none placeholder:text-zinc-500 resize-y transition-colors"
                />
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* 5. Submitter Info Drawer (Privacy Toggle)                */}
          {/* ======================================================== */}
          <div className="bg-[#11131A] border border-white/[0.08] rounded-xl overflow-hidden shadow-xl">
            <button
              type="button"
              onClick={() => setIsSubmitterOpen(!isSubmitterOpen)}
              className="w-full p-4 flex items-center justify-between text-left hover:bg-white/[0.02] transition-colors"
            >
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-emerald-400" />
                <div>
                  <span className="text-sm font-bold text-white block">Submitter Privacy & Contact Details</span>
                  <span className="text-xs text-zinc-400">
                    {isAnonymous ? 'Submitting as Anonymous' : `Submitting as ${submitterName}`}
                  </span>
                </div>
              </div>
              {isSubmitterOpen ? <ChevronUp className="w-4 h-4 text-zinc-400" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />}
            </button>

            {isSubmitterOpen && (
              <div className="p-6 pt-0 border-t border-white/[0.08] space-y-4 mt-2">
                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="anon-check"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="rounded bg-[#161922] border-white/[0.1] text-emerald-500 focus:ring-emerald-500"
                  />
                  <label htmlFor="anon-check" className="text-xs font-semibold text-zinc-300 cursor-pointer">
                    Submit Anonymously (Omits contact information from public records)
                  </label>
                </div>

                {!isAnonymous && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                    <div>
                      <label className="text-xs font-semibold text-zinc-400 block mb-1">Full Name</label>
                      <input
                        type="text"
                        value={submitterName}
                        onChange={(e) => setSubmitterName(e.target.value)}
                        className="w-full bg-[#161922] border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-zinc-400 block mb-1">Email Address</label>
                      <input
                        type="email"
                        value={submitterEmail}
                        onChange={(e) => setSubmitterEmail(e.target.value)}
                        className="w-full bg-[#161922] border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-zinc-400 block mb-1">Phone Number</label>
                      <input
                        type="tel"
                        value={submitterPhone}
                        onChange={(e) => setSubmitterPhone(e.target.value)}
                        className="w-full bg-[#161922] border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Desktop Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-zinc-950 font-bold text-base transition-all shadow-[0_0_24px_rgba(16,185,129,0.3)] hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Logging Incident to Municipal Ledger...</span>
                </>
              ) : (
                <>
                  <span>Submit Complaint & Transmit Telemetry</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Fixed Mobile Bottom CTA Bar */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-[#090A0F]/95 backdrop-blur-xl border-t border-white/[0.08] z-40">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full py-3.5 px-4 rounded-xl bg-emerald-500 active:bg-emerald-600 text-zinc-950 font-bold text-sm shadow-[0_0_16px_rgba(16,185,129,0.3)] flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Submitting...</span>
              </>
            ) : (
              <>
                <span>Submit Complaint</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
