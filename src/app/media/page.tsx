import React from 'react';
import type { Metadata } from 'next';
import { createPageMetadata } from '@/lib/siteMetadata';
import MediaClient from './MediaClient';

export const metadata: Metadata = createPageMetadata({
  title: 'メディア・取材',
  description: '大阪文化万博Osaka Fringe 2026 の取材・メディア掲載に関するご案内。会場別の取材手順やお問い合わせについて。',
  path: '/media',
});

export default function MediaPage() {
  return <MediaClient />;
}
