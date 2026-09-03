const fs = require('fs');

console.log('Loading N02 datasets...');
const linesRaw = JSON.parse(fs.readFileSync('scratch/n02/UTF-8/N02-23_RailroadSection.geojson', 'utf8'));
const stationsRaw = JSON.parse(fs.readFileSync('scratch/n02/UTF-8/N02-23_Station.geojson', 'utf8'));

// Bounding box for Greater Osaka Area
const BBOX = {
  minLng: 135.32,
  maxLng: 135.65,
  minLat: 34.56,
  maxLat: 34.82,
};

function inBBox(lng, lat) {
  return lng >= BBOX.minLng && lng <= BBOX.maxLng && lat >= BBOX.minLat && lat <= BBOX.maxLat;
}

function roundCoord(c) {
  return [Math.round(c[0] * 100000) / 100000, Math.round(c[1] * 100000) / 100000];
}

// Osaka Metro official 9 lines
const METRO_MAP = {
  '1号線(御堂筋線)': { name: '御堂筋線', symbol: 'M', color: '#E5171F', width: 4.0 },
  '2号線(谷町線)': { name: '谷町線', symbol: 'T', color: '#522886', width: 3.5 },
  '3号線(四つ橋線)': { name: '四つ橋線', symbol: 'Y', color: '#0078BA', width: 3.5 },
  '4号線(中央線)': { name: '中央線', symbol: 'C', color: '#019A66', width: 3.5 },
  '5号線(千日前線)': { name: '千日前線', symbol: 'S', color: '#E44D93', width: 3.0 },
  '6号線(堺筋線)': { name: '堺筋線', symbol: 'K', color: '#814721', width: 3.0 },
  '7号線(長堀鶴見緑地線)': { name: '長堀鶴見緑地線', symbol: 'N', color: '#A9CC51', width: 3.0 },
  '8号線(今里筋線)': { name: '今里筋線', symbol: 'I', color: '#EE7B1A', width: 3.0 },
  '南港ポートタウン線': { name: 'ニュートラム', symbol: 'P', color: '#00A0DE', width: 3.0 },
};

// Major stations to show at lower zoom (terminals & festival hubs)
const MAJOR_STATIONS = new Set([
  '大阪', '梅田', '東梅田', '西梅田', '大阪梅田',
  '中崎町', '天満', '扇町', '中之島', '福島', '新福島',
  '淀屋橋', '肥後橋', '北浜', '本町', '堺筋本町', '阿波座',
  '心斎橋', '四ツ橋', 'なんば', '難波', '大阪難波', '日本橋', '近鉄日本橋',
  '新今宮', '動物園前', '天王寺', '大阪阿部野橋',
  '京橋', '天満橋', '森ノ宮', '谷町四丁目', '谷町九丁目', '鶴橋',
  '弁天町', '大正', '新大阪', '西中島南方', '十三', 'コスモスクエア', '野田', '野田阪神',
  'ユニバーサルシティ', '桜島'
]);

// 1. Process Lines
const outLines = [];

linesRaw.features.forEach(f => {
  const op = f.properties.N02_004 || '';
  const rawLine = f.properties.N02_003 || '';
  
  let matchInfo = null;

  if (op.includes('大阪市高速電気軌道')) {
    if (METRO_MAP[rawLine]) {
      matchInfo = {
        name: METRO_MAP[rawLine].name,
        symbol: METRO_MAP[rawLine].symbol,
        operator: 'Osaka Metro',
        color: METRO_MAP[rawLine].color,
        width: METRO_MAP[rawLine].width,
        isMetro: true,
      };
    }
  } else if (op.includes('北大阪急行電鉄')) {
    matchInfo = {
      name: '北大阪急行(御堂筋線直通)',
      symbol: 'M',
      operator: '北大阪急行',
      color: '#E5171F',
      width: 3.5,
      isMetro: true,
    };
  } else if (op.includes('西日本旅客鉄道')) {
    // JR line: 濃いめのグレー #333333
    // 大阪環状線, 桜島線(JRゆめ咲線), JR東西線, おおさか東線, 東海道線, 阪和線, 関西線など全て
    matchInfo = {
      name: rawLine,
      symbol: 'JR',
      operator: 'JR West',
      color: '#333333',
      width: 2.8,
      isMetro: false,
    };
  } else if (
    op.includes('阪急電鉄') ||
    op.includes('阪神電気鉄道') ||
    op.includes('京阪電気鉄道') ||
    op.includes('近畿日本鉄道') ||
    op.includes('南海電気鉄道') ||
    op.includes('大阪モノレール') ||
    op.includes('阪堺電気軌道')
  ) {
    // 私鉄各線: 薄めのグレー #666666, 細いライン width 1.8
    matchInfo = {
      name: `${op.slice(0, 2)}${rawLine}`,
      symbol: op.slice(0, 2),
      operator: op,
      color: '#666666',
      width: 1.8,
      isMetro: false,
    };
  }

  if (!matchInfo) return;

  const coords = f.geometry.coordinates;
  const filteredCoords = [];

  for (let i = 0; i < coords.length; i++) {
    const pt = coords[i];
    if (inBBox(pt[0], pt[1])) {
      filteredCoords.push(roundCoord(pt));
    }
  }

  if (filteredCoords.length >= 2) {
    outLines.push({
      type: 'Feature',
      properties: matchInfo,
      geometry: {
        type: 'LineString',
        coordinates: filteredCoords,
      },
    });
  }
});

