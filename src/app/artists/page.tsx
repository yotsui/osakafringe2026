import React from 'react';
import { getPerformances, getVenues } from '@/lib/microcms';
import ArtistsClient from './ArtistsClient';

export const metadata = {
  title: 'アーティスト・公演一覧 | OSAKA FRINGE FESTIVAL 2026',
  description: '大阪フリンジフェスティバルに参加する全アーティストと公演情報の一覧。',
};

export default async function ArtistsPage() {
  const [performances, venues] = await Promise.all([
    getPerformances(),
    getVenues(),
  ]);

  return <ArtistsClient performances={performances} venues={venues} />;
}