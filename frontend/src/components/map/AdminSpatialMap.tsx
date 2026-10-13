'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { MapLoadingSkeleton } from './MapLoadingSkeleton';
import { Complaint } from '@/lib/types';

interface AdminSpatialMapProps {
  complaints: Complaint[];
  selectedPriorityFilter?: 'all' | 'high' | 'medium' | 'low';
}

const DynamicAdminSpatialMapInner = dynamic(
  () => import('./AdminSpatialMapInner'),
  {
    ssr: false,
    loading: () => <MapLoadingSkeleton height="100%" />,
  }
);

export function AdminSpatialMap(props: AdminSpatialMapProps) {
  return <DynamicAdminSpatialMapInner {...props} />;
}

export default AdminSpatialMap;
