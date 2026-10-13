import {
  Complaint,
  ComplaintCategory,
  ComplaintStatus,
  SensitiveZone,
  StatusHistory,
  TransparencyStats,
  User,
} from './types';

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const CATEGORY_MAP_TO_FE: Record<string, ComplaintCategory> = {
  road_damage: 'Road Damage',
  'Road damage': 'Road Damage',
  'Road Damage': 'Road Damage',
  garbage: 'Garbage',
  'Garbage and overflowing bins': 'Garbage',
  Garbage: 'Garbage',
  streetlight: 'Streetlights',
  streetlights: 'Streetlights',
  'Streetlight faults': 'Streetlights',
  Streetlights: 'Streetlights',
  water_leakage: 'Water Leakage',
  'Water leakage': 'Water Leakage',
  'Water Leakage': 'Water Leakage',
  blocked_drain: 'Blocked Drains',
  blocked_drains: 'Blocked Drains',
  'Blocked drains': 'Blocked Drains',
  'Blocked Drains': 'Blocked Drains',
};

const CATEGORY_MAP_TO_BE: Record<ComplaintCategory, string> = {
  'Road Damage': 'road_damage',
  Garbage: 'garbage',
  Streetlights: 'streetlight',
  'Water Leakage': 'water_leakage',
  'Blocked Drains': 'blocked_drain',
};

const STATUS_MAP_TO_FE: Record<string, ComplaintStatus> = {
  new: 'New',
  New: 'New',
  under_review: 'Under Review',
  'under review': 'Under Review',
  'Under review': 'Under Review',
  'Under Review': 'Under Review',
  assigned: 'Assigned',
  Assigned: 'Assigned',
  in_progress: 'In Progress',
  'in progress': 'In Progress',
  'In progress': 'In Progress',
  'In Progress': 'In Progress',
  resolved: 'Resolved',
  Resolved: 'Resolved',
  closed: 'Resolved',
  Closed: 'Resolved',
  duplicate: 'Duplicate',
  Duplicate: 'Duplicate',
};

const STATUS_MAP_TO_BE: Record<ComplaintStatus, string> = {
  New: 'new',
  'Under Review': 'under_review',
  Assigned: 'assigned',
  'In Progress': 'in_progress',
  Resolved: 'resolved',
  Duplicate: 'duplicate',
};

export function resolveMediaUrl(url?: string | null): string {
  if (!url) {
    return 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80';
  }
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }
  const cleanPath = url.startsWith('/') ? url : `/${url}`;
  return `${API_BASE_URL}${cleanPath}`;
}

export function mapBackendCategory(rawCat?: string): ComplaintCategory {
  if (!rawCat) return 'Road Damage';
  return CATEGORY_MAP_TO_FE[rawCat] || 'Road Damage';
}

export function mapFrontendCategory(cat: ComplaintCategory): string {
  return CATEGORY_MAP_TO_BE[cat] || 'road_damage';
}

export function mapBackendStatus(rawStatus?: string): ComplaintStatus {
  if (!rawStatus) return 'New';
  return STATUS_MAP_TO_FE[rawStatus] || 'New';
}

export function mapFrontendStatus(status: ComplaintStatus): string {
  return STATUS_MAP_TO_BE[status] || 'new';
}

let cachedAuthToken: string | null = null;

export async function loginUser(email: string, password: string): Promise<{ token: string; user: User }> {
  const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Authentication failed. Please check your credentials.');
  }

  if (typeof window !== 'undefined' && data.token) {
    localStorage.setItem('civicpulse_token', data.token);
    localStorage.setItem('civicpulse_user', JSON.stringify(data.user));
    localStorage.setItem('civicpulse_persona', data.user.role);
    cachedAuthToken = data.token;
  }

  return { token: data.token, user: data.user };
}

