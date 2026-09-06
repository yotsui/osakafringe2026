'use client';

import React from 'react';
import { SiteInfo, Partner } from '@/types';
import { useLanguage } from '@/context/LanguageContext';
import PartnerSection from '@/components/common/PartnerSection';
import BrandLogo from '@/components/common/BrandLogo';

interface AboutClientProps {
  siteInfo: SiteInfo;
  partners?: Partner[];
}

export default function AboutClient({ siteInfo, partners = [] }: AboutClientProps) {
  const { t, getText } = useLanguage();

  const aboutTitle = getText(siteInfo.aboutTitle, siteInfo.aboutTitleEn);
  const aboutText = getText(siteInfo.aboutText, siteInfo.aboutTextEn);
  const tagline = getText(siteInfo.heroTagline, siteInfo.heroTaglineEn);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Header */}
      <div className="border-l-4 border-[#E6007E] pl-4 sm:pl-6 space-y-2">
        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
          大阪文化万博 Osaka Fringe 2026
        </h1>
        <p className="text-sm sm:text-base font-bold text-[#E6007E]">
          spill over 文化芸術が街にあふれだす
        </p>
      </div>

      {/* Main Philosophy Card */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#E6007E] via-[#d60075] to-[#7928ca] p-8 sm:p-12 text-white shadow-xl shadow-pink-500/15 space-y-6">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1 space-y-4">
            <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-black uppercase tracking-wider">
              PHILOSOPHY
            </span>
            <h2 className="text-2xl sm:text-4xl font-black leading-tight">
              {aboutTitle || '大阪の街じゅうが、舞台になる。'}
            </h2>
            <p className="text-sm sm:text-base text-pink-100 leading-relaxed whitespace-pre-line font-medium">
              {aboutText || '劇場だけでなく街中のあらゆる場所を舞台に。プロ・アマ問わずアーティストが自由に参加するオープンアクセス型芸術祭。2026年秋、大阪の街に多彩な文化芸術があふれだします。'}
            </p>
          </div>

          <div className="relative w-52 h-32 bg-white/10 rounded-3xl backdrop-blur-md p-5 flex items-center justify-center border border-white/20 flex-shrink-0">
            <BrandLogo variant="stacked" linkToHome={false} className="w-full h-auto drop-shadow-md brightness-0 invert" />
          </div>
        </div>
      </div>

      {/* 3 Core Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white border border-pink-100 rounded-3xl p-8 space-y-3 shadow-xs">
          <div className="text-[#E6007E] font-black text-xs uppercase tracking-widest">
            01 / OPEN ACCESS
          </div>
          <h3 className="text-lg font-black text-slate-900">{t('feature1Title')}</h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
            {t('feature1Desc')}
          </p>
        </div>

        <div className="bg-white border border-rose-100 rounded-3xl p-8 space-y-3 shadow-xs">
          <div className="text-rose-600 font-black text-xs uppercase tracking-widest">
            02 / THE CITY IS THE STAGE
          </div>
          <h3 className="text-lg font-black text-slate-900">{t('feature2Title')}</h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
            {t('feature2Desc')}
          </p>
        </div>

        <div className="bg-white border border-purple-100 rounded-3xl p-8 space-y-3 shadow-xs">
          <div className="text-purple-600 font-black text-xs uppercase tracking-widest">
            03 / OSAKA MEETS THE WORLD
          </div>
          <h3 className="text-lg font-black text-slate-900">{t('feature3Title')}</h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
            {t('feature3Desc')}
          </p>
        </div>
      </div>

      {/* Venue Types Section */}
      <div className="bg-slate-50 border border-pink-100 rounded-3xl p-8 sm:p-12 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-black text-slate-900">{t('aboutVenueTypesTitle')}</h2>
          <p className="text-xs sm:text-sm text-slate-600 font-medium">
            {t('aboutVenueTypesDesc')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 space-y-2">
            <span className="px-2.5 py-0.5 rounded-md bg-blue-100 text-blue-700 text-xs font-black">
              CORE
            </span>
            <h4 className="text-base font-black text-slate-900">{t('venueTypeCoreTitle')}</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              {t('venueTypeCoreDesc')}
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 space-y-2">
            <span className="px-2.5 py-0.5 rounded-md bg-amber-100 text-amber-800 text-xs font-black">
              HISTORICAL
            </span>
            <h4 className="text-base font-black text-slate-900">{t('venueTypeHistoricalTitle')}</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              {t('venueTypeHistoricalDesc')}
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 space-y-2">
            <span className="px-2.5 py-0.5 rounded-md bg-pink-100 text-pink-700 text-xs font-black">
              LOCAL
            </span>
            <h4 className="text-base font-black text-slate-900">{t('venueTypeLocalTitle')}</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              {t('venueTypeLocalDesc')}
            </p>
          </div>
        </div>
      </div>

      {/* Partners Section */}
      {partners && partners.length > 0 && (
        <div className="pt-4">
          <PartnerSection partners={partners} />
        </div>
      )}
    </div>
  );
}