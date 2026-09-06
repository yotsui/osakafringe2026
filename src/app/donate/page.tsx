import React from 'react';
import { getSiteInfo } from '@/lib/microcms';
import DonateClient from './DonateClient';

export const metadata = {
  title: '寄付・応援 | 大阪文化万博Osaka Fringe 2026',
  description: '次の表現者が大阪から育つ土壌をつくるために。大阪文化万博Osaka Fringe 2026への寄付・応援のご案内です。',
};

export default async function DonatePage() {
  const siteInfo = await getSiteInfo();
  return <DonateClient siteInfo={siteInfo} />;
}