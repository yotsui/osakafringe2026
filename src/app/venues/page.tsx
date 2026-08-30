import React from 'react';
import { getVenues, getPerformances } from '@/lib/microcms';
import VenuesClient from './VenuesClient';

export const metadata = {
  title: '会場一覧 & マップ | OSAKA FRINGE FESTIVAL 2026',
  description: '大阪フリンジフェスティバルの全会場情報。住所、アクセス、Google Maps経路案内、各会場の公演一覧。',
};

export default async function VenuesPage() {
  const [venues, performances] = await Promise.all([
    getVenues(),
    getPerformances(),
  ]);

  return <VenuesClient venues={venues} performances={performances} />;
}