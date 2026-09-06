import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { getArtists, getPerformances, getVenues } from '@/lib/microcms';
import { createPageMetadata } from '@/lib/siteMetadata';
import ArtistsClient from './ArtistsClient';

export const metadata: Metadata = createPageMetadata({
  title: 'アーティスト・劇団一覧',
  description: '大阪文化万博Osaka Fringe 2026 に参加する全アーティスト・劇団情報と公演一覧。',
  path: '/artists',
});

export const revalidate = 300;

export default async function ArtistsPage() {
  const [artists, performances, venues] = await Promise.all([
    getArtists(),
    getPerformances(),
    getVenues(),
  ]);

  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-400 font-bold">Loading artists...</div>}>
      <ArtistsClient artists={artists} performances={performances} venues={venues} />
    </Suspense>
  );
}