'use client';

import React from 'react';
import Link from 'next/link';

interface BrandLogoProps {
  variant?: 'main-date' | 'horizontal' | 'stacked';
  className?: string;
  linkToHome?: boolean;
}

export default function BrandLogo({
  variant = 'main-date',
  className = '',
  linkToHome = true,
}: BrandLogoProps) {
  const renderSvg = () => {
    switch (variant) {
      case 'horizontal':
        return (
          <svg
            viewBox="0 0 460 70"
            className="w-full h-auto drop-shadow-xs"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <text
              x="4"
              y="50"
              fontFamily="system-ui, -apple-system, 'Noto Sans JP', 'Hiragino Kaku Gothic ProN', sans-serif"
              fontSize="38"
              fontWeight="900"
              letterSpacing="2"
              fill="#e4007f"
            >
              大阪文化万博
            </text>
            <rect x="250" y="16" width="3.5" height="42" rx="1.75" fill="#e4007f" />
            <g transform="translate(268, 8)">
              <text
                x="8"
                y="18"
                fontFamily="system-ui, -apple-system, 'Quicksand', 'Arial Rounded MT Bold', sans-serif"
                fontSize="15"
                fontWeight="700"
                letterSpacing="1.5"
                fill="#e4007f"
              >
                osaka
              </text>
              <text
                x="4"
                y="48"
                fontFamily="system-ui, -apple-system, 'Quicksand', 'Arial Rounded MT Bold', sans-serif"
                fontSize="38"
                fontWeight="900"
                letterSpacing="-0.5"
                fill="#e4007f"
              >
                fringe
              </text>
            </g>
          </svg>
        );

      case 'stacked':
        return (
          <svg
            viewBox="0 0 340 180"
            className="w-full h-auto drop-shadow-xs"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <text
              x="170"
              y="32"
              textAnchor="middle"
              fontFamily="system-ui, -apple-system, 'Inter', 'Segoe UI', sans-serif"
              fontSize="18"
              fontWeight="900"
              letterSpacing="2.5"
              fill="#e4007f"
            >
              OCT8– NOV8,2026
            </text>
            <text
              x="170"
              y="90"
              textAnchor="middle"
              fontFamily="system-ui, -apple-system, 'Noto Sans JP', 'Hiragino Kaku Gothic ProN', sans-serif"
              fontSize="44"
              fontWeight="900"
              letterSpacing="3"
              fill="#e4007f"
            >
              大阪文化万博
            </text>
            <rect x="50" y="108" width="240" height="2" rx="1" fill="#e4007f" opacity="0.4" />
            <g transform="translate(100, 120)">
              <text
                x="14"
                y="16"
                fontFamily="system-ui, -apple-system, 'Quicksand', 'Arial Rounded MT Bold', sans-serif"
                fontSize="14"
                fontWeight="700"
                letterSpacing="1.5"
                fill="#e4007f"
              >
                osaka
              </text>
              <text
                x="8"
                y="44"
                fontFamily="system-ui, -apple-system, 'Quicksand', 'Arial Rounded MT Bold', sans-serif"
                fontSize="34"
                fontWeight="900"
                letterSpacing="-0.5"
                fill="#e4007f"
              >
                fringe
              </text>
            </g>
          </svg>
        );

      case 'main-date':
      default:
        return (
          <svg
            viewBox="0 0 480 96"
            className="w-full h-auto drop-shadow-xs"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Top Left Date */}
            <text
              x="6"
              y="24"
              fontFamily="system-ui, -apple-system, 'Inter', 'Segoe UI', sans-serif"
              fontSize="16"
              fontWeight="900"
              letterSpacing="2"
              fill="#e4007f"
            >
              OCT8– NOV8,2026
            </text>

            {/* Main Japanese Title */}
            <text
              x="6"
              y="74"
              fontFamily="system-ui, -apple-system, 'Noto Sans JP', 'Hiragino Kaku Gothic ProN', sans-serif"
              fontSize="38"
              fontWeight="900"
              letterSpacing="2"
              fill="#e4007f"
            >
              大阪文化万博
            </text>

            {/* Divider Bar */}
            <rect x="256" y="38" width="3.5" height="42" rx="1.75" fill="#e4007f" />

            {/* Right English Group */}
            <g transform="translate(272, 30)">
              <text
                x="8"
                y="18"
                fontFamily="system-ui, -apple-system, 'Quicksand', 'Arial Rounded MT Bold', sans-serif"
                fontSize="15"
                fontWeight="700"
                letterSpacing="1.5"
                fill="#e4007f"
              >
                osaka
              </text>
              <text
                x="4"
                y="48"
                fontFamily="system-ui, -apple-system, 'Quicksand', 'Arial Rounded MT Bold', sans-serif"
                fontSize="38"
                fontWeight="900"
                letterSpacing="-0.5"
                fill="#e4007f"
              >
                fringe
              </text>
            </g>
          </svg>
        );
    }
  };

  const content = (
    <div className={`inline-flex items-center select-none ${className}`}>
      {renderSvg()}
    </div>
  );

  if (linkToHome) {
    return (
      <Link href="/" className="inline-flex items-center focus:outline-hidden hover:opacity-95 transition-opacity">
        {content}
      </Link>
    );
  }

  return content;
}