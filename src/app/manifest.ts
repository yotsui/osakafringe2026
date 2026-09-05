import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'OSAKA FRINGE FESTIVAL 2026 | 大阪フリンジフェスティバル',
    short_name: 'Osaka Fringe',
    description: '大阪フリンジフェスティバル 公式ウェブサイト＆Audience App',
    start_url: '/',
    display: 'standalone',
    background_color: '#0f172a',
    theme_color: '#E6007E',
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'maskable',
      },
    ],
  };
}
