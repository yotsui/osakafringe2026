/**
 * 大阪の主要鉄道路線＆駅 GeoJSON データ
 * 地図上で公共交通機関での回遊を直感的に把握するための強調レイヤー
 */

export interface TransitLineFeature {
  type: 'Feature';
  properties: {
    name: string;
    operator: string;
    color: string;
    width?: number;
  };
  geometry: {
    type: 'LineString';
    coordinates: [number, number][]; // [lng, lat]
  };
}

export interface TransitStationFeature {
  type: 'Feature';
  properties: {
    name: string;
    nameEn: string;
    operator: string;
    lines: string;
    color: string;
  };
  geometry: {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat]
  };
}

// 鉄道路線データ
export const OSAKA_TRANSIT_LINES: {
  type: 'FeatureCollection';
  features: TransitLineFeature[];
} = {
  type: 'FeatureCollection',
  features: [
    // Osaka Metro 御堂筋線 (Midosuji Line - #E5171F)
    {
      type: 'Feature',
      properties: { name: '御堂筋線', operator: 'Osaka Metro', color: '#E5171F', width: 3.5 },
      geometry: {
        type: 'LineString',
        coordinates: [
          [135.5005, 34.7335], // 新大阪
          [135.4988, 34.7258], // 西中島南方
          [135.4970, 34.7107], // 中津
          [135.4983, 34.7024], // 梅田
          [135.5015, 34.6928], // 淀屋橋
          [135.5000, 34.6826], // 本町
          [135.5005, 34.6750], // 心斎橋
          [135.5005, 34.6667], // なんば
          [135.4980, 34.6560], // 大国町
          [135.5050, 34.6500], // 動物園前
          [135.5135, 34.6468], // 天王寺
          [135.5170, 34.6360], // 昭和町
          [135.5170, 34.6210], // 西田辺
          [135.5150, 34.6080], // 長居
          [135.5130, 34.5970], // あびこ
        ],
      },
    },

    // Osaka Metro 谷町線 (Tanimachi Line - #522886)
    {
      type: 'Feature',
      properties: { name: '谷町線', operator: 'Osaka Metro', color: '#522886', width: 3 },
      geometry: {
        type: 'LineString',
        coordinates: [
          [135.5300, 34.7200], // 都島
          [135.5113, 34.7107], // 天神橋筋六丁目
          [135.5032, 34.7065], // 中崎町
          [135.5015, 34.7008], // 東梅田
          [135.5110, 34.6975], // 南森町
          [135.5186, 34.6903], // 天満橋
          [135.5170, 34.6815], // 谷町四丁目
          [135.5165, 34.6740], // 谷町六丁目
          [135.5165, 34.6665], // 谷町九丁目
          [135.5155, 34.6565], // 四天王寺前夕陽ヶ丘
          [135.5140, 34.6468], // 天王寺
          [135.5180, 34.6380], // 阿倍野
          [135.5220, 34.6280], // 文の里
        ],
      },
    },

    // Osaka Metro 四つ橋線 (Yotsubashi Line - #0078BA)
    {
      type: 'Feature',
      properties: { name: '四つ橋線', operator: 'Osaka Metro', color: '#0078BA', width: 3 },
      geometry: {
        type: 'LineString',
        coordinates: [
          [135.4950, 34.6997], // 西梅田
          [135.4975, 34.6922], // 肥後橋
          [135.4965, 34.6826], // 本町
          [135.4975, 34.6745], // 四ツ橋
          [135.4975, 34.6655], // なんば
          [135.4980, 34.6560], // 大国町
          [135.4910, 34.6460], // 花園町
          [135.4850, 34.6350], // 岸里
          [135.4730, 34.6100], // 住之江公園
        ],
      },
    },

    // Osaka Metro 中央線 (Chuo Line - #019A66)
    {
      type: 'Feature',
      properties: { name: '中央線', operator: 'Osaka Metro', color: '#019A66', width: 3 },
      geometry: {
        type: 'LineString',
        coordinates: [
          [135.4150, 34.6530], // コスモスクエア
          [135.4320, 34.6530], // 大阪港
          [135.4620, 34.6690], // 弁天町
          [135.4820, 34.6815], // 阿波座
          [135.5000, 34.6826], // 本町
          [135.5070, 34.6820], // 堺筋本町
          [135.5170, 34.6815], // 谷町四丁目
          [135.5340, 34.6815], // 森ノ宮
          [135.5490, 34.6790], // 緑橋
          [135.5650, 34.6790], // 深江橋
        ],
      },
    },

    // Osaka Metro 堺筋線 (Sakaisuji Line - #814721)
    {
      type: 'Feature',
      properties: { name: '堺筋線', operator: 'Osaka Metro', color: '#814721', width: 3 },
      geometry: {
        type: 'LineString',
        coordinates: [
          [135.5113, 34.7107], // 天神橋筋六丁目
          [135.5110, 34.7045], // 扇町
          [135.5110, 34.6975], // 南森町
          [135.5065, 34.6917], // 北浜
          [135.5070, 34.6820], // 堺筋本町
          [135.5065, 34.6746], // 長堀橋
          [135.5065, 34.6670], // 日本橋
          [135.5060, 34.6550], // 恵美須町
          [135.5050, 34.6500], // 動物園前
          [135.4980, 34.6370], // 天下茶屋
        ],
      },
    },

    // Osaka Metro 長堀鶴見緑地線 (Nagahori Tsurumi-ryokuchi - #A9CC51)
    {
      type: 'Feature',
      properties: { name: '長堀鶴見緑地線', operator: 'Osaka Metro', color: '#8DBE3B', width: 3 },
      geometry: {
        type: 'LineString',
        coordinates: [
          [135.4795, 34.6655], // 大正
          [135.4800, 34.6700], // ドーム前千代崎
          [135.4880, 34.6745], // 西長堀
          [135.5005, 34.6750], // 心斎橋
          [135.5065, 34.6746], // 長堀橋
          [135.5120, 34.6743], // 松屋町
          [135.5165, 34.6740], // 谷町六丁目
          [135.5290, 34.6738], // 玉造
          [135.5340, 34.6815], // 森ノ宮
          [135.5330, 34.6970], // 京橋
        ],
      },
    },

    // Osaka Metro 千日前線 (Sennichimae Line - #E44D93)
    {
      type: 'Feature',
      properties: { name: '千日前線', operator: 'Osaka Metro', color: '#E44D93', width: 2.5 },
      geometry: {
        type: 'LineString',
        coordinates: [
          [135.4740, 34.6940], // 野田阪神
          [135.4820, 34.6815], // 阿波座
          [135.4880, 34.6745], // 西長堀
          [135.4930, 34.6675], // 桜川
          [135.5005, 34.6667], // なんば
          [135.5065, 34.6670], // 日本橋
          [135.5165, 34.6665], // 谷町九丁目
          [135.5300, 34.6660], // 鶴橋
        ],
      },
    },

    // JR 大阪環状線 (Osaka Loop Line - #E85219)
    {
      type: 'Feature',
      properties: { name: 'JR大阪環状線', operator: 'JR西日本', color: '#E85219', width: 3.8 },
      geometry: {
        type: 'LineString',
        coordinates: [
          [135.4959, 34.7024], // 大阪
          [135.4865, 34.6970], // 福島
          [135.4745, 34.6890], // 野田
          [135.4660, 34.6820], // 西九条
          [135.4620, 34.6690], // 弁天町
          [135.4795, 34.6655], // 大正
          [135.4900, 34.6590], // 芦原橋
          [135.4950, 34.6550], // 今宮
          [135.5005, 34.6500], // 新今宮
          [135.5140, 34.6468], // 天王寺
          [135.5230, 34.6480], // 寺田町
          [135.5290, 34.6570], // 桃谷
          [135.5300, 34.6660], // 鶴橋
          [135.5320, 34.6738], // 玉造
          [135.5340, 34.6815], // 森ノ宮
          [135.5340, 34.6900], // 大阪城公園
          [135.5330, 34.6970], // 京橋
          [135.5200, 34.7050], // 桜ノ宮
          [135.5126, 34.7051], // 天満
          [135.4959, 34.7024], // 大阪 (Loop)
        ],
      },
    },

    // JR 東西線 (JR Tozai Line - #DC6B9A)
    {
      type: 'Feature',
      properties: { name: 'JR東西線', operator: 'JR西日本', color: '#DC6B9A', width: 2.5 },
      geometry: {
        type: 'LineString',
        coordinates: [
          [135.4740, 34.6940], // 海老江
          [135.4865, 34.6950], // 新福島
          [135.4980, 34.6980], // 北新地
          [135.5110, 34.6975], // 大阪天満宮
          [135.5280, 34.6970], // 大阪城北詰
          [135.5330, 34.6970], // 京橋
        ],
      },
    },

    // 京阪電車 (Keihan Railway - #1E50A2 / #00873C)
    {
      type: 'Feature',
      properties: { name: '京阪本線・中之島線', operator: '京阪電車', color: '#1E50A2', width: 2.5 },
      geometry: {
        type: 'LineString',
        coordinates: [
          [135.4900, 34.6937], // 中之島
          [135.4950, 34.6930], // 渡辺橋
          [135.5015, 34.6928], // 淀屋橋/大江橋
          [135.5065, 34.6917], // 北浜/なにわ橋
          [135.5186, 34.6903], // 天満橋
          [135.5330, 34.6970], // 京橋
        ],
      },
    },

    // 阪急電鉄 (Hankyu Railway - #6B1D2F)
    {
      type: 'Feature',
      properties: { name: '阪急電鉄', operator: '阪急電鉄', color: '#6B1D2F', width: 3 },
      geometry: {
        type: 'LineString',
        coordinates: [
          [135.4983, 34.7030], // 大阪梅田
          [135.4940, 34.7090], // 中津
          [135.4820, 34.7200], // 十三
        ],
      },
    },

    // 阪神電車 (Hanshin Railway - #0C3B7C)
    {
      type: 'Feature',
      properties: { name: '阪神本線', operator: '阪神電車', color: '#0C3B7C', width: 2.5 },
      geometry: {
        type: 'LineString',
        coordinates: [
          [135.4960, 34.7010], // 大阪梅田
          [135.4865, 34.6960], // 福島
          [135.4740, 34.6930], // 野田
        ],
      },
    },

    // 南海電鉄 (Nankai Railway - #1D428A)
    {
      type: 'Feature',
      properties: { name: '南海本線・高野線', operator: '南海電鉄', color: '#1D428A', width: 3 },
      geometry: {
        type: 'LineString',
        coordinates: [
          [135.5010, 34.6640], // なんば
          [135.5005, 34.6500], // 新今宮
          [135.4980, 34.6370], // 天下茶屋
        ],
      },
    },

    // 近鉄・阪神なんば線 (Kintetsu / Hanshin Namba Line - #004F9F)
    {
      type: 'Feature',
      properties: { name: '近鉄難波線・阪神なんば線', operator: '近鉄/阪神', color: '#004F9F', width: 2.5 },
      geometry: {
        type: 'LineString',
        coordinates: [
          [135.4660, 34.6820], // 西九条
          [135.4800, 34.6700], // ドーム前
          [135.4930, 34.6675], // 桜川
          [135.5005, 34.6667], // 大阪難波
          [135.5065, 34.6670], // 近鉄日本橋
          [135.5200, 34.6660], // 大阪上本町
          [135.5300, 34.6660], // 鶴橋
        ],
      },
    },
  ],
};

