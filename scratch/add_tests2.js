const fs = require('fs');
const testFile = 'tests/performance-sorting-and-dates.test.ts';

let content = fs.readFileSync(testFile, 'utf8');

const newTests = `
import { getVenuePerformancesForAllDates } from '../src/utils/performanceUtils.ts';

describe('getVenuePerformancesForAllDates', () => {
  const dummyPerformances2 = [
    {
      id: 'p1',
      schedules: [
        { id: 's1', date: '2026-10-03', startTime: '10:00', endTime: '12:00', venueId: 'v1' }, // past
        { id: 's2', date: '2026-10-04', startTime: '10:00', endTime: '12:00', venueId: 'v1' }, // future
      ]
    },
    {
      id: 'p2',
      schedules: [
        { id: 's3', date: '2026-10-03', startTime: '15:00', endTime: '17:00', venueId: 'v1' }, // past
      ]
    },
    {
      id: 'p3',
      schedules: [
        { id: 's4', date: '2026-10-05', startTime: '10:00', endTime: '12:00', venueId: 'v1' }, // future
      ]
    },
    {
      id: 'p4',
      schedules: [
        { id: 's5', date: '2026-10-04', startTime: '09:00', endTime: '11:00', venueId: 'v1' }, // ongoing
      ]
    }
  ] as any;

  it('returns all performances (past, ongoing, future) up to all available shows and deduplicates by performance ID', () => {
    // Current time: 2026-10-04 10:00 JST (01:00 UTC)
    const now = Date.UTC(2026, 9, 4, 1, 0, 0); 
    const shows = getVenuePerformancesForAllDates('v1', dummyPerformances2, now);
    
    // Total distinct performances at v1 is 4
    assert.strictEqual(shows.length, 4);
    
    // Sorted by startMs
    assert.strictEqual(shows[0].performance.id, 'p1'); // 10-03 10:00
    assert.strictEqual(shows[1].performance.id, 'p2'); // 10-03 15:00
    assert.strictEqual(shows[2].performance.id, 'p4'); // 10-04 09:00
    assert.strictEqual(shows[3].performance.id, 'p3'); // 10-05 10:00

    // Check statuses
    assert.strictEqual(shows[0].isEnded, true);
    assert.strictEqual(shows[1].isEnded, true);
    assert.strictEqual(shows[2].isOngoing, true);
    assert.strictEqual(shows[3].isUpcoming, true);
  });
});
`;

fs.writeFileSync(testFile, content + newTests);
console.log('Tests added.');
