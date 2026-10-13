'use client';

import React, { useEffect, useRef } from 'react';
import type { Complaint } from '@/lib/types';
import { CATEGORY_THEME, getPriorityLevel, PRIORITY_THEME } from '@/lib/types';

interface CivicMapInnerProps {
  complaints: Complaint[];
  selectedId?: string;
  onSelectComplaint?: (complaint: Complaint) => void;
  center?: [number, number];
  zoom?: number;
  height?: string;
}

export default function CivicMapInner({
  complaints,
  selectedId,
  onSelectComplaint,
  center = [25.3960, 68.3578],
  zoom = 13,
  height = '460px',
}: CivicMapInnerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<Map<string, any>>(new Map());

  useEffect(() => {
    if (typeof window === 'undefined' || !mapContainerRef.current) return;

    let isMounted = true;

    // Dynamically import Leaflet inside useEffect to guarantee window availability
    import('leaflet').then((L) => {
      if (!isMounted || !mapContainerRef.current) return;

      // Check if map already initialized on this container
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      // Initialize Map
      const map = L.map(mapContainerRef.current, {
        center,
        zoom,
        zoomControl: true,
        attributionControl: false,
      });

      mapInstanceRef.current = map;

      // Public OpenStreetMap tiles - 100% free, no API key required
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(map);

      // Attribution
      L.control
        .attribution({ position: 'bottomright' })
        .addAttribution('&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors')
        .addTo(map);

      // Render markers
      markersRef.current.clear();

      complaints.forEach((item) => {
        const catTheme = CATEGORY_THEME[item.category] || CATEGORY_THEME['Road Damage'];
        const pLevel = getPriorityLevel(item.priorityScore);
        const pTheme = PRIORITY_THEME[pLevel];

        const isSelected = item.id === selectedId;

        // Custom HTML pin with pulsing glow
        const customIcon = L.divIcon({
          className: 'custom-civic-marker',
          iconSize: [36, 36],
          iconAnchor: [18, 18],
          popupAnchor: [0, -18],
          html: `
            <div style="
              width: 32px;
              height: 32px;
              background-color: #11131A;
              border: 2px solid ${catTheme.hex};
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 0 ${isSelected ? '22px' : '12px'} ${catTheme.hex}99;
              cursor: pointer;
              transform: ${isSelected ? 'scale(1.2)' : 'scale(1)'};
              transition: transform 0.2s ease;
            ">
              <div style="
                width: 14px;
                height: 14px;
                border-radius: 50%;
                background-color: ${catTheme.hex};
              "></div>
            </div>
          `,
        });

        const marker = L.marker([item.location.lat, item.location.lng], {
          icon: customIcon,
        }).addTo(map);

        // Custom Popup
        const popupContent = document.createElement('div');
        popupContent.className = 'p-1 text-slate-100 min-w-[220px]';
        popupContent.innerHTML = `
          <div style="font-family: inherit;">
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 6px;">
              <span style="font-size: 11px; font-weight: 600; padding: 2px 6px; border-radius: 4px; background: ${catTheme.hex}22; color: ${catTheme.hex}; border: 1px solid ${catTheme.hex}44;">
                ${item.category}
              </span>
              <span style="font-size: 11px; font-weight: 700; color: ${pTheme.hex}; background: ${pTheme.hex}20; padding: 2px 6px; border-radius: 4px; border: 1px solid ${pTheme.hex}44;">
                Score: ${item.priorityScore}
              </span>
            </div>
            <div style="font-size: 13px; font-weight: 600; color: #fff; margin-bottom: 4px; line-height: 1.3;">
              ${item.title}
            </div>
            <div style="font-size: 11px; color: #94A3B8; margin-bottom: 8px; line-height: 1.4;">
              ${item.location.address}
            </div>
            <div style="font-size: 11px; color: #10B981; font-weight: 500; display: flex; align-items: center; justify-content: space-between;">
              <span>Status: <b>${item.status}</b></span>
              <span>${item.duplicateCount > 0 ? `+${item.duplicateCount} duplicates` : ''}</span>
            </div>
          </div>
        `;

        marker.bindPopup(popupContent);

        marker.on('click', () => {
          if (onSelectComplaint) {
            onSelectComplaint(item);
          }
        });

        markersRef.current.set(item.id, marker);
      });
    });

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [complaints, center, zoom, selectedId, onSelectComplaint]);

  return (
    <div 
      ref={mapContainerRef} 
      style={{ height, width: '100%' }}
      className="rounded-2xl overflow-hidden border border-white/[0.08] shadow-2xl relative z-0"
    />
  );
}
