import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  isPreFestivalSchedule,
  getPerformancePreFestivalStatus,
  isExhibitionPerformance,
  calculateEventCount,
  resolveTargetDate,
  FESTIVAL_START_DATE,
} from '../src/utils/performanceUtils.ts';
import type { Performance, PerformanceSchedule } from '../src/types/index.ts';

function createMockSchedule(overrides: Partial<PerformanceSchedule> = {}): PerformanceSchedule {
  return {
    id: 's-mock',
    date: '2026-10-10',
    startTime: '13:00',
    ...overrides,
  };
}

function createMockPerformance(overrides: Partial<Performance> = {}): Performance {
  return {
    id: 'p-mock',
    title: 'Mock Performance',
    description: 'Mock Description',
    schedules: [],
    ...overrides,
  };
}

describe('Pre-festival & Event Count Utilities', () => {
  describe('FESTIVAL_START_DATE constant', () => {
    it('is set to 2026-10-08', () => {
      assert.strictEqual(FESTIVAL_START_DATE, '2026-10-08');
    });
  });

  describe('resolveTargetDate', () => {
    it('resolves null, undefined, empty, or "all" to "all"', () => {
      assert.strictEqual(resolveTargetDate(null), 'all');
      assert.strictEqual(resolveTargetDate(undefined), 'all');
      assert.strictEqual(resolveTargetDate(''), 'all');
      assert.strictEqual(resolveTargetDate('all'), 'all');
    });

    it('returns exact YYYY-MM-DD date string as is', () => {
      assert.strictEqual(resolveTargetDate('2026-10-03'), '2026-10-03');
      assert.strictEqual(resolveTargetDate('2026-10-08'), '2026-10-08');
    });

    it('resolves "today" to current JST date', () => {
      const fixedNowMs = Date.UTC(2026, 9, 3, 3, 0, 0); // 2026-10-03 12:00 JST
      assert.strictEqual(resolveTargetDate('today', fixedNowMs), '2026-10-03');
    });

    it('resolves "tomorrow" to next day in JST', () => {
      const fixedNowMs = Date.UTC(2026, 9, 3, 3, 0, 0); // 2026-10-03 12:00 JST
      assert.strictEqual(resolveTargetDate('tomorrow', fixedNowMs), '2026-10-04');
    });
  });

  describe('isPreFestivalSchedule', () => {
    it('returns true for 2026-10-03 (pre-festival date)', () => {
      const schedule = createMockSchedule({
        id: 's-pre-1',
        date: '2026-10-03',
        startTime: '13:00',
        endTime: '14:00',
      });
      assert.strictEqual(isPreFestivalSchedule(schedule), true);
    });

    it('returns false for 2026-10-08 (opening day)', () => {
      const schedule = createMockSchedule({
        id: 's-open-1',
        date: '2026-10-08',
        startTime: '13:00',
        endTime: '14:00',
      });
      assert.strictEqual(isPreFestivalSchedule(schedule), false);
    });

    it('returns false for 2026-10-18 (main festival date)', () => {
      const schedule = createMockSchedule({
        id: 's-main-1',
        date: '2026-10-18',
        startTime: '13:00',
        endTime: '14:00',
      });
      assert.strictEqual(isPreFestivalSchedule(schedule), false);
    });

    it('handles period exhibition starting before festival start date', () => {
      // 2026-10-03 to 2026-10-20
      const schedule = createMockSchedule({
        id: 's-exhibit-span',
        date: '2026-10-03',
        endDate: '2026-10-20',
      });
      assert.strictEqual(isPreFestivalSchedule(schedule), true);
    });

    it('handles malformed or missing dates gracefully without crashing', () => {
      const schedule = createMockSchedule({
        id: 's-malformed',
        date: 'invalid-date',
      });
      assert.strictEqual(isPreFestivalSchedule(schedule), false);

      const emptySchedule = createMockSchedule({
        id: 's-empty',
        date: '',
      });
      assert.strictEqual(isPreFestivalSchedule(emptySchedule), false);
    });
  });

  describe('getPerformancePreFestivalStatus', () => {
    it('identifies performance with only pre-festival schedules', () => {
      const perf = createMockPerformance({
        id: 'p-pre-only',
        title: 'Pre-only performance',
        schedules: [
          createMockSchedule({ id: 's1', date: '2026-10-03', startTime: '13:00' }),
          createMockSchedule({ id: 's2', date: '2026-10-04', startTime: '15:00' }),
        ],
      });
      const status = getPerformancePreFestivalStatus(perf);
      assert.strictEqual(status.isAllPre, true);
      assert.strictEqual(status.hasPreFestival, true);
      assert.strictEqual(status.hasMainFestival, false);
      assert.strictEqual(status.isSpanning, false);
    });

    it('identifies performance with both pre-festival and main festival schedules', () => {
      const perf = createMockPerformance({
        id: 'p-hybrid',
        title: 'Hybrid performance',
        schedules: [
          createMockSchedule({ id: 's1', date: '2026-10-03', startTime: '13:00' }),
          createMockSchedule({ id: 's2', date: '2026-10-10', startTime: '15:00' }),
        ],
      });
      const status = getPerformancePreFestivalStatus(perf);
      assert.strictEqual(status.isAllPre, false);
      assert.strictEqual(status.hasPreFestival, true);
      assert.strictEqual(status.hasMainFestival, true);
      assert.strictEqual(status.isSpanning, false);
    });

    it('identifies exhibition spanning across the opening boundary without misrepresenting as pre-only', () => {
      const perf = createMockPerformance({
        id: 'p-span',
        title: 'Spanning Exhibition',
        artist: {
          id: 'a1',
          name: 'Artist',
          genre: 'exhibition',
          profile: 'Artist Profile',
        },
        schedules: [
          createMockSchedule({ id: 's1', date: '2026-10-03', endDate: '2026-10-18' }),
        ],
      });
      const status = getPerformancePreFestivalStatus(perf);
      assert.strictEqual(status.isAllPre, false);
      assert.strictEqual(status.hasPreFestival, true);
      assert.strictEqual(status.hasMainFestival, true);
      assert.strictEqual(status.isSpanning, true);
    });

    it('identifies performance with only main festival dates', () => {
      const perf = createMockPerformance({
        id: 'p-main-only',
        title: 'Main only performance',
        schedules: [
          createMockSchedule({ id: 's1', date: '2026-10-08', startTime: '13:00' }),
          createMockSchedule({ id: 's2', date: '2026-10-12', startTime: '15:00' }),
        ],
      });
      const status = getPerformancePreFestivalStatus(perf);
      assert.strictEqual(status.isAllPre, false);
      assert.strictEqual(status.hasPreFestival, false);
      assert.strictEqual(status.hasMainFestival, true);
      assert.strictEqual(status.isSpanning, false);
    });

    it('handles performance with no schedules', () => {
      const perf = createMockPerformance({
        id: 'p-empty',
        title: 'No schedule performance',
        schedules: [],
      });
      const status = getPerformancePreFestivalStatus(perf);
      assert.strictEqual(status.isAllPre, false);
      assert.strictEqual(status.hasPreFestival, false);
      assert.strictEqual(status.hasMainFestival, false);
      assert.strictEqual(status.isSpanning, false);
    });
  });

  describe('isExhibitionPerformance', () => {
    it('defaults to artist.genre === "exhibition" when countMode is omitted', () => {
      const exhibitPerf = createMockPerformance({
        id: 'p1',
        artist: { id: 'a1', name: 'A1', genre: 'exhibition', profile: 'P1' },
      });
      assert.strictEqual(isExhibitionPerformance(exhibitPerf), true);

      const theaterPerf = createMockPerformance({
        id: 'p2',
        artist: { id: 'a2', name: 'A2', genre: 'theater', profile: 'P2' },
      });
      assert.strictEqual(isExhibitionPerformance(theaterPerf), false);
    });

    it('prioritizes explicit countMode over artist.genre', () => {
      const overrideExhibit = createMockPerformance({
        id: 'p3',
        countMode: 'exhibition',
        artist: { id: 'a3', name: 'A3', genre: 'theater', profile: 'P3' },
      });
      assert.strictEqual(isExhibitionPerformance(overrideExhibit), true);

      const overridePerf = createMockPerformance({
        id: 'p4',
        countMode: 'performance',
        artist: { id: 'a4', name: 'A4', genre: 'exhibition', profile: 'P4' },
      });
      assert.strictEqual(isExhibitionPerformance(overridePerf), false);
    });
  });

  describe('calculateEventCount - Total sessions calculation rules', () => {
    it('counts performance with 3 shows on the same day as 3 sessions', () => {
      const perf = createMockPerformance({
        id: 'p-same-day-3',
        artist: { id: 'a1', name: 'Artist', genre: 'dance', profile: 'P' },
        schedules: [
          createMockSchedule({ id: 's1', date: '2026-10-10', startTime: '11:00' }),
          createMockSchedule({ id: 's2', date: '2026-10-10', startTime: '14:00' }),
          createMockSchedule({ id: 's3', date: '2026-10-10', startTime: '17:00' }),
        ],
      });
      const result = calculateEventCount([perf]);
      assert.strictEqual(result.totalCount, 3);
      assert.strictEqual(result.performanceCount, 3);
      assert.strictEqual(result.exhibitionCount, 0);
      assert.strictEqual(result.unscheduledCount, 0);
    });

    it('counts performance with 3 shows each on 2 days as 6 sessions', () => {
      const perf = createMockPerformance({
        id: 'p-two-days-6',
        artist: { id: 'a1', name: 'Artist', genre: 'music', profile: 'P' },
        schedules: [
          createMockSchedule({ id: 's1', date: '2026-10-10', startTime: '11:00' }),
          createMockSchedule({ id: 's2', date: '2026-10-10', startTime: '14:00' }),
          createMockSchedule({ id: 's3', date: '2026-10-10', startTime: '17:00' }),
          createMockSchedule({ id: 's4', date: '2026-10-11', startTime: '11:00' }),
          createMockSchedule({ id: 's5', date: '2026-10-11', startTime: '14:00' }),
          createMockSchedule({ id: 's6', date: '2026-10-11', startTime: '17:00' }),
        ],
      });
      const result = calculateEventCount([perf]);
      assert.strictEqual(result.totalCount, 6);
      assert.strictEqual(result.performanceCount, 6);
      assert.strictEqual(result.exhibitionCount, 0);
    });

    it('counts 30-day exhibition as 1 session', () => {
      const perf = createMockPerformance({
        id: 'p-exhibit-30',
        artist: { id: 'a1', name: 'Artist', genre: 'exhibition', profile: 'P' },
        schedules: [
          createMockSchedule({ id: 's1', date: '2026-10-01', endDate: '2026-10-30', startTime: '10:00', endTime: '18:00' }),
        ],
      });
      const result = calculateEventCount([perf]);
      assert.strictEqual(result.totalCount, 1);
      assert.strictEqual(result.performanceCount, 0);
      assert.strictEqual(result.exhibitionCount, 1);
    });

    it('counts exhibition with multiple daily date records as exactly 1 session', () => {
      const perf = createMockPerformance({
        id: 'p-exhibit-multidays',
        artist: { id: 'a1', name: 'Artist', genre: 'exhibition', profile: 'P' },
        schedules: [
          createMockSchedule({ id: 's1', date: '2026-10-10', startTime: '10:00' }),
          createMockSchedule({ id: 's2', date: '2026-10-11', startTime: '10:00' }),
          createMockSchedule({ id: 's3', date: '2026-10-12', startTime: '10:00' }),
          createMockSchedule({ id: 's4', date: '2026-10-13', startTime: '10:00' }),
        ],
      });
      const result = calculateEventCount([perf]);
      assert.strictEqual(result.totalCount, 1);
      assert.strictEqual(result.performanceCount, 0);
      assert.strictEqual(result.exhibitionCount, 1);
    });

    it('deduplicates identical schedule sessions to avoid double counting', () => {
      const perf = createMockPerformance({
        id: 'p-duplicate-schedules',
        artist: { id: 'a1', name: 'Artist', genre: 'theater', profile: 'P' },
        schedules: [
          createMockSchedule({ id: 's1', date: '2026-10-10', startTime: '14:00', venueId: 'v1' }),
          createMockSchedule({ id: 's1-dup', date: '2026-10-10', startTime: '14:00', venueId: 'v1' }),
        ],
      });
      const result = calculateEventCount([perf]);
      assert.strictEqual(result.totalCount, 1);
    });

    it('excludes unscheduled performance from total count and adds to unscheduledCount', () => {
      const scheduledPerf = createMockPerformance({
        id: 'p-scheduled',
        artist: { id: 'a1', name: 'Artist', genre: 'traditional', profile: 'P' },
        schedules: [createMockSchedule({ id: 's1', date: '2026-10-10', startTime: '14:00' })],
      });
      const unscheduledPerf = createMockPerformance({
        id: 'p-unscheduled',
        artist: { id: 'a2', name: 'Artist', genre: 'music', profile: 'P' },
        schedules: [],
      });
      const result = calculateEventCount([scheduledPerf, unscheduledPerf]);
      assert.strictEqual(result.totalCount, 1);
      assert.strictEqual(result.unscheduledCount, 1);
    });

    it('excludes invalid dates and warns without corrupting totals', () => {
      const invalidDatePerf = createMockPerformance({
        id: 'p-invalid',
        artist: { id: 'a1', name: 'Artist', genre: 'dance', profile: 'P' },
        schedules: [
          createMockSchedule({ id: 's1', date: 'not-a-valid-date', startTime: '14:00' }),
          createMockSchedule({ id: 's2', date: '2026-10-10', startTime: '14:00' }),
        ],
      });
      const result = calculateEventCount([invalidDatePerf]);
      assert.strictEqual(result.totalCount, 1);
      assert.strictEqual(result.invalidDateCount, 1);
    });
  });

  describe('calculateEventCount with Filtering (Date and Venue)', () => {
    const multiVenuePerf = createMockPerformance({
      id: 'p-multi',
      artist: { id: 'a1', name: 'Artist', genre: 'theater', profile: 'P' },
      venueId: 'v1',
      schedules: [
        createMockSchedule({ id: 's1', date: '2026-10-10', startTime: '11:00', venueId: 'v1' }),
        createMockSchedule({ id: 's2', date: '2026-10-10', startTime: '15:00', venueId: 'v1' }),
        createMockSchedule({ id: 's3', date: '2026-10-10', startTime: '19:00', venueId: 'v2' }),
        createMockSchedule({ id: 's4', date: '2026-10-11', startTime: '14:00', venueId: 'v1' }),
      ],
    });

    const exhibitPerf = createMockPerformance({
      id: 'p-ex',
      artist: { id: 'a2', name: 'Artist', genre: 'exhibition', profile: 'P' },
      venueId: 'v2',
      schedules: [
        createMockSchedule({ id: 'se1', date: '2026-10-10', endDate: '2026-10-15', venueId: 'v2' }),
      ],
    });

    it('filters by date: counts 2 shows for v1 and 1 show for v2 on 2026-10-10', () => {
      const result = calculateEventCount([multiVenuePerf], 'all', '2026-10-10');
      assert.strictEqual(result.totalCount, 3);
    });

    it('filters by date and venue simultaneously: counts only sessions matching BOTH on the same schedule', () => {
      // 2026-10-10 and venue v1: s1 and s2 match (2 sessions)
      const resV1 = calculateEventCount([multiVenuePerf], 'v1', '2026-10-10');
      assert.strictEqual(resV1.totalCount, 2);

      // 2026-10-10 and venue v2: s3 matches (1 session)
      const resV2 = calculateEventCount([multiVenuePerf], 'v2', '2026-10-10');
      assert.strictEqual(resV2.totalCount, 1);
    });

    it('filters exhibition by date and venue: counts 1 when matching', () => {
      const resExhibitMatch = calculateEventCount([exhibitPerf], 'v2', '2026-10-12');
      assert.strictEqual(resExhibitMatch.totalCount, 1);

      const resExhibitMismatch = calculateEventCount([exhibitPerf], 'v1', '2026-10-12');
      assert.strictEqual(resExhibitMismatch.totalCount, 0);
    });
  });

  describe('MicroCMS Live Dataset Representation (29 projects = 43 total sessions)', () => {
    it('accurately verifies mock representing the 29 project breakdown produces 43 sessions', () => {
      const mockProjects: Performance[] = [];

      // 11 exhibition projects
      for (let i = 0; i < 11; i++) {
        mockProjects.push(
          createMockPerformance({
            id: `exhibit-${i}`,
            artist: { id: `a-ex-${i}`, name: `Artist ${i}`, genre: 'exhibition', profile: 'P' },
            schedules: [
              createMockSchedule({ id: `s-ex-${i}-1`, date: '2026-10-08', endDate: '2026-10-18' }),
              createMockSchedule({ id: `s-ex-${i}-2`, date: '2026-10-10' }),
            ],
          })
        );
      }

      // 18 performance projects totaling 32 sessions
      // 14 projects with 2 sessions each = 28 sessions
      for (let i = 0; i < 14; i++) {
        mockProjects.push(
          createMockPerformance({
            id: `perf-2s-${i}`,
            artist: { id: `a-p-${i}`, name: `Artist ${i}`, genre: 'theater', profile: 'P' },
            schedules: [
              createMockSchedule({ id: `s-p-${i}-1`, date: '2026-10-10', startTime: '13:00' }),
              createMockSchedule({ id: `s-p-${i}-2`, date: '2026-10-11', startTime: '15:00' }),
            ],
          })
        );
      }
      // 4 projects with 1 session each = 4 sessions
      for (let i = 0; i < 4; i++) {
        mockProjects.push(
          createMockPerformance({
            id: `perf-1s-${i}`,
            artist: { id: `a-p1-${i}`, name: `Artist ${i}`, genre: 'music', profile: 'P' },
            schedules: [
              createMockSchedule({ id: `s-p1-${i}-1`, date: '2026-10-12', startTime: '18:00' }),
            ],
          })
        );
      }

      assert.strictEqual(mockProjects.length, 29);

      const count = calculateEventCount(mockProjects);
      assert.strictEqual(count.totalCount, 43);
      assert.strictEqual(count.performanceCount, 32);
      assert.strictEqual(count.exhibitionCount, 11);
      assert.strictEqual(count.unscheduledCount, 0);
    });
  });
});
