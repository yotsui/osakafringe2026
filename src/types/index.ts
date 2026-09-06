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
  rawDate?: string; // microCMSの日時型（ISO 8601）
  venueId?: string; // 日程別会場ID（未指定の場合はメイン会場）
  venueName?: string;
  venueNameEn?: string;
  venue?: Venue;
  note?: string;
}

export interface PerformanceDateCustomField {
  fieldId?: string;
  date?: string; // ISO 8601 日時文字列
  venue?: Venue | string; // 会場参照（未指定時は null/undefined）
}

export interface Performance {
  id: string;
  title: string;
  titleEn?: string;
  
  // アーティスト参照
  artists?: Artist | string;
  artistId?: string;
  artist?: Artist;
  artistName?: string;
  artistNameEn?: string;

  // メイン会場参照
  venue?: Venue;
  venueId?: string;
  venueName?: string;
  venueNameEn?: string;

  // 公演日程リピーター
  dates?: PerformanceDateCustomField[];
  schedules: PerformanceSchedule[]; // タイムライン/カレンダー用パース済み配列

  // ジャンル・説明
  genre: PerformanceGenre | string;
  genreEn?: string;
  genreCustom?: string;
  genreCustomEn?: string;
  description: string;
  descriptionEn?: string;

  // チケット・メディア・その他
  ticketPrice?: string;
  ticketPriceEn?: string;
  ticketUrl?: string;
  image?: string;
  images?: string[];
  isFeatured?: boolean;
  durationMinutes?: number;
}

export interface Partner {
  id: string;
  name: string;
  nameEn?: string;
  category: 'platinum' | 'gold' | 'silver' | 'bronze' | 'media' | 'supporter' | 'tourism' | 'partner_event';
  logoUrl?: string;
  image?: string;
  url?: string;
  websiteUrl?: string;
  description?: string;
  descriptionEn?: string;
}

export interface Banner {
  id: string;
  title: string;
  titleEn?: string;
  description?: string;
  descriptionEn?: string;
  imageUrl?: string;
  image?: string;
  alt?: string;
  url?: string;
  linkUrl?: string;
  type?: string;
  target?: '_blank' | '_self';
  position?: 'top' | 'middle' | 'bottom' | 'sidebar';
}

export interface SiteInfo {
  siteTitle?: string;
  siteTitleEn?: string;
  festivalName?: string;
  festivalNameEn?: string;
  theme?: string;
  themeEn?: string;
  heroTagline?: string;
  heroTaglineEn?: string;
  heroSubtitle?: string;
  heroSubtitleEn?: string;
  festivalPeriod?: string;
  festivalPeriodEn?: string;
  locationSummary?: string;
  locationSummaryEn?: string;
  aboutTitle?: string;
  aboutTitleEn?: string;
  aboutText?: string;
  aboutTextEn?: string;
  donationTitle?: string;
  donationTitleEn?: string;
  donationText?: string;
  donationTextEn?: string;
  donationBankInfo?: string;
  donationBankInfoEn?: string;
  newsNotice?: string;
  newsNoticeEn?: string;
  startDate?: string;
  endDate?: string;
  contactEmail?: string;
  officialWebsiteUrl?: string;
  officialInstagramUrl?: string;
  officialXUrl?: string;
  donationAccount?: {
    bankName: string;
    branchName: string;
    accountType: string;
    accountNumber: string;
    accountHolder: string;
  };
  socialLinks?: {
    twitter?: string;
    instagram?: string;
    youtube?: string;
    facebook?: string;
  };
}