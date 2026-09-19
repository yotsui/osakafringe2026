import type {
  Performance,
  PerformanceSchedule,
  PerformanceTimingInfo,
  PerformanceSortOption,
} from '../types';

/**
 * Festival centralized dates
 */
export const FESTIVAL_START_DATE = '2026-10-08';
export const FESTIVAL_END_DATE = '2026-11-08';

/**
 * Returns the current festival status based on Asia/Tokyo time.
 * @param nowMs optional timestamp, defaults to Date.now()
 */
export function getFestivalStatus(nowMs: number = Date.now()): 'before' | 'during' | 'after' {
  const startMs = parseJstDateTime(FESTIVAL_START_DATE, '00:00', 'start');
  const endMs = parseJstDateTime(FESTIVAL_END_DATE, '23:59', 'end');
  
  if (nowMs < startMs) return 'before';
  if (nowMs > endMs) return 'after';
  return 'during';
}

/**
 * 日本時間（Asia/Tokyo: UTC+09:00）で日時文字列を安全にミリ秒タイムスタンプへ変換する
 * VercelのUTC環境やクライアントのローカルタイムゾーンに依存しません。
 */
export function parseJstDateTime(
  dateStr?: string,
  timeStr?: string,
  defaultType: 'start' | 'end' = 'start'
): number {
  if (!dateStr || !dateStr.trim()) {
    return defaultType === 'start' ? 0 : Number.MAX_SAFE_INTEGER;
  }

  // 1. 日付文字列の正規化 (YYYY-MM-DD)
  const cleanDate = dateStr.trim().replace(/\//g, '-');
  const dateMatch = cleanDate.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (!dateMatch) {
    const fallback = new Date(dateStr).getTime();
    return isNaN(fallback) ? 0 : fallback;
  }

  const y = dateMatch[1];
  const m = dateMatch[2].padStart(2, '0');
  const d = dateMatch[3].padStart(2, '0');
  const normalizedDate = `${y}-${m}-${d}`;

  // 2. 時刻文字列の正規化 (HH:mm[:ss[.SSS]])
  let normalizedTime = '';
  const cleanTime = (timeStr || '').trim();

  if (cleanTime) {
    const timeMatch = cleanTime.match(/^(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?/);
    if (timeMatch) {
      const hh = timeMatch[1].padStart(2, '0');
      const mm = timeMatch[2].padStart(2, '0');
      const ss = (timeMatch[3] || '00').padStart(2, '0');
      const ms = defaultType === 'start' ? '000' : '999';
      normalizedTime = `${hh}:${mm}:${ss}.${ms}`;
    }
  }

  if (!normalizedTime) {
    normalizedTime = defaultType === 'start' ? '00:00:00.000' : '23:59:59.999';
  }

  // JST (+09:00) のISO文字列を構築してパース
  const isoJstString = `${normalizedDate}T${normalizedTime}+09:00`;
  const timestamp = new Date(isoJstString).getTime();

  return isNaN(timestamp) ? 0 : timestamp;
}

/**
 * 現在の日本時間（Asia/Tokyo）の YYYY-MM-DD 文字列を取得
 */
export function getJstDateString(date: Date | number = new Date()): string {
  const d = typeof date === 'number' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d);
}

/**
 * 各スケジュールのJST開始・終了ミリ秒タイムスタンプを計算
 */
export function getScheduleTimestamps(schedule: PerformanceSchedule): { startMs: number; endMs: number } {
  const startDate = schedule.date;
  const endDate = schedule.endDate || schedule.date;

  const startMs = parseJstDateTime(startDate, schedule.startTime, 'start');
  let endMs = parseJstDateTime(endDate, schedule.endTime, 'end');

  // 日をまたぐ公演（終了時刻が開始時刻より前で、endDateが明示されていない場合）の自動補正
  if (!schedule.endDate && schedule.startTime && schedule.endTime) {
    if (schedule.endTime < schedule.startTime) {
      endMs += 24 * 60 * 60 * 1000;
    }
  }

  // 終了日時が開始日時より前になっている場合は開始日時の23:59:59.999へ補正
  if (endMs < startMs) {
    endMs = parseJstDateTime(startDate, undefined, 'end');
  }

  return { startMs, endMs };
}

/**
 * 公演の日時判定情報（開催中・開催前・日程未登録・終了済み）をJST基準で計算する
 */
export function getPerformanceTimingInfo(
  perf: Performance,
  now: Date | number = new Date()
): PerformanceTimingInfo {
  const nowMs = typeof now === 'number' ? now : now.getTime();
  const todayJst = getJstDateString(nowMs);

  if (!perf.schedules || !Array.isArray(perf.schedules) || perf.schedules.length === 0) {
    return {
      status: 'no_schedule',
      isOngoing: false,
      isUpcoming: false,
      hasNoSchedule: true,
      isPast: false,
      isToday: false,
      closestOngoingEndMs: Number.MAX_SAFE_INTEGER,
      nextStartMs: Number.MAX_SAFE_INTEGER,
      lastEndMs: 0,
    };
  }

  let isOngoing = false;
  let isToday = false;
  let minOngoingEndMs = Number.MAX_SAFE_INTEGER;
  let minUpcomingStartMs = Number.MAX_SAFE_INTEGER;
  let maxEndMs = 0;
  let nextSchedule: PerformanceSchedule | undefined = undefined;

  for (const s of perf.schedules) {
    const { startMs, endMs } = getScheduleTimestamps(s);

    if (endMs > maxEndMs) {
      maxEndMs = endMs;
    }

    // 本日開催か判定
    if (s.date === todayJst || (s.endDate && todayJst >= s.date && todayJst <= s.endDate)) {
      isToday = true;
    }

    // 開催中判定 (now が startMs と endMs の間)
    if (nowMs >= startMs && nowMs <= endMs) {
      isOngoing = true;
      if (endMs < minOngoingEndMs) {
        minOngoingEndMs = endMs;
      }
    }

    // 開催前判定 (now が startMs より前)
    if (nowMs < startMs) {
      if (startMs < minUpcomingStartMs) {
        minUpcomingStartMs = startMs;
        nextSchedule = s;
      }
    }
  }

  if (isOngoing) {
    return {
      status: 'ongoing',
      isOngoing: true,
      isUpcoming: false,
      hasNoSchedule: false,
      isPast: false,
      isToday,
      closestOngoingEndMs: minOngoingEndMs,
      nextStartMs: minUpcomingStartMs,
      lastEndMs: maxEndMs,
      nextSchedule,
    };
  }

  if (minUpcomingStartMs !== Number.MAX_SAFE_INTEGER) {
    return {
      status: 'upcoming',
      isOngoing: false,
      isUpcoming: true,
      hasNoSchedule: false,
      isPast: false,
      isToday,
      closestOngoingEndMs: Number.MAX_SAFE_INTEGER,
      nextStartMs: minUpcomingStartMs,
      lastEndMs: maxEndMs,
      nextSchedule,
    };
  }

  // 全スケジュールが終了済み
  return {
    status: 'ended',
    isOngoing: false,
    isUpcoming: false,
    hasNoSchedule: false,
    isPast: true,
    isToday,
    closestOngoingEndMs: Number.MAX_SAFE_INTEGER,
    nextStartMs: Number.MAX_SAFE_INTEGER,
    lastEndMs: maxEndMs,
    nextSchedule: undefined,
  };
}

/**
 * トップページに表示する「PICK UP公演（最大6件）」を選定する
 *
 * 表示優先順位：
 * 1. 現在開催中の isFeatured=true の公演 (終了日時が近い順)
 * 2. これから開催される isFeatured=true の公演 (次回開始日時が近い順)
 * 3. 現在開催中の 通常公演 (終了日時が近い順)
 * 4. これから開催される 通常公演 (次回開始日時が近い順)
 * 5. 日程未登録の isFeatured=true の公演 (microCMSの順序維持)
 * 6. 日程未登録の 通常公演 (microCMSの順序維持)
 *
 * ※終了済み公演はトップページに表示しません。
 */
export function selectFeaturedPerformances(
  performances: Performance[],
  limit = 6,
  now: Date | number = new Date()
): Performance[] {
  if (!performances || performances.length === 0) {
    return [];
  }

  const enriched = performances.map((perf, index) => {
    const timing = getPerformanceTimingInfo(perf, now);
    return {
      perf,
      index,
      isFeatured: Boolean(perf.isFeatured),
      timing,
    };
  });

  // Group 1: 現在開催中の isFeatured=true の公演 (終了日時が近い順)
  const group1 = enriched
    .filter((item) => item.isFeatured && item.timing.status === 'ongoing')
    .sort((a, b) => a.timing.closestOngoingEndMs - b.timing.closestOngoingEndMs || a.index - b.index);

  // Group 2: これから開催される isFeatured=true の公演 (次回開始日時が近い順)
  const group2 = enriched
    .filter((item) => item.isFeatured && item.timing.status === 'upcoming')
    .sort((a, b) => a.timing.nextStartMs - b.timing.nextStartMs || a.index - b.index);

  // Group 3: 現在開催中の 通常公演 (終了日時が近い順)
  const group3 = enriched
    .filter((item) => !item.isFeatured && item.timing.status === 'ongoing')
    .sort((a, b) => a.timing.closestOngoingEndMs - b.timing.closestOngoingEndMs || a.index - b.index);

  // Group 4: これから開催される 通常公演 (次回開始日時が近い順)
  const group4 = enriched
    .filter((item) => !item.isFeatured && item.timing.status === 'upcoming')
    .sort((a, b) => a.timing.nextStartMs - b.timing.nextStartMs || a.index - b.index);

  // Group 5: 日程未登録の isFeatured=true の公演 (microCMS順序維持)
  const group5 = enriched
    .filter((item) => item.isFeatured && item.timing.status === 'no_schedule')
    .sort((a, b) => a.index - b.index);

  // Group 6: 日程未登録の 通常公演 (microCMS順序維持)
  const group6 = enriched
    .filter((item) => !item.isFeatured && item.timing.status === 'no_schedule')
    .sort((a, b) => a.index - b.index);

  const combined = [
    ...group1,
    ...group2,
    ...group3,
    ...group4,
    ...group5,
    ...group6,
  ];

  return combined.slice(0, limit).map((item) => item.perf);
}

/**
 * 公演一覧（/audience）用のソート処理
 *
 * ソート種別：
 * - 'date' (開催日順): 開催中 -> 開催前 -> 日程未登録 -> 終了済み
 * - 'featured' (おすすめ順): isFeatured=true 優先、次いで開催日順
 * - 'newest' (新着順): publishedAt / createdAt 降順
 * - 'title' (公演名順): 現在の言語のタイトルで localeCompare
 *
 * 日付フィルター指定時：
 * - 選択日に開催される公演を開始時刻昇順でソート（時刻未登録は後ろ）
 */
export function sortPerformances(
  performances: Performance[],
  sortOption: PerformanceSortOption = 'date',
  language: 'ja' | 'en' = 'ja',
  selectedDate = 'all',
  now: Date | number = new Date()
): Performance[] {
  if (!performances || performances.length === 0) {
    return [];
  }

  const enriched = performances.map((perf, index) => {
    const timing = getPerformanceTimingInfo(perf, now);
    return {
      perf,
      index,
      timing,
    };
  });

  // 日付フィルター指定時の専用ソート（当日の開始時刻順）
  if (selectedDate && selectedDate !== 'all') {
    return [...enriched]
      .sort((a, b) => {
        const getDayStartTimeMs = (item: typeof a) => {
          const matchingSchedule = item.perf.schedules?.find(
            (s) =>
              s.date === selectedDate ||
              (s.endDate && selectedDate >= s.date && selectedDate <= s.endDate)
          );
          if (!matchingSchedule) return Number.MAX_SAFE_INTEGER;
          if (!matchingSchedule.startTime) {
            // 時刻未登録は時刻登録済み公演の後ろ（当日23:59相当）
            return parseJstDateTime(selectedDate, undefined, 'end') + item.index;
          }
          return parseJstDateTime(selectedDate, matchingSchedule.startTime, 'start');
        };

        const timeA = getDayStartTimeMs(a);
        const timeB = getDayStartTimeMs(b);

        if (timeA !== timeB) {
          return timeA - timeB;
        }
        return a.index - b.index;
      })
      .map((item) => item.perf);
  }

  // 1. 開催日順 ('date')
  if (sortOption === 'date') {
    // 開催中 -> 開催前 -> 日程未登録 -> 終了済み
    const ongoing = enriched
      .filter((i) => i.timing.status === 'ongoing')
      .sort((a, b) => a.timing.closestOngoingEndMs - b.timing.closestOngoingEndMs || a.index - b.index);

    const upcoming = enriched
      .filter((i) => i.timing.status === 'upcoming')
      .sort((a, b) => a.timing.nextStartMs - b.timing.nextStartMs || a.index - b.index);

    const noSchedule = enriched
      .filter((i) => i.timing.status === 'no_schedule')
      .sort((a, b) => a.index - b.index);

    const ended = enriched
      .filter((i) => i.timing.status === 'ended')
      .sort((a, b) => b.timing.lastEndMs - a.timing.lastEndMs || a.index - b.index);

    return [...ongoing, ...upcoming, ...noSchedule, ...ended].map((i) => i.perf);
  }

  // 2. おすすめ順 ('featured')
  if (sortOption === 'featured') {
    const sortGroup = (items: typeof enriched) => {
      const ongoing = items
        .filter((i) => i.timing.status === 'ongoing')
        .sort((a, b) => a.timing.closestOngoingEndMs - b.timing.closestOngoingEndMs || a.index - b.index);

      const upcoming = items
        .filter((i) => i.timing.status === 'upcoming')
        .sort((a, b) => a.timing.nextStartMs - b.timing.nextStartMs || a.index - b.index);

      const noSchedule = items
        .filter((i) => i.timing.status === 'no_schedule')
        .sort((a, b) => a.index - b.index);

      const ended = items
        .filter((i) => i.timing.status === 'ended')
        .sort((a, b) => b.timing.lastEndMs - a.timing.lastEndMs || a.index - b.index);

      return [...ongoing, ...upcoming, ...noSchedule, ...ended];
    };

    const featuredItems = enriched.filter((i) => Boolean(i.perf.isFeatured));
    const normalItems = enriched.filter((i) => !i.perf.isFeatured);

    return [...sortGroup(featuredItems), ...sortGroup(normalItems)].map((i) => i.perf);
  }

  // 3. 新着順 ('newest')
  if (sortOption === 'newest') {
    return [...enriched]
      .sort((a, b) => {
        const dateA = a.perf.publishedAt || a.perf.createdAt || '';
        const dateB = b.perf.publishedAt || b.perf.createdAt || '';
        if (dateA && dateB) {
          const diff = new Date(dateB).getTime() - new Date(dateA).getTime();
          if (diff !== 0) return diff;
        } else if (dateA && !dateB) {
          return -1;
        } else if (!dateA && dateB) {
          return 1;
        }
        return a.index - b.index;
      })
      .map((item) => item.perf);
  }

  // 4. 公演名順 ('title')
  if (sortOption === 'title') {
    const langLocale = language === 'en' ? 'en' : 'ja';
    return [...enriched]
      .sort((a, b) => {
        const titleA = language === 'en' ? (a.perf.titleEn || a.perf.title) : a.perf.title;
        const titleB = language === 'en' ? (b.perf.titleEn || b.perf.title) : b.perf.title;
        const comp = titleA.localeCompare(titleB, langLocale, { numeric: true, sensitivity: 'base' });
        if (comp !== 0) return comp;
        return a.index - b.index;
      })
      .map((item) => item.perf);
  }

  return performances;
}

/**
 * 会場カードに表示する選択日の公演アイテム
 */
export interface VenuePerformanceItem {
  performance: Performance;
  schedule?: PerformanceSchedule;
  displayTime: string; // e.g. "14:00", "14:00〜15:30", "14:00 / 18:00", or ""
  hasSpecificTime: boolean;
  startMs: number;
  endMs: number;
}

/**
 * 全登録公演から開催日（YYYY-MM-DD）を一意に抽出し昇順ソートして取得
 * 複数日範囲（date〜endDate）の公演も全該当日を展開します。
 */
export function getAllFestivalDates(performances: Performance[]): string[] {
  const dateSet = new Set<string>();

  for (const perf of performances) {
    if (!perf.schedules || perf.schedules.length === 0) continue;

    for (const s of perf.schedules) {
      if (!s.date) continue;
      const cleanStart = s.date.trim().replace(/\//g, '-');
      if (!cleanStart) continue;

      if (s.endDate) {
        const cleanEnd = s.endDate.trim().replace(/\//g, '-');
        if (cleanEnd >= cleanStart) {
          // 日付範囲を展開 (最大60日の安全リミット)
          const startMs = parseJstDateTime(cleanStart, undefined, 'start');
          const endMs = parseJstDateTime(cleanEnd, undefined, 'end');
          let curMs = startMs;
          let iterations = 0;
          while (curMs <= endMs && iterations < 60) {
            const curDateStr = getJstDateString(curMs);
            dateSet.add(curDateStr);
            curMs += 24 * 60 * 60 * 1000;
            iterations++;
          }
          continue;
        }
      }

      dateSet.add(cleanStart);
    }
  }

  return Array.from(dateSet).sort();
}

/**
 * 公演が特定の会場に関連づけられているか判定
 */
export function isPerformanceAtVenue(perf: Performance, venueId: string): boolean {
  if (perf.venueId === venueId || perf.venue?.id === venueId) return true;
  if (perf.schedules && perf.schedules.some((s) => s.venueId === venueId || s.venue?.id === venueId)) {
    return true;
  }
  return false;
}

/**
 * 特定会場における、選択日の公演一覧を開始時刻順（重複なし）で取得
 */
export function getVenuePerformancesForDate(
  venueId: string,
  performances: Performance[],
  targetDate: string
): VenuePerformanceItem[] {
  if (!targetDate) return [];

  const matchedItemsMap = new Map<string, {
    performance: Performance;
    schedules: PerformanceSchedule[];
    earliestStartMs: number;
    latestEndMs: number;
    hasSpecificTime: boolean;
  }>();

  for (const perf of performances) {
    if (!perf.schedules || perf.schedules.length === 0) continue;

    const matchingSchedules: PerformanceSchedule[] = [];

    for (const s of perf.schedules) {
      // 会場一致確認（スケジュールの会場指定優先、未指定なら公演デフォルト会場）
      const schedVenueId = s.venueId || s.venue?.id || perf.venueId || perf.venue?.id;
      if (schedVenueId !== venueId) continue;

      // 日付一致確認（単一日 または 期間範囲内）
      const startDate = s.date ? s.date.trim().replace(/\//g, '-') : '';
      const endDate = s.endDate ? s.endDate.trim().replace(/\//g, '-') : startDate;

      if (startDate && targetDate >= startDate && targetDate <= endDate) {
        matchingSchedules.push(s);
      }
    }

    if (matchingSchedules.length > 0) {
      let earliestStartMs = Number.MAX_SAFE_INTEGER;
      let latestEndMs = 0;
      let hasSpecificTime = false;

      for (const s of matchingSchedules) {
        const start = parseJstDateTime(targetDate, s.startTime, 'start');
        const end = parseJstDateTime(targetDate, s.endTime, 'end');
        if (s.startTime && s.startTime.trim()) {
          hasSpecificTime = true;
        }
        if (start < earliestStartMs) earliestStartMs = start;
        if (end > latestEndMs) latestEndMs = end;
      }

      const existing = matchedItemsMap.get(perf.id);
      if (existing) {
        existing.schedules.push(...matchingSchedules);
        if (earliestStartMs < existing.earliestStartMs) existing.earliestStartMs = earliestStartMs;
        if (latestEndMs > existing.latestEndMs) existing.latestEndMs = latestEndMs;
        if (hasSpecificTime) existing.hasSpecificTime = true;
      } else {
        matchedItemsMap.set(perf.id, {
          performance: perf,
          schedules: matchingSchedules,
          earliestStartMs,
          latestEndMs,
          hasSpecificTime,
        });
      }
    }
  }

  const items: VenuePerformanceItem[] = [];

  for (const entry of matchedItemsMap.values()) {
    // 時間表示の生成（重複排除してソート）
    const timeLabels = entry.schedules
      .map((s) => {
        if (!s.startTime || !s.startTime.trim()) return '';
        if (s.endTime && s.endTime.trim()) {
          return `${s.startTime}〜${s.endTime}`;
        }
        return s.startTime;
      })
      .filter(Boolean);

    const uniqueTimeLabels = Array.from(new Set(timeLabels));
    const displayTime = uniqueTimeLabels.join(' / ');

    items.push({
      performance: entry.performance,
      schedule: entry.schedules[0],
      displayTime,
      hasSpecificTime: entry.hasSpecificTime,
      startMs: entry.earliestStartMs,
      endMs: entry.latestEndMs,
    });
  }

  // ソート順：
  // 1. 開始時刻が登録されている公演（startMs 昇順）
  // 2. 時刻未登録（終日等）の公演
  items.sort((a, b) => {
    if (a.hasSpecificTime && b.hasSpecificTime) {
      return a.startMs - b.startMs;
    }
    if (a.hasSpecificTime && !b.hasSpecificTime) {
      return -1;
    }
    if (!a.hasSpecificTime && b.hasSpecificTime) {
      return 1;
    }
    return 0;
  });

  return items;
}

/**
 * 「すべての日程」表示時用：各会場の次回公演（最大maxCount件）を取得
 */
export interface VenueUpcomingPerformanceItem {
  performance: Performance;
  schedule?: PerformanceSchedule;
  displayDateTime: string; // e.g. "10/01 14:00" or "10/01〜10/08"
  startMs: number;
  isOngoing: boolean;
  isUpcoming: boolean;
  isEnded: boolean;
}

export function getVenueUpcomingPerformances(
  venueId: string,
  performances: Performance[],
  nowMs: number = Date.now(),
  maxCount: number = 3
): VenueUpcomingPerformanceItem[] {
  const venueShows = performances.filter((p) => isPerformanceAtVenue(p, venueId));
  const candidateItems: VenueUpcomingPerformanceItem[] = [];

  for (const perf of venueShows) {
    if (!perf.schedules || perf.schedules.length === 0) continue;

    for (const s of perf.schedules) {
      const schedVenueId = s.venueId || s.venue?.id || perf.venueId || perf.venue?.id;
      if (schedVenueId !== venueId) continue;

      const { startMs, endMs } = getScheduleTimestamps(s);
      const isOngoing = startMs <= nowMs && nowMs <= endMs;
      const isUpcoming = nowMs < startMs;
      const isEnded = nowMs > endMs;

      // 日時表示文字列
      let displayDateTime = s.date || '';
      if (s.endDate && s.endDate !== s.date) {
        displayDateTime = `${s.date}〜${s.endDate}`;
      }
      if (s.startTime) {
        displayDateTime += ` ${s.startTime}`;
      }

      candidateItems.push({
        performance: perf,
        schedule: s,
        displayDateTime,
        startMs,
        isOngoing,
        isUpcoming,
        isEnded,
      });
    }
  }

  // 1. 開催中・開催前（startMs 昇順）
  const activeOrUpcoming = candidateItems
    .filter((item) => item.isOngoing || item.isUpcoming)
    .sort((a, b) => {
      if (a.isOngoing && !b.isOngoing) return -1;
      if (!a.isOngoing && b.isOngoing) return 1;
      return a.startMs - b.startMs;
    });

  // 公演IDで重複排除
  const seenPerfIds = new Set<string>();
  const results: VenueUpcomingPerformanceItem[] = [];

  for (const item of activeOrUpcoming) {
    if (!seenPerfIds.has(item.performance.id)) {
      seenPerfIds.add(item.performance.id);
      results.push(item);
      if (results.length >= maxCount) break;
    }
  }

  // 開催中・開催前が足りない場合、直近の終了済み公演を補完
  if (results.length < maxCount) {
    const endedItems = candidateItems
      .filter((item) => item.isEnded)
      .sort((a, b) => b.startMs - a.startMs);

    for (const item of endedItems) {
      if (!seenPerfIds.has(item.performance.id)) {
        seenPerfIds.add(item.performance.id);
        results.push(item);
        if (results.length >= maxCount) break;
      }
    }
  }

  return results;
}

/**
 * 選択日における会場一覧のソート・フィルタリング
 * - 選択日に公演がある会場のみ抽出
 * - その日の最初の公演開始時刻が早い順にソート（時刻未登録は後方）
 */
export function sortVenuesForDate<T extends { id: string }>(
  venues: T[],
  performances: Performance[],
  targetDate: string,
  isDemoMode: boolean = false
): { venue: T; shows: VenuePerformanceItem[]; earliestStartMs: number }[] {
  const enriched = venues.map((v) => {
    const shows = getVenuePerformancesForDate(v.id, performances, targetDate);
    const hasTimed = shows.some((s) => s.hasSpecificTime);
    const earliestStartMs = shows.length > 0 ? shows[0].startMs : Number.MAX_SAFE_INTEGER;
    return {
      venue: v,
      shows,
      hasTimed,
      hasShows: shows.length > 0,
      earliestStartMs,
    };
  });

  // デモモード以外は公演がある会場のみ
  const filtered = isDemoMode ? enriched : enriched.filter((item) => item.hasShows);

  filtered.sort((a, b) => {
    // 1. 公演の有無（デモモード用）
    if (a.hasShows && !b.hasShows) return -1;
    if (!a.hasShows && b.hasShows) return 1;

    // 2. 時刻指定がある公演を持つ会場優先
    if (a.hasTimed && !b.hasTimed) return -1;
    if (!a.hasTimed && b.hasTimed) return 1;

    // 3. 最初の公演開始時刻が早い順
    if (a.earliestStartMs !== b.earliestStartMs) {
      return a.earliestStartMs - b.earliestStartMs;
    }

    return 0;
  });

  return filtered;
}

/**
 * 「すべての日程」における会場一覧のソート・フィルタリング
 * - 次回開催日時が近い会場から並べる
 * - 終了済み公演しかない会場は今後の公演がある会場より後に表示
 */
export function sortVenuesForAllDates<T extends { id: string }>(
  venues: T[],
  performances: Performance[],
  nowMs: number = Date.now(),
  isDemoMode: boolean = false
): { venue: T; nextShows: VenueUpcomingPerformanceItem[]; status: 'ongoing' | 'upcoming' | 'ended' | 'none'; nextStartMs: number }[] {
  const enriched = venues.map((v) => {
    const nextShows = getVenueUpcomingPerformances(v.id, performances, nowMs, 3);
    const hasOngoing = nextShows.some((s) => s.isOngoing);
    const hasUpcoming = nextShows.some((s) => s.isUpcoming);
    const hasEnded = nextShows.some((s) => s.isEnded);

    let status: 'ongoing' | 'upcoming' | 'ended' | 'none' = 'none';
    let nextStartMs = Number.MAX_SAFE_INTEGER;

    if (hasOngoing) {
      status = 'ongoing';
      const ongoing = nextShows.find((s) => s.isOngoing);
      if (ongoing) nextStartMs = ongoing.startMs;
    } else if (hasUpcoming) {
      status = 'upcoming';
      const upcoming = nextShows.find((s) => s.isUpcoming);
      if (upcoming) nextStartMs = upcoming.startMs;
    } else if (hasEnded) {
      status = 'ended';
      const ended = nextShows.find((s) => s.isEnded);
      if (ended) nextStartMs = ended.startMs;
    }

    return {
      venue: v,
      nextShows,
      status,
      nextStartMs,
      hasPerformances: performances.some((p) => isPerformanceAtVenue(p, v.id)),
    };
  });

  const filtered = isDemoMode
    ? enriched
    : enriched.filter((item) => {
        const venueShows = performances.filter((p) => isPerformanceAtVenue(p, item.venue.id));
        return venueShows.length > 0;
      });

  filtered.sort((a, b) => {
    const priority = { ongoing: 1, upcoming: 2, ended: 3, none: 4 };
    if (priority[a.status] !== priority[b.status]) {
      return priority[a.status] - priority[b.status];
    }

    // 開催中・開催前は開始日時昇順
    if (a.status === 'ongoing' || a.status === 'upcoming') {
      return a.nextStartMs - b.nextStartMs;
    }

    // 終了済みは終了が最近のもの（startMs降順）
    if (a.status === 'ended') {
      return b.nextStartMs - a.nextStartMs;
    }

    return 0;
  });

  return filtered;
}

/**
 * 次に公演が開催される日付（currentDateより後の直近日付）を取得
 */
export function getNextAvailableDate(allDates: string[], currentDate: string): string | null {
  if (!allDates || allDates.length === 0) return null;
  const normalizedCurrent = currentDate ? currentDate.trim().replace(/\//g, '-') : '';

  if (!normalizedCurrent || normalizedCurrent < allDates[0]) {
    return allDates[0];
  }

  for (const date of allDates) {
    if (date > normalizedCurrent) {
      return date;
    }
  }

  return null;
}