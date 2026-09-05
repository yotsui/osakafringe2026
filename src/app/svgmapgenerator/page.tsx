import React from 'react';
import { getVenues } from '@/lib/microcms';
import SvgMapGeneratorClient from './SvgMapGeneratorClient';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'SVG Map Generator (Internal Tool) | OSAKA FRINGE FESTIVAL 2026',
  description: '印刷物・Adobe Illustrator編集用 レイヤー分けSVGマップ生成ツール（内部管理用ツール）。',
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
      'max-video-preview': -1,
      'max-image-preview': 'none',
      'max-snippet': -1,
    },
  },
};

export default async function SvgMapGeneratorPage() {
  const venues = await getVenues();

  return <SvgMapGeneratorClient initialVenues={venues} />;
}
