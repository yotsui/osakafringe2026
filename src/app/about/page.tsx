import React from 'react';
import { getSiteInfo, getPartners } from '@/lib/microcms';
import AboutClient from './AboutClient';

export const metadata = {
  title: 'Osaka Fringeとは | 大阪文化万博Osaka Fringe 2026',
  description: '大阪文化万博Osaka Fringe 2026 の理念、3つの特徴、ベニューカテゴリ、フェスティバルの楽しみ方について。',
};

export default async function AboutPage() {
  const [siteInfo, partners] = await Promise.all([
    getSiteInfo(),
    getPartners(),
  ]);

  return <AboutClient siteInfo={siteInfo} partners={partners} />;
}