/**
 * OSAKA FRINGE 2026 公開公演一覧CSVエクスポート & 検証スクリプト（ローカル専用）
 *
 * 使い方:
 *   npm run export:public-performances
 *
 * 出力ファイル:
 *   - exports/public_performances_2026.csv (UTF-8 BOM付きCSV: 日付,出演者,作品名,会場名)
 *   - exports/public_performances_audit.json (検証レポートJSON)
 *   - exports/public_performances_audit.txt (人間確認用テキストレポート)
 */

import fs from 'node:fs';
import path from 'node:path';
import { createClient } from 'microcms-js-sdk';

// ============================================================================
// 1. 環境変数の読み込み (.env.local / .env)
// ============================================================================
function loadEnvFile(filePath: string) {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, 'utf8');
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    let val = trimmed.slice(eqIdx + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (process.env[key] === undefined) {
      process.env[key] = val;
    }
  }
}

loadEnvFile(path.resolve(process.cwd(), '.env.local'));
loadEnvFile(path.resolve(process.cwd(), '.env'));

const rawServiceDomain = process.env.MICROCMS_SERVICE_DOMAIN || '';
const serviceDomain = rawServiceDomain
  .trim()
  .replace(/^https?:\/\//i, '')
  .replace(/\.microcms\.io\/?$/i, '')
  .replace(/\/$/, '');
const apiKey = (process.env.MICROCMS_API_KEY || '').trim();

if (!serviceDomain || !apiKey) {
  console.error(
    '[ERROR] MICROCMS_SERVICE_DOMAIN または MICROCMS_API_KEY が設定されていません。.env.local を確認してください。'
  );
  process.exit(1);
}

const client = createClient({
  serviceDomain,
  apiKey,
});

// ============================================================================
// 2. 長期開催プログラムの明示的ID管理
// ============================================================================
/**
 * AxCROSSおよびコングレスクエア大阪中之島の長期開催プログラムID定義
 * 単純な会場名一致ではなく、確認済みの公演IDで明示的に管理する。
 */
export const LONG_TERM_PERFORMANCE_CONFIG: Record<
  string,
  { venueGroup: 'AxCROSS' | 'コングレ中之島'; expectedVenueId: string; note: string }
> = {
  // AxCROSS 長期開催プログラム（映像展示 5作品）
  '9thpr_sps_q1': {
    venueGroup: 'AxCROSS',
    expectedVenueId: 'axcross',
    note: 'AxCROSS 映像展示（丹野 健史 / コンティレンマ／大阪 — アクロス・エディション）',
  },
  '6ciqb6xlxg_s': {
    venueGroup: 'AxCROSS',
    expectedVenueId: 'axcross',
    note: 'AxCROSS 映像展示（友安製作所 / 日常のときめきを探しにいこう！）',
  },
  t1fsz7wlv: {
    venueGroup: 'AxCROSS',
    expectedVenueId: 'axcross',
    note: 'AxCROSS 映像展示（佐海ずう / 死ぬより先に飯を食えin大阪！）',
  },
  t3mlvpp6f: {
    venueGroup: 'AxCROSS',
    expectedVenueId: 'axcross',
    note: 'AxCROSS 映像展示（Square Motion Art / ICHIGO ICHIE 一期一会 ライブペインティングパフォーマンス - CIRCLE OF PEACE -）',
  },
  'a-ebezqfq9b': {
    venueGroup: 'AxCROSS',
    expectedVenueId: 'axcross',
    note: 'AxCROSS 映像展示（CHOP POP / The Girl Is A Fan Of The Band）',
  },
  // コングレスクエア大阪中之島 長期開催プログラム（作品展示 2作品）
  '6rjxvkxpl': {
    venueGroup: 'コングレ中之島',
    expectedVenueId: 'congres-square-nakanoshima',
    note: 'コングレスクエア大阪中之島 作品展示（CMK gallery / Osaka Fringe 2026 JOECMK & CASPER EXHIBITION）',
  },
  wbivgd7epjd: {
    venueGroup: 'コングレ中之島',
    expectedVenueId: 'congres-square-nakanoshima',
    note: 'コングレスクエア大阪中之島 作品展示（CHOP POP / The Girl Is A Fan Of The Band・キャンバス原画展）',
  },
};

export const LONG_TERM_PERFORMANCE_IDS = new Set<string>(
  Object.keys(LONG_TERM_PERFORMANCE_CONFIG)
);

// ============================================================================
// 3. 型定義
// ============================================================================
interface RawArtistRef {
  id: string;
  name?: string;
  nameEn?: string;
  genre?: string | string[];
  publishedAt?: string;
}

interface RawVenueRef {
  id: string;
  name?: string;
  nameEn?: string;
  publishedAt?: string;
}

interface RawDateItem {
  id?: string;
  fieldId?: string;
  date?: string;
  date_end?: string;
  open_date?: string;
  venue?: RawVenueRef | string | null;
  venueId?: string | { id: string };
}

interface RawPerformanceRecord {
  id: string;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
  revisedAt?: string;
  title?: string;
  titleEn?: string;
  genre?: string | string[];
  description?: string;
  artists?: RawArtistRef | RawArtistRef[] | string | null;
  artist?: RawArtistRef | RawArtistRef[] | string | null;
  artistId?: string;
  artistName?: string;
  venue?: RawVenueRef | string | null;
  venueId?: string;
  venueName?: string;
  dates?: RawDateItem[];
  schedules?: RawDateItem[];
  countMode?: string | string[];
  memo?: string;
}

interface NormalizedDateRange {
  rawStart: string;
  rawEnd?: string;
  startDateJst: string; // YYYY/MM/DD
  startTimeJst: string; // HH:mm
  endDateJst?: string; // YYYY/MM/DD
  endTimeJst?: string; // HH:mm
  startTimestampMs: number;
  endTimestampMs?: number;
  venueId: string;
  venueName: string;
  expandedDatesJst: string[]; // ['YYYY/MM/DD', ...]
  anomalyNote?: string;
}

interface NormalCsvEntry {
  performanceId: string;
  date: string; // YYYY/MM/DD
  earliestStartTime: string; // HH:mm (並び替え専用)
  earliestStartMs: number; // 並び替え専用
  artistNames: string; // 「、」区切り
  title: string;
  venueNames: string; // 同日に複数会場がある場合は開始時刻順に「、」区切り
  sessionsOnDate: Array<{ startMs: number; startTime: string; venueName: string }>;
}

interface LongTermCsvEntry {
  performanceId: string;
  venueGroup: 'AxCROSS' | 'コングレ中之島';
  venueName: string;
  periodText: string; // 例: 2026/10/08〜2026/11/08
  earliestStartMs: number;
  artistNames: string;
  title: string;
}

interface DataWarning {
  performanceId: string;
  title: string;
  artistNames: string;
  venueName: string;
  type:
    | 'inverted_date_end'
    | 'overnight_single_session'
    | 'multi_day_normal_exhibition'
    | 'same_day_multiple_venues'
    | 'weekday_only_note_in_description';
  message: string;
}

interface AuditIssue {
  performanceId: string;
  title: string;
  issueType: string;
  detail: string;
}

interface AuditReport {
  generatedAt: string;
  verificationResult: 'PASS' | 'FAIL';
  counts: {
    totalFetchedPublishedPerformances: number;
    uniquePublishedPerformanceIds: number;
    normalPerformanceWorkCount: number;
    normalPerformanceExpandedDateRowCount: number;
    longTermPerformanceWorkCount: number;
    csvNormalRowCount: number;
    csvLongTermRowCount: number;
  };
  longTermPerformances: Array<{
    id: string;
    venueGroup: string;
    venueName: string;
    artistNames: string;
    title: string;
    period: string;
  }>;
  missingPerformances: Array<{ id: string; title: string }>;
  missingDatesByPerformance: Array<{
    id: string;
    title: string;
    expectedDates: string[];
    actualDates: string[];
    missingDates: string[];
    extraDates: string[];
  }>;
  duplicatePerformanceDates: Array<{
    id: string;
    title: string;
    date: string;
    count: number;
  }>;
  missingSchedulePerformances: Array<{ id: string; title: string }>;
  missingArtistOrTitleOrVenuePerformances: Array<{
    id: string;
    title: string;
    artistNames: string;
    venueName: string;
  }>;
  longTermMixedIntoNormal: Array<{ id: string; title: string }>;
  draftContentMixedIn: Array<{ id: string; title: string }>;
  unregisteredLongTermVenueCandidates: Array<{
    id: string;
    title: string;
    venueName: string;
  }>;
  inconsistencies: AuditIssue[];
  manualConfirmationItems: DataWarning[];
}

// ============================================================================
// 4. microCMS 全件ページネーション取得処理（公開コンテンツのみ・draftKey不使用）
// ============================================================================
async function fetchAllPublishedItems<T extends { id: string; publishedAt?: string }>(
  endpoint: string
): Promise<{ items: T[]; reportedTotalCount: number }> {
  const allContents: T[] = [];
  const pageSize = 100;
  let offset = 0;
  let reportedTotalCount = Infinity;
  const MAX_PAGES = 100;
  let page = 0;

  while (offset < reportedTotalCount && page < MAX_PAGES) {
    page++;
    // 重要: draftKey は一切指定しない（公開済みコンテンツのみ取得）
    const response = await client.getList<T>({
      endpoint,
      queries: {
        limit: pageSize,
        offset,
      },
    });

    if (!response || !Array.isArray(response.contents)) {
      throw new Error(
        `[MicroCMS] エンドポイント "${endpoint}" のレスポンスが不正です (offset=${offset})`
      );
    }

    if (typeof response.totalCount !== 'number') {
      throw new Error(
        `[MicroCMS] エンドポイント "${endpoint}" の totalCount が取得できませんでした`
      );
    }

    reportedTotalCount = response.totalCount;
    allContents.push(...response.contents);
    offset += response.contents.length;

    if (response.contents.length === 0) {
      break;
    }
  }

  if (allContents.length !== reportedTotalCount) {
    throw new Error(
      `[MicroCMS] "${endpoint}" の取得件数 (${allContents.length}) が totalCount (${reportedTotalCount}) と一致しません。ページネーション取得漏れの可能性があります。`
    );
  }

  return { items: allContents, reportedTotalCount };
}

// ============================================================================
// 5. 日本時間 (Asia/Tokyo) の日時フォーマット & 開催日展開ロジック
// ============================================================================
const jstDateFormatter = new Intl.DateTimeFormat('ja-JP', {
  timeZone: 'Asia/Tokyo',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

const jstTimeFormatter = new Intl.DateTimeFormat('ja-JP', {
  timeZone: 'Asia/Tokyo',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
});

/**
 * Date オブジェクトを Asia/Tokyo の YYYY/MM/DD と HH:mm に変換
 */
function formatToJstDateAndTime(d: Date): { dateSlash: string; timeHm: string } {
  const parts = jstDateFormatter.formatToParts(d);
  const year = parts.find((p) => p.type === 'year')?.value || '';
  const month = parts.find((p) => p.type === 'month')?.value || '';
  const day = parts.find((p) => p.type === 'day')?.value || '';
  const dateSlash = `${year}/${month}/${day}`;

  const timeParts = jstTimeFormatter.formatToParts(d);
  let hour = timeParts.find((p) => p.type === 'hour')?.value || '00';
  const minute = timeParts.find((p) => p.type === 'minute')?.value || '00';
  if (hour === '24') hour = '00';
  const timeHm = `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`;

  return { dateSlash, timeHm };
}

/**
 * YYYY/MM/DD と HH:mm から JST (+09:00) のミリ秒タイムスタンプを算出
 */
function toJstTimestampMs(dateSlash: string, timeHm: string = '00:00'): number {
  const isoDate = dateSlash.replace(/\//g, '-');
  const cleanTime = /^\d{2}:\d{2}$/.test(timeHm) ? timeHm : '00:00';
  const ms = new Date(`${isoDate}T${cleanTime}:00.000+09:00`).getTime();
  if (Number.isNaN(ms)) {
    throw new Error(`不正なJST日時文字列です: ${dateSlash} ${timeHm}`);
  }
  return ms;
}

/**
 * 開始日 (YYYY/MM/DD) から終了日 (YYYY/MM/DD) までの全日付リストをJST基準で生成
 */
function expandJstDateRange(startDateSlash: string, endDateSlash: string): string[] {
  const startMidnightMs = toJstTimestampMs(startDateSlash, '00:00');
  const endMidnightMs = toJstTimestampMs(endDateSlash, '00:00');
  if (endMidnightMs < startMidnightMs) {
    return [startDateSlash];
  }

  const dates: string[] = [];
  const DAY_MS = 24 * 60 * 60 * 1000;
  let curMs = toJstTimestampMs(startDateSlash, '12:00');
  const targetEndNoonMs = toJstTimestampMs(endDateSlash, '12:00');
  let guard = 0;

  while (curMs <= targetEndNoonMs && guard < 120) {
    const { dateSlash } = formatToJstDateAndTime(new Date(curMs));
    dates.push(dateSlash);
    curMs += DAY_MS;
    guard++;
  }

  return dates;
}

// ============================================================================
// 6. アーティスト名・会場名・日程の解決（既存 normalizePerformance と同一優先順位）
// ============================================================================
function resolveArtistNames(
  perf: RawPerformanceRecord,
  artistMap: Map<string, RawArtistRef>
): string {
  const names: string[] = [];

  const addFromRef = (ref: RawArtistRef | string | null | undefined) => {
    if (!ref) return;
    if (typeof ref === 'string') {
      const trimmed = ref.trim();
      if (!trimmed) return;
      const found = artistMap.get(trimmed);
      if (found?.name?.trim()) {
        names.push(found.name.trim());
      } else {
        names.push(trimmed);
      }
      return;
    }
    if (typeof ref === 'object' && 'id' in ref) {
      const fromMap = artistMap.get(ref.id);
      const resolvedName = (fromMap?.name || ref.name || '').trim();
      if (resolvedName) {
        names.push(resolvedName);
      }
    }
  };

  if (Array.isArray(perf.artists)) {
    for (const item of perf.artists) {
      addFromRef(item);
    }
  } else if (perf.artists) {
    addFromRef(perf.artists);
  }

  if (names.length === 0) {
    if (Array.isArray(perf.artist)) {
      for (const item of perf.artist) {
        addFromRef(item);
      }
    } else if (perf.artist) {
      addFromRef(perf.artist);
    }
  }

  if (names.length === 0 && perf.artistId) {
    addFromRef(perf.artistId);
  }

  if (names.length === 0 && perf.artistName?.trim()) {
    names.push(perf.artistName.trim());
  }

  // 重複排除しつつ順序維持し、複数出演者は「、」区切りで結合
  const uniqueNames = Array.from(new Set(names.filter(Boolean)));
  return uniqueNames.join('、');
}

function resolveMainVenue(
  perf: RawPerformanceRecord,
  venueMap: Map<string, RawVenueRef>
): { venueId: string; venueName: string } {
  if (perf.venue && typeof perf.venue === 'object' && 'id' in perf.venue) {
    const v = venueMap.get(perf.venue.id) || perf.venue;
    return {
      venueId: perf.venue.id,
      venueName: (v.name || perf.venueName || '').trim(),
    };
  }
  if (typeof perf.venue === 'string' && perf.venue.trim()) {
    const v = venueMap.get(perf.venue.trim());
    return {
      venueId: perf.venue.trim(),
      venueName: (v?.name || perf.venueName || '').trim(),
    };
  }
  if (typeof perf.venueId === 'string' && perf.venueId.trim()) {
    const v = venueMap.get(perf.venueId.trim());
    return {
      venueId: perf.venueId.trim(),
      venueName: (v?.name || perf.venueName || '').trim(),
    };
  }
  return {
    venueId: '',
    venueName: (perf.venueName || '').trim(),
  };
}

/**
 * 日程アイテム個別の会場指定（item.venue）を優先解決し、未指定時は公演のメイン会場へフォールバック
 * （src/lib/microcms.ts の normalizePerformance 内の会場解決仕様と完全一致）
 */
function resolveScheduleVenue(
  item: RawDateItem,
  mainVenue: { venueId: string; venueName: string },
  venueMap: Map<string, RawVenueRef>
): { venueId: string; venueName: string } {
  const rawItemVenue = item.venue || item.venueId;
  if (rawItemVenue && typeof rawItemVenue === 'object' && 'id' in rawItemVenue) {
    const v = venueMap.get(rawItemVenue.id) || (rawItemVenue as RawVenueRef);
    return {
      venueId: rawItemVenue.id,
      venueName: (v?.name || mainVenue.venueName || '').trim(),
    };
  }
  if (typeof rawItemVenue === 'string' && rawItemVenue.trim()) {
    const v = venueMap.get(rawItemVenue.trim());
    return {
      venueId: rawItemVenue.trim(),
      venueName: (v?.name || mainVenue.venueName || '').trim(),
    };
  }
  return mainVenue;
}

function isExhibitionLike(
  perf: RawPerformanceRecord,
  artistMap: Map<string, RawArtistRef>
): boolean {
  if (perf.countMode === 'exhibition') return true;
  if (perf.countMode === 'performance') return false;

  const checkArtistGenre = (ref: RawArtistRef | string | null | undefined): boolean => {
    if (!ref) return false;
    const id = typeof ref === 'string' ? ref : ref.id;
    const artist = artistMap.get(id) || (typeof ref === 'object' ? ref : undefined);
    const g = artist?.genre;
    if (Array.isArray(g)) return g.includes('exhibition');
    return g === 'exhibition';
  };

  if (Array.isArray(perf.artists)) {
    if (perf.artists.some(checkArtistGenre)) return true;
  } else if (checkArtistGenre(perf.artists)) {
    return true;
  }

  const perfGenre = Array.isArray(perf.genre) ? perf.genre.join(' ') : perf.genre || '';
  if (perfGenre.includes('展示') || perfGenre.includes('原画展') || perfGenre.includes('絵画')) {
    return true;
  }
  return false;
}

/**
 * 公演の dates フィールドを解析し、JSTでの日程・期間・会場・展開日一覧を返す
 */
function parsePerformanceDates(
  perf: RawPerformanceRecord,
  artistNames: string,
  mainVenue: { venueId: string; venueName: string },
  venueMap: Map<string, RawVenueRef>,
  isExhibition: boolean,
  isLongTerm: boolean,
  warnings: DataWarning[]
): NormalizedDateRange[] {
  const rawList =
    Array.isArray(perf.dates) && perf.dates.length > 0
      ? perf.dates
      : Array.isArray(perf.schedules) && perf.schedules.length > 0
        ? perf.schedules
        : [];

  const results: NormalizedDateRange[] = [];

  for (const item of rawList) {
    if (!item || typeof item !== 'object') continue;
    const rawStart = (item.date || '').trim();
    const rawEnd = (item.date_end || '').trim();
    if (!rawStart) continue;

    const schedVenue = resolveScheduleVenue(item, mainVenue, venueMap);

    const startObj = new Date(rawStart);
    if (Number.isNaN(startObj.getTime())) {
      throw new Error(
        `[DataError] 公演 ID="${perf.id}" (${perf.title}) の開始日時 "${rawStart}" が解釈できません`
      );
    }

    const { dateSlash: startDateJst, timeHm: startTimeJst } = formatToJstDateAndTime(startObj);
    const startTimestampMs = startObj.getTime();

    let endDateJst: string | undefined;
    let endTimeJst: string | undefined;
    let endTimestampMs: number | undefined;
    let expandedDatesJst: string[] = [startDateJst];
    let anomalyNote: string | undefined;

    if (rawEnd) {
      const endObj = new Date(rawEnd);
      if (Number.isNaN(endObj.getTime())) {
        throw new Error(
          `[DataError] 公演 ID="${perf.id}" (${perf.title}) の終了日時 "${rawEnd}" が解釈できません`
        );
      }
      const formattedEnd = formatToJstDateAndTime(endObj);
      endDateJst = formattedEnd.dateSlash;
      endTimeJst = formattedEnd.timeHm;
      endTimestampMs = endObj.getTime();

      if (endDateJst < startDateJst) {
        // 終了日が開始日より前のCMS入力ミス（例: a2vmzq-d8）
        anomalyNote = `終了日時 (${endDateJst} ${endTimeJst}) が開始日時 (${startDateJst} ${startTimeJst}) より前になっているため、開始日 (${startDateJst}) の単日公演として処理しました。`;
        warnings.push({
          performanceId: perf.id,
          title: perf.title || '',
          artistNames,
          venueName: schedVenue.venueName,
          type: 'inverted_date_end',
          message: anomalyNote,
        });
        expandedDatesJst = [startDateJst];
      } else if (endDateJst > startDateJst) {
        // 展示ではない通常公演で、夜間開始〜翌早朝06:00前終了かつ12時間以内の深夜公演（例: mi4h_treob 10/31 19:00〜11/01 01:00）
        const durationHours = (endTimestampMs - startTimestampMs) / (1000 * 60 * 60);
        const endHour = parseInt(endTimeJst.split(':')[0], 10);

        if (!isLongTerm && !isExhibition && durationHours <= 12 && endHour < 6) {
          anomalyNote = `深夜日をまたぐ単発公演 (${startDateJst} ${startTimeJst} 〜 翌 ${endDateJst} ${endTimeJst}、計${durationHours}時間) のため、開演日である ${startDateJst} の1行として出力しました。`;
          warnings.push({
            performanceId: perf.id,
            title: perf.title || '',
            artistNames,
            venueName: schedVenue.venueName,
            type: 'overnight_single_session',
            message: anomalyNote,
          });
          expandedDatesJst = [startDateJst];
        } else {
          expandedDatesJst = expandJstDateRange(startDateJst, endDateJst);
          if (!isLongTerm && expandedDatesJst.length > 1) {
            warnings.push({
              performanceId: perf.id,
              title: perf.title || '',
              artistNames,
              venueName: schedVenue.venueName,
              type: 'multi_day_normal_exhibition',
              message: `AxCROSS・コングレ中之島以外の複数日開催（会場: ${schedVenue.venueName}、${startDateJst}〜${endDateJst}、計${expandedDatesJst.length}日間）のため、通常一覧の各開催日へ展開して出力しました。`,
            });
          }
        }
      }
    }

    results.push({
      rawStart,
      rawEnd: rawEnd || undefined,
      startDateJst,
      startTimeJst,
      endDateJst,
      endTimeJst,
      startTimestampMs,
      endTimestampMs,
      venueId: schedVenue.venueId,
      venueName: schedVenue.venueName,
      expandedDatesJst,
      anomalyNote,
    });
  }

  return results;
}

/**
 * 長期開催プログラムの期間表記を生成
 */
function formatLongTermPeriod(ranges: NormalizedDateRange[]): string {
  if (ranges.length === 0) return '';

  const sorted = [...ranges].sort((a, b) => a.startTimestampMs - b.startTimestampMs);
  const formattedSegments = sorted.map((r) => {
    const end = r.endDateJst && r.endDateJst >= r.startDateJst ? r.endDateJst : r.startDateJst;
    if (end !== r.startDateJst) {
      return `${r.startDateJst}〜${end}`;
    }
    return r.startDateJst;
  });

  return Array.from(new Set(formattedSegments)).join('、');
}

// ============================================================================
// 7. CSV生成・パースヘルパー (RFC 4180 準拠 + UTF-8 BOM)
// ============================================================================
function escapeCsvCell(value: string): string {
  const str = String(value ?? '');
  if (/[",\r\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function formatCsvRow(cells: string[]): string {
  return cells.map(escapeCsvCell).join(',');
}

/**
 * 生成したCSV文字列を厳密にパースして2次元配列に戻す（検証用）
 */
function parseCsvContent(csvWithBom: string): string[][] {
  const content = csvWithBom.startsWith('\uFEFF') ? csvWithBom.slice(1) : csvWithBom;
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentCell = '';
  let inQuotes = false;

  for (let i = 0; i < content.length; i++) {
    const ch = content[i];
    const next = content[i + 1];

    if (inQuotes) {
      if (ch === '"' && next === '"') {
        currentCell += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        currentCell += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ',') {
        currentRow.push(currentCell);
        currentCell = '';
      } else if (ch === '\r' && next === '\n') {
        currentRow.push(currentCell);
        rows.push(currentRow);
        currentRow = [];
        currentCell = '';
        i++;
      } else if (ch === '\n') {
        currentRow.push(currentCell);
        rows.push(currentRow);
        currentRow = [];
        currentCell = '';
      } else {
        currentCell += ch;
      }
    }
  }

  if (currentCell.length > 0 || currentRow.length > 0) {
    currentRow.push(currentCell);
    rows.push(currentRow);
  }

  return rows;
}

// ============================================================================
// 8. メイン処理
// ============================================================================
async function main() {
  console.log('================================================================');
  console.log(' OSAKA FRINGE 2026 公開公演一覧CSVエクスポート & 自動検証');
  console.log('================================================================\n');

  // 1. microCMSから公開データを全件取得
  console.log('[1/4] microCMS から公開データを取得中...');
  const [perfResult, artistResult, venueResult] = await Promise.all([
    fetchAllPublishedItems<RawPerformanceRecord>('performances'),
    fetchAllPublishedItems<RawArtistRef>('artists'),
    fetchAllPublishedItems<RawVenueRef>('venues'),
  ]);

  const rawPerformances = perfResult.items;
  const artistMap = new Map<string, RawArtistRef>(artistResult.items.map((a) => [a.id, a]));
  const venueMap = new Map<string, RawVenueRef>(venueResult.items.map((v) => [v.id, v]));

  console.log(
    `  - performances 取得件数: ${rawPerformances.length} 件 (totalCount: ${perfResult.reportedTotalCount})`
  );
  console.log(
    `  - artists 取得件数     : ${artistResult.items.length} 件 (totalCount: ${artistResult.reportedTotalCount})`
  );
  console.log(
    `  - venues 取得件数      : ${venueResult.items.length} 件 (totalCount: ${venueResult.reportedTotalCount})\n`
  );

  // 2. データ解析と通常一覧・長期開催一覧の構築
  console.log('[2/4] 公演日程・会場の展開・重複排除・長期開催分離を実行中...');

  const warnings: DataWarning[] = [];
  const inconsistencies: AuditIssue[] = [];
  const draftContentMixedIn: Array<{ id: string; title: string }> = [];
  const missingSchedulePerformances: Array<{ id: string; title: string }> = [];
  const missingArtistOrTitleOrVenuePerformances: Array<{
    id: string;
    title: string;
    artistNames: string;
    venueName: string;
  }> = [];
  const unregisteredLongTermVenueCandidates: Array<{
    id: string;
    title: string;
    venueName: string;
  }> = [];

  // 元データから抽出した「通常公演ID -> 期待される開催日セット (YYYY/MM/DD)」
  const expectedDatesByNormalPerfId = new Map<string, Set<string>>();
  // 元データから抽出した「通常公演ID + 開催日 -> 期待される会場名セット」
  const expectedVenuesByPerfIdAndDate = new Map<string, Set<string>>();

  const normalPerfMetaMap = new Map<
    string,
    { id: string; title: string; artistNames: string; mainVenueName: string }
  >();

  // 通常公演の重複排除マップ: key = `${performance.id}__${YYYY/MM/DD}`
  const deduplicatedNormalEntriesMap = new Map<string, NormalCsvEntry>();
  const longTermEntries: LongTermCsvEntry[] = [];

  for (const perf of rawPerformances) {
    const title = (perf.title || '').trim();
    const artistNames = resolveArtistNames(perf, artistMap);
    const mainVenue = resolveMainVenue(perf, venueMap);

    // 下書き混入チェック
    if (!perf.publishedAt) {
      draftContentMixedIn.push({ id: perf.id, title });
      inconsistencies.push({
        performanceId: perf.id,
        title,
        issueType: 'DRAFT_CONTENT_MIXED_IN',
        detail: 'publishedAt が存在しない下書きコンテンツが含まれています。',
      });
    }

    // 出演者・作品名・メイン会場名欠落チェック
    if (!title || !artistNames || !mainVenue.venueName) {
      missingArtistOrTitleOrVenuePerformances.push({
        id: perf.id,
        title,
        artistNames,
        venueName: mainVenue.venueName,
      });
      inconsistencies.push({
        performanceId: perf.id,
        title: title || '(無題)',
        issueType: 'MISSING_ARTIST_OR_TITLE_OR_VENUE',
        detail: `出演者名・作品名・会場名のいずれかが空です (出演者="${artistNames}", 作品名="${title}", 会場名="${mainVenue.venueName}")`,
      });
    }

    const isLongTerm = LONG_TERM_PERFORMANCE_IDS.has(perf.id);
    const isExhibition = isExhibitionLike(perf, artistMap);

    // AxCROSS または コングレスクエア大阪中之島 の公演で、明示IDリストに未登録のものがないかチェック
    if (
      !isLongTerm &&
      (mainVenue.venueId === 'axcross' ||
        mainVenue.venueId === 'congres-square-nakanoshima' ||
        mainVenue.venueName.includes('AxCROSS') ||
        mainVenue.venueName.includes('コングレ'))
    ) {
      unregisteredLongTermVenueCandidates.push({
        id: perf.id,
        title,
        venueName: mainVenue.venueName,
      });
      inconsistencies.push({
        performanceId: perf.id,
        title,
        issueType: 'UNREGISTERED_LONG_TERM_CANDIDATE',
        detail: `AxCROSSまたはコングレ中之島の公演ですが LONG_TERM_PERFORMANCE_IDS に未登録です (会場: ${mainVenue.venueName})`,
      });
    }

    const parsedRanges = parsePerformanceDates(
      perf,
      artistNames,
      mainVenue,
      venueMap,
      isExhibition,
      isLongTerm,
      warnings
    );

    if (parsedRanges.length === 0) {
      missingSchedulePerformances.push({ id: perf.id, title });
      inconsistencies.push({
        performanceId: perf.id,
        title,
        issueType: 'MISSING_SCHEDULE',
        detail: '公演日程 (dates) が1件も取得できません。',
      });
      continue;
    }

    if (isLongTerm) {
      const config = LONG_TERM_PERFORMANCE_CONFIG[perf.id];
      const periodText = formatLongTermPeriod(parsedRanges);
      const earliestStartMs = Math.min(...parsedRanges.map((r) => r.startTimestampMs));
      const venueNamesList = Array.from(
        new Set(parsedRanges.map((r) => r.venueName).filter(Boolean))
      );
      const resolvedLongTermVenueName = venueNamesList.join('、') || mainVenue.venueName;

      if (perf.description && perf.description.includes('平日')) {
        warnings.push({
          performanceId: perf.id,
          title,
          artistNames,
          venueName: resolvedLongTermVenueName,
          type: 'weekday_only_note_in_description',
          message: `長期開催プログラム（会場: ${resolvedLongTermVenueName}、期間: ${periodText}）ですが、本文中に「平日10:00～17:00 ※施設の都合により、ご覧いただけない日程もございます」の記載があります。`,
        });
      }

      longTermEntries.push({
        performanceId: perf.id,
        venueGroup: config.venueGroup,
        venueName: resolvedLongTermVenueName,
        periodText,
        earliestStartMs,
        artistNames,
        title,
      });
    } else {
      // 通常公演: performance.id + 開催日 (YYYY/MM/DD) で重複排除し、当日の最も早い開始時刻と全会場名を保持
      normalPerfMetaMap.set(perf.id, {
        id: perf.id,
        title,
        artistNames,
        mainVenueName: mainVenue.venueName,
      });
      const expectedDateSet = new Set<string>();

      for (const range of parsedRanges) {
        if (!range.venueName) {
          inconsistencies.push({
            performanceId: perf.id,
            title,
            issueType: 'MISSING_SCHEDULE_VENUE',
            detail: `開催日 ${range.startDateJst} の会場名が解決できません。`,
          });
        }

        for (const dateStr of range.expandedDatesJst) {
          expectedDateSet.add(dateStr);

          const dedupKey = `${perf.id}__${dateStr}`;
          const dayStartMs = toJstTimestampMs(dateStr, range.startTimeJst);

          const expectedVenueSet = expectedVenuesByPerfIdAndDate.get(dedupKey) || new Set<string>();
          if (range.venueName) {
            expectedVenueSet.add(range.venueName);
          }
          expectedVenuesByPerfIdAndDate.set(dedupKey, expectedVenueSet);

          const existing = deduplicatedNormalEntriesMap.get(dedupKey);

          if (!existing) {
            deduplicatedNormalEntriesMap.set(dedupKey, {
              performanceId: perf.id,
              date: dateStr,
              earliestStartTime: range.startTimeJst,
              earliestStartMs: dayStartMs,
              artistNames,
              title,
              venueNames: range.venueName,
              sessionsOnDate: [
                {
                  startMs: dayStartMs,
                  startTime: range.startTimeJst,
                  venueName: range.venueName,
                },
              ],
            });
          } else {
            existing.sessionsOnDate.push({
              startMs: dayStartMs,
              startTime: range.startTimeJst,
              venueName: range.venueName,
            });
            if (dayStartMs < existing.earliestStartMs) {
              existing.earliestStartMs = dayStartMs;
              existing.earliestStartTime = range.startTimeJst;
            }
          }
        }
      }

      expectedDatesByNormalPerfId.set(perf.id, expectedDateSet);
    }
  }

  // 同日に複数回の公演があるエントリについて、開始時刻順に会場名を整理（異なる会場がある場合は「、」区切りで併記し記録）
  for (const entry of deduplicatedNormalEntriesMap.values()) {
    entry.sessionsOnDate.sort((a, b) => a.startMs - b.startMs);
    const orderedUniqueVenues = Array.from(
      new Set(entry.sessionsOnDate.map((s) => s.venueName).filter(Boolean))
    );
    entry.venueNames = orderedUniqueVenues.join('、');

    if (orderedUniqueVenues.length > 1) {
      const sessionDetail = entry.sessionsOnDate
        .map((s) => `${s.startTime}@${s.venueName}`)
        .join(' / ');
      warnings.push({
        performanceId: entry.performanceId,
        title: entry.title,
        artistNames: entry.artistNames,
        venueName: entry.venueNames,
        type: 'same_day_multiple_venues',
        message: `同一公演ID・同一開催日 (${entry.date}) に異なる2会場での公演 (${sessionDetail}) が登録されているため、仕様に基づき1行にまとめ、会場名列に「${entry.venueNames}」と両方記載しました。`,
      });
    }
  }

  // 3. ソート処理
  // 通常公演:
  //   1. 開催日 (YYYY/MM/DD) 昇順
  //   2. 同日の開始時間 (earliestStartMs) 昇順
  //   3. 作品名昇順 -> 公演ID昇順
  const sortedNormalEntries = Array.from(deduplicatedNormalEntriesMap.values()).sort((a, b) => {
    if (a.date !== b.date) {
      return a.date.localeCompare(b.date);
    }
    if (a.earliestStartMs !== b.earliestStartMs) {
      return a.earliestStartMs - b.earliestStartMs;
    }
    const titleComp = a.title.localeCompare(b.title, 'ja', { numeric: true });
    if (titleComp !== 0) return titleComp;
    return a.performanceId.localeCompare(b.performanceId);
  });

  // 長期開催プログラム:
  //   1. AxCROSS -> コングレ中之島 の順
  //   2. 開始日時昇順 -> 作品名昇順 -> 公演ID昇順
  const sortedLongTermEntries = [...longTermEntries].sort((a, b) => {
    if (a.venueGroup !== b.venueGroup) {
      return a.venueGroup === 'AxCROSS' ? -1 : 1;
    }
    if (a.earliestStartMs !== b.earliestStartMs) {
      return a.earliestStartMs - b.earliestStartMs;
    }
    const titleComp = a.title.localeCompare(b.title, 'ja', { numeric: true });
    if (titleComp !== 0) return titleComp;
    return a.performanceId.localeCompare(b.performanceId);
  });

  // 4. CSV構築とファイル書き出し
  console.log('[3/4] CSVファイルを生成中...');
  const exportsDir = path.resolve(process.cwd(), 'exports');
  if (!fs.existsSync(exportsDir)) {
    fs.mkdirSync(exportsDir, { recursive: true });
  }

  const csvLines: string[] = [];
  // ヘッダー行（4列: 日付, 出演者, 作品名, 会場名）
  csvLines.push(formatCsvRow(['日付', '出演者', '作品名', '会場名']));

  // 通常公演行
  for (const entry of sortedNormalEntries) {
    csvLines.push(formatCsvRow([entry.date, entry.artistNames, entry.title, entry.venueNames]));
  }

  // 空行 + 【長期開催・別掲】区分 + 長期開催行
  csvLines.push('');
  csvLines.push(formatCsvRow(['【長期開催・別掲】', '', '', '']));
  for (const lt of sortedLongTermEntries) {
    csvLines.push(formatCsvRow([lt.periodText, lt.artistNames, lt.title, lt.venueName]));
  }

  // UTF-8 BOM付き + CRLF改行
  const csvContentWithBom = '\uFEFF' + csvLines.join('\r\n') + '\r\n';
  const primaryCsvFilePath = path.join(exportsDir, 'public_performances_2026.csv');
  const fallbackCsvFilePath = path.join(exportsDir, 'public_performances_2026_with_venue.csv');
  let csvFilePath = primaryCsvFilePath;

  // メインCSVがExcel等で開かれてロック中(EBUSY/EPERM)の場合でもエラー停止せずフォールバック先へ出力する
  try {
    fs.writeFileSync(primaryCsvFilePath, csvContentWithBom, 'utf8');
  } catch (err: unknown) {
    const code = (err as { code?: string })?.code;
    if (code === 'EBUSY' || code === 'EPERM') {
      fs.writeFileSync(fallbackCsvFilePath, csvContentWithBom, 'utf8');
      console.warn(
        `  [WARN] ${primaryCsvFilePath} がExcel等の別プロセスで開かれているため上書きできませんでした (${code})。`
      );
      console.warn(`  [WARN] 代わりに ${fallbackCsvFilePath} へ最新CSVを出力しました。`);
      csvFilePath = fallbackCsvFilePath;
    } else {
      throw err;
    }
  }

  // ============================================================================
  // 9. 自動検証（生成されたCSVファイルを再パースして元データと全件照合）
  // ============================================================================
  console.log('[4/4] 出力漏れ・重複・会場名・整合性の自動検証を実行中...');

  const writtenCsvRaw = fs.readFileSync(csvFilePath, 'utf8');
  const parsedRows = parseCsvContent(writtenCsvRaw);

  // ヘッダー確認
  const headerRow = parsedRows[0] || [];
  if (
    headerRow.length !== 4 ||
    headerRow[0] !== '日付' ||
    headerRow[1] !== '出演者' ||
    headerRow[2] !== '作品名' ||
    headerRow[3] !== '会場名'
  ) {
    inconsistencies.push({
      performanceId: 'CSV_HEADER',
      title: 'CSVヘッダー',
      issueType: 'INVALID_HEADER',
      detail: `CSVヘッダーが不正です: ${JSON.stringify(headerRow)}`,
    });
  }

  // CSVの行を「通常一覧セクション」と「【長期開催・別掲】セクション」に分解して検証
  const csvNormalDataRows: Array<{
    date: string;
    artistNames: string;
    title: string;
    venueNames: string;
  }> = [];
  const csvLongTermDataRows: Array<{
    period: string;
    artistNames: string;
    title: string;
    venueName: string;
  }> = [];
  let inLongTermSection = false;

  for (let i = 1; i < parsedRows.length; i++) {
    const row = parsedRows[i];
    if (row.length === 1 && row[0] === '') {
      continue; // 空行
    }
    if (row.every((c) => c === '')) {
      continue; // 空行
    }
    if (row[0] === '【長期開催・別掲】') {
      inLongTermSection = true;
      continue;
    }
    if (!inLongTermSection) {
      csvNormalDataRows.push({
        date: row[0] || '',
        artistNames: row[1] || '',
        title: row[2] || '',
        venueNames: row[3] || '',
      });
    } else {
      csvLongTermDataRows.push({
        period: row[0] || '',
        artistNames: row[1] || '',
        title: row[2] || '',
        venueName: row[3] || '',
      });
    }
  }

  // CSV行と内部エントリの1対1照合（順序・4列すべての内容・会場名の完全一致確認）
  if (csvNormalDataRows.length !== sortedNormalEntries.length) {
    inconsistencies.push({
      performanceId: 'CSV_NORMAL_COUNT',
      title: '通常公演行数不一致',
      issueType: 'ROW_COUNT_MISMATCH',
      detail: `展開後行数 (${sortedNormalEntries.length}) と CSV通常行数 (${csvNormalDataRows.length}) が一致しません。`,
    });
  }

  if (csvLongTermDataRows.length !== sortedLongTermEntries.length) {
    inconsistencies.push({
      performanceId: 'CSV_LONG_TERM_COUNT',
      title: '長期開催行数不一致',
      issueType: 'ROW_COUNT_MISMATCH',
      detail: `長期開催作品数 (${sortedLongTermEntries.length}) と CSV長期開催行数 (${csvLongTermDataRows.length}) が一致しません。`,
    });
  }

  // 各通常公演IDごとのCSV出力日セットおよび会場名を逆引き検証
  const csvDatesByPerfId = new Map<string, string[]>();
  for (let i = 0; i < sortedNormalEntries.length; i++) {
    const entry = sortedNormalEntries[i];
    const csvRow = csvNormalDataRows[i];
    if (
      !csvRow ||
      csvRow.date !== entry.date ||
      csvRow.artistNames !== entry.artistNames ||
      csvRow.title !== entry.title ||
      csvRow.venueNames !== entry.venueNames ||
      !csvRow.venueNames.trim()
    ) {
      inconsistencies.push({
        performanceId: entry.performanceId,
        title: entry.title,
        issueType: 'CSV_ROW_CONTENT_MISMATCH',
        detail: `CSV行 ${i + 2} の内容が期待値と一致しないか会場名が空です。期待: [${entry.date}, ${entry.artistNames}, ${entry.title}, ${entry.venueNames}] / 実際: ${JSON.stringify(csvRow)}`,
      });
    }

    // 該当公演ID+開催日の全期待会場名がCSVセルに含まれているか照合
    const dedupKey = `${entry.performanceId}__${entry.date}`;
    const expectedVenues = expectedVenuesByPerfIdAndDate.get(dedupKey) || new Set<string>();
    const actualVenuesInCell = new Set(
      (csvRow?.venueNames || '')
        .split('、')
        .map((v) => v.trim())
        .filter(Boolean)
    );
    for (const expVenue of expectedVenues) {
      if (!actualVenuesInCell.has(expVenue)) {
        inconsistencies.push({
          performanceId: entry.performanceId,
          title: entry.title,
          issueType: 'MISSING_VENUE_ON_DATE',
          detail: `開催日 ${entry.date} の期待会場 "${expVenue}" がCSVの会場名列 ("${csvRow?.venueNames}") から漏れています。`,
        });
      }
    }

    const list = csvDatesByPerfId.get(entry.performanceId) || [];
    list.push(entry.date);
    csvDatesByPerfId.set(entry.performanceId, list);
  }

  // 長期開催のCSV行内容照合
  const csvLongTermPerfIds = new Set<string>();
  for (let i = 0; i < sortedLongTermEntries.length; i++) {
    const entry = sortedLongTermEntries[i];
    const csvRow = csvLongTermDataRows[i];
    if (
      !csvRow ||
      csvRow.period !== entry.periodText ||
      csvRow.artistNames !== entry.artistNames ||
      csvRow.title !== entry.title ||
      csvRow.venueName !== entry.venueName ||
      !csvRow.venueName.trim()
    ) {
      inconsistencies.push({
        performanceId: entry.performanceId,
        title: entry.title,
        issueType: 'CSV_LONG_TERM_ROW_MISMATCH',
        detail: `長期開催CSV行の内容が期待値と一致しないか会場名が空です。期待: [${entry.periodText}, ${entry.artistNames}, ${entry.title}, ${entry.venueName}] / 実際: ${JSON.stringify(csvRow)}`,
      });
    }
    csvLongTermPerfIds.add(entry.performanceId);
  }

  // 検証1: 取得した全公開公演IDが「通常一覧」または「長期開催一覧」のいずれかに含まれているか
  const missingPerformances: Array<{ id: string; title: string }> = [];
  const longTermMixedIntoNormal: Array<{ id: string; title: string }> = [];

  for (const perf of rawPerformances) {
    const inNormal = (csvDatesByPerfId.get(perf.id)?.length || 0) > 0;
    const inLongTerm = csvLongTermPerfIds.has(perf.id);

    if (!inNormal && !inLongTerm) {
      missingPerformances.push({ id: perf.id, title: perf.title || '' });
      inconsistencies.push({
        performanceId: perf.id,
        title: perf.title || '',
        issueType: 'MISSING_FROM_CSV',
        detail: '公開済み公演ですがCSVの通常一覧・長期開催一覧のどちらにも出力されていません。',
      });
    }

    if (LONG_TERM_PERFORMANCE_IDS.has(perf.id) && inNormal) {
      longTermMixedIntoNormal.push({ id: perf.id, title: perf.title || '' });
      inconsistencies.push({
        performanceId: perf.id,
        title: perf.title || '',
        issueType: 'LONG_TERM_MIXED_INTO_NORMAL',
        detail: '長期開催対象の公演IDが通常の日付順一覧に混入しています。',
      });
    }

    if (!LONG_TERM_PERFORMANCE_IDS.has(perf.id) && inLongTerm) {
      inconsistencies.push({
        performanceId: perf.id,
        title: perf.title || '',
        issueType: 'NORMAL_MIXED_INTO_LONG_TERM',
        detail: '通常公演が長期開催一覧に混入しています。',
      });
    }
  }

  // 検証2: 通常公演について、元データから抽出した開催日とCSVに出力された開催日を公演ID単位で突き合わせ
  // ＆ 同一公演ID・同一開催日の重複出力チェック
  const missingDatesByPerformance: AuditReport['missingDatesByPerformance'] = [];
  const duplicatePerformanceDates: AuditReport['duplicatePerformanceDates'] = [];

  for (const [perfId, expectedDateSet] of expectedDatesByNormalPerfId.entries()) {
    const meta = normalPerfMetaMap.get(perfId)!;
    const actualDateList = csvDatesByPerfId.get(perfId) || [];

    // 重複チェック
    const dateCounts = new Map<string, number>();
    for (const d of actualDateList) {
      dateCounts.set(d, (dateCounts.get(d) || 0) + 1);
    }
    for (const [d, count] of dateCounts.entries()) {
      if (count > 1) {
        duplicatePerformanceDates.push({
          id: perfId,
          title: meta.title,
          date: d,
          count,
        });
        inconsistencies.push({
          performanceId: perfId,
          title: meta.title,
          issueType: 'DUPLICATE_PERFORMANCE_DATE',
          detail: `同一公演ID (${perfId}) と開催日 (${d}) が ${count} 回重複して出力されています。`,
        });
      }
    }

    const actualDateSet = new Set(actualDateList);
    const expectedSorted = Array.from(expectedDateSet).sort();
    const actualSorted = Array.from(actualDateSet).sort();

    const missingDates = expectedSorted.filter((d) => !actualDateSet.has(d));
    const extraDates = actualSorted.filter((d) => !expectedDateSet.has(d));

    if (missingDates.length > 0 || extraDates.length > 0) {
      missingDatesByPerformance.push({
        id: perfId,
        title: meta.title,
        expectedDates: expectedSorted,
        actualDates: actualSorted,
        missingDates,
        extraDates,
      });
      inconsistencies.push({
        performanceId: perfId,
        title: meta.title,
        issueType: 'DATE_MISMATCH',
        detail: `開催日の不一致があります (欠落: ${missingDates.join(', ') || 'なし'} / 余剰: ${extraDates.join(', ') || 'なし'})`,
      });
    }
  }

  // 検証3: 通常一覧の日付が昇順になっているかチェック
  for (let i = 1; i < csvNormalDataRows.length; i++) {
    const prevDate = csvNormalDataRows[i - 1].date;
    const curDate = csvNormalDataRows[i].date;
    if (curDate < prevDate) {
      inconsistencies.push({
        performanceId: sortedNormalEntries[i]?.performanceId || `ROW_${i + 1}`,
        title: csvNormalDataRows[i].title,
        issueType: 'DATE_SORT_ORDER_VIOLATION',
        detail: `CSV行 ${i + 2} の日付 (${curDate}) が直前行の日付 (${prevDate}) より前になっています。`,
      });
    }
  }

  const uniquePublishedIds = new Set(rawPerformances.map((p) => p.id));
  const verificationPassed =
    inconsistencies.length === 0 &&
    missingPerformances.length === 0 &&
    missingDatesByPerformance.length === 0 &&
    duplicatePerformanceDates.length === 0 &&
    missingSchedulePerformances.length === 0 &&
    missingArtistOrTitleOrVenuePerformances.length === 0 &&
    longTermMixedIntoNormal.length === 0 &&
    draftContentMixedIn.length === 0 &&
    uniquePublishedIds.size === rawPerformances.length &&
    normalPerfMetaMap.size + sortedLongTermEntries.length === uniquePublishedIds.size &&
    csvNormalDataRows.length === sortedNormalEntries.length &&
    csvLongTermDataRows.length === sortedLongTermEntries.length;

  const auditReport: AuditReport = {
    generatedAt: new Date().toISOString(),
    verificationResult: verificationPassed ? 'PASS' : 'FAIL',
    counts: {
      totalFetchedPublishedPerformances: rawPerformances.length,
      uniquePublishedPerformanceIds: uniquePublishedIds.size,
      normalPerformanceWorkCount: normalPerfMetaMap.size,
      normalPerformanceExpandedDateRowCount: sortedNormalEntries.length,
      longTermPerformanceWorkCount: sortedLongTermEntries.length,
      csvNormalRowCount: csvNormalDataRows.length,
      csvLongTermRowCount: csvLongTermDataRows.length,
    },
    longTermPerformances: sortedLongTermEntries.map((lt) => ({
      id: lt.performanceId,
      venueGroup: lt.venueGroup,
      venueName: lt.venueName,
      artistNames: lt.artistNames,
      title: lt.title,
      period: lt.periodText,
    })),
    missingPerformances,
    missingDatesByPerformance,
    duplicatePerformanceDates,
    missingSchedulePerformances,
    missingArtistOrTitleOrVenuePerformances,
    longTermMixedIntoNormal,
    draftContentMixedIn,
    unregisteredLongTermVenueCandidates,
    inconsistencies,
    manualConfirmationItems: warnings,
  };

  const auditJsonPath = path.join(exportsDir, 'public_performances_audit.json');
  fs.writeFileSync(auditJsonPath, JSON.stringify(auditReport, null, 2) + '\n', 'utf8');

  // 人間が確認しやすいテキスト形式レポートも生成
  const textReportLines: string[] = [
    '================================================================',
    ' OSAKA FRINGE 2026 公開公演一覧CSV 検証レポート（会場名付き）',
    '================================================================',
    `生成日時: ${auditReport.generatedAt}`,
    `検証結果: ${auditReport.verificationResult}`,
    '',
    '■ 1. 取得件数・出力件数の検証',
    `  - microCMSから取得した公開公演総数 : ${auditReport.counts.totalFetchedPublishedPerformances} 件`,
    `  - 公開公演のユニークID数           : ${auditReport.counts.uniquePublishedPerformanceIds} 件`,
    `  - 通常公演の作品数                 : ${auditReport.counts.normalPerformanceWorkCount} 作品`,
    `  - 通常公演の日付展開後の行数       : ${auditReport.counts.normalPerformanceExpandedDateRowCount} 行`,
    `  - 長期開催として別掲した作品数     : ${auditReport.counts.longTermPerformanceWorkCount} 作品`,
    `  - CSVに出力した通常公演の行数      : ${auditReport.counts.csvNormalRowCount} 行`,
    `  - CSVに出力した長期開催の行数      : ${auditReport.counts.csvLongTermRowCount} 行`,
    '',
    '■ 2. 長期開催・別掲プログラム一覧',
    ...auditReport.longTermPerformances.map(
      (lt, idx) =>
        `  ${idx + 1}. [${lt.id}] ${lt.period} | 出演者: ${lt.artistNames} | 作品名: ${lt.title} | 会場名: ${lt.venueName}`
    ),
    '',
    '■ 3. 出力漏れ・不整合の検出結果',
    `  - 公開済みだがCSVに未登場の公演              : ${auditReport.missingPerformances.length} 件`,
    `  - 登録開催日がCSVから抜けている公演          : ${auditReport.missingDatesByPerformance.length} 件`,
    `  - 同一公演ID・同一開催日の重複出力           : ${auditReport.duplicatePerformanceDates.length} 件`,
    `  - 公演日が取得できない公演                   : ${auditReport.missingSchedulePerformances.length} 件`,
    `  - 出演者名・作品名・会場名が取得できない公演 : ${auditReport.missingArtistOrTitleOrVenuePerformances.length} 件`,
    `  - 長期開催対象で通常一覧へ混入した公演       : ${auditReport.longTermMixedIntoNormal.length} 件`,
    `  - 下書きコンテンツの混入                     : ${auditReport.draftContentMixedIn.length} 件`,
    `  - その他の不整合（会場名不一致含む）         : ${auditReport.inconsistencies.length} 件`,
    '',
    '■ 4. 手動確認・留意事項（CMS元データの特記事項）',
    ...(auditReport.manualConfirmationItems.length === 0
      ? ['  - なし']
      : auditReport.manualConfirmationItems.map(
          (w, idx) =>
            `  ${idx + 1}. [${w.performanceId}] ${w.artistNames}「${w.title}」（会場: ${w.venueName}）\n     (${w.type}) ${w.message}`
        )),
    '',
  ];

  const auditTxtPath = path.join(exportsDir, 'public_performances_audit.txt');
  fs.writeFileSync(auditTxtPath, textReportLines.join('\n'), 'utf8');

  // コンソールにもサマリーを表示
  console.log('\n' + textReportLines.join('\n'));
  console.log(`CSV出力先        : ${csvFilePath}`);
  console.log(`検証レポート(JSON): ${auditJsonPath}`);
  console.log(`検証レポート(TXT) : ${auditTxtPath}\n`);

  if (!verificationPassed) {
    console.error('[FAIL] 検証で不整合または出力漏れが検出されました。レポートを確認してください。');
    process.exit(1);
  }

  console.log('[PASS] 全公開公演の照合・会場名検証が正常に完了しました。');
}

main().catch((err) => {
  console.error('[FATAL] エクスポート処理中にエラーが発生しました:', err);
  process.exit(1);
});
