import React from 'react';
import { getPerformances, getVenues } from '@/lib/microcms';
import AudienceApp from '@/components/audience/AudienceApp';

export const revalidate = 60;

export const metadata = {
  title: 'Audience App | OSAKA FRINGE FESTIVAL 2026',
  description: '大阪フリンジフェスティバル 観客向け公式アプリ。WHAT (ジャンル・キーワード) / WHERE (会場・エリア・マップ) / WHEN (日付・本日の公演) で簡単検索！',
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