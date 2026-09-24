import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizePartner,
  DraftPreviewError,
  getDraftVenueById,
  getDraftArtistById,
  getDraftPartnerById,
} from '../src/lib/microcms.ts';
import type { Partner, Performance, Venue, Artist } from '../src/types/index.ts';

describe('Draft Preview Expansion: venues, artists, partner', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.MICROCMS_PREVIEW_ENABLED;
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  describe('normalizePartner', () => {
    it('normalizes partner with array category correctly', () => {
      const raw = {
        id: 'partner-1',
        name: 'テスト協力企業',
        nameEn: 'Test Partner Co.',
        category: ['会場協力'],
        websiteUrl: 'https://example.com',
        image: { url: 'https://images.microcms-assets.io/test.png' },
      };

      const result = normalizePartner(raw);
      assert.equal(result.id, 'partner-1');
      assert.equal(result.name, 'テスト協力企業');
      assert.equal(result.nameEn, 'Test Partner Co.');
      assert.equal(result.category, '会場協力');
      assert.equal(result.url, 'https://example.com');
      assert.equal(result.image, 'https://images.microcms-assets.io/test.png');
    });

    it('falls back to default category when category is missing or empty', () => {
      const raw = {
        id: 'partner-2',
        name: '後援団体',
      };

      const result = normalizePartner(raw);
      assert.equal(result.category, '組織（後援・協力）');
      assert.equal(result.url, '#');
      assert.equal(result.description, '');
    });
  });

  describe('Draft fetching validations and error handling', () => {
    it('throws NOT_FOUND when id is empty', async () => {
      await assert.rejects(
        async () => {
          await getDraftVenueById('', 'valid-draft-key');
        },
        (err: unknown) => {
          assert.ok(err instanceof DraftPreviewError);
          assert.equal(err.code, 'NOT_FOUND');
          return true;
        }
      );

      await assert.rejects(
        async () => {
          await getDraftArtistById('  ', 'valid-draft-key');
        },
        (err: unknown) => {
          assert.ok(err instanceof DraftPreviewError);
          assert.equal(err.code, 'NOT_FOUND');
          return true;
        }
      );

      await assert.rejects(
        async () => {
          await getDraftPartnerById('', 'valid-draft-key');
        },
        (err: unknown) => {
          assert.ok(err instanceof DraftPreviewError);
          assert.equal(err.code, 'NOT_FOUND');
          return true;
        }
      );
    });

    it('throws DRAFT_KEY_MISSING when draftKey is empty', async () => {
      await assert.rejects(
        async () => {
          await getDraftVenueById('venue-1', '');
        },
        (err: unknown) => {
          assert.ok(err instanceof DraftPreviewError);
          assert.equal(err.code, 'DRAFT_KEY_MISSING');
          return true;
        }
      );

      await assert.rejects(
        async () => {
          await getDraftArtistById('artist-1', '   ');
        },
        (err: unknown) => {
          assert.ok(err instanceof DraftPreviewError);
          assert.equal(err.code, 'DRAFT_KEY_MISSING');
          return true;
        }
      );

      await assert.rejects(
        async () => {
          await getDraftPartnerById('partner-1', '');
        },
        (err: unknown) => {
          assert.ok(err instanceof DraftPreviewError);
          assert.equal(err.code, 'DRAFT_KEY_MISSING');
          return true;
        }
      );
    });

    it('never leaks draftKey or apiKey into error messages', async () => {
      const secretDraftKey = 'super-secret-draft-key-12345';
      try {
        await getDraftVenueById('venue-1', secretDraftKey);
      } catch (err) {
        if (err instanceof Error) {
          assert.ok(!err.message.includes(secretDraftKey));
        }
      }
    });
  });

  describe('Partner list preview merging logic', () => {
    const publicPartners: Partner[] = [
      {
        id: 'p-1',
        name: '既存スポンサーA',
        nameEn: 'Sponsor A',
        category: 'スポンサー',
        description: '説明A',
        descriptionEn: 'Desc A',
        image: '',
        url: '#',
      },
      {
        id: 'p-2',
        name: '既存協力B',
        nameEn: 'Partner B',
        category: '組織（後援・協力）',
        description: '説明B',
        descriptionEn: 'Desc B',
        image: '',
        url: '#',
      },
    ];

    it('replaces existing partner in place when ID matches and retains count without duplicates', () => {
      const draftPartner: Partner = {
        id: 'p-1',
        name: '更新されたスポンサーA',
        nameEn: 'Updated Sponsor A',
        category: 'スポンサー',
        description: '下書き説明',
        descriptionEn: 'Draft Desc',
        image: 'https://example.com/logo.png',
        url: 'https://example.com',
      };

      const existingIndex = publicPartners.findIndex((p) => p.id === draftPartner.id);
      assert.equal(existingIndex, 0);

      const merged = publicPartners.map((p) => (p.id === draftPartner.id ? draftPartner : p));
      assert.equal(merged.length, 2);
      assert.equal(merged[0].name, '更新されたスポンサーA');
      assert.equal(merged.filter((p) => p.id === 'p-1').length, 1);
    });

    it('moves partner to new category if draft changes its category', () => {
      const draftPartner: Partner = {
        id: 'p-1',
        name: 'スポンサーから会場協力へ変更',
        nameEn: 'Moved Partner',
        category: '会場協力',
        description: '',
        descriptionEn: '',
        image: '',
        url: '#',
      };

      const merged = publicPartners.map((p) => (p.id === draftPartner.id ? draftPartner : p));
      const target = merged.find((p) => p.id === 'p-1');
      assert.equal(target?.category, '会場協力');
    });

    it('appends new draft partner to the list when ID is not in public list', () => {
      const newDraftPartner: Partner = {
        id: 'p-new',
        name: '新規下書きパートナー',
        nameEn: 'New Partner',
        category: '連携イベント・フェス',
        description: '',
        descriptionEn: '',
        image: '',
        url: '#',
      };

      const existingIndex = publicPartners.findIndex((p) => p.id === newDraftPartner.id);
      assert.equal(existingIndex, -1);

      const merged = [...publicPartners, newDraftPartner];
      assert.equal(merged.length, 3);
      assert.equal(merged[2].id, 'p-new');
    });
  });

  describe('Venue preview performance resolution', () => {
    const venueId = 'venue-abc';
    const draftVenue: Venue = {
      id: venueId,
      name: '下書き新会場名ホール',
      nameEn: 'New Draft Hall',
      area: '梅田・中津',
      address: '大阪市北区',
      access: '梅田駅 徒歩5分',
      location: { lat: 34.7, lng: 135.5 },
    };

    const performances: Performance[] = [
      {
        id: 'perf-1',
        title: '公演1',
        venueId: venueId,
        venueName: '旧会場名',
        venue: {
          id: venueId,
          name: '旧会場名',
          area: '梅田・中津',
          address: '',
          access: '',
          location: { lat: 0, lng: 0 },
        },
        description: '',
        schedules: [],
      },
      {
        id: 'perf-2',
        title: '公演2（日程別会場で参照）',
        venueId: 'other-venue',
        venueName: '別会場',
        description: '',
        schedules: [
          {
            id: 's-1',
            date: '2026-10-10',
            startTime: '14:00',
            venueId: venueId,
            venueName: '旧会場名',
            venue: {
              id: venueId,
              name: '旧会場名',
              area: '梅田・中津',
              address: '',
              access: '',
              location: { lat: 0, lng: 0 },
            },
          },
        ],
      },
      {
        id: 'perf-3',
        title: '公演3（無関係な会場）',
        venueId: 'unrelated-venue',
        description: '',
        schedules: [],
      },
    ];

    it('extracts performances by main venueId and schedule venueId', () => {
      const matching = performances.filter(
        (p) =>
          p.venueId === venueId ||
          p.venue?.id === venueId ||
          (p.schedules && p.schedules.some((s) => s.venueId === venueId || s.venue?.id === venueId))
      );

      assert.equal(matching.length, 2);
      assert.deepEqual(
        matching.map((p) => p.id),
        ['perf-1', 'perf-2']
      );
    });

    it('reflects updated venue name in associated performances for preview in memory', () => {
      const matching = performances.filter(
        (p) =>
          p.venueId === venueId ||
          p.venue?.id === venueId ||
          (p.schedules && p.schedules.some((s) => s.venueId === venueId || s.venue?.id === venueId))
      );

      const reflected = matching.map((p) => {
        const isMain = p.venueId === venueId || p.venue?.id === venueId;
        const updatedSchedules = p.schedules?.map((s) => {
          if (s.venueId === venueId || s.venue?.id === venueId) {
            return {
              ...s,
              venueName: draftVenue.name,
              venue: draftVenue,
            };
          }
          return s;
        });

        return {
          ...p,
          ...(isMain
            ? {
                venueName: draftVenue.name,
                venue: draftVenue,
              }
            : {}),
          schedules: updatedSchedules,
        };
      });

      assert.equal(reflected[0].venueName, '下書き新会場名ホール');
      assert.equal(reflected[1].schedules?.[0].venueName, '下書き新会場名ホール');
      // 元のオブジェクトは改変されていない
      assert.equal(performances[0].venueName, '旧会場名');
    });
  });

  describe('Artist preview performance resolution', () => {
    const artistId = 'artist-xyz';
    const draftArtist: Artist = {
      id: artistId,
      name: '改名後劇団アーティスト',
      nameEn: 'Renamed Troupe',
      genre: 'theater',
      profile: '',
    };

    const performances: Performance[] = [
      {
        id: 'perf-1',
        title: '公演A',
        artistId: artistId,
        artistName: '改名前劇団',
        artist: { id: artistId, name: '改名前劇団', genre: 'theater', profile: '' },
        description: '',
        schedules: [],
      },
      {
        id: 'perf-2',
        title: '公演B',
        artistId: 'other-artist',
        artistName: '他アーティスト',
        description: '',
        schedules: [],
      },
    ];

    it('extracts performances prioritizing artistId over name', () => {
      const matching = performances.filter(
        (p) =>
          p.artistId === artistId ||
          p.artist?.id === artistId ||
          (typeof p.artists === 'object' && p.artists?.id === artistId) ||
          p.artists === artistId
      );

      assert.equal(matching.length, 1);
      assert.equal(matching[0].id, 'perf-1');
    });

    it('reflects updated artist name in associated performances for preview in memory', () => {
      const matching = performances.filter(
        (p) => p.artistId === artistId || p.artist?.id === artistId
      );

      const reflected = matching.map((p) => ({
        ...p,
        artistName: draftArtist.name,
        artist: {
          ...p.artist,
          id: draftArtist.id,
          name: draftArtist.name,
        },
      }));

      assert.equal(reflected[0].artistName, '改名後劇団アーティスト');
      assert.equal(reflected[0].artist?.name, '改名後劇団アーティスト');
      // 元のオブジェクトは改変されていない
      assert.equal(performances[0].artistName, '改名前劇団');
    });
  });
});
