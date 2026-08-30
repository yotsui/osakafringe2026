'use client';

import React from 'react';
import { SiteInfo, Banner } from '@/types';
import { useLanguage } from '@/context/LanguageContext';
import BannerSection from '@/components/common/BannerSection';
import { Sparkles, Globe, Heart, Compass } from 'lucide-react';

interface AboutClientProps {
  siteInfo: SiteInfo;
  banners: Banner[];
}

export default function AboutClient({ siteInfo, banners }: AboutClientProps) {
  const { t, getText } = useLanguage();

  const title = getText(siteInfo.aboutTitle, siteInfo.aboutTitleEn);
  const text = getText(siteInfo.aboutText, siteInfo.aboutTextEn);
  const period = getText(siteInfo.festivalPeriod, siteInfo.festivalPeriodEn);

  return (
    <div className="space-y-16 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-950 border border-pink-600/40 text-pink-300 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t('aboutPageBadge')}</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white">{title}</h1>
          <p className="text-sm sm:text-base text-purple-300 font-semibold">{period}</p>
        </div>

        {/* Main Body */}
        <div className="bg-slate-900 border border-purple-900/40 rounded-3xl p-6 sm:p-10 space-y-8 text-slate-200 shadow-2xl leading-relaxed">
          <div className="prose prose-invert max-w-none text-sm sm:text-base whitespace-pre-line space-y-4">
            {text}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-purple-900/40 text-left">
            <div className="p-4 bg-slate-950 rounded-2xl border border-purple-800/30 space-y-2">
              <Globe className="w-6 h-6 text-pink-400" />
              <h3 className="font-bold text-white text-sm">{t('feature1Title')}</h3>
              <p className="text-xs text-slate-400">{t('feature1Desc')}</p>
            </div>
            <div className="p-4 bg-slate-950 rounded-2xl border border-purple-800/30 space-y-2">
              <Compass className="w-6 h-6 text-purple-400" />
              <h3 className="font-bold text-white text-sm">{t('feature2Title')}</h3>
              <p className="text-xs text-slate-400">{t('feature2Desc')}</p>
            </div>
            <div className="p-4 bg-slate-950 rounded-2xl border border-purple-800/30 space-y-2">
              <Heart className="w-6 h-6 text-amber-400" />
              <h3 className="font-bold text-white text-sm">{t('feature3Title')}</h3>
              <p className="text-xs text-slate-400">{t('feature3Desc')}</p>
            </div>
          </div>
        </div>
      </div>

      <BannerSection banners={banners} />
    </div>
  );
}