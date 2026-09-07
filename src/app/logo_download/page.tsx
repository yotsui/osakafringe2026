import { Metadata } from 'next';
import LogoDownloadClient from './LogoDownloadClient';

export const metadata: Metadata = {
  title: 'ロゴ・ブランド素材ダウンロード | 大阪文化万博Osaka Fringe 2026',
  description:
    '大阪文化万博・Osaka Fringeの公式ロゴデータ（PNG・PDF）および使用ガイドラインを配布しています。広報・告知・公演チラシ等にご利用いただけます。',
  alternates: {
    canonical: 'https://osakafringe.com/logo_download',
  },
  openGraph: {
    title: 'ロゴ・ブランド素材ダウンロード | 大阪文化万博Osaka Fringe 2026',
    description:
      '大阪文化万博・Osaka Fringeの公式ロゴデータ（PNG・PDF）および使用ガイドラインを配布しています。',
    url: 'https://osakafringe.com/logo_download',
    siteName: '大阪文化万博Osaka Fringe 2026',
    images: [
      {
        url: '/ogp.jpg',
        width: 1200,
        height: 630,
        alt: '大阪文化万博Osaka Fringe 2026 ロゴ・ブランド素材',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ロゴ・ブランド素材ダウンロード | 大阪文化万博Osaka Fringe 2026',
    description:
      '大阪文化万博・Osaka Fringeの公式ロゴデータ（PNG・PDF）および使用ガイドラインを配布しています。',
    images: ['/ogp.jpg'],
  },
};

export default function LogoDownloadPage() {
  return <LogoDownloadClient />;
}
