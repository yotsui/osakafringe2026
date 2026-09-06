import React from 'react';
import { getSiteInfo } from '@/lib/microcms';
import DonateClient from './DonateClient';

export const metadata = {
  title: '応援・サポーター募集 | 大阪文化万博 Osaka Fringe 2026',
  description: '大阪文化万博 Osaka Fringe 2026 を支える寄付・協賛・サポーターのご案内。',
};

export default async function DonatePage() {
  const siteInfo = await getSiteInfo();
  return <DonateClient siteInfo={siteInfo} />;
}