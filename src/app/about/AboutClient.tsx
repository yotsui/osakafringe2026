'use client';

import React from 'react';
import Image from 'next/image';
import { SiteInfo, Banner } from '@/types';
import { useLanguage } from '@/context/LanguageContext';
import BannerSection from '@/components/common/BannerSection';
import { Sparkles, Globe, MapPin, Users, Building, Landmark, Coffee, Heart } from 'lucide-react';

interface AboutClientProps {
  siteInfo: SiteInfo;
  banners: Banner[];
}

export default function AboutClient({ siteInfo, banners }: AboutClientProps) {
  const { t, getText } = useLanguage();

  const aboutTitle = getText(siteInfo.aboutTitle, siteInfo.aboutTitleEn);
  const aboutText = getText(siteInfo.aboutText, siteInfo.aboutTextEn);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-50 border border-pink-200 text-pink-600 text-xs font-black uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{t('aboutPageBadge')}</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
          OSAKA FRINGE 2026 | SPILL OVER
        </h1>
        <p className="text-base sm:text-lg font-black text-pink-600 max-w-xl mx-auto">
          街の一角を、世界の舞台へ。
        </p>
      </div>

      {/* Main Philosophy Card */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-pink-600 via-rose-500 to-purple-600 p-8 sm:p-12 text-white shadow-xl shadow-pink-500/15 space-y-6">
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

          <div className="relative w-48 h-48 bg-white/10 rounded-3xl backdrop-blur-md p-4 flex items-center justify-center border border-white/20 flex-shrink-0">
            <div className="relative w-full h-full">
              <Image
                src="/images/logo_stacked_trans.png"
                alt="Osaka Fringe"
                fill
                className="object-contain"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 3 Pillars of Osaka Fringe */}
      <div className="space-y-6">
        <div className="text-center space-y-1">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">フェスティバルの3大特徴</h2>
          <p className="text-xs text-slate-500 font-medium">誰もが主役になれるオープンな仕組み</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-pink-100 rounded-3xl p-6 sm:p-8 space-y-3 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-pink-50 border border-pink-200 flex items-center justify-center text-pink-600">
              <Globe className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-slate-900">{t('feature1Title')}</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">{t('feature1Desc')}</p>
          </div>

          <div className="bg-white border border-purple-100 rounded-3xl p-6 sm:p-8 space-y-3 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-slate-900">{t('feature2Title')}</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">{t('feature2Desc')}</p>
          </div>

          <div className="bg-white border border-amber-100 rounded-3xl p-6 sm:p-8 space-y-3 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-slate-900">{t('feature3Title')}</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">{t('feature3Desc')}</p>
          </div>
        </div>
      </div>

      {/* 3 Venue Categories from osakafringe.com */}
      <div className="bg-slate-50 border border-pink-100 rounded-3xl p-8 sm:p-12 space-y-8 shadow-xs">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="px-3 py-1 rounded-full bg-pink-100 text-pink-700 text-xs font-black uppercase tracking-wider">
            VENUE CATEGORIES
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            大阪の街をハックする 3つの会場カテゴリー
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            大規模ショーケースから日常の隙間まで、街のあらゆる空間が舞台になります。
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* CORE */}
          <div className="bg-white p-6 rounded-2xl border border-pink-100 space-y-3 shadow-2xs">
            <div className="flex items-center gap-2 text-pink-600 font-black text-base">
              <Building className="w-5 h-5" />
              <span>【CORE】発信拠点</span>
            </div>
            <p className="text-xs text-slate-700 font-bold">
              商業施設アトリウム・駅前広場・公開空地・デッキ
            </p>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              人通りの多い空間を活用し、フェスティバルの熱気を都市全体に発信するショーケース拠点。
            </p>
          </div>

          {/* HISTORICAL */}
          <div className="bg-white p-6 rounded-2xl border border-purple-100 space-y-3 shadow-2xs">
            <div className="flex items-center gap-2 text-purple-600 font-black text-base">
              <Landmark className="w-5 h-5" />
              <span>【HISTORICAL】歴史的・象徴的空間</span>
            </div>
            <p className="text-xs text-slate-700 font-bold">
              重要文化財・登録有形文化財・近代建築（レトロビル）・神社仏閣
            </p>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              大阪の歴史的都市資産と現代アートを掛け合わせ、新たな文化価値を創出するプレミアム空間。
            </p>
          </div>

          {/* LOCAL */}
          <div className="bg-white p-6 rounded-2xl border border-amber-100 space-y-3 shadow-2xs">
            <div className="flex items-center gap-2 text-amber-600 font-black text-base">
              <Coffee className="w-5 h-5" />
              <span>【LOCAL】日常・ユニークベニュー</span>
            </div>
            <p className="text-xs text-slate-700 font-bold">
              カフェ・バー・ギャラリー・倉庫・銭湯・空き店舗
            </p>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              街の「隙間」をハックし、アーティストと観客が密に交わる多様な小規模会場。
            </p>
          </div>
        </div>
      </div>

      {/* Official Banners */}
      <BannerSection banners={banners} />
    </div>
  );
}