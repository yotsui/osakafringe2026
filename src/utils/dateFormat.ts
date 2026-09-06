import { PerformanceSchedule } from '@/types';

const JA_DAY_NAMES = ['日', '月', '火', '水', '木', '金', '土'];
const EN_MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const EN_DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/**
 * 日付文字列（YYYY-MM-DD または YYYY/MM/DD）を日本語または英語の日付形式にフォーマット
 * 日本語: 10/30（金）15:00〜 / 10/30（金）15:00〜16:00
 * 英語: Oct 30 (Fri) 15:00 / Oct 30 (Fri) 15:00 - 16:00
 */
export function formatScheduleDate(
  dateStr?: string,
  startTime?: string,
  endTime?: string,
  lang: 'ja' | 'en' = 'ja'
): string {
  if (!dateStr || !dateStr.trim()) {
    return startTime ? (lang === 'en' ? startTime : `${startTime}〜`) : '';
  }

  const cleanDate = dateStr.trim().replace(/\//g, '-');
  const parts = cleanDate.split('-');
  
  let month = 10;
  let day = 8;
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

  const cleanStart = startTime ? startTime.trim() : '';
  const cleanEnd = endTime ? endTime.trim() : '';

  if (lang === 'en') {
    const monthName = EN_MONTH_NAMES[month - 1] || 'Oct';
    const dayStr = dayOfWeek ? ` (${dayOfWeek})` : '';
    let timeStr = '';
    if (cleanStart && cleanEnd && cleanStart !== cleanEnd) {
      timeStr = ` ${cleanStart} - ${cleanEnd}`;
    } else if (cleanStart) {
      timeStr = ` ${cleanStart}`;
    }
    return `${monthName} ${day}${dayStr}${timeStr}`.trim();
  }

  // 日本語
  const dayStr = dayOfWeek ? `（${dayOfWeek}）` : '';
  let timeStr = '';
  if (cleanStart && cleanEnd && cleanStart !== cleanEnd) {
    timeStr = ` ${cleanStart}〜${cleanEnd}`;
  } else if (cleanStart) {
    timeStr = ` ${cleanStart}〜`;
  }
  return `${month}/${day}${dayStr}${timeStr}`.trim();
}

/**
 * スケジュール一覧を日時順にソート
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
 * 同一日時・同一会場の重複スケジュールを排除
 */
export function deduplicateSchedules(schedules: PerformanceSchedule[]): PerformanceSchedule[] {
  if (!schedules || !Array.isArray(schedules)) return [];

  const seen = new Set<string>();
  const result: PerformanceSchedule[] = [];

  for (const s of schedules) {
    const key = `${s.date || ''}_${s.startTime || ''}_${s.endTime || ''}_${s.venueId || s.venueName || ''}`;
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
