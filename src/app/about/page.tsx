import type { Metadata } from 'next';
import { getSiteInfo, getPartners } from '@/lib/microcms';
import { createPageMetadata } from '@/lib/siteMetadata';
import AboutClient from './AboutClient';

export const metadata: Metadata = createPageMetadata({
  title: 'Osaka Fringeとは',
  description: '大阪文化万博Osaka Fringe 2026 の理念、3つの特徴、ベニューカテゴリ、フェスティバルの楽しみ方について。',
  path: '/about',
});

export default async function AboutPage() {
  const [siteInfo, partners] = await Promise.all([
    getSiteInfo(),
    getPartners(),
  ]);

  return <AboutClient siteInfo={siteInfo} partners={partners} />;
}