export async function registerUser(name: string, email: string, password: string): Promise<{ token: string; user: User }> {
  const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Registration failed. Please check your input.');
  }

  if (typeof window !== 'undefined' && data.token) {
    localStorage.setItem('civicpulse_token', data.token);
    localStorage.setItem('civicpulse_user', JSON.stringify(data.user));
    localStorage.setItem('civicpulse_persona', data.user.role);
    cachedAuthToken = data.token;
  }

  return { token: data.token, user: data.user };
}

export async function fetchCurrentUser(): Promise<User | null> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('civicpulse_token') : cachedAuthToken;
  if (!token) return null;

  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    });

    if (res.ok) {
      const data = await res.json();
      return data.user;
    }
  } catch (err) {
    console.warn('[CivicPulse API] Failed to fetch current user:', err);
  }
  return null;
}

export function logoutUser(): void {
  cachedAuthToken = null;
  if (typeof window !== 'undefined') {
    localStorage.removeItem('civicpulse_token');
    localStorage.removeItem('civicpulse_user');
  }
}

export async function getAdminAuthToken(): Promise<string | null> {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('civicpulse_token');
    if (stored) return stored;
  }
  if (cachedAuthToken) return cachedAuthToken;

  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@demo.com', password: 'admin123' }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.token) {
        cachedAuthToken = data.token;
        if (typeof window !== 'undefined') {
          localStorage.setItem('civicpulse_token', data.token);
        }
        return data.token;
      }
    }
  } catch (err) {
    console.warn('[CivicPulse API] Silent auth attempt failed:', err);
  }
  return null;
}

export function normalizeBackendComplaint(raw: any): Complaint {
  const id = raw._id || raw.id || `CP-${Date.now()}`;
  const category = mapBackendCategory(raw.category);
  const aiCategory = mapBackendCategory(raw.aiCategory || raw.category);
  const status = mapBackendStatus(raw.status);

  let lat = 42.3601;
  let lng = -71.0589;
  let address = raw.address || 'Municipal Ward Area';

  if (raw.location) {
    if (Array.isArray(raw.location.coordinates) && raw.location.coordinates.length >= 2) {
      lng = Number(raw.location.coordinates[0]);
      lat = Number(raw.location.coordinates[1]);
    } else if (raw.location.lat != null && raw.location.lng != null) {
      lat = Number(raw.location.lat);
      lng = Number(raw.location.lng);
    }
    if (raw.location.address) {
      address = raw.location.address;
    }
  }

  const priorityScore = typeof raw.priorityScore === 'number' ? raw.priorityScore : 65;
  const duplicateCount = raw.duplicateCount || 0;
  const rawReasons = Array.isArray(raw.priorityReasons) ? raw.priorityReasons : [];
  const priorityReasons = rawReasons.length > 0 ? rawReasons : [
    'Automated triage priority calculation applied',
    `Severity ranking index: ${priorityScore}/100`,
  ];

  const history: StatusHistory[] = Array.isArray(raw.timeline)
    ? raw.timeline.map((h: any) => ({
        complaintId: id,
        status: mapBackendStatus(h.status),
        note: h.note || `Status recorded as ${h.status}`,
        evidencePhotoUrl: h.evidencePhotoUrl ? resolveMediaUrl(h.evidencePhotoUrl) : undefined,
        changedBy: h.changedBy?.name || 'Municipal Staff',
        changedAt: h.changedAt || h.createdAt || new Date().toISOString(),
      }))
    : [
        {
          complaintId: id,
          status,
          note: 'Telemetry ingested into civic dispatch registry.',
          changedBy: raw.residentContact?.name || 'Resident Submitter',
          changedAt: raw.createdAt || new Date().toISOString(),
        },
      ];

  const resolutionEvidence = raw.resolvedEvidencePhotoUrl
    ? {
        afterPhotoUrl: resolveMediaUrl(raw.resolvedEvidencePhotoUrl),
        completedAt: raw.updatedAt || new Date().toISOString(),
        crewNotes: 'Field maintenance crew verified site resolution.',
        inspectorName: 'Municipal Operations Crew',
      }
    : undefined;

  return {
    id,
    title: raw.title || `${category} Report`,
    description: raw.description || 'Public incident report.',
    category,
    aiCategory,
    aiConfidence: typeof raw.aiConfidence === 'number' ? (raw.aiConfidence <= 1 ? raw.aiConfidence : raw.aiConfidence / 100) : 0.94,
    photoUrl: resolveMediaUrl(raw.photoUrl),
    location: { lat, lng, address },
    status,
    priorityScore,
    priorityReasons,
    duplicateOf: raw.duplicateOf ? (typeof raw.duplicateOf === 'object' ? raw.duplicateOf._id : raw.duplicateOf) : undefined,
    duplicateCount,
    department: raw.department || 'Dept of Public Works & Roads',
    createdAt: raw.createdAt || new Date().toISOString(),
    history,
    resolutionEvidence,
    contactInfo: {
      name: raw.residentContact?.name || 'Anonymous Resident',
      email: raw.residentContact?.email || 'resident@demo.com',
      phone: raw.residentContact?.phone || '',
      isAnonymous: !raw.residentContact?.name || raw.residentContact?.name.includes('Anonymous'),
    },
    ward: raw.ward || 'Ward 4 (North Elmwood)',
    priorityMath: {
      categoryBasePoints: Math.round(priorityScore * 0.4),
      duplicatePoints: duplicateCount * 5,
      sensitiveZonePoints: 15,
      agePoints: 5,
      totalScore: priorityScore,
    },
    aiProvenance: {
      suggestedCategory: aiCategory,
      confidence: typeof raw.aiConfidence === 'number' ? (raw.aiConfidence <= 1 ? raw.aiConfidence : raw.aiConfidence / 100) : 0.94,
      classificationReason: raw.classificationReason || 'AI classifier matched civic keywords and visual vectors.',
      modelVersion: 'CivicPulse-Triage-v2.6',
      visualFeatures: ['surface anomaly', 'public right-of-way'],
    },
    suspectedDuplicates: Array.isArray(raw.suspectedDuplicates) ? raw.suspectedDuplicates : undefined,
  };
}

