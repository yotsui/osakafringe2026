'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Venue, Performance, Award, Banner, SiteInfo } from '@/types';
import { useLanguage } from '@/context/LanguageContext';
import HomeHeroClient from './HomeHeroClient';
import PerformanceCard from '@/components/audience/PerformanceCard';
import PerformanceModal from '@/components/audience/PerformanceModal';
import BannerSection from '@/components/common/BannerSection';
import { 
  SparkleIcon, 
  ArrowRightIcon, 
  CompassIcon, 
  ZapIcon
} from '@/components/common/CustomIcons';
import { Building, Landmark, Coffee } from 'lucide-react';

import { selectFeaturedPerformances } from '@/utils/performanceUtils';

interface HomeClientProps {
  venues: Venue[];
  performances: Performance[];
  awards: Award[];
  banners: Banner[];
  siteInfo: SiteInfo;
}

export default function HomeClient({
  venues,
  performances,
  awards,
  banners,
  siteInfo,
}: HomeClientProps) {
  const { t, getText } = useLanguage();
  const [selectedPerformance, setSelectedPerformance] = useState<Performance | null>(null);

  // Smart selection for 3 featured shows (Filter past shows & fallback intelligently)
  const displayPerformances = selectFeaturedPerformances(performances, 3);

  const aboutTitle = getText(siteInfo.aboutTitle, siteInfo.aboutTitleEn);
  const aboutText = getText(siteInfo.aboutText, siteInfo.aboutTextEn);

  return (
    <div className="space-y-20 pb-20 bg-[#fef9fc]">
      {/* Hero Section */}
      <HomeHeroClient siteInfo={siteInfo} />

      {/* Featured / Pick Up Shows */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-pink-100 pb-5">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 text-[#E6007E] font-black text-xs uppercase tracking-wider">
              <SparkleIcon className="w-3.5 h-3.5" fill="#E6007E" />
              <span>{t('pickUpShows')}</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
              {t('pickUpTitle')}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              {t('pickUpSubtitle')}
            </p>
          </div>
          <Link
            href="/audience"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-black text-[#E6007E] hover:text-[#c4006b] bg-pink-50 hover:bg-pink-100/70 px-4 py-2 rounded-full transition-colors self-start sm:self-auto cursor-pointer"
          >
            <span>{t('viewAllAudience')}</span>
            <ArrowRightIcon className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayPerformances.map((perf) => (
            <PerformanceCard 
              key={perf.id} 
              performance={perf} 
              onSelect={(p) => setSelectedPerformance(p)}
            />
          ))}
        </div>
      </section>

      {/* Audience App CTA Banner (Refined Primary Pink & Yellow Gradient) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#E6007E] via-[#d60075] to-[#7928ca] p-8 sm:p-14 text-white shadow-xl shadow-pink-500/15">
          <div className="relative z-10 max-w-2xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-black uppercase tracking-wider border border-white/30">
              <CompassIcon className="w-4 h-4" />
              <span>{t('appCtaBadge')}</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight text-white">
              {t('appCtaTitle')}
            </h2>
            <p className="text-sm sm:text-base text-pink-100 font-medium leading-relaxed max-w-xl">
              {t('appCtaDesc')}
            </p>
            <div className="pt-2">
              <Link
                href="/audience"
                className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-white hover:bg-[#FFF100] text-slate-900 font-black text-sm tracking-wide shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer group"
              >
                <SparkleIcon className="w-4 h-4" fill="#E6007E" />
                <span>{t('launchApp')}</span>
                <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          <div className="absolute right-4 bottom-4 w-1/3 opacity-10 hidden md:flex items-center justify-center pointer-events-none">
            <CompassIcon className="w-80 h-80" />
          </div>
        </div>
      </section>

      {/* About Osaka Fringe & Venue Categories Preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white border border-pink-100 rounded-3xl p-8 sm:p-12 space-y-8 shadow-sm">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-50 text-[#E6007E] text-xs font-black uppercase tracking-wide">
              <ZapIcon className="w-3.5 h-3.5" />
              <span>{t('aboutPreviewBadge')}</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
              {aboutTitle || '大阪文化万博 - Osaka Fringe 2026'}
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-medium whitespace-pre-line">
              {aboutText}
            </p>
            <div>
              <Link
                href="/about"
                className="inline-flex items-center gap-1.5 text-sm font-bold text-[#E6007E] hover:text-[#c4006b] group"
              >
                <span>{t('readMore')}</span>
                <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* 3 Categories Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-6 border-t border-slate-100">
            <div className="bg-pink-50/50 p-5 rounded-2xl border border-pink-100 space-y-1.5">
              <div className="flex items-center gap-2 text-[#E6007E] font-black text-sm">
                <Building className="w-4 h-4" />
                <span>【CORE】発信拠点</span>
              </div>
              <p className="text-xs text-slate-600 font-medium">アトリウム・広場・デッキ</p>
            </div>
            <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-100 space-y-1.5">
              <div className="flex items-center gap-2 text-[#0078D7] font-black text-sm">
                <Landmark className="w-4 h-4" />
                <span>【HISTORICAL】歴史的空間</span>
              </div>
              <p className="text-xs text-slate-600 font-medium">登録有形文化財・近代建築</p>
            </div>
            <div className="bg-emerald-50/50 p-5 rounded-2xl border border-emerald-100 space-y-1.5">
              <div className="flex items-center gap-2 text-[#00A960] font-black text-sm">
                <Coffee className="w-4 h-4" />
                <span>【LOCAL】ユニークベニュー</span>
              </div>
              <p className="text-xs text-slate-600 font-medium">カフェ・バー・倉庫・路地裏</p>
            </div>
          </div>
        </div>
      </section>

      {/* Official Banners */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <BannerSection banners={banners} />
      </section>

      {/* Performance Modal Window */}
      <PerformanceModal
        performance={selectedPerformance}
        onClose={() => setSelectedPerformance(null)}
      />
    </div>
  );
}