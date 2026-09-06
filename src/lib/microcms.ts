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

    // 2. アーティスト情報の解決＆直接記入からの合成
    const artistName = perf.artistName || (perf.artist?.name) || '出演アーティスト';
    const artistNameEn = perf.artistNameEn || (perf.artist?.nameEn);
    const artistOrigin = perf.artistOrigin || (perf.artist?.origin);
    const artistOriginEn = perf.artistOriginEn || (perf.artist?.originEn);
    const artistProfile = perf.artistProfile || (perf.artist?.profile) || '';
    const artistProfileEn = perf.artistProfileEn || (perf.artist?.profileEn);

    // 3. 会場情報の解決＆直接記入からの合成
    const venueName = perf.venueName || (perf.venue?.name) || '特設会場';
    const venueNameEn = perf.venueNameEn || (perf.venue?.nameEn);
    const venueArea = perf.venueArea || (perf.venue?.area) || '大阪エリア';
    const venueAreaEn = perf.venueAreaEn || (perf.venue?.areaEn);
    const venueAddress = perf.venueAddress || (perf.venue?.address) || '';
    const venueAddressEn = perf.venueAddressEn || (perf.venue?.addressEn);
    const venueAccess = perf.venueAccess || (perf.venue?.access) || '';
    const venueAccessEn = perf.venueAccessEn || (perf.venue?.accessEn);
    const venueLat = perf.venueLat != null ? Number(perf.venueLat) : (perf.venue?.location?.lat ?? 34.6937);
    const venueLng = perf.venueLng != null ? Number(perf.venueLng) : (perf.venue?.location?.lng ?? 135.5023);

    // 4. schedulesのパース（配列、または scheduleDates からの自動補完）
    let enrichedSchedules: PerformanceSchedule[] = [];
    if (Array.isArray(perf.schedules) && perf.schedules.length > 0) {
      enrichedSchedules = perf.schedules.map((s: any) => ({
        date: String(s.date || '2026-10-08').trim(),
        startTime: String(s.startTime || '18:00').trim(),
        endTime: String(s.endTime || '19:00').trim(),
        venueId: s.venueId || perf.venueId || perf.id,
        venueName: s.venueName || venueName,
        venueNameEn: s.venueNameEn || venueNameEn,
        note: s.note ? String(s.note).trim() : undefined,
      }));
    } else {
      // scheduleDates 文字列からの簡易パースまたはフォールバック
      enrichedSchedules = [
        {
          date: '2026-10-08',
          startTime: '18:00',
          endTime: '19:00',
          venueId: perf.venueId || perf.id,
          venueName,
          venueNameEn,
          note: perf.scheduleDates || undefined,
        }
      ];
    }

    // 5. 日英翻訳の自動補完
    const [
      titleEn,
      genreCustomEn,
      descriptionEn,
      ticketPriceEn,
      artistNameEnTranslated,
      artistProfileEnTranslated,
      venueNameEnTranslated,
      venueAreaEnTranslated,
      venueAccessEnTranslated,
    ] = await Promise.all([
      translateIfEmpty(perf.title, perf.titleEn, 'Performance title in fringe festival'),
      translateIfEmpty(perf.genreCustom, perf.genreCustomEn, 'Artistic genre subcategory'),
      translateIfEmpty(perf.description, perf.descriptionEn, 'Performance synopsis'),
      translateIfEmpty(perf.ticketPrice, perf.ticketPriceEn, 'Ticket price details'),
      translateIfEmpty(artistName, artistNameEn, 'Artist or company name'),
      translateIfEmpty(artistProfile, artistProfileEn, 'Artist biography and background'),
      translateIfEmpty(venueName, venueNameEn, 'Performance venue name'),
      translateIfEmpty(venueArea, venueAreaEn, 'Osaka area name'),
      translateIfEmpty(venueAccess, venueAccessEn, 'Venue transit instructions'),
    ]);

    const finalArtistNameEn = artistNameEnTranslated || artistNameEn || artistName;
    const finalVenueNameEn = venueNameEnTranslated || venueNameEn || venueName;

    const synthesizedArtist: Artist = {
      id: perf.artistId || `artist-${perf.id}`,
      name: artistName,
      nameEn: finalArtistNameEn,
      origin: artistOrigin,
      originEn: artistOriginEn,
      profile: artistProfile,
      profileEn: artistProfileEnTranslated || artistProfileEn,
      websiteUrl: perf.artistWebsite,
      snsTwitter: perf.artistTwitter,
      snsInstagram: perf.artistInstagram,
      snsYoutube: perf.artistYoutube,
      image: imgUrl,
    };

    const synthesizedVenue: Venue = {
      id: perf.venueId || `venue-${perf.id}`,
      name: venueName,
      nameEn: finalVenueNameEn,
      area: venueArea,
      areaEn: venueAreaEnTranslated || venueAreaEn,
      address: venueAddress,
      addressEn: venueAddressEn,
      access: venueAccess,
      accessEn: venueAccessEnTranslated || venueAccessEn,
      location: { lat: venueLat, lng: venueLng },
      lat: venueLat,
      lng: venueLng,
      image: imgUrl,
    };

    const images = Array.isArray(perf.images) 
      ? perf.images.map(extractImageUrl).filter(Boolean) as string[]
      : (imgUrl ? [imgUrl] : []);

    return {
      ...perf,
      title: perf.title,
      titleEn: titleEn || perf.titleEn || perf.title,
      genreCustom: perf.genreCustom,
      genreCustomEn: genreCustomEn || perf.genreCustomEn,
      description: perf.description,
      descriptionEn: descriptionEn || perf.descriptionEn || perf.description,
      ticketPrice: perf.ticketPrice,
      ticketPriceEn: ticketPriceEn || perf.ticketPriceEn,
      artistName,
      artistNameEn: finalArtistNameEn,
      artistOrigin,
      artistOriginEn,
      artistProfile,
      artistProfileEn: artistProfileEnTranslated || artistProfileEn,
      artistWebsite: perf.artistWebsite,
      artistTwitter: perf.artistTwitter,
      artistInstagram: perf.artistInstagram,
      artistYoutube: perf.artistYoutube,
      artist: synthesizedArtist,
      venueName,
      venueNameEn: finalVenueNameEn,
      venueArea,
      venueAreaEn: venueAreaEnTranslated || venueAreaEn,
      venueAddress,
      venueAddressEn,
      venueAccess,
      venueAccessEn: venueAccessEnTranslated || venueAccessEn,
      venueLat,
      venueLng,
      venue: synthesizedVenue,
      image: imgUrl || '',
      images,
      schedules: enrichedSchedules,
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