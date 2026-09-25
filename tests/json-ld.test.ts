import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { parseTicketPrice, formatScheduleIsoDateTime, buildPerformanceJsonLd } from '../src/utils/jsonLd.ts';
import type { Performance } from '../src/types/index.ts';

describe('parseTicketPrice', () => {
  it('correctly parses simple single prices', () => {
    assert.deepStrictEqual(parseTicketPrice('1,000円'), { price: 1000, priceCurrency: 'JPY' });
    assert.deepStrictEqual(parseTicketPrice('¥2,500'), { price: 2500, priceCurrency: 'JPY' });
    assert.deepStrictEqual(parseTicketPrice('500'), { price: 500, priceCurrency: 'JPY' });
    assert.deepStrictEqual(parseTicketPrice('2000 JPY'), { price: 2000, priceCurrency: 'JPY' });
  });

  it('correctly parses explicit free text to price 0', () => {
    assert.deepStrictEqual(parseTicketPrice('無料'), { price: 0, priceCurrency: 'JPY' });
    assert.deepStrictEqual(parseTicketPrice('無料 (Free)'), { price: 0, priceCurrency: 'JPY' });
    assert.deepStrictEqual(parseTicketPrice('Free Admission'), { price: 0, priceCurrency: 'JPY' });
  });

  it('returns null for multiple price tiers, ranges, or unclear amounts to avoid false offers', () => {
    assert.strictEqual(parseTicketPrice('前売 ¥2,500 / 当日 ¥3,000 / 学生 ¥1,500'), null);
    assert.strictEqual(parseTicketPrice('1,000円〜2,000円'), null);
    assert.strictEqual(parseTicketPrice('一般 2,000円 学生 1,000円'), null);
    assert.strictEqual(parseTicketPrice('カンパ制 (投げ銭)'), null);
    assert.strictEqual(parseTicketPrice('Donation based'), null);
    assert.strictEqual(parseTicketPrice('料金未定'), null);
    assert.strictEqual(parseTicketPrice(''), null);
    assert.strictEqual(parseTicketPrice(undefined), null);
  });
});

describe('formatScheduleIsoDateTime', () => {
  it('formats with time when both date and time are valid', () => {
    assert.strictEqual(formatScheduleIsoDateTime('2026-10-08', '19:00'), '2026-10-08T19:00:00+09:00');
  });

  it('returns date only when time is not provided, without inventing fake times', () => {
    assert.strictEqual(formatScheduleIsoDateTime('2026-10-08', undefined), '2026-10-08');
    assert.strictEqual(formatScheduleIsoDateTime('2026-10-08', ''), '2026-10-08');
  });

  it('returns undefined when date is invalid or missing', () => {
    assert.strictEqual(formatScheduleIsoDateTime(undefined, '10:00'), undefined);
    assert.strictEqual(formatScheduleIsoDateTime('', '10:00'), undefined);
  });
});

describe('buildPerformanceJsonLd', () => {
  it('builds valid Schema.org Event for performance with single schedule', () => {
    const perf: Performance = {
      id: 'perf-single',
      title: 'Solo Performance',
      description: 'Solo description',
      ticketPrice: '1,500円',
      ticketUrl: 'https://example.com/ticket',
      schedules: [
        { id: 's1', date: '2026-10-12', startTime: '15:00', endTime: '16:00', venueName: 'Venue A' },
      ],
    };

    const jsonLd = buildPerformanceJsonLd(perf, 'https://osakafringe.com');
    assert.strictEqual(jsonLd['@context'], 'https://schema.org');
    assert.strictEqual(jsonLd['@type'], 'Event');
    assert.strictEqual(jsonLd.name, 'Solo Performance');
    assert.strictEqual(jsonLd.startDate, '2026-10-12T15:00:00+09:00');
    assert.strictEqual(jsonLd.endDate, '2026-10-12T16:00:00+09:00');
    
    const location = jsonLd.location as { name?: string };
    assert.strictEqual(location.name, 'Venue A');
    assert.deepStrictEqual(jsonLd.offers, {
      '@type': 'Offer',
      url: 'https://example.com/ticket',
      price: 1500,
      priceCurrency: 'JPY',
    });
    // InStock must NOT be present
    const offers = jsonLd.offers as Record<string, unknown> | undefined;
    assert.strictEqual(offers?.availability, undefined);
  });

  it('omits offers and omits endDate when ticket price is multi-tiered and no end time is specified', () => {
    const perf: Performance = {
      id: 'perf-tiers',
      title: 'Multi Tier Performance',
      description: 'Tiers description',
      ticketPrice: '前売 ¥2,000 / 当日 ¥2,500',
      schedules: [
        { id: 's1', date: '2026-10-15', startTime: '18:00' },
      ],
    };

    const jsonLd = buildPerformanceJsonLd(perf, 'https://osakafringe.com');
    assert.strictEqual(jsonLd.offers, undefined);
    assert.strictEqual(jsonLd.startDate, '2026-10-15T18:00:00+09:00');
    assert.strictEqual(jsonLd.endDate, undefined);
  });

  it('outputs date-only endDate when explicit endDate is given without endTime', () => {
    const perf: Performance = {
      id: 'perf-exhibition',
      title: 'Art Exhibition',
      description: 'Exhibition description',
      ticketPrice: '無料',
      schedules: [
        { id: 's1', date: '2026-10-08', endDate: '2026-11-08', startTime: '' },
      ],
    };

    const jsonLd = buildPerformanceJsonLd(perf, 'https://osakafringe.com');
    assert.strictEqual(jsonLd.startDate, '2026-10-08');
    assert.strictEqual(jsonLd.endDate, '2026-11-08');
  });

  it('creates subEvents when multiple schedules exist with different times/venues', () => {
    const perf: Performance = {
      id: 'perf-multi',
      title: 'Tour Performance',
      description: 'Tour description',
      schedules: [
        { id: 's1', date: '2026-10-08', startTime: '19:00', venueName: 'Venue A' },
        { id: 's2', date: '2026-10-10', startTime: '14:00', venueName: 'Venue B' },
      ],
    };

    const jsonLd = buildPerformanceJsonLd(perf, 'https://osakafringe.com');
    assert.strictEqual(jsonLd.startDate, '2026-10-08T19:00:00+09:00');
    const subEvent = jsonLd.subEvent as Array<{ startDate?: string; location?: { name?: string } }>;
    assert.ok(Array.isArray(subEvent));
    assert.strictEqual(subEvent.length, 2);
    assert.strictEqual(subEvent[0].startDate, '2026-10-08T19:00:00+09:00');
    assert.strictEqual(subEvent[0].location?.name, 'Venue A');
    assert.strictEqual(subEvent[1].startDate, '2026-10-10T14:00:00+09:00');
    assert.strictEqual(subEvent[1].location?.name, 'Venue B');
  });

  it('does not invent dummy dates/times when schedules are empty', () => {
    const perf: Performance = {
      id: 'perf-empty',
      title: 'No Schedule Performance',
      description: 'Empty description',
      schedules: [],
    };

    const jsonLd = buildPerformanceJsonLd(perf, 'https://osakafringe.com');
    assert.strictEqual(jsonLd.startDate, undefined);
    assert.strictEqual(jsonLd.endDate, undefined);
    assert.strictEqual(jsonLd.subEvent, undefined);
  });
});
