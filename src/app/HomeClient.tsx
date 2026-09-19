'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Performance, SiteInfo, Partner } from '@/types';
import { useLanguage } from '@/context/LanguageContext';
import HomeHeroClient from './HomeHeroClient';
import PerformanceCard from '@/components/audience/PerformanceCard';
import PerformanceModal from '@/components/audience/PerformanceModal';
import PartnerSection from '@/components/common/PartnerSection';
import { ArrowRightIcon } from '@/components/common/CustomIcons';
import { selectFeaturedPerformances, getFestivalStatus } from '@/utils/performanceUtils';
import { NewsItem } from '@/lib/microcms';

interface HomeClientProps {
  venues?: unknown[];
  performances: Performance[];
  partners?: Partner[];
  siteInfo: SiteInfo;
  news?: NewsItem[];
}

export default function HomeClient({
  performances,
  partners = [],
  siteInfo,
  news = [],
}: HomeClientProps) {
  const { t, getText, language } = useLanguage();
  const [selectedPerformance, setSelectedPerformance] = useState<Performance | null>(null);

  // Smart selection for up to 4 featured shows (excludes ended shows)
  const displayPerformances = selectFeaturedPerformances(performances, 4);

  const aboutTitle = getText(siteInfo.aboutTitle, siteInfo.aboutTitleEn);
  const aboutText = getText(siteInfo.aboutText, siteInfo.aboutTextEn);

  const festivalStatus = getFestivalStatus();
  let pickUpTitle = '';
  let pickUpLabel = '';
  let pickUpDesc = '';

  if (festivalStatus === 'before') {
    pickUpLabel = 'PICK UP PROGRAMS';
    pickUpTitle = language === 'en' ? 'Featured Programs' : '注目の公演・プログラム';
    pickUpDesc = language === 'en' 
      ? 'Introducing featured performances and exhibitions leading up to the opening on October 8.'
      : '10月8日の開幕に向け、注目の公演や展示をご紹介します。';
  } else if (festivalStatus === 'during') {
    pickUpLabel = 'PICK UP SHOWS';
    pickUpTitle = language === 'en' ? 'Upcoming Featured Shows' : '今週の注目公演';
    pickUpDesc = language === 'en'
      ? 'Featured performances coming up soon.'
      : 'まもなく開催される注目のパフォーマンス';
  } else {
    pickUpLabel = 'PROGRAM ARCHIVE';
    pickUpTitle = language === 'en' ? 'Programs Archive' : '開催プログラム';
    pickUpDesc = language === 'en'
      ? 'Introducing past performances and exhibitions held at Osaka Fringe 2026.'
      : 'Osaka Fringe 2026で開催された公演や展示をご紹介します。';
  }

  return (
    <div className="space-y-20 pb-20 bg-[#fef9fc]">
      {/* Hero Section */}
      <HomeHeroClient siteInfo={siteInfo} />

      {/* News Section */}
      {news && news.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="border-b border-pink-100 pb-2 mb-4">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              NEWS
            </h2>
          </div>
          <div className="space-y-3">
            {news.map((item) => (
              <a
                key={item.id}
                href={item.linkUrl || '#'}
                target={item.linkUrl ? "_blank" : undefined}
                rel="noopener noreferrer"
                className={`block bg-white border border-slate-100 p-4 rounded-xl shadow-sm hover:border-[#E6007E] transition-colors ${item.linkUrl ? 'cursor-pointer' : 'cursor-default pointer-events-none'}`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-sm font-bold text-slate-500">
                      {new Date(item.publishedAt).toLocaleDateString(language === 'en' ? 'en-US' : 'ja-JP')}
                    </span>
                    {item.isImportant && (
                      <span className="px-2 py-0.5 bg-[#E6007E] text-white text-[10px] font-bold rounded">
                        IMPORTANT
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 flex-1">
                    {getText(item.title, item.titleEn)}
                  </h3>
                </div>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Featured / Pick Up Shows (Only show if at least 1 show is available) */}
      {displayPerformances.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-pink-100 pb-5">
            <div className="space-y-1.5">
              <div className="text-[#E6007E] font-black text-xs uppercase tracking-wider">
                <span>{pickUpLabel}</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
                {pickUpTitle}
              </h2>
              <p className="text-sm text-slate-600 font-medium">
                {pickUpDesc}
              </p>
            </div>
            <Link
              href="/audience"
              className="inline-flex items-center gap-1.5 text-sm font-black text-[#E6007E] hover:text-[#c4006b] bg-pink-50 hover:bg-pink-100/70 px-5 py-2.5 rounded-full transition-colors self-start sm:self-auto cursor-pointer"
            >
              <span>{t('viewAllAudience')}</span>
              <ArrowRightIcon className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {displayPerformances.map((perf) => (
              <PerformanceCard 
                key={perf.id} 
                performance={perf} 
                onSelect={(p) => setSelectedPerformance(p)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Audience App CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#E6007E] via-[#d60075] to-[#7928ca] p-8 sm:p-14 text-white shadow-xl shadow-pink-500/15">
          <div className="relative z-10 max-w-2xl space-y-6">
            <div className="inline-flex items-center px-3.5 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-black uppercase tracking-wider border border-white/30">
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
                <span>{t('launchApp')}</span>
                <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* About Osaka Fringe & Venue Categories Preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white border border-pink-100 rounded-3xl p-8 sm:p-12 space-y-8 shadow-sm">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-pink-50 text-[#E6007E] text-xs font-black uppercase tracking-wide">
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
              <div className="text-[#E6007E] font-black text-sm">
                <span>【CORE】{t('venueTypeCoreTitle')}</span>
              </div>
              <p className="text-xs text-slate-600 font-medium">{t('venueTypeCoreDesc')}</p>
            </div>
            <div className="bg-amber-50/50 p-5 rounded-2xl border border-amber-100 space-y-1.5">
              <div className="text-amber-800 font-black text-sm">
                <span>【HISTORICAL】{t('venueTypeHistoricalTitle')}</span>
              </div>
              <p className="text-xs text-slate-600 font-medium">{t('venueTypeHistoricalDesc')}</p>
            </div>
            <div className="bg-purple-50/50 p-5 rounded-2xl border border-purple-100 space-y-1.5">
              <div className="text-purple-700 font-black text-sm">
                <span>【LOCAL】{t('venueTypeLocalTitle')}</span>
              </div>
              <p className="text-xs text-slate-600 font-medium">{t('venueTypeLocalDesc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Partners & Collaborations Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <PartnerSection partners={partners} />
      </section>

      {/* Performance Modal Window */}
      <PerformanceModal
        performance={selectedPerformance}
        onClose={() => setSelectedPerformance(null)}
      />
    </div>
  );
}