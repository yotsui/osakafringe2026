/**
 * 大阪の主要鉄道路線＆駅 GeoJSON データ
 * 大阪メトロ公式9路線（M, T, Y, C, S, K, N, I, P）＋JR・主要私鉄
 */

export interface TransitLineFeature {
  type: 'Feature';
  properties: {
    name: string;
    symbol?: string;
    nameEn: string;
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
    symbol?: string;
    operator: string;
    lines: string;
    color: string;
  };
  geometry: {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat]
  };
}

// 大阪メトロ公式路線の定義マスター
export const METRO_LINES_INFO = [
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

// 鉄道路線データ
export const OSAKA_TRANSIT_LINES: {
  type: 'FeatureCollection';
  features: TransitLineFeature[];
} = {
  type: 'FeatureCollection',
  features: [
    // 1. M - 御堂筋線 (Midosuji Line - #E5171F)
    {
      type: 'Feature',
      properties: { name: '御堂筋線', symbol: 'M', nameEn: 'Midosuji Line', operator: 'Osaka Metro', color: '#E5171F', width: 4 },
      geometry: {
        type: 'LineString',
        coordinates: [
          [135.4960, 34.7800], // 千里中央方面
          [135.4980, 34.7500], // 江坂
          [135.4990, 34.7400], // 東三国
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
          [135.5150, 34.5800], // なかもず
        ],
      },
    },

    // 2. T - 谷町線 (Tanimachi Line - #522886)
    {
      type: 'Feature',
      properties: { name: '谷町線', symbol: 'T', nameEn: 'Tanimachi Line', operator: 'Osaka Metro', color: '#522886', width: 3.5 },
      geometry: {
        type: 'LineString',
        coordinates: [
          [135.5550, 34.7500], // 大日
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
          [135.5500, 34.6000], // 八尾南方面
        ],
      },
    },

    // 3. Y - 四つ橋線 (Yotsubashi Line - #0078BA)
    {
      type: 'Feature',
      properties: { name: '四つ橋線', symbol: 'Y', nameEn: 'Yotsubashi Line', operator: 'Osaka Metro', color: '#0078BA', width: 3.5 },
      geometry: {
        type: 'LineString',
        coordinates: [
          [135.4950, 34.6997], // 西梅田
          [135.4975, 34.6922], // 肥後橋
          [135.4965, 34.6826], // 本町
          [135.4965, 34.6750], // 四ツ橋
          [135.4965, 34.6667], // なんば
          [135.4980, 34.6560], // 大国町
          [135.4940, 34.6450], // 花園町
          [135.4920, 34.6330], // 岸里
          [135.4850, 34.6150], // 住之江公園
        ],
      },
    },

    // 4. C - 中央線 (Chuo Line - #019A66)
    {
      type: 'Feature',
      properties: { name: '中央線', symbol: 'C', nameEn: 'Chuo Line', operator: 'Osaka Metro', color: '#019A66', width: 3.5 },
      geometry: {
        type: 'LineString',
        coordinates: [
          [135.4150, 34.6550], // 夢洲（万博会場）
          [135.4300, 34.6530], // コスモスクエア
          [135.4420, 34.6520], // 大阪港
          [135.4600, 34.6580], // 朝潮橋
          [135.4760, 34.6700], // 弁天町
          [135.4880, 34.6815], // 九条
          [135.4940, 34.6825], // 阿波座
          [135.5000, 34.6826], // 本町
          [135.5060, 34.6822], // 堺筋本町
          [135.5170, 34.6815], // 谷町四丁目
          [135.5340, 34.6810], // 森ノ宮
          [135.5450, 34.6800], // 緑橋
          [135.5600, 34.6780], // 深江橋
          [135.5800, 34.6800], // 長田
        ],
      },
    },

    // 5. S - 千日前線 (Sennichimae Line - #E44D93)
    {
      type: 'Feature',
      properties: { name: '千日前線', symbol: 'S', nameEn: 'Sennichimae Line', operator: 'Osaka Metro', color: '#E44D93', width: 3 },
      geometry: {
        type: 'LineString',
        coordinates: [
          [135.4750, 34.6930], // 野田阪神
          [135.4940, 34.6825], // 阿波座
          [135.4930, 34.6730], // 西長堀
          [135.4960, 34.6670], // 桜川
          [135.5005, 34.6667], // なんば
          [135.5065, 34.6668], // 日本橋
          [135.5165, 34.6665], // 谷町九丁目
          [135.5260, 34.6660], // 鶴橋
          [135.5450, 34.6660], // 今里
          [135.5650, 34.6700], // 南巽
        ],
      },
    },

    // 6. K - 堺筋線 (Sakaisuji Line - #814721)
    {
      type: 'Feature',
      properties: { name: '堺筋線', symbol: 'K', nameEn: 'Sakaisuji Line', operator: 'Osaka Metro', color: '#814721', width: 3 },
      geometry: {
        type: 'LineString',
        coordinates: [
          [135.5113, 34.7107], // 天神橋筋六丁目
          [135.5110, 34.7040], // 扇町
          [135.5110, 34.6975], // 南森町
          [135.5065, 34.6912], // 北浜
          [135.5060, 34.6822], // 堺筋本町
          [135.5062, 34.6745], // 長堀橋
          [135.5065, 34.6668], // 日本橋
          [135.5060, 34.6565], // 恵美須町
          [135.5050, 34.6500], // 動物園前
          [135.5040, 34.6430], // 天下一品・天下茶屋
        ],
      },
    },

    // 7. N - 長堀鶴見緑地線 (Nagahori Tsurumi-ryokuchi Line - #A9CC51)
    {
      type: 'Feature',
      properties: { name: '長堀鶴見緑地線', symbol: 'N', nameEn: 'Nagahori Tsurumi-ryokuchi Line', operator: 'Osaka Metro', color: '#A9CC51', width: 3 },
      geometry: {
        type: 'LineString',
        coordinates: [
          [135.4740, 34.6660], // 大正
          [135.4850, 34.6680], // ドーム前千代崎
          [135.4930, 34.6730], // 西長堀
          [135.4965, 34.6750], // 西大橋
          [135.5005, 34.6750], // 心斎橋
          [135.5062, 34.6745], // 長堀橋
          [135.5130, 34.6743], // 松屋町
          [135.5165, 34.6740], // 谷町六丁目
          [135.5250, 34.6800], // 玉造
          [135.5340, 34.6810], // 森ノ宮
          [135.5300, 34.6920], // 大阪ビジネスパーク
          [135.5330, 34.6965], // 京橋
          [135.5700, 34.7150], // 鶴見緑地
          [135.5900, 34.7200], // 門真南
        ],
      },
    },

    // 8. I - 今里筋線 (Imazatosuji Line - #EE7B1A)
    {
      type: 'Feature',
      properties: { name: '今里筋線', symbol: 'I', nameEn: 'Imazatosuji Line', operator: 'Osaka Metro', color: '#EE7B1A', width: 3 },
      geometry: {
        type: 'LineString',
        coordinates: [
          [135.5500, 34.7500], // 井高野
          [135.5450, 34.7350], // だいどう豊里
          [135.5500, 34.7100], // 関目成育
          [135.5500, 34.6950], // 鴫野
          [135.5450, 34.6800], // 緑橋
          [135.5450, 34.6660], // 今里
        ],
      },
    },

    // 9. P - ニュートラム (New Tram - #00A0DE)
    {
      type: 'Feature',
      properties: { name: 'ニュートラム', symbol: 'P', nameEn: 'New Tram', operator: 'Osaka Metro', color: '#00A0DE', width: 3 },
      geometry: {
        type: 'LineString',
        coordinates: [
          [135.4300, 34.6530], // コスモスクエア
          [135.4200, 34.6400], // トレードセンター前
          [135.4220, 34.6300], // 中ふ頭
          [135.4300, 34.6200], // ポートタウン西
          [135.4450, 34.6150], // 南港東
          [135.4650, 34.6130], // フェリーターミナル
          [135.4850, 34.6150], // 住之江公園
        ],
      },
    },

    // 10. JR 大阪環状線 (Osaka Loop Line - #E85219)
    {
      type: 'Feature',
      properties: { name: 'JR大阪環状線', nameEn: 'JR Osaka Loop Line', operator: 'JR West', color: '#E85219', width: 3.5 },
      geometry: {
        type: 'LineString',
        coordinates: [
          [135.4983, 34.7024], // 大阪
          [135.4868, 34.6975], // 福島
          [135.4810, 34.6870], // 野田
          [135.4740, 34.6730], // 西九条
          [135.4760, 34.6700], // 弁天町
          [135.4740, 34.6660], // 大正
          [135.4880, 34.6550], // 芦原橋
          [135.5000, 34.6500], // 今宮
          [135.5050, 34.6500], // 新今宮
          [135.5135, 34.6468], // 天王寺
          [135.5250, 34.6580], // 寺田町
          [135.5270, 34.6620], // 桃谷
          [135.5260, 34.6660], // 鶴橋
          [135.5250, 34.6800], // 玉造
          [135.5340, 34.6810], // 森ノ宮
          [135.5330, 34.6910], // 大阪城公園
          [135.5330, 34.6965], // 京橋
          [135.5200, 34.7060], // 桜ノ宮
          [135.5120, 34.7050], // 天満
          [135.4983, 34.7024], // 大阪（ループ接続）
        ],
      },
    },

    // 11. JR 東西線 (JR Tozai Line - #DC6B9A)
    {
      type: 'Feature',
      properties: { name: 'JR東西線', nameEn: 'JR Tozai Line', operator: 'JR West', color: '#DC6B9A', width: 2.5 },
      geometry: {
        type: 'LineString',
        coordinates: [
          [135.4500, 34.7050], // 尼崎方面
          [135.4868, 34.6975], // 新福島
          [135.4960, 34.6980], // 北新地
          [135.5110, 34.6975], // 大阪天満宮
          [135.5330, 34.6965], // 京橋
        ],
      },
    },

    // 12. 京阪本線 & 中之島線 (Keihan - #1E50A2)
    {
      type: 'Feature',
      properties: { name: '京阪電車', nameEn: 'Keihan Railway', operator: 'Keihan', color: '#1E50A2', width: 2.5 },
      geometry: {
        type: 'LineString',
        coordinates: [
          [135.4860, 34.6910], // 中之島
          [135.4940, 34.6925], // 渡辺橋
          [135.5010, 34.6928], // 大江橋
          [135.5065, 34.6912], // なにわ橋/北浜
          [135.5186, 34.6903], // 天満橋
          [135.5330, 34.6965], // 京橋
          [135.5600, 34.7100], // 京都方面
        ],
      },
    },

    // 13. 阪急電鉄 (Hankyu - #6B1D2F)
    {
      type: 'Feature',
      properties: { name: '阪急電鉄', nameEn: 'Hankyu Railway', operator: 'Hankyu', color: '#6B1D2F', width: 3 },
      geometry: {
        type: 'LineString',
        coordinates: [
          [135.4983, 34.7024], // 大阪梅田
          [135.4970, 34.7107], // 中津
          [135.4850, 34.7200], // 十三（神戸・宝塚・京都線分岐）
        ],
      },
    },

    // 14. 阪神本線 (Hanshin - #0C3B7C)
    {
      type: 'Feature',
      properties: { name: '阪神本線', nameEn: 'Hanshin Railway', operator: 'Hanshin', color: '#0C3B7C', width: 2.5 },
      geometry: {
        type: 'LineString',
        coordinates: [
          [135.4970, 34.7010], // 大阪梅田
          [135.4868, 34.6960], // 福島
          [135.4740, 34.6920], // 野田
          [135.4500, 34.6950], // 神戸方面
        ],
      },
    },

    // 15. 近鉄・阪神なんば線 (Kintetsu / Hanshin Namba - #004F9F)
    {
      type: 'Feature',
      properties: { name: '近鉄/阪神なんば線', nameEn: 'Kintetsu / Hanshin Line', operator: 'Kintetsu', color: '#004F9F', width: 2.5 },
      geometry: {
        type: 'LineString',
        coordinates: [
          [135.4740, 34.6730], // 西九条
          [135.4880, 34.6700], // 九条
          [135.4960, 34.6670], // 大阪難波
          [135.5065, 34.6668], // 近鉄日本橋
          [135.5165, 34.6665], // 大阪上本町
          [135.5260, 34.6660], // 鶴橋
          [135.5500, 34.6660], // 奈良・名古屋方面
        ],
      },
    },

    // 16. 南海電鉄 (Nankai - #1D428A)
    {
      type: 'Feature',
      properties: { name: '南海電鉄', nameEn: 'Nankai Railway', operator: 'Nankai', color: '#1D428A', width: 2.5 },
      geometry: {
        type: 'LineString',
        coordinates: [
          [135.5020, 34.6630], // 難波
          [135.5040, 34.6500], // 新今宮
          [135.5040, 34.6430], // 天下茶屋
          [135.4900, 34.6000], // 関空・和歌山方面
        ],
      },
    },
  ],
};

// 主要駅ポイントデータ（地下鉄・JR・私鉄の結節点）
export const OSAKA_TRANSIT_STATIONS: {
  type: 'FeatureCollection';
  features: TransitStationFeature[];
} = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { name: '大阪 / 梅田', symbol: 'M', nameEn: 'Osaka / Umeda', operator: 'JR / Metro / 私鉄', lines: 'JR・御堂筋・谷町・四つ橋・阪急・阪神', color: '#E5171F' },
      geometry: { type: 'Point', coordinates: [135.4983, 34.7024] },
    },
    {
      type: 'Feature',
      properties: { name: '中崎町', symbol: 'T', nameEn: 'Nakazakicho', operator: 'Osaka Metro', lines: '谷町線', color: '#522886' },
      geometry: { type: 'Point', coordinates: [135.5032, 34.7065] },
    },
    {
      type: 'Feature',
      properties: { name: '天満 / 扇町', symbol: 'K', nameEn: 'Temma / Ogimachi', operator: 'JR / Osaka Metro', lines: 'JR環状線・堺筋線', color: '#E85219' },
      geometry: { type: 'Point', coordinates: [135.5120, 34.7050] },
    },
    {
      type: 'Feature',
      properties: { name: '中之島', symbol: 'K', nameEn: 'Nakanoshima', operator: '京阪電車', lines: '京阪中之島線', color: '#1E50A2' },
      geometry: { type: 'Point', coordinates: [135.4860, 34.6910] },
    },
    {
      type: 'Feature',
      properties: { name: '福島', symbol: 'JR', nameEn: 'Fukushima', operator: 'JR / 阪神', lines: 'JR環状線・東西線・阪神本線', color: '#E85219' },
      geometry: { type: 'Point', coordinates: [135.4868, 34.6975] },
    },
    {
      type: 'Feature',
      properties: { name: '淀屋橋', symbol: 'M', nameEn: 'Yodoyabashi', operator: 'Osaka Metro / 京阪', lines: '御堂筋線・京阪本線', color: '#E5171F' },
      geometry: { type: 'Point', coordinates: [135.5015, 34.6928] },
    },
    {
      type: 'Feature',
      properties: { name: '北浜', symbol: 'K', nameEn: 'Kitahama', operator: 'Osaka Metro / 京阪', lines: '堺筋線・京阪本線', color: '#814721' },
      geometry: { type: 'Point', coordinates: [135.5065, 34.6912] },
    },
    {
      type: 'Feature',
      properties: { name: '本町', symbol: 'M', nameEn: 'Hommachi', operator: 'Osaka Metro', lines: '御堂筋・中央・四つ橋線', color: '#019A66' },
      geometry: { type: 'Point', coordinates: [135.5000, 34.6826] },
    },
    {
      type: 'Feature',
      properties: { name: '心斎橋 / 四ツ橋', symbol: 'M', nameEn: 'Shinsaibashi / Yotsubashi', operator: 'Osaka Metro', lines: '御堂筋・長堀鶴見緑地・四つ橋線', color: '#E5171F' },
      geometry: { type: 'Point', coordinates: [135.5005, 34.6750] },
    },
    {
      type: 'Feature',
      properties: { name: 'なんば (難波)', symbol: 'M', nameEn: 'Namba', operator: 'Osaka Metro / 近鉄 / 南海 / JR', lines: '御堂筋・四つ橋・千日前・南海・近鉄', color: '#E5171F' },
      geometry: { type: 'Point', coordinates: [135.5005, 34.6667] },
    },
    {
      type: 'Feature',
      properties: { name: '日本橋', symbol: 'S', nameEn: 'Nippombashi', operator: 'Osaka Metro / 近鉄', lines: '堺筋・千日前・近鉄難波線', color: '#E44D93' },
      geometry: { type: 'Point', coordinates: [135.5065, 34.6668] },
    },
    {
      type: 'Feature',
      properties: { name: '新今宮', symbol: 'JR', nameEn: 'Shin-Imamiya', operator: 'JR / 南海 / 阪堺', lines: 'JR環状線・南海本線・阪堺線', color: '#E85219' },
      geometry: { type: 'Point', coordinates: [135.5050, 34.6500] },
    },
    {
      type: 'Feature',
      properties: { name: '天王寺', symbol: 'M', nameEn: 'Tennoji', operator: 'JR / Osaka Metro / 近鉄', lines: 'JR環状線・御堂筋・谷町・近鉄南大阪線', color: '#E5171F' },
      geometry: { type: 'Point', coordinates: [135.5135, 34.6468] },
    },
    {
      type: 'Feature',
      properties: { name: '京橋', symbol: 'JR', nameEn: 'Kyobashi', operator: 'JR / 京阪 / Osaka Metro', lines: 'JR環状線・京阪本線・長堀鶴見緑地線', color: '#E85219' },
      geometry: { type: 'Point', coordinates: [135.5330, 34.6965] },
    },
    {
      type: 'Feature',
      properties: { name: '天満橋', symbol: 'T', nameEn: 'Temmabashi', operator: '京阪 / Osaka Metro', lines: '京阪本線・谷町線', color: '#522886' },
      geometry: { type: 'Point', coordinates: [135.5186, 34.6903] },
    },
    {
      type: 'Feature',
      properties: { name: '弁天町', symbol: 'C', nameEn: 'Bentencho', operator: 'JR / Osaka Metro', lines: 'JR環状線・中央線', color: '#019A66' },
      geometry: { type: 'Point', coordinates: [135.4760, 34.6700] },
    },
    {
      type: 'Feature',
      properties: { name: 'コスモスクエア', symbol: 'C', nameEn: 'Cosmosquare', operator: 'Osaka Metro', lines: '中央線・ニュートラム', color: '#019A66' },
      geometry: { type: 'Point', coordinates: [135.4300, 34.6530] },
    },
  ],
};
