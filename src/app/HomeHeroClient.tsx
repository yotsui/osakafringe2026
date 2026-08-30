'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { SiteInfo } from '@/types';
import { useLanguage } from '@/context/LanguageContext';
import BrandLogo from '@/components/common/BrandLogo';
import { Sparkles, MapPin, Calendar, ArrowRight, ExternalLink } from 'lucide-react';

interface HomeHeroClientProps {
  siteInfo: SiteInfo;
}

export default function HomeHeroClient({ siteInfo }: HomeHeroClientProps) {
  const { t, getText } = useLanguage();

  const tagline = getText(siteInfo.heroTagline, siteInfo.heroTaglineEn);
  const subtitle = getText(siteInfo.heroSubtitle, siteInfo.heroSubtitleEn);
  const period = getText(siteInfo.festivalPeriod, siteInfo.festivalPeriodEn);
  const location = getText(siteInfo.locationSummary, siteInfo.locationSummaryEn);

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-pink-50/60 via-white to-white py-14 sm:py-20 border-b border-pink-100">
      {/* Background Decorative Blobs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-br from-pink-200/40 via-purple-200/20 to-transparent blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center space-y-8 max-w-4xl mx-auto">
          
          {/* Main Logo Showcase (Date included vector SVG) */}
          <div className="w-full max-w-md sm:max-w-lg py-2 mb-2 flex justify-center">
            <BrandLogo variant="main-date" linkToHome={false} className="w-full h-auto drop-shadow-sm" />
          </div>

          {/* Tagline & Slogan */}
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-100/80 border border-pink-200 text-pink-700 text-xs sm:text-sm font-extrabold tracking-wide shadow-xs">
              <Sparkles className="w-4 h-4 text-pink-600 animate-spin" style={{ animationDuration: '6s' }} />
              <span>OSAKA FRINGE 2026 | SPILL OVER</span>
            </div>
            
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-tight">
              {tagline || '街の一角を、世界の舞台へ。'}
            </h1>
            
            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto font-medium leading-relaxed">
              {subtitle || '劇場だけでなく街中のあらゆる場所を舞台に。プロ・アマ問わずアーティストが自由に参加するオープンアクセス型芸術祭。'}
            </p>
          </div>

          {/* Festival Info Pills */}
          <div className="flex flex-wrap items-center justify-center gap-3 text-xs sm:text-sm font-bold text-slate-700">
            <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white border border-pink-200/80 shadow-xs">
              <Calendar className="w-4 h-4 text-pink-600" />
              <span>{period || '2026年10月8日(木) 〜 11月8日(日)'}</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white border border-pink-200/80 shadow-xs">
              <MapPin className="w-4 h-4 text-pink-600" />
              <span>{location || '大阪市内各所（CORE・HISTORICAL・LOCALベニュー）'}</span>
            </div>
          </div>

          {/* CTA Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full pt-2">
            <Link
              href="/audience"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-pink-600 via-rose-500 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-black text-sm sm:text-base tracking-wide shadow-lg shadow-pink-500/25 hover:shadow-pink-500/40 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 group cursor-pointer"
            >
              <Sparkles className="w-5 h-5 text-pink-200 group-hover:rotate-12 transition-transform" />
              <span>{t('heroOpenAudience')}</span>
              <ArrowRight className="w-4 h-4 text-pink-200 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/venues"
              className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-white hover:bg-pink-50/50 border-2 border-pink-200 text-pink-600 hover:text-pink-700 font-black text-sm sm:text-base tracking-wide shadow-xs hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <MapPin className="w-5 h-5 text-pink-600" />
              <span>{t('heroVenuesMap')}</span>
            </Link>
          </div>

        </div>
      </div>
    </section>
  );
}