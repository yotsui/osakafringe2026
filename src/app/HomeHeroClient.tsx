'use client';

import React from 'react';
import Link from 'next/link';
import { SiteInfo } from '@/types';
import { useLanguage } from '@/context/LanguageContext';
import { Sparkles, Search, Calendar, MapPin, ArrowRight } from 'lucide-react';

interface HomeHeroClientProps {
  siteInfo: SiteInfo;
}

export default function HomeHeroClient({ siteInfo }: HomeHeroClientProps) {
  const { getText, t } = useLanguage();

  const period = getText(siteInfo.festivalPeriod, siteInfo.festivalPeriodEn);

  return (
    <section className="relative min-h-[550px] sm:min-h-[620px] flex items-center justify-center overflow-hidden border-b border-purple-900/40">
      {/* Background Graphic Effects */}
      <div className="absolute inset-0 bg-slate-950">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-pink-600/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -right-40 w-96 h-96 bg-purple-600/25 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 left-1/3 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl" />
        <div
          className="absolute inset-0 opacity-20 bg-[radial-gradient(#8b5cf6_1px,transparent_1px)]"
          style={{ backgroundSize: '32px 32px' }}
        />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center space-y-8">
        {/* Festival Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-pink-950/80 to-purple-950/80 border border-pink-500/40 shadow-lg shadow-pink-500/10 backdrop-blur-md">
          <Sparkles className="w-4 h-4 text-pink-400 animate-spin" style={{ animationDuration: '6s' }} />
          <span className="text-xs sm:text-sm font-extrabold tracking-widest text-pink-300 uppercase">
            OSAKA FRINGE FESTIVAL 2026
          </span>
        </div>

        {/* Hero Title */}
        <div className="space-y-4">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-none">
            大阪の街が、<br />
            <span className="bg-gradient-to-r from-pink-500 via-purple-400 to-amber-300 bg-clip-text text-transparent">
              舞台になる3日間。
            </span>
          </h1>
          <p className="text-base sm:text-xl font-medium text-slate-300 max-w-2xl mx-auto leading-relaxed">
            {t('heroSubtitle')}
          </p>
        </div>

        {/* Date & Location Pill */}
        <div className="inline-flex flex-wrap items-center justify-center gap-4 bg-slate-900/90 border border-purple-800/50 rounded-2xl p-3 px-6 shadow-xl backdrop-blur-md text-xs sm:text-sm">
          <div className="flex items-center gap-2 text-pink-400 font-bold">
            <Calendar className="w-4 h-4" />
            <span>{period}</span>
          </div>
          <div className="hidden sm:block w-1.5 h-1.5 rounded-full bg-purple-500" />
          <div className="flex items-center gap-2 text-purple-300 font-bold">
            <MapPin className="w-4 h-4" />
            <span>大阪市内各所（中崎町・心斎橋・中之島・天王寺）</span>
          </div>
        </div>

        {/* Action CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href="/audience"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-pink-600 via-purple-600 to-pink-600 hover:opacity-95 text-white font-extrabold text-base shadow-2xl shadow-pink-600/30 flex items-center justify-center gap-2.5 transition-all hover:scale-105"
          >
            <Search className="w-5 h-5" />
            <span>{t('heroOpenAudience')}</span>
          </Link>

          <Link
            href="/venues"
            className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-purple-700/60 text-slate-200 font-bold text-base flex items-center justify-center gap-2 transition-all hover:text-white"
          >
            <MapPin className="w-5 h-5 text-purple-400" />
            <span>会場マップ・一覧</span>
          </Link>
        </div>
      </div>
    </section>
  );
}