import React from 'react';
import { getArtists, getPerformances, getVenues } from '@/lib/microcms';
import ArtistsClient from './ArtistsClient';

export const metadata = {
  title: 'アーティスト・劇団一覧 | OSAKA FRINGE FESTIVAL 2026',
  description: '大阪フリンジフェスティバルに参加する全アーティスト・劇団情報と公演一覧。',
};

export const revalidate = 60;

export default async function ArtistsPage() {
  const [artists, performances, venues] = await Promise.all([
    getArtists(),
    getPerformances(),
    getVenues(),
  ]);

  return <ArtistsClient artists={artists} performances={performances} venues={venues} />;
}