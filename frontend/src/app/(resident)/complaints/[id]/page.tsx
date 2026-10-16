import React from 'react';
import ComplaintTrackingClient from './ComplaintTrackingClient';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ComplaintDetailsPage({ params }: PageProps) {
  const { id } = await params;
  return <ComplaintTrackingClient id={id} />;
}