console.log('Extracted lines features count:', outLines.length);

// 2. Process Stations - 全駅網羅
const stationGroups = new Map();

stationsRaw.features.forEach(f => {
  const op = f.properties.N02_004 || '';
  const rawLine = f.properties.N02_003 || '';
  const stationName = f.properties.N02_005 || '';
  if (!stationName) return;

  let symbol = '私鉄';
  let color = '#666666';
  let operator = op;
  let isTarget = false;

  if (op.includes('大阪市高速電気軌道')) {
    if (METRO_MAP[rawLine]) {
      symbol = METRO_MAP[rawLine].symbol;
      color = METRO_MAP[rawLine].color;
      operator = 'Osaka Metro';
      isTarget = true;
    }
  } else if (op.includes('北大阪急行電鉄')) {
    symbol = 'M';
    color = '#E5171F';
    operator = '北大阪急行';
    isTarget = true;
  } else if (op.includes('西日本旅客鉄道')) {
    // 桜島線を含むすべてのJR
    symbol = 'JR';
    color = '#333333';
    operator = 'JR West';
    isTarget = true;
  } else if (
    op.includes('阪急電鉄') ||
    op.includes('阪神電気鉄道') ||
    op.includes('京阪電気鉄道') ||
    op.includes('近畿日本鉄道') ||
    op.includes('南海電気鉄道') ||
    op.includes('大阪モノレール') ||
    op.includes('阪堺電気軌道')
  ) {
    symbol = op.slice(0, 2);
    color = '#666666';
    operator = op;
    isTarget = true;
  }

  if (!isTarget) return;

  const coords = f.geometry.coordinates;
  if (!coords || coords.length < 2) return;

  let sumLng = 0, sumLat = 0, validCount = 0;
  coords.forEach(pt => {
    if (inBBox(pt[0], pt[1])) {
      sumLng += pt[0];
      sumLat += pt[1];
      validCount++;
    }
  });

  if (validCount === 0) return;
  const centerLng = sumLng / validCount;
  const centerLat = sumLat / validCount;

  // Deduplicate by Station Name & Symbol
  const key = `${stationName}_${symbol}`;
  if (!stationGroups.has(key)) {
    const isMajor = MAJOR_STATIONS.has(stationName);
    stationGroups.set(key, {
      name: stationName,
      symbol: symbol,
      color: color,
      operator: operator,
      isMajor: isMajor,
      coordinates: roundCoord([centerLng, centerLat]),
    });
  }
});

const outStations = Array.from(stationGroups.values()).map(s => ({
  type: 'Feature',
  properties: {
    name: s.name,
    symbol: s.symbol,
    color: s.color,
    operator: s.operator,
    isMajor: s.isMajor,
  },
  geometry: {
    type: 'Point',
    coordinates: s.coordinates,
  },
}));

console.log('Extracted unique stations count (All stations):', outStations.length);
console.log('Major stations count:', outStations.filter(s => s.properties.isMajor).length);

const metroLinesInfo = [
  { symbol: 'M', name: '御堂筋線', nameEn: 'Midosuji Line', color: '#E5171F' },
  { symbol: 'T', name: '谷町線', nameEn: 'Tanimachi Line', color: '#522886' },
  { symbol: 'Y', name: '四つ橋線', nameEn: 'Yotsubashi Line', color: '#0078BA' },
  { symbol: 'C', name: '中央線', nameEn: 'Chuo Line', color: '#019A66' },
  { symbol: 'S', name: '千日前線', nameEn: 'Sennichimae Line', color: '#E44D93' },
  { symbol: 'K', name: '堺筋線', nameEn: 'Sakaisuji Line', color: '#814721' },
  { symbol: 'N', name: '長堀鶴見緑地線', nameEn: 'Nagahori Tsurumi-ryokuchi Line', color: '#A9CC51' },
  { symbol: 'I', name: '今里筋線', nameEn: 'Imazatosuji Line', color: '#EE7B1A' },
  { symbol: 'P', name: 'ニュートラム', nameEn: 'New Tram', color: '#00A0DE' },
];

const tsContent = `/**
 * 国土交通省「国土数値情報 鉄道データ（N02）」に基づく高精度鉄道路線＆全駅 GeoJSON
 * - Osaka Metro 9路線（公式カラー・太線）
 * - JR西日本（桜島線等含む全線：#333333 濃いグレー）
 * - 私鉄各社（阪急・阪神・京阪・近鉄・南海・モノレール等：#666666 薄いグレー・細線）
 * 出典：国土交通省 国土数値情報（鉄道時系列データ N02-23）
 */

export const METRO_LINES_INFO = ${JSON.stringify(metroLinesInfo, null, 2)};

export const OSAKA_TRANSIT_LINES: any = {
  type: 'FeatureCollection',
  features: ${JSON.stringify(outLines)},
};

export const OSAKA_TRANSIT_STATIONS: any = {
  type: 'FeatureCollection',
  features: ${JSON.stringify(outStations)},
};
`;

fs.writeFileSync('src/data/transitData.ts', tsContent);
console.log('Updated src/data/transitData.ts successfully, total size:', tsContent.length);
