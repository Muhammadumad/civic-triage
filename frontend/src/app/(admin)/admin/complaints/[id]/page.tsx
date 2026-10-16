import React from 'react';
import AdminComplaintDetailClient from './AdminComplaintDetailClient';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminComplaintDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <AdminComplaintDetailClient id={id} />;
}
