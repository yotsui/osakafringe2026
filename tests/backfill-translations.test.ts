import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  backfillSiteInfo,
  backfillPartners,
  runBackfill,
  createDefaultStats,
  type BackfillContext,
} from '../scripts/backfillTranslations.ts';

interface AwardsInfoPayload {
  fieldId?: string;
  enabled?: boolean;
  title?: string;
  titleEn?: string;
  tagline?: string;
  taglineEn?: string;
  summary?: string;
  summaryEn?: string;
  notice?: string;
  noticeEn?: string;
  customMeta?: number;
}

interface AwardSectionPayload {
  fieldId?: string;
  title?: string;
  titleEn?: string;
  text?: string;
  textEn?: string;
}

interface AwardPersonPayload {
  fieldId?: string;
  name?: string;
  nameEn?: string;
  role?: string;
  roleEn?: string;
  title?: string;
  titleEn?: string;
  profile?: string;
  profileEn?: string;
  photo?: string | { url: string };
}

interface SiteInfoUpdatePayload {
  awardsInfo?: AwardsInfoPayload;
  awardsSections?: AwardSectionPayload[];
  awardsEditor?: AwardPersonPayload;
  awardsMembers?: AwardPersonPayload[];
}

interface PartnerUpdatePayload {
  nameEn?: string;
  descriptionEn?: string;
  category?: string;
}

