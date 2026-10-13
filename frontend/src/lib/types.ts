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
    title: 'Severe Pothole on Downtown Transit Arterial',
    description: 'Deep 14-inch crater causing tire punctures near pedestrian crossing and school bus drop-off zone. Water accumulating inside causing asphalt crumbling.',
    category: 'Road Damage',
    aiCategory: 'Road Damage',
    aiConfidence: 0.96,
    photoUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
    location: {
      lat: 25.3960,
      lng: 68.3578,
      address: 'Hyderabad, Sindh, Pakistan',
    },
    status: 'In Progress',
    priorityScore: 88,
    priorityReasons: [
      'Proximity to designated school safety corridor (+25)',
      'Multiple tire blowout reports in 12 hours (+30)',
      'High vehicle throughput corridor (+33)',
    ],
    ward: 'Ward 1 - Financial District',
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
      classificationReason: 'Convolutional neural edge-detector localized 14-inch asphalt subsidence with loose aggregate and water pooling directly within transit lane.',
      modelVersion: 'CivicPulse-Vision-v2.4 (Multimodal Core)',
      visualFeatures: ['Sub-surface structural failure', 'Pavement displacement >12in', 'Active vehicle traffic hazard'],
    },
    suspectedDuplicates: [
      {
        id: 'CP-2026-898-D1',
        title: 'Deep pothole popping bike tires outside 420 Market',
        distanceMeters: 45,
        similarityPct: 94,
        photoUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80',
        createdAt: '2026-10-13T13:10:00.000Z',
        status: 'New',
      },
      {
        id: 'CP-2026-898-D2',
        title: 'Cracked road crater near bus stop',
        distanceMeters: 80,
        similarityPct: 89,
        photoUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
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
        note: 'Work Crew Truck #28 arrived on scene at Market St. Deploying safety cones and thermal patcher.',
        changedBy: 'Supervisor D. Jenkins (Field Operations)',
        changedAt: '2026-10-13T14:35:00.000Z',
      },
    ],
  },
  {
    id: 'CP-2026-892',
    title: 'Main Water Conduit Rupture & Sidewalk Flooding',
    description: 'High-pressure clean water geyser bursting through sidewalk seam. Street basement level flooding hazard detected.',
    category: 'Water Leakage',
    aiCategory: 'Water Leakage',
    aiConfidence: 0.98,
    photoUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80',
    location: {
      lat: 37.7833,
      lng: -122.4167,
      address: '880 Howard St, SoMa, San Francisco',
    },
    status: 'Assigned',
    priorityScore: 92,
    priorityReasons: [
      'Critical utility distribution pipeline affected (+40)',
      'Imminent structural basement damage risk (+35)',
      'Rapid flow volume >200 gal/min (+17)',
    ],
    ward: 'Ward 3 - SoMa District',
    duplicateCount: 9,
    department: 'Water & Utilities Board',
    createdAt: '2026-10-13T11:50:00.000Z',
    priorityMath: {
      categoryBasePoints: 35,
      duplicatePoints: 22,
      sensitiveZonePoints: 20,
      agePoints: 15,
      totalScore: 92,
    },
    aiProvenance: {
      suggestedCategory: 'Water Leakage',
      confidence: 0.98,
      classificationReason: 'High-velocity fluid dynamics identified continuous geyser discharge exceeding 200 gal/min with active asphalt undermining.',
      modelVersion: 'CivicPulse-Vision-v2.4 (Multimodal Core)',
      visualFeatures: ['Pressurized hydraulic rupture', 'Basement entry risk', 'Pedestrian sidewalk impassable'],
    },
    suspectedDuplicates: [
      {
        id: 'CP-2026-892-D1',
        title: 'Geyser bursting through sidewalk near 890 Howard',
        distanceMeters: 25,
        similarityPct: 97,
        photoUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80',
        createdAt: '2026-10-13T11:42:00.000Z',
        status: 'New',
      },
    ],
    history: [
      {
        complaintId: 'CP-2026-892',
        status: 'New',
        note: 'Emergency citizen geyser report registered. AI identified pressurized municipal conduit breach.',
        changedBy: 'Automated AI Intake Engine',
        changedAt: '2026-10-13T11:50:00.000Z',
      },
      {
        complaintId: 'CP-2026-892',
        status: 'Under Review',
        note: 'Priority elevated to 92 due to basement flooding risk and 9 duplicate citizen alerts.',
        changedBy: 'AI Triage Scoring Daemon',
        changedAt: '2026-10-13T11:55:00.000Z',
      },
      {
        complaintId: 'CP-2026-892',
        status: 'Assigned',
        note: 'Dispatched Emergency Valve Isolation Unit 12. ETA 15 minutes.',
        changedBy: 'Water Emergency Control Center',
        changedAt: '2026-10-13T12:05:00.000Z',
      },
    ],
  },
  {
    id: 'CP-2026-893',
    title: 'Overflowing Commercial Dumpster Blocking Alleyway',
    description: 'Sanitation overflow obstructing alleyway egress behind restaurant strip. Attracting pests and obstructing fire exit route.',
    category: 'Garbage',
    aiCategory: 'Garbage',
    aiConfidence: 0.91,
    photoUrl: 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?auto=format&fit=crop&w=800&q=80',
    location: {
      lat: 37.7699,
      lng: -122.4469,
      address: '221 Castro St, Eureka Valley',
    },
    status: 'Under Review',
    priorityScore: 64,
    priorityReasons: [
      'Commercial waste spill spillover (+25)',
      'Secondary fire alleyway egress blockage (+20)',
      'Reported by 3 verified local merchants (+19)',
    ],
    ward: 'Ward 8 - Castro District',
    duplicateCount: 3,
    department: 'Sanitation & Solid Waste Management',
    createdAt: '2026-10-13T09:30:00.000Z',
    priorityMath: {
      categoryBasePoints: 20,
      duplicatePoints: 12,
      sensitiveZonePoints: 18,
      agePoints: 14,
      totalScore: 64,
    },
    aiProvenance: {
      suggestedCategory: 'Garbage',
      confidence: 0.91,
      classificationReason: 'Identified commercial dumpster capacity spillover obstructing secondary emergency egress passage.',
      modelVersion: 'CivicPulse-Vision-v2.4 (Multimodal Core)',
      visualFeatures: ['Debris containment breach', 'Egress corridor blockage', 'Commercial alleyway'],
    },
    history: [
      {
        complaintId: 'CP-2026-893',
        status: 'New',
        note: 'Merchant report registered with photo evidence.',
        changedBy: 'Citizen Web Portal',
        changedAt: '2026-10-13T09:30:00.000Z',
      },
      {
        complaintId: 'CP-2026-893',
        status: 'Under Review',
        note: 'Sanitation supervisor cross-referencing commercial garbage vendor license.',
        changedBy: 'Sanitation Bureau Auditor',
        changedAt: '2026-10-13T10:15:00.000Z',
      },
    ],
  },
  {
    id: 'CP-2026-894',
    title: 'Non-Functional Streetlamp Cluster along Green Park Trail',
    description: 'Consecutive streetlight fixtures out along jogger pathway between 14th Ave and Meadow path. Reduced nighttime visibility.',
    category: 'Streetlights',
    aiCategory: 'Streetlights',
    aiConfidence: 0.89,
    photoUrl: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=800&q=80',
    location: {
      lat: 37.769,
      lng: -122.486,
      address: 'Golden Gate Park, Transverse Dr',
    },
    status: 'New',
    priorityScore: 52,
    priorityReasons: [
      'Nighttime pedestrian safety corridor (+30)',
      'Multiple adjacent poles unpowered (+22)',
    ],
    ward: 'Ward 5 - Richmond District',
    duplicateCount: 2,
    department: 'Municipal Electrical Grid',
    createdAt: '2026-10-13T05:50:00.000Z',
    priorityMath: {
      categoryBasePoints: 15,
      duplicatePoints: 8,
      sensitiveZonePoints: 20,
      agePoints: 9,
      totalScore: 52,
    },
    aiProvenance: {
      suggestedCategory: 'Streetlights',
      confidence: 0.89,
      classificationReason: 'Nighttime luminaire dark-node detection with zero lux output detected along active pedestrian park connector.',
      modelVersion: 'CivicPulse-Vision-v2.4 (Multimodal Core)',
      visualFeatures: ['Darkened trail sector', 'Pole serial tags unpowered'],
    },
    history: [
      {
        complaintId: 'CP-2026-894',
        status: 'New',
        note: 'Citizen night run alert filed. Geotagged to Golden Gate Park trail grid node #14-B.',
        changedBy: 'Citizen Mobile App',
        changedAt: '2026-10-13T05:50:00.000Z',
      },
    ],
  },
  {
    id: 'CP-2026-895',
    title: 'Clogged Stormwater Culvert Prior to Rainstorm',
    description: 'Debris, leaves and silt blocking grate intake ahead of anticipated precipitation warning. Standing water beginning to pool.',
    category: 'Blocked Drains',
    aiCategory: 'Blocked Drains',
    aiConfidence: 0.94,
    photoUrl: 'https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?auto=format&fit=crop&w=800&q=80',
    location: {
      lat: 37.752,
      lng: -122.418,
      address: 'Mission St & 24th St Intersection',
    },
    status: 'Resolved',
    priorityScore: 35,
    priorityReasons: [
      'Routine seasonal buildup (-10)',
      'Scheduled storm response zone clearance (+45)',
    ],
    ward: 'Ward 9 - Mission District',
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
      classificationReason: 'Organic matter and silt accumulation over horizontal drainage inlet grill.',
      modelVersion: 'CivicPulse-Vision-v2.4 (Multimodal Core)',
      visualFeatures: ['Grate obstruction 85%', 'Standing pool depth <3in'],
    },
    history: [
      {
        complaintId: 'CP-2026-895',
        status: 'New',
        note: 'Storm drain blockage flagged ahead of atmospheric river forecast.',
        changedBy: 'Citizen Intake Form',
        changedAt: '2026-10-12T14:50:00.000Z',
      },
      {
        complaintId: 'CP-2026-895',
        status: 'Under Review',
        note: 'Assessed as medium flood risk. Assigned scheduled maintenance window.',
        changedBy: 'AI Triage Scoring Daemon',
        changedAt: '2026-10-12T15:10:00.000Z',
      },
      {
        complaintId: 'CP-2026-895',
        status: 'Assigned',
        note: 'Dispatched Drainage Jetting Crew #9 with high-capacity vacuum truck.',
        changedBy: 'Drainage Operations Division',
        changedAt: '2026-10-13T08:30:00.000Z',
      },
      {
        complaintId: 'CP-2026-895',
        status: 'In Progress',
        note: 'Culvert grates opened. Flushing silt and removing tree branch obstruction.',
        changedBy: 'Crew Foreman Martinez',
        changedAt: '2026-10-13T10:15:00.000Z',
      },
      {
        complaintId: 'CP-2026-895',
        status: 'Resolved',
        note: 'Cleared 180 lbs of debris with vacuum jetter unit VJ-4. Flow rate verified at 100% capacity.',
        changedBy: 'Inspector James Ruiz (Badge #318)',
        changedAt: '2026-10-13T11:40:00.000Z',
        evidencePhotoUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb186f5f8?auto=format&fit=crop&w=800&q=80',
      },
    ],
    resolutionEvidence: {
      afterPhotoUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb186f5f8?auto=format&fit=crop&w=800&q=80',
      completedAt: '2026-10-13T11:40:00.000Z',
      crewNotes: 'Cleared 180 lbs of compacted silt and organic debris with vacuum jetter unit VJ-4. Flow rate restored to 100% capacity. Heavy iron grate repositioned and safety-torqued.',
      inspectorName: 'Inspector James Ruiz (Badge #318)',
    },
  },
];
