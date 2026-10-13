'use client';

import React, { useEffect, useRef, useState } from 'react';
import type { Complaint, SensitiveZone } from '@/lib/types';
import { CATEGORY_THEME, getPriorityLevel, PRIORITY_THEME, SAMPLE_SENSITIVE_ZONES } from '@/lib/types';

interface CivicMapInnerProps {
  complaints: Complaint[];
  selectedId?: string;
  onSelectComplaint?: (complaint: Complaint) => void;
  center?: [number, number];
  zoom?: number;
  height?: string;
  sensitiveZones?: SensitiveZone[];
}

export default function CivicMapInner({
  complaints,
  selectedId,
  onSelectComplaint,
  center = [25.3960, 68.3578],
  zoom = 13,
  height = '460px',
  sensitiveZones = SAMPLE_SENSITIVE_ZONES,
}: CivicMapInnerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<Map<string, any>>(new Map());
  const [showAffectedAreas, setShowAffectedAreas] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined' || !mapContainerRef.current) return;

    let isMounted = true;

    import('leaflet').then((L) => {
      if (!isMounted || !mapContainerRef.current) return;

      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.off();
          mapInstanceRef.current.remove();
        } catch (_) {}
        mapInstanceRef.current = null;
      }

      if (mapContainerRef.current) {
        delete (mapContainerRef.current as any)._leaflet_id;
      }

      // Initialize Map
      const map = L.map(mapContainerRef.current, {
        center,
        zoom,
        zoomControl: true,
        attributionControl: false,
      });

      mapInstanceRef.current = map;

      // Free OpenStreetMap vector raster tiles
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(map);

      L.control
        .attribution({ position: 'bottomright' })
        .addAttribution('&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors')
        .addTo(map);

      const bounds = L.latLngBounds([]);
      markersRef.current.clear();

      // Render Sensitive Zones (Safety corridors)
      if (showAffectedAreas) {
        sensitiveZones.forEach((zone) => {
          if (!zone.lat || !zone.lng) return;
          const pos: [number, number] = [zone.lat, zone.lng];
          bounds.extend(pos);

          const isHospital = zone.type === 'hospital';
          const zoneColor = isHospital ? '#EF4444' : '#3B82F6';

          L.circle(pos, {
            radius: zone.radius || 200,
            color: zoneColor,
            weight: 1.5,
            dashArray: '5, 5',
            fillColor: zoneColor,
            fillOpacity: 0.12,
          }).addTo(map);
        });
      }

      // Render Complaints & Affected Impact Radiuses
      complaints.forEach((item) => {
        if (!item.location?.lat || !item.location?.lng) return;
        const pos: [number, number] = [item.location.lat, item.location.lng];
        bounds.extend(pos);

        const catTheme = CATEGORY_THEME[item.category] || CATEGORY_THEME['Road Damage'];
        const pLevel = getPriorityLevel(item.priorityScore);
        const pTheme = PRIORITY_THEME[pLevel];
        const isSelected = item.id === selectedId;

        // Affected Impact Buffer Circle
        if (showAffectedAreas) {
          const impactRadius = pLevel === 'High' ? 200 : pLevel === 'Medium' ? 120 : 60;
          L.circle(pos, {
            radius: impactRadius,
            color: catTheme.hex,
            weight: isSelected ? 2 : 1.2,
            dashArray: '4, 4',
            fillColor: catTheme.hex,
            fillOpacity: isSelected ? 0.22 : 0.12,
          }).addTo(map);
        }

        // Custom Pin
        const customIcon = L.divIcon({
          className: 'custom-civic-marker',
          iconSize: [36, 36],
          iconAnchor: [18, 18],
          popupAnchor: [0, -18],
          html: `
            <div style="
              width: 32px;
              height: 32px;
              background-color: var(--surface-card);
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

        const marker = L.marker(pos, { icon: customIcon }).addTo(map);

        // Rich Popup
        const popupContent = document.createElement('div');
        popupContent.className = 'p-1 text-slate-100 min-w-[230px]';
        popupContent.innerHTML = `
          <div style="font-family: inherit;">
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 6px;">
              <span style="font-size: 11px; font-weight: 600; padding: 2px 6px; border-radius: 4px; background: ${catTheme.hex}22; color: ${catTheme.hex}; border: 1px solid ${catTheme.hex}44;">
                ${item.category}
              </span>
              <span style="font-size: 11px; font-weight: 700; color: ${pTheme.hex}; background: ${pTheme.hex}20; padding: 2px 6px; border-radius: 4px; border: 1px solid ${pTheme.hex}44;">
                Priority: ${item.priorityScore}
              </span>
            </div>
            <div style="font-size: 13px; font-weight: 600; color: #fff; margin-bottom: 4px; line-height: 1.3;">
              ${item.title}
            </div>
            <div style="font-size: 11px; color: #94A3B8; margin-bottom: 6px; line-height: 1.4;">
              ${item.location.address}
            </div>
            <div style="font-size: 10px; color: #F59E0B; margin-bottom: 6px;">
              • Hazard perimeter: active affected zone
            </div>
            <div style="font-size: 11px; color: #10B981; font-weight: 500; display: flex; align-items: center; justify-content: space-between;">
              <span>Status: <b>${item.status}</b></span>
              <span>${item.duplicateCount > 0 ? `+${item.duplicateCount} reports` : ''}</span>
            </div>
          </div>
        `;

        marker.bindPopup(popupContent);
        marker.on('click', () => {
          if (onSelectComplaint) onSelectComplaint(item);
        });

        markersRef.current.set(item.id, marker);
      });

      // Fit bounds if valid coordinates exist
      if (bounds.isValid() && complaints.length > 0) {
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
      }
    });

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [complaints, center, zoom, selectedId, onSelectComplaint, sensitiveZones, showAffectedAreas]);

  return (
    <div 
      style={{ height, width: '100%' }}
      className="rounded-2xl overflow-hidden border border-white/[0.08] shadow-2xl relative z-0"
    >
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Quick layer toggle */}
      <div className="absolute top-3 right-3 z-10 bg-[var(--surface-card)]/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-[var(--border-subtle)] text-[11px] shadow-lg flex items-center gap-2">
        <label className="flex items-center gap-1.5 cursor-pointer text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
          <input
            type="checkbox"
            checked={showAffectedAreas}
            onChange={(e) => setShowAffectedAreas(e.target.checked)}
            className="rounded border-[var(--border-subtle)] text-emerald-500 focus:ring-emerald-500 w-3.5 h-3.5"
          />
          <span>Show Affected Area Buffers</span>
        </label>
      </div>
    </div>
  );
}
