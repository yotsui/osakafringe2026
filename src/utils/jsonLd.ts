import type { Performance, PerformanceSchedule } from '../types/index.ts';

/**
 * チケット料金の文字列から単一の確定金額を安全に抽出
 * - "無料", "Free" など -> 0
 * - "¥1,000", "1,000円", "1000" など単一価格 -> 1000
 * - 複数券種（例: "前売 ¥2,500 / 当日 ¥3,000"）、範囲指定（"1,000円〜2,000円"）、投げ銭、未定などの場合は
 *   誤った価格構造化データを回避するため null を返す
 */
export function parseTicketPrice(priceText?: string): { price: number; priceCurrency: string } | null {
  if (!priceText || typeof priceText !== 'string') return null;
  const trimmed = priceText.trim();
  if (!trimmed) return null;

  // 無料判定 (数字が含まれておらず、無料またはfreeと記載)
  if (/(無料|free)/i.test(trimmed) && !/\d+/.test(trimmed)) {
    return { price: 0, priceCurrency: 'JPY' };
  }

  // 複数価格表記（"/" や "〜" や "～" や "・"）やカンパ・投げ銭の判定
  if (/(\/|／|〜|～|~|・|カンパ|投げ銭|donation|未定|tbd)/i.test(trimmed)) {
    return null;
  }

  // カンマ区切りの数字（例: 1,000 または 1000）をすべて抽出
  // マッチした全数字列をチェック
  const numbers = trimmed.match(/\b\d{1,3}(?:,\d{3})+\b|\b\d+\b/g);
  if (!numbers || numbers.length !== 1) {
    // 0個または2個以上の数字（例: "学生 1000 一般 2000"）がある場合は断定を避けて null
    return null;
  }

  const rawNum = numbers[0].replace(/,/g, '');
  const parsedPrice = parseInt(rawNum, 10);
  if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
    return null;
  }

  return {
    price: parsedPrice,
    priceCurrency: 'JPY',
  };
}

/**
 * スケジュールの開始・終了日時を Schema.org ISO形式（または日付形式）で構築
 * 時刻がない場合は架空時刻を補完せず、YYYY-MM-DD 形式とする
 */
export function formatScheduleIsoDateTime(date?: string, time?: string): string | undefined {
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return undefined;
  }
  if (time && /^\d{2}:\d{2}$/.test(time)) {
    return `${date}T${time}:00+09:00`;
  }
  return date;
}

/**
 * スケジュールの終了日時を Schema.org ISO形式（または日付形式）で構築
 * - 明示的な終了日(endDate)がある場合: 終了時刻(endTime)があればISO、なければ日付のみ
 * - 終了日はないが、終了時刻(endTime)と開始日(date)がある場合: 開始日+終了時刻のISO
 * - 終了情報（終了日・終了時刻）がない場合は undefined（架空のendDateを出力しない）
 */
export function formatScheduleEndIsoDateTime(date?: string, endDate?: string, endTime?: string): string | undefined {
  const cleanEndDate = endDate && /^\d{4}-\d{2}-\d{2}$/.test(endDate) ? endDate : undefined;
  const cleanDate = date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : undefined;
  const hasEndTime = Boolean(endTime && /^\d{2}:\d{2}$/.test(endTime));

  if (cleanEndDate) {
    if (hasEndTime) {
      return `${cleanEndDate}T${endTime}:00+09:00`;
    }
    return cleanEndDate;
  }

  if (cleanDate && hasEndTime) {
    return `${cleanDate}T${endTime}:00+09:00`;
  }

  return undefined;
}

/**
 * スケジュールに対応する Location (Place) 構造化データを生成
 */
function buildLocation(schedule?: PerformanceSchedule, defaultVenue?: Performance['venue'], defaultVenueName?: string) {
  const venueObj = schedule?.venue || defaultVenue;
  const name = schedule?.venueName || venueObj?.name || defaultVenueName || 'Osaka Fringe 2026 特設会場';
  const streetAddress = venueObj?.address || '大阪市内各所';
  const addressLocality = venueObj?.area || 'Osaka';

  return {
    '@type': 'Place' as const,
    name,
    address: {
      '@type': 'PostalAddress' as const,
      streetAddress,
      addressLocality,
      addressCountry: 'JP',
    },
  };
}

