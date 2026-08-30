'use client';

import React, { useState } from 'react';
import Image, { ImageProps } from 'next/image';
import { 
  Sparkles, 
  Flame, 
  Music, 
  Palette, 
  BookOpen, 
  Theater, 
  Landmark, 
  Building2,
  ImageOff
} from 'lucide-react';
import { PerformanceGenre } from '@/types';

interface SafeImageProps extends Omit<ImageProps, 'src'> {
  src?: string | null;
  fallbackGenre?: PerformanceGenre | string;
  fallbackType?: 'performance' | 'venue' | 'banner' | 'generic';
  fallbackText?: string;
}

const GENRE_STYLES: Record<string, { bg: string; icon: React.ComponentType<{ className?: string }> }> = {
  theater: {
    bg: 'from-pink-600 via-rose-500 to-purple-700',
    icon: Theater,
  },
  street: {
    bg: 'from-amber-500 via-orange-500 to-pink-600',
    icon: Flame,
  },
  dance: {
    bg: 'from-pink-500 via-fuchsia-600 to-indigo-600',
    icon: Sparkles,
  },
  music: {
    bg: 'from-violet-600 via-purple-600 to-pink-600',
    icon: Music,
  },
  traditional: {
    bg: 'from-amber-600 via-rose-700 to-slate-900',
    icon: Landmark,
  },
  kamishibai: {
    bg: 'from-emerald-600 via-teal-600 to-cyan-700',
    icon: BookOpen,
  },
  exhibition: {
    bg: 'from-blue-600 via-cyan-600 to-teal-500',
    icon: Palette,
  },
  venue: {
    bg: 'from-slate-800 via-pink-900 to-slate-900',
    icon: Building2,
  },
};

export default function SafeImage({
  src,
  alt,
  fallbackGenre,
  fallbackType = 'generic',
  fallbackText,
  className = '',
  fill,
  width,
  height,
  ...rest
}: SafeImageProps) {
  const [hasError, setHasError] = useState(false);

  // If no source or error occurred, render styled modern fallback
  if (!src || hasError || src.trim() === '') {
    const genreKey = fallbackGenre || (fallbackType === 'venue' ? 'venue' : 'theater');
    const style = GENRE_STYLES[genreKey] || {
      bg: 'from-pink-600 via-fuchsia-600 to-purple-800',
      icon: Sparkles,
    };
    const IconComponent = style.icon;

    return (
      <div
        className={`relative w-full h-full flex flex-col items-center justify-center bg-gradient-to-br ${style.bg} text-white select-none overflow-hidden ${className}`}
        style={!fill && width && height ? { width, height } : { minHeight: '100%', minWidth: '100%' }}
      >
        {/* Decorative Background Circles */}
        <div className="absolute -top-12 -left-12 w-32 h-32 rounded-full bg-white/10 blur-xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-40 h-40 rounded-full bg-pink-500/20 blur-2xl pointer-events-none" />

        {/* Center Icon & Badge */}
        <div className="relative z-10 flex flex-col items-center gap-2 p-4 text-center">
          <div className="p-3 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 shadow-lg">
            <IconComponent className="w-8 h-8 text-white drop-shadow-sm" />
          </div>
          {fallbackText && (
            <span className="text-[11px] font-black tracking-wider text-pink-100 uppercase drop-shadow-xs max-w-[85%] truncate">
              {fallbackText}
            </span>
          )}
          <span className="text-[9px] font-black tracking-widest text-white/70 uppercase">
            OSAKA FRINGE 2026
          </span>
        </div>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt || 'Osaka Fringe Festival'}
      fill={fill}
      width={width}
      height={height}
      className={className}
      onError={() => setHasError(true)}
      {...rest}
    />
  );
}