import { cache } from 'react';
import { createClient } from 'microcms-js-sdk';
import { Venue, Artist, Performance, Banner, SiteInfo, PerformanceSchedule, Partner } from '@/types';
import { mockVenues, mockArtists, mockPerformances, mockBanners, mockSiteInfo, mockPartners } from './mockData';

const REVALIDATE_TIME = 300; // 5分キャッシュ (ISR)

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
 * 会場一覧を取得 (React cache & ISR 300s)
 */
export const getVenues = cache(async (): Promise<Venue[]> => {
  const normalizeVenue = (v: any): Venue => {
    const imgUrl = extractImageUrl(v.image);
    const lat = v.lat != null && v.lat !== '' ? Number(v.lat) : (v.location?.lat ?? DEFAULT_COORDINATES[v.id]?.lat ?? 34.6937);
    const lng = v.lng != null && v.lng !== '' ? Number(v.lng) : (v.location?.lng ?? DEFAULT_COORDINATES[v.id]?.lng ?? 135.5023);
    const coords = { lat, lng };

    const images = Array.isArray(v.images)
      ? v.images.map(extractImageUrl).filter(Boolean) as string[]
      : (imgUrl ? [imgUrl] : []);

    return {
      ...v,
      nameEn: v.nameEn || v.name,
      areaEn: v.areaEn || v.area,
      addressEn: v.addressEn || v.address,
      accessEn: v.accessEn || v.access,
      descriptionEn: v.descriptionEn || v.description,
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
  const normalizeArtist = (a: any): Artist => {
    const imgUrl = extractImageUrl(a.image);
    const images = Array.isArray(a.images)
      ? a.images.map(extractImageUrl).filter(Boolean) as string[]
      : (imgUrl ? [imgUrl] : []);

    return {
      ...a,
      nameEn: a.nameEn || a.name,
      originEn: a.originEn || a.origin,
      profileEn: a.profileEn || a.profile,
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
  const [venues, artists] = await Promise.all([
    getVenues(),
    getArtists(),
  ]);

  const venueMap = new Map(venues.map((v) => [v.id, v]));
  const artistMap = new Map(artists.map((a) => [a.id, a]));

  const normalizePerformance = (perf: any): Performance => {
    // 1. 画像URLの正規化
    const imgUrl = extractImageUrl(perf.image);

    // 2. schedulesの安全なパース
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

    // 3. アーティスト参照の解決
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
    const artistNameEn = resolvedArtist?.nameEn || perf.artistNameEn || artistName;

    // 4. メイン会場参照の解決
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
    const venueNameEn = mainVenue?.nameEn || perf.venueNameEn || venueName;

    // 5. 公演日程（dates リピーターまたは schedules 配列）の展開と解決
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

    // 6. ジャンル・日英フォールバック
    const ALLOWED_GENRES = ['street', 'dance', 'music', 'theater', 'traditional', 'kamishibai', 'exhibition', 'other'];
    const artistGenre = resolvedArtist?.genre;
    const mainGenre = (artistGenre && ALLOWED_GENRES.includes(artistGenre)) ? artistGenre : 'other';

    const customGenre = perf.genre || '';
    const customGenreEn = perf.genreEn || customGenre;

    const images = Array.isArray(perf.images) 
      ? perf.images.map(extractImageUrl).filter(Boolean) as string[]
      : (imgUrl ? [imgUrl] : []);

    return {
      ...perf,
      id: perf.id,
      title: perf.title,
      titleEn: perf.titleEn || perf.title,
      genre: mainGenre,
      genreEn: mainGenre,
      genreCustom: customGenre,
      genreCustomEn: customGenreEn,
      description: perf.description,
      descriptionEn: perf.descriptionEn || perf.description,
      ticketPrice: perf.ticketPrice || '',
      ticketPriceEn: perf.ticketPriceEn || perf.ticketPrice || '',
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
  const normalizePartner = (p: any): Partner => {
    return {
      ...p,
      nameEn: p.nameEn || p.name,
      descriptionEn: p.descriptionEn || p.description,
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
        customRequestInit: { next: { revalidate: REVALIDATE_TIME } },
      });
      if (data.contents && data.contents.length > 0) {
        rawList = data.contents;
      }
    } catch (error) {
      console.warn('[MicroCMS] Failed to fetch partners, using mock data:', error);
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
 * サイト基本情報を取得 (React cache & ISR 300s)
 */
export const getSiteInfo = cache(async (): Promise<SiteInfo> => {
  let baseInfo = mockSiteInfo;
  if (client) {
    try {
      const data = await client.getObject<any>({
        endpoint: 'site_info',
        customRequestInit: { next: { revalidate: REVALIDATE_TIME } },
      });
      if (data && data.siteTitle) {
        baseInfo = { ...mockSiteInfo, ...data };
      }
    } catch (error) {
      console.warn('[MicroCMS] Failed to fetch site_info, using mock data:', error);
    }
  }

  return {
    ...baseInfo,
    siteTitleEn: baseInfo.siteTitleEn || baseInfo.siteTitle,
    heroTaglineEn: baseInfo.heroTaglineEn || baseInfo.heroTagline,
    heroSubtitleEn: baseInfo.heroSubtitleEn || baseInfo.heroSubtitle,
    festivalPeriodEn: baseInfo.festivalPeriodEn || baseInfo.festivalPeriod,
    locationSummaryEn: baseInfo.locationSummaryEn || baseInfo.locationSummary,
    aboutTitleEn: baseInfo.aboutTitleEn || baseInfo.aboutTitle,
    aboutTextEn: baseInfo.aboutTextEn || baseInfo.aboutText,
    donationTitleEn: baseInfo.donationTitleEn || baseInfo.donationTitle,
    donationTextEn: baseInfo.donationTextEn || baseInfo.donationText,
    donationBankInfoEn: baseInfo.donationBankInfoEn || baseInfo.donationBankInfo,
    newsNoticeEn: baseInfo.newsNoticeEn || baseInfo.newsNotice,
  };
});
