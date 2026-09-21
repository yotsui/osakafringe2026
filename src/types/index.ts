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
  venueType?: 'CORE' | 'LOCAL' | 'HISTORICAL' | string;
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

// アーティスト分類・規定8ジャンル
export type ArtistGenre = 
  | 'street'      // 大道芸
  | 'dance'       // ダンス
  | 'music'       // 音楽
  | 'theater'     // 演劇・パフォーマンス
  | 'traditional' // 古典芸能
  | 'kamishibai'  // 紙芝居
  | 'exhibition'  // 作品展示
  | 'other';      // その他

// 互換性のための型エイリアス
export type PerformanceGenre = ArtistGenre;
export type Genre = ArtistGenre;

export interface Artist {
  id: string;
  name: string;
  nameEn?: string;
  origin?: string; // 拠点・出身 (例: "大阪 / 日本", "UK / Australia")
  originEn?: string;
  genre: ArtistGenre;
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
}

export interface PerformanceSchedule {
  id?: string;
  date: string; // YYYY-MM-DD (Asia/Tokyo)
  openTime?: string; // HH:mm (Asia/Tokyo) - 開場時刻
  startTime: string; // HH:mm (Asia/Tokyo)
  endDate?: string; // YYYY-MM-DD (Asia/Tokyo) - 終了日
  endTime?: string; // HH:mm (Asia/Tokyo) - 終了時刻
  rawDate?: string; // microCMSの日時型（ISO 8601）
  rawEndDate?: string; // microCMSの終了日時型（ISO 8601）
  venueId?: string; // 日程別会場ID（未指定の場合はメイン会場）
  venueName?: string;
  venueNameEn?: string;
  venue?: Venue;
  ticketPrice?: string;
  ticketUrl?: string;
  note?: string;
}

export interface PerformanceDateCustomField {
  fieldId?: string;
  id?: string;
  date?: string; // ISO 8601 開始日時文字列
  date_end?: string; // ISO 8601 終了日時文字列
  open_date?: string; // 開場日時
  venue?: Venue | string | { id: string }; // 会場参照（未指定時は null/undefined）
  venueId?: string;
  note?: string;
  ticketPrice?: string;
  ticketUrl?: string;
  startAt?: string;
  endAt?: string;
  startDate?: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  openTime?: string;
  time?: string;
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
  genre?: string;
  genreEn?: string;
  genreCustom?: string;
  genreCustomEn?: string;
  description: string;
  descriptionEn?: string;

  // チケット・メディア・その他
  ticketPrice?: string;
  ticketPriceEn?: string;
  ticketUrl?: string;
  flyer?: string;
  image?: string;
  images?: string[];
  isFeatured?: boolean;
  durationMinutes?: number;

  // トップレベルの開場時間（フォールバック用）
  open?: string;
  open_date?: string;

  // 連携イベント・パートナー
  partner?: Partner | string;
  partnerId?: string;

  // microCMS 日時メタデータ（新着順ソート用）
  publishedAt?: string;
  createdAt?: string;
}

export type PerformanceTimingStatus = 'ongoing' | 'upcoming' | 'no_schedule' | 'ended';

export interface PerformanceTimingInfo {
  status: PerformanceTimingStatus;
  isOngoing: boolean;
  isUpcoming: boolean;
  hasNoSchedule: boolean;
  isPast: boolean; // isEnded と同義
  isToday: boolean;
  closestOngoingEndMs: number;
  nextStartMs: number;
  lastEndMs: number;
  nextSchedule?: PerformanceSchedule;
}

export type PerformanceSortOption = 'date' | 'featured' | 'newest' | 'title';

export type PartnerCategory =
  | '組織（後援・協力）'
  | '連携イベント・フェス'
  | '会場協力'
  | 'スポンサー'
  | string;

export interface Partner {
  id: string;
  name: string;
  nameEn?: string;
  category: PartnerCategory;
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

export type DonationStoryKey =
  | 'HISTORY'
  | 'MESSAGE'
  | 'ENVIRONMENT'
  | 'PREFORM'
  | 'CLOSING';

export interface DonationStoryRaw {
  fieldId?: string;
  sectionKey: string[] | string;
  title: string;
  titleEn?: string;
  text: string;
  textEn?: string;
}

export interface DonationStory {
  fieldId?: 'donationstory';
  sectionKey: DonationStoryKey;
  title: string;
  titleEn?: string;
  text: string;
  textEn?: string;
}

export interface DonationImpact {
  fieldId?: 'donationimpact';
  label?: string;
  title: string;
  titleEn?: string;
  text: string;
  textEn?: string;
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
  donationStories?: DonationStory[];
  donationImpacts?: DonationImpact[];
  donationBankNote?: string;
  donationBankNoteEn?: string;
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

  // OSAKA FRINGE AWARDS 2026
  awardsInfo?: AwardInfo;
  awardsSections?: AwardSection[];
  awardsEditor?: AwardPerson;
  awardsMembers?: AwardPerson[];
}

export interface AwardInfo {
  enabled?: boolean;
  title?: string;
  titleEn?: string;
  tagline?: string;
  taglineEn?: string;
  summary?: string;
  summaryEn?: string;
  notice?: string;
  noticeEn?: string;
}

export interface AwardSection {
  title: string;
  titleEn?: string;
  text: string;
  textEn?: string;
}

export interface AwardPerson {
  name: string;
  nameEn?: string;
  role: string;
  roleEn?: string;
  title?: string;
  titleEn?: string;
  profile?: string;
  profileEn?: string;
  photo?: string;
}