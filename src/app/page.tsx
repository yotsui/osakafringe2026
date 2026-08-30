import React from 'react';
import { getPerformances, getVenues, getAwards, getBanners, getSiteInfo } from '@/lib/microcms';
import HomeClient from './HomeClient';

export const revalidate = 60;

export default async function HomePage() {
  const [performances, venues, awards, banners, siteInfo] = await Promise.all([
    getPerformances(),
    getVenues(),
    getAwards(),
    getBanners(),
    getSiteInfo(),
  ]);

  return (
    <HomeClient
      performances={performances}
      venues={venues}
      awards={awards}
      banners={banners}
      siteInfo={siteInfo}
    />
  );
}