import {
  buildOverpassQuery,
  parseOverpassData,
  generateIllustratorSvg,
  calculateBbox,
  PAPER_SIZES,
  MapExportOptions,
  StylePresetId,
  OsmOverpassResponse,
} from '@/lib/svgMapGenerator';
import { getClientIp, checkRateLimit, createRateLimitResponse } from '@/lib/rateLimit';
import {
  isValidCoordinateNumber,
  validateMapVenues,
  MIN_MAP_RADIUS_KM,
  MAX_MAP_RADIUS_KM,
} from '@/lib/apiValidators';

// Overpass API mirror endpoints for fallback
const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://lz4.overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
];

const ALLOWED_STYLE_PRESETS: StylePresetId[] = [
  'minimal-gray',
  'print-mono',
  'fringe-pop',
  'clean-outline',
];

const RATE_LIMIT_CONFIG = {
  maxRequests: 15,
  windowMs: 60 * 1000, // 15 requests per minute per IP
};

export async function POST(req: Request) {
  try {
    // 1. Rate Limiting
    const clientIp = getClientIp(req);
    const rateLimit = checkRateLimit(`map-export:${clientIp}`, RATE_LIMIT_CONFIG);
    if (!rateLimit.success) {
      return createRateLimitResponse(rateLimit);
    }

    // 2. Parse & Validate JSON
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return Response.json(
        { error: 'Invalid JSON request body' },
        { status: 400 }
      );
    }

    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return Response.json(
        { error: 'Request body must be a JSON object' },
        { status: 400 }
      );
    }

    const {
      centerLat,
      centerLng,
      radiusKm = 1.0,
      paperSizeId = 'square',
      stylePresetId = 'minimal-gray',
      layers,
      venues = [],
      format = 'svg',
    } = body as Record<string, unknown>;

    // 3. Coordinate validation
    if (!isValidCoordinateNumber(centerLat, -90, 90) || !isValidCoordinateNumber(centerLng, -180, 180)) {
      return Response.json(
        { error: 'Invalid coordinates: centerLat must be between -90 and 90, centerLng between -180 and 180' },
        { status: 400 }
      );
    }

    // 4. Radius validation
    if (!isValidCoordinateNumber(radiusKm, MIN_MAP_RADIUS_KM, MAX_MAP_RADIUS_KM)) {
      return Response.json(
        { error: `radiusKm must be a number between ${MIN_MAP_RADIUS_KM} and ${MAX_MAP_RADIUS_KM}` },
        { status: 400 }
      );
    }

    // 5. Paper size & Style preset validation
    const selectedPaperSizeId = typeof paperSizeId === 'string' && PAPER_SIZES[paperSizeId] ? paperSizeId : 'square';
    const selectedStylePresetId = typeof stylePresetId === 'string' && ALLOWED_STYLE_PRESETS.includes(stylePresetId as StylePresetId)
      ? (stylePresetId as StylePresetId)
      : 'minimal-gray';

    // 6. Format validation
    if (format !== 'svg' && format !== 'json') {
      return Response.json(
        { error: "format must be either 'svg' or 'json'" },
        { status: 400 }
      );
    }

    // 7. Venues validation
    const venuesResult = validateMapVenues(venues);
    if (!venuesResult.valid || !venuesResult.data) {
      return Response.json(
        { error: venuesResult.error || 'Invalid venues parameter' },
        { status: 400 }
      );
    }

    const paper = PAPER_SIZES[selectedPaperSizeId] || PAPER_SIZES['square'];
    const aspectRatio = paper.widthPt / paper.heightPt;
    const bbox = calculateBbox(centerLat, centerLng, radiusKm, aspectRatio);
    const query = buildOverpassQuery(bbox);

    // Overpass API fetch with mirror fallbacks
    let osmJson: OsmOverpassResponse | null = null;

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
          next: { revalidate: 3600 },
        });

        clearTimeout(timeoutId);

        if (res.ok) {
          osmJson = (await res.json()) as OsmOverpassResponse;
          break;
        }
      } catch (err: unknown) {
        const errMsg = err instanceof Error ? err.message : String(err);
        console.warn(`[Overpass API] Failed at ${endpoint}:`, errMsg);
      }
    }

    const parsedData = parseOverpassData(osmJson || { elements: [] });

    if (format === 'json') {
      return Response.json({
        bbox,
        data: parsedData,
        elementCount: osmJson?.elements?.length || 0,
      });
    }

    const exportOptions: MapExportOptions = {
      centerLat,
      centerLng,
      radiusKm,
      paperSizeId: selectedPaperSizeId,
      stylePresetId: selectedStylePresetId,
      layers: (layers as MapExportOptions['layers']) || {
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
      venues: venuesResult.data,
    };

    const svgString = generateIllustratorSvg(exportOptions, parsedData);

    return new Response(svgString, {
      status: 200,
      headers: {
        'Content-Type': 'image/svg+xml; charset=utf-8',
        'Content-Disposition': `attachment; filename="osaka-fringe-map-${centerLat.toFixed(4)}_${centerLng.toFixed(4)}.svg"`,
      },
    });
  } catch (error: unknown) {
    console.error('[Map Export API Error]', error);
    return Response.json(
      { error: 'Internal server error while generating SVG map' },
      { status: 500 }
    );
  }
}
