'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Complaint, CATEGORY_THEME, PRIORITY_THEME, getPriorityLevel, SensitiveZone, SAMPLE_SENSITIVE_ZONES } from '@/lib/types';

interface AdminSpatialMapInnerProps {
  complaints: Complaint[];
  selectedPriorityFilter?: 'all' | 'high' | 'medium' | 'low';
  sensitiveZones?: SensitiveZone[];
}

export default function AdminSpatialMapInner({
  complaints,
  selectedPriorityFilter = 'all',
  sensitiveZones = SAMPLE_SENSITIVE_ZONES,
}: AdminSpatialMapInnerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  // Layer toggles
  const [showAffectedBuffers, setShowAffectedBuffers] = useState(true);
  const [showSensitiveZones, setShowSensitiveZones] = useState(true);
  const [showHotspotClusters, setShowHotspotClusters] = useState(true);

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

      // Initialize map
      const map = L.map(mapContainerRef.current, {
        center: [25.3960, 68.3578],
        zoom: 13,
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

      // 1. RENDER SENSITIVE MUNICIPAL ZONES (Hospitals, Schools, Highways)
      if (showSensitiveZones) {
        sensitiveZones.forEach((zone) => {
          if (!zone.lat || !zone.lng) return;
          const pos: [number, number] = [zone.lat, zone.lng];
          bounds.extend(pos);

          const isHospital = zone.type === 'hospital';
          const isSchool = zone.type === 'school';
          const isTransit = zone.type === 'transit_hub' || zone.type === 'main road';

          const zoneColor = isHospital ? '#EF4444' : isSchool ? '#3B82F6' : isTransit ? '#F59E0B' : '#10B981';
          const zoneIcon = isHospital ? '🏥' : isSchool ? '🏫' : isTransit ? '🛣️' : '🏛️';
          const zoneTitle = isHospital ? 'Hospital Emergency Zone' : isSchool ? 'School Safety Zone' : isTransit ? 'Transit Corridor' : 'Sensitive Municipal Zone';

          // Affected zone boundary circle
          L.circle(pos, {
            radius: zone.radius || 200,
            color: zoneColor,
            weight: 2,
            dashArray: '6, 6',
            fillColor: zoneColor,
            fillOpacity: 0.16,
          }).addTo(map);

          // Zone Icon Pin
          const zonePin = L.divIcon({
            className: 'sensitive-zone-pin',
            iconSize: [32, 32],
            iconAnchor: [16, 16],
            html: `
              <div style="
                width: 30px;
                height: 30px;
                background: #11131A;
                border: 2px solid ${zoneColor};
                border-radius: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 15px;
                box-shadow: 0 0 16px ${zoneColor}88;
                cursor: pointer;
              ">
                ${zoneIcon}
              </div>
            `,
          });

          const zoneMarker = L.marker(pos, { icon: zonePin }).addTo(map);
          zoneMarker.bindPopup(`
            <div style="font-family: inherit; color: #F3F4F6; min-width: 210px;">
              <div style="font-size: 10px; font-weight: 800; color: ${zoneColor}; text-transform: uppercase; margin-bottom: 2px;">
                ${zoneTitle}
              </div>
              <div style="font-size: 13px; font-weight: 700; color: #fff; margin-bottom: 6px;">
                ${zone.name}
              </div>
              <div style="font-size: 11px; color: #94A3B8; background: rgba(255,255,255,0.06); padding: 5px 8px; border-radius: 6px;">
                <div>• Radius: <strong>${zone.radius || 200}m</strong> affected perimeter</div>
                <div>• Automatic <strong>+20 Priority Escalation</strong> for nearby incidents</div>
              </div>
            </div>
          `);
        });
      }

      // Filter complaints by priority
      const filtered = complaints.filter((c) => {
        const level = getPriorityLevel(c.priorityScore).toLowerCase();
        if (selectedPriorityFilter === 'all') return true;
        return level === selectedPriorityFilter;
      });

      // 2. RENDER COMPLAINTS & AFFECTED INCIDENT PERIMETERS
      filtered.forEach((item) => {
        if (!item.location?.lat || !item.location?.lng) return;
        const pos: [number, number] = [item.location.lat, item.location.lng];
        bounds.extend(pos);

        const pLevel = getPriorityLevel(item.priorityScore);
        const pinColor = pLevel === 'High' ? '#FB7185' : pLevel === 'Medium' ? '#FBBF24' : '#60A5FA';

        // Affected Impact Radius based on severity
        const impactRadius = pLevel === 'High' ? 220 : pLevel === 'Medium' ? 140 : 70;

        // Draw affected impact buffer halo
        if (showAffectedBuffers) {
          L.circle(pos, {
            radius: impactRadius,
            color: pinColor,
            weight: pLevel === 'High' ? 2 : 1.5,
            dashArray: pLevel === 'High' ? '4, 4' : '3, 5',
            fillColor: pinColor,
            fillOpacity: pLevel === 'High' ? 0.22 : pLevel === 'Medium' ? 0.14 : 0.08,
          }).addTo(map);
        }

        // Hotspot cluster ripple for duplicate reports
        if (showHotspotClusters && item.duplicateCount > 0) {
          L.circle(pos, {
            radius: impactRadius + 90,
            color: '#EC4899',
            weight: 1.5,
            dashArray: '8, 6',
            fillColor: '#EC4899',
            fillOpacity: 0.10,
          }).addTo(map);
        }

        // Custom Severity Pin
        const customIcon = L.divIcon({
          className: 'admin-spatial-marker',
          iconSize: [42, 42],
          iconAnchor: [21, 21],
          popupAnchor: [0, -21],
          html: `
            <div style="position: relative; width: 38px; height: 38px; display: flex; align-items: center; justify-content: center;">
              <div style="
                position: absolute;
                width: 36px;
                height: 36px;
                border-radius: 50%;
                background: ${pinColor}33;
                animation: ${pLevel === 'High' ? 'ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite' : 'none'};
              "></div>
              <div style="
                position: relative;
                width: 28px;
                height: 28px;
                border-radius: 50%;
                background: #11131A;
                border: 2.5px solid ${pinColor};
                box-shadow: 0 0 14px ${pinColor}99;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
              ">
                <span style="font-size: 11px; font-weight: 800; font-family: monospace; color: ${pinColor};">
                  ${item.priorityScore}
                </span>
              </div>
            </div>
          `,
        });

        const marker = L.marker(pos, { icon: customIcon }).addTo(map);

        // Scoring reasons
        const reasonsHtml = item.priorityReasons
          .map((r) => `<li style="margin-bottom: 2px;">• ${r}</li>`)
          .join('');

        const popupHtml = `
          <div style="width: 260px; font-family: inherit; color: #F3F4F6;">
            <div style="position: relative; height: 110px; border-radius: 8px; overflow: hidden; margin-bottom: 8px; background: #000;">
              <img src="${item.photoUrl}" style="width: 100%; height: 100%; object-fit: cover;" alt="${item.title}" />
              <div style="position: absolute; top: 6px; left: 6px; padding: 2px 6px; border-radius: 4px; background: rgba(0,0,0,0.75); font-size: 10px; font-weight: 700; color: #fff;">
                ${item.id}
              </div>
              <div style="position: absolute; bottom: 6px; right: 6px; padding: 2px 6px; border-radius: 4px; background: ${pinColor}25; color: ${pinColor}; border: 1px solid ${pinColor}55; font-size: 10px; font-weight: 800;">
                Score: ${item.priorityScore} (${pLevel})
              </div>
            </div>

            <div style="font-size: 13px; font-weight: 700; color: #fff; margin-bottom: 4px; line-height: 1.3;">
              ${item.title}
            </div>

            <div style="font-size: 11px; color: #94A3B8; margin-bottom: 6px; line-height: 1.4;">
              ${item.location.address}
            </div>

            <div style="font-size: 10px; color: #F59E0B; margin-bottom: 6px; font-weight: 600;">
              ⚠️ Affected Perimeter: ~${impactRadius}m impact buffer
            </div>

            <div style="background: rgba(255,255,255,0.05); border-radius: 6px; padding: 6px 8px; margin-bottom: 8px;">
              <div style="font-size: 10px; font-weight: 700; color: #CBD5E1; text-transform: uppercase; margin-bottom: 3px;">
                Scoring Breakdown:
              </div>
              <ul style="font-size: 10px; color: #94A3B8; margin: 0; padding-left: 0; list-style: none;">
                ${reasonsHtml}
              </ul>
            </div>

            <a href="/admin/complaints/${item.id}" style="
              display: block;
              text-align: center;
              padding: 7px 12px;
              border-radius: 8px;
              background: #10B981;
              color: #090A0F;
              font-size: 11px;
              font-weight: 800;
              text-decoration: none;
              box-shadow: 0 0 14px rgba(16, 185, 129, 0.4);
            ">
              Open in Triage Inspector →
            </a>
          </div>
        `;

        marker.bindPopup(popupHtml, { minWidth: 260 });
      });

      // Fit bounds if valid coordinates exist
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
      }
    });

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.off();
          mapInstanceRef.current.remove();
        } catch (_) {}
        mapInstanceRef.current = null;
      }
    };
  }, [complaints, selectedPriorityFilter, sensitiveZones, showAffectedBuffers, showSensitiveZones, showHotspotClusters]);

  const handleFitAll = () => {
    if (!mapInstanceRef.current) return;
    import('leaflet').then((L) => {
      const b = L.latLngBounds([]);
      complaints.forEach((c) => {
        if (c.location?.lat && c.location?.lng) b.extend([c.location.lat, c.location.lng]);
      });
      sensitiveZones.forEach((z) => {
        if (z.lat && z.lng) b.extend([z.lat, z.lng]);
      });
      if (b.isValid()) {
        mapInstanceRef.current.fitBounds(b, { padding: [50, 50], maxZoom: 16 });
      }
    });
  };

  return (
    <div className="w-full h-full min-h-[600px] relative">
      <div ref={mapContainerRef} className="w-full h-full min-h-[600px] z-0" />

      {/* Floating Spatial Layer Controls */}
      <div className="absolute top-4 right-4 z-10 bg-[var(--surface-card)]/95 backdrop-blur-md p-3 rounded-2xl border border-[var(--border-subtle)] shadow-2xl text-xs space-y-2 max-w-xs">
        <div className="font-bold text-[var(--text-primary)] flex items-center justify-between pb-1 border-b border-[var(--border-subtle)]">
          <span>GIS Affected Area Layers</span>
          <button
            onClick={handleFitAll}
            className="text-[10px] text-emerald-600 dark:text-emerald-400 hover:underline font-semibold"
          >
            Fit All
          </button>
        </div>

        <label className="flex items-center gap-2 cursor-pointer text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
          <input
            type="checkbox"
            checked={showAffectedBuffers}
            onChange={(e) => setShowAffectedBuffers(e.target.checked)}
            className="rounded border-[var(--border-subtle)] text-emerald-500 focus:ring-emerald-500"
          />
          <span>Show Incident Hazard Radiuses</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
          <input
            type="checkbox"
            checked={showSensitiveZones}
            onChange={(e) => setShowSensitiveZones(e.target.checked)}
            className="rounded border-[var(--border-subtle)] text-emerald-500 focus:ring-emerald-500"
          />
          <span>Show Sensitive Zones (Hospitals/Schools)</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
          <input
            type="checkbox"
            checked={showHotspotClusters}
            onChange={(e) => setShowHotspotClusters(e.target.checked)}
            className="rounded border-[var(--border-subtle)] text-emerald-500 focus:ring-emerald-500"
          />
          <span>Show Duplicate Hotspot Rings</span>
        </label>
      </div>
    </div>
  );
}
