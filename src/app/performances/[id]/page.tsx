import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPerformances, getPerformanceById } from '@/lib/microcms';
import { SITE_NAME, SITE_BASE_URL, DEFAULT_OG_IMAGE } from '@/lib/siteMetadata';
import PerformanceDetailClient from '@/components/performance/PerformanceDetailClient';

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

  // OGP Image for Schema.org Event
  const ogImage =
    performance.images?.[0] ||
    performance.image ||
    performance.artist?.image ||
    performance.artist?.images?.[0] ||
    performance.venue?.image ||
    performance.venue?.images?.[0] ||
    `${SITE_BASE_URL}${DEFAULT_OG_IMAGE}`;

  const absoluteImageUrl = ogImage.startsWith('http') ? ogImage : `${SITE_BASE_URL}${ogImage}`;

  // Start & End ISO dates from schedules
  const firstSchedule = performance.schedules?.[0];
  const lastSchedule = performance.schedules?.[performance.schedules.length - 1] || firstSchedule;

  const startDateIso = firstSchedule?.rawDate || (firstSchedule ? `${firstSchedule.date}T${firstSchedule.startTime || '10:00'}:00+09:00` : '2026-10-08T10:00:00+09:00');
  const endDateIso = lastSchedule?.rawEndDate || lastSchedule?.rawDate || (lastSchedule ? `${lastSchedule.endDate || lastSchedule.date}T${lastSchedule.endTime || '20:00'}:00+09:00` : '2026-11-08T20:00:00+09:00');

  const venueName = performance.venue?.name || performance.venueName || 'Osaka Fringe 2026 特設会場';
  const venueAddress = performance.venue?.address || '大阪市内各所';
  const venueArea = performance.venue?.area || 'Osaka';

  const artistName = performance.artist?.name || performance.artistName || 'Osaka Fringe 参加アーティスト';

  // Schema.org Event JSON-LD
  const eventJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: performance.title,
    alternateName: performance.titleEn || undefined,
    description: performance.description?.slice(0, 300) || undefined,
    image: [absoluteImageUrl],
    startDate: startDateIso,
    endDate: endDateIso,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: {
      '@type': 'Place',
      name: venueName,
      address: {
        '@type': 'PostalAddress',
        streetAddress: venueAddress,
        addressLocality: venueArea,
        addressCountry: 'JP',
      },
    },
    performer: {
      '@type': 'PerformingGroup',
      name: artistName,
    },
    offers: {
      '@type': 'Offer',
      url: performance.ticketUrl || `${SITE_BASE_URL}/performances/${performance.id}`,
      price: performance.ticketPrice?.match(/\d+/)?.[0] || '0',
      priceCurrency: 'JPY',
      availability: 'https://schema.org/InStock',
    },
    organizer: {
      '@type': 'Organization',
      name: '大阪文化万博Osaka Fringe 2026 実行委員会',
      url: SITE_BASE_URL,
    },
  };

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
