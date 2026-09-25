'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { User } from 'lucide-react';
import { Artist } from '@/types';

interface ArtistThumbnailProps {
  artist?: Artist | null;
  alt?: string;
  className?: string;
  sizeClassName?: string;
  sizes?: string;
}

/**
 * microCMS (imgix) や Unsplash などの CDN 画像 URL に最適化パラメータを付与
 */
function optimizeCdnImageUrl(url: string, quality: number = 75): string {
  if (!url) return url;
  try {
    if (url.includes('images.microcms-assets.io')) {
      const parsed = new URL(url);
      if (!parsed.searchParams.has('auto')) {
        parsed.searchParams.set('auto', 'format,compress');
      }
      if (!parsed.searchParams.has('q')) {
        parsed.searchParams.set('q', quality.toString());
      }
      return parsed.toString();
    }
    if (url.includes('unsplash.com')) {
      const parsed = new URL(url);
      if (!parsed.searchParams.has('auto')) {
        parsed.searchParams.set('auto', 'format');
      }
      if (!parsed.searchParams.has('q')) {
        parsed.searchParams.set('q', quality.toString());
      }
      return parsed.toString();
    }
  } catch {
    return url;
  }
  return url;
}

function resolveArtistImageUrl(artist?: Artist | null): string | null {
  if (!artist) return null;

  // 1. performance.artist.image
  if (typeof artist.image === 'string' && artist.image.trim() !== '') {
    return artist.image.trim();
  }

  // 2. performance.artist.images内の最初の有効な画像
  if (Array.isArray(artist.images) && artist.images.length > 0) {
    const firstValid = artist.images.find(
      (img) => typeof img === 'string' && img.trim() !== ''
    );
    if (firstValid) {
      return firstValid.trim();
    }
  }

  return null;
}

export default function ArtistThumbnail({
  artist,
  alt = '',
  className = '',
  sizeClassName = 'w-12 h-12 sm:w-14 sm:h-14',
  sizes = '(max-width: 640px) 48px, 64px',
}: ArtistThumbnailProps) {
  const [hasError, setHasError] = useState(false);
  const rawImageUrl = resolveArtistImageUrl(artist);

  if (!rawImageUrl || hasError) {
    return (
      <div
        className={`relative shrink-0 rounded-xl bg-slate-100 border border-slate-200/80 flex items-center justify-center text-slate-400 select-none overflow-hidden aspect-square ${sizeClassName} ${className}`}
        aria-hidden="true"
      >
        <User className="w-1/2 h-1/2 text-slate-400 stroke-[1.75]" />
      </div>
    );
  }

  const optimizedUrl = optimizeCdnImageUrl(rawImageUrl, 75);

  return (
    <div
      className={`relative shrink-0 rounded-xl overflow-hidden bg-slate-100 border border-slate-200/60 aspect-square ${sizeClassName} ${className}`}
    >
      <Image
        src={optimizedUrl}
        alt={alt}
        fill
        sizes={sizes}
        className="object-cover object-center"
        onError={() => setHasError(true)}
      />
    </div>
  );
}
