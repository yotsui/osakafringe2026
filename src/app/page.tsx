import React from 'react';
import { getPerformances, getVenues, getPartners, getSiteInfo } from '@/lib/microcms';
import HomeClient from './HomeClient';

export const revalidate = 60;

export default async function HomePage() {
  const [performances, venues, partners, siteInfo] = await Promise.all([
    getPerformances(),
    getVenues(),
    getPartners(),
    getSiteInfo(),
  ]);

  return (
    <HomeClient
      performances={performances}
      venues={venues}
      partners={partners}
      siteInfo={siteInfo}
    />
  );
}