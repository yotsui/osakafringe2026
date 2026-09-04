/**
 * SVG Map Generator for Print & Adobe Illustrator
 * 緯度経度からAdobe Illustrator編集用のレイヤー構造化SVGマップを生成するエンジン
 */

import { Venue } from '@/types';
import { OSAKA_TRANSIT_LINES, OSAKA_TRANSIT_STATIONS } from '@/data/transitData';

export interface BoundingBox {
  south: number;
  west: number;
  north: number;
  east: number;
}

export interface PaperSizeOption {
  id: string;
  name: string;
  nameEn: string;
  widthMm: number;
  heightMm: number;
  widthPt: number;
  heightPt: number;
}

export const MAP_DIMENSIONS = {
  widthMm: 200,
  heightMm: 200,
  widthPt: 566.93,
  heightPt: 566.93,
};

export const PAPER_SIZES: Record<string, PaperSizeOption> = {
  'square': {
    id: 'square',
    name: '正方形 (200 × 200 mm)',
    nameEn: 'Square (200 × 200 mm)',
    widthMm: 200,
    heightMm: 200,
    widthPt: 566.93,
    heightPt: 566.93,
  },
};

export type StylePresetId = 'minimal-gray' | 'print-mono' | 'fringe-pop' | 'clean-outline';

export interface StyleTheme {
  id: StylePresetId;
  name: string;
  nameEn: string;
  description: string;
  bg: string;
  waterFill: string;
  waterStroke: string;
  greeneryFill: string;
  greeneryStroke: string;
  buildingFill: string;
  buildingStroke: string;
  roadMinorStroke: string;
  roadMinorWidth: number;
  roadMajorStroke: string;
  roadMajorWidth: number;
  railwayStroke: string;
  railwayWidth: number;
  stationCircleFill: string;
  stationCircleStroke: string;
  stationTextColor: string;
  venuePinColor: string;
  venueTextColor: string;
  scaleColor: string;
  gridColor: string;
}

export const STYLE_PRESETS: Record<StylePresetId, StyleTheme> = {
  'minimal-gray': {
    id: 'minimal-gray',
    name: 'ミニマルグレー（標準・おすすめ）',
    nameEn: 'Minimal Gray (Positron)',
    description: '落ち着いたトーンで背景地図として使いやすいグレースケール調',
    bg: '#fafaf8',
    waterFill: '#e0e7ee',
    waterStroke: '#ccd6e0',
    greeneryFill: '#edf1ea',
    greeneryStroke: '#d6dfd3',
    buildingFill: '#f0f0ee',
    buildingStroke: '#e3e3df',
    roadMinorStroke: '#ffffff',
    roadMinorWidth: 1.5,
    roadMajorStroke: '#d6d6d2',
    roadMajorWidth: 3.0,
    railwayStroke: '#888888',
    railwayWidth: 1.8,
    stationCircleFill: '#ffffff',
    stationCircleStroke: '#555555',
    stationTextColor: '#222222',
    venuePinColor: '#E6007E',
    venueTextColor: '#E6007E',
    scaleColor: '#555555',
    gridColor: '#e5e5e0',
  },
  'print-mono': {
    id: 'print-mono',
    name: '印刷用モノクロ・線画',
    nameEn: 'Print Monochrome (B&W)',
    description: 'Illustratorで着色・編集しやすいモノクロ線画。印刷版下やチラシに最適',
    bg: '#ffffff',
    waterFill: '#f0f0f0',
    waterStroke: '#333333',
    greeneryFill: '#f7f7f7',
    greeneryStroke: '#777777',
    buildingFill: '#ebebeb',
    buildingStroke: '#aaaaaa',
    roadMinorStroke: '#ffffff',
    roadMinorWidth: 1.5,
    roadMajorStroke: '#555555',
    roadMajorWidth: 3.0,
    railwayStroke: '#111111',
    railwayWidth: 2.0,
    stationCircleFill: '#ffffff',
    stationCircleStroke: '#000000',
    stationTextColor: '#000000',
    venuePinColor: '#000000',
    venueTextColor: '#000000',
    scaleColor: '#000000',
    gridColor: '#cccccc',
  },
  'fringe-pop': {
    id: 'fringe-pop',
    name: '大阪フリンジ（標準カラー）',
    nameEn: 'Osaka Fringe Pop Color',
    description: 'ピンクと鮮やかな路線色を活かした視認性の高いフェスティバルスタイル',
    bg: '#ffffff',
    waterFill: '#d8eefc',
    waterStroke: '#b8daf2',
    greeneryFill: '#e2f4e5',
    greeneryStroke: '#c4e8ca',
    buildingFill: '#f1f3f7',
    buildingStroke: '#e2e5eb',
    roadMinorStroke: '#ffffff',
    roadMinorWidth: 1.8,
    roadMajorStroke: '#ffc83b',
    roadMajorWidth: 3.5,
    railwayStroke: '#444444',
    railwayWidth: 2.2,
    stationCircleFill: '#ffffff',
    stationCircleStroke: '#E6007E',
    stationTextColor: '#0f172a',
    venuePinColor: '#E6007E',
    venueTextColor: '#E6007E',
    scaleColor: '#334155',
    gridColor: 'rgba(226, 232, 240, 0.7)',
  },
  'clean-outline': {
    id: 'clean-outline',
    name: 'クリーンアウトライン（塗りなし線画）',
    nameEn: 'Clean Outlines Only',
    description: '面塗りをすべて透明にし、線画（パス）のみで構成。イラレで自在にカスタム可能',
    bg: '#ffffff',
    waterFill: 'none',
    waterStroke: '#0284c7',
    greeneryFill: 'none',
    greeneryStroke: '#16a34a',
    buildingFill: 'none',
    buildingStroke: '#cbd5e1',
    roadMinorStroke: '#e2e8f0',
    roadMinorWidth: 1.2,
    roadMajorStroke: '#64748b',
    roadMajorWidth: 2.5,
    railwayStroke: '#0f172a',
    railwayWidth: 2.0,
    stationCircleFill: '#ffffff',
    stationCircleStroke: '#0f172a',
    stationTextColor: '#0f172a',
    venuePinColor: '#E6007E',
    venueTextColor: '#E6007E',
    scaleColor: '#475569',
    gridColor: '#e2e8f0',
  },
};

