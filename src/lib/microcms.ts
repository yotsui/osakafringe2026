import { createClient } from 'microcms-js-sdk';
import { Venue, Performance, Award, Banner, SiteInfo, PerformanceSchedule, Partner } from '@/types';
import { mockVenues, mockPerformances, mockAwards, mockBanners, mockSiteInfo, mockPartners } from './mockData';

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
 * 会場一覧を取得
 */
export async function getVenues(): Promise<Venue[]> {
  const normalizeVenue = (v: any): Venue => {
    const imgUrl = extractImageUrl(v.image);
    const lat = v.lat != null && v.lat !== '' ? Number(v.lat) : (v.location?.lat ?? DEFAULT_COORDINATES[v.id]?.lat ?? 34.6937);
    const lng = v.lng != null && v.lng !== '' ? Number(v.lng) : (v.location?.lng ?? DEFAULT_COORDINATES[v.id]?.lng ?? 135.5023);
    const coords = { lat, lng };

    return {
      ...v,
      lat,
      lng,
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
      customRequestInit: { cache: 'no-store' },
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

    // 3. 主会場の解決（文字列またはリレーションオブジェクト { id: string }）
    const resolvedVenueId = typeof perf.venueId === 'object' && perf.venueId !== null ? perf.venueId.id : perf.venueId;
    const mainVenue = resolvedVenueId ? venueMap.get(resolvedVenueId) : undefined;

    // 4. 各公演日時に会場情報を紐付け
    const enrichedSchedules = rawSchedules.map((s: any) => {
      const sVenueId = typeof s.venueId === 'object' && s.venueId !== null ? s.venueId.id : (s.venueId || resolvedVenueId);
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
  const normalizeAward = (a: any): Award => ({
    ...a,
    awardName: a.awardName || a.title,
    title: a.awardName || a.title,
    winnerName: a.winnerName || a.winner,
    winner: a.winnerName || a.winner,
    performanceTitle: a.performanceTitle || a.workTitle,
    workTitle: a.performanceTitle || a.workTitle,
  });

  if (!client) {
    return mockAwards.map(normalizeAward);
  }
  try {
    const data = await client.getList<any>({
      endpoint: 'awards',
      queries: { limit: 50 },
    });
    const contents = data.contents.length > 0 ? data.contents : mockAwards;
    return contents.map(normalizeAward);
  } catch (error) {
    console.warn('[MicroCMS] Failed to fetch awards, using mock data:', error);
    return mockAwards.map(normalizeAward);
  }
}

/**
 * パートナー/連携団体一覧を取得 (partner スキーマ)
 */
export async function getPartners(): Promise<Partner[]> {
  const normalizePartner = (p: any): Partner => ({
    ...p,
    image: extractImageUrl(p.image) || p.image || '',
    url: p.url || p.linkUrl || '#',
  });

  if (!client) {
    return mockPartners.map(normalizePartner);
  }
  try {
    const data = await client.getList<any>({
      endpoint: 'partner',
      queries: { limit: 50, orders: 'order' },
    });
    const contents = data.contents.length > 0 ? data.contents : mockPartners;
    return contents.map(normalizePartner);
  } catch (error) {
    console.warn('[MicroCMS] Failed to fetch partners, using mock data:', error);
    return mockPartners.map(normalizePartner);
  }
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