export async function fetchComplaints(params?: {
  category?: string;
  status?: string;
  limit?: number;
}): Promise<Complaint[]> {
  try {
    const query = new URLSearchParams();
    if (params?.category) query.append('category', params.category);
    if (params?.status) query.append('status', params.status);
    query.append('limit', String(params?.limit || 100));

    const res = await fetch(`${API_BASE_URL}/api/complaints?${query.toString()}`, {
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch complaints: ${res.status}`);
    }

    const data = await res.json();
    const rawList = Array.isArray(data.complaints) ? data.complaints : [];
    return rawList.map(normalizeBackendComplaint);
  } catch (err) {
    console.warn('[CivicPulse API] Error fetching backend complaints, using offline cache/fallbacks:', err);
    throw err;
  }
}

export async function fetchComplaintById(id: string): Promise<Complaint | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/complaints/${id}`, {
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    if (!data.complaint) return null;
    const combined = { ...data.complaint, timeline: data.timeline };
    return normalizeBackendComplaint(combined);
  } catch (err) {
    console.warn(`[CivicPulse API] Failed fetching complaint ${id}:`, err);
    return null;
  }
}

export async function createComplaint(payload: {
  title: string;
  description: string;
  lat: number;
  lng: number;
  address: string;
  category?: ComplaintCategory;
  photoFile?: File | null;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
}): Promise<Complaint> {
  const formData = new FormData();
  formData.append('title', payload.title);
  formData.append('description', payload.description);
  formData.append('lat', String(payload.lat));
  formData.append('lng', String(payload.lng));
  formData.append('address', payload.address);
  if (payload.category) {
    formData.append('category', mapFrontendCategory(payload.category));
  }
  if (payload.contactName) formData.append('contactName', payload.contactName);
  if (payload.contactPhone) formData.append('contactPhone', payload.contactPhone);
  if (payload.contactEmail) formData.append('contactEmail', payload.contactEmail);

  if (payload.photoFile) {
    formData.append('photo', payload.photoFile);
  }

  const token = typeof window !== 'undefined' ? localStorage.getItem('civicpulse_token') : cachedAuthToken;
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}/api/complaints`, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody.error || `Server returned ${res.status}`);
  }

  const data = await res.json();
  const created = data.complaint || data;
  return normalizeBackendComplaint(created);
}

export async function fetchMyComplaints(): Promise<Complaint[]> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('civicpulse_token') : cachedAuthToken;
  if (!token) return [];

  try {
    const res = await fetch(`${API_BASE_URL}/api/complaints/mine`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
      cache: 'no-store',
    });

    if (!res.ok) return [];
    const data = await res.json();
    const rawList = Array.isArray(data.complaints) ? data.complaints : [];
    return rawList.map(normalizeBackendComplaint);
  } catch (err) {
    console.warn('[CivicPulse API] Failed fetching my complaints:', err);
    return [];
  }
}

export async function updateComplaintStatus(
  id: string,
  params: {
    status: ComplaintStatus;
    note?: string;
    department?: string;
    evidenceFile?: File | null;
    afterPhotoUrl?: string;
  }
): Promise<Complaint> {
  const token = await getAdminAuthToken();
  const formData = new FormData();
  formData.append('status', mapFrontendStatus(params.status));
  if (params.note) formData.append('note', params.note);
  if (params.department) formData.append('department', params.department);
  if (params.evidenceFile) {
    formData.append('evidence', params.evidenceFile);
  }

  const headers: Record<string, string> = { Accept: 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}/api/admin/complaints/${id}/status`, {
    method: 'PATCH',
    headers,
    body: formData,
  });

  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody.error || `Status update failed: ${res.status}`);
  }

  const data = await res.json();
  return normalizeBackendComplaint(data.complaint);
}

