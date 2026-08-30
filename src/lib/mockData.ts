import { Venue, Performance, Award, Banner, SiteInfo } from '@/types';

export const mockVenues: Venue[] = [
  {
    id: 'nakazaki-hall',
    name: '中崎町アートスペース SPACE ONE',
    nameEn: 'Nakazakicho Art Space SPACE ONE',
    area: '中崎町・梅田',
    areaEn: 'Nakazakicho / Umeda',
    address: '大阪市北区中崎西2-4-12',
    addressEn: '2-4-12 Nakazaki-nishi, Kita-ku, Osaka',
    access: 'Osaka Metro 谷町線「中崎町駅」徒歩3分 / 各線「梅田駅」徒歩10分',
    accessEn: '3 min walk from Nakazakicho Station (Tanimachi Line) / 10 min from Umeda',
    description: '中崎町のレトロな古民家をリノベーションした小劇場。濃密な空間で実験的な演劇・ダンスを上演。',
    descriptionEn: 'An intimate renovated heritage house theater in retro Nakazakicho, ideal for experimental theater & contemporary dance.',
    location: {
      lat: 34.7081,
      lng: 135.5034,
    },
    websiteUrl: 'https://example.com/space-one',
    snsTwitter: 'https://twitter.com/example',
    snsInstagram: 'https://instagram.com/example',
    snsFacebook: 'https://facebook.com/example',
    image: 'https://images.unsplash.com/photo-1514306191717-452ec28c7814?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1514306191717-452ec28c7814?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1469488865564-c2de10f69f96?auto=format&fit=crop&w=800&q=80'
    ],
    capacity: 60,
  },
  {
    id: 'shinsaibashi-under',
    name: '心斎橋 CLUB UNDERGROUND',
    nameEn: 'Shinsaibashi CLUB UNDERGROUND',
    area: 'ミナミ・心斎橋',
    areaEn: 'Minami / Shinsaibashi',
    address: '大阪市中央区西心斎橋1-10-8 B1F',
    addressEn: 'B1F, 1-10-8 Nishi-Shinsaibashi, Chuo-ku, Osaka',
    access: 'Osaka Metro 御堂筋線・長堀鶴見緑地線「心斎橋駅」7番出口すぐ',
    accessEn: 'Directly outside Exit 7 of Shinsaibashi Station',
    description: 'アメリカ村の中心にある音響・照明設備を備えたライブホール。スタンディングコメディや音楽ライブに最適。',
    descriptionEn: 'A cutting-edge live space in the heart of America-mura, featuring top-notch acoustics for stand-up comedy and indie music.',
    location: {
      lat: 34.6725,
      lng: 135.4983,
    },
    websiteUrl: 'https://example.com/club-underground',
    snsInstagram: 'https://instagram.com/example_under',
    image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80'
    ],
    capacity: 120,
  },
  {
    id: 'nakanoshima-bank',
    name: '中之島 リバーサイドカフェ & テラス',
    nameEn: 'Nakanoshima Riverside Cafe & Terrace',
    area: '中之島・北浜',
    areaEn: 'Nakanoshima / Kitahama',
    address: '大阪市北区中之島1-1-28',
    addressEn: '1-1-28 Nakanoshima, Kita-ku, Osaka',
    access: '京阪本線・Osaka Metro 堺筋線「北浜駅」徒歩2分',
    accessEn: '2 min walk from Kitahama Station',
    description: '堂島川に面した開放的なオープンエア会場。屋外大道芸、サーカス、紙芝居、作品展示などの無料フリンジステージを展開。',
    descriptionEn: 'An open-air waterfront stage along the river, hosting street performance, circus, kamishibai, and public art exhibitions.',
    location: {
      lat: 34.6937,
      lng: 135.5039,
    },
    websiteUrl: 'https://example.com/nakanoshima-riverside',
    snsTwitter: 'https://twitter.com/nakanoshima_stage',
    image: 'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1511192336575-5a79af67a629?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=800&q=80'
    ],
    capacity: 200,
  },
  {
    id: 'tennoji-warehouse',
    name: '天王寺 アートファクトリー ルーフトップ',
    nameEn: 'Tennoji Art Factory Rooftop',
    area: '天王寺・新世界',
    areaEn: 'Tennoji / Shinsekai',
    address: '大阪市天王寺区逢阪2-3-15 屋上',
    addressEn: 'Rooftop, 2-3-15 Osaka, Tennoji-ku, Osaka',
    access: 'JR・Osaka Metro「天王寺駅」北口より徒歩6分',
    accessEn: '6 min walk from Tennoji Station North Exit',
    description: '通天閣を遠くに望む秘密基地のようなルーフトップ。夕暮れから夜にかけての古典芸能や作品展示を実施。',
    descriptionEn: 'A creative rooftop space with views of Tsutenkaku Tower, creating magical dusk atmosphere for traditional arts and site-specific theater.',
    location: {
      lat: 34.6531,
      lng: 135.5132,
    },
    websiteUrl: 'https://example.com/tennoji-art-factory',
    image: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80'
    ],
    capacity: 80,
  },
];