export interface LayerToggles {
  background: boolean;
  water: boolean;
  greenery: boolean;
  buildings: boolean;
  roadsMinor: boolean;
  roadsMajor: boolean;
  railways: boolean;
  metroLines: boolean;
  stations: boolean;
  venues: boolean;
  gridScale: boolean;
}

export const DEFAULT_LAYERS: LayerToggles = {
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
};

export interface MapExportOptions {
  centerLat: number;
  centerLng: number;
  radiusKm: number;
  paperSizeId: string;
  stylePresetId: StylePresetId;
  layers: LayerToggles;
  venues: Venue[];
}

/**
 * 緯度経度からメルカトル投影（Spherical Mercator）への変換
 */
function projectMercator(lat: number, lng: number): { x: number; y: number } {
  const d = Math.PI / 180;
  const maxLat = 85.0511287798;
  const clampedLat = Math.max(Math.min(maxLat, lat), -maxLat);
  const sin = Math.sin(clampedLat * d);

  return {
    x: lng * d,
    y: Math.log((1 + sin) / (1 - sin)) / 2,
  };
}

/**
 * 中心座標、半径(km)、キャンバスのアスペクト比からバウンディングボックスを計算
 */
export function calculateBbox(
  centerLat: number,
  centerLng: number,
  radiusKm: number,
  aspectRatio: number // width / height
): BoundingBox {
  const latDelta = radiusKm / 111.32;
  const lngDelta = (radiusKm / (111.32 * Math.cos((centerLat * Math.PI) / 180))) * aspectRatio;

  return {
    south: centerLat - latDelta,
    north: centerLat + latDelta,
    west: centerLng - lngDelta,
    east: centerLng + lngDelta,
  };
}

/**
 * 緯度経度 -> キャンバスSVG座標変換
 */
export class MercatorProjector {
  private minX: number;
  private maxX: number;
  private minY: number;
  private maxY: number;
  private width: number;
  private height: number;
  private margin: number;

  constructor(bbox: BoundingBox, width: number, height: number, margin = 20) {
    this.width = width;
    this.height = height;
    this.margin = margin;

    const pNW = projectMercator(bbox.north, bbox.west);
    const pSE = projectMercator(bbox.south, bbox.east);

    this.minX = pNW.x;
    this.maxX = pSE.x;
    this.minY = pSE.y;
    this.maxY = pNW.y;
  }

  public toCanvasPoint(lat: number, lng: number): [number, number] {
    const p = projectMercator(lat, lng);
    const effectiveWidth = this.width - this.margin * 2;
    const effectiveHeight = this.height - this.margin * 2;

    const x = this.margin + ((p.x - this.minX) / (this.maxX - this.minX)) * effectiveWidth;
    const y = this.margin + ((this.maxY - p.y) / (this.maxY - this.minY)) * effectiveHeight;

    return [Math.round(x * 100) / 100, Math.round(y * 100) / 100];
  }

  public isInside(lat: number, lng: number): boolean {
    const p = projectMercator(lat, lng);
    return p.x >= this.minX && p.x <= this.maxX && p.y >= this.minY && p.y <= this.maxY;
  }
}

/**
 * Overpass QLクエリを生成
 */
export function buildOverpassQuery(bbox: BoundingBox): string {
  const { south, west, north, east } = bbox;
  const bboxStr = `${south.toFixed(6)},${west.toFixed(6)},${north.toFixed(6)},${east.toFixed(6)}`;

  return `
[out:json][timeout:25];
(
  // 水域 (Water)
  way["waterway"](${bboxStr});
  way["natural"="water"](${bboxStr});
  relation["natural"="water"](${bboxStr});
  
  // 緑地 (Greenery)
  way["leisure"="park"](${bboxStr});
  way["leisure"="garden"](${bboxStr});
  way["natural"="wood"](${bboxStr});
  way["landuse"="grass"](${bboxStr});
  way["landuse"="forest"](${bboxStr});

  // 建物 (Buildings)
  way["building"](${bboxStr});

  // 主要道路 (Major Highways)
  way["highway"~"^(motorway|trunk|primary|secondary|motorway_link|trunk_link|primary_link|secondary_link)$"](${bboxStr});

  // 一般道路 (Minor Highways)
  way["highway"~"^(tertiary|residential|unclassified|living_street|pedestrian|service)$"](${bboxStr});

  // 鉄道 (Railways)
  way["railway"~"^(rail|subway|light_rail|tram)$"](${bboxStr});

  // 駅 (Stations)
  node["railway"~"^(station|halt)"](${bboxStr});
  node["public_transport"="station"](${bboxStr});
);
out body;
>;
out skel qt;
`.trim();
}