describe('Translation Backfill Tests', () => {
  it('1. awardsInfo: translates title, tagline, summary, notice and preserves custom properties', async () => {
    let updatedPayload: SiteInfoUpdatePayload | null = null;
    const mockClient = {
      getObject: async () => ({
        id: 'site_info_id',
        siteTitle: '大阪フリンジ',
        awardsInfo: {
          fieldId: 'awardsInfoCustom',
          enabled: false,
          title: 'アワードタイトル',
          tagline: 'タグライン',
          summary: 'サマリー',
          notice: 'お知らせ',
          customMeta: 12345,
        },
      }),
      update: async (args: { endpoint: string; contentId?: string; content: SiteInfoUpdatePayload }) => {
        updatedPayload = args.content;
      },
    };

    const ctx: BackfillContext = {
      client: mockClient,
      stats: createDefaultStats(),
      isDryRun: false,
      translator: async (text) => `EN: ${text}`,
    };

    await backfillSiteInfo(ctx);

    assert.ok(updatedPayload);
    const awardsInfo = (updatedPayload as SiteInfoUpdatePayload).awardsInfo;
    assert.ok(awardsInfo);
    assert.strictEqual(awardsInfo.title, 'アワードタイトル');
    assert.strictEqual(awardsInfo.titleEn, 'EN: アワードタイトル');
    assert.strictEqual(awardsInfo.taglineEn, 'EN: タグライン');
    assert.strictEqual(awardsInfo.summaryEn, 'EN: サマリー');
    assert.strictEqual(awardsInfo.noticeEn, 'EN: お知らせ');
    assert.strictEqual(awardsInfo.enabled, false);
    assert.strictEqual(awardsInfo.fieldId, 'awardsInfoCustom');
    assert.strictEqual(awardsInfo.customMeta, 12345);
    assert.strictEqual(ctx.stats.awardsInfoScheduled, 4);
  });

  it('2. awardsInfo: does not overwrite existing English and skips empty Japanese', async () => {
    let updatedPayload: SiteInfoUpdatePayload | null = null;
    const mockClient = {
      getObject: async () => ({
        id: 'site_info_id',
        awardsInfo: {
          title: 'タイトル',
          titleEn: 'Existing Title EN',
          tagline: '',
          summary: '   ',
          notice: '新しいお知らせ',
        },
      }),
      update: async (args: { endpoint: string; contentId?: string; content: SiteInfoUpdatePayload }) => {
        updatedPayload = args.content;
      },
    };

    const ctx: BackfillContext = {
      client: mockClient,
      stats: createDefaultStats(),
      isDryRun: false,
      translator: async (text) => `EN: ${text}`,
    };

    await backfillSiteInfo(ctx);

    assert.ok(updatedPayload);
    const awardsInfo = (updatedPayload as SiteInfoUpdatePayload).awardsInfo;
    assert.ok(awardsInfo);
    assert.strictEqual(ctx.stats.englishSkipped, 1);
    assert.strictEqual(ctx.stats.awardsInfoScheduled, 1);
    assert.strictEqual(awardsInfo.titleEn, 'Existing Title EN');
    assert.strictEqual(awardsInfo.noticeEn, 'EN: 新しいお知らせ');
  });

  it('3. awardsSections: translates title and text, preserves order and fieldId', async () => {
    let updatedPayload: SiteInfoUpdatePayload | null = null;
    const mockClient = {
      getObject: async () => ({
        id: 'site_info_id',
        awardsSections: [
          { fieldId: 'sec1', title: '部門1', text: '説明1' },
          { fieldId: 'sec2', title: '部門2', titleEn: 'Category 2', text: '説明2' },
        ],
      }),
      update: async (args: { endpoint: string; contentId?: string; content: SiteInfoUpdatePayload }) => {
        updatedPayload = args.content;
      },
    };

    const ctx: BackfillContext = {
      client: mockClient,
      stats: createDefaultStats(),
      isDryRun: false,
      translator: async (text) => `EN: ${text}`,
    };

    await backfillSiteInfo(ctx);

    assert.ok(updatedPayload);
    const sections = (updatedPayload as SiteInfoUpdatePayload).awardsSections;
    assert.ok(sections);
    assert.strictEqual(sections.length, 2);
    assert.strictEqual(sections[0].titleEn, 'EN: 部門1');
    assert.strictEqual(sections[0].textEn, 'EN: 説明1');
    assert.strictEqual(sections[1].titleEn, 'Category 2');
    assert.strictEqual(sections[1].textEn, 'EN: 説明2');
    assert.strictEqual(sections[0].fieldId, 'sec1');
    assert.strictEqual(sections[1].fieldId, 'sec2');
    assert.strictEqual(ctx.stats.awardsSectionsScheduled, 3);
  });

  it('4. awardsEditor: translates editor fields and normalizes photo object to URL string', async () => {
    let updatedPayload: SiteInfoUpdatePayload | null = null;
    const mockClient = {
      getObject: async () => ({
        id: 'site_info_id',
        awardsEditor: {
          fieldId: 'editorField',
          name: '山田 太郎',
          role: '編集長',
          title: '演劇評論家',
          profile: 'プロフィール文章',
          photo: {
            url: 'https://images.microcms-assets.io/editor.jpg',
            width: 800,
            height: 600,
          },
        },
      }),
      update: async (args: { endpoint: string; contentId?: string; content: SiteInfoUpdatePayload }) => {
        updatedPayload = args.content;
      },
    };

    const ctx: BackfillContext = {
      client: mockClient,
      stats: createDefaultStats(),
      isDryRun: false,
      translator: async (text) => `EN: ${text}`,
    };

    await backfillSiteInfo(ctx);

    assert.ok(updatedPayload);
    const editor = (updatedPayload as SiteInfoUpdatePayload).awardsEditor;
    assert.ok(editor);
    assert.strictEqual(editor.nameEn, 'EN: 山田 太郎');
    assert.strictEqual(editor.roleEn, 'EN: 編集長');
    assert.strictEqual(editor.titleEn, 'EN: 演劇評論家');
    assert.strictEqual(editor.profileEn, 'EN: プロフィール文章');
    // Photo must be normalized to string URL for microCMS update API
    assert.strictEqual(editor.photo, 'https://images.microcms-assets.io/editor.jpg');
    assert.strictEqual(editor.fieldId, 'editorField');
    assert.strictEqual(ctx.stats.awardsEditorScheduled, 4);
  });

  it('5. awardsMembers: translates members, preserves order, and normalizes photos', async () => {
    let updatedPayload: SiteInfoUpdatePayload | null = null;
    const mockClient = {
      getObject: async () => ({
        id: 'site_info_id',
        awardsMembers: [
          {
            fieldId: 'mem1',
            name: 'メンバーA',
            role: '審査員',
            title: 'ディレクター',
            profile: 'プロフィールA',
            photo: {
              url: 'https://images.microcms-assets.io/a.jpg',
              width: 1200,
              height: 900,
            },
          },
          {
            fieldId: 'mem2',
            name: 'メンバーB',
            nameEn: 'Member B',
            role: '審査員',
            title: '',
            profile: 'プロフィールB',
          },
        ],
      }),
      update: async (args: { endpoint: string; contentId?: string; content: SiteInfoUpdatePayload }) => {
        updatedPayload = args.content;
      },
    };

    const ctx: BackfillContext = {
      client: mockClient,
      stats: createDefaultStats(),
      isDryRun: false,
      translator: async (text) => `EN: ${text}`,
    };

    await backfillSiteInfo(ctx);

    assert.ok(updatedPayload);
    const members = (updatedPayload as SiteInfoUpdatePayload).awardsMembers;
    assert.ok(members);
    assert.strictEqual(members.length, 2);
    assert.strictEqual(members[0].nameEn, 'EN: メンバーA');
    assert.strictEqual(members[0].roleEn, 'EN: 審査員');
    assert.strictEqual(members[0].titleEn, 'EN: ディレクター');
    assert.strictEqual(members[0].profileEn, 'EN: プロフィールA');
    assert.strictEqual(members[0].photo, 'https://images.microcms-assets.io/a.jpg');
    assert.strictEqual(members[0].fieldId, 'mem1');
    assert.strictEqual(members[1].nameEn, 'Member B');
    assert.strictEqual(members[1].roleEn, 'EN: 審査員');
    assert.strictEqual(members[1].profileEn, 'EN: プロフィールB');
    assert.strictEqual(members[1].photo, undefined);
    assert.strictEqual(members[1].fieldId, 'mem2');
    assert.strictEqual(ctx.stats.awardsMembersScheduled, 6);
  });

  it('6. Safely handles missing awards fields without errors', async () => {
    let updateCalled = false;
    const mockClient = {
      getObject: async () => ({
        id: 'site_info_id',
        siteTitle: '大阪フリンジ',
        siteTitleEn: 'Osaka Fringe',
      }),
      update: async () => {
        updateCalled = true;
      },
    };

    const ctx: BackfillContext = {
      client: mockClient,
      stats: createDefaultStats(),
      isDryRun: false,
      translator: async (text) => `EN: ${text}`,
    };

    await backfillSiteInfo(ctx);
    assert.strictEqual(updateCalled, false);
    assert.strictEqual(ctx.stats.translationFailed, 0);
  });

  it('7. backfillPartners: translates name and description, skips existing EN, leaves category untouched', async () => {
    let updatedPayload: PartnerUpdatePayload | null = null;
    let updatedEndpoint = '';
    const mockClient = {
      getList: async ({ endpoint }: { endpoint: string }) => {
        if (endpoint === 'partner') {
          return {
            contents: [
              {
                id: 'partner_1',
                name: 'パートナー団体',
                description: '団体概要説明',
                category: '連携イベント・フェス',
              },
              {
                id: 'partner_2',
                name: 'パートナー2',
                nameEn: 'Partner Two',
                description: '説明2',
                descriptionEn: 'Description Two',
                category: '組織（後援・協力）',
              },
            ],
            totalCount: 2,
          };
        }
        throw new Error('Unknown endpoint');
      },
      get: async ({ contentId }: { endpoint: string; contentId: string }) => {
        return {
          id: contentId,
          name: 'パートナー団体',
          description: '団体概要説明',
          category: '連携イベント・フェス',
        };
      },
      update: async (args: { endpoint: string; contentId: string; content: PartnerUpdatePayload }) => {
        updatedEndpoint = args.endpoint;
        updatedPayload = args.content;
      },
    };

    const ctx: BackfillContext = {
      client: mockClient,
      stats: createDefaultStats(),
      isDryRun: false,
      translator: async (text) => `EN: ${text}`,
    };

    await backfillPartners(ctx);

    assert.strictEqual(updatedEndpoint, 'partner');
    assert.ok(updatedPayload);
    const partner = updatedPayload as PartnerUpdatePayload;
    assert.strictEqual(partner.nameEn, 'EN: パートナー団体');
    assert.strictEqual(partner.descriptionEn, 'EN: 団体概要説明');
    assert.strictEqual(partner.category, undefined, 'Category should NOT be included in update payload');
    assert.strictEqual(ctx.stats.partnerScheduled, 1);
    assert.strictEqual(ctx.stats.englishSkipped, 2);
  });

  it('8. Pre-write race prevention: skips writing if fresh data already contains EN', async () => {
    let updateCalled = false;
    const mockClient = {
      getList: async () => ({
        contents: [
          {
            id: 'partner_1',
            name: 'パートナー団体',
            description: '団体概要',
            nameEn: '',
            descriptionEn: '',
          },
        ],
        totalCount: 1,
      }),
      get: async () => ({
        id: 'partner_1',
        name: 'パートナー団体',
        description: '団体概要',
        nameEn: 'Fresh Name EN',
        descriptionEn: 'Fresh Description EN',
      }),
      update: async () => {
        updateCalled = true;
      },
    };

    const ctx: BackfillContext = {
      client: mockClient,
      stats: createDefaultStats(),
      isDryRun: false,
      translator: async (text) => `EN: ${text}`,
    };

    await backfillPartners(ctx);

    assert.strictEqual(updateCalled, false, 'Should not write when fresh CMS data already has EN');
    assert.strictEqual(ctx.stats.writesCount, 0);
  });

  it('9. Never writes JP on translation failure and flags failure in summary', async () => {
    let updatedPayload: SiteInfoUpdatePayload | null = null;
    const mockClient = {
      getList: async () => ({ contents: [], totalCount: 0 }),
      getObject: async () => ({
        id: 'site_info_id',
        awardsInfo: {
          title: 'アワードタイトル',
          summary: 'サマリー文',
        },
      }),
      update: async (args: { endpoint: string; contentId?: string; content: SiteInfoUpdatePayload }) => {
        updatedPayload = args.content;
      },
    };

    const ctx: BackfillContext = {
      client: mockClient,
      stats: createDefaultStats(),
      isDryRun: false,
      // Translator fails on summary
      translator: async (text) => {
        if (text === 'サマリー文') return null;
        return `EN: ${text}`;
      },
    };

    await backfillSiteInfo(ctx);

    assert.ok(updatedPayload);
    const awardsInfo = (updatedPayload as SiteInfoUpdatePayload).awardsInfo;
    assert.ok(awardsInfo);
    assert.strictEqual(awardsInfo.titleEn, 'EN: アワードタイトル');
    assert.strictEqual(awardsInfo.summaryEn, undefined, 'JP should NEVER be written to EN on failure');

    // Verify runBackfill reports failure when translationFailed > 0
    ctx.stats.translationFailed = 1;
    const result = await runBackfill(ctx);
    assert.strictEqual(result, false, 'runBackfill should return false on errors');
  });

  it('10. awardsMembers conflict handling: skips update if members changed in CMS during translation', async () => {
    let updateCalled = false;
    let callCount = 0;
    const initialMembers = [
      {
        fieldId: 'awardperson',
        name: '服部滋樹',
        role: 'Awards Editor',
        title: 'graf代表',
        profile: '初期プロフィール',
      },
    ];

    // CMS data changed remotely while translation was in-flight (member changed text)
    const freshMembers = [
      {
        fieldId: 'awardperson',
        name: '服部滋樹',
        role: 'Awards Editor',
        title: 'graf代表',
        profile: 'CMS側で更新された最新プロフィール',
      },
    ];

    const mockClient = {
      getObject: async () => {
        callCount++;
        return {
          id: 'site_info_id',
          awardsMembers: callCount === 1 ? initialMembers : freshMembers,
        };
      },
      update: async () => {
        updateCalled = true;
      },
    };

    const ctx: BackfillContext = {
      client: mockClient,
      stats: createDefaultStats(),
      isDryRun: false,
      translator: async (text) => `EN: ${text}`,
    };

    await backfillSiteInfo(ctx);

    // Update must be skipped because CMS data was modified
    assert.strictEqual(updateCalled, false, 'Should not overwrite changed CMS data');
  });

  it('11. awardsMembers fresh merge: adopts English filled in CMS and does not overwrite it', async () => {
    let updatedPayload: SiteInfoUpdatePayload | null = null;
    let callCount = 0;
    const initialMembers = [
      {
        fieldId: 'awardperson',
        name: '服部滋樹',
        role: 'Awards Editor',
        title: 'graf代表',
        profile: 'プロフィール',
      },
    ];

    // Someone filled in nameEn remotely in CMS during translation
    const freshMembers = [
      {
        fieldId: 'awardperson',
        name: '服部滋樹',
        nameEn: 'Shigeki Hattori (from CMS)',
        role: 'Awards Editor',
        title: 'graf代表',
        profile: 'プロフィール',
      },
    ];

    const mockClient = {
      getObject: async () => {
        callCount++;
        return {
          id: 'site_info_id',
          awardsMembers: callCount === 1 ? initialMembers : freshMembers,
        };
      },
      update: async (args: { endpoint: string; contentId?: string; content: SiteInfoUpdatePayload }) => {
        updatedPayload = args.content;
      },
    };

    const ctx: BackfillContext = {
      client: mockClient,
      stats: createDefaultStats(),
      isDryRun: false,
      translator: async (text) => `EN: ${text}`,
    };

    await backfillSiteInfo(ctx);

    assert.ok(updatedPayload);
    const members = (updatedPayload as SiteInfoUpdatePayload).awardsMembers;
    assert.ok(members);
    assert.strictEqual(members[0].nameEn, 'Shigeki Hattori (from CMS)', 'Should retain fresh EN from CMS');
    assert.strictEqual(members[0].roleEn, 'EN: Awards Editor');
    assert.strictEqual(members[0].profileEn, 'EN: プロフィール');
    assert.strictEqual(ctx.stats.englishSkipped, 1);
  });

  it('12. donationStories and donationImpacts: preserves select arrays and labels upon normalization', async () => {
    let updatedPayload: Record<string, Array<Record<string, unknown>>> | null = null;
    const mockClient = {
      getObject: async () => ({
        id: 'site_info_id',
        donationStories: [
          {
            fieldId: 'donationstory',
            sectionKey: ['PREFORM'],
            title: '寄付ストーリー',
            text: '本文テキスト',
          },
        ],
        donationImpacts: [
          {
            fieldId: 'donationimpact',
            label: 'CREATE OPPORTUNITIES',
            title: 'インパクト見出し',
            text: 'インパクト本文',
          },
        ],
      }),
      update: async (args: { endpoint: string; contentId?: string; content: Record<string, Array<Record<string, unknown>>> }) => {
        updatedPayload = args.content;
      },
    };

    const ctx: BackfillContext = {
      client: mockClient,
      stats: createDefaultStats(),
      isDryRun: false,
      translator: async (text) => `EN: ${text}`,
    };

    await backfillSiteInfo(ctx);

    assert.ok(updatedPayload);
    const payload = updatedPayload as Record<string, Array<Record<string, unknown>>>;
    const story = payload.donationStories[0];
    assert.strictEqual(story.fieldId, 'donationstory');
    assert.deepStrictEqual(story.sectionKey, ['PREFORM']);
    assert.strictEqual(story.titleEn, 'EN: 寄付ストーリー');
    assert.strictEqual(story.textEn, 'EN: 本文テキスト');

    const impact = payload.donationImpacts[0];
    assert.strictEqual(impact.fieldId, 'donationimpact');
    assert.strictEqual(impact.label, 'CREATE OPPORTUNITIES');
    assert.strictEqual(impact.titleEn, 'EN: インパクト見出し');
    assert.strictEqual(impact.textEn, 'EN: インパクト本文');
  });

  it('13. dry-run mode: does not invoke update and does not increment writesCount', async () => {
    let updateCalled = false;
    const mockClient = {
      getObject: async () => ({
        id: 'site_info_id',
        awardsMembers: [
          {
            fieldId: 'awardperson',
            name: '服部滋樹',
            role: 'Awards Editor',
            title: 'graf代表',
            profile: 'プロフィール',
          },
        ],
      }),
      update: async () => {
        updateCalled = true;
      },
    };

    const ctx: BackfillContext = {
      client: mockClient,
      stats: createDefaultStats(),
      isDryRun: true,
      translator: async (text) => `EN: ${text}`,
    };

    await backfillSiteInfo(ctx);

    assert.strictEqual(updateCalled, false);
    assert.strictEqual(ctx.stats.writesCount, 0);
  });

  it('14. write error handling: update failure increments updateFailed and does not increment writesCount', async () => {
    const mockClient = {
      getObject: async () => ({
        id: 'site_info_id',
        siteTitle: '大阪フリンジ',
        siteTitleEn: '',
      }),
      update: async () => {
        throw new Error('microCMS API 400 Bad Request');
      },
    };

    const ctx: BackfillContext = {
      client: mockClient,
      stats: createDefaultStats(),
      isDryRun: false,
      translator: async (text) => `EN: ${text}`,
    };

    await backfillSiteInfo(ctx);

    assert.strictEqual(ctx.stats.writesCount, 0, 'writesCount should remain 0 on error');
    assert.strictEqual(ctx.stats.updateFailed, 1, 'updateFailed should be incremented');
  });
});

