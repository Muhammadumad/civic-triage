export type ComplaintCategory =
  | 'Road Damage'
  | 'Garbage'
  | 'Streetlights'
  | 'Water Leakage'
  | 'Blocked Drains';

export type ComplaintStatus =
  | 'New'
  | 'Under Review'
  | 'Assigned'
  | 'In Progress'
  | 'Resolved'
  | 'Duplicate';

export type PriorityLevel = 'High' | 'Medium' | 'Low';

export interface LocationCoordinates {
  lat: number;
  lng: number;
  address: string;
}

export interface Complaint {
  id: string;
  title: string;
  description: string;
  category: ComplaintCategory;
  aiCategory: ComplaintCategory;
  aiConfidence: number; // 0 to 1 or 0 to 100 percentage
  photoUrl: string;
  location: LocationCoordinates;
  status: ComplaintStatus;
  priorityScore: number; // 0 - 100
  priorityReasons: string[];
  duplicateOf?: string;
  duplicateCount: number;
  department: string;
  createdAt: string;
  history?: StatusHistory[];
  resolutionEvidence?: {
    afterPhotoUrl: string;
    completedAt: string;
    crewNotes: string;
    inspectorName: string;
  };
  contactInfo?: {
    isAnonymous: boolean;
    name?: string;
    email?: string;
    phone?: string;
  };
  ward?: string;
  priorityMath?: {
    categoryBasePoints: number;
    duplicatePoints: number;
    sensitiveZonePoints: number;
    agePoints: number;
    totalScore: number;
  };
  aiProvenance?: {
    suggestedCategory: ComplaintCategory;
    confidence: number;
    classificationReason: string;
    modelVersion: string;
    visualFeatures: string[];
  };
  suspectedDuplicates?: Array<{
    id: string;
    title: string;
    distanceMeters: number;
    similarityPct: number;
    photoUrl: string;
    createdAt: string;
    status: ComplaintStatus;
  }>;
}

export interface StatusHistory {
  complaintId: string;
  status: ComplaintStatus;
  note: string;
  evidencePhotoUrl?: string;
  changedBy: string;
  changedAt: string;
}

export interface RuleSettings {
  categoryWeights: Record<string, number>;
  duplicateWeight: number;
  sensitiveZoneWeight: number;
  ageWeight: number;
  thresholds: {
    high: number;
    medium: number;
  };
}

export interface SensitiveZone {
  _id?: string;
  id?: string;
  name: string;
  type: 'school' | 'hospital' | 'transit_hub' | 'market' | 'other' | string;
  lat: number;
  lng: number;
  radius: number;
  active?: boolean;
  createdAt?: string;
}

export interface TransparencyStats {
  totalComplaints: number;
  totalResolved: number;
  resolutionRate: number;
  avgResolutionHours: number;
  categoryBreakdown: Record<string, { total: number; resolved: number }>;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'resident' | 'admin';
}

// Token Configuration Objects matching CivicPulse v1 Design System
export const CATEGORY_THEME: Record<
  ComplaintCategory,
  {
    hex: string;
    border: string;
    bg: string;
    text: string;
    icon: string;
    department: string;
  }
> = {
  'Road Damage': {
    hex: '#EA580C',
    border: 'border-orange-500/30',
    bg: 'bg-orange-500/10',
    text: 'text-orange-400',
    icon: 'Hammer',
    department: 'Dept of Public Works & Roads',
  },
  'Garbage': {
    hex: '#84CC16',
    border: 'border-lime-500/30',
    bg: 'bg-lime-500/10',
    text: 'text-lime-400',
    icon: 'Trash2',
    department: 'Sanitation & Solid Waste Management',
  },
  'Streetlights': {
    hex: '#FACC15',
    border: 'border-yellow-500/30',
    bg: 'bg-yellow-500/10',
    text: 'text-yellow-400',
    icon: 'Lightbulb',
    department: 'Municipal Electrical Grid',
  },
  'Water Leakage': {
    hex: '#06B6D4',
    border: 'border-cyan-500/30',
    bg: 'bg-cyan-500/10',
    text: 'text-cyan-400',
    icon: 'Droplets',
    department: 'Water & Utilities Board',
  },
  'Blocked Drains': {
    hex: '#8B5CF6',
    border: 'border-purple-500/30',
    bg: 'bg-purple-500/10',
    text: 'text-purple-400',
    icon: 'Waves',
    department: 'Stormwater & Drainage Division',
  },
};

export const STATUS_THEME: Record<
  ComplaintStatus,
  {
    hex: string;
    border: string;
    bg: string;
    text: string;
  }