export const mockPerformances: Performance[] = [
  {
    id: 'perf-1',
    title: 'ネオ浪速フィジカルシアター『道頓堀の底から』',
    titleEn: 'Neo Naniwa Physical Theater: From the Depths of Dotonbori',
    artistName: '劇団オオサカ・カオス (Japan)',
    artistNameEn: 'Gekidan Osaka Chaos (Japan)',
    genre: 'theater',
    genreCustom: 'フィジカルシアター',
    genreCustomEn: 'Physical Theater',
    description: '道頓堀の歴史と都市伝説をアクロバティックな身体表現とエレクトロ浪曲で描き出す、爆発的熱量のノンストップ劇。',
    descriptionEn: 'An explosive non-stop spectacle blending Osaka urban legends, high-energy acrobatics, and electro-traditional rokyoku chanting.',
    venueId: 'nakazaki-hall',
    schedules: [
      { date: '2026-09-18', startTime: '19:00', endTime: '20:15', venueId: 'nakazaki-hall', venueName: '中崎町アートスペース SPACE ONE', venueNameEn: 'Nakazakicho Art Space SPACE ONE', note: 'オープニング公演' },
      { date: '2026-09-19', startTime: '14:00', endTime: '15:15', venueId: 'nakazaki-hall', venueName: '中崎町アートスペース SPACE ONE', venueNameEn: 'Nakazakicho Art Space SPACE ONE' },
      { date: '2026-09-20', startTime: '18:00', endTime: '19:15', venueId: 'shinsaibashi-under', venueName: '心斎橋 CLUB UNDERGROUND', venueNameEn: 'Shinsaibashi CLUB UNDERGROUND', note: '千秋楽スペシャル' },
    ],
    ticketPrice: '前売 ¥2,500 / 当日 ¥3,000 / 学生 ¥1,500',
    ticketPriceEn: 'Adv: ¥2,500 / Door: ¥3,000 / Student: ¥1,500',
    ticketUrl: 'https://example.com/tickets/perf-1',
    websiteUrl: 'https://example.com/osakachaos',
    snsTwitter: 'https://twitter.com/osakachaos',
    image: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=800&q=80',
    isFeatured: true,
    durationMinutes: 75,
  },
  {
    id: 'perf-2',
    title: 'Fire & Gravity: Street Circus Explosion',
    titleEn: 'Fire & Gravity: Street Circus Explosion',
    artistName: 'Alexei & Maya (UK / Australia)',
    artistNameEn: 'Alexei & Maya (UK / Australia)',
    genre: 'street',
    genreCustom: '大道芸・ファイヤーフープ',
    genreCustomEn: 'Street Circus & Fire Hoop',
    description: 'エディンバラ・フリンジで大絶賛を浴びた国際デュオによる、重力を超える空中技と炎のサーカスパフォーマンス。',
    descriptionEn: 'Award-winning Edinburgh Fringe street sensations bringing breathtaking aerial acrobatics and fire hoop artistry.',
    venueId: 'nakanoshima-bank',
    schedules: [
      { date: '2026-09-18', startTime: '17:30', endTime: '18:15', venueId: 'nakanoshima-bank', venueName: '中之島 リバーサイドカフェ & テラス', venueNameEn: 'Nakanoshima Riverside Cafe & Terrace' },
      { date: '2026-09-19', startTime: '16:00', endTime: '16:45', venueId: 'nakanoshima-bank', venueName: '中之島 リバーサイドカフェ & テラス', venueNameEn: 'Nakanoshima Riverside Cafe & Terrace' },
      { date: '2026-09-21', startTime: '15:00', endTime: '15:45', venueId: 'tennoji-warehouse', venueName: '天王寺 アートファクトリー ルーフトップ', venueNameEn: 'Tennoji Art Factory Rooftop' },
    ],
    ticketPrice: '投げ銭制 (Free / Tip-based)',
    ticketPriceEn: 'Free entry / Tip-based',
    ticketUrl: '', // チケット不要のため空（非表示テスト）
    image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80',
    isFeatured: true,
    durationMinutes: 45,
  },
  {
    id: 'perf-3',
    title: '浪速バイリンガルスタンドアップコメディ',
    titleEn: 'Osaka Stories: Bilingual Stand-up Comedy',
    artistName: 'Kenji & The International Osaka Club',
    artistNameEn: 'Kenji & The International Osaka Club',
    genre: 'dance',
    genreCustom: 'スタンドアップ・コメディ',
    genreCustomEn: 'Stand-up Comedy',
    description: '日英バイリンガルで繰り広げられる、大阪の食文化、おかんの掟、カルチャーショックを笑い飛ばす超高速漫才＆スタンドアップ。',
    descriptionEn: 'Hilarious bilingual stand-up comedy exploring Osaka culture, food obsessions, tiger-shirt moms, and international culture shocks.',
    venueId: 'shinsaibashi-under',
    schedules: [
      { date: '2026-09-19', startTime: '19:30', endTime: '20:30', venueId: 'shinsaibashi-under', venueName: '心斎橋 CLUB UNDERGROUND', venueNameEn: 'Shinsaibashi CLUB UNDERGROUND' },
      { date: '2026-09-20', startTime: '15:00', endTime: '16:00', venueId: 'shinsaibashi-under', venueName: '心斎橋 CLUB UNDERGROUND', venueNameEn: 'Shinsaibashi CLUB UNDERGROUND' },
    ],
    ticketPrice: '¥2,000 (1ドリンク付)',
    ticketPriceEn: '¥2,000 (Includes 1 Drink)',
    ticketUrl: 'https://example.com/tickets/perf-3',
    image: 'https://images.unsplash.com/photo-1585699324551-f6c309eedeca?auto=format&fit=crop&w=800&q=80',
    isFeatured: true,
    durationMinutes: 60,
  },
  {
    id: 'perf-4',
    title: '古典×現代 響きあう和の音色と舞',
    titleEn: 'Classical Resonance: Japanese Traditional Dance & Shamisen',
    artistName: '咲夜 -Sakuya- (Kyoto / Osaka)',
    artistNameEn: 'Sakuya (Kyoto / Osaka)',
    genre: 'traditional',
    genreCustom: '古典芸能・現代三味線',
    genreCustomEn: 'Traditional Arts & Modern Shamisen',
    description: '伝統的な三味線と上方舞にコンテンポラリーの即興性を融合。夕暮れのルーフトップで繰り広げられる幽玄のひととき。',
    descriptionEn: 'Fusing traditional shamisen and Kamigata dance with modern improvisation against the evening Osaka skyline.',
    venueId: 'tennoji-warehouse',
    schedules: [
      { date: '2026-09-20', startTime: '17:00', endTime: '18:00', venueId: 'tennoji-warehouse', venueName: '天王寺 アートファクトリー ルーフトップ', venueNameEn: 'Tennoji Art Factory Rooftop' },
      { date: '2026-09-21', startTime: '17:30', endTime: '18:30', venueId: 'tennoji-warehouse', venueName: '天王寺 アートファクトリー ルーフトップ', venueNameEn: 'Tennoji Art Factory Rooftop' },
    ],
    ticketPrice: '¥2,000',
    ticketPriceEn: '¥2,000',
    ticketUrl: 'https://example.com/tickets/perf-4',
    image: 'https://images.unsplash.com/photo-1528164344705-475426879c0d?auto=format&fit=crop&w=800&q=80',
    durationMinutes: 60,
  },
  {
    id: 'perf-5',
    title: '街頭紙芝居レボリューション 2026',
    titleEn: 'Street Kamishibai Revolution 2026',
    artistName: 'なにわ拍子木座 (Naniwa Hyoshigi-za)',
    artistNameEn: 'Naniwa Hyoshigi-za',
    genre: 'kamishibai',
    genreCustom: '街頭紙芝居・水飴つき',
    genreCustomEn: 'Interactive Street Kamishibai',
    description: '自転車の荷台に乗せた手作り木枠から始まる、昔懐かしくも新しい参加型街頭紙芝居。子どもから大人まで大人気。',
    descriptionEn: 'Interactive picture storytelling performed from a vintage bicycle cart. Fun and nostalgic for all ages.',
    venueId: 'nakanoshima-bank',
    schedules: [
      { date: '2026-09-19', startTime: '13:00', endTime: '13:40', venueId: 'nakanoshima-bank', venueName: '中之島 リバーサイドカフェ & テラス', venueNameEn: 'Nakanoshima Riverside Cafe & Terrace' },
      { date: '2026-09-20', startTime: '13:00', endTime: '13:40', venueId: 'nakanoshima-bank', venueName: '中之島 リバーサイドカフェ & テラス', venueNameEn: 'Nakanoshima Riverside Cafe & Terrace' },
    ],
    ticketPrice: '無料 (Free)',
    ticketPriceEn: 'Free Admission',
    ticketUrl: '', // 無料のため空
    image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=800&q=80',
    durationMinutes: 40,
  },
  {
    id: 'perf-6',
    title: '都市の呼吸：水都大阪インスタレーション',
    titleEn: 'Urban Breath: Aqua Metropolis Osaka Art Installation',
    artistName: 'Studio Ripple (Osaka / Berlin)',
    artistNameEn: 'Studio Ripple (Osaka / Berlin)',
    genre: 'exhibition',
    genreCustom: 'サウンド＆ライト展示',
    genreCustomEn: 'Sound & Light Art Installation',
    description: '川の水位と音響データをリアルタイムで光と立体物に変換する空間作品展示。会期中常時鑑賞可能。',
    descriptionEn: 'An immersive interactive art installation translating river water level and acoustic data into mesmerizing light sculptures.',
    venueId: 'nakanoshima-bank',
    schedules: [
      { date: '2026-09-18', startTime: '11:00', endTime: '20:00', venueId: 'nakanoshima-bank', venueName: '中之島 リバーサイドカフェ & テラス', venueNameEn: 'Nakanoshima Riverside Cafe & Terrace', note: '終日展示' },
      { date: '2026-09-19', startTime: '11:00', endTime: '20:00', venueId: 'nakanoshima-bank', venueName: '中之島 リバーサイドカフェ & テラス', venueNameEn: 'Nakanoshima Riverside Cafe & Terrace', note: '終日展示' },
      { date: '2026-09-20', startTime: '11:00', endTime: '20:00', venueId: 'nakanoshima-bank', venueName: '中之島 リバーサイドカフェ & テラス', venueNameEn: 'Nakanoshima Riverside Cafe & Terrace', note: '終日展示' },
      { date: '2026-09-21', startTime: '11:00', endTime: '20:00', venueId: 'nakanoshima-bank', venueName: '中之島 リバーサイドカフェ & テラス', venueNameEn: 'Nakanoshima Riverside Cafe & Terrace', note: '終日展示' },
    ],
    ticketPrice: '無料 (Free)',
    ticketPriceEn: 'Free Admission',
    ticketUrl: '',
    image: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&w=800&q=80',
    durationMinutes: 60,
  },
];

