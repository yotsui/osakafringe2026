import { createClient } from 'microcms-js-sdk';
import { Venue, Performance, Award, Banner, SiteInfo, PerformanceSchedule } from '@/types';
import { mockVenues, mockPerformances, mockAwards, mockBanners, mockSiteInfo } from './mockData';

const serviceDomain = process.env.MICROCMS_SERVICE_DOMAIN || process.env.NEXT_PUBLIC_MICROCMS_SERVICE_DOMAIN || '';
const apiKey = process.env.MICROCMS_API_KEY || process.env.NEXT_PUBLIC_MICROCMS_API_KEY || '';

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
 * 会場一覧を取得
 */
export async function getVenues(): Promise<Venue[]> {
  const normalizeVenue = (v: any): Venue => {
    const imgUrl = extractImageUrl(v.image);
    const coords = v.location && v.location.lat
      ? v.location
      : (DEFAULT_COORDINATES[v.id] || { lat: 34.6937, lng: 135.5023 });

    return {
      ...v,
      image: imgUrl,
      location: coords,
      images: Array.isArray(v.images) ? v.images.map(extractImageUrl).filter(Boolean) : (imgUrl ? [imgUrl] : []),
    };
  };

  if (!client) {
    return mockVenues.map(normalizeVenue);
  }
  try {
    const data = await client.getList<any>({
      endpoint: 'venues',
      queries: { limit: 100 },
    });
    const contents = data.contents.length > 0 ? data.contents : mockVenues;
    return contents.map(normalizeVenue);
  } catch (error) {
    console.warn('[MicroCMS] Failed to fetch venues, using mock data:', error);
    return mockVenues.map(normalizeVenue);
  }
}

/**
 * 会場詳細を取得
 */
export async function getVenueById(id: string): Promise<Venue | undefined> {
  const venues = await getVenues();
  return venues.find((v) => v.id === id);
}

/**
 * 公演/アーティスト一覧を取得 (会場情報およびスケジュール会場をマージ)
 */
export async function getPerformances(): Promise<Performance[]> {
  const venues = await getVenues();
  const venueMap = new Map(venues.map((v) => [v.id, v]));

  const normalizePerformance = (perf: any): Performance => {
    // 1. 画像URLの正規化
    const imgUrl = extractImageUrl(perf.image);

    // 2. schedulesの安全なパース（文字列または配列）
    let rawSchedules: PerformanceSchedule[] = [];
    if (Array.isArray(perf.schedules)) {
      rawSchedules = perf.schedules;
    } else if (typeof perf.schedules === 'string' && perf.schedules.trim()) {
      try {
        rawSchedules = JSON.parse(perf.schedules);
      } catch (e) {
        console.warn(`[MicroCMS] Failed to parse schedules for performance ${perf.id}:`, e);
      }
    }

    // 3. 主会場の解決
    const mainVenue = perf.venueId ? venueMap.get(perf.venueId) : undefined;

    // 4. 各公演日時に会場情報を紐付け
    const enrichedSchedules = rawSchedules.map((s) => {
      const sVenueId = s.venueId || perf.venueId;
      const sVenue = sVenueId ? venueMap.get(sVenueId) : mainVenue;
      return {
        ...s,
        venueId: sVenueId,
        venueName: s.venueName || (sVenue ? sVenue.name : undefined),
        venueNameEn: s.venueNameEn || (sVenue ? sVenue.nameEn : undefined),
      };
    });

    return {
      ...perf,
      image: imgUrl,
      venue: mainVenue,
      schedules: enrichedSchedules,
    };
  };

  if (!client) {
    return mockPerformances.map(normalizePerformance);
  }

  try {
    const data = await client.getList<any>({
      endpoint: 'performances',
      queries: { limit: 100 },
    });
    const contents = data.contents.length > 0 ? data.contents : mockPerformances;
    return contents.map(normalizePerformance);
  } catch (error) {
    console.warn('[MicroCMS] Failed to fetch performances, using mock data:', error);
    return mockPerformances.map(normalizePerformance);
  }
}

/**
 * 公演詳細を取得
 */
export async function getPerformanceById(id: string): Promise<Performance | undefined> {
  const list = await getPerformances();
  return list.find((p) => p.id === id);
}

/**
 * Award一覧を取得
 */
export async function getAwards(): Promise<Award[]> {
  if (!client) {
    return mockAwards;
  }
  try {
    const data = await client.getList<Award>({
      endpoint: 'awards',
      queries: { limit: 50 },
    });
    return data.contents.length > 0 ? data.contents : mockAwards;
  } catch (error) {
    console.warn('[MicroCMS] Failed to fetch awards, using mock data:', error);
    return mockAwards;
  }
}

/**
 * バナー一覧を取得
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
 * サイト基本情報を取得
 */
export async function getSiteInfo(): Promise<SiteInfo> {
  if (!client) {
    return mockSiteInfo;
  }
  try {
    const data = await client.getObject<any>({
      endpoint: 'site_info',
    });
    return data && data.siteTitle ? { ...mockSiteInfo, ...data } : mockSiteInfo;
  } catch (error) {
    console.warn('[MicroCMS] Failed to fetch site_info, using mock data:', error);
    return mockSiteInfo;
  }
}