import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { formatDateHeading, formatSessionTime } from '../src/utils/dateFormat.ts';
import { getVenueDateGroups } from '../src/utils/venueScheduleUtils.ts';
import type { Performance, PerformanceSchedule } from '../src/types/index.ts';

describe('formatDateHeading', () => {
  it('formats Japanese date headings with year-less M月D日（曜）', () => {
    assert.strictEqual(formatDateHeading('2026-10-03', 'ja'), '10月3日（土）');
    assert.strictEqual(formatDateHeading('2026-10-10', 'ja'), '10月10日（土）');
    assert.strictEqual(formatDateHeading('2026-11-01', 'ja'), '11月1日（日）');
  });

  it('formats English date headings with Mon D (Day)', () => {
    assert.strictEqual(formatDateHeading('2026-10-03', 'en'), 'Oct 3 (Sat)');
    assert.strictEqual(formatDateHeading('2026-10-10', 'en'), 'Oct 10 (Sat)');
    assert.strictEqual(formatDateHeading('2026-11-01', 'en'), 'Nov 1 (Sun)');
  });

  it('handles unscheduled / empty dates', () => {
    assert.strictEqual(formatDateHeading('unscheduled', 'ja'), '日程未定');
    assert.strictEqual(formatDateHeading('unscheduled', 'en'), 'Schedule TBD');
    assert.strictEqual(formatDateHeading('', 'ja'), '日程未定');
    assert.strictEqual(formatDateHeading(undefined, 'en'), 'Schedule TBD');
  });
});

describe('formatSessionTime', () => {
  it('formats single-day with start and end time', () => {
    const s: PerformanceSchedule = {
      date: '2026-10-03',
      startTime: '13:00',
      endTime: '13:30',
    };
    assert.strictEqual(formatSessionTime(s, false, 'ja'), '13:00〜13:30');
    assert.strictEqual(formatSessionTime(s, false, 'en'), '13:00 - 13:30');
  });

  it('formats single-day with start time only without trailing wave', () => {
    const s: PerformanceSchedule = {
      date: '2026-10-03',
      startTime: '13:00',
    };
    assert.strictEqual(formatSessionTime(s, false, 'ja'), '13:00');
    assert.strictEqual(formatSessionTime(s, false, 'en'), '13:00');
  });

  it('formats multi-day / exhibition with date range', () => {
    const s: PerformanceSchedule = {
      date: '2026-10-08',
      endDate: '2026-11-08',
      startTime: '10:00',
      endTime: '18:00',
    };
    assert.strictEqual(formatSessionTime(s, true, 'ja'), '〜11/8（日） 10:00〜18:00');
    assert.strictEqual(formatSessionTime(s, true, 'en'), 'Until Nov 8 (Sun) 10:00 - 18:00');
  });

  it('formats multi-day exhibition without start/end times', () => {
    const s: PerformanceSchedule = {
      date: '2026-10-08',
      endDate: '2026-11-08',
      startTime: '',
    };
    assert.strictEqual(formatSessionTime(s, true, 'ja'), '〜11/8（日）');
    assert.strictEqual(formatSessionTime(s, true, 'en'), 'Until Nov 8 (Sun)');
  });
});