/**
 * Overpass API JSON データをレイヤー別にパース
 */
export interface ParsedGeoData {
  waterPolygons: [number, number][][];
  waterLines: [number, number][][];
  greeneryPolygons: [number, number][][];
  buildingPolygons: [number, number][][];
  roadsMajor: [number, number][][];
  roadsMinor: [number, number][][];
  railways: [number, number][][];
  stations: { name: string; nameEn?: string; lat: number; lng: number; isMetro?: boolean }[];
  labels: { text: string; lat: number; lng: number; type: string }[];
}

export function parseOverpassData(osmJson: any): ParsedGeoData {
  const nodesMap = new Map<number, [number, number]>();
  const data: ParsedGeoData = {
    waterPolygons: [],
    waterLines: [],
    greeneryPolygons: [],
    buildingPolygons: [],
    roadsMajor: [],
    roadsMinor: [],
    railways: [],
    stations: [],
    labels: [],
  };

  if (!osmJson || !Array.isArray(osmJson.elements)) {
    return data;
  }

  osmJson.elements.forEach((el: any) => {
    if (el.type === 'node' && typeof el.lat === 'number' && typeof el.lon === 'number') {
      nodesMap.set(el.id, [el.lon, el.lat]);
    }
  });

  osmJson.elements.forEach((el: any) => {
    if (el.type === 'node') {
      if (el.tags && (el.tags.railway === 'station' || el.tags.railway === 'halt' || el.tags.public_transport === 'station')) {
        const name = el.tags.name || el.tags['name:ja'] || el.tags['name:en'] || '';
        if (name) {
          data.stations.push({
            name,
            nameEn: el.tags['name:en'],
            lat: el.lat,
            lng: el.lon,
            isMetro: el.tags.subway === 'yes' || el.tags.operator?.includes('Osaka Metro'),
          });
        }
      }
    } else if (el.type === 'way' && Array.isArray(el.nodes) && el.nodes.length >= 2) {
      const coords: [number, number][] = [];
      el.nodes.forEach((nodeId: number) => {
        const pt = nodesMap.get(nodeId);
        if (pt) coords.push(pt);
      });

      if (coords.length < 2) return;

      const tags = el.tags || {};
      const isClosed = el.nodes[0] === el.nodes[el.nodes.length - 1] && coords.length >= 4;

      if (tags.natural === 'water' || tags.water || tags.waterway === 'riverbank' || tags.landuse === 'basin') {
        if (isClosed) data.waterPolygons.push(coords);
        else data.waterLines.push(coords);
      } else if (tags.waterway) {
        data.waterLines.push(coords);
      } else if (
        tags.leisure === 'park' ||
        tags.leisure === 'garden' ||
        tags.natural === 'wood' ||
        tags.landuse === 'grass' ||
        tags.landuse === 'forest' ||
        tags.landuse === 'recreation_ground'
      ) {
        if (isClosed) data.greeneryPolygons.push(coords);
      } else if (tags.building) {
        if (isClosed) data.buildingPolygons.push(coords);
      } else if (tags.railway && tags.railway !== 'abandoned' && tags.railway !== 'razed') {
        data.railways.push(coords);
      } else if (
        ['motorway', 'trunk', 'primary', 'secondary', 'motorway_link', 'trunk_link', 'primary_link', 'secondary_link'].includes(
          tags.highway
        )
      ) {
        data.roadsMajor.push(coords);
      } else if (tags.highway) {
        data.roadsMinor.push(coords);
      }
    }
  });

  return data;
}

// ============================================================================
// 幾何学的クリッピングアルゴリズム (Geometric Clipping)
// 200×200mm (0..widthPt, 0..heightPt) の範囲外に伸びるベクターを完全にカット
// ============================================================================

interface ClipBounds {
  xmin: number;
  ymin: number;
  xmax: number;
  ymax: number;
}

const INSIDE = 0; // 0000
const LEFT = 1;   // 0001
const RIGHT = 2;  // 0010
const BOTTOM = 4; // 0100
const TOP = 8;    // 1000

function computeOutCode(x: number, y: number, bounds: ClipBounds): number {
  let code = INSIDE;
  if (x < bounds.xmin) code |= LEFT;
  else if (x > bounds.xmax) code |= RIGHT;
  if (y < bounds.ymin) code |= TOP;
  else if (y > bounds.ymax) code |= BOTTOM;
  return code;
}

/**
 * Cohen-Sutherland 線分クリッピング
 */
