import React from 'react';
import { getVenues } from '@/lib/microcms';
import SvgMapGeneratorClient from './SvgMapGeneratorClient';

export const metadata = {
  title: 'SVG Map Generator | OSAKA FRINGE FESTIVAL 2026',
  description: '印刷物・Adobe Illustrator編集用 レイヤー分けSVGマップ生成ツール。緯度経度・用紙サイズ・範囲を指定して高精度ベクター地図を出力。',
};

export default async function SvgMapGeneratorPage() {
  const venues = await getVenues();

  return <SvgMapGeneratorClient initialVenues={venues} />;
}