describe('getVenueDateGroups', () => {
  const targetVenueId = 'tenshiba';

  it('groups sessions by date ascending and orders within date by start time', () => {
    const perfs: Performance[] = [
      {
        id: 'perf-1',
        title: '公演A',
        titleEn: 'Performance A',
        description: '公演Aの説明',
        venueId: targetVenueId,
        schedules: [
          { date: '2026-10-04', startTime: '15:00', endTime: '16:00', venueId: targetVenueId },
          { date: '2026-10-03', startTime: '15:00', endTime: '16:00', venueId: targetVenueId },
          { date: '2026-10-03', startTime: '13:00', endTime: '13:30', venueId: targetVenueId },
        ],
      },
      {
        id: 'perf-2',
        title: '公演B',
        titleEn: 'Performance B',
        description: '公演Bの説明',
        venueId: targetVenueId,
        schedules: [
          { date: '2026-10-03', startTime: '14:00', endTime: '14:45', venueId: targetVenueId },
        ],
      },
    ];

    const groups = getVenueDateGroups(targetVenueId, perfs, 'ja');
    assert.strictEqual(groups.length, 2);

    // 10月3日
    assert.strictEqual(groups[0].dateKey, '2026-10-03');
    assert.strictEqual(groups[0].heading, '10月3日（土）');
    assert.strictEqual(groups[0].sessions.length, 3);
    assert.strictEqual(groups[0].sessions[0].performance.id, 'perf-1');
    assert.strictEqual(groups[0].sessions[0].timeDisplay, '13:00〜13:30');
    assert.strictEqual(groups[0].sessions[1].performance.id, 'perf-2');
    assert.strictEqual(groups[0].sessions[1].timeDisplay, '14:00〜14:45');
    assert.strictEqual(groups[0].sessions[2].performance.id, 'perf-1');
    assert.strictEqual(groups[0].sessions[2].timeDisplay, '15:00〜16:00');

    // 10月4日
    assert.strictEqual(groups[1].dateKey, '2026-10-04');
    assert.strictEqual(groups[1].heading, '10月4日（日）');
    assert.strictEqual(groups[1].sessions.length, 1);
    assert.strictEqual(groups[1].sessions[0].performance.id, 'perf-1');
    assert.strictEqual(groups[1].sessions[0].timeDisplay, '15:00〜16:00');
  });

  it('filters out schedules belonging to other venues without fallback', () => {
    const perfs: Performance[] = [
      {
        id: 'perf-other',
        title: '別会場のみの公演',
        description: '説明',
        venueId: 'other-venue',
        schedules: [
          { date: '2026-10-03', startTime: '12:00', venueId: 'other-venue' },
        ],
      },
      {
        id: 'perf-mixed',
        title: '複数会場公演',
        description: '説明',
        venueId: 'main-venue',
        schedules: [
          { date: '2026-10-03', startTime: '13:00', venueId: targetVenueId },
          { date: '2026-10-03', startTime: '17:00', venueId: 'other-venue' },
        ],
      },
    ];

    const groups = getVenueDateGroups(targetVenueId, perfs, 'ja');
    assert.strictEqual(groups.length, 1);
    assert.strictEqual(groups[0].sessions.length, 1);
    assert.strictEqual(groups[0].sessions[0].performance.id, 'perf-mixed');
    assert.strictEqual(groups[0].sessions[0].timeDisplay, '13:00');
  });

  it('consolidates period exhibitions into 1 row without creating daily rows', () => {
    const exhibitionPerf: Performance = {
      id: 'exhibit-1',
      title: '野外彫刻展',
      description: '説明',
      countMode: 'exhibition',
      venueId: targetVenueId,
      schedules: [
        { date: '2026-10-08', endDate: '2026-11-08', startTime: '10:00', endTime: '18:00', venueId: targetVenueId },
      ],
    };

    const groups = getVenueDateGroups(targetVenueId, [exhibitionPerf], 'ja');
    assert.strictEqual(groups.length, 1);
    assert.strictEqual(groups[0].dateKey, '2026-10-08');
    assert.strictEqual(groups[0].sessions.length, 1);
    assert.strictEqual(groups[0].sessions[0].isExhibition, true);
    assert.strictEqual(groups[0].sessions[0].timeDisplay, '〜11/8（日） 10:00〜18:00');
  });

  it('places unscheduled performances at the target venue at the end', () => {
    const perfs: Performance[] = [
      {
        id: 'perf-unscheduled',
        title: '日程未定公演',
        description: '説明',
        venueId: targetVenueId,
        schedules: [],
      },
      {
        id: 'perf-timed',
        title: '定刻公演',
        description: '説明',
        venueId: targetVenueId,
        schedules: [
          { date: '2026-10-10', startTime: '11:00', venueId: targetVenueId },
        ],
      },
    ];

    const groups = getVenueDateGroups(targetVenueId, perfs, 'ja');
    assert.strictEqual(groups.length, 2);
    assert.strictEqual(groups[0].dateKey, '2026-10-10');
    assert.strictEqual(groups[1].dateKey, 'unscheduled');
    assert.strictEqual(groups[1].heading, '日程未定');
    assert.strictEqual(groups[1].sessions[0].performance.id, 'perf-unscheduled');
  });
});
