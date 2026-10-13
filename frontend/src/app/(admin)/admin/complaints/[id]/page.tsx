import React from 'react';
import AdminComplaintDetailClient from './AdminComplaintDetailClient';

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

export default async function AdminComplaintDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <AdminComplaintDetailClient id={id} />;
}
