import React from 'react';
import type { Metadata } from 'next';
import { getSiteInfo } from '@/lib/microcms';
import { createPageMetadata } from '@/lib/siteMetadata';
import DonateClient from './DonateClient';

export const metadata: Metadata = createPageMetadata({
  title: '寄付・応援',
  description: '次の表現者が大阪から育つ土壌をつくるために。大阪文化万博Osaka Fringe 2026への寄付・応援のご案内です。',
  path: '/donate',
});

export default async function DonatePage() {
  const siteInfo = await getSiteInfo();
  return <DonateClient siteInfo={siteInfo} />;
}