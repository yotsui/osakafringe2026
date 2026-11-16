'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Performance, SiteInfo, Partner } from '@/types';
import { useLanguage } from '@/context/LanguageContext';
import HomeHeroClient from './HomeHeroClient';
import HomeReviewSection from '@/components/home/HomeReviewSection';
import HomeAwardsSection from '@/components/home/HomeAwardsSection';
import Home2027Section from '@/components/home/Home2027Section';
import PerformanceModal from '@/components/audience/PerformanceModal';
import PartnerSection from '@/components/common/PartnerSection';
import { ArrowRightIcon } from '@/components/common/CustomIcons';
import { selectFeaturedPerformances } from '@/utils/performanceUtils';

interface HomeClientProps {
  venues?: unknown[];
  performances: Performance[];
  partners?: Partner[];
  siteInfo: SiteInfo;
}

export default function HomeClient({
  performances,
  partners = [],
  siteInfo,
}: HomeClientProps) {
  const { t, getText } = useLanguage();
  const [selectedPerformance, setSelectedPerformance] = useState<Performance | null>(null);

  // Up to 6 featured shows for the 2026 review archive
  const displayPerformances = selectFeaturedPerformances(performances, 6);

  const aboutTitle = getText(siteInfo.aboutTitle, siteInfo.aboutTitleEn);
  const aboutText = getText(siteInfo.aboutText, siteInfo.aboutTextEn);

  return (
    <div className="space-y-20 sm:space-y-24 pb-20 bg-[#fef9fc]">
      {/* ① 終了のお礼＋アワード発表＋2027年開催決定 */}
      <HomeHeroClient siteInfo={siteInfo} />

      {/* ② 2026年の公演・アーティスト・会場の一覧への入口 */}
      <HomeReviewSection
        performances={displayPerformances}
        onSelectPerformance={(p) => setSelectedPerformance(p)}
      />

      {/* ③ フリンジアワード2026（4部門） */}
      <HomeAwardsSection performances={performances} />

      {/* ④ 2027年の開催・参加スケジュール */}
      <Home2027Section />

      {/* ⑤ 既存のお知らせ・フリンジ紹介・主催協賛等 */}
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