// 主要駅ポイントデータ
export const OSAKA_TRANSIT_STATIONS: {
  type: 'FeatureCollection';
  features: TransitStationFeature[];
} = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { name: '大阪 / 梅田', nameEn: 'Osaka / Umeda', operator: 'JR / Metro / 阪急 / 阪神', lines: 'JR環状線 / 御堂筋線 / 谷町線 / 四つ橋線 / 阪急 / 阪神', color: '#E85219' },
      geometry: { type: 'Point', coordinates: [135.4959, 34.7024] },
    },
    {
      type: 'Feature',
      properties: { name: '中崎町', nameEn: 'Nakazakicho', operator: 'Osaka Metro', lines: '谷町線', color: '#522886' },
      geometry: { type: 'Point', coordinates: [135.5032, 34.7065] },
    },
    {
      type: 'Feature',
      properties: { name: '天満 / 扇町', nameEn: 'Temma / Ogimachi', operator: 'JR / Osaka Metro', lines: 'JR環状線 / 堺筋線', color: '#E85219' },
      geometry: { type: 'Point', coordinates: [135.5126, 34.7051] },
    },
    {
      type: 'Feature',
      properties: { name: '中之島', nameEn: 'Nakanoshima', operator: '京阪電車', lines: '中之島線', color: '#1E50A2' },
      geometry: { type: 'Point', coordinates: [135.4900, 34.6937] },
    },
    {
      type: 'Feature',
      properties: { name: '福島 / 新福島', nameEn: 'Fukushima', operator: 'JR / 阪神', lines: 'JR環状線 / JR東西線 / 阪神本線', color: '#E85219' },
      geometry: { type: 'Point', coordinates: [135.4865, 34.6970] },
    },
    {
      type: 'Feature',
      properties: { name: '淀屋橋', nameEn: 'Yodoyabashi', operator: 'Osaka Metro / 京阪', lines: '御堂筋線 / 京阪本線', color: '#E5171F' },
      geometry: { type: 'Point', coordinates: [135.5015, 34.6928] },
    },
    {
      type: 'Feature',
      properties: { name: '北浜', nameEn: 'Kitahama', operator: 'Osaka Metro / 京阪', lines: '堺筋線 / 京阪本線', color: '#814721' },
      geometry: { type: 'Point', coordinates: [135.5065, 34.6917] },
    },
    {
      type: 'Feature',
      properties: { name: '本町', nameEn: 'Hommachi', operator: 'Osaka Metro', lines: '御堂筋線 / 四つ橋線 / 中央線', color: '#E5171F' },
      geometry: { type: 'Point', coordinates: [135.5000, 34.6826] },
    },
    {
      type: 'Feature',
      properties: { name: '心斎橋 / 四ツ橋', nameEn: 'Shinsaibashi / Yotsubashi', operator: 'Osaka Metro', lines: '御堂筋線 / 四つ橋線 / 長堀鶴見緑地線', color: '#E5171F' },
      geometry: { type: 'Point', coordinates: [135.5005, 34.6750] },
    },
    {
      type: 'Feature',
      properties: { name: 'なんば / 大阪難波', nameEn: 'Namba', operator: 'JR / Metro / 近鉄 / 南海 / 阪神', lines: '御堂筋線 / 四つ橋線 / 千日前線 / 南海 / 近鉄 / 阪神 / JR', color: '#E5171F' },
      geometry: { type: 'Point', coordinates: [135.5005, 34.6667] },
    },
    {
      type: 'Feature',
      properties: { name: '日本橋', nameEn: 'Nippombashi', operator: 'Osaka Metro / 近鉄', lines: '堺筋線 / 千日前線 / 近鉄奈良線', color: '#814721' },
      geometry: { type: 'Point', coordinates: [135.5065, 34.6670] },
    },
    {
      type: 'Feature',
      properties: { name: '新今宮', nameEn: 'Shin-Imamiya', operator: 'JR / 南海 / 阪堺', lines: 'JR環状線 / 南海本線 / 阪堺線', color: '#E85219' },
      geometry: { type: 'Point', coordinates: [135.5005, 34.6500] },
    },
    {
      type: 'Feature',
      properties: { name: '天王寺', nameEn: 'Tennoji', operator: 'JR / Osaka Metro / 近鉄', lines: 'JR環状線 / 御堂筋線 / 谷町線 / 近鉄南大阪線', color: '#E85219' },
      geometry: { type: 'Point', coordinates: [135.5135, 34.6468] },
    },
    {
      type: 'Feature',
      properties: { name: '京橋', nameEn: 'Kyobashi', operator: 'JR / 京阪 / Metro', lines: 'JR環状線 / 京阪本線 / 長堀鶴見緑地線', color: '#E85219' },
      geometry: { type: 'Point', coordinates: [135.5330, 34.6970] },
    },
    {
      type: 'Feature',
      properties: { name: '天満橋', nameEn: 'Temmabashi', operator: 'Osaka Metro / 京阪', lines: '谷町線 / 京阪本線', color: '#522886' },
      geometry: { type: 'Point', coordinates: [135.5186, 34.6903] },
    },
  ],
};
