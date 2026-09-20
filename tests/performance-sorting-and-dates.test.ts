import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  parseJstDateTime,
  getJstDateString,
  getScheduleTimestamps,
  getPerformanceTimingInfo,
  selectFeaturedPerformances,
  sortPerformances,
  getAllFestivalDates,
  getVenuePerformancesForDate,
  sortVenuesForDate,
  sortVenuesForAllDates,
  getNextAvailableDate,
} from '../src/utils/performanceUtils.ts';
import type { Performance, Venue } from '../src/types/index.ts';

describe('Performance Dates & JST Timezone Utils', () => {
  it('formats JST date string (YYYY-MM-DD) accurately across UTC date boundaries', () => {
    // 2026-09-30 15:30:00 UTC = 2026-10-01 00:30:00 JST
    const utcDate = new Date('2026-09-30T15:30:00.000Z');
    const jstStr = getJstDateString(utcDate);
    assert.strictEqual(jstStr, '2026-10-01');
  });

  it('parses JST date and time deterministically regardless of environment timezone', () => {
    // 2026-10-01 10:00:00 JST is equivalent to 2026-10-01 01:00:00 UTC
    const ts = parseJstDateTime('2026-10-01', '10:00', 'start');
    const expectedUtc = Date.UTC(2026, 9, 1, 1, 0, 0, 0); // Month 9 is October
    assert.strictEqual(ts, expectedUtc);
  });

  it('defaults start time to 00:00:00.000 JST when time is omitted', () => {
    const ts = parseJstDateTime('2026-10-01', undefined, 'start');
    const expectedUtc = Date.UTC(2026, 8, 30, 15, 0, 0, 0); // 2026-09-30 15:00:00 UTC = 2026-10-01 00:00:00 JST
    assert.strictEqual(ts, expectedUtc);
  });

  it('defaults end time to 23:59:59.999 JST when time is omitted', () => {
    const ts = parseJstDateTime('2026-10-01', undefined, 'end');
    const expectedUtc = Date.UTC(2026, 9, 1, 14, 59, 59, 999); // 2026-10-01 14:59:59.999 UTC = 2026-10-01 23:59:59.999 JST
    assert.strictEqual(ts, expectedUtc);
  });

  it('correctly handles JST midnight boundary transitions (23:59:59 -> 00:00:00)', () => {
    const beforeMidnight = parseJstDateTime('2026-10-01', '23:59:59', 'end');
    const afterMidnight = parseJstDateTime('2026-10-02', '00:00:00', 'start');
    // Difference between 23:59:59.999 and 00:00:00.000 next day is 1ms
    assert.strictEqual(afterMidnight - beforeMidnight, 1);
  });

  it('correctly handles overnight schedules without explicit endDate', () => {
    const schedule = {
      id: 's-overnight',
      date: '2026-10-01',
      startTime: '23:00',
      endTime: '02:00',
    };
    const { startMs, endMs } = getScheduleTimestamps(schedule);
    assert.ok(endMs > startMs);
    // 3 hours difference = 3 * 3600 * 1000 = 10,800,000 ms (plus seconds/ms precision)
    const diffHours = (endMs - startMs) / (1000 * 60 * 60);
    assert.ok(Math.abs(diffHours - 3) < 0.01);
  });

  it('correctly handles multi-day range / exhibition schedules', () => {
    const schedule = {
      id: 's-range',
      date: '2026-10-01',
      endDate: '2026-10-08',
      startTime: '10:00',
      endTime: '18:00',
    };
    const { startMs, endMs } = getScheduleTimestamps(schedule);
    const expectedStart = parseJstDateTime('2026-10-01', '10:00', 'start');
    const expectedEnd = parseJstDateTime('2026-10-08', '18:00', 'end');
    assert.strictEqual(startMs, expectedStart);
    assert.strictEqual(endMs, expectedEnd);
  });
});