> = {
  'New': {
    hex: '#6366F1',
    border: 'border-indigo-500/35',
    bg: 'bg-indigo-500/15',
    text: 'text-indigo-400',
  },
  'Under Review': {
    hex: '#D946EF',
    border: 'border-fuchsia-500/35',
    bg: 'bg-fuchsia-500/15',
    text: 'text-fuchsia-400',
  },
  'Assigned': {
    hex: '#3B82F6',
    border: 'border-blue-500/35',
    bg: 'bg-blue-500/15',
    text: 'text-blue-400',
  },
  'In Progress': {
    hex: '#F59E0B',
    border: 'border-amber-500/35',
    bg: 'bg-amber-500/15',
    text: 'text-amber-400',
  },
  'Resolved': {
    hex: '#10B981',
    border: 'border-emerald-500/35',
    bg: 'bg-emerald-500/15',
    text: 'text-emerald-400',
  },
  'Duplicate': {
    hex: '#71717A',
    border: 'border-zinc-500/35',
    bg: 'bg-zinc-500/15',
    text: 'text-zinc-400',
  },
};

export function getPriorityLevel(score: number): PriorityLevel {
  if (score >= 70) return 'High';
  if (score >= 40) return 'Medium';
  return 'Low';
}

export const PRIORITY_THEME: Record<
  PriorityLevel,
  {
    text: string;
    border: string;
    bg: string;
    hex: string;
    label: string;
  }
> = {
  High: {
    hex: '#FB7185',
    text: 'text-[#FB7185]',
    border: 'border-[rgba(244,63,94,0.35)]',
    bg: 'bg-[rgba(244,63,94,0.12)]',
    label: 'High Priority (>=70)',
  },
  Medium: {
    hex: '#FBBF24',
    text: 'text-[#FBBF24]',
    border: 'border-[rgba(245,158,11,0.35)]',
    bg: 'bg-[rgba(245,158,11,0.12)]',
    label: 'Medium Priority (40-69)',
  },
  Low: {
    hex: '#60A5FA',
    text: 'text-[#60A5FA]',
    border: 'border-[rgba(59,130,246,0.25)]',
    bg: 'bg-[rgba(59,130,246,0.10)]',
    label: 'Low Priority (<40)',
  },
};

export const DEFAULT_RULE_SETTINGS: RuleSettings = {
  categoryWeights: {
    'Road Damage': 30,
    'Garbage': 20,
    'Streetlights': 15,
    'Water Leakage': 25,
    'Blocked Drains': 30,
  },
  duplicateWeight: 15,
  sensitiveZoneWeight: 20,
  ageWeight: 10,
  thresholds: {
    high: 70,
    medium: 40,
  },
};

export const DEMO_USERS: Record<'resident' | 'admin', User> = {
  resident: {
    id: 'usr_res_892',
    name: 'Sarah Chen (Resident)',
    email: 'sarah.chen@civicpulse.org',
    role: 'resident',
  },
  admin: {
    id: 'usr_adm_104',
    name: 'Marcus Vance (City Admin)',
    email: 'm.vance@metro.gov',
    role: 'admin',
  },
};

