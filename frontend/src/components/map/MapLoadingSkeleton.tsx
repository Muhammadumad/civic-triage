'use client';

import React from 'react';
import { MapPin, Loader2 } from 'lucide-react';

export function MapLoadingSkeleton({ height = '450px' }: { height?: string }) {
  return (
    <div 
      style={{ height }}
      className="w-full rounded-2xl border border-white/[0.08] bg-[#11131A] relative overflow-hidden flex flex-col items-center justify-center p-6"
    >
      {/* Background grid simulation */}
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#10B981_1px,transparent_1px)] [background-size:20px_20px]" />
      
      <div className="relative z-10 flex flex-col items-center gap-3 text-center">
        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 animate-pulse">
          <MapPin className="w-6 h-6" />
        </div>
        <div>
          <h4 className="text-sm font-medium text-white flex items-center justify-center gap-2">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
            Initializing GIS Geographic Layer
          </h4>
          <p className="text-xs text-zinc-400 mt-1 max-w-xs">
            Loading municipal spatial coordinates and priority incident cluster nodes...
          </p>
        </div>
      </div>
    </div>
  );
}