export const mockAwards: Award[] = [];

export const mockBanners: Banner[] = [
  {
    id: 'banner-instagram',
    title: '公式Instagramでフェスティバルの熱気をチェック！',
    titleEn: 'Follow Our Official Instagram for Live Highlights!',
    imageUrl: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=800&q=80',
    linkUrl: 'https://www.instagram.com/osakafringe',
    type: 'instagram',
    alt: 'Osaka Fringe Official Instagram',
    description: '最新の公演写真や舞台裏動画を毎日配信中。#OsakaFringe で投稿しよう！',
    descriptionEn: 'Daily show photos, backstage stories and live highlights. Tag #OsakaFringe!',
  },
  {
    id: 'banner-tourism',
    title: '大阪観光局 公式ポータルサイト',
    titleEn: 'Osaka Convention & Tourism Bureau Official Portal',
    imageUrl: 'https://images.unsplash.com/photo-1590559899731-a382839e5549?auto=format&fit=crop&w=800&q=80',
    linkUrl: 'https://osaka-info.jp/',
    type: 'tourism_osaka',
    alt: 'Osaka Convention & Tourism Bureau',
    description: '大阪のグルメ・観光・宿泊・文化情報を網羅する公式観光ガイド。',
    descriptionEn: 'Your essential guide to Osaka tourism, food culture, accommodations, and city attractions.',
  },
];