function clipSegment(
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  bounds: ClipBounds
): [number, number, number, number] | null {
  let code0 = computeOutCode(x0, y0, bounds);
  let code1 = computeOutCode(x1, y1, bounds);
  let accept = false;

  let curX0 = x0;
  let curY0 = y0;
  let curX1 = x1;
  let curY1 = y1;

  for (let iter = 0; iter < 10; iter++) {
    if ((code0 | code1) === 0) {
      accept = true;
      break;
    } else if ((code0 & code1) !== 0) {
      break; // 完全外側
    } else {
      let x = 0;
      let y = 0;
      const codeOut = code0 !== 0 ? code0 : code1;

      if (codeOut & BOTTOM) {
        x = curX0 + ((curX1 - curX0) * (bounds.ymax - curY0)) / (curY1 - curY0);
        y = bounds.ymax;
      } else if (codeOut & TOP) {
        x = curX0 + ((curX1 - curX0) * (bounds.ymin - curY0)) / (curY1 - curY0);
        y = bounds.ymin;
      } else if (codeOut & RIGHT) {
        y = curY0 + ((curY1 - curY0) * (bounds.xmax - curX0)) / (curX1 - curX0);
        x = bounds.xmax;
      } else if (codeOut & LEFT) {
        y = curY0 + ((curY1 - curY0) * (bounds.xmin - curX0)) / (curX1 - curX0);
        x = bounds.xmin;
      }

      if (codeOut === code0) {
        curX0 = x;
        curY0 = y;
        code0 = computeOutCode(curX0, curY0, bounds);
      } else {
        curX1 = x;
        curY1 = y;
        code1 = computeOutCode(curX1, curY1, bounds);
      }
    }
  }

  if (accept) {
    return [
      Math.round(curX0 * 100) / 100,
      Math.round(curY0 * 100) / 100,
      Math.round(curX1 * 100) / 100,
      Math.round(curY1 * 100) / 100,
    ];
  }
  return null;
}

/**
 * ポリラインクリッピング (境界外の線分をカットし、内部に残るセグメントのみ抽出)
 */
export function clipPolyline(pts: [number, number][], bounds: ClipBounds): [number, number][][] {
  if (pts.length < 2) return [];
  const result: [number, number][][] = [];
  let currentLine: [number, number][] = [];

  for (let i = 0; i < pts.length - 1; i++) {
    const clipped = clipSegment(pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], bounds);
    if (clipped) {
      const [cx0, cy0, cx1, cy1] = clipped;
      if (currentLine.length === 0) {
        currentLine.push([cx0, cy0], [cx1, cy1]);
      } else {
        const lastPt = currentLine[currentLine.length - 1];
        if (Math.abs(lastPt[0] - cx0) < 0.05 && Math.abs(lastPt[1] - cy0) < 0.05) {
          currentLine.push([cx1, cy1]);
        } else {
          if (currentLine.length >= 2) result.push(currentLine);
          currentLine = [[cx0, cy0], [cx1, cy1]];
        }
      }
    } else {
      if (currentLine.length >= 2) {
        result.push(currentLine);
      }
      currentLine = [];
    }
  }

  if (currentLine.length >= 2) {
    result.push(currentLine);
  }
  return result;
}

/**
 * Sutherland-Hodgman 多角形クリッピング (境界外のポリゴンを200×200枠でカット)
 */
export function clipPolygon(polygon: [number, number][], bounds: ClipBounds): [number, number][] {
  if (polygon.length < 3) return [];
  let outputList = polygon;

  const edges = [
    // Left edge
    {
      inside: (p: [number, number]) => p[0] >= bounds.xmin,
      intersect: (p1: [number, number], p2: [number, number]): [number, number] => [
        bounds.xmin,
        p1[1] + ((p2[1] - p1[1]) * (bounds.xmin - p1[0])) / (p2[0] - p1[0]),
      ],
    },
    // Right edge
    {
      inside: (p: [number, number]) => p[0] <= bounds.xmax,
      intersect: (p1: [number, number], p2: [number, number]): [number, number] => [
        bounds.xmax,
        p1[1] + ((p2[1] - p1[1]) * (bounds.xmax - p1[0])) / (p2[0] - p1[0]),
      ],
    },
    // Top edge
    {
      inside: (p: [number, number]) => p[1] >= bounds.ymin,
      intersect: (p1: [number, number], p2: [number, number]): [number, number] => [
        p1[0] + ((p2[0] - p1[0]) * (bounds.ymin - p1[1])) / (p2[1] - p1[1]),
        bounds.ymin,
      ],
    },
    // Bottom edge
    {
      inside: (p: [number, number]) => p[1] <= bounds.ymax,
      intersect: (p1: [number, number], p2: [number, number]): [number, number] => [
        p1[0] + ((p2[0] - p1[0]) * (bounds.ymax - p1[1])) / (p2[1] - p1[1]),
        bounds.ymax,
      ],
    },
  ];

  for (const edge of edges) {
    const inputList = outputList;
    outputList = [];
    if (inputList.length === 0) break;

    let s = inputList[inputList.length - 1];
    for (const e of inputList) {
      if (edge.inside(e)) {
        if (edge.inside(s)) {
          outputList.push(e);
        } else {
          outputList.push(edge.intersect(s, e));
          outputList.push(e);
        }
      } else if (edge.inside(s)) {
        outputList.push(edge.intersect(s, e));
      }
      s = e;
    }
  }

  if (outputList.length < 3) return [];
  return outputList.map(([x, y]) => [Math.round(x * 100) / 100, Math.round(y * 100) / 100]);
}

/**
 * 座標列からクリッピング済みのポリゴンパス文字列(d)を生成
 */
function coordsToPolygonPathD(
  coords: [number, number][],
  projector: MercatorProjector,
  bounds: ClipBounds
): string {
  if (coords.length < 3) return '';
  const rawPts: [number, number][] = coords.map(([lng, lat]) => projector.toCanvasPoint(lat, lng));
  const clippedPts = clipPolygon(rawPts, bounds);
  if (clippedPts.length < 3) return '';

  let d = `M ${clippedPts[0][0]} ${clippedPts[0][1]}`;
  for (let i = 1; i < clippedPts.length; i++) {
    d += ` L ${clippedPts[i][0]} ${clippedPts[i][1]}`;
  }
  d += ' Z';
  return d;
}

