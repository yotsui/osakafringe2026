'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Venue } from '@/types';
import { useLanguage } from '@/context/LanguageContext';
import {
  MAP_DIMENSIONS,
  STYLE_PRESETS,
  DEFAULT_LAYERS,
  StylePresetId,
  LayerToggles,
  calculateBbox,
  parseOverpassData,
  generateIllustratorSvg,
  ParsedGeoData,
  MapExportOptions,
} from '@/lib/svgMapGenerator';
import {
  Download,
  Copy,
  RefreshCw,
  MapPin,
  Layers,
  Palette,
  Check,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Sparkles,
  Info,
  ChevronDown,
  Navigation,
  Crosshair,
  Sliders,
} from 'lucide-react';
import 'maplibre-gl/dist/maplibre-gl.css';
import { CARTO_POSITRON_VECTOR_STYLE } from '@/data/cartoPositronStyle';

interface SvgMapGeneratorClientProps {
  initialVenues: Venue[];
}

export default function SvgMapGeneratorClient({ initialVenues }: SvgMapGeneratorClientProps) {
  const { getText } = useLanguage();

  // Coordinates & Settings State
  // Default to Osaka city center (Nakanoshima / Umeda area)
  const [centerLat, setCenterLat] = useState<number>(34.6937);
  const [centerLng, setCenterLng] = useState<number>(135.5023);
  const [radiusKm, setRadiusKm] = useState<number>(1.0);
  const [stylePresetId, setStylePresetId] = useState<StylePresetId>('minimal-gray');
  const [layers, setLayers] = useState<LayerToggles>(DEFAULT_LAYERS);
  const [selectedVenueId, setSelectedVenueId] = useState<string>('');

  // Status & Data
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [svgString, setSvgString] = useState<string>('');
  const [parsedData, setParsedData] = useState<ParsedGeoData | null>(null);
  const [activeTab, setActiveTab] = useState<'preview' | 'picker'>('preview');
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [previewZoom, setPreviewZoom] = useState<number>(1);
  const [statusMessage, setStatusMessage] = useState<string>('');

  // MapLibre Reference for Location Picker
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  // SVG Preview Container Ref
  const svgPreviewContainerRef = useRef<HTMLDivElement>(null);

  // Generate SVG locally or via API
  const handleGenerateMap = useCallback(
    async (lat = centerLat, lng = centerLng, r = radiusKm, currentStyle = stylePresetId, currentLayers = layers) => {
      setIsLoading(true);
      setStatusMessage('OpenStreetMap から地理ベクターデータを取得中...');

      try {
        const res = await fetch('/api/map-export', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            centerLat: lat,
            centerLng: lng,
            radiusKm: r,
            paperSizeId: 'square',
            stylePresetId: currentStyle,
            layers: currentLayers,
            venues: initialVenues,
            format: 'json',
          }),
        });

        if (!res.ok) {
          throw new Error(`API error: ${res.statusText}`);
        }

        const resData = await res.json();
        const data: ParsedGeoData = resData.data;
        setParsedData(data);

        // Generate SVG string client-side with full options
        const exportOptions: MapExportOptions = {
          centerLat: lat,
          centerLng: lng,
          radiusKm: r,
          paperSizeId: 'square',
          stylePresetId: currentStyle,
          layers: currentLayers,
          venues: initialVenues,
        };

        const svg = generateIllustratorSvg(exportOptions, data);
        setSvgString(svg);
        setStatusMessage('');
      } catch (err: any) {
        console.error('[SVG Generator Error]', err);
        setStatusMessage('データ取得に失敗しました。ローカルデータで再構成します。');

        // Fallback with empty/local data
        const fallbackData = parseOverpassData({ elements: [] });
        setParsedData(fallbackData);
        const exportOptions: MapExportOptions = {
          centerLat: lat,
          centerLng: lng,
          radiusKm: r,
          paperSizeId: 'square',
          stylePresetId: currentStyle,
          layers: currentLayers,
          venues: initialVenues,
        };
        const svg = generateIllustratorSvg(exportOptions, fallbackData);
        setSvgString(svg);
      } finally {
        setIsLoading(false);
      }
    },
    [centerLat, centerLng, radiusKm, stylePresetId, layers, initialVenues]
  );

  // Fast client-side SVG re-render when style or layer checkboxes change (no network fetch needed)
  useEffect(() => {
    if (parsedData) {
      const exportOptions: MapExportOptions = {
        centerLat,
        centerLng,
        radiusKm,
        paperSizeId: 'square',
        stylePresetId,
        layers,
        venues: initialVenues,
      };
      const svg = generateIllustratorSvg(exportOptions, parsedData);
      setSvgString(svg);
    }
  }, [stylePresetId, layers, centerLat, centerLng, radiusKm, initialVenues, parsedData]);

  // Initial Load
  useEffect(() => {
    handleGenerateMap(centerLat, centerLng, radiusKm, stylePresetId, layers);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Helper to update the bounding box polygon layer on MapLibre map
  const updateMapBboxLayer = useCallback(
    (map: any, lat: number, lng: number, r: number) => {
      if (!map) return;
      const bbox = calculateBbox(lat, lng, r, 1.0);
      const bboxGeoJSON = {
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [
            [
              [bbox.west, bbox.south],
              [bbox.east, bbox.south],
              [bbox.east, bbox.north],
              [bbox.west, bbox.north],
              [bbox.west, bbox.south],
            ],
          ],
        },
      };

      const source = map.getSource('export-bbox');
      if (source) {
        source.setData(bboxGeoJSON);
      }
    },
    []
  );

  // Initialize MapLibre once and keep it active across tab switches
  useEffect(() => {
    if (!mapContainerRef.current) return;
    let isCancelled = false;

    const initMap = async () => {
      const maplibregl = (await import('maplibre-gl')) as any;
      if (isCancelled || !mapContainerRef.current || mapInstanceRef.current) return;

      if (typeof maplibregl.setWorkerUrl === 'function') {
        maplibregl.setWorkerUrl('/maplibre-gl-worker.mjs');
      }

      const map = new maplibregl.Map({
        container: mapContainerRef.current,
        style: CARTO_POSITRON_VECTOR_STYLE,
        center: [centerLng, centerLat],
        zoom: 13,
        attributionControl: false,
      });

      map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');

      map.on('load', () => {
        // Add Bounding Box source & layers
        const bbox = calculateBbox(centerLat, centerLng, radiusKm, 1.0);
        map.addSource('export-bbox', {
          type: 'geojson',
          data: {
            type: 'Feature',
            geometry: {
              type: 'Polygon',
              coordinates: [
                [
                  [bbox.west, bbox.south],
                  [bbox.east, bbox.south],
                  [bbox.east, bbox.north],
                  [bbox.west, bbox.north],
                  [bbox.west, bbox.south],
                ],
              ],
            },
          },
        });

        // Semi-transparent fill
        map.addLayer({
          id: 'export-bbox-fill',
          type: 'fill',
          source: 'export-bbox',
          paint: {
            'fill-color': '#E6007E',
            'fill-opacity': 0.12,
          },
        });

        // Crisp border line
        map.addLayer({
          id: 'export-bbox-line',
          type: 'line',
          source: 'export-bbox',
          paint: {
            'line-color': '#E6007E',
            'line-width': 2.5,
            'line-dasharray': [3, 2],
          },
        });
      });

      // Draggable center pin
      const markerEl = document.createElement('div');
      markerEl.style.width = '26px';
      markerEl.style.height = '26px';
      markerEl.style.background = '#E6007E';
      markerEl.style.borderRadius = '50%';
      markerEl.style.border = '3px solid #ffffff';
      markerEl.style.boxShadow = '0 4px 14px rgba(230,0,126,0.6)';
      markerEl.style.cursor = 'grab';

      const marker = new maplibregl.Marker({ element: markerEl, draggable: true })
        .setLngLat([centerLng, centerLat])
        .addTo(map);

      marker.on('drag', () => {
        const lngLat = marker.getLngLat();
        updateMapBboxLayer(map, lngLat.lat, lngLat.lng, radiusKm);
      });

      marker.on('dragend', () => {
        const lngLat = marker.getLngLat();
        const newLat = Math.round(lngLat.lat * 100000) / 100000;
        const newLng = Math.round(lngLat.lng * 100000) / 100000;
        setCenterLat(newLat);
        setCenterLng(newLng);
        updateMapBboxLayer(map, newLat, newLng, radiusKm);
      });

      markerRef.current = marker;

      // Click to move center
      map.on('click', (e: any) => {
        const { lng, lat } = e.lngLat;
        const newLat = Math.round(lat * 100000) / 100000;
        const newLng = Math.round(lng * 100000) / 100000;
        setCenterLat(newLat);
        setCenterLng(newLng);
        marker.setLngLat([newLng, newLat]);
        updateMapBboxLayer(map, newLat, newLng, radiusKm);
      });

      mapInstanceRef.current = map;
    };

    initMap();

    return () => {
      isCancelled = true;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Resize MapLibre when switching tabs or coordinates/radius change
  useEffect(() => {
    if (mapInstanceRef.current) {
      if (activeTab === 'picker') {
        setTimeout(() => {
          mapInstanceRef.current?.resize();
        }, 50);
      }
      updateMapBboxLayer(mapInstanceRef.current, centerLat, centerLng, radiusKm);
      if (markerRef.current) {
        markerRef.current.setLngLat([centerLng, centerLat]);
      }
    }
  }, [activeTab, centerLat, centerLng, radiusKm, updateMapBboxLayer]);

  // Venue selection helper
  const handleSelectVenue = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const venueId = e.target.value;
    setSelectedVenueId(venueId);
    if (!venueId) return;
    const v = initialVenues.find((item) => item.id === venueId);
    if (v) {
      const lat = Number(v.location.lat);
      const lng = Number(v.location.lng);
      if (!isNaN(lat) && !isNaN(lng)) {
        const roundLat = Math.round(lat * 100000) / 100000;
        const roundLng = Math.round(lng * 100000) / 100000;
        setCenterLat(roundLat);
        setCenterLng(roundLng);
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo({ center: [roundLng, roundLat], zoom: 14, duration: 600 });
          updateMapBboxLayer(mapInstanceRef.current, roundLat, roundLng, radiusKm);
        }
        handleGenerateMap(roundLat, roundLng, radiusKm);
      }
    }
  };

  // Quick preset radius
  const radiusPresets = [
    { label: '500m (徒歩圏)', value: 0.5 },
    { label: '1km (周辺地区)', value: 1.0 },
    { label: '2km (主要区間)', value: 2.0 },
    { label: '3km (広域マップ)', value: 3.0 },
    { label: '5km (都市圏)', value: 5.0 },
  ];

  // Layer toggle handler
  const toggleLayer = (key: keyof LayerToggles) => {
    setLayers((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleAllLayers = (enable: boolean) => {
    const next = {} as LayerToggles;
    (Object.keys(DEFAULT_LAYERS) as (keyof LayerToggles)[]).forEach((k) => {
      next[k] = enable;
    });
    setLayers(next);
  };

  // Download SVG
  const handleDownloadSvg = () => {
    if (!svgString) return;
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `osaka-fringe-map-200x200mm_lat${centerLat.toFixed(4)}_lng${centerLng.toFixed(4)}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Copy SVG Code
  const handleCopySvg = async () => {
    if (!svgString) return;
    try {
      await navigator.clipboard.writeText(svgString);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.warn('Copy failed', err);
    }
  };

  // Geolocation lookup
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = Math.round(pos.coords.latitude * 100000) / 100000;
        const lng = Math.round(pos.coords.longitude * 100000) / 100000;
        setCenterLat(lat);
        setCenterLng(lng);
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo({ center: [lng, lat], zoom: 14, duration: 600 });
          updateMapBboxLayer(mapInstanceRef.current, lat, lng, radiusKm);
        }
        handleGenerateMap(lat, lng, radiusKm);
      },
      (err) => console.warn('Geolocation error:', err),
      { enableHighAccuracy: true, timeout: 5000 }
    );
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 pb-20">
      {/* Top Header Sticky Bar */}
      <div className="border-b border-slate-800 bg-slate-950/85 backdrop-blur-md sticky top-20 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#E6007E] to-purple-600 flex items-center justify-center text-white shadow-lg shadow-pink-900/30 shrink-0">
              <Crosshair className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  SVG Map Generator
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-pink-500/15 text-[#E6007E] border border-pink-500/30 text-[11px] font-black">
                  200 × 200 mm (正方形)
                </span>
                <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-[10px] font-bold">
                  Illustrator レイヤー構造
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                指定した緯度経度の周辺地図を、印刷・イラストレーター編集用ベクターSVGとして出力します
              </p>
            </div>
          </div>

          {/* Primary Quick Actions */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={handleCopySvg}
              disabled={!svgString || isLoading}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
            >
              {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{isCopied ? 'コピー完了' : 'SVGコードをコピー'}</span>
            </button>

            <button
              onClick={handleDownloadSvg}
              disabled={!svgString || isLoading}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#E6007E] hover:bg-[#c4006b] text-white text-xs font-black shadow-lg shadow-pink-900/40 transition-all transform active:scale-95 cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>SVG ダウンロード (.svg)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* ========================================================= */}
          {/* LEFT SIDEBAR: CONTROLS & SETTINGS (5 cols) */}
          {/* ========================================================= */}
          <div className="lg:col-span-5 space-y-5">
            
            {/* 1. 位置 & 範囲指定 */}
            <div className="bg-slate-950 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#E6007E]" />
                  <h2 className="text-sm font-black text-white">1. 中心座標 &amp; カバレッジ範囲</h2>
                </div>
                <button
                  type="button"
                  onClick={handleGetCurrentLocation}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-[11px] font-bold text-slate-300 border border-slate-800 transition-colors"
                  title="現在地を中心にする"
                >
                  <Navigation className="w-3 h-3 text-[#E6007E]" />
                  <span>現在地</span>
                </button>
              </div>

              {/* 会場クイック選択 */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                  <span>会場から中心を選択</span>
                  <span className="text-[10px] text-[#E6007E] font-semibold">クイック選択</span>
                </label>
                <div className="relative">
                  <select
                    value={selectedVenueId}
                    onChange={handleSelectVenue}
                    className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-2.5 pr-8 font-medium focus:ring-2 focus:ring-[#E6007E] focus:outline-none appearance-none cursor-pointer"
                  >
                    <option value="">会場を選択してください（または下で座標入力）...</option>
                    {initialVenues.map((v) => (
                      <option key={v.id} value={v.id}>
                        {getText(v.area, v.areaEn)} - {getText(v.name, v.nameEn)}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                </div>
              </div>

              {/* 緯度・経度入力 */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400">緯度 (Latitude)</label>
                  <input
                    type="number"
                    step="0.00001"
                    value={centerLat}
                    onChange={(e) => setCenterLat(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-white focus:ring-2 focus:ring-[#E6007E] focus:outline-none"
                    placeholder="34.6937"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400">経度 (Longitude)</label>
                  <input
                    type="number"
                    step="0.00001"
                    value={centerLng}
                    onChange={(e) => setCenterLng(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-white focus:ring-2 focus:ring-[#E6007E] focus:outline-none"
                    placeholder="135.5023"
                  />
                </div>
              </div>

              {/* 半径・範囲プリセット */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                  <span>出力範囲（半径）</span>
                  <span className="text-[#E6007E] font-mono font-bold">
                    {radiusKm >= 1 ? `${radiusKm} km` : `${radiusKm * 1000} m`} 四方
                  </span>
                </div>
                <div className="grid grid-cols-5 gap-1.5">
                  {radiusPresets.map((r) => (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => {
                        setRadiusKm(r.value);
                        if (mapInstanceRef.current) {
                          updateMapBboxLayer(mapInstanceRef.current, centerLat, centerLng, r.value);
                        }
                      }}
                      className={`py-1.5 px-1 rounded-xl text-[10px] font-bold transition-all text-center cursor-pointer ${
                        radiusKm === r.value
                          ? 'bg-[#E6007E] text-white shadow-md'
                          : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
                      }`}
                    >
                      {r.value >= 1 ? `${r.value}km` : `${r.value * 1000}m`}
                    </button>
                  ))}
                </div>
              </div>

              {/* データ再取得・更新ボタン */}
              <button
                type="button"
                onClick={() => handleGenerateMap(centerLat, centerLng, radiusKm)}
                disabled={isLoading}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-gradient-to-r from-[#E6007E] to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-black text-xs shadow-lg transition-all cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span>{isLoading ? 'OSMベクターデータ取得中...' : 'この座標でSVGマップを再生成'}</span>
              </button>
            </div>

            {/* 2. カラースタイル選択 (ミニマルグレー デフォルト) */}
            <div className="bg-slate-950 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-2">
                  <Palette className="w-4 h-4 text-purple-400" />
                  <h2 className="text-sm font-black text-white">2. カラースタイル</h2>
                </div>
                <span className="text-[11px] font-bold text-slate-400">即時プレビュー反映</span>
              </div>

              <div className="space-y-2">
                {Object.values(STYLE_PRESETS).map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setStylePresetId(st.id)}
                    className={`w-full p-3 rounded-2xl text-left border transition-all cursor-pointer flex items-start gap-3 ${
                      stylePresetId === st.id
                        ? 'bg-pink-950/40 border-[#E6007E] text-white ring-1 ring-[#E6007E]'
                        : 'bg-slate-900 hover:bg-slate-850 border-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">
                      <div
                        className="w-4 h-4 rounded-full border border-white/40 shadow-sm"
                        style={{ background: st.waterStroke || st.venuePinColor }}
                      />
                    </div>
                    <div className="space-y-0.5 min-w-0">
                      <div className="text-xs font-black text-white flex items-center gap-2">
                        <span>{st.name}</span>
                        {st.id === 'minimal-gray' && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-emerald-400 font-bold border border-emerald-500/30">
                            デフォルト
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 leading-relaxed truncate sm:whitespace-normal">
                        {st.description}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* 3. 出力レイヤー選択 */}
            <div className="bg-slate-950 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-400" />
                  <h2 className="text-sm font-black text-white">3. レイヤー構成</h2>
                </div>
                <div className="flex items-center gap-2 text-[11px]">
                  <button
                    type="button"
                    onClick={() => toggleAllLayers(true)}
                    className="text-[#E6007E] hover:underline font-bold cursor-pointer"
                  >
                    全選択
                  </button>
                  <span className="text-slate-600">|</span>
                  <button
                    type="button"
                    onClick={() => toggleAllLayers(false)}
                    className="text-slate-400 hover:underline font-bold cursor-pointer"
                  >
                    全解除
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {[
                  { key: 'background', label: '01_背景 (用紙色 & 枠線)', icon: '⬜' },
                  { key: 'water', label: '02_水域・河川・海', icon: '💧' },
                  { key: 'greenery', label: '03_公園・緑地', icon: '🌳' },
                  { key: 'buildings', label: '04_建物フットプリント', icon: '🏢' },
                  { key: 'roadsMinor', label: '05_一般道路・街路', icon: '🛣️' },
                  { key: 'roadsMajor', label: '06_主要道路・幹線', icon: '🚗' },
                  { key: 'railways', label: '07_鉄道線路 (JR・私鉄)', icon: '🚆' },
                  { key: 'metroLines', label: '08_Osaka Metro各線', icon: '🚇' },
                  { key: 'stations', label: '09_駅・駅名ラベル', icon: '🚉' },
                  { key: 'venues', label: '10_会場ピン＆名称', icon: '📍' },
                  { key: 'gridScale', label: '12_縮尺・方角記号', icon: '🧭' },
                ].map(({ key, label, icon }) => {
                  const isChecked = layers[key as keyof LayerToggles];
                  return (
                    <label
                      key={key}
                      onClick={() => toggleLayer(key as keyof LayerToggles)}
                      className={`flex items-center gap-2 p-2.5 rounded-xl border transition-all cursor-pointer ${
                        isChecked
                          ? 'bg-slate-900 border-emerald-500/40 text-white'
                          : 'bg-slate-950 border-slate-850 text-slate-500 opacity-60'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="rounded border-slate-700 text-[#E6007E] focus:ring-0 focus:outline-none"
                      />
                      <span className="text-[11px] font-bold truncate">
                        {icon} {label}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* 4. Illustrator 用Tips */}
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-3xl p-5 space-y-2.5 text-xs text-slate-400">
              <div className="flex items-center gap-2 text-slate-200 font-bold">
                <Info className="w-4 h-4 text-[#E6007E]" />
                <span>Illustratorでの編集のポイント</span>
              </div>
              <ul className="space-y-1.5 list-disc list-inside leading-relaxed text-[11px]">
                <li>正方形 200×200mm のアートボードとしてそのまま読み込まれます。</li>
                <li>レイヤーパネルを開くと各要素（道路・水域・建物・駅名）がグループごとに整列しています。</li>
                <li>「共通の線幅」「共通のカラー」選択で一括スタイル変更が可能です。</li>
              </ul>
            </div>
          </div>

          {/* ========================================================= */}
          {/* RIGHT PREVIEW & MAP CONTAINER (7 cols) */}
          {/* ========================================================= */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* View Mode Switcher Header */}
            <div className="flex items-center justify-between bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setActiveTab('preview')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                    activeTab === 'preview'
                      ? 'bg-[#E6007E] text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>リアルタイム SVG プレビュー</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('picker')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                    activeTab === 'picker'
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>位置ピッカー地図（範囲枠確認）</span>
                </button>
              </div>

              {activeTab === 'preview' && (
                <div className="flex items-center gap-1 pr-1">
                  <button
                    type="button"
                    onClick={() => setPreviewZoom((z) => Math.max(0.4, Math.round((z - 0.2) * 10) / 10))}
                    className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 cursor-pointer"
                    title="縮小"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[10px] font-mono text-slate-400 px-1 font-bold min-w-[3rem] text-center">
                    {Math.round(previewZoom * 100)}%
                  </span>
                  <button
                    type="button"
                    onClick={() => setPreviewZoom((z) => Math.min(3, Math.round((z + 0.2) * 10) / 10))}
                    className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 cursor-pointer"
                    title="拡大"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewZoom(1)}
                    className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 cursor-pointer ml-1"
                    title="等倍に戻す"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* TAB 1: SVG PREVIEW CANVAS */}
            <div className={`${activeTab === 'preview' ? 'block' : 'hidden'}`}>
              <div className="bg-slate-950 border border-slate-800 rounded-3xl p-4 sm:p-6 space-y-4 shadow-xl">
                {/* Status Bar */}
                <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="font-bold text-slate-300">
                      正方形 200 × 200 mm (566.93 × 566.93 pt)
                    </span>
                  </div>
                  {parsedData && (
                    <div className="hidden sm:flex items-center gap-3 text-[11px] text-slate-400">
                      <span>💧 水域: {parsedData.waterPolygons.length + parsedData.waterLines.length}</span>
                      <span>🌳 緑地: {parsedData.greeneryPolygons.length}</span>
                      <span>🛣️ 道路: {parsedData.roadsMajor.length + parsedData.roadsMinor.length}</span>
                      <span>🚆 線路: {parsedData.railways.length}</span>
                    </div>
                  )}
                </div>

                {/* SVG Render Container */}
                <div
                  ref={svgPreviewContainerRef}
                  className="relative min-h-[500px] sm:min-h-[620px] max-h-[720px] overflow-auto bg-slate-900/90 rounded-2xl border border-slate-800 flex items-center justify-center p-4 select-none"
                >
                  {isLoading ? (
                    <div className="flex flex-col items-center justify-center space-y-3 text-slate-400 py-24">
                      <RefreshCw className="w-9 h-9 text-[#E6007E] animate-spin" />
                      <div className="text-xs font-bold">{statusMessage || 'ベクターデータを生成中...'}</div>
                    </div>
                  ) : svgString ? (
                    <div
                      style={{
                        transform: `scale(${previewZoom})`,
                        transformOrigin: 'center center',
                        transition: 'transform 0.1s ease-out',
                      }}
                      className="shadow-2xl max-w-full flex items-center justify-center"
                      dangerouslySetInnerHTML={{ __html: svgString }}
                    />
                  ) : (
                    <div className="text-slate-500 text-xs font-bold py-24 text-center">
                      「SVGマップを再生成」をクリックしてください
                    </div>
                  )}
                </div>

                {/* Bottom Bar Under Preview */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                  <div className="text-xs text-slate-400">
                    💡 Illustrator / Inkscape / Affinity 等でレイヤーが自動認識されます
                  </div>
                  <button
                    onClick={handleDownloadSvg}
                    disabled={!svgString || isLoading}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-[#E6007E] hover:bg-[#c4006b] text-white text-xs font-black shadow-lg shadow-pink-900/50 cursor-pointer transition-all active:scale-95 disabled:opacity-50"
                  >
                    <Download className="w-4 h-4" />
                    <span>このSVGをダウンロード (200×200mm)</span>
                  </button>
                </div>
              </div>
            </div>

            {/* TAB 2: INTERACTIVE LOCATION PICKER MAP (WITH VISUAL 200x200mm BOUNDING BOX) */}
            <div className={`${activeTab === 'picker' ? 'block' : 'hidden'}`}>
              <div className="bg-slate-950 border border-slate-800 rounded-3xl p-4 sm:p-6 space-y-4 shadow-xl">
                <div className="flex items-center justify-between text-xs text-slate-300 border-b border-slate-800 pb-3">
                  <div className="font-bold flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#E6007E]" />
                    <span>地図上をクリックまたはピンクのピンをドラッグして中心座標を指定</span>
                  </div>
                  <span className="text-[11px] text-[#E6007E] font-bold hidden sm:inline">
                    ピンク枠 = SVG出力範囲
                  </span>
                </div>

                <div className="relative min-h-[500px] sm:min-h-[620px] rounded-2xl overflow-hidden border border-slate-800">
                  <div ref={mapContainerRef} className="absolute inset-0 w-full h-full" />
                  
                  {/* Floating Action Badge on Map */}
                  <div className="absolute bottom-4 left-4 right-4 sm:right-auto bg-slate-950/90 backdrop-blur-md border border-slate-700/80 p-3 rounded-2xl shadow-2xl flex items-center justify-between gap-4 z-10">
                    <div className="text-xs">
                      <div className="font-bold text-white">中心座標</div>
                      <div className="text-[11px] font-mono text-pink-400">
                        {centerLat.toFixed(5)}°N, {centerLng.toFixed(5)}°E
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('preview');
                        handleGenerateMap(centerLat, centerLng, radiusKm);
                      }}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#E6007E] hover:bg-[#c4006b] text-white text-xs font-black shadow-md transition-all cursor-pointer"
                    >
                      <span>この範囲でSVGを生成</span>
                      →
                    </button>
                  </div>
                </div>

                <div className="text-xs text-slate-400 flex items-center justify-between pt-1">
                  <span>💡 地図上のピンクの破線枠が、200×200mmのSVGとして切り出されます。</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

