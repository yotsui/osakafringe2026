import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getArtists, getArtistById, getPerformances } from '@/lib/microcms';
import { SITE_NAME, DEFAULT_OG_IMAGE } from '@/lib/siteMetadata';
import ArtistDetailClient from '@/components/artist/ArtistDetailClient';

export const revalidate = 300;

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  const artists = await getArtists();
  return artists.map((a) => ({
    id: a.id,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const artist = await getArtistById(id);

  if (!artist) {
    return {
      title: 'アーティストが見つかりません',
      robots: { index: false, follow: false },
    };
  }

  const title = `${artist.name} | アーティスト`;
  const fullTitle = `${title} | ${SITE_NAME}`;
  const rawDesc = artist.profile || `${artist.name} - 大阪文化万博Osaka Fringe 2026 参加アーティスト`;
  const description = rawDesc.replace(/\r?\n/g, ' ').slice(0, 160);

  const ogImage = artist.image || artist.images?.[0] || DEFAULT_OG_IMAGE;
  const canonicalUrl = `/artists/${id}`;

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
      type: 'profile',
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

export default async function ArtistDetailPage({ params }: Props) {
  const { id } = await params;
  const [artist, allPerformances] = await Promise.all([
    getArtistById(id),
    getPerformances(),
  ]);

  if (!artist) {
    notFound();
  }

  const artistPerformances = allPerformances.filter(
    (p) =>
      p.artistId === id ||
      p.artist?.id === id ||
      p.artistName === artist.name ||
      (typeof p.artists === 'object' && p.artists?.id === id) ||
      p.artists === id
  );

  return (
    <ArtistDetailClient
      artist={artist}
      performances={artistPerformances}
    />
  );
}
