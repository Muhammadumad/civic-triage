import React from 'react';

interface CivicPulseLogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function CivicPulseLogo({ size = 'md', className = '' }: CivicPulseLogoProps) {
  const dimensions = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-11 h-11',
  }[size];

  return (
    <div
      className={`relative ${dimensions} bg-[var(--text-primary)] text-[var(--canvas-base)] border border-[var(--border-strong)] flex items-center justify-center shrink-0 overflow-hidden transition-colors duration-200 group-hover:border-[var(--accent-primary)] ${className}`}
      aria-hidden="true"
    >
      {/* Subtle Corner Architectural Ticks */}
      <span className="absolute top-0.5 left-0.5 w-1 h-1 border-t border-l border-current opacity-40" />
      <span className="absolute bottom-0.5 right-0.5 w-1 h-1 border-b border-r border-current opacity-40" />

      <svg
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-[78%] h-[78%]"
      >
        {/* Outer Municipal Ward Octagon / Reticle Frame */}
        <path
          d="M10 4H22L28 10V22L22 28H10L4 22V10L10 4Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeOpacity="0.35"
        />

        {/* Spatial Crosshair Axis */}
        <line x1="16" y1="4" x2="16" y2="9" stroke="currentColor" strokeWidth="1.25" strokeOpacity="0.45" />
        <line x1="16" y1="23" x2="16" y2="28" stroke="currentColor" strokeWidth="1.25" strokeOpacity="0.45" />

        {/* High-Precision Civic Telemetry Pulse Waveform */}
        <path
          d="M5.5 16.5H10.5L13 10.5L16.5 21.5L19.5 14L21.5 16.5H26.5"
          stroke="currentColor"
          strokeWidth="2.1"
          strokeLinecap="square"
          strokeLinejoin="miter"
        />

        {/* Active Dispatch Beacon Node (Burnt International Orange) */}
        <rect
          x="23.5"
          y="6.5"
          width="4"
          height="4"
          fill="var(--accent-primary)"
        />
      </svg>
    </div>
  );
}
