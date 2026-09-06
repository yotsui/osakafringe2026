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
  venueId?: string; // 会場IDまたは名前
  venueName?: string;
  venueNameEn?: string;
  note?: string;
}

export interface Performance {
  id: string;
  title: string;
  titleEn?: string;
  genre: PerformanceGenre;
  genreCustom?: string;
  genreCustomEn?: string;
  description: string;
  descriptionEn?: string;

  // アーティスト直接記入情報
  artistId?: string;
  artistName: string;
  artistNameEn?: string;
  artistOrigin?: string;
  artistOriginEn?: string;
  artistProfile?: string;
  artistProfileEn?: string;
  artistWebsite?: string;
  artistTwitter?: string;
  artistInstagram?: string;
  artistYoutube?: string;
  artist?: Artist; // 内部合成・互換用

  // 会場直接記入情報
  venueId?: string;
  venueName: string;
  venueNameEn?: string;
  venueArea?: string;
  venueAreaEn?: string;
  venueAddress?: string;
  venueAddressEn?: string;
  venueAccess?: string;
  venueAccessEn?: string;
  venueLat?: number;
  venueLng?: number;
  venue?: Venue; // 内部合成・互換用

  // 日程・スケジュール情報
  scheduleDates?: string;
  scheduleDatesEn?: string;
  scheduleDetails?: string;
  schedules: PerformanceSchedule[]; // タイムライン/カレンダー用パース済み配列

  // チケット・メディア
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