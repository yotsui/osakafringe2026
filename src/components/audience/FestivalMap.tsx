'use client';

import React, { useEffect, useState } from 'react';
import { Venue, Performance } from '@/types';
import { useLanguage } from '@/context/LanguageContext';
import { MapPin, Navigation, Compass, ExternalLink, Calendar, Sparkles } from 'lucide-react';

interface FestivalMapProps {
  venues: Venue[];
  performances?: Performance[];
  selectedVenueId?: string | null;
  onSelectVenue?: (venueId: string) => void;
  onSelectPerformance?: (performance: Performance) => void;
}

export default function FestivalMap({
  venues,
  performances = [],
  selectedVenueId,
  onSelectVenue,
  onSelectPerformance,
}: FestivalMapProps) {
  const { getText, t } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const [activeVenue, setActiveVenue] = useState<Venue | null>(null);

  useEffect(() => {
    setMounted(true);
    if (venues.length > 0 && !activeVenue) {
      if (selectedVenueId) {
        const found = venues.find((v) => v.id === selectedVenueId);
        if (found) setActiveVenue(found);
      } else {
        setActiveVenue(venues[0]);
      }
    }
  }, [venues, selectedVenueId, activeVenue]);

  // Initialize Leaflet
  useEffect(() => {
    if (!mounted || typeof window === 'undefined') return;

    let mapInstance: any = null;

    const initMap = async () => {
      const L = (await import('leaflet')).default;
      const mapContainer = document.getElementById('festival-leaflet-map');
      if (!mapContainer || (mapContainer as any)._leaflet_id) return;

      const center = activeVenue
        ? [activeVenue.location.lat, activeVenue.location.lng]
        : [34.6937, 135.5023];

      const map = L.map('festival-leaflet-map', {
        center: center as [number, number],
        zoom: 13,
        scrollWheelZoom: true,
      });

      mapInstance = map;

      // OpenStreetMap Light tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      // Custom Pink Pin
      const customIcon = L.divIcon({
        className: 'custom-venue-pin',
        html: `
          <div style="
            background: linear-gradient(135deg, #e6007e, #7c3aed);
            width: 32px;
            height: 32px;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 10px rgba(230, 0, 126, 0.4);
            border: 2px solid white;
          ">
            <div style="
              width: 10px;
              height: 10px;
              background: white;
              border-radius: 50%;
              transform: rotate(45deg);
            "></div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
      });

      // Markers
      venues.forEach((v) => {
        const marker = L.marker([v.location.lat, v.location.lng], { icon: customIcon }).addTo(map);

        const vName = getText(v.name, v.nameEn);
        const vArea = getText(v.area, v.areaEn);
        const vAccess = getText(v.access, v.accessEn);
        const navUrl = `https://www.google.com/maps/dir/?api=1&destination=${v.location.lat},${v.location.lng}`;

        const popupContent = `
          <div style="min-width: 200px; font-family: sans-serif; color: #1e293b; padding: 2px;">
            <div style="font-size: 11px; font-weight: bold; color: #e6007e; text-transform: uppercase;">${vArea}</div>
            <div style="font-size: 13px; font-weight: 800; margin: 2px 0 4px 0;">${vName}</div>
            <div style="font-size: 11px; color: #64748b; margin-bottom: 8px;">${vAccess}</div>
            <a href="${navUrl}" target="_blank" rel="noopener noreferrer" style="
              display: inline-flex;
              align-items: center;
              gap: 4px;
              background: #e6007e;
              color: white;
              padding: 5px 12px;
              border-radius: 8px;
              font-size: 11px;
              font-weight: bold;
              text-decoration: none;
            ">
              Google Maps 経路案内 ↗
            </a>
          </div>
        `;

        marker.bindPopup(popupContent);

        marker.on('click', () => {
          setActiveVenue(v);
          if (onSelectVenue) onSelectVenue(v.id);
        });
      });
    };

    initMap();

    return () => {
      if (mapInstance) {
        mapInstance.remove();
      }
    };
  }, [mounted, venues, onSelectVenue, getText]);

  const activeVenuePerformances = activeVenue
    ? performances.filter(
        (p) => p.venueId === activeVenue.id || p.schedules.some((s) => s.venueId === activeVenue.id)
      )
    : [];

  return (
    <div className="bg-white border border-pink-100 rounded-3xl overflow-hidden shadow-sm">
      {/* Venue selector tabs */}
      <div className="bg-slate-50 p-3.5 border-b border-pink-100 flex items-center gap-2 overflow-x-auto no-scrollbar">
        <span className="text-xs font-black text-slate-700 flex items-center gap-1 flex-shrink-0 mr-2">
          <MapPin className="w-3.5 h-3.5 text-pink-600" />
          <span>{t('selectVenue')}</span>
        </span>
        {venues.map((v) => {
          const isSelected = activeVenue?.id === v.id;
          return (
            <button
              key={v.id}
              onClick={() => {
                setActiveVenue(v);
                if (onSelectVenue) onSelectVenue(v.id);
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                isSelected
                  ? 'bg-pink-600 text-white shadow-sm'
                  : 'bg-white text-slate-700 hover:bg-pink-50/60 border border-slate-200'
              }`}
            >
              <span>{getText(v.name, v.nameEn)}</span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 min-h-[420px]">
        {/* Leaflet Map Canvas */}
        <div className="lg:col-span-2 relative min-h-[350px] lg:min-h-[450px]">
          <div id="festival-leaflet-map" className="w-full h-full min-h-[350px] lg:min-h-[450px] z-10" />
          <div className="absolute top-3 right-3 z-20 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-pink-200 text-[11px] text-pink-700 font-bold flex items-center gap-1 shadow-sm">
            <Compass className="w-3.5 h-3.5 text-pink-600" />
            <span>{t('tapPinHint')}</span>
          </div>
        </div>

        {/* Selected Venue Details Panel */}
        <div className="p-6 bg-slate-50 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-pink-100">
          {activeVenue ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-pink-100 text-pink-700 text-[11px] font-black uppercase tracking-wider">
                  {getText(activeVenue.area, activeVenue.areaEn)}
                </span>
                <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                  {getText(activeVenue.name, activeVenue.nameEn)}
                </h3>
                <p className="text-xs text-slate-600 flex items-start gap-1 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-pink-600 flex-shrink-0 mt-0.5" />
                  <span>{getText(activeVenue.address, activeVenue.addressEn)}</span>
                </p>
                {activeVenue.access && (
                  <p className="text-xs text-slate-700 bg-white p-3 rounded-2xl border border-slate-200 leading-relaxed font-bold">
                    {getText(activeVenue.access, activeVenue.accessEn)}
                  </p>
                )}
              </div>

              {/* Performances in this venue */}
              <div className="space-y-2">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-pink-600" />
                  <span>この会場での公演 ({activeVenuePerformances.length}件)</span>
                </h4>
                <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                  {activeVenuePerformances.map((perf) => (
                    <div
                      key={perf.id}
                      onClick={() => onSelectPerformance?.(perf)}
                      className="p-3 rounded-2xl bg-white border border-pink-100 text-xs flex items-center justify-between gap-2 hover:border-pink-300 hover:bg-pink-50/50 transition-colors cursor-pointer shadow-2xs"
                    >
                      <div className="truncate">
                        <div className="font-black text-slate-900 truncate">
                          {getText(perf.title, perf.titleEn)}
                        </div>
                        <div className="text-[11px] text-pink-600 font-bold">
                          {getText(perf.artistName, perf.artistNameEn)}
                        </div>
                      </div>
                      <span className="text-[10px] bg-pink-50 px-2 py-0.5 rounded text-pink-600 whitespace-nowrap font-black border border-pink-200">
                        {perf.schedules.length}公演
                      </span>
                    </div>
                  ))}
                  {activeVenuePerformances.length === 0 && (
                    <p className="text-xs text-slate-400 italic py-2">
                      {t('noShowsScheduled')}
                    </p>
                  )}
                </div>
              </div>

              {/* Navigation button */}
              <div className="pt-2">
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${activeVenue.location.lat},${activeVenue.location.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  <Navigation className="w-4 h-4" />
                  <span>{t('directions')}</span>
                </a>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center text-slate-400 py-8">
              <MapPin className="w-8 h-8 text-pink-300 mb-2" />
              <p className="text-xs font-bold">会場を選択してください</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}