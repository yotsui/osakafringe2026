import { createClient } from 'microcms-js-sdk';
import { Venue, Performance, Award, Banner, SiteInfo } from '@/types';
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
 * 会場一覧を取得
 */
export async function getVenues(): Promise<Venue[]> {
  if (!client) {
    return mockVenues;
  }
  try {
    const data = await client.getList<Venue>({
      endpoint: 'venues',
      queries: { limit: 100 },
    });
    return data.contents.length > 0 ? data.contents : mockVenues;
  } catch (error) {
    console.warn('[MicroCMS] Failed to fetch venues, using mock data:', error);
    return mockVenues;
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

  const enrichPerformance = (perf: Performance): Performance => {
    const venue = perf.venueId ? venueMap.get(perf.venueId) : undefined;
    const enrichedSchedules = perf.schedules.map((s) => {
      const sVenue = s.venueId ? venueMap.get(s.venueId) : venue;
      return {
        ...s,
        venueName: s.venueName || (sVenue ? sVenue.name : undefined),
        venueNameEn: s.venueNameEn || (sVenue ? sVenue.nameEn : undefined),
      };
    });

    return {
      ...perf,
      venue,
      schedules: enrichedSchedules,
    };
  };

  if (!client) {
    return mockPerformances.map(enrichPerformance);
  }

  try {
    const data = await client.getList<Performance>({
      endpoint: 'performances',
      queries: { limit: 100 },
    });
    const contents = data.contents.length > 0 ? data.contents : mockPerformances;
    return contents.map(enrichPerformance);
  } catch (error) {
    console.warn('[MicroCMS] Failed to fetch performances, using mock data:', error);
    return mockPerformances.map(enrichPerformance);
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
      queries: { limit: 20 },
    });
    return data.contents.length > 0 ? data.contents : mockBanners;
  } catch (error) {
    console.warn('[MicroCMS] Failed to fetch banners, using mock data:', error);
    return mockBanners;
  }
}

/**
 * サイト共通情報・About・寄付情報を取得
 */
export async function getSiteInfo(): Promise<SiteInfo> {
  if (!client) {
    return mockSiteInfo;
  }
  try {
    const data = await client.getObject<SiteInfo>({
      endpoint: 'site_info',
    });
    return data || mockSiteInfo;
  } catch (error) {
    console.warn('[MicroCMS] Failed to fetch site_info, using mock data:', error);
    return mockSiteInfo;
  }
}