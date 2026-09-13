import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeArtistGenre,
  getArtistGenreLabel,
  getPerformanceGenreText,
  VALID_ARTIST_GENRES,
} from '../src/utils/genre.ts';
import { normalizeArtist, normalizePerformance } from '../src/lib/microcms.ts';
import type { Performance, ArtistGenre } from '../src/types/index.ts';

describe('Artist.genre and Performance.genre separation', () => {
  describe('normalizeArtistGenre', () => {
    it('accurately normalizes all 8 valid ArtistGenre values', () => {
      const validGenres: ArtistGenre[] = [
        'street',
        'dance',
        'music',
        'theater',
        'traditional',
        'kamishibai',
        'exhibition',
        'other',
      ];

      for (const genre of validGenres) {
        assert.strictEqual(normalizeArtistGenre(genre), genre);
        assert.ok(VALID_ARTIST_GENRES.includes(genre));
      }
    });

    it('handles uppercase, leading/trailing whitespace, and array values', () => {
      assert.strictEqual(normalizeArtistGenre('  MUSIC  '), 'music');
      assert.strictEqual(normalizeArtistGenre('Dance'), 'dance');
      assert.strictEqual(normalizeArtistGenre('THEATER'), 'theater');
      assert.strictEqual(normalizeArtistGenre(['kamishibai']), 'kamishibai');
      assert.strictEqual(normalizeArtistGenre(['  STREET  ']), 'street');
    });

    it('maps unknown, obsolete, or invalid values to "other"', () => {
      assert.strictEqual(normalizeArtistGenre('circus'), 'other');
      assert.strictEqual(normalizeArtistGenre('comedy'), 'other');
      assert.strictEqual(normalizeArtistGenre('art'), 'other');
      assert.strictEqual(normalizeArtistGenre('unknown-genre'), 'other');
      assert.strictEqual(normalizeArtistGenre(''), 'other');
      assert.strictEqual(normalizeArtistGenre(undefined), 'other');
      assert.strictEqual(normalizeArtistGenre(null), 'other');
      assert.strictEqual(normalizeArtistGenre([]), 'other');
    });
  });

  describe('getArtistGenreLabel', () => {
    it('returns localized labels in Japanese', () => {
      assert.strictEqual(getArtistGenreLabel('street', 'ja'), '大道芸・サーカス');
      assert.strictEqual(getArtistGenreLabel('dance', 'ja'), 'ダンス・舞踊');
      assert.strictEqual(getArtistGenreLabel('music', 'ja'), '音楽・ライブ');
      assert.strictEqual(getArtistGenreLabel('theater', 'ja'), '演劇・パフォーマンス');
      assert.strictEqual(getArtistGenreLabel('traditional', 'ja'), '伝統芸能・古典');
      assert.strictEqual(getArtistGenreLabel('kamishibai', 'ja'), '紙芝居・語り');
      assert.strictEqual(getArtistGenreLabel('exhibition', 'ja'), '展示・アート');
      assert.strictEqual(getArtistGenreLabel('other', 'ja'), 'その他');
    });

    it('returns localized labels in English', () => {
      assert.strictEqual(getArtistGenreLabel('street', 'en'), 'Street & Circus');
      assert.strictEqual(getArtistGenreLabel('dance', 'en'), 'Dance & Physical');
      assert.strictEqual(getArtistGenreLabel('music', 'en'), 'Music & Live');
      assert.strictEqual(getArtistGenreLabel('theater', 'en'), 'Theater & Performance');
      assert.strictEqual(getArtistGenreLabel('traditional', 'en'), 'Traditional Arts');
      assert.strictEqual(getArtistGenreLabel('kamishibai', 'en'), 'Kamishibai & Story');
      assert.strictEqual(getArtistGenreLabel('exhibition', 'en'), 'Exhibition & Art');
      assert.strictEqual(getArtistGenreLabel('other', 'en'), 'Other');
    });

    it('falls back to "other" label for invalid or undefined genres', () => {
      assert.strictEqual(getArtistGenreLabel(undefined, 'ja'), 'その他');
      assert.strictEqual(getArtistGenreLabel(undefined, 'en'), 'Other');
      assert.strictEqual(getArtistGenreLabel('nonexistent', 'ja'), 'その他');
    });
  });

  describe('getPerformanceGenreText', () => {
    it('returns Performance.genre in Japanese without modifications', () => {
      const perf: Partial<Performance> = {
        genre: 'ジャズ／即興演奏',
        genreEn: 'Jazz / Improvisation',
      };
      assert.strictEqual(getPerformanceGenreText(perf, 'ja'), 'ジャズ／即興演奏');
    });

    it('returns Performance.genreEn in English, falling back to Performance.genre when genreEn is missing', () => {
      const withEn: Partial<Performance> = {
        genre: 'ジャズ／即興演奏',
        genreEn: 'Jazz / Improvisation',
      };
      assert.strictEqual(getPerformanceGenreText(withEn, 'en'), 'Jazz / Improvisation');

      const withoutEn: Partial<Performance> = {
        genre: '和太鼓アンサンブル',
      };
      assert.strictEqual(getPerformanceGenreText(withoutEn, 'en'), '和太鼓アンサンブル');
    });

    it('falls back to legacy genreCustom / genreCustomEn when present', () => {
      const legacy: Partial<Performance> = {
        genreCustom: 'コンテンポラリー演劇',
        genreCustomEn: 'Contemporary Theater',
      };
      assert.strictEqual(getPerformanceGenreText(legacy, 'ja'), 'コンテンポラリー演劇');
      assert.strictEqual(getPerformanceGenreText(legacy, 'en'), 'Contemporary Theater');
    });

    it('returns undefined when no performance genre is specified', () => {
      const empty: Partial<Performance> = {};
      assert.strictEqual(getPerformanceGenreText(empty, 'ja'), undefined);
      assert.strictEqual(getPerformanceGenreText(empty, 'en'), undefined);
    });
  });

  describe('microCMS normalization data contracts', () => {
    it('normalizes raw artist data and assigns valid ArtistGenre', () => {
      const raw = {
        id: 'artist-1',
        name: 'Test Artist',
        nameEn: 'Test Artist En',
        genre: 'MUSIC',
        profile: 'Artist profile',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      };
      const normalized = normalizeArtist(raw);
      assert.strictEqual(normalized.genre, 'music');
    });

    it('normalizes raw performance data preserving free-form genre and genreEn without whitelist filtering', () => {
      const raw = {
        id: 'perf-1',
        title: 'Jazz Night in Osaka',
        titleEn: 'Jazz Night in Osaka',
        genre: 'ジャズ／即興演奏',
        genreEn: 'Jazz / Improvisation',
        description: 'Live performance',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      };
      const normalized = normalizePerformance(raw);
      assert.strictEqual(normalized.genre, 'ジャズ／即興演奏');
      assert.strictEqual(normalized.genreEn, 'Jazz / Improvisation');
    });
  });
});