describe('getPerformanceTimingInfo', () => {
  const dummyPerf: Performance = {
    id: 'perf-test',
    title: 'テスト公演',
    genre: 'theater',
    description: 'テスト説明',
    schedules: [],
  };

  it('evaluates performances without schedules as no_schedule', () => {
    const info = getPerformanceTimingInfo(dummyPerf);
    assert.strictEqual(info.status, 'no_schedule');
    assert.strictEqual(info.hasNoSchedule, true);
    assert.strictEqual(info.isOngoing, false);
    assert.strictEqual(info.isUpcoming, false);
    assert.strictEqual(info.isPast, false);
  });

  it('evaluates ongoing performance when current time is between start and end', () => {
    const now = parseJstDateTime('2026-10-03', '14:30', 'start');
    const perf: Performance = {
      ...dummyPerf,
      schedules: [
        { id: 's1', date: '2026-10-03', startTime: '14:00', endTime: '15:30' },
      ],
    };
    const info = getPerformanceTimingInfo(perf, now);
    assert.strictEqual(info.status, 'ongoing');
    assert.strictEqual(info.isOngoing, true);
    assert.strictEqual(info.isUpcoming, false);
    assert.strictEqual(info.isPast, false);
    assert.strictEqual(info.isToday, true);
  });

  it('evaluates upcoming performance when current time is before start', () => {
    const now = parseJstDateTime('2026-10-03', '10:00', 'start');
    const perf: Performance = {
      ...dummyPerf,
      schedules: [
        { id: 's1', date: '2026-10-03', startTime: '14:00', endTime: '15:30' },
        { id: 's2', date: '2026-10-04', startTime: '14:00', endTime: '15:30' },
      ],
    };
    const info = getPerformanceTimingInfo(perf, now);
    assert.strictEqual(info.status, 'upcoming');
    assert.strictEqual(info.isUpcoming, true);
    assert.strictEqual(info.isOngoing, false);
    assert.strictEqual(info.isPast, false);
    assert.strictEqual(info.nextSchedule?.id, 's1');
  });

  it('evaluates ended performance when all schedules are past', () => {
    const now = parseJstDateTime('2026-10-05', '10:00', 'start');
    const perf: Performance = {
      ...dummyPerf,
      schedules: [
        { id: 's1', date: '2026-10-03', startTime: '14:00', endTime: '15:30' },
        { id: 's2', date: '2026-10-04', startTime: '14:00', endTime: '15:30' },
      ],
    };
    const info = getPerformanceTimingInfo(perf, now);
    assert.strictEqual(info.status, 'ended');
    assert.strictEqual(info.isPast, true);
    assert.strictEqual(info.isOngoing, false);
    assert.strictEqual(info.isUpcoming, false);
  });

  it('evaluates multi-schedule performance with 1 ended and 1 upcoming schedule as upcoming', () => {
    const now = parseJstDateTime('2026-10-03', '18:00', 'start');
    const perf: Performance = {
      ...dummyPerf,
      schedules: [
        { id: 's1', date: '2026-10-03', startTime: '14:00', endTime: '15:30' }, // ended
        { id: 's2', date: '2026-10-04', startTime: '14:00', endTime: '15:30' }, // upcoming
      ],
    };
    const info = getPerformanceTimingInfo(perf, now);
    assert.strictEqual(info.status, 'upcoming');
    assert.strictEqual(info.isUpcoming, true);
    assert.strictEqual(info.nextSchedule?.id, 's2');
  });
});

