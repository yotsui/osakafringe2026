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

export interface PerformanceSchedule {
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  venueId?: string; // 公演日時に会場が紐づく
  venueName?: string;
  venueNameEn?: string;
  note?: string;
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

export interface Performance {
  id: string;
  title: string;
  titleEn?: string;
  artistName: string;
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
  websiteUrl?: string;
  snsTwitter?: string;
  snsInstagram?: string;
  snsYoutube?: string;
  image: string;
  isFeatured?: boolean;
  durationMinutes?: number;
}

export interface Award {
  id: string;
  year: number;
  awardName?: string;
  awardNameEn?: string;
  title?: string;
  titleEn?: string;
  category: string;
  categoryEn?: string;
  winnerName?: string;
  winnerNameEn?: string;
  winner?: string;
  winnerEn?: string;
  performanceTitle?: string;
  performanceTitleEn?: string;
  workTitle?: string;
  workTitleEn?: string;
  comment: string;
  commentEn?: string;
  image?: string;
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
  order?: number;
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
  donationCrowdfundUrl?: string;
  donationCrowdfundingUrl?: string;
  googleFormUrl?: string;
  newsNotice?: string;
  newsNoticeEn?: string;
  newsNoticeUrl?: string;
  officialInstagramUrl?: string;
  officialXUrl?: string;
  officialWebsiteUrl?: string;
  contactEmail?: string;
  awardsEnabled?: boolean; // 今年のアワード非表示フラグ（デフォルトfalse）
}