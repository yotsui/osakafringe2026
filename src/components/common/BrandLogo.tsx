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
  let src = '/images/osakafringe3.svg';
  let alt = 'OCT 8 - NOV 8, 2026 大阪文化万博 | osaka fringe';
  let aspectRatio = 'aspect-[322/64]';

  if (variant === 'horizontal') {
    src = '/images/osakafringe2.svg';
    alt = 'osaka fringe';
    aspectRatio = 'aspect-[385/78]';
  } else if (variant === 'stacked') {
    src = '/images/osakafringe.svg';
    alt = 'osaka fringe';
    aspectRatio = 'aspect-[215/110]';
  }

  const content = (
    <div className={`relative w-full ${aspectRatio} flex items-center ${className}`}>
      {/* Official Vector SVG Graphic */}
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 640px) 240px, 320px"
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