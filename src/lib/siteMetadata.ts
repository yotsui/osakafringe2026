import type { Metadata } from 'next';

export const SITE_NAME = '大阪文化万博Osaka Fringe 2026';
export const SITE_NAME_EN = 'Osaka Fringe 2026';
export const SITE_BASE_URL = 'https://osakafringe.com';
export const DEFAULT_OG_IMAGE = '/ogp.jpg';

export const DEFAULT_DESCRIPTION =
  'Osaka Fringe 2026は11月8日に終了しました。フリンジアワード2026と、2027年10月15日〜11月15日の次回開催・参加スケジュールをご案内します。2026年の公演・アーティスト・会場もご覧いただけます。';

export interface PageMetadataOptions {
  title?: string;
  description?: string;
  path: string;
  image?: string;
}

export function createPageMetadata({
  title,
  description = DEFAULT_DESCRIPTION,
  path,
  image = DEFAULT_OG_IMAGE,
}: PageMetadataOptions): Metadata {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
  const canonicalPath = path.startsWith('/') ? path : `/${path}`;

  return {
    title: title ? title : undefined,
    description,
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      title: fullTitle,
      description,
      url: canonicalPath,
      siteName: SITE_NAME,
      locale: 'ja_JP',
      type: 'website',
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: fullTitle,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [image],
    },
  };
}
