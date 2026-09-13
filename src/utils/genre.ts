import type { ArtistGenre } from '../types/index.ts';

export const VALID_ARTIST_GENRES: readonly ArtistGenre[] = [
  'street',
  'dance',
  'music',
  'theater',
  'traditional',
  'kamishibai',
  'exhibition',
  'other',
] as const;

export const ARTIST_GENRE_LABELS: Record<ArtistGenre, { ja: string; en: string }> = {
  street: { ja: '大道芸・サーカス', en: 'Street & Circus' },
  dance: { ja: 'ダンス・舞踊', en: 'Dance & Physical' },
  music: { ja: '音楽・ライブ', en: 'Music & Live' },
  theater: { ja: '演劇・パフォーマンス', en: 'Theater & Performance' },
  traditional: { ja: '伝統芸能・古典', en: 'Traditional Arts' },
  kamishibai: { ja: '紙芝居・語り', en: 'Kamishibai & Story' },
  exhibition: { ja: '展示・アート', en: 'Exhibition & Art' },
  other: { ja: 'その他', en: 'Other' },
};

/**
 * microCMSのArtist.genre（文字列・配列・大文字小文字・前後空白など）を規定の8ジャンルに正規化
 * 規定8ジャンル以外または未登録の場合は 'other' を返す
 */
export function normalizeArtistGenre(genre: unknown): ArtistGenre {
  if (!genre) return 'other';

  let raw = genre;
  if (Array.isArray(raw)) {
    raw = raw.length > 0 ? raw[0] : '';
  }

  if (typeof raw !== 'string') return 'other';

  const cleaned = raw.trim().toLowerCase();
  if (VALID_ARTIST_GENRES.includes(cleaned as ArtistGenre)) {
    return cleaned as ArtistGenre;
  }

  return 'other';
}

/**
 * Artist.genreの翻訳済み表示名を取得
 */
export function getArtistGenreLabel(genre: unknown, lang: 'ja' | 'en' = 'ja'): string {
  const normalized = normalizeArtistGenre(genre);
  const labels = ARTIST_GENRE_LABELS[normalized] || ARTIST_GENRE_LABELS.other;
  return lang === 'en' ? labels.en : labels.ja;
}

/**
 * Performanceの作品ジャンルテキストを取得
 * - 日本語: Performance.genre（未設定時は genreCustom）
 * - 英語: Performance.genreEn（未設定時は genreCustomEn -> Performance.genre -> genreCustom）
 * - 作品ジャンルが未登録の場合は undefined を返す
 */
export function getPerformanceGenreText(
  perf: { genre?: string; genreEn?: string; genreCustom?: string; genreCustomEn?: string } | null | undefined,
  lang: 'ja' | 'en' = 'ja'
): string | undefined {
  if (!perf) return undefined;

  const rawGenre = typeof perf.genre === 'string' && perf.genre.trim() ? perf.genre.trim() : undefined;
  const rawGenreEn = typeof perf.genreEn === 'string' && perf.genreEn.trim() ? perf.genreEn.trim() : undefined;
  const rawCustom = typeof perf.genreCustom === 'string' && perf.genreCustom.trim() ? perf.genreCustom.trim() : undefined;
  const rawCustomEn = typeof perf.genreCustomEn === 'string' && perf.genreCustomEn.trim() ? perf.genreCustomEn.trim() : undefined;

  if (lang === 'en') {
    return rawGenreEn || rawCustomEn || rawGenre || rawCustom || undefined;
  }

  return rawGenre || rawCustom || rawGenreEn || rawCustomEn || undefined;
}
