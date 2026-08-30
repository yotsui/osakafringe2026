import React from 'react';
import { getSiteInfo } from '@/lib/microcms';
import DonateClient from './DonateClient';

export const metadata = {
  title: '寄付・サポーター募集 | OSAKA FRINGE FESTIVAL 2026',
  description: '大阪フリンジフェスティバルを支える寄付・協賛・サポーターのご案内。',
};

export default async function DonatePage() {
  const siteInfo = await getSiteInfo();
  return <DonateClient siteInfo={siteInfo} />;
}