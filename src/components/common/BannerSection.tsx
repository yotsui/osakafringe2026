'use client';

import React from 'react';
import { Banner } from '@/types';
import { useLanguage } from '@/context/LanguageContext';
import SafeImage from '@/components/common/SafeImage';
import { ExternalLink, Landmark } from 'lucide-react';
import { InstagramIcon } from './SnsIcons';

interface BannerSectionProps {
  banners: Banner[];
}

export default function BannerSection({ banners }: BannerSectionProps) {
  const { getText } = useLanguage();

  if (!banners || banners.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {banners.map((banner) => {
          const title = getText(banner.title, banner.titleEn);
          const desc = getText(banner.description, banner.descriptionEn);

          return (
            <a
              key={banner.id}
              href={banner.linkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative overflow-hidden rounded-3xl bg-white border border-pink-100 hover:border-pink-300 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col sm:flex-row items-center p-5 gap-5"
            >
              {/* Thumbnail */}
              <div className="relative w-full sm:w-36 h-28 flex-shrink-0 overflow-hidden rounded-2xl bg-slate-100">
                <SafeImage
                  src={banner.imageUrl}
                  alt={banner.alt || title}
                  fill
                  fallbackType="banner"
                  fallbackText={banner.type === 'instagram' ? 'Instagram' : 'Official Portal'}
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              {/* Text Info */}
              <div className="flex-1 space-y-2 text-left w-full">
                <div className="flex items-center gap-2">
                  {banner.type === 'instagram' ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-pink-50 text-pink-600 text-[11px] font-extrabold border border-pink-200">
                      <InstagramIcon className="w-3.5 h-3.5" />
                      <span>Official Instagram</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-extrabold border border-slate-200">
                      <Landmark className="w-3.5 h-3.5 text-pink-600" />
                      <span>Official Partner</span>
                    </span>
                  )}
                </div>

                <h3 className="text-sm font-black text-slate-900 group-hover:text-pink-600 transition-colors leading-snug line-clamp-1">
                  {title}
                </h3>

                <p className="text-xs text-slate-500 font-medium leading-relaxed line-clamp-2">
                  {desc}
                </p>
              </div>

              {/* Icon */}
              <div className="self-end sm:self-center p-2 rounded-xl bg-pink-50 group-hover:bg-pink-600 group-hover:text-white text-pink-600 transition-colors flex-shrink-0">
                <ExternalLink className="w-4 h-4" />
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}