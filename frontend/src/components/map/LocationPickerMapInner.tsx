'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Navigation, MapPin, Loader2, Compass } from 'lucide-react';

interface LocationPickerProps {
  lat: number;
  lng: number;
  address: string;
  onChangeLocation: (loc: { lat: number; lng: number; address: string }) => void;
  height?: string;
}

export default function LocationPickerMapInner({
  lat,
  lng,
  address,
  onChangeLocation,
  height = '340px',
}: LocationPickerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number }>({ lat, lng });

  // Reverse geocode helper
  const reverseGeocode = async (latitude: number, longitude: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
        { headers: { 'Accept-Language': 'en' } }
      );
      if (response.ok) {
        const data = await response.json();
        if (data.display_name) {
          const parts = data.display_name.split(',');
          const simplified = parts.slice(0, 3).join(',').trim();
          onChangeLocation({ lat: latitude, lng: longitude, address: simplified });
          return;
        }
      }
    } catch (e) {
      // Fallback if network blocked or offline
    }
    // Fallback standard address
    onChangeLocation({
      lat: latitude,
      lng: longitude,
      address: `Incident Node near ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
    });
  };

  useEffect(() => {
    if (typeof window === 'undefined' || !mapContainerRef.current) return;

    let isMounted = true;

    import('leaflet').then((L) => {
      if (!isMounted || !mapContainerRef.current) return;

      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }

      const map = L.map(mapContainerRef.current, {
        center: [lat, lng],
        zoom: 15,
        zoomControl: false,
        attributionControl: false,
      });
      mapRef.current = map;

      // Public OpenStreetMap tiles - 100% free, no API key required
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(map);

      // Custom pulsing emerald pin marker
      const pinIcon = L.divIcon({
        className: 'civic-draggable-pin',
        iconSize: [40, 40],
        iconAnchor: [20, 20],
        html: `
          <div style="position: relative; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center;">
            <div style="
              position: absolute;
              width: 36px;
              height: 36px;
              border-radius: 50%;
              background: rgba(16, 185, 129, 0.35);
              animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;
            "></div>
            <div style="
              position: relative;
              width: 26px;
              height: 26px;
              border-radius: 50%;
              background: #090A0F;
              border: 3px solid #10B981;
              box-shadow: 0 0 16px #10B981, inset 0 0 6px rgba(16, 185, 129, 0.5);
              display: flex;
              align-items: center;
              justify-content: center;
              cursor: grab;
            ">
              <div style="width: 8px; height: 8px; border-radius: 50%; background: #10B981;"></div>
            </div>
          </div>
        `,
      });

      const marker = L.marker([lat, lng], {
        draggable: true,
        icon: pinIcon,
      }).addTo(map);
      markerRef.current = marker;

      // Update on drag
      marker.on('dragend', (e: any) => {
        const newPos = e.target.getLatLng();
        setCurrentCoords({ lat: newPos.lat, lng: newPos.lng });
        reverseGeocode(newPos.lat, newPos.lng);
      });

      // Click on map to place pin
      map.on('click', (e: any) => {
        const { lat: clickLat, lng: clickLng } = e.latlng;
        marker.setLatLng([clickLat, clickLng]);
        setCurrentCoords({ lat: clickLat, lng: clickLng });
        reverseGeocode(clickLat, clickLng);
      });
    });

    return () => {
      isMounted = false;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setCurrentCoords({ lat: latitude, lng: longitude });
        if (mapRef.current && markerRef.current) {
          mapRef.current.setView([latitude, longitude], 16);
          markerRef.current.setLatLng([latitude, longitude]);
        }
        reverseGeocode(latitude, longitude).finally(() => setIsLocating(false));
      },
      (err) => {
        setIsLocating(false);
        // Fallback default coordinates if denied
        if (mapRef.current && markerRef.current) {
          mapRef.current.setView([25.3960, 68.3578], 15);
          markerRef.current.setLatLng([25.3960, 68.3578]);
        }
        reverseGeocode(25.3960, 68.3578);
      },
      { timeout: 7000 }
    );
  };

  return (
    <div className="relative rounded-2xl overflow-hidden border border-white/[0.08] shadow-lg">
      <div ref={mapContainerRef} style={{ height, width: '100%' }} className="relative z-0" />

      {/* Top Floating Controls */}
      <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none gap-2">
        {/* Monospace coordinates badge */}
        <div className="pointer-events-auto flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#090A0F]/85 backdrop-blur-md border border-white/10 text-xs shadow-md">
          <Compass className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span className="font-mono text-zinc-300">
            {currentCoords.lat.toFixed(5)}°, {currentCoords.lng.toFixed(5)}°
          </span>
        </div>

        {/* Use Current Location Button */}
        <button
          type="button"
          onClick={handleUseCurrentLocation}
          disabled={isLocating}
          className="pointer-events-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#11131A]/90 hover:bg-[#161922] backdrop-blur-md border border-emerald-500/30 text-emerald-400 text-xs font-semibold shadow-md transition-all active:scale-95 disabled:opacity-50"
        >
          {isLocating ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Navigation className="w-3.5 h-3.5" />
          )}
          <span>{isLocating ? 'Locating...' : 'Use Current Location'}</span>
        </button>
      </div>

      {/* Bottom Reverse-geocoded Address overlay */}
      <div className="absolute bottom-3 left-3 right-3 z-10 pointer-events-auto">
        <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[#090A0F]/90 backdrop-blur-md border border-white/10 text-xs shadow-xl">
          <div className="w-6 h-6 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <MapPin className="w-3.5 h-3.5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold">
              Reverse-Geocoded Incident Coordinates
            </div>
            <div className="text-white font-medium truncate mt-0.5">{address}</div>
          </div>
          <span className="text-[10px] text-zinc-400 hidden sm:inline-block border-l border-white/10 pl-2">
            Drag pin to adjust
          </span>
        </div>
      </div>
    </div>
  );
}
