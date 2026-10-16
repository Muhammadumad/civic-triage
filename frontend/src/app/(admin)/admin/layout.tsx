'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Loader2, ShieldAlert } from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    // Check authentication token and role
    const token = localStorage.getItem('civicpulse_token');
    const storedUser = localStorage.getItem('civicpulse_user');

    if (!token) {
      setIsAuthorized(false);
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    try {
      if (storedUser) {
        const user = JSON.parse(storedUser);
        if (user.role === 'admin') {
          setIsAuthorized(true);
          return;
        }
      }
    } catch {}

    // Non-admin or invalid user session
    setIsAuthorized(false);
    router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
  }, [router, pathname]);

  return (
    <>
      {isAuthorized !== true && (
        <div className="fixed inset-0 z-50 bg-[var(--canvas-base)] flex flex-col items-center justify-center text-center px-4">
          <div className="w-14 h-14 rounded-2xl bg-black/5 dark:bg-white/5 border border-[var(--border-subtle)] flex items-center justify-center text-emerald-500 mb-4 shadow-xl">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
          <h2 className="text-sm font-bold text-[var(--text-primary)] mb-1 flex items-center justify-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-emerald-500" />
            <span>Verifying Dispatcher Credentials</span>
          </h2>
          <p className="text-xs text-[var(--text-secondary)]">
            Securing municipal administrative console session...
          </p>
        </div>
      )}
      <div className={isAuthorized === true ? 'contents' : 'invisible'}>
        {children}
      </div>
    </>
  );
}
