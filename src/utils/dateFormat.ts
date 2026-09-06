import type { PerformanceSchedule } from '../types';

const JA_DAY_NAMES = ['日', '月', '火', '水', '木', '金', '土'];
const EN_MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const EN_DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/**
 * YYYY-MM-DD 文字列から日付（月、日、曜日）を整形
 * 例: "2026-10-01" -> 日本語: "10/1（木）", 英語: "Oct 1 (Thu)"
 */
export function formatDatePart(dateStr?: string, lang: 'ja' | 'en' = 'ja'): string {
  if (!dateStr || !dateStr.trim()) return '';

  const cleanDate = dateStr.trim().replace(/\//g, '-');
  const parts = cleanDate.split('-');

  let month = 10;
  let day = 1;
  let dayOfWeek = '';

  if (parts.length >= 3) {
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    const d = parseInt(parts[2], 10);

    if (!isNaN(m) && !isNaN(d)) {
      month = m;
      day = d;
      const dateObj = new Date(y, m - 1, d);
      if (!isNaN(dateObj.getTime())) {
        const dayIdx = dateObj.getDay();
        dayOfWeek = lang === 'en' ? EN_DAY_NAMES[dayIdx] : JA_DAY_NAMES[dayIdx];
      }
    }
  }

  if (lang === 'en') {
    const monthName = EN_MONTH_NAMES[month - 1] || 'Oct';
    const dayStr = dayOfWeek ? ` (${dayOfWeek})` : '';
    return `${monthName} ${day}${dayStr}`.trim();
  }

  const dayStr = dayOfWeek ? `（${dayOfWeek}）` : '';
  return `${month}/${day}${dayStr}`.trim();
}

/**
 * 一覧カード用の日時フォーマット (Compact)
 * - 同日終了: 10/1（木）15:00〜16:30 / Oct 1 (Thu) 15:00 - 16:30
 * - 終了不明: 10/1（木）15:00〜 / Oct 1 (Thu) 15:00
 * - 複数日公演: 10/1（木）〜10/8（木） / Oct 1 (Thu) - Oct 8 (Thu)
 */
export function formatScheduleCompact(
  schedule: PerformanceSchedule,
  lang: 'ja' | 'en' = 'ja'
): string {
  const { date, startTime, endDate, endTime } = schedule;
  if (!date) return '';

  const startFormattedDate = formatDatePart(date, lang);
  const cleanStart = startTime ? startTime.trim() : '';
  const cleanEnd = endTime ? endTime.trim() : '';

  const isMultiDay = Boolean(endDate && endDate !== date);

  if (isMultiDay) {
    const endFormattedDate = formatDatePart(endDate, lang);
    if (lang === 'en') {
      return `${startFormattedDate} - ${endFormattedDate}`.trim();
    }
    return `${startFormattedDate}〜${endFormattedDate}`.trim();
  }

  // 同日公演
  if (lang === 'en') {
    if (cleanStart && cleanEnd && cleanStart !== cleanEnd) {
      return `${startFormattedDate} ${cleanStart} - ${cleanEnd}`.trim();
    }
    if (cleanStart) {
      return `${startFormattedDate} ${cleanStart}`.trim();
    }
    return startFormattedDate;
  }

  // 日本語
  if (cleanStart && cleanEnd && cleanStart !== cleanEnd) {
    return `${startFormattedDate}${cleanStart}〜${cleanEnd}`.trim();
  }
  if (cleanStart) {
    return `${startFormattedDate}${cleanStart}〜`.trim();
  }
  return startFormattedDate;
}

/**
 * 詳細モーダル用の日時フォーマット (Detailed)
 * - 同日終了: 10/1（木）15:00〜16:30 / Oct 1 (Thu) 15:00 - 16:30
 * - 終了不明: 10/1（木）15:00〜 / Oct 1 (Thu) 15:00
 * - 複数日公演: 10/1（木）15:00 〜 10/8（木）18:00 / Oct 1 (Thu) 15:00 - Oct 8 (Thu) 18:00
 */
export function formatScheduleDetailed(
  schedule: PerformanceSchedule,
  lang: 'ja' | 'en' = 'ja'
): string {
  const { date, startTime, endDate, endTime } = schedule;
  if (!date) return '';

  const startFormattedDate = formatDatePart(date, lang);
  const cleanStart = startTime ? startTime.trim() : '';
  const cleanEnd = endTime ? endTime.trim() : '';

  const isMultiDay = Boolean(endDate && endDate !== date);

  if (isMultiDay) {
    const endFormattedDate = formatDatePart(endDate, lang);
    if (lang === 'en') {
      const startPart = cleanStart ? `${startFormattedDate} ${cleanStart}` : startFormattedDate;
      const endPart = cleanEnd ? `${endFormattedDate} ${cleanEnd}` : endFormattedDate;
      return `${startPart} - ${endPart}`.trim();
    }
    const startPart = cleanStart ? `${startFormattedDate}${cleanStart}` : startFormattedDate;
    const endPart = cleanEnd ? `${endFormattedDate}${cleanEnd}` : endFormattedDate;
    return `${startPart} 〜 ${endPart}`.trim();
  }

  // 同日公演（Compact と同様）
  if (lang === 'en') {
    if (cleanStart && cleanEnd && cleanStart !== cleanEnd) {
      return `${startFormattedDate} ${cleanStart} - ${cleanEnd}`.trim();
    }
    if (cleanStart) {
      return `${startFormattedDate} ${cleanStart}`.trim();
    }
    return startFormattedDate;
  }

  // 日本語
  if (cleanStart && cleanEnd && cleanStart !== cleanEnd) {
    return `${startFormattedDate}${cleanStart}〜${cleanEnd}`.trim();
  }
  if (cleanStart) {
    return `${startFormattedDate}${cleanStart}〜`.trim();
  }
  return startFormattedDate;
}

/**
 * 後方互換性用（従来の単一関数呼び出しに対応）
 */
export function formatScheduleDate(
  dateStr?: string,
  startTime?: string,
  endTime?: string,
  lang: 'ja' | 'en' = 'ja'
): string {
  return formatScheduleCompact({ date: dateStr || '', startTime: startTime || '', endTime: endTime || '' }, lang);
}

/**
 * スケジュール一覧を日時順にソート (開始日昇順 -> 開始時刻昇順)
 */
export function sortSchedules(schedules: PerformanceSchedule[]): PerformanceSchedule[] {
  if (!schedules || !Array.isArray(schedules)) return [];

  return [...schedules].sort((a, b) => {
    const dateA = a.date || '';
    const dateB = b.date || '';
    if (dateA !== dateB) {
      return dateA.localeCompare(dateB);
    }
    const timeA = a.startTime || '';
    const timeB = b.startTime || '';
    return timeA.localeCompare(timeB);
  });
}

/**
 * 同一日時・同一終了日時・同一会場の重複スケジュールを排除
 */
export function deduplicateSchedules(schedules: PerformanceSchedule[]): PerformanceSchedule[] {
  if (!schedules || !Array.isArray(schedules)) return [];

  const seen = new Set<string>();
  const result: PerformanceSchedule[] = [];

  for (const s of schedules) {
    const key = `${s.date || ''}_${s.startTime || ''}_${s.endDate || ''}_${s.endTime || ''}_${s.venueId || s.venueName || ''}`;
    if (!seen.has(key)) {
      seen.add(key);
      result.push(s);
    }
  }

  return result;
}

/**
 * スケジュールリストが単一会場か複数会場かを判定
 */
export function hasMultipleVenues(schedules: PerformanceSchedule[]): boolean {
  if (!schedules || schedules.length <= 1) return false;
  const firstVenue = schedules[0].venueId || schedules[0].venueName || '';
  return schedules.some((s) => (s.venueId || s.venueName || '') !== firstVenue);
}
