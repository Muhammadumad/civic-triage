'use client';

import { useState, useEffect, useCallback } from 'react';
import { Complaint, SAMPLE_COMPLAINTS, StatusHistory } from './types';

const STORAGE_KEY = 'civicpulse_complaints_v1';

export function getStoredComplaints(): Complaint[] {
  if (typeof window === 'undefined') return SAMPLE_COMPLAINTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SAMPLE_COMPLAINTS));
      return SAMPLE_COMPLAINTS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed reading complaints from localStorage:', err);
    return SAMPLE_COMPLAINTS;
  }
}

export function saveStoredComplaints(complaints: Complaint[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(complaints));
    window.dispatchEvent(new Event('civicpulse_complaints_updated'));
  } catch (err) {
    console.error('Failed writing complaints to localStorage:', err);
  }
}

export function useComplaintsStore() {
  const [complaints, setComplaints] = useState<Complaint[]>(SAMPLE_COMPLAINTS);
  const [isLoaded, setIsLoaded] = useState(false);

  const reload = useCallback(() => {
    const data = getStoredComplaints();
    setComplaints(data);
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    reload();
    const handleStorageUpdate = () => reload();
    window.addEventListener('civicpulse_complaints_updated', handleStorageUpdate);
    window.addEventListener('storage', handleStorageUpdate);
    return () => {
      window.removeEventListener('civicpulse_complaints_updated', handleStorageUpdate);
      window.removeEventListener('storage', handleStorageUpdate);
    };
  }, [reload]);

  const addComplaint = useCallback((complaint: Complaint) => {
    const existing = getStoredComplaints();
    const updated = [complaint, ...existing];
    saveStoredComplaints(updated);
    setComplaints(updated);
  }, []);

  const getComplaintById = useCallback((id: string): Complaint | undefined => {
    const list = getStoredComplaints();
    return list.find((c) => c.id === id);
  }, []);

  const updateComplaint = useCallback((id: string, updates: Partial<Complaint>) => {
    const existing = getStoredComplaints();
    const updated = existing.map((c) => (c.id === id ? { ...c, ...updates } : c));
    saveStoredComplaints(updated);
    setComplaints(updated);
  }, []);

  const reopenComplaint = useCallback((id: string, reason: string) => {
    const existing = getStoredComplaints();
    const updated = existing.map((c) => {
      if (c.id === id) {
        const historyEntry: StatusHistory = {
          complaintId: id,
          status: 'Under Review',
          note: `Citizen reopened issue within 72h window: "${reason}"`,
          changedBy: 'Sarah Chen (Resident)',
          changedAt: new Date().toISOString(),
        };
        const currentHistory = c.history || [];
        return {
          ...c,
          status: 'Under Review' as const,
          history: [...currentHistory, historyEntry],
        };
      }
      return c;
    });
    saveStoredComplaints(updated);
    setComplaints(updated);
  }, []);

  const confirmMergeDuplicate = useCallback((complaintId: string, duplicateId: string) => {
    const existing = getStoredComplaints();
    const updated = existing.map((c) => {
      if (c.id === complaintId) {
        const remainingSuspects = (c.suspectedDuplicates || []).filter((d) => d.id !== duplicateId);
        const newDupCount = c.duplicateCount + 1;
        const newScore = Math.min(100, c.priorityScore + 7);
        const historyEntry: StatusHistory = {
          complaintId,
          status: c.status,
          note: `Admin confirmed duplicate merge with ${duplicateId}. Urgency score boosted (+7 pts).`,
          changedBy: 'Marcus Vance (City Admin)',
          changedAt: new Date().toISOString(),
        };
        return {
          ...c,
          duplicateCount: newDupCount,
          priorityScore: newScore,
          priorityReasons: [
            ...c.priorityReasons,
            `Admin verified recurring cluster duplicate (+7 pts)`,
          ],
          suspectedDuplicates: remainingSuspects,
          history: [...(c.history || []), historyEntry],
        };
      }
      return c;
    });
    saveStoredComplaints(updated);
    setComplaints(updated);
  }, []);

  const rejectDuplicate = useCallback((complaintId: string, duplicateId: string) => {
    const existing = getStoredComplaints();
    const updated = existing.map((c) => {
      if (c.id === complaintId) {
        const remainingSuspects = (c.suspectedDuplicates || []).filter((d) => d.id !== duplicateId);
        const historyEntry: StatusHistory = {
          complaintId,
          status: c.status,
          note: `Admin audited and rejected suspected duplicate ${duplicateId} (Distinct incident verified).`,
          changedBy: 'Marcus Vance (City Admin)',
          changedAt: new Date().toISOString(),
        };
        return {
          ...c,
          suspectedDuplicates: remainingSuspects,
          history: [...(c.history || []), historyEntry],
        };
      }
      return c;
    });
    saveStoredComplaints(updated);
    setComplaints(updated);
  }, []);

  const updateStatusWithEvidence = useCallback((
    id: string,
    newStatus: any,
    department: string,
    note: string,
    afterPhotoUrl?: string
  ) => {
    const existing = getStoredComplaints();
    const updated = existing.map((c) => {
      if (c.id === id) {
        const historyEntry: StatusHistory = {
          complaintId: id,
          status: newStatus,
          note: note || `Status transitioned to ${newStatus}.`,
          evidencePhotoUrl: afterPhotoUrl,
          changedBy: 'Marcus Vance (City Admin)',
          changedAt: new Date().toISOString(),
        };
        const resEvidence = newStatus === 'Resolved' && afterPhotoUrl ? {
          afterPhotoUrl,
          completedAt: new Date().toISOString(),
          crewNotes: note || 'Field crew completed repair and verified site clearance.',
          inspectorName: 'Marcus Vance (Chief Dispatcher)',
        } : c.resolutionEvidence;

        return {
          ...c,
          status: newStatus,
          department: department || c.department,
          resolutionEvidence: resEvidence,
          history: [...(c.history || []), historyEntry],
        };
      }
      return c;
    });
    saveStoredComplaints(updated);
    setComplaints(updated);
  }, []);

  return {
    complaints,
    isLoaded,
    addComplaint,
    getComplaintById,
    updateComplaint,
    reopenComplaint,
    confirmMergeDuplicate,
    rejectDuplicate,
    updateStatusWithEvidence,
  };
}
