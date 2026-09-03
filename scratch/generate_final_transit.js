const fs = require('fs');

async function updateTransitData() {
  const linesRaw = JSON.parse(fs.readFileSync('scratch/n02/UTF-8/N02-23_RailroadSection.geojson', 'utf8'));
  const stationsRaw = JSON.parse(fs.readFileSync('scratch/n02/UTF-8/N02-23_Station.geojson', 'utf8'));

  const BBOX = {
    minLng: 135.20,
    maxLng: 135.70,
    minLat: 34.40,
    maxLat: 34.86,
  };

  function inBBox(lng, lat) {
    return lng >= BBOX.minLng && lng <= BBOX.maxLng && lat >= BBOX.minLat && lat <= BBOX.maxLat;
  }

  function roundCoord(c) {
    return [Math.round(c[0] * 100000) / 100000, Math.round(c[1] * 100000) / 100000];
  }

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

  const MAJOR_STATIONS = new Set([
    '大阪', '梅田', '東梅田', '西梅田', '大阪梅田',
    '中崎町', '天満', '扇町', '中之島', '福島', '新福島',
    '淀屋橋', '肥後橋', '北浜', '本町', '堺筋本町', '阿波座',
    '心斎橋', '四ツ橋', 'なんば', '難波', '大阪難波', '日本橋', '近鉄日本橋',
    '新今宮', '動物園前', '天王寺', '大阪阿部野橋',
    '京橋', '天満橋', '森ノ宮', '谷町四丁目', '谷町九丁目', '鶴橋',
    '弁天町', '大正', '新大阪', '西中島南方', '十三', 'コスモスクエア', '野田', '野田阪神',
    'ユニバーサルシティ', '桜島',
    'なかもず', '中百舌鳥', '堺東', '堺', '三国ヶ丘',
    '箕面萱野', '河内長野', '関西空港', 'りんくうタウン', '宝塚', '伊丹', '川西池田'
  ]);

  const outLines = [];

  // 北大阪急行 延伸区間 (千里中央〜箕面船場阪大前〜箕面萱野) 手動追加
  outLines.push({
    type: 'Feature',
    properties: {
      name: '北大阪急行(御堂筋線直通)',
      symbol: 'M',
      operator: '北大阪急行',
      color: '#E5171F',
      width: 4.0,
      isMetro: true,
    },
    geometry: {
      type: 'LineString',
      coordinates: [
        [135.49515, 34.81122],
        [135.49420, 34.81300],
        [135.49120, 34.81600],
        [135.48860, 34.81920], // 箕面船場阪大前
        [135.48860, 34.82500],
        [135.48920, 34.83000],
        [135.48970, 34.83400], // 箕面萱野
      ],
    },
  });

  linesRaw.features.forEach(f => {
    const op = f.properties.N02_004 || '';
    const rawLine = f.properties.N02_003 || '';
    
    // 新幹線は除外
    if (rawLine.includes('新幹線') || op.includes('東海旅客鉄道') || op.includes('新幹線')) {
      return;
    }

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
        width: 4.0,
        isMetro: true,
      };
    } else if (op.includes('西日本旅客鉄道')) {
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
      op.includes('泉北高速鉄道') ||
      op.includes('大阪モノレール') ||
      op.includes('阪堺電気軌道')
    ) {
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

  // Stations
  const stationGroups = new Map();

  // 箕面萱野・箕面船場阪大前を手動登録
  stationGroups.set('箕面萱野_M', {
    name: '箕面萱野',
    symbol: 'M',
    color: '#E5171F',
    operator: '北大阪急行',
    isMajor: true,
    coordinates: [135.48970, 34.83400],
  });
  stationGroups.set('箕面船場阪大前_M', {
    name: '箕面船場阪大前',
    symbol: 'M',
    color: '#E5171F',
    operator: '北大阪急行',
    isMajor: false,
    coordinates: [135.48860, 34.81920],
  });

  stationsRaw.features.forEach(f => {
    const op = f.properties.N02_004 || '';
    const rawLine = f.properties.N02_003 || '';
    const stationName = f.properties.N02_005 || '';
    if (!stationName) return;

    // 新幹線駅は除外
    if (rawLine.includes('新幹線') || op.includes('東海旅客鉄道') || op.includes('新幹線')) {
      return;
    }

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
      op.includes('泉北高速鉄道') ||
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

  console.log('Total Line features:', outLines.length);
  console.log('Total Unique stations:', outStations.length);

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
 * - Osaka Metro 9路線（御堂筋線：箕面萱野〜なかもず 完全直通）
 * - 南海電鉄（難波〜中百舌鳥〜河内長野、南海本線・空港線 関西空港まで完全延伸）
 * - 近畿日本鉄道（南大阪線、長野線：古市〜富田林〜河内長野まで完全延伸）
 * - JR西日本（福知山線 宝塚まで接続、関西空港線 関西空港まで延伸、#333333 濃いグレー）
 * - 新幹線（山陽新幹線・東海道新幹線）は除外
 * - 私鉄各社（#666666 薄いグレー・細線）
 * 出典：国土交通省 国土数値情報（鉄道時系列データ N02-23）＋ 2024北急延伸データ
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
  console.log('Successfully wrote src/data/transitData.ts, size:', tsContent.length);
}

updateTransitData().catch(console.error);
