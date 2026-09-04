import { NextRequest, NextResponse } from 'next/server';
import {
  buildOverpassQuery,
  parseOverpassData,
  generateIllustratorSvg,
  calculateBbox,
  PAPER_SIZES,
  MapExportOptions,
} from '@/lib/svgMapGenerator';

// Overpass API ミラーエンドポイント一覧 (フォールバック用)
const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://lz4.overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      centerLat,
      centerLng,
      radiusKm = 1.0,
      paperSizeId = 'square',
      stylePresetId = 'minimal-gray',
      layers,
      venues = [],
      format = 'svg', // 'svg' | 'json'
    } = body;

    if (typeof centerLat !== 'number' || typeof centerLng !== 'number') {
      return NextResponse.json(
        { error: 'Invalid coordinates: centerLat and centerLng are required numbers' },
        { status: 400 }
      );
    }

    const paper = PAPER_SIZES[paperSizeId] || PAPER_SIZES['square'];
    const aspectRatio = paper.widthPt / paper.heightPt;
    const bbox = calculateBbox(centerLat, centerLng, radiusKm, aspectRatio);
    const query = buildOverpassQuery(bbox);

    // Overpass API からデータ取得（ミラーフォールバック付き）
    let osmJson: any = null;
    let lastError: any = null;

    for (const endpoint of OVERPASS_ENDPOINTS) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 18000); // 18s timeout

        const res = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'User-Agent': 'OsakaFringeMapGenerator/1.0',
          },
          body: `data=${encodeURIComponent(query)}`,
          signal: controller.signal,
          next: { revalidate: 3600 }, // 1時間キャッシュ
        });

        clearTimeout(timeoutId);

        if (res.ok) {
          osmJson = await res.json();
          break;
        } else {
          lastError = new Error(`Overpass returned HTTP ${res.status} from ${endpoint}`);
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`[Overpass API] Failed at ${endpoint}:`, err.message || err);
      }
    }

    // もしOverpass APIが全滅した場合でも空データでエラーにせずSVG生成を続行（ローカル鉄道や会場データは描画可能）
    const parsedData = parseOverpassData(osmJson || { elements: [] });

    if (format === 'json') {
      return NextResponse.json({
        bbox,
        data: parsedData,
        elementCount: osmJson?.elements?.length || 0,
      });
    }

    const exportOptions: MapExportOptions = {
      centerLat,
      centerLng,
      radiusKm,
      paperSizeId,
      stylePresetId,
      layers: layers || {
        background: true,
        water: true,
        greenery: true,
        buildings: true,
        roadsMinor: true,
        roadsMajor: true,
        railways: true,
        metroLines: true,
        stations: true,
        venues: true,
        gridScale: true,
      },
      venues,
    };

    const svgString = generateIllustratorSvg(exportOptions, parsedData);

    return new NextResponse(svgString, {
      status: 200,
      headers: {
        'Content-Type': 'image/svg+xml; charset=utf-8',
        'Content-Disposition': `attachment; filename="osaka-fringe-map-${centerLat.toFixed(4)}_${centerLng.toFixed(4)}.svg"`,
      },
    });
  } catch (error: any) {
    console.error('[Map Export API Error]', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error while generating SVG map' },
      { status: 500 }
    );
  }
}
