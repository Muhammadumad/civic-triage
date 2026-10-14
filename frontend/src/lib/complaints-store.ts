'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Complaint, SAMPLE_COMPLAINTS, StatusHistory } from './types';
import {
  fetchComplaints as apiFetchComplaints,
  fetchComplaintById as apiFetchComplaintById,
  createComplaint as apiCreateComplaint,
  updateComplaintStatus as apiUpdateStatus,
  mergeDuplicate as apiMergeDuplicate,
} from './api';

const STORAGE_KEY = 'civicpulse_complaints_v3';

export function getStoredComplaints(): Complaint[] {
  if (typeof window === 'undefined') return SAMPLE_COMPLAINTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SAMPLE_COMPLAINTS));
      return SAMPLE_COMPLAINTS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : SAMPLE_COMPLAINTS;
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
  const [isSyncing, setIsSyncing] = useState(false);
  const syncRequestedRef = useRef(false);

  // Load cached data upon client mount and store updates
  const reload = useCallback(() => {
    const data = getStoredComplaints();
    setComplaints(data);
    setIsLoaded(true);
  }, []);

  // Sync with live Express/MongoDB backend smoothly in the background
  const syncWithBackend = useCallback(async () => {
    if (isSyncing) return;
    try {
      setIsSyncing(true);
      const backendComplaints = await apiFetchComplaints({ limit: 100 });
      if (backendComplaints && backendComplaints.length > 0) {
        // Merge: keep any local-only complaints that haven't synced yet, then add backend complaints
        const existing = getStoredComplaints();
        const backendIds = new Set(backendComplaints.map((c) => c.id));
        const localOnly = existing.filter((c) => !backendIds.has(c.id) && c.id.startsWith('CP-local-'));

        const merged = [...localOnly, ...backendComplaints];
        saveStoredComplaints(merged);
        setComplaints(merged);
      }
    } catch (err) {
      // Graceful silence: offline mode / backend warming up
      console.info('[CivicPulse Store] Background sync notice (using local cache):', err);
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing]);

  useEffect(() => {
    reload();

    if (!syncRequestedRef.current) {
      syncRequestedRef.current = true;
      syncWithBackend();
    }

    const handleStorageUpdate = () => reload();
    window.addEventListener('civicpulse_complaints_updated', handleStorageUpdate);
    window.addEventListener('storage', handleStorageUpdate);
    return () => {
      window.removeEventListener('civicpulse_complaints_updated', handleStorageUpdate);
      window.removeEventListener('storage', handleStorageUpdate);
    };
  }, [reload, syncWithBackend]);

  // Add new complaint with backend AI triage pipeline and optimistic local display
  const addComplaint = useCallback(async (complaint: Complaint, photoFile?: File | null): Promise<Complaint> => {
    // 1. Optimistic entry for zero UI blocking
    const existing = getStoredComplaints();
    const optimisticList = [complaint, ...existing];
    saveStoredComplaints(optimisticList);
    setComplaints(optimisticList);

    // 2. Transmit to backend for automated AI keyword triage, duplicate check & 2dsphere indexing
    try {
      const createdFromBackend = await apiCreateComplaint({
        title: complaint.title,
        description: complaint.description,
        lat: complaint.location.lat,
        lng: complaint.location.lng,
        address: complaint.location.address,
        category: complaint.category,
        photoFile: photoFile || null,
        contactName: complaint.contactInfo?.name,
        contactPhone: complaint.contactInfo?.phone,
        contactEmail: complaint.contactInfo?.email,
      });

      // Replace optimistic placeholder with real backend-persisted complaint
      const currentStored = getStoredComplaints();
      const updatedList = currentStored.map((c) =>
        c.id === complaint.id ? createdFromBackend : c
      );
      saveStoredComplaints(updatedList);
      setComplaints(updatedList);
      return createdFromBackend;
    } catch (err) {
      console.warn('[CivicPulse Store] Backend submission fallback to local store:', err);
      return complaint;
    }
  }, []);

  // Retrieve complaint by ID, with async backend fallback if not cached
  const getComplaintById = useCallback((id: string): Complaint | undefined => {
    const list = getStoredComplaints();
    const found = list.find((c) => c.id === id);
    if (found) return found;

    // Asynchronously fetch from backend if direct URL was opened
    apiFetchComplaintById(id).then((fromBackend) => {
      if (fromBackend) {
        const current = getStoredComplaints();
        if (!current.some((c) => c.id === fromBackend.id)) {
          const updated = [fromBackend, ...current];
          saveStoredComplaints(updated);
          setComplaints(updated);
        }
      }
    }).catch(() => {});

    return undefined;
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

    // Call backend
    apiUpdateStatus(id, {
      status: 'Under Review',
      note: `Citizen reopened issue: "${reason}"`,
    }).catch((err) => console.warn('Failed updating reopen status on backend:', err));
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

    // Call backend merge route
    apiMergeDuplicate(complaintId, true).catch((err) =>
      console.warn('Backend duplicate merge notice:', err)
    );
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

    // Call backend reject route
    apiMergeDuplicate(complaintId, false).catch((err) =>
      console.warn('Backend duplicate reject notice:', err)
    );
  }, []);

  const updateStatusWithEvidence = useCallback(
    async (
      id: string,
      newStatus: any,
      department: string,
      note: string,
      afterPhotoUrl?: string,
      evidenceFile?: File | null
    ): Promise<Complaint | null> => {
      let resultComplaint: Complaint | null = null;
      const existing = getStoredComplaints();
      const updated = existing.map((c) => {
        if (c.id === id) {
          const historyEntry: StatusHistory = {
            complaintId: id,
            status: newStatus,
            note: note || `Status transitioned to ${newStatus}.`,
            evidencePhotoUrl: afterPhotoUrl,
            changedBy: 'Municipal Operations Dispatch',
            changedAt: new Date().toISOString(),
          };
          const resEvidence =
            newStatus === 'Resolved' && afterPhotoUrl
              ? {
                  afterPhotoUrl,
                  completedAt: new Date().toISOString(),
                  crewNotes: note || 'Field crew completed repair and verified site clearance.',
                  inspectorName: 'Marcus Vance (Chief Dispatcher)',
                }
              : c.resolutionEvidence;

          const updatedC: Complaint = {
            ...c,
            status: newStatus,
            department: department || c.department,
            resolutionEvidence: resEvidence,
            history: [...(c.history || []).filter((h) => h.status !== newStatus), historyEntry],
          };
          resultComplaint = updatedC;
          return updatedC;
        }
        return c;
      });
      saveStoredComplaints(updated);
      setComplaints(updated);

      // Call backend status update to persist in MongoDB and StatusHistory collection
      try {
        const backendUpdated = await apiUpdateStatus(id, {
          status: newStatus,
          department,
          note,
          evidenceFile: evidenceFile || null,
          afterPhotoUrl,
        });
        if (backendUpdated) {
          const current = getStoredComplaints();
          const refreshed = current.map((c) => (c.id === id ? backendUpdated : c));
          saveStoredComplaints(refreshed);
          setComplaints(refreshed);
          return backendUpdated;
        }
      } catch (err) {
        console.warn('Backend status update notice:', err);
      }
      return resultComplaint;
    },
    []
  );

  return {
    complaints,
    isLoaded,
    isSyncing,
    syncWithBackend,
    addComplaint,
    getComplaintById,
    updateComplaint,
    reopenComplaint,
    confirmMergeDuplicate,
    rejectDuplicate,
    updateStatusWithEvidence,
  };
}
