import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { formatTicketPrice } from '../src/utils/priceFormat.ts';

describe('formatTicketPrice', () => {
  it('returns empty string when both ja and en are undefined', () => {
    assert.strictEqual(formatTicketPrice(undefined, undefined, 'ja'), '');
    assert.strictEqual(formatTicketPrice(undefined, undefined, 'en'), '');
  });

  it('returns empty string when both ja and en are empty or whitespace only', () => {
    assert.strictEqual(formatTicketPrice('', '', 'ja'), '');
    assert.strictEqual(formatTicketPrice('   ', '  \t \n ', 'ja'), '');
    assert.strictEqual(formatTicketPrice('   ', '', 'en'), '');
    assert.strictEqual(formatTicketPrice('', '   ', 'en'), '');
  });

  it('prioritizes language and trims properly', () => {
    assert.strictEqual(formatTicketPrice('  2,000円  ', '  ¥2,000  ', 'ja'), '2,000円');
    assert.strictEqual(formatTicketPrice('  2,000円  ', '  ¥2,000  ', 'en'), '¥2,000');
  });

  it('falls back to the other language when current language is empty or whitespace', () => {
    assert.strictEqual(formatTicketPrice('1,500円', '', 'en'), '1,500円');
    assert.strictEqual(formatTicketPrice('1,500円', '   ', 'en'), '1,500円');
    assert.strictEqual(formatTicketPrice('', '$15', 'ja'), '$15');
    assert.strictEqual(formatTicketPrice('   ', '$15', 'ja'), '$15');
  });

  it('preserves explicitly entered values such as 無料, 0円, 投げ銭, 要問合せ', () => {
    assert.strictEqual(formatTicketPrice('無料', '', 'ja'), '無料');
    assert.strictEqual(formatTicketPrice('0円', '', 'ja'), '0円');
    assert.strictEqual(formatTicketPrice('投げ銭', '', 'ja'), '投げ銭');
    assert.strictEqual(formatTicketPrice('要問合せ', '', 'ja'), '要問合せ');
    assert.strictEqual(formatTicketPrice('', 'Free', 'en'), 'Free');
    assert.strictEqual(formatTicketPrice('', 'Inquire', 'en'), 'Inquire');
    assert.strictEqual(formatTicketPrice('', 'Tip-based', 'en'), 'Tip-based');
  });

  it('does NOT automatically autocomplete Inquire or 要問合せ when both are empty', () => {
    assert.strictEqual(formatTicketPrice(undefined, undefined, 'ja'), '');
    assert.strictEqual(formatTicketPrice(undefined, undefined, 'en'), '');
    assert.notStrictEqual(formatTicketPrice(undefined, undefined, 'ja'), '要問合せ');
    assert.notStrictEqual(formatTicketPrice(undefined, undefined, 'en'), 'Inquire');
  });
});