export const mockSiteInfo: SiteInfo = {
  siteTitle: 'OSAKA FRINGE FESTIVAL 2026',
  siteTitleEn: 'OSAKA FRINGE FESTIVAL 2026',
  heroTagline: '熱気と驚きが交差する、大阪の街角ステージ',
  heroTaglineEn: 'Where Energy Meets Wonder: Osaka Street Stage',
  heroSubtitle: '世界中から集まるアーティストと観客が創るオープンアートフェスティバル',
  heroSubtitleEn: 'An open-access performing arts festival created by global artists & audience',
  festivalPeriod: '2026年9月18日(金) 〜 9月21日(月・祝)',
  festivalPeriodEn: 'September 18 (Fri) – September 21 (Mon), 2026',
  locationSummary: '大阪市内各所（中崎町・心斎橋・中之島・天王寺）',
  locationSummaryEn: 'Various Osaka Venues (Nakazakicho, Shinsaibashi, Nakanoshima, Tennoji)',
  aboutTitle: 'Osaka Fringe Festival とは',
  aboutTitleEn: 'What is Osaka Fringe Festival?',
  aboutText: `大阪フリンジフェスティバルは、世界基準の「オープンアクセス（審査なしの表現の自由）」精神を受け継ぎ、大阪の街全体を舞台に変える舞台芸術の祭典です。

劇場だけでなく、路地裏の古民家、カフェ、水辺のテラス、ビルの屋上まで、あらゆる空間がステージになります。

演劇、ダンス、大道芸、音楽、古典芸能、紙芝居、作品展示など、ジャンルの垣根を超えた表現者たちと観客がダイレクトに出会い、熱気と感動を分かち合います。`,
  aboutTextEn: `The Osaka Fringe Festival is an open-access performing arts celebration inspired by global fringe traditions, transforming the entire city into an interconnected playground of creativity.

Beyond conventional theaters, our stages include converted heritage houses, alleyways, waterfront terraces, cafes, and creative rooftops.

Featuring theater, contemporary dance, street circus, music, traditional arts, kamishibai, and art exhibitions, artists and audiences collide directly to share unforgettable moments.`,
  donationTitle: '大阪フリンジを育てる寄付・サポーター募集',
  donationTitleEn: 'Support Osaka Fringe: Donations & Partnership',
  donationText: `大阪フリンジフェスティバルは、挑戦的な表現者を支え、誰もが気軽にアートと出会える街をつくるための非営利アートプロジェクトです。

いただいたご寄付は、若手アーティストの参加支援、会場設営費、多言語アクセシビリティ環境の向上に大切に活用させていただきます。`,
  donationTextEn: `The Osaka Fringe Festival is a non-profit initiative dedicated to empowering emerging creators and making performing arts accessible to everyone.

Your generous contributions directly support artist subsidies, venue technical setups, and multilingual visitor infrastructure.`,
  donationBankInfo: `【振込先口座】
りそな銀行 大阪営業部（普）1234567
口座名義：オオサカフリンジジッコウイインカイ`,
  donationBankInfoEn: `[Bank Details]
Resona Bank, Osaka Main Branch (Ordinary) #1234567
Account Name: OSAKA FRINGE FESTIVAL JIKKOU IINKAI`,
  donationCrowdfundingUrl: 'https://camp-fire.jp/example-osaka-fringe',
  googleFormUrl: 'https://docs.google.com/forms/d/e/1FAIpQLScX_ExampleFormId/viewform?embedded=true',
  officialInstagramUrl: 'https://www.instagram.com/osakafringe',
  officialXUrl: 'https://twitter.com/osakafringe',
  officialWebsiteUrl: 'https://osakafringe.com',
  contactEmail: 'info@osakafringe.com',
  awardsEnabled: false, // 過去アワードがないため、今年は非表示
};