import React from 'react';
import { getAwards } from '@/lib/microcms';
import AwardsClient from './AwardsClient';

export const metadata = {
  title: 'Award (アワード情報) | OSAKA FRINGE FESTIVAL 2026',
  description: '大阪フリンジフェスティバルのアワード（最優秀作品賞、観客賞など）と歴代受賞者について。',
};

export default async function AwardsPage() {
  const awards = await getAwards();
  return <AwardsClient awards={awards} />;
}