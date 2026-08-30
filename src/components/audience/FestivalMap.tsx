'use client';

import React, { useEffect, useState } from 'react';
import { Venue, Performance } from '@/types';
import { useLanguage } from '@/context/LanguageContext';
import { MapPin, Navigation, Compass, ExternalLink, Calendar } from 'lucide-react';

interface FestivalMapProps {
  venues: Venue[];
  performances?: Performance[];
  selectedVenueId?: string | null;
  onSelectVenue?: (venueId: string) => void;
}

export default function FestivalMap({
  venues,
  performances = [],
  selectedVenueId,
  onSelectVenue,
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
  }, [venues, selectedVenueId]);

  // Leafletの初期化
  useEffect(() => {
    if (!mounted || typeof window === 'undefined') return;

    // Leafletを動的ロード
    let mapInstance: any = null;

    const initMap = async () => {
      const L = (await import('leaflet')).default;
      const mapContainer = document.getElementById('festival-leaflet-map');
      if (!mapContainer || (mapContainer as any)._leaflet_id) return;

      const center = activeVenue
        ? [activeVenue.location.lat, activeVenue.location.lng]
        : [34.6937, 135.5023]; // 大阪中心部

      const map = L.map('festival-leaflet-map', {
        center: center as [number, number],
        zoom: 13,
        scrollWheelZoom: true,
      });

      mapInstance = map;

      // OpenStreetMapタイル
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      // カスタムアイコン
      const customIcon = L.divIcon({
        className: 'custom-venue-pin',
        html: `
          <div style="
            background: linear-gradient(135deg, #ec4899, #8b5cf6);
            width: 32px;
            height: 32px;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 10px rgba(236, 72, 153, 0.4);
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

      // マーカープロット
      venues.forEach((v) => {
        const marker = L.marker([v.location.lat, v.location.lng], { icon: customIcon }).addTo(map);

        const vName = getText(v.name, v.nameEn);
        const vArea = getText(v.area, v.areaEn);
        const vAccess = getText(v.access, v.accessEn);
        const navUrl = `https://www.google.com/maps/dir/?api=1&destination=${v.location.lat},${v.location.lng}`;

        const popupContent = `
          <div style="min-width: 200px; font-family: sans-serif; color: #1e293b;">
            <div style="font-size: 11px; font-weight: bold; color: #db2777; text-transform: uppercase;">${vArea}</div>
            <div style="font-size: 14px; font-weight: bold; margin: 2px 0 4px 0;">${vName}</div>
            <div style="font-size: 12px; color: #64748b; margin-bottom: 8px;">${vAccess}</div>
            <a href="${navUrl}" target="_blank" rel="noopener noreferrer" style="
              display: inline-flex;
              align-items: center;
              gap: 4px;
              background: #8b5cf6;
              color: white;
              padding: 4px 10px;
              border-radius: 6px;
              font-size: 11px;
              font-weight: bold;
              text-decoration: none;
            ">
              Google Mapsで経路案内 ↗
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
    ? performances.filter((p) => p.venueId === activeVenue.id)
    : [];

  return (
    <div className="bg-slate-900 border border-purple-900/40 rounded-3xl overflow-hidden shadow-2xl">
      {/* Venue selector tabs */}
      <div className="bg-slate-950 p-4 border-b border-purple-900/30 flex items-center gap-2 overflow-x-auto no-scrollbar">
        <span className="text-xs font-bold text-slate-400 flex items-center gap-1 flex-shrink-0 mr-2">
          <MapPin className="w-3.5 h-3.5 text-pink-400" />
          <span>会場を選択:</span>
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
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-md'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-purple-900/30'
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
          <div className="absolute top-3 right-3 z-20 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-purple-800/40 text-[11px] text-pink-300 font-semibold flex items-center gap-1 shadow-md">
            <Compass className="w-3.5 h-3.5" />
            <span>ピンをタップして会場情報を確認</span>
          </div>
        </div>

        {/* Selected Venue Details Panel */}
        <div className="p-6 bg-slate-950/90 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-purple-900/40">
          {activeVenue ? (
            <div className="space-y-4">
              <div>
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-pink-950 text-pink-300 border border-pink-700/50 text-[11px] font-bold uppercase tracking-wider mb-2">
                  {getText(activeVenue.area, activeVenue.areaEn)}
                </span>
                <h3 className="text-lg font-bold text-white">
                  {getText(activeVenue.name, activeVenue.nameEn)}
                </h3>
                <p className="text-xs text-slate-400 mt-1 flex items-start gap-1">
                  <MapPin className="w-3.5 h-3.5 text-pink-400 flex-shrink-0 mt-0.5" />
                  <span>{getText(activeVenue.address, activeVenue.addressEn)}</span>
                </p>
                <p className="text-xs text-slate-300 mt-2 bg-slate-900 p-2.5 rounded-xl border border-purple-900/30 leading-relaxed">
                  {getText(activeVenue.access, activeVenue.accessEn)}
                </p>
              </div>

              {/* Performances in this venue */}
              <div>
                <h4 className="text-xs font-bold text-purple-300 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>この会場の公演 ({activeVenuePerformances.length}件)</span>
                </h4>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {activeVenuePerformances.map((perf) => (
                    <div
                      key={perf.id}
                      className="p-2.5 rounded-xl bg-slate-900/80 border border-purple-800/30 text-xs flex items-center justify-between gap-2 hover:border-pink-500/50 transition-colors"
                    >
                      <div className="truncate">
                        <div className="font-bold text-white truncate">
                          {getText(perf.title, perf.titleEn)}
                        </div>
                        <div className="text-[11px] text-pink-400">
                          {getText(perf.artistName, perf.artistNameEn)}
                        </div>
                      </div>
                      <span className="text-[10px] bg-purple-950 px-2 py-0.5 rounded text-purple-300 whitespace-nowrap font-semibold">
                        {perf.schedules.length}公演
                      </span>
                    </div>
                  ))}
                  {activeVenuePerformances.length === 0 && (
                    <p className="text-xs text-slate-500 italic">現在予定されている公演はありません</p>
                  )}
                </div>
              </div>

              {/* Navigation button */}
              <div className="pt-2">
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${activeVenue.location.lat},${activeVenue.location.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-pink-500/20 transition-all hover:scale-[1.02]"
                >
                  <Navigation className="w-4 h-4" />
                  <span>{t('directions')}</span>
                </a>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center text-slate-400">
              <MapPin className="w-8 h-8 text-purple-500/50 mb-2" />
              <p className="text-xs">会場を選択してください</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}