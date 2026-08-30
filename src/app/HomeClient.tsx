'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Venue, Performance, Award, Banner, SiteInfo } from '@/types';
import { useLanguage } from '@/context/LanguageContext';
import HomeHeroClient from './HomeHeroClient';
import PerformanceCard from '@/components/audience/PerformanceCard';
import BannerSection from '@/components/common/BannerSection';
import { 
  Sparkles, 
  MapPin, 
  ArrowRight, 
  Heart, 
  Trophy, 
  Calendar,
  Compass,
  CheckCircle2,
  Building,
  Landmark,
  Coffee
} from 'lucide-react';

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

  // Featured shows for home page
  const featuredPerformances = performances.filter((p) => p.isFeatured).slice(0, 3);
  const displayPerformances =
    featuredPerformances.length > 0 ? featuredPerformances : performances.slice(0, 3);

  const aboutTitle = getText(siteInfo.aboutTitle, siteInfo.aboutTitleEn);
  const aboutText = getText(siteInfo.aboutText, siteInfo.aboutTextEn);

  return (
    <div className="space-y-16 pb-16 bg-white">
      {/* Hero Section */}
      <HomeHeroClient siteInfo={siteInfo} />

      {/* Featured / Pick Up Shows */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-pink-100 pb-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-pink-600 font-extrabold text-xs uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t('pickUpShows')}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {t('pickUpTitle')}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              {t('pickUpSubtitle')}
            </p>
          </div>
          <Link
            href="/audience"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-extrabold text-pink-600 hover:text-pink-700 group self-start sm:self-auto bg-pink-50 hover:bg-pink-100/70 px-4 py-2 rounded-full transition-colors"
          >
            <span>{t('viewAllAudience')}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayPerformances.map((perf) => (
            <PerformanceCard key={perf.id} performance={perf} />
          ))}
        </div>
      </section>

      {/* Audience App CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-pink-600 via-rose-500 to-purple-600 p-8 sm:p-12 text-white shadow-xl shadow-pink-500/15">
          <div className="relative z-10 max-w-2xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-black uppercase tracking-wider border border-white/30">
              <Compass className="w-3.5 h-3.5" />
              <span>{t('appCtaBadge')}</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
              {t('appCtaTitle')}
            </h2>
            <p className="text-sm sm:text-base text-pink-100 font-medium leading-relaxed">
              {t('appCtaDesc')}
            </p>
            <div className="pt-2">
              <Link
                href="/audience"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-white hover:bg-pink-50 text-pink-600 font-black text-sm tracking-wide shadow-lg hover:-translate-y-0.5 transition-all group"
              >
                <Sparkles className="w-5 h-5 text-pink-500 group-hover:rotate-12 transition-transform" />
                <span>{t('launchApp')}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-10 hidden md:flex items-center justify-center pointer-events-none pr-8">
            <Compass className="w-80 h-80 text-white" />
          </div>
        </div>
      </section>

      {/* About Osaka Fringe & Venue Categories Preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="bg-slate-50 border border-pink-100 rounded-3xl p-8 sm:p-12 space-y-8 shadow-xs">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-100 text-pink-700 text-xs font-bold uppercase tracking-wide">
              <span>{t('aboutPreviewBadge')}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {aboutTitle || '大阪文化万博 - Osaka Fringe 2026'}
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed line-clamp-4 font-medium whitespace-pre-line">
              {aboutText}
            </p>
            <div>
              <Link
                href="/about"
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-extrabold text-pink-600 hover:text-pink-700 group"
              >
                <span>{t('readMore')}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* 3 Categories Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-200">
            <div className="bg-white p-5 rounded-2xl border border-pink-100 space-y-1 shadow-2xs">
              <div className="flex items-center gap-2 text-pink-600 font-black text-xs">
                <Building className="w-4 h-4" />
                <span>【CORE】発信拠点</span>
              </div>
              <p className="text-xs text-slate-500 font-medium">アトリウム・広場・デッキ</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-purple-100 space-y-1 shadow-2xs">
              <div className="flex items-center gap-2 text-purple-600 font-black text-xs">
                <Landmark className="w-4 h-4" />
                <span>【HISTORICAL】歴史的空間</span>
              </div>
              <p className="text-xs text-slate-500 font-medium">登録有形文化財・近代建築</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-amber-100 space-y-1 shadow-2xs">
              <div className="flex items-center gap-2 text-amber-600 font-black text-xs">
                <Coffee className="w-4 h-4" />
                <span>【LOCAL】ユニークベニュー</span>
              </div>
              <p className="text-xs text-slate-500 font-medium">カフェ・バー・倉庫・路地裏</p>
            </div>
          </div>
        </div>
      </section>

      {/* Official Banners (Instagram / Osaka Tourism) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <BannerSection banners={banners} />
      </section>
    </div>
  );
}