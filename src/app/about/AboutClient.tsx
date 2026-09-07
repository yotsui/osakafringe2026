'use client';

import React from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { SiteInfo, Partner } from '@/types';
import { useLanguage } from '@/context/LanguageContext';
import PartnerSection from '@/components/common/PartnerSection';
import BrandLogo from '@/components/common/BrandLogo';

const WorldFringeMap = dynamic(
  () => import('@/components/about/WorldFringeMap'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[400px] sm:h-[480px] lg:h-[560px] rounded-3xl bg-slate-100 animate-pulse flex items-center justify-center text-slate-400 font-bold text-sm border border-slate-200">
        Loading World Fringe Map...
      </div>
    ),
  }
);

interface AboutClientProps {
  siteInfo: SiteInfo;
  partners?: Partner[];
}

export default function AboutClient({ siteInfo, partners = [] }: AboutClientProps) {
  const { t, getText, language } = useLanguage();

  const siteTitle = getText(siteInfo.siteTitle, siteInfo.siteTitleEn) || (language === 'en' ? 'Osaka Fringe 2026' : '大阪文化万博Osaka Fringe 2026');
  const aboutTitle = getText(siteInfo.aboutTitle, siteInfo.aboutTitleEn);
  const aboutText = getText(siteInfo.aboutText, siteInfo.aboutTextEn);
  const tagline = getText(siteInfo.heroTagline, siteInfo.heroTaglineEn);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-20">
      {/* 3-Step Editorial Header */}
      <div className="border-l-4 border-[#E6007E] pl-4 sm:pl-6 space-y-2 py-2">
        <div className="text-xs font-black tracking-widest text-[#E6007E] uppercase">
          ABOUT OSAKA FRINGE
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
          {siteTitle}
        </h1>
        <p className="text-base sm:text-lg font-bold text-[#E6007E]">
          spill over 文化芸術が街にあふれだす
        </p>
      </div>

      {/* Philosophy Editorial Hero */}
      <div className="bg-white border border-pink-100 rounded-3xl p-8 sm:p-14 space-y-6 relative overflow-hidden shadow-xs">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="space-y-4 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-50 border border-pink-200 text-[#E6007E] text-xs font-black tracking-wider uppercase">
              PHILOSOPHY
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 leading-tight tracking-tight">
              {aboutTitle || (language === 'en' ? 'The Entire City of Osaka Becomes a Stage.' : '大阪の街じゅうが、舞台になる。')}
            </h2>
            <div className="w-16 h-1 bg-[#E6007E] rounded-full" />
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed whitespace-pre-line font-medium">
              {aboutText || (language === 'en' ? 'Transforming the entire city into open stages—not just inside traditional theaters, but across plazas, historical landmarks, cafes, and neighborhoods. Artists of all backgrounds and genres participate in an open-access arts festival. In Autumn 2026, diverse performing arts will spill over into the streets of Osaka.' : '劇場だけでなく街中のあらゆる場所を舞台に。プロ・アマ問わずアーティストが自由に参加するオープンアクセス型芸術祭。2026年秋、大阪の街に多彩な文化芸術があふれだします。')}
            </p>
          </div>

          <div className="relative w-48 h-28 bg-pink-50/50 rounded-2xl p-4 flex items-center justify-center border border-pink-100 shrink-0">
            <BrandLogo variant="stacked" linkToHome={false} className="w-full h-auto" />
          </div>
        </div>
      </div>

      {/* 3 Core Features: Large Editorial Format */}
      <div className="space-y-8">
        <div className="border-b border-slate-200/80 pb-4">
          <div className="text-xs font-black text-[#E6007E] uppercase tracking-widest">
            3 CORE VALUES
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
            フェスティバル 3つの特徴
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12">
          {/* Feature 01 */}
          <div className="space-y-4 group">
            <div className="flex items-baseline justify-between border-b-2 border-slate-900 pb-3">
              <span className="text-3xl sm:text-4xl font-black text-[#E6007E]">
                01
              </span>
              <span className="text-xs font-black tracking-widest text-slate-400 uppercase">
                OPEN ACCESS
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
              {t('feature1Title')}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
              {t('feature1Desc')}
            </p>
          </div>

          {/* Feature 02 */}
          <div className="space-y-4 group">
            <div className="flex items-baseline justify-between border-b-2 border-slate-900 pb-3">
              <span className="text-3xl sm:text-4xl font-black text-[#E6007E]">
                02
              </span>
              <span className="text-xs font-black tracking-widest text-slate-400 uppercase">
                THE CITY IS THE STAGE
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
              {t('feature2Title')}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
              {t('feature2Desc')}
            </p>
          </div>

          {/* Feature 03 */}
          <div className="space-y-4 group">
            <div className="flex items-baseline justify-between border-b-2 border-slate-900 pb-3">
              <span className="text-3xl sm:text-4xl font-black text-[#E6007E]">
                03
              </span>
              <span className="text-xs font-black tracking-widest text-slate-400 uppercase">
                OSAKA MEETS THE WORLD
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
              {t('feature3Title')}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
              {t('feature3Desc')}
            </p>
          </div>
        </div>
      </div>

      {/* Venue Types Section: 3-Column Clean Border Layout */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-8 sm:p-14 space-y-10 shadow-xs">
        <div className="space-y-2 border-b border-slate-200/80 pb-4">
          <div className="text-xs font-black text-[#E6007E] uppercase tracking-widest">
            VENUE CATEGORIES
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {t('aboutVenueTypesTitle')}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 font-medium">
            {t('aboutVenueTypesDesc')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 divide-y md:divide-y-0 md:divide-x divide-slate-200">
          {/* CORE */}
          <div className="space-y-3 pt-6 md:pt-0 md:pr-6">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded bg-blue-50 border border-blue-200 text-blue-700 text-xs font-black tracking-wider">
                CORE
              </span>
            </div>
            <h3 className="text-lg font-black text-slate-900">
              {t('venueTypeCoreTitle')}
            </h3>
            <div className="w-8 h-0.5 bg-[#E6007E]" />
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
              {t('venueTypeCoreDesc')}
            </p>
          </div>

          {/* HISTORICAL */}
          <div className="space-y-3 pt-6 md:pt-0 md:px-6">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-800 text-xs font-black tracking-wider">
                HISTORICAL
              </span>
            </div>
            <h3 className="text-lg font-black text-slate-900">
              {t('venueTypeHistoricalTitle')}
            </h3>
            <div className="w-8 h-0.5 bg-[#E6007E]" />
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
              {t('venueTypeHistoricalDesc')}
            </p>
          </div>

          {/* LOCAL */}
          <div className="space-y-3 pt-6 md:pt-0 md:pl-6">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded bg-pink-50 border border-pink-200 text-[#E6007E] text-xs font-black tracking-wider">
                LOCAL
              </span>
            </div>
            <h3 className="text-lg font-black text-slate-900">
              {t('venueTypeLocalTitle')}
            </h3>
            <div className="w-8 h-0.5 bg-[#E6007E]" />
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
              {t('venueTypeLocalDesc')}
            </p>
          </div>
        </div>
      </div>

      {/* FRINGE AROUND THE WORLD (World Map Section) */}
      <div className="space-y-8">
        {/* Section Header */}
        <div className="space-y-3 border-b border-slate-200/80 pb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-50 border border-pink-200 text-[#E6007E] text-xs font-black tracking-widest uppercase">
            {t('fromEdinburghToOsaka')}
          </div>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                {t('fringeWorldSectionTitle')}
              </h2>
              <p className="text-base sm:text-lg font-bold text-[#E6007E] mt-1">
                {t('fringeWorldSectionSub')}
              </p>
            </div>

            {/* Timeline Typography (1947 EDINBURGH -> 2026 OSAKA) */}
            <div className="inline-flex items-center gap-3 sm:gap-4 bg-white px-5 py-3 rounded-2xl shrink-0 shadow-xs border border-pink-200">
              <div className="text-left">
                <div className="text-base sm:text-lg font-black text-[#E6007E] leading-none tracking-tight">
                  1947
                </div>
                <div className="text-[10px] sm:text-xs font-bold text-slate-500 tracking-wider uppercase">
                  EDINBURGH
                </div>
              </div>

              <div className="flex items-center text-[#E6007E] px-1 font-black text-sm sm:text-base">
                →
              </div>

              <div className="text-left">
                <div className="text-base sm:text-lg font-black text-slate-900 leading-none tracking-tight">
                  2026
                </div>
                <div className="text-[10px] sm:text-xs font-black text-[#E6007E] tracking-wider uppercase">
                  OSAKA
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Editorial Story Text */}
        <div className="max-w-4xl text-slate-700 text-sm sm:text-base leading-relaxed space-y-4 font-medium">
          {language === 'en' ? (
            <>
              <p>
                Fringe began in Edinburgh in 1947.
              </p>
              <p>
                Since then, the idea of artists creating their own opportunities and turning unexpected places across the city into stages has spread across Europe, North America, Oceania, Asia and Africa.
              </p>
              <p>
                Each city has developed its own way of making space for artistic experimentation.
              </p>
              <p className="font-bold text-slate-900">
                In 2026, Osaka joins the map.
              </p>
            </>
          ) : (
            <>
              <p>
                「Fringe」のはじまりは、1947年のエディンバラ。
              </p>
              <p>
                そこから、アーティストが自ら表現の場をつくり、街のさまざまな場所を舞台に変えていくFringeの文化は、ヨーロッパから北米、オセアニア、アジア、アフリカへと広がってきました。
              </p>
              <p>
                それぞれの街が、それぞれの方法でアーティストの挑戦を受け入れています。
              </p>
              <p className="font-bold text-slate-900">
                2026年、大阪もその地図に加わります。
              </p>
            </>
          )}
        </div>

        {/* Interactive World Fringe Map */}
        <WorldFringeMap />
      </div>

      {/* Partners Section */}
      <div className="pt-4">
        <PartnerSection partners={partners} />
      </div>

      {/* Brand Assets Sub-section (Minimalist Rule + Typography) */}
      <div className="pt-12 border-t border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="text-xs font-black text-[#E6007E] uppercase tracking-widest">
              BRAND ASSETS
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {language === 'en' ? 'Logo & Brand Assets' : 'ロゴ・ブランド素材'}
            </h3>
            <p className="text-sm text-slate-600 font-medium whitespace-pre-line leading-relaxed">
              {language === 'en'
                ? 'Official Osaka Fringe logo files are available\nfor promotional and communication use.'
                : 'Osaka Fringeの広報・告知等にご利用いただける\n公式ロゴデータを配布しています。'}
            </p>
          </div>
          <div className="shrink-0">
            <Link
              href="/logo_download"
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-slate-900 hover:bg-[#E6007E] text-white font-black text-xs sm:text-sm tracking-wider transition-colors duration-200 rounded-lg shadow-xs group"
            >
              <span>{language === 'en' ? 'View Brand Assets →' : 'ロゴ・ブランド素材を見る →'}</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}