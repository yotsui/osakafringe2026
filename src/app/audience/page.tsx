import React from 'react';
import { getPerformances, getVenues } from '@/lib/microcms';
import AudienceApp from '@/components/audience/AudienceApp';

export const revalidate = 300;

export const metadata = {
  title: '公演を探す | 大阪文化万博Osaka Fringe 2026',
  description: '大阪文化万博Osaka Fringe 2026 公演ガイド。WHAT (何を見る？) / WHERE (どこで見る？) / WHEN (いつ見る？) で簡単検索！',
};

export default async function AudiencePage() {
  const [performances, venues] = await Promise.all([
    getPerformances(),
    getVenues(),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <AudienceApp initialPerformances={performances} venues={venues} />
    </div>
  );
}