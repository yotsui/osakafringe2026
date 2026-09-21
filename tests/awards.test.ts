import assert from 'node:assert/strict';
import { describe, it, afterEach } from 'node:test';

import { isAwardsVisible, sanitizeSiteInfoForAwards } from '../src/utils/awardsUtils.ts';
import {
  normalizeAwardInfo,
  normalizeAwardSection,
  normalizeAwardPerson,
  SAFE_DEFAULT_SITE_INFO,
} from '../src/lib/microcms.ts';
import type { SiteInfo } from '../src/types/index.ts';

describe('OSAKA FRINGE AWARDS 2026 Tests', () => {
  const originalEnv = process.env.AWARDS_FEATURE_ENABLED;

  afterEach(() => {
    if (originalEnv === undefined) {
      delete process.env.AWARDS_FEATURE_ENABLED;
    } else {
      process.env.AWARDS_FEATURE_ENABLED = originalEnv;
    }
  });

  describe('isAwardsVisible & Visibility Logic', () => {
    const validSiteInfo: SiteInfo = {
      ...SAFE_DEFAULT_SITE_INFO,
      awardsInfo: {
        enabled: true,
        title: 'OSAKA FRINGE AWARDS 2026',
        summary: '大阪フリンジの新しいアワードプログラム。',
      },
    };

    it('returns false when AWARDS_FEATURE_ENABLED is not set', () => {
      delete process.env.AWARDS_FEATURE_ENABLED;
      assert.strictEqual(isAwardsVisible(validSiteInfo), false);
    });

    it('returns false when AWARDS_FEATURE_ENABLED is not "true"', () => {
      process.env.AWARDS_FEATURE_ENABLED = 'false';
      assert.strictEqual(isAwardsVisible(validSiteInfo), false);
      process.env.AWARDS_FEATURE_ENABLED = '1';
      assert.strictEqual(isAwardsVisible(validSiteInfo), false);
    });

    it('returns false when siteInfo or awardsInfo is missing', () => {
      process.env.AWARDS_FEATURE_ENABLED = 'true';
      assert.strictEqual(isAwardsVisible(null), false);
      assert.strictEqual(isAwardsVisible(undefined), false);
      assert.strictEqual(isAwardsVisible(SAFE_DEFAULT_SITE_INFO), false);
    });

    it('returns false when awardsInfo.enabled is false or missing', () => {
      process.env.AWARDS_FEATURE_ENABLED = 'true';
      const disabledSiteInfo: SiteInfo = {
        ...validSiteInfo,
        awardsInfo: {
          ...validSiteInfo.awardsInfo!,
          enabled: false,
        },
      };
      assert.strictEqual(isAwardsVisible(disabledSiteInfo), false);
    });

    it('returns false when title is empty or only whitespace', () => {
      process.env.AWARDS_FEATURE_ENABLED = 'true';
      const emptyTitleInfo: SiteInfo = {
        ...validSiteInfo,
        awardsInfo: {
          ...validSiteInfo.awardsInfo!,
          title: '   ',
        },
      };
      assert.strictEqual(isAwardsVisible(emptyTitleInfo), false);
    });

    it('returns false when summary is empty or only whitespace', () => {
      process.env.AWARDS_FEATURE_ENABLED = 'true';
      const emptySummaryInfo: SiteInfo = {
        ...validSiteInfo,
        awardsInfo: {
          ...validSiteInfo.awardsInfo!,
          summary: '   \n  \t ',
        },
      };
      assert.strictEqual(isAwardsVisible(emptySummaryInfo), false);
    });

    it('returns true when all 3 conditions are satisfied', () => {
      process.env.AWARDS_FEATURE_ENABLED = 'true';
      assert.strictEqual(isAwardsVisible(validSiteInfo), true);
    });
  });

  describe('normalizeAwardInfo', () => {
    it('returns undefined for null or empty object', () => {
      assert.strictEqual(normalizeAwardInfo(null), undefined);
      assert.strictEqual(normalizeAwardInfo(undefined), undefined);
    });

    it('properly trims single line fields and preserves newlines in textarea', () => {
      const raw = {
        enabled: true,
        title: '  アワードタイトル  ',
        titleEn: '  Award Title  ',
        tagline: '  キャッチコピー  ',
        summary: '  段落1\n\n段落2  ',
        notice: '  案内文\n詳細  ',
      };
      const normalized = normalizeAwardInfo(raw);
      assert.ok(normalized);
      assert.strictEqual(normalized.enabled, true);
      assert.strictEqual(normalized.title, 'アワードタイトル');
      assert.strictEqual(normalized.titleEn, 'Award Title');
      assert.strictEqual(normalized.tagline, 'キャッチコピー');
      assert.strictEqual(normalized.summary, '段落1\n\n段落2');
      assert.strictEqual(normalized.notice, '案内文\n詳細');
    });

    it('handles falsy or empty strings as undefined', () => {
      const raw = {
        enabled: false,
        title: '   ',
        summary: '',
      };
      const normalized = normalizeAwardInfo(raw);
      assert.ok(normalized);
      assert.strictEqual(normalized.enabled, false);
      assert.strictEqual(normalized.title, undefined);
      assert.strictEqual(normalized.summary, undefined);
    });
  });

  describe('normalizeAwardSection', () => {
    it('returns null for empty section', () => {
      assert.strictEqual(normalizeAwardSection(null), null);
      assert.strictEqual(normalizeAwardSection({}), null);
      assert.strictEqual(normalizeAwardSection({ title: '   ', text: '   ' }), null);
    });

    it('preserves text and multiline content', () => {
      const sec = normalizeAwardSection({
        title: 'セクション1',
        text: '第一行\n第二行',
      });
      assert.ok(sec);
      assert.strictEqual(sec.title, 'セクション1');
      assert.strictEqual(sec.text, '第一行\n第二行');
    });
  });

  describe('normalizeAwardPerson (Editor and Members)', () => {
    it('returns null for empty person data', () => {
      assert.strictEqual(normalizeAwardPerson(null), null);
      assert.strictEqual(normalizeAwardPerson({}), null);
      assert.strictEqual(normalizeAwardPerson({ name: '  ', role: '  ' }), null);
    });

    it('handles person with photo object correctly', () => {
      const person = normalizeAwardPerson({
        name: '山田 太郎',
        role: '編集長',
        title: '批評家',
        profile: 'プロフィール文章\n経歴など',
        photo: { url: 'https://images.microcms-assets.io/test.jpg' },
      });
      assert.ok(person);
      assert.strictEqual(person.name, '山田 太郎');
      assert.strictEqual(person.role, '編集長');
      assert.strictEqual(person.title, '批評家');
      assert.strictEqual(person.profile, 'プロフィール文章\n経歴など');
      assert.strictEqual(person.photo, 'https://images.microcms-assets.io/test.jpg');
    });

    it('handles person without photo (photo becomes undefined)', () => {
      const person = normalizeAwardPerson({
        name: '佐藤 花子',
        role: '選考委員',
      });
      assert.ok(person);
      assert.strictEqual(person.name, '佐藤 花子');
      assert.strictEqual(person.role, '選考委員');
      assert.strictEqual(person.photo, undefined);
    });
  });

  describe('sanitizeSiteInfoForAwards', () => {
    const fullSiteInfo: SiteInfo = {
      ...SAFE_DEFAULT_SITE_INFO,
      awardsInfo: {
        enabled: true,
        title: 'OSAKA FRINGE AWARDS 2026',
        summary: '概要文',
      },
      awardsSections: [{ title: '理念', text: '本文' }],
      awardsEditor: { name: '編集長', role: '編集長' },
      awardsMembers: [{ name: 'メンバー1', role: 'メンバー' }],
    };

    it('strips all award data when awards are not visible', () => {
      delete process.env.AWARDS_FEATURE_ENABLED;
      const sanitized = sanitizeSiteInfoForAwards(fullSiteInfo);
      assert.strictEqual(sanitized.awardsInfo, undefined);
      assert.deepStrictEqual(sanitized.awardsSections, []);
      assert.strictEqual(sanitized.awardsEditor, undefined);
      assert.deepStrictEqual(sanitized.awardsMembers, []);
      // Other properties are preserved
      assert.strictEqual(sanitized.siteTitle, fullSiteInfo.siteTitle);
    });

    it('retains award data when awards are visible', () => {
      process.env.AWARDS_FEATURE_ENABLED = 'true';
      const sanitized = sanitizeSiteInfoForAwards(fullSiteInfo);
      assert.strictEqual(sanitized.awardsInfo?.title, 'OSAKA FRINGE AWARDS 2026');
      assert.strictEqual(sanitized.awardsSections?.length, 1);
      assert.strictEqual(sanitized.awardsEditor?.name, '編集長');
      assert.strictEqual(sanitized.awardsMembers?.length, 1);
    });
  });
});
