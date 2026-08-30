'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface BrandLogoProps {
  variant?: 'main-date' | 'horizontal' | 'stacked';
  className?: string;
  linkToHome?: boolean;
  priority?: boolean;
}

export default function BrandLogo({
  variant = 'main-date',
  className = '',
  linkToHome = true,
  priority = true,
}: BrandLogoProps) {
  let src = '/images/logo_date_main.svg';
  let alt = 'OCT8 - NOV8, 2026 大阪文化万博 | osaka fringe';
  let aspectRatio = 'aspect-5/1';

  if (variant === 'horizontal') {
    src = '/images/logo_horizontal.svg';
    alt = '大阪文化万博 | osaka fringe';
    aspectRatio = 'aspect-5/1';
  } else if (variant === 'stacked') {
    src = '/images/logo_date_main.svg';
    alt = 'OSAKA FRINGE 2026';
    aspectRatio = 'aspect-5/1';
  }

  const content = (
    <div className={`relative w-full ${aspectRatio} flex items-center ${className}`}>
      {/* Official Vector SVG Graphic */}
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 640px) 240px, 300px"
        priority={priority}
        className="object-contain object-left select-none drop-shadow-xs"
      />
    </div>
  );

  if (linkToHome) {
    return (
      <Link 
        href="/" 
        className="block focus:outline-hidden hover:opacity-95 transition-opacity duration-200"
        aria-label={alt}
      >
        {content}
      </Link>
    );
  }

  return content;
}