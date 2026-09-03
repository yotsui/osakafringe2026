'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Venue, Performance } from '@/types';
import { useLanguage } from '@/context/LanguageContext';
import { Navigation, ExternalLink, Calendar, Train } from 'lucide-react';
import { OSAKA_TRANSIT_LINES, OSAKA_TRANSIT_STATIONS } from '@/data/transitData';
import 'maplibre-gl/dist/maplibre-gl.css';

interface FestivalMapProps {
  venues: Venue[];
  performances?: Performance[];
  selectedVenueId?: string | null;
  onSelectVenue?: (venueId: string) => void;
  onSelectPerformance?: (performance: Performance) => void;
}

const CARTO_API_KEY = 'cb1_2u9e_1_e673ff91216e39ecfb52f65d';

// CARTO Positron（APIキー適用、Retina @2x、POIのない淡色地図）
const CARTO_POSITRON_KEYED_STYLE: any = {
  version: 8,
  sources: {
    'carto-positron': {
      type: 'raster',
      tiles: [
        `https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png?api_key=${CARTO_API_KEY}`,
        `https://b.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png?api_key=${CARTO_API_KEY}`,
        `https://c.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png?api_key=${CARTO_API_KEY}`,
        `https://d.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png?api_key=${CARTO_API_KEY}`,
      ],
      tileSize: 256,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions" target="_blank" rel="noopener noreferrer">CARTO</a>',
    },
  },
  layers: [
    {
      id: 'carto-positron-tiles',
      type: 'raster',
      source: 'carto-positron',
      minzoom: 0,
      maxzoom: 20,
    },
  ],
};

