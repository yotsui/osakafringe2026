import React from 'react';
import type { Metadata } from 'next';
import { getPerformances, getVenues, getPartners, getSiteInfo } from '@/lib/microcms';
import { createPageMetadata } from '@/lib/siteMetadata';
import HomeClient from './HomeClient';

export const metadata: Metadata = createPageMetadata({
  path: '/',
});

export const revalidate = 300;

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