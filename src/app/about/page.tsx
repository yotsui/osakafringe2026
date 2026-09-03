import React from 'react';
import { getSiteInfo, getPartners } from '@/lib/microcms';
import AboutClient from './AboutClient';

export const metadata = {
  title: 'Osaka Fringeについて | OSAKA FRINGE FESTIVAL 2026',
  description: '大阪フリンジフェスティバルの理念、フリンジの歴史、フェスティバルの楽しみ方について。',
};

export default async function AboutPage() {
  const [siteInfo, partners] = await Promise.all([
    getSiteInfo(),
    getPartners(),
  ]);

  return <AboutClient siteInfo={siteInfo} partners={partners} />;
}