/**
 * 座標列からクリッピング済みのポリラインパス文字列リスト(d[])を生成
 */
function coordsToPolylinePathDs(
  coords: [number, number][],
  projector: MercatorProjector,
  bounds: ClipBounds
): string[] {
  if (coords.length < 2) return [];
  const rawPts: [number, number][] = coords.map(([lng, lat]) => projector.toCanvasPoint(lat, lng));
  const clippedLines = clipPolyline(rawPts, bounds);

  return clippedLines
    .filter((line) => line.length >= 2)
    .map((line) => {
      let d = `M ${line[0][0]} ${line[0][1]}`;
      for (let i = 1; i < line.length; i++) {
        d += ` L ${line[i][0]} ${line[i][1]}`;
      }
      return d;
    });
}

/**
 * Adobe Illustrator 互換のレイヤー構造化SVGを生成 (200×200mm完全カット仕様)
 */
export function generateIllustratorSvg(
  options: MapExportOptions,
  geoData: ParsedGeoData
): string {
  const paper = PAPER_SIZES[options.paperSizeId] || PAPER_SIZES['square'];
  const theme = STYLE_PRESETS[options.stylePresetId] || STYLE_PRESETS['minimal-gray'];
  const { widthPt, heightPt, widthMm, heightMm } = paper;

  const aspectRatio = widthPt / heightPt;
  const bbox = calculateBbox(options.centerLat, options.centerLng, options.radiusKm, aspectRatio);
  
  // マップ領域を200×200mm (0..widthPt, 0..heightPt) 全体にフィット
  const projector = new MercatorProjector(bbox, widthPt, heightPt, 0);

  // 厳密なクリッピング境界 (0..widthPt, 0..heightPt)
  const clipBounds: ClipBounds = {
    xmin: 0,
    ymin: 0,
    xmax: widthPt,
    ymax: heightPt,
  };

  const svgParts: string[] = [];

  svgParts.push(`<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg
  xmlns="http://www.w3.org/2000/svg"
  xmlns:xlink="http://www.w3.org/1999/xlink"
  xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape"
  xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd"
  version="1.1"
  width="${widthMm}mm"
  height="${heightMm}mm"
  viewBox="0 0 ${widthPt} ${heightPt}"
  overflow="hidden"
  style="overflow: hidden;"
  xml:space="preserve"
>
  <defs>
    <style type="text/css"><![CDATA[
      text { font-family: "Hiragino Sans", "Hiragino Kaku Gothic ProN", "Yu Gothic", "Meiryo", sans-serif; }
      .layer-label { font-family: "Hiragino Sans", "Hiragino Kaku Gothic ProN", "Yu Gothic", "Meiryo", sans-serif; }
      .bold-text { font-weight: bold; }
      .stroke-round { stroke-linecap: round; stroke-linejoin: round; }
    ]]></style>
    <!-- 200x200mm アートボード クリッピングマスク -->
    <clipPath id="map-artboard-clip">
      <rect x="0" y="0" width="${widthPt}" height="${heightPt}" />
    </clipPath>
  </defs>
`);

  // レイヤー1: 背景 (Background)
  if (options.layers.background) {
    svgParts.push(`  <!-- ========================================== -->
  <!-- LAYER 01: 背景 (用紙色) -->
  <!-- ========================================== -->
  <g id="01_背景" inkscape:label="01_背景" inkscape:groupmode="layer" data-name="01_背景" clip-path="url(#map-artboard-clip)">
    <rect x="0" y="0" width="${widthPt}" height="${heightPt}" fill="${theme.bg}" />
  </g>
`);
  }

  // レイヤー2: 水域・河川 (Water)
  if (options.layers.water) {
    const polyPaths: string[] = [];
    geoData.waterPolygons.forEach((poly) => {
      const d = coordsToPolygonPathD(poly, projector, clipBounds);
      if (d) polyPaths.push(d);
    });

    const linePaths: string[] = [];
    geoData.waterLines.forEach((line) => {
      const ds = coordsToPolylinePathDs(line, projector, clipBounds);
      linePaths.push(...ds);
    });

    if (polyPaths.length > 0 || linePaths.length > 0) {
      svgParts.push(`  <!-- ========================================== -->
  <!-- LAYER 02: 水域・河川・海 -->
  <!-- ========================================== -->
  <g id="02_水域_河川" inkscape:label="02_水域・河川" inkscape:groupmode="layer" data-name="02_水域・河川" clip-path="url(#map-artboard-clip)">
    ${polyPaths.map((d) => `<path d="${d}" fill="${theme.waterFill}" stroke="${theme.waterStroke}" stroke-width="0.8" class="stroke-round" />`).join('\n    ')}
    ${linePaths.map((d) => `<path d="${d}" fill="none" stroke="${theme.waterFill === 'none' ? theme.waterStroke : theme.waterFill}" stroke-width="3" class="stroke-round" />`).join('\n    ')}
  </g>
`);
    }
  }

  // レイヤー3: 公園・緑地 (Greenery)
  if (options.layers.greenery) {
    const greenPaths: string[] = [];
    geoData.greeneryPolygons.forEach((poly) => {
      const d = coordsToPolygonPathD(poly, projector, clipBounds);
      if (d) greenPaths.push(d);
    });

    if (greenPaths.length > 0) {
      svgParts.push(`  <!-- ========================================== -->
  <!-- LAYER 03: 公園・緑地 -->
  <!-- ========================================== -->
  <g id="03_公園_緑地" inkscape:label="03_公園・緑地" inkscape:groupmode="layer" data-name="03_公園・緑地" clip-path="url(#map-artboard-clip)">
    ${greenPaths.map((d) => `<path d="${d}" fill="${theme.greeneryFill}" stroke="${theme.greeneryStroke}" stroke-width="0.8" class="stroke-round" />`).join('\n    ')}
  </g>
`);
    }
  }

  // レイヤー4: 建物フットプリント (Buildings)
  if (options.layers.buildings && geoData.buildingPolygons.length > 0) {
    const bldgPaths: string[] = [];
    geoData.buildingPolygons.forEach((poly) => {
      const d = coordsToPolygonPathD(poly, projector, clipBounds);
      if (d) bldgPaths.push(d);
    });

    if (bldgPaths.length > 0) {
      svgParts.push(`  <!-- ========================================== -->
  <!-- LAYER 04: 建物フットプリント -->
  <!-- ========================================== -->
  <g id="04_建物" inkscape:label="04_建物" inkscape:groupmode="layer" data-name="04_建物" clip-path="url(#map-artboard-clip)">
    ${bldgPaths.map((d) => `<path d="${d}" fill="${theme.buildingFill}" stroke="${theme.buildingStroke}" stroke-width="0.5" class="stroke-round" />`).join('\n    ')}
  </g>
`);
    }
  }

  // レイヤー5: 一般道路 (Roads Minor)
  if (options.layers.roadsMinor && geoData.roadsMinor.length > 0) {
    const minorPaths: string[] = [];
    geoData.roadsMinor.forEach((line) => {
      const ds = coordsToPolylinePathDs(line, projector, clipBounds);
      minorPaths.push(...ds);
    });

    if (minorPaths.length > 0) {
      svgParts.push(`  <!-- ========================================== -->
  <!-- LAYER 05: 一般道路・街路 -->
  <!-- ========================================== -->
  <g id="05_一般道路" inkscape:label="05_一般道路" inkscape:groupmode="layer" data-name="05_一般道路" clip-path="url(#map-artboard-clip)">
    <g id="05_一般道路_縁取り" stroke="#cbd5e1" stroke-width="${theme.roadMinorWidth + 1}" fill="none" class="stroke-round">
      ${minorPaths.map((d) => `<path d="${d}" />`).join('\n      ')}
    </g>
    <g id="05_一般道路_ライン" stroke="${theme.roadMinorStroke}" stroke-width="${theme.roadMinorWidth}" fill="none" class="stroke-round">
      ${minorPaths.map((d) => `<path d="${d}" />`).join('\n      ')}
    </g>
  </g>
`);
    }
  }

  // レイヤー6: 主要道路 (Roads Major)
  if (options.layers.roadsMajor && geoData.roadsMajor.length > 0) {
    const majorPaths: string[] = [];
    geoData.roadsMajor.forEach((line) => {
      const ds = coordsToPolylinePathDs(line, projector, clipBounds);
      majorPaths.push(...ds);
    });

    if (majorPaths.length > 0) {
      svgParts.push(`  <!-- ========================================== -->
  <!-- LAYER 06: 主要道路・幹線道路 -->
  <!-- ========================================== -->
  <g id="06_主要道路" inkscape:label="06_主要道路" inkscape:groupmode="layer" data-name="06_主要道路" clip-path="url(#map-artboard-clip)">
    <g id="06_主要道路_縁取り" stroke="#94a3b8" stroke-width="${theme.roadMajorWidth + 1.5}" fill="none" class="stroke-round">
      ${majorPaths.map((d) => `<path d="${d}" />`).join('\n      ')}
    </g>
    <g id="06_主要道路_ライン" stroke="${theme.roadMajorStroke}" stroke-width="${theme.roadMajorWidth}" fill="none" class="stroke-round">
      ${majorPaths.map((d) => `<path d="${d}" />`).join('\n      ')}
    </g>
  </g>
`);
    }
  }

  // レイヤー7: 一般鉄道 (Railways)
  if (options.layers.railways && geoData.railways.length > 0) {
    const railPaths: string[] = [];
    geoData.railways.forEach((line) => {
      const ds = coordsToPolylinePathDs(line, projector, clipBounds);
      railPaths.push(...ds);
    });

    if (railPaths.length > 0) {
      svgParts.push(`  <!-- ========================================== -->
  <!-- LAYER 07: 鉄道線路 -->
  <!-- ========================================== -->
  <g id="07_鉄道線路" inkscape:label="07_鉄道線路" inkscape:groupmode="layer" data-name="07_鉄道線路" clip-path="url(#map-artboard-clip)">
    <g id="07_線路下地" stroke="${theme.railwayStroke}" stroke-width="${theme.railwayWidth}" fill="none" class="stroke-round">
      ${railPaths.map((d) => `<path d="${d}" />`).join('\n      ')}
    </g>
    <g id="07_線路枕木" stroke="#ffffff" stroke-width="${Math.max(theme.railwayWidth - 0.6, 1)}" stroke-dasharray="4 4" fill="none">
      ${railPaths.map((d) => `<path d="${d}" />`).join('\n      ')}
    </g>
  </g>
`);
    }
  }

  // レイヤー8: Osaka Metro・地域路線（ローカル高精度データ連携）
  if (options.layers.metroLines) {
    const metroFeatures = (OSAKA_TRANSIT_LINES?.features || []) as any[];
    const metroSvgLines: string[] = [];

    metroFeatures.forEach((feat) => {
      if (!feat.geometry || !feat.geometry.coordinates) return;
      const coords = feat.geometry.coordinates as [number, number][];
      const color = feat.properties?.color || theme.railwayStroke;
      const width = feat.properties?.width ? feat.properties.width * 1.2 : 3.5;
      const name = feat.properties?.name || '路線';

      const ds = coordsToPolylinePathDs(coords, projector, clipBounds);
      ds.forEach((d) => {
        metroSvgLines.push(
          `      <path d="${d}" stroke="${color}" stroke-width="${width}" fill="none" data-name="${name}" class="stroke-round" />`
        );
      });
    });

    if (metroSvgLines.length > 0) {
      svgParts.push(`  <!-- ========================================== -->
  <!-- LAYER 08: 地下鉄・高速鉄道路線 (Osaka Metro公式カラー) -->
  <!-- ========================================== -->
  <g id="08_地下鉄路線" inkscape:label="08_地下鉄路線" inkscape:groupmode="layer" data-name="08_地下鉄路線" clip-path="url(#map-artboard-clip)">
    <g id="08_路線グロー" stroke="#ffffff" stroke-width="5" fill="none" opacity="0.9" class="stroke-round">
      ${metroSvgLines.map((line) => line.replace(/stroke="[^"]+"/, 'stroke="#ffffff"').replace(/stroke-width="[^"]+"/, 'stroke-width="5.5"')).join('\n')}
    </g>
    <g id="08_路線本体">
${metroSvgLines.join('\n')}
    </g>
  </g>
`);
    }
  }

  // レイヤー9: 鉄道駅 & 駅名 (Stations & Labels)
  if (options.layers.stations) {
    const localStations = (OSAKA_TRANSIT_STATIONS?.features || []) as any[];
    const allStations: { name: string; lat: number; lng: number; color?: string; isMajor?: boolean }[] = [];

    localStations.forEach((st) => {
      const [lng, lat] = st.geometry.coordinates;
      if (projector.isInside(lat, lng)) {
        allStations.push({
          name: st.properties.name,
          lat,
          lng,
          color: st.properties.color,
          isMajor: st.properties.isMajor,
        });
      }
    });

    geoData.stations.forEach((st) => {
      if (projector.isInside(st.lat, st.lng)) {
        const isDuplicate = allStations.some(
          (existing) =>
            existing.name === st.name ||
            (Math.abs(existing.lat - st.lat) < 0.0015 && Math.abs(existing.lng - st.lng) < 0.0015)
        );
        if (!isDuplicate) {
          allStations.push({
            name: st.name,
            lat: st.lat,
            lng: st.lng,
            color: '#E6007E',
            isMajor: true,
          });
        }
      }
    });

    const stationCircles: string[] = [];
    const stationTexts: string[] = [];

    allStations.forEach((st) => {
      const [x, y] = projector.toCanvasPoint(st.lat, st.lng);
      // 200x200mm 内に収まっているもののみ描画
      if (x < 0 || x > widthPt || y < 0 || y > heightPt) return;

      const strokeCol = st.color || theme.stationCircleStroke;

      stationCircles.push(
        `      <circle cx="${x}" cy="${y}" r="4.5" fill="${theme.stationCircleFill}" stroke="${strokeCol}" stroke-width="2.2" />`
      );

      stationTexts.push(
        `      <text x="${x}" y="${y + 13}" fill="${theme.stationTextColor}" font-size="9" font-weight="bold" text-anchor="middle" class="layer-label">${escapeXml(st.name)}</text>`
      );
    });

    if (stationCircles.length > 0 || stationTexts.length > 0) {
      svgParts.push(`  <!-- ========================================== -->
  <!-- LAYER 09: 駅シンボル＆駅名ラベル -->
  <!-- ========================================== -->
  <g id="09_駅_駅名" inkscape:label="09_駅・駅名" inkscape:groupmode="layer" data-name="09_駅・駅名" clip-path="url(#map-artboard-clip)">
    <g id="09_駅シンボル">
${stationCircles.join('\n')}
    </g>
    <g id="09_駅名テキスト">
${stationTexts.join('\n')}
    </g>
  </g>
`);
    }
  }

  // レイヤー10: フェスティバル会場 (Venues)
  if (options.layers.venues && options.venues.length > 0) {
    const venuePins: string[] = [];
    const venueLabels: string[] = [];

    options.venues.forEach((v) => {
      const lat = Number(v.location.lat);
      const lng = Number(v.location.lng);
      if (isNaN(lat) || isNaN(lng)) return;

      if (projector.isInside(lat, lng)) {
        const [x, y] = projector.toCanvasPoint(lat, lng);
        if (x < 0 || x > widthPt || y < 0 || y > heightPt) return;

        const name = v.name;

        venuePins.push(`      <!-- 会場ピン: ${escapeXml(name)} -->
      <g transform="translate(${x}, ${y})">
        <path d="M 0,0 L -9,-18 A 12 12 0 1 1 9,-18 Z" fill="${theme.venuePinColor}" stroke="#ffffff" stroke-width="2" />
        <circle cx="0" cy="-18" r="4.5" fill="#ffffff" />
      </g>`);

        venueLabels.push(`      <!-- 会場名ラベル: ${escapeXml(name)} -->
      <g transform="translate(${x}, ${y - 30})">
        <rect x="-${Math.max(name.length * 4.5, 30)}" y="-10" width="${Math.max(name.length * 9, 60)}" height="16" rx="8" fill="#ffffff" stroke="${theme.venuePinColor}" stroke-width="1.2" opacity="0.95" />
        <text x="0" y="2" fill="${theme.venueTextColor}" font-size="9" font-weight="900" text-anchor="middle" class="layer-label">${escapeXml(name)}</text>
      </g>`);
      }
    });

    if (venuePins.length > 0) {
      svgParts.push(`  <!-- ========================================== -->
  <!-- LAYER 10: 大阪フリンジ 会場ピン＆名称 -->
  <!-- ========================================== -->
  <g id="10_会場ピン_名称" inkscape:label="10_会場ピン・名称" inkscape:groupmode="layer" data-name="10_会場ピン・名称" clip-path="url(#map-artboard-clip)">
    <g id="10_会場ピン本体">
${venuePins.join('\n')}
    </g>
    <g id="10_会場ラベル">
${venueLabels.join('\n')}
    </g>
  </g>
`);
    }
  }

  // レイヤー11: 縮尺バー・方角・枠線・マップ情報 (Scale & Grid)
  if (options.layers.gridScale) {
    const kmDistance = options.radiusKm < 1 ? 0.2 : options.radiusKm < 2 ? 0.5 : 1.0;
    const kmLabel = kmDistance < 1 ? `${kmDistance * 1000} m` : `${kmDistance} km`;
    const pt1 = projector.toCanvasPoint(options.centerLat, options.centerLng);
    const pt2 = projector.toCanvasPoint(
      options.centerLat,
      options.centerLng + kmDistance / (111.32 * Math.cos((options.centerLat * Math.PI) / 180))
    );
    const scaleBarPx = Math.abs(pt2[0] - pt1[0]);

    const scaleX = 20;
    const scaleY = heightPt - 24;

    const northX = widthPt - 28;
    const northY = 32;

    svgParts.push(`  <!-- ========================================== -->
  <!-- LAYER 12: 縮尺バー・方位記号・マップ情報 -->
  <!-- ========================================== -->
  <g id="12_縮尺_方角_情報" inkscape:label="12_縮尺・方角・情報" inkscape:groupmode="layer" data-name="12_縮尺・方角・情報" clip-path="url(#map-artboard-clip)">
    <!-- 200x200mm 外枠線 -->
    <rect x="0" y="0" width="${widthPt}" height="${heightPt}" fill="none" stroke="${theme.scaleColor}" stroke-width="1.5" />

    <!-- 縮尺スケールバー -->
    <g transform="translate(${scaleX}, ${scaleY})" id="12_縮尺スケールバー">
      <rect x="-6" y="-14" width="${scaleBarPx + 12}" height="24" rx="4" fill="#ffffff" stroke="${theme.gridColor}" stroke-width="1" opacity="0.9" />
      <line x1="0" y1="0" x2="${scaleBarPx}" y2="0" stroke="${theme.scaleColor}" stroke-width="2.5" />
      <line x1="0" y1="-4" x2="0" y2="4" stroke="${theme.scaleColor}" stroke-width="2.5" />
      <line x1="${scaleBarPx}" y1="-4" x2="${scaleBarPx}" y2="4" stroke="${theme.scaleColor}" stroke-width="2.5" />
      <text x="${scaleBarPx / 2}" y="-4" fill="${theme.scaleColor}" font-size="8" font-weight="bold" text-anchor="middle" class="layer-label">${kmLabel}</text>
    </g>

    <!-- 北方位記号 (North Arrow) -->
    <g transform="translate(${northX}, ${northY})" id="12_方位記号">
      <circle cx="0" cy="0" r="14" fill="#ffffff" stroke="${theme.scaleColor}" stroke-width="1.2" opacity="0.9" />
      <path d="M 0,-10 L 4,5 L 0,2 L -4,5 Z" fill="${theme.scaleColor}" />
      <text x="0" y="-12" fill="${theme.scaleColor}" font-size="7.5" font-weight="900" text-anchor="middle" class="layer-label">N</text>
    </g>

    <!-- マップクレジット / 座標情報 -->
    <g transform="translate(18, 22)" id="12_マップ情報">
      <text x="0" y="0" fill="${theme.scaleColor}" font-size="8" font-weight="800" class="layer-label">OSAKA FRINGE FESTIVAL MAP (200x200mm)</text>
      <text x="0" y="10" fill="#64748b" font-size="7" font-weight="normal" class="layer-label">CENTER: ${options.centerLat.toFixed(5)}°N, ${options.centerLng.toFixed(5)}°E | RADIUS: ${options.radiusKm}km | © OpenStreetMap</text>
    </g>
  </g>
`);
  }

  svgParts.push('</svg>');
  return svgParts.join('\n');
}

function escapeXml(unsafe: string): string {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
