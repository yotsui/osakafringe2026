import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { normalizeDurationMinutes, normalizePerformance } from '../src/lib/microcms.ts';
import {
  getPerformanceTimingInfo,
  sortPerformances,
} from '../src/utils/performanceUtils.ts';
import { formatScheduleCompact, formatScheduleDetailed } from '../src/utils/dateFormat.ts';
import { backfillPerformances, createDefaultStats, type BackfillContext } from '../scripts/backfillTranslations.ts';
import type { Performance, PerformanceSchedule } from '../src/types/index.ts';

describe('durationMinutes text specification tests', () => {
  describe('normalizeDurationMinutes', () => {
    it('accepts various free text descriptions', () => {
      assert.strictEqual(normalizeDurationMinutes('約30分'), '約30分');
      assert.strictEqual(normalizeDurationMinutes('45〜60分'), '45〜60分');
      assert.strictEqual(normalizeDurationMinutes('約90分（休憩含む）'), '約90分（休憩含む）');
      assert.strictEqual(normalizeDurationMinutes('随時開催'), '随時開催');
      assert.strictEqual(normalizeDurationMinutes('未定'), '未定');
      assert.strictEqual(normalizeDurationMinutes('  75 min  '), '75 min');
    });

    it('converts legacy positive finite numbers into display strings with 分', () => {
      assert.strictEqual(normalizeDurationMinutes(75), '75分');
      assert.strictEqual(normalizeDurationMinutes(45), '45分');
      assert.strictEqual(normalizeDurationMinutes(60), '60分');
    });

    it('returns undefined for 0, negative numbers, NaN, and Infinity', () => {
      assert.strictEqual(normalizeDurationMinutes(0), undefined);
      assert.strictEqual(normalizeDurationMinutes(-30), undefined);
      assert.strictEqual(normalizeDurationMinutes(Number.NaN), undefined);
      assert.strictEqual(normalizeDurationMinutes(Number.POSITIVE_INFINITY), undefined);
      assert.strictEqual(normalizeDurationMinutes(Number.NEGATIVE_INFINITY), undefined);
    });

    it('returns undefined for empty strings, whitespace, null, undefined, and non-primitive objects', () => {
      assert.strictEqual(normalizeDurationMinutes(''), undefined);
      assert.strictEqual(normalizeDurationMinutes('   '), undefined);
      assert.strictEqual(normalizeDurationMinutes(null), undefined);
      assert.strictEqual(normalizeDurationMinutes(undefined), undefined);
      assert.strictEqual(normalizeDurationMinutes(true), undefined);
      assert.strictEqual(normalizeDurationMinutes(false), undefined);
      assert.strictEqual(normalizeDurationMinutes({ duration: 60 }), undefined);
      assert.strictEqual(normalizeDurationMinutes(['60分']), undefined);
    });
  });

  describe('normalizePerformance with durationMinutes & durationMinutesEn', () => {
    it('normalizes both Japanese and English duration text correctly', () => {
      const raw = {
        id: 'perf-test',
        title: 'Test Performance',
        durationMinutes: '約45分',
        durationMinutesEn: 'Approx. 45 min',
      };
      const normalized = normalizePerformance(raw);
      assert.strictEqual(normalized.durationMinutes, '約45分');
      assert.strictEqual(normalized.durationMinutesEn, 'Approx. 45 min');
    });

    it('normalizes legacy number field in draft/raw data', () => {
      const raw = {
        id: 'perf-test-num',
        title: 'Legacy Performance',
        durationMinutes: 90,
      };
      const normalized = normalizePerformance(raw);
      assert.strictEqual(normalized.durationMinutes, '90分');
      assert.strictEqual(normalized.durationMinutesEn, undefined);
    });
  });

  describe('Performance calculations are completely independent from durationMinutes', () => {
    const createTestPerf = (duration: string | undefined): Performance => ({
      id: 'perf-timing',
      title: 'Timing Test',
      description: 'Test description',
      durationMinutes: duration,
      schedules: [
        {
          id: 's1',
          date: '2026-10-10',
          startTime: '14:00',
          endTime: '15:30',
          venueId: 'v1',
          venueName: 'Venue 1',
        },
      ],
    });

    it('timing info calculation produces identical results regardless of durationMinutes content', () => {
      const perfNull = createTestPerf(undefined);
      const perf30 = createTestPerf('約30分');
      const perfOngoing = createTestPerf('随時開催');
      const perfNumericString = createTestPerf('999999');

      const fixedNow = new Date('2026-10-10T14:30:00+09:00');
      const infoNull = getPerformanceTimingInfo(perfNull, fixedNow);
      const info30 = getPerformanceTimingInfo(perf30, fixedNow);
      const infoOngoing = getPerformanceTimingInfo(perfOngoing, fixedNow);
      const infoNumericString = getPerformanceTimingInfo(perfNumericString, fixedNow);

      assert.deepStrictEqual(infoNull, info30);
      assert.deepStrictEqual(info30, infoOngoing);
      assert.deepStrictEqual(infoOngoing, infoNumericString);
    });

    it('sorting and featured selection are unaffected by durationMinutes', () => {
      const perfs: Performance[] = [
        {
          id: 'p1',
          title: 'Show 1',
          description: 'Desc 1',
          durationMinutes: '随時開催',
          schedules: [{ date: '2026-10-12', startTime: '10:00' }],
        },
        {
          id: 'p2',
          title: 'Show 2',
          description: 'Desc 2',
          durationMinutes: '約15分',
          schedules: [{ date: '2026-10-10', startTime: '10:00' }],
        },
      ];

      const sorted = sortPerformances(perfs, 'date');
      assert.strictEqual(sorted[0].id, 'p2');
      assert.strictEqual(sorted[1].id, 'p1');
    });

    it('dateFormat output relies solely on schedule date and time, never on durationMinutes', () => {
      const schedule: PerformanceSchedule = {
        date: '2026-10-10',
        startTime: '15:00',
        endTime: '16:00',
      };
      assert.strictEqual(formatScheduleCompact(schedule, 'ja'), '10/10（土）15:00〜16:00');
      assert.strictEqual(formatScheduleDetailed(schedule, 'ja'), '10/10（土）15:00〜16:00');
    });
  });

  describe('backfillTranslations for durationMinutes', () => {
    it('translates durationMinutes into durationMinutesEn when not yet set', async () => {
      let patched: Record<string, unknown> | null = null;
      const mockClient = {
        getList: async ({ endpoint }: { endpoint: string }) => {
          if (endpoint === 'performances') {
            return {
              contents: [
                {
                  id: 'p1',
                  title: 'タイトル',
                  titleEn: 'Title',
                  durationMinutes: '約30分',
                  durationMinutesEn: '',
                },
              ],
              totalCount: 1,
            };
          }
          return { contents: [], totalCount: 0 };
        },
        get: async () => ({
          id: 'p1',
          durationMinutes: '約30分',
          durationMinutesEn: '',
        }),
        update: async (args: { endpoint: string; contentId?: string; content: Record<string, unknown> }) => {
          patched = args.content;
        },
      };

      const ctx: BackfillContext = {
        client: mockClient,
        stats: createDefaultStats(),
        isDryRun: false,
        translator: async (text) => `EN: ${text}`,
      };

      await backfillPerformances(ctx);

      assert.ok(patched);
      assert.strictEqual((patched as Record<string, unknown>).durationMinutesEn, 'EN: 約30分');
    });

    it('skips durationMinutes translation if durationMinutesEn already exists', async () => {
      let updateCalled = false;
      const mockClient = {
        getList: async ({ endpoint }: { endpoint: string }) => {
          if (endpoint === 'performances') {
            return {
              contents: [
                {
                  id: 'p1',
                  title: 'タイトル',
                  titleEn: 'Title',
                  durationMinutes: '約30分',
                  durationMinutesEn: 'Approx. 30 min',
                },
              ],
              totalCount: 1,
            };
          }
          return { contents: [], totalCount: 0 };
        },
        update: async () => {
          updateCalled = true;
        },
      };

      const ctx: BackfillContext = {
        client: mockClient,
        stats: createDefaultStats(),
        isDryRun: false,
        translator: async (text) => `EN: ${text}`,
      };

      await backfillPerformances(ctx);

      assert.strictEqual(updateCalled, false);
      assert.strictEqual(ctx.stats.englishSkipped, 2); // titleEn + durationMinutesEn
    });
  });
});
