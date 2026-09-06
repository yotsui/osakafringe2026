import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getVenues, getVenueById, getPerformances } from '@/lib/microcms';
import { SITE_NAME, DEFAULT_OG_IMAGE } from '@/lib/siteMetadata';
import VenueDetailClient from '@/components/venue/VenueDetailClient';

export const revalidate = 300;

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  const venues = await getVenues();
  return venues.map((v) => ({
    id: v.id,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const venue = await getVenueById(id);

  if (!venue) {
    return {
      title: '会場が見つかりません',
      robots: { index: false, follow: false },
    };
  }

  const title = `${venue.name} | 会場`;
  const fullTitle = `${title} | ${SITE_NAME}`;
  const rawDesc = venue.description 
    ? `${venue.name} (${venue.area}) - ${venue.address}。${venue.description}`
    : `${venue.name} (${venue.area}) - ${venue.address}。大阪文化万博Osaka Fringe 2026 会場情報`;
  const description = rawDesc.replace(/\r?\n/g, ' ').slice(0, 160);

  const ogImage = venue.image || venue.images?.[0] || DEFAULT_OG_IMAGE;
  const canonicalUrl = `/venues/${id}`;

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

export default async function VenueDetailPage({ params }: Props) {
  const { id } = await params;
  const [venue, allPerformances] = await Promise.all([
    getVenueById(id),
    getPerformances(),
  ]);

  if (!venue) {
    notFound();
  }

  const venuePerformances = allPerformances.filter(
    (p) =>
      p.venueId === id ||
      p.venue?.id === id ||
      (p.schedules && p.schedules.some((s) => s.venueId === id || s.venue?.id === id))
  );

  return (
    <VenueDetailClient
      venue={venue}
      performances={venuePerformances}
    />
  );
}