/**
 * 公演情報から Schema.org Event の JSON-LD オブジェクトを構築
 */
export function buildPerformanceJsonLd(performance: Performance, siteBaseUrl: string) {
  const defaultOgImage = '/ogp-default.png';
  const ogImage =
    performance.images?.[0] ||
    performance.image ||
    performance.artist?.image ||
    performance.artist?.images?.[0] ||
    performance.venue?.image ||
    performance.venue?.images?.[0] ||
    `${siteBaseUrl}${defaultOgImage}`;

  const absoluteImageUrl = ogImage.startsWith('http') ? ogImage : `${siteBaseUrl}${ogImage}`;

  const validSchedules = (performance.schedules || []).filter(
    (s) => s.date && /^\d{4}-\d{2}-\d{2}$/.test(s.date)
  );

  const artistName = performance.artist?.name || performance.artistName || 'Osaka Fringe 参加アーティスト';
  const defaultVenueName = performance.venue?.name || performance.venueName || 'Osaka Fringe 2026 特設会場';

  // チケット価格の安全なパース
  const priceInfo = parseTicketPrice(performance.ticketPrice);

  let offers: Record<string, unknown> | undefined;
  if (priceInfo !== null) {
    offers = {
      '@type': 'Offer',
      url: performance.ticketUrl || `${siteBaseUrl}/performances/${performance.id}`,
      price: priceInfo.price,
      priceCurrency: priceInfo.priceCurrency,
    };
  }

  // 複数日程の subEvent 構築
  let subEvents: Array<Record<string, unknown>> | undefined;
  let mainStartDate: string | undefined;
  let mainEndDate: string | undefined;
  const mainLocation = buildLocation(validSchedules[0], performance.venue, defaultVenueName);

  if (validSchedules.length > 0) {
    const first = validSchedules[0];
    const last = validSchedules[validSchedules.length - 1];

    mainStartDate = formatScheduleIsoDateTime(first.date, first.startTime);

    if (validSchedules.length === 1) {
      mainEndDate = formatScheduleEndIsoDateTime(first.date, first.endDate, first.endTime);
    } else {
      const explicitLastEnd = formatScheduleEndIsoDateTime(last.date, last.endDate, last.endTime);
      if (explicitLastEnd) {
        mainEndDate = explicitLastEnd;
      } else if (last.date && last.date !== first.date) {
        mainEndDate = last.date;
      }
    }

    if (validSchedules.length > 1) {
      subEvents = validSchedules.map((s, index) => {
        const subStart = formatScheduleIsoDateTime(s.date, s.startTime);
        const subEnd = formatScheduleEndIsoDateTime(s.date, s.endDate, s.endTime);
        const subLoc = buildLocation(s, performance.venue, defaultVenueName);

        return {
          '@type': 'Event',
          name: `${performance.title} (公演 #${index + 1})`,
          ...(subStart ? { startDate: subStart } : {}),
          ...(subEnd ? { endDate: subEnd } : {}),
          eventStatus: 'https://schema.org/EventScheduled',
          eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
          location: subLoc,
          performer: {
            '@type': 'PerformingGroup',
            name: artistName,
          },
        };
      });
    }
  }

  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: performance.title,
    ...(performance.titleEn ? { alternateName: performance.titleEn } : {}),
    ...(performance.description ? { description: performance.description.slice(0, 300) } : {}),
    image: [absoluteImageUrl],
    ...(mainStartDate ? { startDate: mainStartDate } : {}),
    ...(mainEndDate ? { endDate: mainEndDate } : {}),
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: mainLocation,
    performer: {
      '@type': 'PerformingGroup',
      name: artistName,
    },
    ...(offers ? { offers } : {}),
    ...(subEvents && subEvents.length > 0 ? { subEvent: subEvents } : {}),
    organizer: {
      '@type': 'Organization',
      name: '大阪文化万博Osaka Fringe 2026 実行委員会',
      url: siteBaseUrl,
    },
  };

  return jsonLd;
}
