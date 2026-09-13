import test from 'node:test';
import assert from 'node:assert/strict';
import { translations } from '../src/constants/translations.ts';

test('Donation CTA Translations & Navigation Contracts', async (t) => {
  await t.test('hero CTA translations exist and match Japanese / English specifications', () => {
    assert.equal(translations.heroDonateButton.ja, '500円から寄付する');
    assert.equal(translations.heroDonateButton.en, 'Donate from ¥500');

    assert.equal(translations.heroReadImpactLink.ja, '寄付の使い道を読む');
    assert.equal(translations.heroReadImpactLink.en, 'See how your support helps');

    assert.equal(translations.heroSecurePaymentNote.ja, 'クレジットカードで安全にお手続きいただけます');
    assert.equal(translations.heroSecurePaymentNote.en, 'Secure payment by credit card');
  });

  await t.test('mid-page CTA translations exist and match specifications', () => {
    assert.equal(translations.midDonateTitle.ja, 'この活動を応援する');
    assert.equal(translations.midDonateTitle.en, 'Support this project');

    assert.equal(translations.midDonateDesc.ja, '500円から、任意の金額でご支援いただけます。');
    assert.equal(translations.midDonateDesc.en, 'Choose any amount from ¥500.');

    assert.equal(translations.midDonateButton.ja, 'Osaka Fringeを応援する');
    assert.equal(translations.midDonateButton.en, 'Support Osaka Fringe');
  });

  await t.test('all donation translations have both ja and en non-empty strings', () => {
    const donateKeys = [
      'heroDonateButton',
      'heroReadImpactLink',
      'heroSecurePaymentNote',
      'midDonateTitle',
      'midDonateDesc',
      'midDonateButton',
      'onlineDonationTitle',
      'onlineDonationSub',
      'selectAmount',
      'customAmount',
      'customAmountPlaceholder',
      'customAmountMinError',
      'proceedToPayment',
      'processing',
      'securePaymentNotice',
      'bankTransferTitle',
      'bankTransferSub',
      'bankTransferNotice'
    ];

    for (const key of donateKeys) {
      assert.ok(translations[key], `Translation key "${key}" should exist in LanguageContext`);
      assert.ok(translations[key].ja && translations[key].ja.length > 0, `"${key}".ja should be non-empty`);
      assert.ok(translations[key].en && translations[key].en.length > 0, `"${key}".en should be non-empty`);
    }
  });
});
