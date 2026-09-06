import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: '大阪文化万博 Osaka Fringe 2026',
    short_name: 'Osaka Fringe 2026',
    description: '大阪文化万博 Osaka Fringe 2026（2026年10月8日〜11月8日）公式サイト＆公演ガイド',
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
