import { cache } from 'react';
import { createClient } from 'microcms-js-sdk';
import {
  Venue,
  Artist,
  Performance,
  Banner,
  SiteInfo,
  PerformanceSchedule,
  PerformanceDateCustomField,
  Partner,
  DonationStory,
  DonationImpact,
  DonationStoryKey,
  Genre,
} from '@/types';
import { mockVenues, mockArtists, mockPerformances, mockBanners, mockSiteInfo, mockPartners } from './mockData';

const REVALIDATE_TIME = 300; // 5分キャッシュ (ISR)

const rawServiceDomain = process.env.MICROCMS_SERVICE_DOMAIN || '';
// URL形式（https://xxx.microcms.io/）が渡された場合もサブドメイン部分（xxx）を安全に抽出
export const serviceDomain = rawServiceDomain
  .trim()
  .replace(/^https?:\/\//i, '')
  .replace(/\.microcms\.io\/?$/i, '')
  .replace(/\/$/, '');

const apiKey = (process.env.MICROCMS_API_KEY || '').trim();

export const isMicroCMSConfigured = Boolean(serviceDomain && apiKey);

export const client = isMicroCMSConfigured
  ? createClient({
      serviceDomain,
      apiKey,
    })
  : null;

interface MicroCMSMedia {
  url?: string;
  height?: number;
  width?: number;
}

interface RawVenueData {
  id: string;
  name: string;
  nameEn?: string;
  area: string;
  areaEn?: string;
  address: string;
  addressEn?: string;
  access?: string;
  accessEn?: string;
  description?: string;
  descriptionEn?: string;
  venueType?: string;
  websiteUrl?: string;
  snsTwitter?: string;
  snsInstagram?: string;
  lat?: number | string;
  lng?: number | string;
  location?: { lat: number; lng: number };
  image?: string | MicroCMSMedia;
  images?: Array<string | MicroCMSMedia>;
}

interface RawArtistData {
  id: string;
  name: string;
  nameEn?: string;
  origin?: string;
  originEn?: string;
  profile?: string;
  profileEn?: string;
  websiteUrl?: string;
  snsTwitter?: string;
  snsInstagram?: string;
  snsYoutube?: string;
  snsFacebook?: string;
  image?: string | MicroCMSMedia;
  images?: Array<string | MicroCMSMedia>;
}

interface RawDateItem {
  id?: string;
  fieldId?: string;
  date?: string;
  date_end?: string;
  datetime?: string;
  startTime?: string;
  start_time?: string;
  endTime?: string;
  end_time?: string;
  startAt?: string;
  start_at?: string;
  endAt?: string;
  end_at?: string;
  startDate?: string;
  start_date?: string;
  endDate?: string;
  end_date?: string;
  time?: string;
  ticketPrice?: string;
  ticketUrl?: string;
  venueId?: string | { id: string };
  venue?: Venue | { id: string } | string;
  note?: string;
}

interface RawPerformanceData {
  id: string;
  title: string;
  titleEn?: string;
  genre?: string | string[];
  genreCustom?: string;
  genreCustomEn?: string;
  description?: string;
  descriptionEn?: string;
  ticketPrice?: string;
  ticketPriceEn?: string;
  ticketUrl?: string;
  durationMinutes?: number;
  isFeatured?: boolean;
  artists?: Artist | string | { id: string };
  artistId?: string;
  artist?: Artist | string | { id: string };
  artistName?: string;
  artistNameEn?: string;
  venue?: Venue | string | { id: string };
  venueId?: string;
  venueName?: string;
  venueNameEn?: string;
  date?: string;
  date_end?: string;
  datetime?: string;
  startDate?: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  dates?: RawDateItem[] | RawDateItem | string;
  schedules?: RawDateItem[] | RawDateItem | string;
  partner?: Partner | string | { id: string };
  partnerId?: string;
  image?: string | MicroCMSMedia;
  images?: Array<string | MicroCMSMedia>;
}

interface RawPartnerData {
  id: string;
  name: string;
  nameEn?: string;
  description?: string;
  descriptionEn?: string;
  category?: string | string[];
  url?: string;
  websiteUrl?: string;
  linkUrl?: string;
  image?: string | MicroCMSMedia;
}

interface RawStoryData {
  fieldId?: string;
  sectionKey?: string | string[];
  title?: string;
  titleEn?: string;
  text?: string;
  textEn?: string;
}

interface RawImpactData {
  fieldId?: string;
  label?: string;
  title?: string;
  titleEn?: string;
  text?: string;
  textEn?: string;
}

interface RawSiteInfoData {
  siteTitle?: string;
  siteTitleEn?: string;
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
  donationBankNote?: string;
  donationBankNoteEn?: string;
  donationBankInfo?: string;
  donationBankInfoEn?: string;
  newsNotice?: string;
  newsNoticeEn?: string;
  donationStories?: RawStoryData[];
  donationImpacts?: RawImpactData[];
  contents?: RawSiteInfoData[];
}

/**
 * microCMSのメディア型 { url: string } または文字列から画像URLを抽出
 */
function extractImageUrl(media: unknown): string | undefined {
  if (!media) return undefined;
  if (typeof media === 'string') return media;
  if (typeof media === 'object' && media !== null && 'url' in media) {
    return (media as { url: string }).url;
  }
  return undefined;
}

/**
 * 有効なURL文字列のみを抽出（空文字、#、null、undefined、なし等を安全に除外）
 */
export function cleanUrl(url: unknown): string | undefined {
  if (!url || typeof url !== 'string') return undefined;
  const trimmed = url.trim();
  if (
    trimmed === '' ||
    trimmed === '#' ||
    trimmed === 'null' ||
    trimmed === 'undefined' ||
    trimmed === 'なし' ||
    trimmed === 'None' ||
    trimmed === 'http://' ||
    trimmed === 'https://'
  ) {
    return undefined;
  }
  if (!/^https?:\/\//i.test(trimmed)) {
    return undefined;
  }
  return trimmed;
}

/**
 * 会場のデフォルト座標マッピング
 */
const DEFAULT_COORDINATES: Record<string, { lat: number; lng: number }> = {
  'nakazaki-hall': { lat: 34.7065, lng: 135.5032 },
  'shinsaibashi-under': { lat: 34.6722, lng: 135.4983 },
  'nakanoshima-bank': { lat: 34.6937, lng: 135.5042 },
  'tennoji-warehouse': { lat: 34.6515, lng: 135.5135 },
};

/**
 * 会場一覧を取得 (React cache & ISR 300s)
 */
export const getVenues = cache(async (): Promise<Venue[]> => {
  const normalizeVenue = (v: RawVenueData): Venue => {
    const imgUrl = extractImageUrl(v.image);
    const lat = v.lat != null && v.lat !== '' ? Number(v.lat) : (v.location?.lat ?? DEFAULT_COORDINATES[v.id]?.lat ?? 34.6937);
    const lng = v.lng != null && v.lng !== '' ? Number(v.lng) : (v.location?.lng ?? DEFAULT_COORDINATES[v.id]?.lng ?? 135.5023);
    const coords = { lat, lng };

    const images = Array.isArray(v.images)
      ? (v.images.map(extractImageUrl).filter(Boolean) as string[])
      : (imgUrl ? [imgUrl] : []);

    return {
      id: v.id,
      name: v.name,
      nameEn: v.nameEn || v.name,
      area: v.area,
      areaEn: v.areaEn || v.area,
      address: v.address,
      addressEn: v.addressEn || v.address,
      access: v.access || '',
      accessEn: v.accessEn || v.access || '',
      description: v.description || '',
      descriptionEn: v.descriptionEn || v.description || '',
      venueType: v.venueType || undefined,
      websiteUrl: cleanUrl(v.websiteUrl),
      snsTwitter: cleanUrl(v.snsTwitter),
      snsInstagram: cleanUrl(v.snsInstagram),
      lat,
      lng,
      image: imgUrl,
      location: coords,
      images,
    };
  };

  let rawList: RawVenueData[] = mockVenues;
  if (client) {
    try {
      const data = await client.getList<RawVenueData>({
        endpoint: 'venues',
        queries: { limit: 100 },
        customRequestInit: { next: { revalidate: REVALIDATE_TIME } },
      });
      if (data.contents && data.contents.length > 0) {
        rawList = data.contents;
      }
    } catch (error) {
      console.warn('[MicroCMS] Failed to fetch venues, using mock data:', error);
    }
  }

  return rawList.map(normalizeVenue);
});

/**
 * 会場詳細を取得
 */
export const getVenueById = cache(async (id: string): Promise<Venue | undefined> => {
  const venues = await getVenues();
  return venues.find((v) => v.id === id);
});

/**
 * アーティスト一覧を取得 (React cache & ISR 300s)
 */
export const getArtists = cache(async (): Promise<Artist[]> => {
  const normalizeArtist = (a: RawArtistData): Artist => {
    const imgUrl = extractImageUrl(a.image);
    const images = Array.isArray(a.images)
      ? (a.images.map(extractImageUrl).filter(Boolean) as string[])
      : (imgUrl ? [imgUrl] : []);

    return {
      id: a.id,
      name: a.name,
      nameEn: a.nameEn || a.name,
      origin: a.origin,
      originEn: a.originEn || a.origin,
      profile: a.profile || '',
      profileEn: a.profileEn || a.profile || '',
      websiteUrl: cleanUrl(a.websiteUrl),
      snsTwitter: cleanUrl(a.snsTwitter),
      snsInstagram: cleanUrl(a.snsInstagram),
      snsYoutube: cleanUrl(a.snsYoutube),
      snsFacebook: cleanUrl(a.snsFacebook),
      image: imgUrl,
      images,
    };
  };

  let rawList: RawArtistData[] = mockArtists;
  if (client) {
    try {
      const data = await client.getList<RawArtistData>({
        endpoint: 'artists',
        queries: { limit: 100 },
        customRequestInit: { next: { revalidate: REVALIDATE_TIME } },
      });
      if (data.contents && data.contents.length > 0) {
        rawList = data.contents;
      }
    } catch (error) {
      console.warn('[MicroCMS] Failed to fetch artists, using mock data:', error);
    }
  }

  return rawList.map(normalizeArtist);
});

/**
 * アーティスト詳細を取得
 */
export const getArtistById = cache(async (id: string): Promise<Artist | undefined> => {
  const artists = await getArtists();
  return artists.find((a) => a.id === id);
});

/**
 * 公演一覧を取得 (会場情報およびアーティスト情報をマージ & React cache & ISR 300s)
 */
export const getPerformances = cache(async (): Promise<Performance[]> => {
  const [venues, artists, partners] = await Promise.all([
    getVenues(),
    getArtists(),
    getPartners(),
  ]);

  const venueMap = new Map(venues.map((v) => [v.id, v]));
  const artistMap = new Map(artists.map((a) => [a.id, a]));
  const partnerMap = new Map(partners.map((p) => [p.id, p]));

  const normalizePerformance = (perf: RawPerformanceData): Performance => {
    // 1. 画像URLの正規化
    const imgUrl = extractImageUrl(perf.image);

    // 2. アーティスト参照の解決
    let resolvedArtist: Artist | undefined = undefined;
    let resolvedArtistId = '';

    if (perf.artists && typeof perf.artists === 'object' && 'id' in perf.artists) {
      resolvedArtist = artistMap.get(perf.artists.id) || (perf.artists as Artist);
      resolvedArtistId = perf.artists.id;
    } else if (typeof perf.artists === 'string' && perf.artists.trim()) {
      resolvedArtist = artistMap.get(perf.artists.trim());
      resolvedArtistId = perf.artists.trim();
    } else if (perf.artist && typeof perf.artist === 'object' && 'id' in perf.artist) {
      resolvedArtist = artistMap.get(perf.artist.id) || (perf.artist as Artist);
      resolvedArtistId = perf.artist.id;
    } else if (typeof perf.artistId === 'string' && perf.artistId.trim()) {
      resolvedArtist = artistMap.get(perf.artistId.trim());
      resolvedArtistId = perf.artistId.trim();
    }

    const artistName = resolvedArtist?.name || perf.artistName || '出演アーティスト';
    const artistNameEn = resolvedArtist?.nameEn || perf.artistNameEn || artistName;

    // 3. メイン会場参照の解決
    let mainVenue: Venue | undefined = undefined;
    let mainVenueId = '';

    if (perf.venue && typeof perf.venue === 'object' && 'id' in perf.venue) {
      mainVenue = venueMap.get(perf.venue.id) || (perf.venue as Venue);
      mainVenueId = perf.venue.id;
    } else if (typeof perf.venue === 'string' && perf.venue.trim()) {
      mainVenue = venueMap.get(perf.venue.trim());
      mainVenueId = perf.venue.trim();
    } else if (typeof perf.venueId === 'string' && perf.venueId.trim()) {
      mainVenue = venueMap.get(perf.venueId.trim());
      mainVenueId = perf.venueId.trim();
    }

    const venueName = mainVenue?.name || perf.venueName || '特設会場';
    const venueNameEn = mainVenue?.nameEn || perf.venueNameEn || venueName;

    // 4. 公演日程（dates リピーターまたは schedules 配列、もしくはルート日付）の展開と解決
    let rawDateItems: RawDateItem[] = [];

    if (Array.isArray(perf.dates) && perf.dates.length > 0) {
      rawDateItems = perf.dates;
    } else if (perf.dates && typeof perf.dates === 'object' && !Array.isArray(perf.dates)) {
      rawDateItems = [perf.dates as RawDateItem];
    } else if (Array.isArray(perf.schedules) && perf.schedules.length > 0) {
      rawDateItems = perf.schedules;
    } else if (perf.schedules && typeof perf.schedules === 'object' && !Array.isArray(perf.schedules)) {
      rawDateItems = [perf.schedules as RawDateItem];
    } else if (typeof perf.dates === 'string' && perf.dates.trim()) {
      try {
        const parsed = JSON.parse(perf.dates);
        rawDateItems = Array.isArray(parsed) ? (parsed as RawDateItem[]) : [parsed as RawDateItem];
      } catch (e) {
        console.warn(`[MicroCMS] Failed to parse dates JSON for ${perf.id}:`, e);
      }
    } else if (typeof perf.schedules === 'string' && perf.schedules.trim()) {
      try {
        const parsed = JSON.parse(perf.schedules);
        rawDateItems = Array.isArray(parsed) ? (parsed as RawDateItem[]) : [parsed as RawDateItem];
      } catch (e) {
        console.warn(`[MicroCMS] Failed to parse schedules JSON for ${perf.id}:`, e);
      }
    }

    // ルートフィールドに日付がある場合のフォールバック
    if (rawDateItems.length === 0 && (perf.date || perf.startDate || perf.datetime)) {
      rawDateItems = [{
        date: perf.date || perf.datetime,
        startDate: perf.startDate,
        endDate: perf.endDate,
        date_end: perf.date_end,
        startTime: perf.startTime,
        endTime: perf.endTime,
      }];
    }

    const formatJST = (d: Date) => {
      const dateStr = new Intl.DateTimeFormat('ja-JP', {
        timeZone: 'Asia/Tokyo',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).format(d).replace(/\//g, '-');

      const timeStr = new Intl.DateTimeFormat('ja-JP', {
        timeZone: 'Asia/Tokyo',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }).format(d);

      return { dateStr, timeStr };
    };

    const enrichedSchedules: PerformanceSchedule[] = [];

    if (Array.isArray(rawDateItems) && rawDateItems.length > 0) {
      for (const item of rawDateItems) {
        if (!item || typeof item !== 'object') continue;

        // 会場の解決: item.venue が未指定の場合はメイン会場 mainVenue を参照
        let scheduleVenue: Venue | undefined = mainVenue;
        let sVenueId = mainVenueId;

        const rawItemVenue = item.venue || item.venueId;
        if (rawItemVenue && typeof rawItemVenue === 'object' && 'id' in rawItemVenue) {
          scheduleVenue = venueMap.get(rawItemVenue.id) || (rawItemVenue as Venue);
          sVenueId = rawItemVenue.id;
        } else if (typeof rawItemVenue === 'string' && rawItemVenue.trim()) {
          scheduleVenue = venueMap.get(rawItemVenue.trim());
          sVenueId = rawItemVenue.trim();
        }

        const sVenueName = scheduleVenue?.name || venueName;
        const sVenueNameEn = scheduleVenue?.nameEn || venueNameEn;

        // 日付・時刻の抽出
        const rawStart = (item.date || item.datetime || item.startDate || item.startAt || item.start_date || item.start_at || '').trim();
        const rawEnd = (item.date_end || item.endDate || item.endAt || item.end_date || item.end_at || '').trim();
        const directStartTime = (item.startTime || item.start_time || item.time || '').trim();
        const directEndTime = (item.endTime || item.end_time || '').trim();

        if (!rawStart && !directStartTime) {
          continue;
        }

        let dateStr = '';
        let sTime = directStartTime;
        let endDateStr: string | undefined = undefined;
        let eTime = directEndTime;

        // 1. rawStartが日付のみ（YYYY-MM-DD または YYYY/MM/DD）の形式の場合
        if (/^\d{4}[-/]\d{1,2}[-/]\d{1,2}$/.test(rawStart)) {
          dateStr = rawStart.replace(/\//g, '-');
        } 
        // 2. rawStartがISO日時文字列等の場合
        else if (rawStart) {
          const startDateObj = new Date(rawStart);
          if (!isNaN(startDateObj.getTime())) {
            const formatted = formatJST(startDateObj);
            dateStr = formatted.dateStr;
            if (!sTime) {
              sTime = formatted.timeStr;
            }
          } else {
            dateStr = rawStart;
          }
        }

        // 終了日時・時刻の解決
        if (rawEnd) {
          if (/^\d{4}[-/]\d{1,2}[-/]\d{1,2}$/.test(rawEnd)) {
            const cleanEnd = rawEnd.replace(/\//g, '-');
            if (cleanEnd !== dateStr) {
              endDateStr = cleanEnd;
            }
          } else {
            const endDateObj = new Date(rawEnd);
            if (!isNaN(endDateObj.getTime())) {
              const formattedEnd = formatJST(endDateObj);
              if (formattedEnd.dateStr !== dateStr) {
                endDateStr = formattedEnd.dateStr;
              }
              if (!eTime) {
                eTime = formattedEnd.timeStr;
              }
            }
          }
        }

        if (dateStr) {
          enrichedSchedules.push({
            id: item.id || `${perf.id}-${dateStr}-${sTime || '00:00'}`,
            date: dateStr,
            startTime: sTime,
            endDate: endDateStr,
            endTime: eTime,
            rawDate: rawStart || undefined,
            rawEndDate: rawEnd || undefined,
            venueId: sVenueId,
            venueName: sVenueName,
            venueNameEn: sVenueNameEn,
            venue: scheduleVenue,
            ticketPrice: item.ticketPrice || perf.ticketPrice || '',
            ticketUrl: cleanUrl(item.ticketUrl) || cleanUrl(perf.ticketUrl),
            note: item.note || undefined,
          });
        }
      }
    }

    // 6. パートナー団体参照の解決
    let resolvedPartner: Partner | undefined = undefined;
    let resolvedPartnerId = '';
    if (perf.partner && typeof perf.partner === 'object' && 'id' in perf.partner) {
      resolvedPartner = partnerMap.get(perf.partner.id) || (perf.partner as Partner);
      resolvedPartnerId = perf.partner.id;
    } else if (typeof perf.partner === 'string' && perf.partner.trim()) {
      resolvedPartner = partnerMap.get(perf.partner.trim());
      resolvedPartnerId = perf.partner.trim();
    } else if (typeof perf.partnerId === 'string' && perf.partnerId.trim()) {
      resolvedPartner = partnerMap.get(perf.partnerId.trim());
      resolvedPartnerId = perf.partnerId.trim();
    }

    // 7. ジャンルの解決
    let rawGenre = perf.genre;
    if (Array.isArray(rawGenre) && rawGenre.length > 0) {
      rawGenre = rawGenre[0];
    }
    const genreStr = typeof rawGenre === 'string' ? rawGenre.toLowerCase() : 'theater';
    const mainGenre: Genre = (
      ['theater', 'dance', 'comedy', 'music', 'circus', 'art', 'other'].includes(genreStr)
        ? genreStr
        : 'other'
    ) as Genre;

    const customGenre = perf.genreCustom || (mainGenre === 'other' ? 'その他' : undefined);
    const customGenreEn = perf.genreCustomEn || (mainGenre === 'other' ? 'Other' : undefined);

    const images = Array.isArray(perf.images)
      ? (perf.images.map(extractImageUrl).filter(Boolean) as string[])
      : (imgUrl ? [imgUrl] : []);

    return {
      id: perf.id,
      title: perf.title,
      titleEn: perf.titleEn || perf.title,
      genre: mainGenre,
      genreEn: mainGenre,
      genreCustom: customGenre,
      genreCustomEn: customGenreEn,
      description: perf.description || '',
      descriptionEn: perf.descriptionEn || perf.description || '',
      ticketPrice: perf.ticketPrice || '',
      ticketPriceEn: perf.ticketPriceEn || perf.ticketPrice || '',
      ticketUrl: cleanUrl(perf.ticketUrl),
      durationMinutes: typeof perf.durationMinutes === 'number' && perf.durationMinutes > 0 ? perf.durationMinutes : undefined,
      isFeatured: Boolean(perf.isFeatured),
      artists: resolvedArtist || resolvedArtistId,
      artistId: resolvedArtistId,
      artist: resolvedArtist,
      artistName,
      artistNameEn,
      venue: mainVenue,
      venueId: mainVenueId,
      venueName,
      venueNameEn,
      dates: Array.isArray(rawDateItems) ? (rawDateItems as PerformanceDateCustomField[]) : [],
      schedules: enrichedSchedules,
      partner: resolvedPartner,
      partnerId: resolvedPartnerId || undefined,
      image: imgUrl || resolvedArtist?.image || mainVenue?.image || '',
      images,
    };
  };

  let rawList: RawPerformanceData[] = mockPerformances as unknown as RawPerformanceData[];
  if (client) {
    try {
      const data = await client.getList<RawPerformanceData>({
        endpoint: 'performances',
        queries: { limit: 100 },
        customRequestInit: { next: { revalidate: REVALIDATE_TIME } },
      });
      if (data.contents && data.contents.length > 0) {
        rawList = data.contents;
      }
    } catch (error) {
      console.warn('[MicroCMS] Failed to fetch performances, using mock data:', error);
    }
  }

  return rawList.map(normalizePerformance);
});

/**
 * 公演詳細を取得
 */
export const getPerformanceById = cache(async (id: string): Promise<Performance | undefined> => {
  const list = await getPerformances();
  return list.find((p) => p.id === id);
});

/**
 * パートナー/連携団体一覧を取得 (React cache & ISR 300s)
 */
export const getPartners = cache(async (): Promise<Partner[]> => {
  const normalizePartner = (p: RawPartnerData): Partner => {
    let rawCat = p.category;
    if (Array.isArray(rawCat)) {
      rawCat = rawCat[0];
    }
    return {
      id: p.id,
      name: p.name,
      nameEn: p.nameEn || p.name,
      description: p.description || '',
      descriptionEn: p.descriptionEn || p.description || '',
      image: extractImageUrl(p.image) || (typeof p.image === 'string' ? p.image : ''),
      url: p.websiteUrl || p.url || p.linkUrl || '#',
      category: rawCat || '組織（後援・協力）',
    };
  };

  let rawList: RawPartnerData[] = mockPartners;
  if (client) {
    try {
      // 1. まず 'partner' エンドポイントを試行
      const data = await client.getList<RawPartnerData>({
        endpoint: 'partner',
        queries: { limit: 100 },
        customRequestInit: { next: { revalidate: REVALIDATE_TIME } },
      });
      if (data && Array.isArray(data.contents)) {
        rawList = data.contents;
      }
    } catch (error) {
      // 2. 失敗時は 'partners' エンドポイントも試行
      try {
        const dataFallback = await client.getList<RawPartnerData>({
          endpoint: 'partners',
          queries: { limit: 100 },
          customRequestInit: { next: { revalidate: REVALIDATE_TIME } },
        });
        if (dataFallback && Array.isArray(dataFallback.contents)) {
          rawList = dataFallback.contents;
        }
      } catch (err2) {
        console.warn('[MicroCMS] Failed to fetch partners from both "partner" and "partners" endpoints, using mock data:', { error, err2 });
      }
    }
  }

  return rawList.map(normalizePartner);
});

/**
 * バナー一覧を取得 (React cache & ISR 300s)
 */
export const getBanners = cache(async (): Promise<Banner[]> => {
  if (!client) {
    return mockBanners;
  }
  try {
    const data = await client.getList<Banner>({
      endpoint: 'banners',
      queries: { limit: 10 },
      customRequestInit: { next: { revalidate: REVALIDATE_TIME } },
    });
    return data.contents.length > 0 ? data.contents : mockBanners;
  } catch (error) {
    console.warn('[MicroCMS] Failed to fetch banners, using mock data:', error);
    return mockBanners;
  }
});

/**
 * 寄付ストーリーの正規化 (microCMSのselect field配列 -> scalar DonationStoryKey)
 */
export const normalizeDonationStory = (raw: RawStoryData): DonationStory => {
  let sectionKey: DonationStoryKey = 'HISTORY';
  if (Array.isArray(raw?.sectionKey) && raw.sectionKey.length > 0) {
    sectionKey = raw.sectionKey[0] as DonationStoryKey;
  } else if (typeof raw?.sectionKey === 'string' && raw.sectionKey) {
    sectionKey = raw.sectionKey as DonationStoryKey;
  }

  return {
    fieldId: 'donationstory',
    sectionKey,
    title: raw?.title || '',
    titleEn: raw?.titleEn || raw?.title || '',
    text: raw?.text || '',
    textEn: raw?.textEn || raw?.text || '',
  };
};

/**
 * 寄付インパクトの正規化
 */
export const normalizeDonationImpact = (raw: RawImpactData): DonationImpact => ({
  fieldId: 'donationimpact',
  label: raw?.label || '',
  title: raw?.title || '',
  titleEn: raw?.titleEn || raw?.title || '',
  text: raw?.text || '',
  textEn: raw?.textEn || raw?.text || '',
});

/**
 * サイト基本情報を取得 (React cache & ISR 300s)
 */
export const getSiteInfo = cache(async (): Promise<SiteInfo> => {
  if (client) {
    try {
      const data = await client.getObject<RawSiteInfoData>({
        endpoint: 'site_info',
        customRequestInit: { next: { revalidate: REVALIDATE_TIME } },
      });
      let cmsData: RawSiteInfoData | null = null;
      if (data && data.siteTitle) {
        cmsData = data;
      } else if (data && Array.isArray(data.contents) && data.contents.length > 0) {
        cmsData = data.contents[0];
      }

      if (cmsData) {
        const stories: DonationStory[] = Array.isArray(cmsData.donationStories)
          ? cmsData.donationStories.map(normalizeDonationStory)
          : [];
        const impacts: DonationImpact[] = Array.isArray(cmsData.donationImpacts)
          ? cmsData.donationImpacts.map(normalizeDonationImpact)
          : [];

        return {
          ...mockSiteInfo,
          ...cmsData,
          donationStories: stories.length > 0 ? stories : mockSiteInfo.donationStories,
          donationImpacts: impacts.length > 0 ? impacts : mockSiteInfo.donationImpacts,
          siteTitle: cmsData.siteTitle || mockSiteInfo.siteTitle,
          siteTitleEn: cmsData.siteTitleEn || cmsData.siteTitle || mockSiteInfo.siteTitleEn,
          heroTagline: cmsData.heroTagline || mockSiteInfo.heroTagline,
          heroTaglineEn: cmsData.heroTaglineEn || cmsData.heroTagline || mockSiteInfo.heroTaglineEn,
          heroSubtitle: cmsData.heroSubtitle || mockSiteInfo.heroSubtitle,
          heroSubtitleEn: cmsData.heroSubtitleEn || cmsData.heroSubtitle || mockSiteInfo.heroSubtitleEn,
          festivalPeriod: cmsData.festivalPeriod || mockSiteInfo.festivalPeriod,
          festivalPeriodEn: cmsData.festivalPeriodEn || cmsData.festivalPeriod || mockSiteInfo.festivalPeriodEn,
          locationSummary: cmsData.locationSummary || mockSiteInfo.locationSummary,
          locationSummaryEn: cmsData.locationSummaryEn || cmsData.locationSummary || mockSiteInfo.locationSummaryEn,
          aboutTitle: cmsData.aboutTitle || mockSiteInfo.aboutTitle,
          aboutTitleEn: cmsData.aboutTitleEn || cmsData.aboutTitle || mockSiteInfo.aboutTitleEn,
          aboutText: cmsData.aboutText || mockSiteInfo.aboutText,
          aboutTextEn: cmsData.aboutTextEn || cmsData.aboutText || mockSiteInfo.aboutTextEn,
          donationTitle: cmsData.donationTitle || mockSiteInfo.donationTitle,
          donationTitleEn: cmsData.donationTitleEn || cmsData.donationTitle || mockSiteInfo.donationTitleEn,
          donationText: cmsData.donationText || mockSiteInfo.donationText,
          donationTextEn: cmsData.donationTextEn || cmsData.donationText || mockSiteInfo.donationTextEn,
          donationBankNote: cmsData.donationBankNote || mockSiteInfo.donationBankNote,
          donationBankNoteEn: cmsData.donationBankNoteEn || cmsData.donationBankNote || mockSiteInfo.donationBankNoteEn,
          donationBankInfo: cmsData.donationBankInfo || mockSiteInfo.donationBankInfo,
          donationBankInfoEn: cmsData.donationBankInfoEn || cmsData.donationBankInfo || mockSiteInfo.donationBankInfoEn,
          newsNotice: cmsData.newsNotice || mockSiteInfo.newsNotice,
          newsNoticeEn: cmsData.newsNoticeEn || cmsData.newsNotice || mockSiteInfo.newsNoticeEn,
        };
      }
    } catch (error) {
      console.warn('[MicroCMS] Failed to fetch site_info, using mock data:', error);
    }
  }

  // Fallback only when microCMS fetch itself fails or client is not configured
  return mockSiteInfo;
});
