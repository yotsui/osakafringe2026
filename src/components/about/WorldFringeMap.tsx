'use client';

import React, { useEffect, useRef } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { WORLD_FRINGES } from '@/data/worldFringes';
import { Globe } from 'lucide-react';
import 'maplibre-gl/dist/maplibre-gl.css';

export default function WorldFringeMap() {
  const { language, t } = useLanguage();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const isMapReadyRef = useRef<boolean>(false);

  const isJa = language === 'ja';

  // Marker creation & MapLibre initialization
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

      // CARTO Positron MVT Vector Tile Style
      const map = new maplibregl.Map({
        container: mapContainerRef.current,
        style: '/data/carto-positron-style.json',
        center: [15, 22],
        zoom: 1.35,
        minZoom: 1,
        maxZoom: 14,
        cooperativeGestures: true,
        attributionControl: false,
      });

      // Controls
      map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
      map.addControl(new maplibregl.FullscreenControl(), 'bottom-right');
      map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right');

      const onReady = () => {
        if (isMapReadyRef.current || isCancelled) return;
        isMapReadyRef.current = true;
        map.resize();

        // Add Markers for all World Fringes
        WORLD_FRINGES.forEach((festival) => {
          const el = document.createElement('div');
          el.className = 'world-fringe-marker';
          el.style.cursor = 'pointer';

          if (festival.isOsaka) {
            // Special Osaka Marker (YOU ARE HERE)
            el.className = 'world-fringe-marker world-fringe-marker-osaka';
            el.style.width = '42px';
            el.style.height = '42px';
            el.style.position = 'relative';
            el.style.display = 'flex';
            el.style.alignItems = 'center';
            el.style.justifyContent = 'center';

            el.innerHTML = `
              <div style="position: absolute; inset: 0; border-radius: 50%; background-color: rgba(230, 0, 126, 0.35); animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
              <div style="position: relative; width: 28px; height: 28px; background: #E6007E; border: 3px solid #FFF100; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 14px rgba(230,0,126,0.6);">
                <div style="width: 8px; height: 8px; background: #FFF100; border-radius: 50%;"></div>
              </div>
            `;
          } else {
            // Standard World Fringe Marker
            el.className = 'world-fringe-marker';
            el.style.width = '24px';
            el.style.height = '24px';
            el.style.display = 'flex';
            el.style.alignItems = 'center';
            el.style.justifyContent = 'center';

            el.innerHTML = `
              <div class="fringe-pin-dot" style="width: 14px; height: 14px; background: #E6007E; border: 2.5px solid #ffffff; border-radius: 50%; box-shadow: 0 2px 8px rgba(230,0,126,0.45); transition: transform 0.2s ease, background 0.2s ease;"></div>
            `;
          }

          // Popup content - City name in ALPHABET ONLY (no Japanese)
          const locationLabel = `${festival.city}, ${festival.country}`;
          const visitBtnLabel = 'OFFICIAL SITE ↗';

          let popupHtml = '';

          if (festival.isOsaka) {
            popupHtml = `
              <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #0f172a; padding: 4px 2px;">
                <div style="display: inline-flex; align-items: center; gap: 4px; padding: 3px 8px; border-radius: 9999px; background: #FFF100; color: #000000; font-size: 10px; font-weight: 900; letter-spacing: 0.08em; margin-bottom: 6px;">
                  ★ YOU ARE HERE
                </div>
                <div style="font-size: 16px; font-weight: 900; line-height: 1.25; color: #0f172a; margin-bottom: 2px;">
                  Osaka
                </div>
                <div style="font-size: 12px; font-weight: 800; color: #E6007E; margin-bottom: 2px;">
                  Osaka Fringe 2026
                </div>
                <div style="font-size: 11px; font-weight: 600; color: #64748b;">
                  Japan
                </div>
              </div>
            `;
          } else {
            // If url exists, show the official link button. If not, NO link is rendered.
            const linkHtml = festival.url
              ? `
                <div style="margin-top: 8px; padding-top: 4px;">
                  <a href="${festival.url}" target="_blank" rel="noopener noreferrer" style="
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
                    background: #E6007E;
                    color: #ffffff;
                    padding: 6px 12px;
                    border-radius: 8px;
                    font-size: 11px;
                    font-weight: 800;
                    text-decoration: none;
                    letter-spacing: 0.03em;
                    box-shadow: 0 2px 6px rgba(230,0,126,0.3);
                    transition: opacity 0.15s ease;
                  ">
                    <span>${visitBtnLabel}</span>
                  </a>
                </div>
              `
              : '';

            popupHtml = `
              <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #0f172a; padding: 4px 2px;">
                <div style="font-size: 15px; font-weight: 900; line-height: 1.25; color: #0f172a; margin-bottom: 2px;">
                  ${festival.city}
                </div>
                <div style="font-size: 11px; font-weight: 700; color: #64748b; margin-bottom: 4px;">
                  ${festival.country}
                </div>
                ${linkHtml}
              </div>
            `;
          }

          const popup = new maplibregl.Popup({
            offset: [0, -12],
            closeButton: true,
            closeOnClick: true,
            maxWidth: '280px',
          }).setHTML(popupHtml);

          new maplibregl.Marker({ element: el })
            .setLngLat([festival.lng, festival.lat])
            .setPopup(popup)
            .addTo(map);
        });
      };

      map.on('load', onReady);
      map.on('style.load', onReady);

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
  }, [isJa]);

  return (
    <div className="space-y-4">
      {/* Global CSS for MapLibre Popups & Ping Animation */}
      <style>{`
        @keyframes ping {
          75%, 100% {
            transform: scale(2);
            opacity: 0;
          }
        }
        .maplibregl-marker, .world-fringe-marker {
          z-index: 2 !important;
        }
        .world-fringe-marker-osaka {
          z-index: 5 !important;
        }
        .world-fringe-marker:hover {
          z-index: 20 !important;
        }
        .world-fringe-marker:hover .fringe-pin-dot {
          transform: scale(1.4);
          background: #FFF100 !important;
          border-color: #000000 !important;
        }
        .maplibregl-popup {
          z-index: 1000 !important;
        }
        .maplibregl-popup-content {
          position: relative !important;
          z-index: 1000 !important;
          background: #ffffff !important;
          border-radius: 16px !important;
          box-shadow: 0 16px 36px -4px rgba(15, 23, 42, 0.3) !important;
          padding: 14px 16px 12px 16px !important;
          border: 1px solid #e2e8f0 !important;
        }
        .maplibregl-popup-close-button {
          width: 24px !important;
          height: 24px !important;
          font-size: 14px !important;
          font-weight: 700 !important;
          line-height: 22px !important;
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
          padding: 0 !important;
        }
        .maplibregl-popup-close-button:hover {
          background-color: #fee2e2 !important;
          color: #ef4444 !important;
        }
      `}</style>

      {/* World Map Container Box */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 border border-pink-100 shadow-sm overflow-hidden space-y-4">
        {/* Map Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-1 pt-1">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-[#E6007E]" />
            <span className="text-xs sm:text-sm font-black tracking-wider uppercase text-slate-800">
              {isJa ? '世界各地のFringe Festival' : 'GLOBAL FRINGE FESTIVALS'}
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs font-bold text-slate-600">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#E6007E] inline-block shadow-xs" />
              <span>Fringe Cities ({WORLD_FRINGES.length})</span>
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-50 border border-pink-200 text-[#E6007E] font-black text-xs shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-[#FFF100] border border-[#E6007E] inline-block" />
              <span>2026 OSAKA</span>
            </span>
          </div>
        </div>

        {/* Interactive Map Canvas */}
        <div className="relative w-full h-[400px] sm:h-[480px] lg:h-[560px] rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 isolate">
          <div ref={mapContainerRef} className="absolute inset-0 w-full h-full" />
        </div>

        {/* Map Note */}
        <div className="px-1 pt-1 text-xs text-slate-500 font-medium leading-relaxed max-w-3xl">
          <p>
            {t('fringeWorldNote')}
          </p>
        </div>
      </div>
    </div>
  );
}
