'use client';

import React from 'react';
import { Banner } from '@/types';
import { useLanguage } from '@/context/LanguageContext';
import { ExternalLink, Compass, Camera } from 'lucide-react';

interface BannerSectionProps {
  banners: Banner[];
}

export default function BannerSection({ banners }: BannerSectionProps) {
  const { getText } = useLanguage();

  if (!banners || banners.length === 0) return null;

  return (
    <section className="py-12 bg-slate-950/60 border-t border-purple-900/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <p className="text-xs font-bold tracking-widest text-pink-400 uppercase">OFFICIAL PARTNERS & SOCIAL</p>
          <h2 className="text-xl font-bold text-white mt-1">公式バナー・関連リンク</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {banners.map((banner) => {
            const isInstagram = banner.type === 'instagram';
            const title = getText(banner.title, banner.titleEn);
            const desc = getText(banner.description, banner.descriptionEn);

            return (
              <a
                key={banner.id}
                href={banner.linkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 to-purple-950/70 border border-purple-800/40 p-6 flex flex-col sm:flex-row items-center gap-5 hover:border-pink-500/70 transition-all hover:shadow-xl hover:shadow-pink-500/10 hover:-translate-y-1"
              >
                {/* Visual Icon / Thumbnail */}
                <div className="w-16 h-16 rounded-2xl flex-shrink-0 flex items-center justify-center bg-slate-800/80 border border-purple-700/50 shadow-inner group-hover:scale-105 transition-transform">
                  {isInstagram ? (
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-600 flex items-center justify-center text-white">
                      <Camera className="w-7 h-7" />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white">
                      <Compass className="w-7 h-7" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs font-semibold text-pink-400 mb-1">
                    <span>{isInstagram ? 'Instagram Official' : 'Osaka Tourism Portal'}</span>
                    <ExternalLink className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <h3 className="text-base font-bold text-white group-hover:text-pink-300 transition-colors">
                    {title}
                  </h3>
                  {desc && <p className="text-xs text-slate-400 mt-1 leading-relaxed">{desc}</p>}
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}