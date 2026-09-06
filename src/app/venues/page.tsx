import React, { Suspense } from 'react';
import { getVenues, getPerformances } from '@/lib/microcms';
import VenuesClient from './VenuesClient';

export const metadata = {
  title: '会場一覧 & マップ | 大阪文化万博 Osaka Fringe 2026',
  description: '大阪文化万博 Osaka Fringe 2026 の全会場情報。住所、アクセス、Google Maps経路案内、各会場の公演一覧。',
};

export const revalidate = 300;

export default async function VenuesPage() {
  const [venues, performances] = await Promise.all([
    getVenues(),
    getPerformances(),
  ]);

  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-400 font-bold">Loading venues...</div>}>
      <VenuesClient venues={venues} performances={performances} />
    </Suspense>
  );
}