import { createClient } from 'microcms-js-sdk';
import { Venue, Artist, Performance, Banner, SiteInfo, PerformanceSchedule, Partner } from '@/types';
import { mockVenues, mockArtists, mockPerformances, mockBanners, mockSiteInfo, mockPartners } from './mockData';
import { translateIfEmpty } from './gemini';

const rawServiceDomain = process.env.MICROCMS_SERVICE_DOMAIN || process.env.NEXT_PUBLIC_MICROCMS_SERVICE_DOMAIN || '';
// URL形式（https://xxx.microcms.io/）が渡された場合もサブドメイン部分（xxx）を安全に抽出
export const serviceDomain = rawServiceDomain
  .trim()
  .replace(/^https?:\/\//i, '')
  .replace(/\.microcms\.io\/?$/i, '')
  .replace(/\/$/, '');

const apiKey = (process.env.MICROCMS_API_KEY || process.env.NEXT_PUBLIC_MICROCMS_API_KEY || '').trim();

export const isMicroCMSConfigured = Boolean(serviceDomain && apiKey);

export const client = isMicroCMSConfigured
  ? createClient({
      serviceDomain,
      apiKey,
    })
  : null;

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
 * 会場のデフォルト座標マッピング
 */
const DEFAULT_COORDINATES: Record<string, { lat: number; lng: number }> = {
  'nakazaki-hall': { lat: 34.7065, lng: 135.5032 },
  'shinsaibashi-under': { lat: 34.6722, lng: 135.4983 },
  'nakanoshima-bank': { lat: 34.6937, lng: 135.5042 },
  'tennoji-warehouse': { lat: 34.6515, lng: 135.5135 },
};

/**
 * 会場一覧を取得（英語未入力時のAI自動翻訳＆キャッシュ対応）
 */
export async function getVenues(): Promise<Venue[]> {
  const normalizeVenue = async (v: any): Promise<Venue> => {
    const imgUrl = extractImageUrl(v.image);
    const lat = v.lat != null && v.lat !== '' ? Number(v.lat) : (v.location?.lat ?? DEFAULT_COORDINATES[v.id]?.lat ?? 34.6937);
    const lng = v.lng != null && v.lng !== '' ? Number(v.lng) : (v.location?.lng ?? DEFAULT_COORDINATES[v.id]?.lng ?? 135.5023);
    const coords = { lat, lng };

    const [nameEn, areaEn, addressEn, accessEn, descriptionEn] = await Promise.all([
      translateIfEmpty(v.name, v.nameEn, 'Venue name in Osaka'),
      translateIfEmpty(v.area, v.areaEn, 'Osaka area name'),
      translateIfEmpty(v.address, v.addressEn, 'Address in Osaka'),
      translateIfEmpty(v.access, v.accessEn, 'Transit access instructions'),
      translateIfEmpty(v.description, v.descriptionEn, 'Venue description'),
    ]);

    const images = Array.isArray(v.images)
      ? v.images.map(extractImageUrl).filter(Boolean) as string[]
      : (imgUrl ? [imgUrl] : []);

    return {
      ...v,
      nameEn: nameEn || v.nameEn,
      areaEn: areaEn || v.areaEn,
      addressEn: addressEn || v.addressEn,
      accessEn: accessEn || v.accessEn,
      descriptionEn: descriptionEn || v.descriptionEn,
      lat,
      lng,
      image: imgUrl,
      location: coords,
      images,
    };
  };

  let rawList: any[] = mockVenues;
  if (client) {
    try {
      const data = await client.getList<any>({
        endpoint: 'venues',
        queries: { limit: 100 },
        customRequestInit: { cache: 'no-store' },
      });
      if (data.contents && data.contents.length > 0) {
        rawList = data.contents;
      }
    } catch (error) {
      console.warn('[MicroCMS] Failed to fetch venues, using mock data:', error);
    }
  }

  return await Promise.all(rawList.map(normalizeVenue));
}

/**
 * 会場詳細を取得
 */
export async function getVenueById(id: string): Promise<Venue | undefined> {
  const venues = await getVenues();
  return venues.find((v) => v.id === id);
}

/**
 * アーティスト一覧を取得（英語未入力時のAI自動翻訳＆キャッシュ対応）
 */
export async function getArtists(): Promise<Artist[]> {
  const normalizeArtist = async (a: any): Promise<Artist> => {
    const imgUrl = extractImageUrl(a.image);
    const [nameEn, originEn, profileEn] = await Promise.all([
      translateIfEmpty(a.name, a.nameEn, 'Artist/Theater group name'),
      translateIfEmpty(a.origin, a.originEn, 'Artist origin city/country'),
      translateIfEmpty(a.profile, a.profileEn, 'Artist biography and profile'),
    ]);

    const images = Array.isArray(a.images)
      ? a.images.map(extractImageUrl).filter(Boolean) as string[]
      : (imgUrl ? [imgUrl] : []);

    return {
      ...a,
      nameEn: nameEn || a.nameEn,
      originEn: originEn || a.originEn,
      profileEn: profileEn || a.profileEn,
      image: imgUrl,
      images,
    };
  };

  let rawList: any[] = mockArtists;
  if (client) {
    try {
      const data = await client.getList<any>({
        endpoint: 'artists',
        queries: { limit: 100 },
        customRequestInit: { cache: 'no-store' },
      });
      if (data.contents && data.contents.length > 0) {
        rawList = data.contents;
      }
    } catch (error) {
      console.warn('[MicroCMS] Failed to fetch artists, using mock data:', error);
    }
  }

  return await Promise.all(rawList.map(normalizeArtist));
}

/**
 * アーティスト詳細を取得
 */
export async function getArtistById(id: string): Promise<Artist | undefined> {
  const artists = await getArtists();
  return artists.find((a) => a.id === id);
}

/**
 * 公演一覧を取得 (会場情報およびアーティスト情報をマージ & AI自動翻訳キャッシュ対応)
 */
export async function getPerformances(): Promise<Performance[]> {
  const [venues, artists] = await Promise.all([
    getVenues(),
    getArtists(),
  ]);

  const venueMap = new Map(venues.map((v) => [v.id, v]));
  const artistMap = new Map(artists.map((a) => [a.id, a]));

  const normalizePerformance = async (perf: any): Promise<Performance> => {
    // 1. 画像URLの正規化
    const imgUrl = extractImageUrl(perf.image);

    // 2. schedulesの安全なパース（繰り返しフィールド配列 または JSON文字列）
    let rawSchedules: any[] = [];
    if (Array.isArray(perf.schedules)) {
      rawSchedules = perf.schedules;
    } else if (typeof perf.schedules === 'string' && perf.schedules.trim()) {
      try {
        rawSchedules = JSON.parse(perf.schedules);
      } catch (e) {
        console.warn(`[MicroCMS] Failed to parse schedules for performance ${perf.id}:`, e);
      }
    }

    // 2. アーティスト参照の解決
    let resolvedArtist: Artist | undefined = undefined;
    let resolvedArtistId = '';
    
    if (perf.artists && typeof perf.artists === 'object' && perf.artists.id) {
      resolvedArtist = artistMap.get(perf.artists.id) || perf.artists;
      resolvedArtistId = perf.artists.id;
    } else if (typeof perf.artists === 'string' && perf.artists.trim()) {
      resolvedArtist = artistMap.get(perf.artists.trim());
      resolvedArtistId = perf.artists.trim();
    } else if (perf.artist && typeof perf.artist === 'object' && perf.artist.id) {
      resolvedArtist = artistMap.get(perf.artist.id) || perf.artist;
      resolvedArtistId = perf.artist.id;
    } else if (typeof perf.artistId === 'string' && perf.artistId.trim()) {
      resolvedArtist = artistMap.get(perf.artistId.trim());
      resolvedArtistId = perf.artistId.trim();
    }

    const artistName = resolvedArtist?.name || perf.artistName || '出演アーティスト';
    const artistNameEn = resolvedArtist?.nameEn || perf.artistNameEn;

    // 3. メイン会場参照の解決
    let mainVenue: Venue | undefined = undefined;
    let mainVenueId = '';

    if (perf.venue && typeof perf.venue === 'object' && perf.venue.id) {
      mainVenue = venueMap.get(perf.venue.id) || perf.venue;
      mainVenueId = perf.venue.id;
    } else if (typeof perf.venue === 'string' && perf.venue.trim()) {
      mainVenue = venueMap.get(perf.venue.trim());
      mainVenueId = perf.venue.trim();
    } else if (typeof perf.venueId === 'string' && perf.venueId.trim()) {
      mainVenue = venueMap.get(perf.venueId.trim());
      mainVenueId = perf.venueId.trim();
    }

    const venueName = mainVenue?.name || perf.venueName || '特設会場';
    const venueNameEn = mainVenue?.nameEn || perf.venueNameEn;

    // 4. 公演日程（dates リピーターまたは schedules 配列）の展開と解決
    const durationMins = typeof perf.durationMinutes === 'number' && perf.durationMinutes > 0 ? perf.durationMinutes : 60;
    let rawDateItems: any[] = [];

    if (Array.isArray(perf.dates) && perf.dates.length > 0) {
      rawDateItems = perf.dates;
    } else if (Array.isArray(perf.schedules) && perf.schedules.length > 0) {
      rawDateItems = perf.schedules;
    } else if (typeof perf.dates === 'string' && perf.dates.trim()) {
      try {
        rawDateItems = JSON.parse(perf.dates);
      } catch (e) {
        console.warn(`[MicroCMS] Failed to parse dates JSON for ${perf.id}:`, e);
      }
    }

    const enrichedSchedules: PerformanceSchedule[] = [];

    if (Array.isArray(rawDateItems) && rawDateItems.length > 0) {
      for (const item of rawDateItems) {
        if (!item) continue;

        // 会場の解決: item.venue が未指定の場合はメイン会場 mainVenue を参照
        let scheduleVenue: Venue | undefined = mainVenue;
        let sVenueId = mainVenueId;

        const rawItemVenue = item.venue || item.venueId;
        if (rawItemVenue && typeof rawItemVenue === 'object' && rawItemVenue.id) {
          scheduleVenue = venueMap.get(rawItemVenue.id) || rawItemVenue;
          sVenueId = rawItemVenue.id;
        } else if (typeof rawItemVenue === 'string' && rawItemVenue.trim()) {
          scheduleVenue = venueMap.get(rawItemVenue.trim()) || mainVenue;
          sVenueId = rawItemVenue.trim();
        }

        const sVenueName = scheduleVenue?.name || item.venueName || venueName;
        const sVenueNameEn = scheduleVenue?.nameEn || item.venueNameEn || venueNameEn;

        // 日時・開演時刻・終演時刻のパース
        let dateStr = '2026-10-08';
        let startTimeStr = '18:00';
        let endTimeStr = '19:00';

        if (item.date && typeof item.date === 'string') {
          const rawDateStr = item.date.trim();
          if (rawDateStr.includes('T')) {
            // ISO 8601 日時文字列 (例: "2026-10-08T19:00:00+09:00")
            const d = new Date(rawDateStr);
            if (!isNaN(d.getTime())) {
              // JST で日付と時刻をフォーマット
              const jstDate = new Intl.DateTimeFormat('ja-JP', {
                timeZone: 'Asia/Tokyo',
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
              }).format(d).replace(/\//g, '-');

              const jstTime = new Intl.DateTimeFormat('ja-JP', {
                timeZone: 'Asia/Tokyo',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
              }).format(d);

              dateStr = jstDate;
              startTimeStr = jstTime;

              const endTimestamp = d.getTime() + durationMins * 60 * 1000;
              const endDate = new Date(endTimestamp);
              endTimeStr = new Intl.DateTimeFormat('ja-JP', {
                timeZone: 'Asia/Tokyo',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
              }).format(endDate);
            }
          } else {
            dateStr = rawDateStr;
            if (item.startTime) startTimeStr = String(item.startTime).trim();
            if (item.endTime) endTimeStr = String(item.endTime).trim();
          }
        } else {
          if (item.date) dateStr = String(item.date).trim();
          if (item.startTime) startTimeStr = String(item.startTime).trim();
          if (item.endTime) endTimeStr = String(item.endTime).trim();
        }

        enrichedSchedules.push({
          date: dateStr,
          startTime: startTimeStr,
          endTime: endTimeStr,
          rawDate: typeof item.date === 'string' ? item.date : undefined,
          venueId: sVenueId,
          venueName: sVenueName,
          venueNameEn: sVenueNameEn,
          venue: scheduleVenue,
          note: item.note ? String(item.note).trim() : undefined,
        });
      }
    }

    if (enrichedSchedules.length === 0) {
      enrichedSchedules.push({
        date: '2026-10-08',
        startTime: '18:00',
        endTime: '19:00',
        venueId: mainVenueId,
        venueName,
        venueNameEn,
        venue: mainVenue,
      });
    }

    // 5. 日英翻訳の自動補完
    const rawGenre = perf.genre || perf.genreCustom || '';
    const rawGenreEn = perf.genreEn || perf.genreCustomEn || '';

    const [
      titleEn,
      genreEnTranslated,
      descriptionEn,
      ticketPriceEn,
    ] = await Promise.all([
      translateIfEmpty(perf.title, perf.titleEn, 'Performance title in fringe festival'),
      translateIfEmpty(rawGenre, rawGenreEn, 'Artistic genre subcategory'),
      translateIfEmpty(perf.description, perf.descriptionEn, 'Performance synopsis'),
      translateIfEmpty(perf.ticketPrice, perf.ticketPriceEn, 'Ticket price details'),
    ]);

    const images = Array.isArray(perf.images) 
      ? perf.images.map(extractImageUrl).filter(Boolean) as string[]
      : (imgUrl ? [imgUrl] : []);

    return {
      ...perf,
      id: perf.id,
      title: perf.title,
      titleEn: titleEn || perf.titleEn || perf.title,
      genre: perf.genre || 'theater',
      genreEn: genreEnTranslated || rawGenreEn,
      genreCustom: rawGenre,
      genreCustomEn: genreEnTranslated || rawGenreEn,
      description: perf.description,
      descriptionEn: descriptionEn || perf.descriptionEn || perf.description,
      ticketPrice: perf.ticketPrice,
      ticketPriceEn: ticketPriceEn || perf.ticketPriceEn,
      ticketUrl: perf.ticketUrl,
      durationMinutes: durationMins,
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
      dates: rawDateItems,
      schedules: enrichedSchedules,
      image: imgUrl || resolvedArtist?.image || mainVenue?.image || '',
      images,
    };
  };

  let rawList: any[] = mockPerformances;
  if (client) {
    try {
      const data = await client.getList<any>({
        endpoint: 'performances',
        queries: { limit: 100 },
      });
      if (data.contents && data.contents.length > 0) {
        rawList = data.contents;
      }
    } catch (error) {
      console.warn('[MicroCMS] Failed to fetch performances, using mock data:', error);
    }
  }

  return await Promise.all(rawList.map(normalizePerformance));
}

/**
 * 公演詳細を取得
 */
export async function getPerformanceById(id: string): Promise<Performance | undefined> {
  const list = await getPerformances();
  return list.find((p) => p.id === id);
}

/**
 * パートナー/連携団体一覧を取得 (microCMSの並び順で取得 & AI自動翻訳キャッシュ対応)
 */
export async function getPartners(): Promise<Partner[]> {
  const normalizePartner = async (p: any): Promise<Partner> => {
    const [nameEn, descriptionEn] = await Promise.all([
      translateIfEmpty(p.name, p.nameEn, 'Partner organization name'),
      translateIfEmpty(p.description, p.descriptionEn, 'Partner description'),
    ]);

    return {
      ...p,
      nameEn: nameEn || p.nameEn,
      descriptionEn: descriptionEn || p.descriptionEn,
      image: extractImageUrl(p.image) || p.image || '',
      url: p.url || p.linkUrl || '#',
    };
  };

  let rawList: any[] = mockPartners;
  if (client) {
    try {
      const data = await client.getList<any>({
        endpoint: 'partner',
        queries: { limit: 50 },
      });
      if (data.contents && data.contents.length > 0) {
        rawList = data.contents;
      }
    } catch (error) {
      console.warn('[MicroCMS] Failed to fetch partners, using mock data:', error);
    }
  }

  return await Promise.all(rawList.map(normalizePartner));
}

/**
 * バナー一覧を取得 (互換用)
 */
export async function getBanners(): Promise<Banner[]> {
  if (!client) {
    return mockBanners;
  }
  try {
    const data = await client.getList<Banner>({
      endpoint: 'banners',
      queries: { limit: 10 },
    });
    return data.contents.length > 0 ? data.contents : mockBanners;
  } catch (error) {
    console.warn('[MicroCMS] Failed to fetch banners, using mock data:', error);
    return mockBanners;
  }
}

/**
 * サイト基本情報を取得（AI自動翻訳＆キャッシュ対応）
 */
export async function getSiteInfo(): Promise<SiteInfo> {
  let baseInfo = mockSiteInfo;
  if (client) {
    try {
      const data = await client.getObject<any>({
        endpoint: 'site_info',
      });
      if (data && data.siteTitle) {
        baseInfo = { ...mockSiteInfo, ...data };
      }
    } catch (error) {
      console.warn('[MicroCMS] Failed to fetch site_info, using mock data:', error);
    }
  }

  const [
    siteTitleEn,
    heroTaglineEn,
    heroSubtitleEn,
    festivalPeriodEn,
    locationSummaryEn,
    aboutTitleEn,
    aboutTextEn,
    donationTitleEn,
    donationTextEn,
    donationBankInfoEn,
    newsNoticeEn,
  ] = await Promise.all([
    translateIfEmpty(baseInfo.siteTitle, baseInfo.siteTitleEn, 'Website title'),
    translateIfEmpty(baseInfo.heroTagline, baseInfo.heroTaglineEn, 'Festival catchphrase'),
    translateIfEmpty(baseInfo.heroSubtitle, baseInfo.heroSubtitleEn, 'Festival subtitle'),
    translateIfEmpty(baseInfo.festivalPeriod, baseInfo.festivalPeriodEn, 'Festival period dates'),
    translateIfEmpty(baseInfo.locationSummary, baseInfo.locationSummaryEn, 'Festival location areas'),
    translateIfEmpty(baseInfo.aboutTitle, baseInfo.aboutTitleEn, 'About section title'),
    translateIfEmpty(baseInfo.aboutText, baseInfo.aboutTextEn, 'About Osaka Fringe Festival description'),
    translateIfEmpty(baseInfo.donationTitle, baseInfo.donationTitleEn, 'Donation section title'),
    translateIfEmpty(baseInfo.donationText, baseInfo.donationTextEn, 'Donation philosophy and message'),
    translateIfEmpty(baseInfo.donationBankInfo, baseInfo.donationBankInfoEn, 'Bank account information for donation'),
    translateIfEmpty(baseInfo.newsNotice, baseInfo.newsNoticeEn, 'Important news notice banner'),
  ]);

  return {
    ...baseInfo,
    siteTitleEn: siteTitleEn || baseInfo.siteTitleEn,
    heroTaglineEn: heroTaglineEn || baseInfo.heroTaglineEn,
    heroSubtitleEn: heroSubtitleEn || baseInfo.heroSubtitleEn,
    festivalPeriodEn: festivalPeriodEn || baseInfo.festivalPeriodEn,
    locationSummaryEn: locationSummaryEn || baseInfo.locationSummaryEn,
    aboutTitleEn: aboutTitleEn || baseInfo.aboutTitleEn,
    aboutTextEn: aboutTextEn || baseInfo.aboutTextEn,
    donationTitleEn: donationTitleEn || baseInfo.donationTitleEn,
    donationTextEn: donationTextEn || baseInfo.donationTextEn,
    donationBankInfoEn: donationBankInfoEn || baseInfo.donationBankInfoEn,
    newsNoticeEn: newsNoticeEn || baseInfo.newsNoticeEn,
  };
}