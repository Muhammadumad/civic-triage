import React from 'react';
import ComplaintTrackingClient from './ComplaintTrackingClient';

export function generateStaticParams() {
  return [
    { id: 'CP-2026-891' },
    { id: 'CP-2026-892' },
    { id: 'CP-2026-893' },
    { id: 'CP-2026-894' },
    { id: 'CP-2026-895' },
  ];
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ComplaintDetailsPage({ params }: PageProps) {
  const { id } = await params;
  return <ComplaintTrackingClient id={id} />;
}
