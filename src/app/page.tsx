import React from 'react';
import { getPerformances, getVenues, getAwards, getPartners, getSiteInfo } from '@/lib/microcms';
import HomeClient from './HomeClient';

export const revalidate = 60;

export default async function HomePage() {
  const [performances, venues, awards, partners, siteInfo] = await Promise.all([
    getPerformances(),
    getVenues(),
    getAwards(),
    getPartners(),
    getSiteInfo(),
  ]);

  return (
    <HomeClient
      performances={performances}
      venues={venues}
      awards={awards}
      partners={partners}
      siteInfo={siteInfo}
    />
  );
}