'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { MapLoadingSkeleton } from './MapLoadingSkeleton';

interface LocationPickerProps {
  lat: number;
  lng: number;
  address: string;
  onChangeLocation: (loc: { lat: number; lng: number; address: string }) => void;
  height?: string;
}

const DynamicLocationPickerInner = dynamic(
  () => import('./LocationPickerMapInner'),
  {
    ssr: false,
    loading: () => <MapLoadingSkeleton height="340px" />,
  }
);

export function LocationPickerMap(props: LocationPickerProps) {
  return <DynamicLocationPickerInner {...props} />;
}

export default LocationPickerMap;
