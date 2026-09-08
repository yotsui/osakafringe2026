import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateTranslateInput,
  validateMapVenues,
  isValidCoordinateNumber,
  validateDonateInput,
  getVerifiedOrigin,
  MIN_DONATE_AMOUNT,
  MAX_DONATE_AMOUNT,
  MAX_TRANSLATE_TEXT_LENGTH,
  MAX_TRANSLATE_CONTEXT_LENGTH,
  MAX_MAP_VENUES_COUNT,
} from '../src/lib/apiValidators.ts';

test('Validator: validateTranslateInput', async (t) => {
  await t.test('accepts valid input and optional context', () => {
    const res = validateTranslateInput({
      text: '劇団大阪による新作コメディ公演',
      context: '演劇のあらすじ翻訳',
    });
    assert.equal(res.valid, true);
    assert.equal(res.data?.text, '劇団大阪による新作コメディ公演');
    assert.equal(res.data?.context, '演劇のあらすじ翻訳');
  });

  await t.test('rejects missing or empty text', () => {
    const res1 = validateTranslateInput({});
    assert.equal(res1.valid, false);
    assert.match(res1.error || '', /text is required/i);

    const res2 = validateTranslateInput({ text: '   ' });
    assert.equal(res2.valid, false);
    assert.match(res2.error || '', /text is required/i);

    const res3 = validateTranslateInput({ text: 12345 });
    assert.equal(res3.valid, false);
    assert.match(res3.error || '', /text is required/i);
  });

  await t.test(`rejects text exceeding ${MAX_TRANSLATE_TEXT_LENGTH} characters`, () => {
    const res = validateTranslateInput({
      text: 'a'.repeat(MAX_TRANSLATE_TEXT_LENGTH + 1),
    });
    assert.equal(res.valid, false);
    assert.match(res.error || '', /text exceeds maximum length/i);
  });

  await t.test(`rejects context exceeding ${MAX_TRANSLATE_CONTEXT_LENGTH} characters`, () => {
    const res = validateTranslateInput({
      text: '短文テキスト',
      context: 'c'.repeat(MAX_TRANSLATE_CONTEXT_LENGTH + 1),
    });
    assert.equal(res.valid, false);
    assert.match(res.error || '', /context exceeds maximum length/i);
  });

  await t.test('rejects non-string context', () => {
    const res = validateTranslateInput({
      text: '短文テキスト',
      context: { invalid: true },
    });
    assert.equal(res.valid, false);
    assert.match(res.error || '', /context must be a string/i);
  });
});

test('Validator: validateMapVenues & coordinates', async (t) => {
  await t.test('validates coordinate bounds accurately', () => {
    assert.equal(isValidCoordinateNumber(34.7081, -90, 90), true);
    assert.equal(isValidCoordinateNumber(135.5034, -180, 180), true);
    assert.equal(isValidCoordinateNumber(91, -90, 90), false);
    assert.equal(isValidCoordinateNumber(-90.1, -90, 90), false);
    assert.equal(isValidCoordinateNumber(181, -180, 180), false);
    assert.equal(isValidCoordinateNumber('34.7', -90, 90), false);
    assert.equal(isValidCoordinateNumber(NaN, -90, 90), false);
  });

  await t.test('accepts valid venues array', () => {
    const res = validateMapVenues([
      {
        id: 'v-1',
        name: '扇町ミュージアムキューブ',
        area: '扇町',
        location: { lat: 34.7042, lng: 135.5113 },
      },
    ]);
    assert.equal(res.valid, true);
    assert.equal(res.data?.length, 1);
    assert.equal(res.data?.[0].name, '扇町ミュージアムキューブ');
  });

  await t.test(`rejects venues array exceeding ${MAX_MAP_VENUES_COUNT} items`, () => {
    const largeList = Array.from({ length: MAX_MAP_VENUES_COUNT + 1 }, (_, i) => ({
      id: `v-${i}`,
      name: `Venue ${i}`,
      location: { lat: 34.7, lng: 135.5 },
    }));
    const res = validateMapVenues(largeList);
    assert.equal(res.valid, false);
    assert.match(res.error || '', /exceeds maximum allowed limit/i);
  });

  await t.test('rejects venue with invalid location coordinates', () => {
    const res = validateMapVenues([
      {
        id: 'v-1',
        name: 'Invalid Venue',
        location: { lat: 100.0, lng: 135.5 },
      },
    ]);
    assert.equal(res.valid, false);
    assert.match(res.error || '', /invalid or missing coordinates/i);
  });
});

test('Validator: validateDonateInput & origin resolution', async (t) => {
  await t.test('accepts valid donation within bounds and integer amount', () => {
    const res = validateDonateInput({
      amount: 5000,
      donorName: '山田 太郎',
      donorEmail: 'yamada@example.com',
      donorMessage: '応援しています！',
      locale: 'ja',
    });
    assert.equal(res.valid, true);
    assert.equal(res.data?.amount, 5000);
    assert.equal(res.data?.donorName, '山田 太郎');
    assert.equal(res.data?.donorEmail, 'yamada@example.com');
  });

  await t.test(`rejects amount less than minimum (¥${MIN_DONATE_AMOUNT})`, () => {
    const res = validateDonateInput({ amount: 499 });
    assert.equal(res.valid, false);
    assert.match(res.error || '', /Invalid donation amount/i);
  });

  await t.test(`rejects amount exceeding maximum (¥${MAX_DONATE_AMOUNT})`, () => {
    const res = validateDonateInput({ amount: MAX_DONATE_AMOUNT + 1 });
    assert.equal(res.valid, false);
    assert.match(res.error || '', /Invalid donation amount/i);
  });

  await t.test('rejects non-integer amount', () => {
    const res = validateDonateInput({ amount: 1234.56 });
    assert.equal(res.valid, false);
    assert.match(res.error || '', /Invalid donation amount/i);
  });

  await t.test('rejects invalid email formats', () => {
    const res1 = validateDonateInput({
      amount: 1000,
      donorEmail: 'invalid-email-string',
    });
    assert.equal(res1.valid, false);
    assert.match(res1.error || '', /valid email address/i);

    const res2 = validateDonateInput({
      amount: 1000,
      donorEmail: 12345,
    });
    assert.equal(res2.valid, false);
    assert.match(res2.error || '', /Invalid email address format/i);
  });

  await t.test('getVerifiedOrigin validates URLs strictly and avoids Host header injection', () => {
    assert.equal(getVerifiedOrigin('https://osakafringe.jp'), 'https://osakafringe.jp');
    assert.equal(getVerifiedOrigin('http://staging.osakafringe.jp:3000/some/path'), 'http://staging.osakafringe.jp:3000');
    assert.equal(getVerifiedOrigin('javascript:alert(1)'), 'http://localhost:3000');
    assert.equal(getVerifiedOrigin('not a url'), 'http://localhost:3000');
    assert.equal(getVerifiedOrigin(undefined), 'http://localhost:3000');
  });
});