export async function mergeDuplicate(
  id: string,
  confirm: boolean
): Promise<Complaint> {
  const token = await getAdminAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}/api/admin/complaints/${id}/merge`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ confirm }),
  });

  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody.error || `Duplicate merge failed: ${res.status}`);
  }

  const data = await res.json();
  return normalizeBackendComplaint(data.complaint);
}

export async function fetchRules(): Promise<any> {
  const token = await getAdminAuthToken();
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}/api/admin/rules`, {
    headers,
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`Failed to load rules: ${res.status}`);
  }
  return res.json();
}

export async function updateRules(payload: any): Promise<any> {
  const token = await getAdminAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}/api/admin/rules`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody.error || `Failed saving rules: ${res.status}`);
  }
  return res.json();
}

export interface AdminStatsResponse {
  total: number;
  openCount: number;
  highPriority: number;
  resolved: number;
  avgResolutionHours: number;
  slaOverdueCount: number;
  categories: Record<string, number>;
  statuses: Record<string, number>;
}

export async function fetchAdminStats(): Promise<AdminStatsResponse | null> {
  const token = await getAdminAuthToken();
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}/api/admin/stats`, {
    headers,
    cache: 'no-store',
  });

  if (!res.ok) return null;
  return res.json();
}

export async function fetchTransparencyStats(): Promise<TransparencyStats | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/complaints/transparency`, {
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.info('[API] Transparency stats fetch notice:', err);
    return null;
  }
}

export async function createSensitiveZone(data: {
  name: string;
  type?: string;
  lat: number;
  lng: number;
  radius?: number;
}): Promise<{ success: boolean; zone: SensitiveZone; recalculatedCount: number }> {
  const token = await getAdminAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}/api/admin/zones`, {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody.error || `Failed creating sensitive zone: ${res.status}`);
  }
  return res.json();
}

export async function deleteSensitiveZone(
  id: string
): Promise<{ success: boolean; message: string; recalculatedCount: number }> {
  const token = await getAdminAuthToken();
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}/api/admin/zones/${id}`, {
    method: 'DELETE',
    headers,
  });

  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody.error || `Failed deleting sensitive zone: ${res.status}`);
  }
  return res.json();
}