describe('selectFeaturedPerformances (Top Page PICK UP)', () => {
  const now = parseJstDateTime('2026-10-03', '12:00', 'start');

  const pFeaturedOngoing: Performance = {
    id: 'p-feat-ongoing',
    title: 'Featured Ongoing',
    description: '',
    isFeatured: true,
    genre: 'theater',
    schedules: [{ id: 's1', date: '2026-10-03', startTime: '11:00', endTime: '13:00' }],
  };

  const pFeaturedUpcoming: Performance = {
    id: 'p-feat-upcoming',
    title: 'Featured Upcoming',
    description: '',
    isFeatured: true,
    genre: 'theater',
    schedules: [{ id: 's2', date: '2026-10-03', startTime: '15:00', endTime: '16:00' }],
  };

  const pNormalOngoing: Performance = {
    id: 'p-norm-ongoing',
    title: 'Normal Ongoing',
    description: '',
    isFeatured: false,
    genre: 'theater',
    schedules: [{ id: 's3', date: '2026-10-03', startTime: '11:30', endTime: '13:30' }],
  };

  const pNormalUpcoming: Performance = {
    id: 'p-norm-upcoming',
    title: 'Normal Upcoming',
    description: '',
    isFeatured: false,
    genre: 'theater',
    schedules: [{ id: 's4', date: '2026-10-03', startTime: '14:00', endTime: '15:00' }],
  };

  const pFeaturedNoSched: Performance = {
    id: 'p-feat-nosched',
    title: 'Featured No Sched',
    description: '',
    isFeatured: true,
    genre: 'theater',
    schedules: [],
  };

  const pNormalNoSched: Performance = {
    id: 'p-norm-nosched',
    title: 'Normal No Sched',
    description: '',
    isFeatured: false,
    genre: 'theater',
    schedules: [],
  };

  const pEnded: Performance = {
    id: 'p-ended',
    title: 'Ended Performance',
    description: '',
    isFeatured: true,
    genre: 'theater',
    schedules: [{ id: 's5', date: '2026-10-02', startTime: '10:00', endTime: '11:00' }],
  };

  it('orders by 6 priority levels and excludes ended performances', () => {
    const list = [
      pEnded,
      pNormalNoSched,
      pNormalUpcoming,
      pNormalOngoing,
      pFeaturedNoSched,
      pFeaturedUpcoming,
      pFeaturedOngoing,
    ];

    const result = selectFeaturedPerformances(list, 6, now);
    const ids = result.map((p) => p.id);

    // Expected order:
    // 1. p-feat-ongoing
    // 2. p-feat-upcoming
    // 3. p-norm-ongoing
    // 4. p-norm-upcoming
    // 5. p-feat-nosched
    // 6. p-norm-nosched
    // Excluded: p-ended
    assert.deepStrictEqual(ids, [
      'p-feat-ongoing',
      'p-feat-upcoming',
      'p-norm-ongoing',
      'p-norm-upcoming',
      'p-feat-nosched',
      'p-norm-nosched',
    ]);
    assert.ok(!ids.includes('p-ended'));
  });

  it('limits output to specified count (max 6)', () => {
    const list = [
      pFeaturedOngoing,
      pFeaturedUpcoming,
      pNormalOngoing,
      pNormalUpcoming,
      pFeaturedNoSched,
      pNormalNoSched,
    ];
    const res3 = selectFeaturedPerformances(list, 3, now);
    assert.strictEqual(res3.length, 3);
  });

  it('returns empty array when input is empty or all performances ended', () => {
    assert.deepStrictEqual(selectFeaturedPerformances([], 6, now), []);
    assert.deepStrictEqual(selectFeaturedPerformances([pEnded], 6, now), []);
  });
});

