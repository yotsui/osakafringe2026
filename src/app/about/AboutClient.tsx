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
      <div className="text-center space-y-3">
        <div className="inline-block px-3 py-1 rounded-full bg-pink-50 border border-pink-200 text-[#E6007E] text-xs font-black uppercase tracking-wider">
          <span>{t('aboutPageBadge')}</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
          OSAKA FRINGE 2026 | SPILL OVER
        </h1>
        <p className="text-base sm:text-lg font-black text-[#E6007E] max-w-xl mx-auto">
          {tagline || '街の一角を、世界の舞台へ。'}
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
              {aboutTitle || '大阪文化万博 - Osaka Fringe 2026'}
            </h2>
            <p className="text-sm sm:text-base text-pink-100 leading-relaxed whitespace-pre-line font-medium">
              {aboutText}
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
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-medium">
            {t('feature1Desc')}
          </p>
        </div>

        <div className="bg-white border border-rose-100 rounded-3xl p-8 space-y-3 shadow-xs">
          <div className="text-rose-600 font-black text-xs uppercase tracking-widest">
            02 / CITYWIDE THEATER
          </div>
          <h3 className="text-lg font-black text-slate-900">{t('feature2Title')}</h3>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-medium">
            {t('feature2Desc')}
          </p>
        </div>

        <div className="bg-white border border-purple-100 rounded-3xl p-8 space-y-3 shadow-xs">
          <div className="text-purple-600 font-black text-xs uppercase tracking-widest">
            03 / GLOBAL COLLISION
          </div>
          <h3 className="text-lg font-black text-slate-900">{t('feature3Title')}</h3>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-medium">
            {t('feature3Desc')}
          </p>
        </div>
      </div>

      {/* Venue Types Section */}
      <div className="bg-slate-50 border border-pink-100 rounded-3xl p-8 sm:p-12 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-black text-slate-900">3つのベニューカテゴリ</h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            大阪の街全体が劇場に。それぞれの空間特性を活かした多彩な表現が展開されます。
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 space-y-2">
            <span className="px-2.5 py-0.5 rounded-md bg-blue-100 text-blue-700 text-xs font-black">
              CORE ベニュー
            </span>
            <h4 className="text-base font-black text-slate-900">公共空間・広場</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              水都大阪の水辺デッキや公共広場。大道芸・紙芝居・パブリックアートなど、街ゆく人が偶然出会う熱気のハブ。
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 space-y-2">
            <span className="px-2.5 py-0.5 rounded-md bg-amber-100 text-amber-800 text-xs font-black">
              HISTORICAL ベニュー
            </span>
            <h4 className="text-base font-black text-slate-900">登録有形文化財・古民家</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              昭和初期の近代建築や登録有形文化財。歴史的空間の趣と現代アート・舞台表現が交差する濃密な体験。
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 space-y-2">
            <span className="px-2.5 py-0.5 rounded-md bg-pink-100 text-pink-700 text-xs font-black">
              LOCAL ベニュー
            </span>
            <h4 className="text-base font-black text-slate-900">ルーフトップ・地下スペース</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              通天閣を望む屋上やアメリカ村の地下ライブバーなど、大阪カルチャーの隙間をハックする実験的空間。
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