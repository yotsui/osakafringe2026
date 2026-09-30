import type { Performance, PerformanceSchedule } from '../types/index.ts';
import {
  isExhibitionPerformance,
  getScheduleTimestamps,
  isPreFestivalSchedule,
} from './performanceUtils.ts';
import { formatDateHeading, formatSessionTime } from './dateFormat.ts';

export interface VenueSessionItem {
  id: string;
  performance: Performance;
  schedule?: PerformanceSchedule;
  dateKey: string;
  startMs: number;
  endMs: number;
  isMultiDay: boolean;
  isExhibition: boolean;
  isPreFestival: boolean;
  timeDisplay: string;
}

export interface VenueDateGroup {
  dateKey: string;
  heading: string;
  isUnscheduled: boolean;
  sessions: VenueSessionItem[];
}

/**
 * 会場詳細ページ用：該当会場の公演日程を日付ごとにグループ化し、開演時刻順にソートして返却
 *
 * 要件：
 * 1. 日付の昇順でグループ化
 * 2. 各日付内では開演時刻（JST）の早い順に並べる
 * 3. 同じ公演が異なる時刻にある場合、それぞれの時間帯に表示
 * 4. 並べ替えには元のタイムスタンプ・時刻を使い、表示用文字列を比較しない
 * 5. 同時刻の場合は公演名・公演IDで順序を安定化
 * 6. 過去の日程も含めて全日程表示
 * 7. 期間展示は毎日分を大量生成せず、1つの期間表示として開始日順に配置
 * 8. 該当会場の日程のみ表示（日程側の会場指定優先、未指定時はメイン会場。別会場の日程へのフォールバックはしない）
 */