describe('sortPerformances (/audience)', () => {
  const now = parseJstDateTime('2026-10-03', '12:00', 'start');

  const pOngoing: Performance = {
    id: 'p-ongoing',
    title: 'B Ongoing Show',
    titleEn: 'B Ongoing Show',
    description: '',
    isFeatured: false,
    genre: 'dance',
    publishedAt: '2026-09-01T00:00:00Z',
    schedules: [{ id: 's1', date: '2026-10-03', startTime: '11:00', endTime: '14:00' }],
  };

  const pUpcoming: Performance = {
    id: 'p-upcoming',
    title: 'A Upcoming Show',
    titleEn: 'A Upcoming Show',
    description: '',
    isFeatured: false,
    genre: 'music',
    publishedAt: '2026-09-10T00:00:00Z',
    schedules: [{ id: 's2', date: '2026-10-03', startTime: '15:00', endTime: '16:00' }],
  };

  const pNoSched: Performance = {
    id: 'p-nosched',
    title: 'C No Sched Show',
    titleEn: 'C No Sched Show',
    description: '',
    isFeatured: false,
    genre: 'comedy',
    publishedAt: '2026-08-01T00:00:00Z',
    schedules: [],
  };

  const pEnded: Performance = {
    id: 'p-ended',
    title: 'D Ended Show',
    titleEn: 'D Ended Show',
    description: '',
    isFeatured: true,
    genre: 'theater',
    publishedAt: '2026-09-15T00:00:00Z',
    schedules: [{ id: 's3', date: '2026-10-01', startTime: '10:00', endTime: '11:00' }],
  };

  it('sorts by date order (ongoing -> upcoming -> no_schedule -> ended)', () => {
    const list = [pEnded, pNoSched, pUpcoming, pOngoing];
    const sorted = sortPerformances(list, 'date', 'ja', 'all', now);
    const ids = sorted.map((p) => p.id);
    assert.deepStrictEqual(ids, ['p-ongoing', 'p-upcoming', 'p-nosched', 'p-ended']);
  });

  it('sorts by featured order (isFeatured first, then date sub-order)', () => {
    const list = [pOngoing, pUpcoming, pNoSched, pEnded];
    const sorted = sortPerformances(list, 'featured', 'ja', 'all', now);
    const ids = sorted.map((p) => p.id);
    // pEnded is isFeatured: true, so it leads the list
    assert.strictEqual(ids[0], 'p-ended');
    // Non-featured follow in date order: ongoing -> upcoming -> nosched
    assert.deepStrictEqual(ids.slice(1), ['p-ongoing', 'p-upcoming', 'p-nosched']);
  });

  it('sorts by newest order (publishedAt / createdAt DESC)', () => {
    const list = [pOngoing, pUpcoming, pNoSched, pEnded];
    const sorted = sortPerformances(list, 'newest', 'ja', 'all', now);
    const ids = sorted.map((p) => p.id);
    // 2026-09-15 (pEnded) -> 2026-09-10 (pUpcoming) -> 2026-09-01 (pOngoing) -> 2026-08-01 (pNoSched)
    assert.deepStrictEqual(ids, ['p-ended', 'p-upcoming', 'p-ongoing', 'p-nosched']);
  });

  it('sorts by title order in localized alphabetical order', () => {
    const list = [pOngoing, pUpcoming, pNoSched, pEnded];
    const sorted = sortPerformances(list, 'title', 'en', 'all', now);
    const ids = sorted.map((p) => p.id);
    // A Upcoming -> B Ongoing -> C No Sched -> D Ended
    assert.deepStrictEqual(ids, ['p-upcoming', 'p-ongoing', 'p-nosched', 'p-ended']);
  });

  it('sorts by start time when date filter is selected (timed first, then untimed)', () => {
    const pTimed1: Performance = {
      id: 'p-1500',
      title: '15:00 Show',
      description: '',
      genre: 'theater',
      schedules: [{ id: 's-t1', date: '2026-10-03', startTime: '15:00' }],
    };
    const pTimed2: Performance = {
      id: 'p-1000',
      title: '10:00 Show',
      description: '',
      genre: 'theater',
      schedules: [{ id: 's-t2', date: '2026-10-03', startTime: '10:00' }],
    };
    const pUntimed: Performance = {
      id: 'p-notime',
      title: 'Untimed Show',
      description: '',
      genre: 'theater',
      schedules: [{ id: 's-t3', date: '2026-10-03', startTime: '' }],
    };

    const list = [pTimed1, pUntimed, pTimed2];
    const sorted = sortPerformances(list, 'date', 'ja', '2026-10-03', now);
    const ids = sorted.map((p) => p.id);
    assert.deepStrictEqual(ids, ['p-1000', 'p-1500', 'p-notime']);
  });
});

