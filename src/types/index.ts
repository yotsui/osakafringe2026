export type Language = 'ja' | 'en';

export interface Location {
  lat: number;
  lng: number;
}

export interface Venue {
  id: string;
  name: string;
  nameEn?: string;
  area: string;
  areaEn?: string;
  address: string;
  addressEn?: string;
  access: string;
  accessEn?: string;
  description?: string;
  descriptionEn?: string;
  location: Location;
  lat?: number;
  lng?: number;
  websiteUrl?: string;
  snsTwitter?: string;
  snsInstagram?: string;
  snsFacebook?: string;
  snsOther?: string;
  images?: string[]; // 最大3枚
  image?: string;    // メイン写真
  capacity?: number;
}

// ユーザー指定の8大ジャンル
export type PerformanceGenre = 
  | 'street'      // 大道芸
  | 'dance'       // ダンス
  | 'music'       // 音楽
  | 'theater'     // 演劇・パフォーマンス
  | 'traditional' // 古典芸能
  | 'kamishibai'  // 紙芝居
  | 'exhibition'  // 作品展示
  | 'other';      // その他

export interface Artist {
  id: string;
  name: string;
  nameEn?: string;
  origin?: string; // 拠点・出身 (例: "大阪 / 日本", "UK / Australia")
  originEn?: string;
  genre?: PerformanceGenre;
  profile: string;
  profileEn?: string;
  image?: string;
  images?: string[];
  websiteUrl?: string;
  snsTwitter?: string;
  snsInstagram?: string;
  snsYoutube?: string;
  snsFacebook?: string;
  snsOther?: string;
  isFeatured?: boolean;
}

export interface PerformanceSchedule {
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  venueId?: string; // 公演日時に会場が紐づく
  venueName?: string;
  venueNameEn?: string;
  note?: string;
}

export interface Performance {
  id: string;
  title: string;
  titleEn?: string;
  artistId: string;
  artist?: Artist;
  artistName?: string; // フォールバック・互換用 (artist.name)
  artistNameEn?: string;
  genre: PerformanceGenre;
  genreCustom?: string;
  genreCustomEn?: string;
  description: string;
  descriptionEn?: string;
  venueId?: string; // デフォルト会場（または主要会場）
  venue?: Venue;
  schedules: PerformanceSchedule[]; // 各スケジュールに venueId が紐づく
  ticketPrice?: string;
  ticketPriceEn?: string;
  ticketUrl?: string; // 空の場合は非表示
  image: string;      // メインビジュアル
  images?: string[];  // 追加ギャラリー写真
  isFeatured?: boolean;
  durationMinutes?: number;
}

export interface Partner {
  id: string;
  name: string;
  nameEn?: string;
  image: string;
  url: string;
  description?: string;
  descriptionEn?: string;
  category?: string;
}

export interface Banner {
  id: string;
  title: string;
  titleEn?: string;
  imageUrl: string;
  linkUrl: string;
  type: 'instagram' | 'tourism_osaka' | 'sponsor' | 'partner';
  alt: string;
  description?: string;
  descriptionEn?: string;
}

export interface SiteInfo {
  siteTitle: string;
  siteTitleEn?: string;
  heroTagline: string;
  heroTaglineEn?: string;
  heroSubtitle: string;
  heroSubtitleEn?: string;
  festivalPeriod: string;
  festivalPeriodEn?: string;
  locationSummary: string;
  locationSummaryEn?: string;
  aboutTitle: string;
  aboutTitleEn?: string;
  aboutText: string;
  aboutTextEn?: string;
  donationTitle: string;
  donationTitleEn?: string;
  donationText: string;
  donationTextEn?: string;
  donationBankInfo?: string;
  donationBankInfoEn?: string;
  newsNotice?: string;
  newsNoticeEn?: string;
  newsNoticeUrl?: string;
  officialInstagramUrl?: string;
  officialXUrl?: string;
  officialWebsiteUrl?: string;
  contactEmail?: string;
}