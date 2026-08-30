import { Performance } from '@/types';

/**
 * 公演の日時情報（過去かどうか、次回開催日、最終開催日）を計算する
 */
export function getPerformanceTimingInfo(perf: Performance, now = new Date()) {
  if (!perf.schedules || perf.schedules.length === 0) {
    return {
      isPast: false,
      nextScheduleTime: Number.MAX_SAFE_INTEGER,
      lastScheduleTime: 0,
    };
  }

  let isPast = true;
  let minFutureDiff = Number.MAX_SAFE_INTEGER;
  let nextScheduleTime = Number.MAX_SAFE_INTEGER;
  let maxPastTime = -1;

  const nowTime = now.getTime();

  for (const s of perf.schedules) {
    const timeStr = s.endTime || s.startTime || '23:59';
    const d = new Date(`${s.date}T${timeStr}`);
    const time = isNaN(d.getTime()) ? new Date(s.date).getTime() : d.getTime();

    if (time >= nowTime) {
      isPast = false;
      const diff = time - nowTime;
      if (diff < minFutureDiff) {
        minFutureDiff = diff;
        nextScheduleTime = time;
      }
    } else {
      if (time > maxPastTime) {
        maxPastTime = time;
      }
    }
  }

  return {
    isPast,
    nextScheduleTime: isPast ? Number.MAX_SAFE_INTEGER : nextScheduleTime,
    lastScheduleTime: maxPastTime === -1 ? 0 : maxPastTime,
  };
}

/**
 * トップページ等に表示する「注目のハイライト公演 (3件)」を選定する
 *
 * 優先順位:
 * 1. これからの isFeatured 公演 (開催日が近い順)
 * 2. これからの 通常公演 (開催日が近い順)
 * 3. 過去の isFeatured 公演 (もっとも新しい＝終了日が直近の順)
 * 4. 過去の 通常公演 (もっとも新しい＝終了日が直近の順)
 *
 * 上記の順で結合し、常に3件（または全件数が3件未満なら全件）を返します。
 */
export function selectFeaturedPerformances(performances: Performance[], limit = 3, now = new Date()): Performance[] {
  if (!performances || performances.length === 0) {
    return [];
  }

  const enriched = performances.map((perf) => {
    const timing = getPerformanceTimingInfo(perf, now);
    return {
      perf,
      isFeatured: !!perf.isFeatured,
      isPast: timing.isPast,
      nextScheduleTime: timing.nextScheduleTime,
      lastScheduleTime: timing.lastScheduleTime,
    };
  });

  // Group 1: 今後の Featured (次回開催日時が近い順)
  const group1 = enriched
    .filter((item) => item.isFeatured && !item.isPast)
    .sort((a, b) => a.nextScheduleTime - b.nextScheduleTime);

  // Group 2: 今後の 通常公演 (次回開催日時が近い順)
  const group2 = enriched
    .filter((item) => !item.isFeatured && !item.isPast)
    .sort((a, b) => a.nextScheduleTime - b.nextScheduleTime);

  // Group 3: 過去の Featured (最新の終了日時が降順＝直近終わった順)
  const group3 = enriched
    .filter((item) => item.isFeatured && item.isPast)
    .sort((a, b) => b.lastScheduleTime - a.lastScheduleTime);

  // Group 4: 過去の 通常公演 (最新の終了日時が降順＝直近終わった順)
  const group4 = enriched
    .filter((item) => !item.isFeatured && item.isPast)
    .sort((a, b) => b.lastScheduleTime - a.lastScheduleTime);

  // 1 -> 2 -> 3 -> 4 の優先順位で結合
  const combined = [...group1, ...group2, ...group3, ...group4];

  return combined.slice(0, limit).map((item) => item.perf);
}