describe('Venue Date Filtering and Schedule Sorting Utils', () => {
  const dummyVenues: Venue[] = [
    { id: 'v1', name: 'Venue 1', nameEn: 'Venue 1', area: 'Kita', areaEn: 'Kita', address: '1-1 Kita', access: 'Station A', capacity: 100, location: { lat: 34.7, lng: 135.5 } },
    { id: 'v2', name: 'Venue 2', nameEn: 'Venue 2', area: 'Minami', areaEn: 'Minami', address: '2-2 Minami', access: 'Station B', capacity: 80, location: { lat: 34.67, lng: 135.5 } },
    { id: 'v3', name: 'Venue 3', nameEn: 'Venue 3', area: 'Umeda', areaEn: 'Umeda', address: '3-3 Umeda', access: 'Station C', capacity: 50, location: { lat: 34.71, lng: 135.49 } },
    { id: 'v-empty', name: 'Empty Venue', nameEn: 'Empty Venue', area: 'Namba', areaEn: 'Namba', address: '4-4 Namba', access: 'Station D', location: { lat: 34.66, lng: 135.5 } },
  ];

  const dummyPerformances: Performance[] = [
    {
      id: 'perf-v1-early',
      title: 'V1 11:00 Show',
      description: 'Description 1',
      genre: 'theater',
      venueId: 'v1',
      schedules: [
        { id: 's-v1-1', date: '2026-10-02', startTime: '11:00', endTime: '12:00' },
        { id: 's-v1-2', date: '2026-10-03', startTime: '15:00', endTime: '16:00' },
      ],
    },
    {
      id: 'perf-v1-late',
      title: 'V1 17:00 Show',
      description: 'Description 2',
      genre: 'music',
      venueId: 'v1',
      schedules: [
        { id: 's-v1-3', date: '2026-10-02', startTime: '17:00', endTime: '18:30' },
      ],
    },
    {
      id: 'perf-v2-earliest',
      title: 'V2 09:30 Show',
      description: 'Description 3',
      genre: 'dance',
      venueId: 'v2',
      schedules: [
        { id: 's-v2-1', date: '2026-10-02', startTime: '09:30', endTime: '10:30' },
      ],
    },
    {
      id: 'perf-v3-multiday',
      title: 'V3 Multi-day Exhibition',
      description: 'Description 4',
      genre: 'exhibition',
      schedules: [
        { id: 's-v3-1', date: '2026-10-01', endDate: '2026-10-05', startTime: '10:00', endTime: '19:00', venueId: 'v3' },
      ],
    },
  ];

  it('getAllFestivalDates returns all unique festival dates sorted ascending including multiday expansions', () => {
    const dates = getAllFestivalDates(dummyPerformances);
    assert.deepStrictEqual(dates, [
      '2026-10-01',
      '2026-10-02',
      '2026-10-03',
      '2026-10-04',
      '2026-10-05',
    ]);
  });

  it('getNextAvailableDate returns the immediate next festival date after targetDate', () => {
    const dates = ['2026-10-01', '2026-10-03', '2026-10-05'];
    assert.strictEqual(getNextAvailableDate(dates, '2026-10-01'), '2026-10-03');
    assert.strictEqual(getNextAvailableDate(dates, '2026-10-02'), '2026-10-03');
    assert.strictEqual(getNextAvailableDate(dates, '2026-10-03'), '2026-10-05');
    assert.strictEqual(getNextAvailableDate(dates, '2026-10-05'), null);
  });

  it('getVenuePerformancesForDate finds, sorts, and deduplicates shows at a venue on a date', () => {
    const shows = getVenuePerformancesForDate('v1', dummyPerformances, '2026-10-02');
    assert.strictEqual(shows.length, 2);
    assert.strictEqual(shows[0].performance.id, 'perf-v1-early');
    assert.strictEqual(shows[0].displayTime, '11:00〜12:00');
    assert.strictEqual(shows[1].performance.id, 'perf-v1-late');
    assert.strictEqual(shows[1].displayTime, '17:00〜18:30');
  });

  it('includes multi-day exhibitions on intermediate dates', () => {
    const shows = getVenuePerformancesForDate('v3', dummyPerformances, '2026-10-03');
    assert.strictEqual(shows.length, 1);
    assert.strictEqual(shows[0].performance.id, 'perf-v3-multiday');
  });

  it('sortVenuesForDate sorts venues by earliest performance start time on that date', () => {
    // On 2026-10-02:
    // v2 earliest show is 09:30
    // v3 multiday show is 10:00
    // v1 earliest show is 11:00
    // v-empty has 0 shows
    const result = sortVenuesForDate(dummyVenues, dummyPerformances, '2026-10-02', false);
    const venueIds = result.map((r) => r.venue.id);
    assert.deepStrictEqual(venueIds, ['v2', 'v3', 'v1']);
    // Empty venue is excluded when isDemoMode is false
    assert.strictEqual(result.some((r) => r.venue.id === 'v-empty'), false);
  });

  it('sortVenuesForDate includes empty venues at the end when isDemoMode is true', () => {
    const result = sortVenuesForDate(dummyVenues, dummyPerformances, '2026-10-02', true);
    const venueIds = result.map((r) => r.venue.id);
    assert.deepStrictEqual(venueIds, ['v2', 'v3', 'v1', 'v-empty']);
  });

  it('sortVenuesForAllDates prioritizes ongoing shows, then upcoming closest shows, then past shows', () => {
    // Current time: 2026-10-02 10:35 JST
    // On 2026-10-02 10:35:
    // v3 (10:00-19:00) is ONGOING
    // v1 (next show 11:00) is UPCOMING at 11:00
    // v2 (show was 09:30-10:30) is PAST / ENDED
    // v-empty has no shows
    const testNow = parseJstDateTime('2026-10-02', '10:35', 'start');
    const result = sortVenuesForAllDates(dummyVenues, dummyPerformances, testNow, false);
    const venueIds = result.map((r) => r.venue.id);
    assert.strictEqual(venueIds[0], 'v3'); // Ongoing
    assert.strictEqual(venueIds[1], 'v1'); // Upcoming next at 11:00
    assert.strictEqual(venueIds[2], 'v2'); // Ended
  });
});

import { formatScheduleDetailed } from '../src/utils/dateFormat.ts';

describe('formatScheduleDetailed', () => {
  it('displays open time when available in detailed view', () => {
    const schedule = {
      id: 's1',
      date: '2026-10-21',
      openTime: '18:30',
      startTime: '19:00',
    };
    
    // Japanese
    const resultJa = formatScheduleDetailed(schedule, 'ja');
    assert.strictEqual(resultJa, '10/21（水）19:00〜　開場18:30');
    
    // English
    const resultEn = formatScheduleDetailed(schedule, 'en');
    assert.strictEqual(resultEn, 'Oct 21 (Wed) 19:00 (Open 18:30)');
  });

  it('displays only start time when open time is not available in detailed view', () => {
    const schedule = {
      id: 's2',
      date: '2026-10-21',
      startTime: '19:00',
    };
    
    // Japanese
    const resultJa = formatScheduleDetailed(schedule, 'ja');
    assert.strictEqual(resultJa, '10/21（水）19:00〜');
    
    // English
    const resultEn = formatScheduleDetailed(schedule, 'en');
    assert.strictEqual(resultEn, 'Oct 21 (Wed) 19:00');
  });
});
