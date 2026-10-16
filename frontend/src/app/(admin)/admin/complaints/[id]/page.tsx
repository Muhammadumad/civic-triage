import React, { Suspense } from 'react';
import AdminComplaintDetailClient from './AdminComplaintDetailClient';
import { Loader2 } from 'lucide-react';

interface PageProps {
  params: Promise<{ id: string }>;
}

async function AdminComplaintContent({ params }: PageProps) {
  const { id } = await params;
  return <AdminComplaintDetailClient id={id} />;
}

export default function AdminComplaintDetailPage(props: PageProps) {
  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
          <div className="w-12 h-12 rounded-2xl bg-black/5 dark:bg-white/5 border border-[var(--border-subtle)] flex items-center justify-center text-emerald-500 mb-3 shadow-lg">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
          <p className="text-xs font-mono text-[var(--text-secondary)]">Loading administrative complaint console...</p>
        </div>
      }
    >
      <AdminComplaintContent {...props} />
    </Suspense>
  );
}