export const SAMPLE_COMPLAINTS: Complaint[] = [
  {
    id: 'CP-2026-891',
    title: 'Dangerous Deep Crater Pothole on Autobahn Road',
    description: 'Deep 14-inch asphalt crater causing tire blowouts near pedestrian crossing and school bus drop-off zone. Exposed gravel and broken asphalt spreading across active transit lane.',
    category: 'Road Damage',
    aiCategory: 'Road Damage',
    aiConfidence: 0.96,
    photoUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
    location: {
      lat: 25.3960,
      lng: 68.3578,
      address: 'Autobahn Road, Hyderabad, Sindh',
    },
    status: 'In Progress',
    priorityScore: 88,
    priorityReasons: [
      'Proximity to designated school safety corridor (+25)',
      'Multiple tire blowout reports in 12 hours (+30)',
      'High vehicle throughput arterial corridor (+33)',
    ],
    ward: 'Ward 1 - Municipal Core',
    duplicateCount: 6,
    department: 'Dept of Public Works & Roads',
    createdAt: '2026-10-13T13:45:00.000Z',
    priorityMath: {
      categoryBasePoints: 30,
      duplicatePoints: 18,
      sensitiveZonePoints: 25,
      agePoints: 15,
      totalScore: 88,
    },
    aiProvenance: {
      suggestedCategory: 'Road Damage',
      confidence: 0.96,
      classificationReason: 'Convolutional neural edge-detector localized 14-inch asphalt subsidence with loose aggregate directly within transit lane.',
      modelVersion: 'CivicPulse-Vision-v2.4 (Multimodal Core)',
      visualFeatures: ['Sub-surface structural failure', 'Pavement displacement >12in', 'Active vehicle traffic hazard'],
    },
    suspectedDuplicates: [
      {
        id: 'CP-2026-891-D1',
        title: 'Deep pothole popping bike tires outside bakery on Autobahn',
        distanceMeters: 45,
        similarityPct: 94,
        photoUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
        createdAt: '2026-10-13T13:10:00.000Z',
        status: 'New',
      },
      {
        id: 'CP-2026-891-D2',
        title: 'Cracked road crater near bus stop',
        distanceMeters: 80,
        similarityPct: 89,
        photoUrl: 'https://images.unsplash.com/photo-1584463699047-73d72a74c2be?auto=format&fit=crop&w=800&q=80',
        createdAt: '2026-10-13T12:45:00.000Z',
        status: 'New',
      },
    ],
    history: [
      {
        complaintId: 'CP-2026-891',
        status: 'New',
        note: 'Citizen mobile report submitted via GPS coordinates. AI vision detected 14" pavement crater.',
        changedBy: 'Automated AI Intake Engine',
        changedAt: '2026-10-13T13:45:00.000Z',
      },
      {
        complaintId: 'CP-2026-891',
        status: 'Under Review',
        note: 'High-traffic arterial tag applied (+33). Merged 6 duplicate citizen alerts in 120m radius.',
        changedBy: 'AI Triage Scoring Daemon',
        changedAt: '2026-10-13T13:52:00.000Z',
      },
      {
        complaintId: 'CP-2026-891',
        status: 'Assigned',
        note: 'High priority ticket (Score 88) routed to Rapid Asphalt Response Team 4.',
        changedBy: 'Central Municipal Dispatcher',
        changedAt: '2026-10-13T14:10:00.000Z',
      },
      {
        complaintId: 'CP-2026-891',
        status: 'In Progress',
        note: 'Work Crew Truck arrived on scene at Autobahn Rd. Deploying safety cones and thermal patcher.',
        changedBy: 'Supervisor D. Jenkins (Field Operations)',
        changedAt: '2026-10-13T14:35:00.000Z',
      },
    ],
  },
  {
    id: 'CP-2026-892',
    title: 'High-Pressure Main Water Pipeline Rupture',
    description: 'High-pressure clean water geyser bursting through asphalt seam outside hospital perimeter. Flooding road and undermining roadbed.',
    category: 'Water Leakage',
    aiCategory: 'Water Leakage',
    aiConfidence: 0.98,
    photoUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80',
    location: {
      lat: 25.4020,
      lng: 68.3620,
      address: 'Near Civil Hospital, Saddar, Hyderabad',
    },
    status: 'Assigned',
    priorityScore: 94,
    priorityReasons: [
      'Critical hospital access zone proximity (+40)',
      'Imminent structural roadbed undermining risk (+35)',
      'High flow rate discharge (>200 gal/min) (+19)',
    ],
    ward: 'Ward 2 - Saddar Medical Corridor',
    duplicateCount: 9,
    department: 'Water & Utilities Board',
    createdAt: '2026-10-13T11:50:00.000Z',
    priorityMath: {
      categoryBasePoints: 35,
      duplicatePoints: 24,
      sensitiveZonePoints: 20,
      agePoints: 15,
      totalScore: 94,
    },
    aiProvenance: {
      suggestedCategory: 'Water Leakage',
      confidence: 0.98,
      classificationReason: 'High-velocity fluid dynamics identified pressurized municipal water main rupture with active roadbed pooling.',
      modelVersion: 'CivicPulse-Vision-v2.4 (Multimodal Core)',
      visualFeatures: ['Pressurized hydraulic rupture', 'Hospital route obstruction', 'Active erosion'],
    },
    history: [
      {
        complaintId: 'CP-2026-892',
        status: 'New',
        note: 'Emergency citizen report filed. Automated intake classified as pressurized pipeline breach.',
        changedBy: 'Automated AI Intake Engine',
        changedAt: '2026-10-13T11:50:00.000Z',
      },
      {
        complaintId: 'CP-2026-892',
        status: 'Under Review',
        note: 'Priority elevated to 94 due to hospital ambulance corridor and 9 merged duplicate alerts.',
        changedBy: 'AI Triage Scoring Daemon',
        changedAt: '2026-10-13T11:55:00.000Z',
      },
      {
        complaintId: 'CP-2026-892',
        status: 'Assigned',
        note: 'Emergency Valve Isolation Unit 12 dispatched. Crew ETA 15 minutes.',
        changedBy: 'Water Emergency Control Center',
        changedAt: '2026-10-13T12:05:00.000Z',
      },
    ],
  },
  {
    id: 'CP-2026-893',
    title: 'Massive Waste Overflow Blocking Main Bazaar Entrance',
    description: 'Commercial waste and decomposed organic trash piled 5 feet high blocking commercial entrance. Strong stench and pest hazard.',
    category: 'Garbage',
    aiCategory: 'Garbage',
    aiConfidence: 0.91,
    photoUrl: 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?auto=format&fit=crop&w=800&q=80',
    location: {
      lat: 25.3910,
      lng: 68.3710,
      address: 'Resham Gali Market Bazaar, Hyderabad',
    },
    status: 'Under Review',
    priorityScore: 68,
    priorityReasons: [
      'Commercial market entrance obstruction (+25)',
      'Public health biohazard tag applied (+24)',
      'Reported by 4 local shopkeeper associations (+19)',
    ],
    ward: 'Ward 4 - Commercial Market',
    duplicateCount: 4,
    department: 'Sanitation & Solid Waste Management',
    createdAt: '2026-10-13T09:30:00.000Z',
    priorityMath: {
      categoryBasePoints: 20,
      duplicatePoints: 16,
      sensitiveZonePoints: 18,
      agePoints: 14,
      totalScore: 68,
    },
    aiProvenance: {
      suggestedCategory: 'Garbage',
      confidence: 0.91,
      classificationReason: 'Identified commercial dumpster capacity breach with overflow impeding pedestrian thoroughfare.',
      modelVersion: 'CivicPulse-Vision-v2.4 (Multimodal Core)',
      visualFeatures: ['Debris containment breach', 'Pedestrian thoroughfare blockage', 'Commercial waste pile'],
    },
    history: [
      {
        complaintId: 'CP-2026-893',
        status: 'New',
        note: 'Market association filed collective complaint with attached ground photos.',
        changedBy: 'Citizen Web Portal',
        changedAt: '2026-10-13T09:30:00.000Z',
      },
      {
        complaintId: 'CP-2026-893',
        status: 'Under Review',
        note: 'Assigned Priority 68. Compactor Truck Route scheduled for night shift sweep.',
        changedBy: 'Sanitation Bureau Auditor',
        changedAt: '2026-10-13T10:15:00.000Z',
      },
    ],
  },
  {
    id: 'CP-2026-894',
    title: 'Fallen High-Mast Streetlight on Indus Highway Corridor',
    description: 'Structural lighting pole damaged by severe winds, leaning over roadway. Exposed electrical wires posing electrocution hazard.',
    category: 'Streetlights',
    aiCategory: 'Streetlights',
    aiConfidence: 0.89,
    photoUrl: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=800&q=80',
    location: {
      lat: 25.4072,
      lng: 68.2558,
      address: 'Indus Highway near MUET Gate, Jamshoro',
    },
    status: 'In Progress',
    priorityScore: 76,
    priorityReasons: [
      'High-speed university highway access corridor (+32)',
      'Exposed live high-voltage cabling (+28)',
      'Darkened transit zone at night (+16)',
    ],
    ward: 'Ward 4 North - Jamshoro Campus Sector',
    duplicateCount: 3,
    department: 'Municipal Electrical Grid',
    createdAt: '2026-10-13T05:50:00.000Z',
    priorityMath: {
      categoryBasePoints: 15,
      duplicatePoints: 15,
      sensitiveZonePoints: 28,
      agePoints: 18,
      totalScore: 76,
    },
    aiProvenance: {
      suggestedCategory: 'Streetlights',
      confidence: 0.89,
      classificationReason: 'Detected leaning luminaire structure with exposed wiring harness near university pedestrian gate.',
      modelVersion: 'CivicPulse-Vision-v2.4 (Multimodal Core)',
      visualFeatures: ['Structural pole lean >25deg', 'High-voltage cable exposure', 'Highway hazard'],
    },
    history: [
      {
        complaintId: 'CP-2026-894',
        status: 'New',
        note: 'Student commuter reported leaning pole via mobile GPS pin.',
        changedBy: 'Citizen Mobile App',
        changedAt: '2026-10-13T05:50:00.000Z',
      },
      {
        complaintId: 'CP-2026-894',
        status: 'In Progress',
        note: 'Electrical crew on scene disconnecting circuit breaker and securing steel mast.',
        changedBy: 'Lead Lineman Tariq (Power Grid)',
        changedAt: '2026-10-13T07:20:00.000Z',
      },
    ],
  },
  {
    id: 'CP-2026-895',
    title: 'Severe Gutter Sewage Overflow Flooding Pedestrian Crosswalk',
    description: 'Clogged subterranean stormwater drain backed up with black sewage water flooding across intersection.',
    category: 'Blocked Drains',
    aiCategory: 'Blocked Drains',
    aiConfidence: 0.94,
    photoUrl: 'https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?auto=format&fit=crop&w=800&q=80',
    location: {
      lat: 25.3880,
      lng: 68.3540,
      address: 'Latifabad Unit 7 Main Chowk, Hyderabad',
    },
    status: 'Resolved',
    priorityScore: 35,
    priorityReasons: [
      'Subterranean drain clearance completed (-30)',
      'Pedestrian walkway fully restored (+20)',
    ],
    ward: 'Ward 3 - Latifabad South',
    duplicateCount: 1,
    department: 'Stormwater & Drainage Division',
    createdAt: '2026-10-12T14:50:00.000Z',
    priorityMath: {
      categoryBasePoints: 25,
      duplicatePoints: 4,
      sensitiveZonePoints: 0,
      agePoints: 6,
      totalScore: 35,
    },
    aiProvenance: {
      suggestedCategory: 'Blocked Drains',
      confidence: 0.94,
      classificationReason: 'Organic matter and silt accumulation over horizontal drainage inlet grill verified.',
      modelVersion: 'CivicPulse-Vision-v2.4 (Multimodal Core)',
      visualFeatures: ['Grate obstruction 85%', 'Standing pool depth >4in'],
    },
    history: [
      {
        complaintId: 'CP-2026-895',
        status: 'New',
        note: 'Crosswalk flooding logged by neighborhood resident.',
        changedBy: 'Citizen Intake Form',
        changedAt: '2026-10-12T14:50:00.000Z',
      },
      {
        complaintId: 'CP-2026-895',
        status: 'In Progress',
        note: 'Sewer vacuum truck SV-14 deployed on Latifabad Unit 7.',
        changedBy: 'Drainage Operations Team',
        changedAt: '2026-10-13T09:00:00.000Z',
      },
      {
        complaintId: 'CP-2026-895',
        status: 'Resolved',
        note: 'Dislodged blockage using high-pressure jetting. Water drained completely and crosswalk disinfected.',
        changedBy: 'Supervisor Aslam Khan',
        changedAt: '2026-10-13T11:40:00.000Z',
        evidencePhotoUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb186f5f8?auto=format&fit=crop&w=800&q=80',
      },
    ],
    resolutionEvidence: {
      afterPhotoUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb186f5f8?auto=format&fit=crop&w=800&q=80',
      completedAt: '2026-10-13T11:40:00.000Z',
      crewNotes: 'Cleared 220 lbs of silt with high-velocity vacuum jetter unit. Culvert flow verified at 100% capacity.',
      inspectorName: 'Inspector Aslam Khan (Badge #409)',
    },
  },
  {
    id: 'CP-2026-896',
    title: 'Collapsing Road Trench After Storm Drain Excavation',
    description: 'Uncovered trench cut across University Road collapsed during traffic, creating sudden 2-foot drop across both vehicular lanes.',
    category: 'Road Damage',
    aiCategory: 'Road Damage',
    aiConfidence: 0.95,
    photoUrl: 'https://images.unsplash.com/photo-1584463699047-73d72a74c2be?auto=format&fit=crop&w=800&q=80',
    location: {
      lat: 25.4150,
      lng: 68.2610,
      address: 'University Road, Jamshoro Education Zone',
    },
    status: 'New',
    priorityScore: 82,
    priorityReasons: [
      'Immediate rollover hazard for high-speed traffic (+35)',
      'Primary route connecting university faculties (+25)',
      '5 citizen emergency reports within 30 minutes (+22)',
    ],
    ward: 'Ward 5 - University District',
    duplicateCount: 5,
    department: 'Dept of Public Works & Roads',
    createdAt: '2026-10-13T15:20:00.000Z',
    priorityMath: {
      categoryBasePoints: 30,
      duplicatePoints: 17,
      sensitiveZonePoints: 23,
      agePoints: 12,
      totalScore: 82,
    },
    aiProvenance: {
      suggestedCategory: 'Road Damage',
      confidence: 0.95,
      classificationReason: 'Identified uncompacted trench cave-in spanning across bidirectional lanes.',
      modelVersion: 'CivicPulse-Vision-v2.4 (Multimodal Core)',
      visualFeatures: ['Severe asphalt shearing', 'Subgrade collapse', 'High velocity roadway'],
    },
    history: [
      {
        complaintId: 'CP-2026-896',
        status: 'New',
        note: 'Incoming urgent alert logged. Automated priority boosted to 82.',
        changedBy: 'AI Triage Engine',
        changedAt: '2026-10-13T15:20:00.000Z',
      },
    ],
  },
  {
    id: 'CP-2026-897',
    title: 'Uncollected Medical Waste Dumped Behind Clinic',
    description: 'Discarded clinical packaging, biological waste bags, and syringes dumped outside designated municipal dumpster enclosure.',
    category: 'Garbage',
    aiCategory: 'Garbage',
    aiConfidence: 0.97,
    photoUrl: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=800&q=80',
    location: {
      lat: 25.4010,
      lng: 68.3590,
      address: 'Doctor Lane, Cantonment Area, Hyderabad',
    },
    status: 'Assigned',
    priorityScore: 91,
    priorityReasons: [
      'Hazardous biological materials detected (+40)',
      'Immediate contamination risk to residential neighborhood (+31)',
      '7 neighborhood complaints verified (+20)',
    ],
    ward: 'Ward 2 - Cantonment Zone',
    duplicateCount: 7,
    department: 'Sanitation & Solid Waste Management',
    createdAt: '2026-10-13T08:15:00.000Z',
    priorityMath: {
      categoryBasePoints: 25,
      duplicatePoints: 26,
      sensitiveZonePoints: 25,
      agePoints: 15,
      totalScore: 91,
    },
    aiProvenance: {
      suggestedCategory: 'Garbage',
      confidence: 0.97,
      classificationReason: 'Visual biohazard classification detected clinical packaging and unauthorized dumping.',
      modelVersion: 'CivicPulse-Vision-v2.4 (Multimodal Core)',
      visualFeatures: ['Biohazard material', 'Unauthorized disposal', 'Residential proximity'],
    },
    history: [
      {
        complaintId: 'CP-2026-897',
        status: 'New',
        note: 'Urgent citizen health alert logged.',
        changedBy: 'Citizen Mobile App',
        changedAt: '2026-10-13T08:15:00.000Z',
      },
      {
        complaintId: 'CP-2026-897',
        status: 'Assigned',
        note: 'Hazardous Waste Special Unit dispatched with protective containment bins.',
        changedBy: 'Environmental Health Officer',
        changedAt: '2026-10-13T09:00:00.000Z',
      },
    ],
  },
  {
    id: 'CP-2026-898',
    title: 'Clean Water Supply Leak Inundating Residential Street',
    description: 'Broken joint on municipal water pipe flooding street entrance. Clean water flowing into gutters for over 18 hours.',
    category: 'Water Leakage',
    aiCategory: 'Water Leakage',
    aiConfidence: 0.92,
    photoUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
    location: {
      lat: 25.3780,
      lng: 68.3650,
      address: 'Latifabad Unit 11, Hyderabad',
    },
    status: 'New',
    priorityScore: 58,
    priorityReasons: [
      'Severe potable water resource wastage (+25)',
      'Localized pavement erosion risk (+20)',
      '2 resident reports filed (+13)',
    ],
    ward: 'Ward 3 - Latifabad South',
    duplicateCount: 2,
    department: 'Water & Utilities Board',
    createdAt: '2026-10-13T10:00:00.000Z',
    priorityMath: {
      categoryBasePoints: 25,
      duplicatePoints: 10,
      sensitiveZonePoints: 10,
      agePoints: 13,
      totalScore: 58,
    },
    aiProvenance: {
      suggestedCategory: 'Water Leakage',
      confidence: 0.92,
      classificationReason: 'Detected pressurized domestic supply leak pooling across paved street curb.',
      modelVersion: 'CivicPulse-Vision-v2.4 (Multimodal Core)',
      visualFeatures: ['Continuous fluid discharge', 'Potable water loss', 'Curb flooding'],
    },
    history: [
      {
        complaintId: 'CP-2026-898',
        status: 'New',
        note: 'Resident complaint filed with video clip.',
        changedBy: 'Citizen Web Portal',
        changedAt: '2026-10-13T10:00:00.000Z',
      },
    ],
  },
  {
    id: 'CP-2026-899',
    title: 'Series of 6 Dead Streetlights Creating Night Crime Hazard',
    description: 'Six consecutive streetlight fixtures out along pedestrian walkway, leaving over 400 meters of public road in total darkness.',
    category: 'Streetlights',
    aiCategory: 'Streetlights',
    aiConfidence: 0.93,
    photoUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
    location: {
      lat: 25.4120,
      lng: 68.3490,
      address: 'Thandi Sarak Green Belt Corridor, Hyderabad',
    },
    status: 'Under Review',
    priorityScore: 62,
    priorityReasons: [
      'Nighttime pedestrian security corridor (+28)',
      'Extended blackout zone (>400m continuous) (+20)',
      'Multiple morning runner reports (+14)',
    ],
    ward: 'Ward 1 - Municipal Core',
    duplicateCount: 2,
    department: 'Municipal Electrical Grid',
    createdAt: '2026-10-13T06:15:00.000Z',
    priorityMath: {
      categoryBasePoints: 15,
      duplicatePoints: 10,
      sensitiveZonePoints: 22,
      agePoints: 15,
      totalScore: 62,
    },
    aiProvenance: {
      suggestedCategory: 'Streetlights',
      confidence: 0.93,
      classificationReason: 'Zero-lux luminaire detection localized along pedestrian trail corridor.',
      modelVersion: 'CivicPulse-Vision-v2.4 (Multimodal Core)',
      visualFeatures: ['Zero lux illumination', 'Multi-pole blackout', 'Pedestrian greenway'],
    },
    history: [
      {
        complaintId: 'CP-2026-899',
        status: 'New',
        note: 'Reported by local citizens association.',
        changedBy: 'Citizen Mobile App',
        changedAt: '2026-10-13T06:15:00.000Z',
      },
      {
        complaintId: 'CP-2026-899',
        status: 'Under Review',
        note: 'Scheduled for transformer capacitor verification on morning maintenance shift.',
        changedBy: 'Power Grid Dispatcher',
        changedAt: '2026-10-13T07:30:00.000Z',
      },
    ],
  },
  {
    id: 'CP-2026-900',
    title: 'Clogged Monsoon Drain Canal Filled with Plastic Silt',
    description: 'Critical municipal drainage canal blocked with plastic debris and mud silt. Water level rising dangerously near residential homes.',
    category: 'Blocked Drains',
    aiCategory: 'Blocked Drains',
    aiConfidence: 0.96,
    photoUrl: 'https://images.unsplash.com/photo-1595278069441-2cf29f8005a4?auto=format&fit=crop&w=800&q=80',
    location: {
      lat: 25.3940,
      lng: 68.3420,
      address: 'Qasimabad Phase 1 Canal Road, Hyderabad',
    },
    status: 'In Progress',
    priorityScore: 78,
    priorityReasons: [
      'High urban flooding risk to adjacent residential sectors (+35)',
      'Substantial silt depth restricting culvert discharge capacity (+25)',
      '4 neighborhood alerts logged (+18)',
    ],
    ward: 'Ward 6 - Qasimabad West',
    duplicateCount: 4,
    department: 'Stormwater & Drainage Division',
    createdAt: '2026-10-13T12:00:00.000Z',
    priorityMath: {
      categoryBasePoints: 25,
      duplicatePoints: 16,
      sensitiveZonePoints: 22,
      agePoints: 15,
      totalScore: 78,
    },
    aiProvenance: {
      suggestedCategory: 'Blocked Drains',
      confidence: 0.96,
      classificationReason: 'Heavy solid accumulation detected spanning open municipal drainage culvert.',
      modelVersion: 'CivicPulse-Vision-v2.4 (Multimodal Core)',
      visualFeatures: ['Canal choking', 'Plastic waste dam', 'Rising water level'],
    },
    history: [
      {
        complaintId: 'CP-2026-900',
        status: 'New',
        note: 'Canal choking reported ahead of seasonal rains.',
        changedBy: 'Citizen Mobile App',
        changedAt: '2026-10-13T12:00:00.000Z',
      },
      {
        complaintId: 'CP-2026-900',
        status: 'In Progress',
        note: 'Excavator and dumper truck on site dredging silt and plastic debris.',
        changedBy: 'Drainage Field Lead',
        changedAt: '2026-10-13T14:10:00.000Z',
      },
    ],
  },
  {
    id: 'CP-2026-901',
    title: 'Pavement Subsurface Collapse at School Bus Dropoff',
    description: 'Asphalt crumbling and hollow ground beneath road surface right at school entrance. Heavy vehicles at risk of breakthrough.',
    category: 'Road Damage',
    aiCategory: 'Road Damage',
    aiConfidence: 0.94,
    photoUrl: 'https://images.unsplash.com/photo-1578844251758-2f71da64c96f?auto=format&fit=crop&w=800&q=80',
    location: {
      lat: 25.4210,
      lng: 68.2720,
      address: 'Cadet College Access Road, Jamshoro',
    },
    status: 'Assigned',
    priorityScore: 85,
    priorityReasons: [
      'Proximity to educational institution student dropoff (+35)',
      'Hollow subgrade cave-in risk for school buses (+32)',
      '5 verified parent and teacher submissions (+18)',
    ],
    ward: 'Ward 5 - University District',
    duplicateCount: 5,
    department: 'Dept of Public Works & Roads',
    createdAt: '2026-10-13T14:00:00.000Z',
    priorityMath: {
      categoryBasePoints: 30,
      duplicatePoints: 18,
      sensitiveZonePoints: 25,
      agePoints: 12,
      totalScore: 85,
    },
    aiProvenance: {
      suggestedCategory: 'Road Damage',
      confidence: 0.94,
      classificationReason: 'Subsurface void detection with surface fracturing adjacent to school entrance barrier.',
      modelVersion: 'CivicPulse-Vision-v2.4 (Multimodal Core)',
      visualFeatures: ['Subgrade hollow void', 'School dropoff zone', 'Structural collapse hazard'],
    },
    history: [
      {
        complaintId: 'CP-2026-901',
        status: 'New',
        note: 'School principal reported hollow ground outside main bus gate.',
        changedBy: 'Citizen Web Portal',
        changedAt: '2026-10-13T14:00:00.000Z',
      },
      {
        complaintId: 'CP-2026-901',
        status: 'Assigned',
        note: 'Assigned to Municipal Geotechnical Unit for ground-penetrating inspection and repair.',
        changedBy: 'Public Works Dispatcher',
        changedAt: '2026-10-13T14:45:00.000Z',
      },
    ],
  },
  {
    id: 'CP-2026-902',
    title: 'Completely Refurbished LED Streetlights on Main Boulevard',
    description: 'Complete overhaul of old mercury lamps replaced with energy-efficient smart LED fixtures on Civil Lines Boulevard.',
    category: 'Streetlights',
    aiCategory: 'Streetlights',
    aiConfidence: 0.98,
    photoUrl: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=800&q=80',
    location: {
      lat: 25.3990,
      lng: 68.3510,
      address: 'Civil Lines Boulevard, Hyderabad',
    },
    status: 'Resolved',
    priorityScore: 30,
    priorityReasons: [
      'Infrastructure modernization project completed (-40)',
      '100% illumination coverage verified (+15)',
    ],
    ward: 'Ward 1 - Municipal Core',
    duplicateCount: 0,
    department: 'Municipal Electrical Grid',
    createdAt: '2026-10-11T10:00:00.000Z',
    priorityMath: {
      categoryBasePoints: 15,
      duplicatePoints: 0,
      sensitiveZonePoints: 10,
      agePoints: 5,
      totalScore: 30,
    },
    aiProvenance: {
      suggestedCategory: 'Streetlights',
      confidence: 0.98,
      classificationReason: 'Verified full installation of high-efficiency LED luminaires with smart light sensors.',
      modelVersion: 'CivicPulse-Vision-v2.4 (Multimodal Core)',
      visualFeatures: ['Modern LED installation', 'Even lux distribution', 'Operational verification'],
    },
    history: [
      {
        complaintId: 'CP-2026-902',
        status: 'New',
        note: 'Citizen report of flickering old lamps on Civil Lines.',
        changedBy: 'Citizen Mobile App',
        changedAt: '2026-10-11T10:00:00.000Z',
      },
      {
        complaintId: 'CP-2026-902',
        status: 'In Progress',
        note: 'Work crew installing new smart LED arms.',
        changedBy: 'Electrical Supervisor',
        changedAt: '2026-10-12T09:00:00.000Z',
      },
      {
        complaintId: 'CP-2026-902',
        status: 'Resolved',
        note: 'All 12 lamps replaced, calibrated, and connected to central municipal IoT lighting grid.',
        changedBy: 'Chief Electrical Inspector',
        changedAt: '2026-10-12T17:00:00.000Z',
        evidencePhotoUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
      },
    ],
    resolutionEvidence: {
      afterPhotoUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
      completedAt: '2026-10-12T17:00:00.000Z',
      crewNotes: 'Installed 12 commercial 150W LED heads. Verified nighttime lux output exceeds municipal safety standard (>25 lux).',
      inspectorName: 'Chief Electrical Inspector Farooq',
    },
  },
];
