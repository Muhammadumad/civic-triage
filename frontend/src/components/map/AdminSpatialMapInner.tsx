'use client';

import React, { useEffect, useRef } from 'react';
import { Complaint, CATEGORY_THEME, PRIORITY_THEME, getPriorityLevel } from '@/lib/types';
import Link from 'next/link';

interface AdminSpatialMapInnerProps {
  complaints: Complaint[];
  selectedPriorityFilter?: 'all' | 'high' | 'medium' | 'low';
}

export default function AdminSpatialMapInner({
  complaints,
  selectedPriorityFilter = 'all',
}: AdminSpatialMapInnerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !mapContainerRef.current) return;

    let isMounted = true;

    import('leaflet').then((L) => {
      if (!isMounted || !mapContainerRef.current) return;

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      // Initialize map centered over municipal core
      const map = L.map(mapContainerRef.current, {
        center: [25.3960, 68.3578],
        zoom: 13,
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

      // Filter complaints by priority band
      const filtered = complaints.filter((c) => {
        const level = getPriorityLevel(c.priorityScore).toLowerCase();
        if (selectedPriorityFilter === 'all') return true;
        return level === selectedPriorityFilter;
      });

      // Render pins colored by priority band
      filtered.forEach((item) => {
        const pLevel = getPriorityLevel(item.priorityScore);
        const pTheme = PRIORITY_THEME[pLevel];
        const catTheme = CATEGORY_THEME[item.category] || CATEGORY_THEME['Road Damage'];

        // Pin color by priority: High = #FB7185, Medium = #FBBF24, Low = #60A5FA
        const pinColor = pLevel === 'High' ? '#FB7185' : pLevel === 'Medium' ? '#FBBF24' : '#60A5FA';

        const customIcon = L.divIcon({
          className: 'admin-spatial-marker',
          iconSize: [42, 42],
          iconAnchor: [21, 21],
          popupAnchor: [0, -21],
          html: `
            <div style="
              position: relative;
              width: 38px;
              height: 38px;
              display: flex;
              align-items: center;
              justify-content: center;
            ">
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
                transition: transform 0.2s ease;
              ">
                <span style="
                  font-size: 11px;
                  font-weight: 800;
                  font-family: monospace;
                  color: ${pinColor};
                ">${item.priorityScore}</span>
              </div>
            </div>
          `,
        });

        const marker = L.marker([item.location.lat, item.location.lng], {
          icon: customIcon,
        }).addTo(map);

        // Rich interactive popup
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

            <div style="font-size: 11px; color: #94A3B8; margin-bottom: 8px; line-height: 1.4;">
              ${item.location.address}
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
    });

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [complaints, selectedPriorityFilter]);

  return <div ref={mapContainerRef} className="w-full h-full min-h-[600px] z-0" />;
}
