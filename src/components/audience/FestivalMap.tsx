'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Venue, Performance } from '@/types';
import { useLanguage } from '@/context/LanguageContext';
import { Navigation, ExternalLink, Calendar, Train } from 'lucide-react';
import {
  OSAKA_TRANSIT_LINES,
  OSAKA_TRANSIT_STATIONS,
  METRO_LINES_INFO,
} from '@/data/transitData';
import { CARTO_POSITRON_VECTOR_STYLE } from '@/data/cartoPositronStyle';
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
          'top': [0, 28],          // ポップアップがピンの下に出る時：ピン下端先端よりさらに下に配置
          'top-left': [18, 28],
          'top-right': [-18, 28],
          'bottom': [0, -28],      // ポップアップがピンの上に出る時：ピン上端よりさらに上に配置
          'bottom-left': [18, -28],
          'bottom-right': [-18, -28],
          'left': [28, 0],
          'right': [-28, 0],
        };

        // POPUP 生成（closeOnClick: true で地図上クリック時に閉じる）
        const popup = new maplibregl.Popup({
          offset: popupOffsets,
          closeButton: true,
          closeOnClick: true,
          maxWidth: '280px',
        }).setHTML(`
          <div style="font-family: sans-serif; color: #0f172a; padding: 2px 2px 4px 2px;">
            <div style="font-size: 11px; font-weight: 800; color: #E6007E; text-transform: uppercase; letter-spacing: 0.05em;">${vArea}</div>
            <div style="font-size: 14px; font-weight: 900; margin: 3px 0 6px 0; line-height: 1.35;">${vName}</div>
            <div style="font-size: 11px; color: #64748b; margin-bottom: 12px; line-height: 1.45;">${vAccess}</div>
            <a href="${navUrl}" target="_blank" rel="noopener noreferrer" style="
              display: inline-flex;
              align-items: center;
              gap: 5px;
              background: #E6007E;
              color: white;
              padding: 6px 14px;
              border-radius: 10px;
              font-size: 11px;
              font-weight: 800;
              text-decoration: none;
              box-shadow: 0 2px 6px rgba(230,0,126,0.3);
            ">
              <span>Google Maps でルート案内</span>
              ↗
            </a>
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
      // 1. 鉄道路線（OSAKA_TRANSIT_LINES）
      if (!map.getSource('osaka-transit-lines')) {
        map.addSource('osaka-transit-lines', {
          type: 'geojson',
          data: OSAKA_TRANSIT_LINES,
        });

        // 下地ホワイトグロー（視認性を向上させる半透明白ライン）
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

        // 路線カラーライン（Osaka Metroは公式色、JRは#333333、私鉄は#666666細線）
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

      // 2. 主要駅（OSAKA_TRANSIT_STATIONS）
      if (!map.getSource('osaka-transit-stations')) {
        map.addSource('osaka-transit-stations', {
          type: 'geojson',
          data: OSAKA_TRANSIT_STATIONS,
        });

        // 1. 主要駅（ターミナル・乗換・会場最寄り）の丸印（ズーム11.5以上）
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

        // 2. 主要駅の駅名テキストラベル（ズーム12以上）
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

        // 3. 一般駅の丸印（ズーム13.5以上で全駅表示）
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

        // 4. 一般駅の駅名テキストラベル（ズーム14以上で全駅表示）
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

      // WebWorker をローカルから配信設定
      if (typeof maplibregl.setWorkerUrl === 'function') {
        maplibregl.setWorkerUrl('/maplibre-gl-worker.mjs');
      }

      // 既存インスタンス破棄
      if (mapInstanceRef.current?.map) {
        mapInstanceRef.current.map.remove();
        mapInstanceRef.current = null;
      }

      isMapReadyRef.current = false;

      // CARTO Positron MVT ベクタータイルスタイルを直接適用
      const map = new maplibregl.Map({
        container: mapContainerRef.current,
        style: CARTO_POSITRON_VECTOR_STYLE,
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

      // マップ準備完了ハンドラー
      const onReady = () => {
        if (isMapReadyRef.current || isCancelled) return;
        isMapReadyRef.current = true;

        map.resize();

        // 1. 鉄道強調ベクターレイヤーを追加
        addTransitLayers(map);

        // 2. 会場ピンを追加
        renderMarkers(map, maplibregl);

        // 3. 全会場が収まる広域ZOOMに初期自動調整 (fitBounds)
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
      };

      map.on('load', onReady);
      map.on('style.load', onReady);

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
  }, [venues]);

  // 会場リスト選択時にピン色とPOPUPを連動（ZOOM・カメラ移動は行わない）
  const handleSelectVenueCard = (v: Venue) => {
    setActiveVenue(v);
    if (onSelectVenue) onSelectVenue(v.id);
    updateMarkerColors(v.id);

    // 対応するマーカーのPOPUPを開く
    const item = markersRef.current.find((m) => m.venue.id === v.id);
    if (item?.marker) {
      if (!item.marker.getPopup().isOpen()) {
        item.marker.togglePopup();
      }
    }
  };

  // 選択された会場で上演される公演一覧
  const venuePerformances = activeVenue
    ? performances.filter((p) => {
        if (p.venueId === activeVenue.id) return true;
        return p.schedules.some((s) => s.venueId === activeVenue.id);
      })
    : [];

  return (
    <div className="space-y-6">
      {/* POPUP & Close Button Custom Styles */}
      <style>{`
        .maplibregl-popup {
          z-index: 100 !important;
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
      `}</style>

      {/* Map + Detail Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-white rounded-3xl border border-pink-100 p-4 sm:p-6 shadow-sm overflow-hidden">
        {/* Vector Map Container */}
        <div className="lg:col-span-8 relative rounded-2xl overflow-hidden min-h-[460px] lg:min-h-[600px] bg-slate-100 border border-slate-200">
          <div ref={mapContainerRef} className="absolute inset-0 w-full h-full" />

          {/* Map Legend: Osaka Metro 9 Lines (将来表示用として保持・現在は非表示) */}
          <div className="hidden absolute bottom-4 left-4 z-10 bg-white/95 backdrop-blur-md p-3 rounded-2xl border border-slate-200/90 shadow-lg flex-col gap-2 max-w-sm">
            <div className="flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
              <Train className="w-3.5 h-3.5 text-[#E6007E]" />
              <span className="text-[11px] font-black text-slate-900">Osaka Metro 路線ネットワーク</span>
            </div>
            
            {/* 添付画像アイコン準拠のライン＆シンボルバッジ一覧 */}
            <div className="grid grid-cols-3 gap-x-2.5 gap-y-1.5 text-[10px] font-bold text-slate-700">
              {METRO_LINES_INFO.map((line) => (
                <div key={line.symbol} className="flex items-center gap-1.5 truncate">
                  <span
                    className="w-4 h-4 rounded-full flex items-center justify-center text-white text-[9px] font-black shrink-0 shadow-xs"
                    style={{ backgroundColor: line.color }}
                  >
                    {line.symbol}
                  </span>
                  <span className="truncate">{line.name}</span>
                </div>
              ))}
            </div>

            <div className="pt-1 border-t border-slate-100 flex items-center gap-2 text-[9.5px] font-bold text-slate-500">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-1 rounded-full bg-[#333333]" /> JR線
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-1 rounded-full bg-[#666666]" /> 私鉄各線
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
    </div>
  );
}