export default function FestivalMap({
  venues,
  performances = [],
  selectedVenueId,
  onSelectVenue,
  onSelectPerformance,
}: FestivalMapProps) {
  const { getText, t } = useLanguage();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  const [activeVenue, setActiveVenue] = useState<Venue | null>(null);

  // 初期アクティブ会場
  useEffect(() => {
    if (venues.length > 0 && !activeVenue) {
      if (selectedVenueId) {
        const found = venues.find((v) => v.id === selectedVenueId);
        if (found) setActiveVenue(found);
      } else {
        setActiveVenue(venues[0]);
      }
    }
  }, [venues, selectedVenueId, activeVenue]);

  // MapLibre GL JS の初期化 & 鉄道オーバーレイレイヤーの構築
  useEffect(() => {
    if (!mapContainerRef.current || typeof window === 'undefined') return;

    let isCancelled = false;

    const initMapLibre = async () => {
      const maplibregl = (await import('maplibre-gl')) as any;

      if (isCancelled || !mapContainerRef.current) return;

      // 既存インスタンス破棄
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      // 地図インスタンス生成
      const map = new maplibregl.Map({
        container: mapContainerRef.current,
        style: CARTO_POSITRON_KEYED_STYLE,
        center: [135.5023, 34.6937],
        zoom: 12,
        attributionControl: false,
      });

      map.addControl(
        new maplibregl.NavigationControl({ showCompass: false }),
        'top-right'
      );

      map.addControl(
        new maplibregl.AttributionControl({ compact: true }),
        'bottom-right'
      );

      map.on('load', () => {
        map.resize();

        // 1. 全会場ピンを画面内に収める自動ZOOM調整 (fitBounds)
        if (venues.length > 0) {
          const bounds = new maplibregl.LngLatBounds();
          venues.forEach((v) => {
            bounds.extend([v.location.lng, v.location.lat]);
          });
          map.fitBounds(bounds, {
            padding: { top: 70, bottom: 70, left: 70, right: 70 },
            maxZoom: 14,
            duration: 0,
          });
        }

        // 2. 鉄道路線（OSAKA_TRANSIT_LINES）の追加
        if (!map.getSource('osaka-transit-lines')) {
          map.addSource('osaka-transit-lines', {
            type: 'geojson',
            data: OSAKA_TRANSIT_LINES,
          });

          // 線路の下地グロー（視認性を向上させる半透明ホワイト）
          map.addLayer({
            id: 'transit-lines-glow',
            type: 'line',
            source: 'osaka-transit-lines',
            paint: {
              'line-color': '#ffffff',
              'line-width': ['+', ['get', 'width'], 2.5],
              'line-opacity': 0.75,
            },
          });

          // 路線カラーのライン
          map.addLayer({
            id: 'transit-lines-core',
            type: 'line',
            source: 'osaka-transit-lines',
            paint: {
              'line-color': ['get', 'color'],
              'line-width': ['get', 'width'],
              'line-opacity': 0.85,
            },
          });
        }

        // 3. 主要駅（OSAKA_TRANSIT_STATIONS）の追加
        if (!map.getSource('osaka-transit-stations')) {
          map.addSource('osaka-transit-stations', {
            type: 'geojson',
            data: OSAKA_TRANSIT_STATIONS,
          });

          // 駅の丸印（ズーム11以上）
          map.addLayer({
            id: 'transit-station-points',
            type: 'circle',
            source: 'osaka-transit-stations',
            minzoom: 11.5,
            paint: {
              'circle-radius': 4.5,
              'circle-color': '#ffffff',
              'circle-stroke-color': ['get', 'color'],
              'circle-stroke-width': 2.5,
              'circle-opacity': 0.95,
            },
          });

          // 駅名テキストラベル（ズーム12.8以上で表示）
          map.addLayer({
            id: 'transit-station-labels',
            type: 'symbol',
            source: 'osaka-transit-stations',
            minzoom: 12.8,
            layout: {
              'text-field': ['get', 'name'],
              'text-size': 11,
              'text-offset': [0, 1.1],
              'text-anchor': 'top',
              'text-allow-overlap': false,
            },
            paint: {
              'text-color': '#1e293b',
              'text-halo-color': '#ffffff',
              'text-halo-width': 2,
              'text-halo-blur': 0.5,
            },
          });
        }
      });

      mapInstanceRef.current = map;

      // 会場ピンの配置
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];

      venues.forEach((v) => {
        const isSelected = activeVenue?.id === v.id;
        const vName = getText(v.name, v.nameEn);
        const vArea = getText(v.area, v.areaEn);
        const vAccess = getText(v.access, v.accessEn);
        const navUrl = `https://www.google.com/maps/dir/?api=1&destination=${v.location.lat},${v.location.lng}`;

        // DOMマーカーエレメントの生成
        const el = document.createElement('div');
        el.className = 'custom-maplibre-marker';
        el.style.cursor = 'pointer';
        el.style.width = '36px';
        el.style.height = '36px';
        el.style.display = 'flex';
        el.style.alignItems = 'center';
        el.style.justifyContent = 'center';

        el.innerHTML = `
          <div style="
            position: relative;
            width: 32px;
            height: 32px;
            background: ${isSelected ? '#FFF100' : '#E6007E'};
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 12px ${isSelected ? 'rgba(0,0,0,0.35)' : 'rgba(230,0,126,0.5)'};
            border: 2.5px solid #ffffff;
            transition: transform 0.2s ease, background 0.2s ease;
          ">
            <div style="
              width: 10px;
              height: 10px;
              background: ${isSelected ? '#000000' : '#ffffff'};
              border-radius: 50%;
              transform: rotate(45deg);
            "></div>
          </div>
        `;

        el.addEventListener('click', () => {
          setActiveVenue(v);
          if (onSelectVenue) onSelectVenue(v.id);
          map.flyTo({
            center: [v.location.lng, v.location.lat],
            zoom: 14.5,
            essential: true,
          });
        });

        const popup = new maplibregl.Popup({
          offset: [0, -18],
          closeButton: true,
          closeOnClick: false,
        }).setHTML(`
          <div style="min-width: 210px; font-family: sans-serif; color: #0f172a; padding: 4px;">
            <div style="font-size: 11px; font-weight: 800; color: #E6007E; text-transform: uppercase; letter-spacing: 0.05em;">${vArea}</div>
            <div style="font-size: 13px; font-weight: 900; margin: 2px 0 4px 0; line-height: 1.3;">${vName}</div>
            <div style="font-size: 11px; color: #64748b; margin-bottom: 8px; line-height: 1.4;">${vAccess}</div>
            <a href="${navUrl}" target="_blank" rel="noopener noreferrer" style="
              display: inline-flex;
              align-items: center;
              gap: 4px;
              background: #E6007E;
              color: white;
              padding: 5px 12px;
              border-radius: 8px;
              font-size: 11px;
              font-weight: 800;
              text-decoration: none;
            ">
              <span>Google Maps でルート案内</span>
              ↗
            </a>
          </div>
        `);

        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([v.location.lng, v.location.lat])
          .setPopup(popup)
          .addTo(map);

        markersRef.current.push(marker);
      });
    };

    initMapLibre();

    return () => {
      isCancelled = true;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [venues, getText, onSelectVenue]);

  // 会場切り替え時のマップ移動
  useEffect(() => {
    if (activeVenue && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo({
        center: [activeVenue.location.lng, activeVenue.location.lat],
        zoom: 14.5,
        essential: true,
      });
    }
  }, [activeVenue]);

  // 選択された会場で上演される公演一覧
  const venuePerformances = activeVenue
    ? performances.filter((p) => {
        if (p.venueId === activeVenue.id) return true;
        return p.schedules.some((s) => s.venueId === activeVenue.id);
      })
    : [];

  return (
    <div className="space-y-6">
      {/* Map + Detail Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-white rounded-3xl border border-pink-100 p-4 sm:p-6 shadow-sm overflow-hidden">
        {/* Vector Map Container */}
        <div className="lg:col-span-8 relative rounded-2xl overflow-hidden min-h-[440px] lg:min-h-[580px] bg-slate-100 border border-slate-200">
          <div ref={mapContainerRef} className="absolute inset-0 w-full h-full" />

          {/* Map Legend (Transit Lines) */}
          <div className="absolute bottom-4 left-4 z-10 bg-white/95 backdrop-blur-md px-3.5 py-2.5 rounded-2xl border border-slate-200/80 shadow-md hidden sm:flex flex-col gap-1.5 max-w-xs">
            <div className="flex items-center gap-1.5 text-[11px] font-black text-slate-800">
              <Train className="w-3.5 h-3.5 text-[#E6007E]" />
              <span>大阪 鉄道路線ネットワーク</span>
            </div>
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[10px] font-bold text-slate-600">
              <span className="inline-flex items-center gap-1">
                <span className="w-2.5 h-1 rounded-full bg-[#E5171F]" /> 御堂筋線
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="w-2.5 h-1 rounded-full bg-[#522886]" /> 谷町線
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="w-2.5 h-1 rounded-full bg-[#0078BA]" /> 四つ橋線
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="w-2.5 h-1 rounded-full bg-[#E85219]" /> JR環状線
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="w-2.5 h-1 rounded-full bg-[#1E50A2]" /> 京阪/私鉄
              </span>
            </div>
          </div>
        </div>

        {/* Venue Info Side Panel */}
        <div className="lg:col-span-4 flex flex-col justify-between space-y-6 p-2 sm:p-4">
          {activeVenue ? (
            <div className="space-y-5">
              <div className="space-y-2 border-b border-pink-100 pb-4">
                <span className="inline-block px-3 py-1 rounded-full bg-pink-50 text-[#E6007E] font-black text-xs uppercase tracking-wide">
                  {getText(activeVenue.area, activeVenue.areaEn)}
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                  {getText(activeVenue.name, activeVenue.nameEn)}
                </h3>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  {getText(activeVenue.address, activeVenue.addressEn)}
                </p>
              </div>

              {/* Access */}
              <div className="space-y-1 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
                <div className="text-[11px] font-black text-slate-500 uppercase tracking-wider">
                  {t('venueAccess')}
                </div>
                <div className="text-xs font-bold text-slate-800 leading-relaxed">
                  {getText(activeVenue.access, activeVenue.accessEn)}
                </div>
              </div>

              {/* Description */}
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                {getText(activeVenue.description, activeVenue.descriptionEn)}
              </p>

              {/* Navigation Action */}
              <div className="pt-2">
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${activeVenue.location.lat},${activeVenue.location.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#E6007E] hover:bg-[#c4006b] text-white font-black text-xs shadow-md transition-colors"
                >
                  <Navigation className="w-4 h-4" />
                  <span>Google Maps でルート案内</span>
                </a>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400 font-bold text-sm">
              会場を選択してください
            </div>
          )}

          {/* Performances at this Venue */}
          {venuePerformances.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-1.5 text-xs font-black text-slate-900">
                <Calendar className="w-4 h-4 text-[#E6007E]" />
                <span>この会場で上演される公演 ({venuePerformances.length})</span>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {venuePerformances.map((perf) => (
                  <button
                    key={perf.id}
                    onClick={() => onSelectPerformance && onSelectPerformance(perf)}
                    className="w-full text-left p-2.5 rounded-xl bg-pink-50/50 hover:bg-pink-100/70 border border-pink-100 text-slate-900 transition-colors flex items-center justify-between gap-2 group cursor-pointer"
                  >
                    <div className="truncate">
                      <div className="text-xs font-black truncate group-hover:text-[#E6007E]">
                        {getText(perf.title, perf.titleEn)}
                      </div>
                      <div className="text-[11px] text-slate-500 font-medium truncate">
                        {getText(perf.artistName, perf.artistNameEn)}
                      </div>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#E6007E] flex-shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Venue List Selector Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {venues.map((v) => {
          const isSelected = activeVenue?.id === v.id;
          return (
            <button
              key={v.id}
              onClick={() => {
                setActiveVenue(v);
                if (onSelectVenue) onSelectVenue(v.id);
              }}
              className={`p-4 rounded-2xl text-left border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-white border-[#E6007E] shadow-md ring-2 ring-[#E6007E]/20'
                  : 'bg-white/80 hover:bg-white border-slate-200 hover:border-pink-200'
              }`}
            >
              <div className="text-[11px] font-black text-[#E6007E] uppercase tracking-wider mb-1">
                {getText(v.area, v.areaEn)}
              </div>
              <div className="text-xs font-black text-slate-900 line-clamp-1">
                {getText(v.name, v.nameEn)}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}