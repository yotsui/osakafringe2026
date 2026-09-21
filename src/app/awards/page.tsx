import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getSiteInfo } from '@/lib/microcms';
import { isAwardsVisible } from '@/utils/awardsUtils';
import { createPageMetadata } from '@/lib/siteMetadata';
import AwardsClient from './AwardsClient';

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const siteInfo = await getSiteInfo().catch(() => null);
  if (!isAwardsVisible(siteInfo) || !siteInfo?.awardsInfo) {
    return {};
  }

  const title = siteInfo.awardsInfo.title || 'OSAKA FRINGE AWARDS 2026';
  const description =
    siteInfo.awardsInfo.summary ||
    siteInfo.awardsInfo.tagline ||
    undefined;

  return createPageMetadata({
    title,
    description,
    path: '/awards',
  });
}

export default async function AwardsPage() {
  const siteInfo = await getSiteInfo().catch(() => null);

  if (!isAwardsVisible(siteInfo) || !siteInfo?.awardsInfo) {
    notFound();
  }

  return <AwardsClient siteInfo={siteInfo} />;
}