export function getVenueDateGroups(
  venueId: string,
  performances: Performance[],
  lang: 'ja' | 'en' = 'ja'
): VenueDateGroup[] {
  if (!venueId || !performances || performances.length === 0) {
    return [];
  }

  const sessionItems: VenueSessionItem[] = [];

  for (const perf of performances) {
    const isExhibition = isExhibitionPerformance(perf);
    const rawSchedules = perf.schedules || [];

    // 会場一致スケジュールの抽出
    const venueMatchingSchedules = rawSchedules.filter((s) => {
      const sVenueId = s.venueId || s.venue?.id || perf.venueId || perf.venue?.id;
      return sVenueId === venueId;
    });

    // スケジュール未登録で、メイン会場がこの会場の場合
    if (rawSchedules.length === 0) {
      const isMainVenue = perf.venueId === venueId || perf.venue?.id === venueId;
      if (isMainVenue) {
        sessionItems.push({
          id: `${perf.id}-unscheduled`,
          performance: perf,
          schedule: undefined,
          dateKey: 'unscheduled',
          startMs: Number.MAX_SAFE_INTEGER,
          endMs: Number.MAX_SAFE_INTEGER,
          isMultiDay: false,
          isExhibition,
          isPreFestival: false,
          timeDisplay: lang === 'en' ? 'Time TBD' : '時間未定',
        });
      }
      continue;
    }

    // 該当会場に一致するスケジュールがない場合は、他会場の日程を一切混ぜない
    if (venueMatchingSchedules.length === 0) {
      continue;
    }

    if (isExhibition) {
      // 期間展示：重複や日別行を大量生成せず、1つの期間表示として開始日順に配置
      const validSchedules = venueMatchingSchedules.filter((s) => s.date && s.date.trim());
      if (validSchedules.length > 0) {
        let minStartDate = validSchedules[0].date!.trim().replace(/\//g, '-');
        let maxEndDate = (validSchedules[0].endDate || validSchedules[0].date)!.trim().replace(/\//g, '-');
        let primarySchedule = validSchedules[0];

        for (const s of validSchedules) {
          const sDate = s.date!.trim().replace(/\//g, '-');
          const sEnd = (s.endDate || s.date)!.trim().replace(/\//g, '-');
          if (sDate < minStartDate) {
            minStartDate = sDate;
            primarySchedule = s;
          }
          if (sEnd > maxEndDate) {
            maxEndDate = sEnd;
          }
        }

        const consolidatedSchedule: PerformanceSchedule = {
          ...primarySchedule,
          date: minStartDate,
          endDate: maxEndDate !== minStartDate ? maxEndDate : undefined,
        };

        const { startMs, endMs } = getScheduleTimestamps(consolidatedSchedule);
        const timeDisplay = formatSessionTime(consolidatedSchedule, true, lang);
        const isPre = isPreFestivalSchedule(consolidatedSchedule);

        sessionItems.push({
          id: `${perf.id}-exhibition`,
          performance: perf,
          schedule: consolidatedSchedule,
          dateKey: minStartDate,
          startMs,
          endMs,
          isMultiDay: Boolean(consolidatedSchedule.endDate && consolidatedSchedule.endDate !== consolidatedSchedule.date),
          isExhibition: true,
          isPreFestival: isPre,
          timeDisplay,
        });
      } else {
        // 日付のない展示スケジュール
        sessionItems.push({
          id: `${perf.id}-exhibition-unscheduled`,
          performance: perf,
          schedule: venueMatchingSchedules[0],
          dateKey: 'unscheduled',
          startMs: Number.MAX_SAFE_INTEGER,
          endMs: Number.MAX_SAFE_INTEGER,
          isMultiDay: false,
          isExhibition: true,
          isPreFestival: false,
          timeDisplay: formatSessionTime(venueMatchingSchedules[0], true, lang),
        });
      }
    } else {
      // 通常公演：重複を排除しつつ、各開催回ごとにセッションを作成
      const seenKeys = new Set<string>();

      for (const s of venueMatchingSchedules) {
        if (!s.date || !s.date.trim()) {
          sessionItems.push({
            id: `${perf.id}-unscheduled-${sessionItems.length}`,
            performance: perf,
            schedule: s,
            dateKey: 'unscheduled',
            startMs: Number.MAX_SAFE_INTEGER,
            endMs: Number.MAX_SAFE_INTEGER,
            isMultiDay: false,
            isExhibition: false,
            isPreFestival: false,
            timeDisplay: formatSessionTime(s, false, lang),
          });
          continue;
        }

        const cleanDate = s.date.trim().replace(/\//g, '-');
        const cleanStart = s.startTime ? s.startTime.trim() : '';
        const cleanEnd = s.endTime ? s.endTime.trim() : '';
        const cleanEndDate = s.endDate ? s.endDate.trim().replace(/\//g, '-') : '';

        const key = `${cleanDate}_${cleanStart}_${cleanEndDate}_${cleanEnd}`;
        if (seenKeys.has(key)) continue;
        seenKeys.add(key);

        const { startMs, endMs } = getScheduleTimestamps(s);
        const timeDisplay = formatSessionTime(s, false, lang);
        const isPre = isPreFestivalSchedule(s);

        sessionItems.push({
          id: `${perf.id}-${key}`,
          performance: perf,
          schedule: s,
          dateKey: cleanDate,
          startMs,
          endMs,
          isMultiDay: Boolean(cleanEndDate && cleanEndDate !== cleanDate),
          isExhibition: false,
          isPreFestival: isPre,
          timeDisplay,
        });
      }
    }
  }

  // 日付グループへ集約
  const groupMap = new Map<string, VenueSessionItem[]>();
  for (const item of sessionItems) {
    const list = groupMap.get(item.dateKey) || [];
    list.push(item);
    groupMap.set(item.dateKey, list);
  }

  // 各グループ内のソート
  // 1. startMs 昇順（JST時刻基準）
  // 2. 時刻が同じ場合: 公演タイトル localeCompare -> 公演ID localeCompare
  for (const list of groupMap.values()) {
    list.sort((a, b) => {
      if (a.startMs !== b.startMs) {
        return a.startMs - b.startMs;
      }
      const titleA = lang === 'en' ? (a.performance.titleEn || a.performance.title) : a.performance.title;
      const titleB = lang === 'en' ? (b.performance.titleEn || b.performance.title) : b.performance.title;
      const comp = (titleA || '').localeCompare(titleB || '', lang === 'en' ? 'en' : 'ja', { numeric: true });
      if (comp !== 0) return comp;
      return a.performance.id.localeCompare(b.performance.id);
    });
  }

  // 日付グループ自体のソート（YYYY-MM-DD 昇順、'unscheduled' は最後）
  const sortedDateKeys = Array.from(groupMap.keys()).sort((a, b) => {
    if (a === 'unscheduled') return 1;
    if (b === 'unscheduled') return -1;
    return a.localeCompare(b);
  });

  return sortedDateKeys.map((dateKey) => ({
    dateKey,
    heading: formatDateHeading(dateKey, lang),
    isUnscheduled: dateKey === 'unscheduled',
    sessions: groupMap.get(dateKey) || [],
  }));
}
