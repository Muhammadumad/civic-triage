'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { MapLoadingSkeleton } from './MapLoadingSkeleton';
import type { Complaint } from '@/lib/types';

interface CivicMapProps {
  complaints: Complaint[];
  selectedId?: string;
  onSelectComplaint?: (complaint: Complaint) => void;
  center?: [number, number];
  zoom?: number;
  height?: string;
}

// Next.js dynamic import disabling SSR for Leaflet map component
const DynamicCivicMapInner = dynamic(
  () => import('./CivicMapInner'),
  {
    ssr: false,
    loading: () => <MapLoadingSkeleton height="460px" />,
  }
);

export function CivicMap(props: CivicMapProps) {
  return <DynamicCivicMapInner {...props} />;
}

export default CivicMap;
