'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { Venue, Performance } from '@/types';
import { useLanguage } from '@/context/LanguageContext';
import { Navigation, ExternalLink, Calendar, Train, ArrowRight, Building2 } from 'lucide-react';
import SafeImage from '@/components/common/SafeImage';
import { METRO_LINES_INFO } from '@/data/transitLinesInfo';
import 'maplibre-gl/dist/maplibre-gl.css';

interface FestivalMapProps {
  venues: Venue[];
  performances?: Performance[];
  selectedVenueId?: string | null;
  onSelectVenue?: (venueId: string) => void;
  onSelectPerformance?: (performance: Performance) => void;
}

interface MarkerItem {
  venue: Venue;
  marker: any;
  popup: any;
  pinEl: HTMLDivElement;
  dotEl: HTMLDivElement;
  el: HTMLDivElement;
}

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
  const markersRef = useRef<MarkerItem[]>([]);
  const isMapReadyRef = useRef<boolean>(false);

  const [activeVenue, setActiveVenue] = useState<Venue | null>(null);
  const activeVenueRef = useRef<Venue | null>(null);
  activeVenueRef.current = activeVenue;

  const [visibleVenues, setVisibleVenues] = useState<Venue[]>(venues);

  // マーカーのハイライト色・前面表示を一括更新する関数
  const updateMarkerColors = useCallback((selectedId: string | null) => {
    markersRef.current.forEach(({ venue, pinEl, dotEl, el }) => {
      const isSelected = venue.id === selectedId;
      pinEl.style.background = isSelected ? '#FFF100' : '#E6007E';
      pinEl.style.boxShadow = isSelected
        ? '0 4px 14px rgba(0,0,0,0.35)'
        : '0 4px 12px rgba(230,0,126,0.45)';
      pinEl.style.transform = isSelected ? 'scale(1.1) rotate(-45deg)' : 'scale(1) rotate(-45deg)';
      dotEl.style.background = isSelected ? '#000000' : '#ffffff';
      if (el) {
        el.style.zIndex = isSelected ? '10' : '1';
      }
    });
  }, []);

  // 地図の表示範囲（bounds）に含まれる会場を抽出＆範囲外時の最近傍会場選択
  const updateVisibleVenues = useCallback(
    (map: any) => {
      if (!map || !venues || venues.length === 0) {
        setVisibleVenues([]);
        return;
      }
      try {
        const bounds = map.getBounds();
        if (!bounds) return;
        const inBounds = venues.filter((v) => {
          const lng = Number(v.location.lng);
          const lat = Number(v.location.lat);
          if (isNaN(lng) || isNaN(lat)) return false;
          return bounds.contains([lng, lat]);
        });
        setVisibleVenues(inBounds);

        // 現在選択中の会場が表示範囲外に出た場合、中心に最も近い会場に切り替え
        const currentActive = activeVenueRef.current;
        const isActiveInBounds = currentActive && inBounds.some((v) => v.id === currentActive.id);

        if (!isActiveInBounds) {
          if (inBounds.length > 0) {
            const center = map.getCenter();
            let closestVenue = inBounds[0];
            let minDistanceSq = Infinity;

            inBounds.forEach((v) => {
              const dLng = v.location.lng - center.lng;
              const dLat = v.location.lat - center.lat;
              const distSq = dLng * dLng + dLat * dLat;
              if (distSq < minDistanceSq) {
                minDistanceSq = distSq;
                closestVenue = v;
              }
            });

            setActiveVenue(closestVenue);
            if (onSelectVenue) onSelectVenue(closestVenue.id);
            updateMarkerColors(closestVenue.id);
          } else {
            setActiveVenue(null);
            updateMarkerColors(null);
          }
        }
      } catch (err) {
        console.warn('[FestivalMap] error getting map bounds:', err);
      }
    },
    [venues, onSelectVenue, updateMarkerColors]
  );

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

  // venues プロパティ変更時の visibleVenues 初期化
  useEffect(() => {
    if (mapInstanceRef.current?.map && isMapReadyRef.current) {
      updateVisibleVenues(mapInstanceRef.current.map);
    } else {
      setVisibleVenues(venues);
    }
  }, [venues, updateVisibleVenues]);

  // 会場マーカーの配置・更新
  const renderMarkers = useCallback(
    (map: any, maplibregl: any) => {
      // 既存マーカークリア
      markersRef.current.forEach(({ marker }) => marker.remove());
      markersRef.current = [];

      if (!map || !venues || venues.length === 0) return;

      venues.forEach((v) => {
        const isSelected = activeVenue?.id === v.id;
        const vName = getText(v.name, v.nameEn);
        const vArea = getText(v.area, v.areaEn);
        const vAccess = getText(v.access, v.accessEn);
        const navUrl = `https://www.google.com/maps/dir/?api=1&destination=${v.location.lat},${v.location.lng}`;
        const venuePageUrl = `/venues/${v.id}`;

        // DOMマーカーエレメントの生成
        const el = document.createElement('div');
        el.className = 'custom-maplibre-marker';
        el.style.cursor = 'pointer';
        el.style.width = '36px';
        el.style.height = '36px';
        el.style.display = 'flex';
        el.style.alignItems = 'center';
        el.style.justifyContent = 'center';

        const pinEl = document.createElement('div');
        pinEl.style.position = 'relative';
        pinEl.style.width = '32px';
        pinEl.style.height = '32px';
        pinEl.style.background = isSelected ? '#FFF100' : '#E6007E';
        pinEl.style.borderRadius = '50% 50% 50% 0';
        pinEl.style.transform = 'rotate(-45deg)';
        pinEl.style.display = 'flex';
        pinEl.style.alignItems = 'center';
        pinEl.style.justifyContent = 'center';
        pinEl.style.boxShadow = isSelected
          ? '0 4px 14px rgba(0,0,0,0.35)'
          : '0 4px 12px rgba(230,0,126,0.45)';
        pinEl.style.border = '2.5px solid #ffffff';
        pinEl.style.transition = 'transform 0.2s ease, background 0.2s ease';

        const dotEl = document.createElement('div');
        dotEl.style.width = '10px';
        dotEl.style.height = '10px';
        dotEl.style.background = isSelected ? '#000000' : '#ffffff';
        dotEl.style.borderRadius = '50%';
        dotEl.style.transform = 'rotate(45deg)';

        pinEl.appendChild(dotEl);
        el.appendChild(pinEl);

        // ポップアップが上下左右どの方向に出てもPIN本体を覆い隠さない方向別オフセット (28px確保)
        const popupOffsets: Record<string, [number, number]> = {
          'top': [0, 28],
          'top-left': [18, 28],
          'top-right': [-18, 28],
          'bottom': [0, -28],
          'bottom-left': [18, -28],
          'bottom-right': [-18, -28],
          'left': [28, 0],
          'right': [-28, 0],
        };

        // POPUP 生成
        const popup = new maplibregl.Popup({
          offset: popupOffsets,
          closeButton: true,
          closeOnClick: true,
          maxWidth: '280px',
        }).setHTML(`
          <div style="font-family: sans-serif; color: #0f172a; padding: 2px 2px 4px 2px;">
            <div style="font-size: 11px; font-weight: 800; color: #E6007E; text-transform: uppercase; letter-spacing: 0.05em;">${vArea}</div>
            <div style="font-size: 14px; font-weight: 900; margin: 3px 0 6px 0; line-height: 1.35;"><a href="${venuePageUrl}" style="color: inherit; text-decoration: none;">${vName}</a></div>
            <div style="font-size: 11px; color: #64748b; margin-bottom: 12px; line-height: 1.45;">${vAccess}</div>
            <div style="display: flex; gap: 6px; flex-wrap: wrap;">
              <a href="${venuePageUrl}" style="
                display: inline-flex;
                align-items: center;
                gap: 4px;
                background: #0f172a;
                color: white;
                padding: 6px 12px;
                border-radius: 10px;
                font-size: 11px;
                font-weight: 800;
                text-decoration: none;
              ">
                <span>会場詳細</span>
                →
              </a>
              <a href="${navUrl}" target="_blank" rel="noopener noreferrer" style="
                display: inline-flex;
                align-items: center;
                gap: 4px;
                background: #E6007E;
                color: white;
                padding: 6px 12px;
                border-radius: 10px;
                font-size: 11px;
                font-weight: 800;
                text-decoration: none;
                box-shadow: 0 2px 6px rgba(230,0,126,0.3);
              ">
                <span>案内</span>
                ↗
              </a>
            </div>
          </div>
        `);

        // ポップアップが開いたら他のポップアップをすべて閉じ、ピン色をイエローに変更＆会場選択
        popup.on('open', () => {
          markersRef.current.forEach((item) => {
            if (item.popup !== popup && item.popup.isOpen()) {
              item.popup.remove();
            }
          });
          setActiveVenue(v);
          if (onSelectVenue) onSelectVenue(v.id);
          updateMarkerColors(v.id);
        });

        // ポップアップが閉じられた時、他に開いているPOPUPがなければピン色をリセット
        popup.on('close', () => {
          setTimeout(() => {
            const anyOpen = markersRef.current.some((item) => item.popup.isOpen());
            if (!anyOpen) {
              updateMarkerColors(null);
            }
          }, 10);
        });

        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([v.location.lng, v.location.lat])
          .setPopup(popup)
          .addTo(map);

        // クリック時に確実にポップアップを開閉
        el.addEventListener('click', (e) => {
          e.stopPropagation();
          marker.togglePopup();
        });

        markersRef.current.push({ venue: v, marker, popup, pinEl, dotEl, el });
      });
    },
    [venues, getText, onSelectVenue, updateMarkerColors]
  );

  // 鉄道レイヤー（路線ライン＆駅）を追加する関数
  const addTransitLayers = useCallback((map: any) => {
    try {
      // 1. 鉄道路線（/data/transit-lines.geojson）
      if (!map.getSource('osaka-transit-lines')) {
        map.addSource('osaka-transit-lines', {
          type: 'geojson',
          data: '/data/transit-lines.geojson',
        });

        map.addLayer({
          id: 'transit-lines-glow',
          type: 'line',
          source: 'osaka-transit-lines',
          paint: {
            'line-color': '#ffffff',
            'line-width': ['+', ['coalesce', ['get', 'width'], 3], 2],
            'line-opacity': 0.85,
          },
        });

        map.addLayer({
          id: 'transit-lines-core',
          type: 'line',
          source: 'osaka-transit-lines',
          paint: {
            'line-color': ['get', 'color'],
            'line-width': ['coalesce', ['get', 'width'], 3],
            'line-opacity': 0.95,
          },
        });
      }

      // 2. 主要駅（/data/transit-stations.geojson）
      if (!map.getSource('osaka-transit-stations')) {
        map.addSource('osaka-transit-stations', {
          type: 'geojson',
          data: '/data/transit-stations.geojson',
        });

        map.addLayer({
          id: 'transit-station-points-major',
          type: 'circle',
          source: 'osaka-transit-stations',
          minzoom: 11.5,
          filter: ['==', ['get', 'isMajor'], true],
          paint: {
            'circle-radius': 4.5,
            'circle-color': '#ffffff',
            'circle-stroke-color': ['get', 'color'],
            'circle-stroke-width': 2.5,
            'circle-opacity': 1,
          },
        });

        map.addLayer({
          id: 'transit-station-labels-major',
          type: 'symbol',
          source: 'osaka-transit-stations',
          minzoom: 12,
          filter: ['==', ['get', 'isMajor'], true],
          layout: {
            'text-field': ['get', 'name'],
            'text-size': 12,
            'text-offset': [0, 1.2],
            'text-anchor': 'top',
            'text-allow-overlap': false,
          },
          paint: {
            'text-color': '#0f172a',
            'text-halo-color': '#ffffff',
            'text-halo-width': 2.5,
            'text-halo-blur': 0.5,
          },
        });

        map.addLayer({
          id: 'transit-station-points-minor',
          type: 'circle',
          source: 'osaka-transit-stations',
          minzoom: 13.5,
          filter: ['!=', ['get', 'isMajor'], true],
          paint: {
            'circle-radius': 3.5,
            'circle-color': '#ffffff',
            'circle-stroke-color': ['get', 'color'],
            'circle-stroke-width': 2,
            'circle-opacity': 0.9,
          },
        });

        map.addLayer({
          id: 'transit-station-labels-minor',
          type: 'symbol',
          source: 'osaka-transit-stations',
          minzoom: 14,
          filter: ['!=', ['get', 'isMajor'], true],
          layout: {
            'text-field': ['get', 'name'],
            'text-size': 11,
            'text-offset': [0, 1.2],
            'text-anchor': 'top',
            'text-allow-overlap': false,
          },
          paint: {
            'text-color': '#334155',
            'text-halo-color': '#ffffff',
            'text-halo-width': 2,
            'text-halo-blur': 0.5,
          },
        });
      }
    } catch (err) {
      console.warn('[FestivalMap] transit layers error:', err);
    }
  }, []);

  // MapLibre GL JS の初期化
  useEffect(() => {
    if (!mapContainerRef.current || typeof window === 'undefined') return;

    let isCancelled = false;

    const initMap = async () => {
      const maplibregl = (await import('maplibre-gl')) as any;

      if (isCancelled || !mapContainerRef.current) return;

      if (typeof maplibregl.setWorkerUrl === 'function') {
        maplibregl.setWorkerUrl('/maplibre-gl-worker.mjs');
      }

      if (mapInstanceRef.current?.map) {
        mapInstanceRef.current.map.remove();
        mapInstanceRef.current = null;
      }

      isMapReadyRef.current = false;

      const map = new maplibregl.Map({
        container: mapContainerRef.current,
        style: '/data/carto-positron-style.json',
        center: [135.5023, 34.6937],
        zoom: 12,
        attributionControl: false,
      });

      map.addControl(
        new maplibregl.NavigationControl({ showCompass: false }),
        'top-right'
      );

      map.addControl(
        new maplibregl.ScaleControl({
          maxWidth: 100,
          unit: 'metric',
        }),
        'bottom-left'
      );

      map.addControl(
        new maplibregl.FullscreenControl(),
        'bottom-right'
      );

      map.addControl(
        new maplibregl.AttributionControl({ compact: true }),
        'bottom-right'
      );

      const onReady = () => {
        if (isMapReadyRef.current || isCancelled) return;
        isMapReadyRef.current = true;

        map.resize();

        addTransitLayers(map);
        renderMarkers(map, maplibregl);

        if (venues.length > 0) {
          const bounds = new maplibregl.LngLatBounds();
          venues.forEach((v) => {
            bounds.extend([v.location.lng, v.location.lat]);
          });
          map.fitBounds(bounds, {
            padding: { top: 60, bottom: 60, left: 60, right: 60 },
            maxZoom: 14,
            duration: 0,
          });
        }

        updateVisibleVenues(map);
      };

      map.on('load', onReady);
      map.on('style.load', onReady);
      map.on('moveend', () => updateVisibleVenues(map));
      map.on('zoomend', () => updateVisibleVenues(map));

      map.on('error', (e: any) => {
        console.warn('[MapLibre Warning]', e);
      });

      mapInstanceRef.current = { map, maplibregl };
    };

    initMap();

    return () => {
      isCancelled = true;
      if (mapInstanceRef.current?.map) {
        mapInstanceRef.current.map.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [venues, updateVisibleVenues, addTransitLayers, renderMarkers]);

  const handleSelectVenueCard = (v: Venue) => {
    setActiveVenue(v);
    if (onSelectVenue) onSelectVenue(v.id);
    updateMarkerColors(v.id);

    const item = markersRef.current.find((m) => m.venue.id === v.id);
    if (item?.marker) {
      if (!item.marker.getPopup().isOpen()) {
        item.marker.togglePopup();
      }
    }
  };

  const venuePerformances = activeVenue
    ? performances.filter((p) => {
        if (p.venueId === activeVenue.id) return true;
        return p.schedules.some((s) => s.venueId === activeVenue.id);
      })
    : [];

  return (
    <div className="space-y-6 relative isolate z-0">
      <style>{`
        .maplibregl-popup {
          z-index: 10 !important;
        }
        .maplibregl-popup-close-button {
          width: 28px !important;
          height: 28px !important;
          font-size: 18px !important;
          font-weight: 700 !important;
          line-height: 26px !important;
          text-align: center !important;
          color: #64748b !important;
          background-color: #f1f5f9 !important;
          border-radius: 9999px !important;
          top: 8px !important;
          right: 8px !important;
          border: 1px solid #e2e8f0 !important;
          cursor: pointer !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          box-shadow: 0 1px 3px rgba(0,0,0,0.08) !important;
          transition: all 0.15s ease !important;
          padding: 0 !important;
        }
        .maplibregl-popup-close-button:hover {
          background-color: #fee2e2 !important;
          color: #ef4444 !important;
          border-color: #fca5a5 !important;
          transform: scale(1.08) !important;
        }
        .maplibregl-popup-content {
          border-radius: 18px !important;
          box-shadow: 0 12px 30px -4px rgba(0, 0, 0, 0.18) !important;
          padding: 16px 18px 14px 18px !important;
          border: 1px solid #e2e8f0 !important;
        }
        .maplibregl-ctrl-scale {
          background-color: rgba(255, 255, 255, 0.7) !important;
          backdrop-filter: blur(2px) !important;
          border-radius: 2px !important;
          border-width: 1.5px !important;
          border-style: solid !important;
          border-color: #64748b !important;
          border-top: none !important;
          font-weight: 700 !important;
          font-size: 10px !important;
          color: #475569 !important;
          padding: 1px 4px !important;
          box-shadow: none !important;
          margin-bottom: 6px !important;
          margin-left: 6px !important;
          line-height: 1.2 !important;
        }
      `}</style>

      {/* Map + Detail Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-white rounded-3xl border border-pink-100 p-4 sm:p-6 shadow-sm overflow-hidden">
        {/* Vector Map Container */}
        <div className="lg:col-span-8 relative rounded-2xl overflow-hidden min-h-[460px] lg:min-h-[600px] bg-slate-100 border border-slate-200 isolate">
          <div ref={mapContainerRef} className="absolute inset-0 w-full h-full" />
        </div>

        {/* Venue Info Side Panel */}
        <div className="lg:col-span-4 flex flex-col justify-between space-y-6 p-2 sm:p-4">
          {activeVenue ? (
            <div className="space-y-4">
              {/* Venue Thumbnail Image */}
              <Link
                href={`/venues/${activeVenue.id}`}
                className="relative aspect-16/9 w-full rounded-2xl overflow-hidden bg-slate-900 shadow-xs block group"
              >
                <SafeImage
                  src={activeVenue.image || (activeVenue.images && activeVenue.images[0])}
                  alt={getText(activeVenue.name, activeVenue.nameEn)}
                  fill
                  sizes="(max-width: 1024px) 100vw, 380px"
                  quality={75}
                  fallbackType="venue"
                  fallbackText={getText(activeVenue.name, activeVenue.nameEn)}
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-[#E6007E] text-white font-black text-[11px] shadow-sm z-10">
                  {getText(activeVenue.area, activeVenue.areaEn)}
                </div>
              </Link>

              <div className="space-y-1.5 border-b border-pink-100 pb-3">
                <Link href={`/venues/${activeVenue.id}`} className="group">
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 group-hover:text-[#E6007E] transition-colors leading-tight">
                    {getText(activeVenue.name, activeVenue.nameEn)}
                  </h3>
                </Link>
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
              <div className="pt-2 flex flex-col gap-2">
                <Link
                  href={`/venues/${activeVenue.id}`}
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs transition-colors"
                >
                  <Building2 className="w-4 h-4" />
                  <span>会場詳細ページを見る</span>
                </Link>

                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${activeVenue.location.lat},${activeVenue.location.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#E6007E] hover:bg-[#c4006b] text-white font-black text-xs shadow-md transition-colors"
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
                  <Link
                    key={perf.id}
                    href={`/performances/${perf.id}`}
                    className="w-full text-left p-2.5 rounded-xl bg-pink-50/50 hover:bg-pink-100/70 border border-pink-100 text-slate-900 transition-colors flex items-center justify-between gap-2 group block"
                  >
                    <div className="truncate">
                      <div className="text-xs font-black truncate group-hover:text-[#E6007E]">
                        {getText(perf.title, perf.titleEn)}
                      </div>
                      <div className="text-[11px] text-slate-500 font-medium truncate">
                        {getText(perf.artistName, perf.artistNameEn)}
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#E6007E] flex-shrink-0 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Venue List Selector Tabs */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold text-slate-600">
            📍 地図の表示範囲内の会場: <strong className="text-[#E6007E]">{visibleVenues.length}</strong> {t('venuesCountUnit')}
          </span>
          {visibleVenues.length < venues.length && (
            <span className="text-[11px] text-slate-400 font-medium">
              （全 {venues.length} 会場中）
            </span>
          )}
        </div>

        {visibleVenues.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {visibleVenues.map((v) => {
              const isSelected = activeVenue?.id === v.id;
              return (
                <button
                  key={v.id}
                  onClick={() => handleSelectVenueCard(v)}
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
        ) : (
          <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-slate-400 text-xs font-bold">
            現在の地図表示範囲に会場はありません。地図をドラッグして移動するか、ズームアウトしてください。
          </div>
        )}
      </div>
    </div>
  );
}