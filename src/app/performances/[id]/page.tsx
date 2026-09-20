import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPerformances, getPerformanceById } from '@/lib/microcms';
import { SITE_NAME, SITE_BASE_URL, DEFAULT_OG_IMAGE } from '@/lib/siteMetadata';
import PerformanceDetailClient from '@/components/performance/PerformanceDetailClient';
import { buildPerformanceJsonLd } from '@/utils/jsonLd';

export const revalidate = 300;

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  const performances = await getPerformances();
  return performances.map((p) => ({
    id: p.id,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const performance = await getPerformanceById(id);

  if (!performance) {
    return {
      title: '公演が見つかりません',
      robots: { index: false, follow: false },
    };
  }

  const artistName = performance.artist?.name || performance.artistName || '';
  const title = artistName 
    ? `${performance.title} (${artistName})` 
    : performance.title;
  const fullTitle = `${title} | ${SITE_NAME}`;

  const rawDesc = performance.description || `${performance.title} - 大阪文化万博Osaka Fringe 2026 公演詳細`;
  const description = rawDesc.replace(/\r?\n/g, ' ').slice(0, 160);

  // OGP Image Fallback Sequence:
  // 1. performance image -> 2. artist image -> 3. venue image -> 4. Osaka Fringe common image
  const ogImage =
    performance.images?.[0] ||
    performance.image ||
    performance.artist?.image ||
    performance.artist?.images?.[0] ||
    performance.venue?.image ||
    performance.venue?.images?.[0] ||
    DEFAULT_OG_IMAGE;

  const canonicalUrl = `/performances/${id}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: fullTitle,
      description,
      url: canonicalUrl,
      siteName: SITE_NAME,
      locale: 'ja_JP',
      type: 'website',
      images: [
        {
          url: ogImage,
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
      images: [ogImage],
    },
  };
}

export default async function PerformanceDetailPage({ params }: Props) {
  const { id } = await params;
  const performance = await getPerformanceById(id);

  if (!performance) {
    notFound();
  }

  const eventJsonLd = buildPerformanceJsonLd(performance, SITE_BASE_URL);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventJsonLd) }}
      />
      <PerformanceDetailClient performance={performance} />
    </>
  );
}
