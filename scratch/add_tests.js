const fs = require('fs');
const testFile = 'tests/performance-sorting-and-dates.test.ts';

let content = fs.readFileSync(testFile, 'utf8');

const newTests = `
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
    assert.strictEqual(resultJa, '10/21（水）\\n開場 18:30 ／ 開演 19:00');
    
    // English
    const resultEn = formatScheduleDetailed(schedule, 'en');
    assert.strictEqual(resultEn, 'Oct 21 (Wed) Open 18:30 / Start 19:00');
  });

  it('displays only start time when open time is not available in detailed view', () => {
    const schedule = {
      id: 's2',
      date: '2026-10-21',
      startTime: '19:00',
    };
    
    // Japanese
    const resultJa = formatScheduleDetailed(schedule, 'ja');
    assert.strictEqual(resultJa, '10/21（水）\\n開演 19:00');
    
    // English
    const resultEn = formatScheduleDetailed(schedule, 'en');
    assert.strictEqual(resultEn, 'Oct 21 (Wed) Start 19:00');
  });
});
`;

fs.writeFileSync(testFile, content + newTests);
console.log('Tests added.');
