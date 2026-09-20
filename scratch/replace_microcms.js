const fs = require('fs');
const path = require('path');

let content = fs.readFileSync('src/lib/microcms.ts', 'utf-8');

const fetchAllMicroCMSItemsCode = `
/**
 * 全件取得する共通処理 (limit: 100, page: 50 max)
 */
async function fetchAllMicroCMSItems<T>(endpoint: string): Promise<T[]> {
  if (!client) return [];
  const allContents: T[] = [];
  const pageSize = 100;
  let offset = 0;
  let totalCount = Infinity;
  const MAX_PAGES = 50; // 最大5,000件
  let page = 0;

  while (offset < totalCount && page < MAX_PAGES) {
    page++;
    const data = await client.getList<T>({
      endpoint,
      queries: { limit: pageSize, offset },
      customRequestInit: { next: { revalidate: REVALIDATE_TIME } },
    });

    if (data.contents && data.contents.length > 0) {
      allContents.push(...data.contents);
    }

    totalCount = typeof data.totalCount === 'number' ? data.totalCount : allContents.length;
    offset += pageSize;

    if (!data.contents || data.contents.length < pageSize) {
      break;
    }
  }

  return allContents;
}
`;

content = content.replace(
  '/**\n * 会場一覧を取得',
  fetchAllMicroCMSItemsCode + '\n/**\n * 会場一覧を取得'
);

const normalizeVenueCode = `
export function normalizeVenue(v: RawVenueData): Venue {
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
    image: imgUrl || '',
    location: coords,
    images,
  };
}
`;

content = content.replace(
  /export const getVenues = cache\(async \(\): Promise<Venue\[\]> => \{\n\s*const normalizeVenue = \(v: RawVenueData\): Venue => \{[\s\S]*?    \};\n\n\s*let rawList/m,
  normalizeVenueCode + '\nexport const getVenues = cache(async (): Promise<Venue[]> => {\n  let rawList'
);

content = content.replace(
  /let rawList: RawVenueData\[\] = mockVenues;\n\s*if \(client\) \{[\s\S]*?\}\n\s*\}\n\n\s*return rawList\.map\(normalizeVenue\);/,
  `let rawList: RawVenueData[] = mockVenues;
  if (client) {
    try {
      const data = await fetchAllMicroCMSItems<RawVenueData>('venues');
      if (data.length > 0) {
        rawList = data;
      }
    } catch (error) {
      console.warn('[MicroCMS] Failed to fetch venues, using mock data:', error);
    }
  }

  return rawList.map(normalizeVenue);`
);

content = content.replace(
  /let rawList: RawArtistData\[\] = mockArtists;\n\s*if \(client\) \{[\s\S]*?\}\n\s*\}\n\n\s*return rawList\.map\(normalizeArtist\);/,
  `let rawList: RawArtistData[] = mockArtists;
  if (client) {
    try {
      const data = await fetchAllMicroCMSItems<RawArtistData>('artists');
      if (data.length > 0) {
        rawList = data;
      }
    } catch (error) {
      console.warn('[MicroCMS] Failed to fetch artists, using mock data:', error);
    }
  }

  return rawList.map(normalizeArtist);`
);

content = content.replace(
  /let rawList: RawPerformanceData\[\] = mockPerformances as unknown as RawPerformanceData\[\];\n\s*if \(client\) \{[\s\S]*?\}\n\s*\}\n\n\s*return rawList\.map\(\(p\) => normalizePerformance\(p, venueMap, artistMap, partnerMap\)\);/,
  `let rawList: RawPerformanceData[] = mockPerformances as unknown as RawPerformanceData[];
  if (client) {
    try {
      const data = await fetchAllMicroCMSItems<RawPerformanceData>('performances');
      if (data.length > 0) {
        rawList = data;
      }
    } catch (error) {
      console.warn('[MicroCMS] Failed to fetch performances, using mock data:', error);
    }
  }

  return rawList.map((p) => normalizePerformance(p, venueMap, artistMap, partnerMap));`
);

const normalizePartnerCode = `
export function normalizePartner(p: RawPartnerData): Partner {
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
    image: extractImageUrl(p.image) || '',
    url: p.websiteUrl || p.url || p.linkUrl || '#',
    category: rawCat || '組織（後援・協力）',
  };
}
`;

content = content.replace(
  /export const getPartners = cache\(async \(\): Promise<Partner\[\]> => \{\n\s*const normalizePartner = \(p: RawPartnerData\): Partner => \{[\s\S]*?    \};\n\n\s*let rawList/m,
  normalizePartnerCode + '\nexport const getPartners = cache(async (): Promise<Partner[]> => {\n  let rawList'
);

content = content.replace(
  /let rawList: RawPartnerData\[\] = mockPartners;\n\s*if \(client\) \{[\s\S]*?\}\n\s*\}\n\n\s*return rawList\.map\(normalizePartner\);/,
  `let rawList: RawPartnerData[] = mockPartners;
  if (client) {
    try {
      const data = await fetchAllMicroCMSItems<RawPartnerData>('partner');
      if (data.length > 0) {
        rawList = data;
      }
    } catch (error) {
      try {
        const dataFallback = await fetchAllMicroCMSItems<RawPartnerData>('partners');
        if (dataFallback.length > 0) {
          rawList = dataFallback;
        }
      } catch (err2) {
        console.warn('[MicroCMS] Failed to fetch partners from both "partner" and "partners" endpoints, using mock data:', { error, err2 });
      }
    }
  }

  return rawList.map(normalizePartner);`
);

fs.writeFileSync('src/lib/microcms.ts', content, 'utf-8');
