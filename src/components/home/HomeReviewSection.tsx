'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { ArrowRight, Theater, Users, MapPin, Sparkles } from 'lucide-react';
import { Performance } from '@/types';
import PerformanceCard from '@/components/audience/PerformanceCard';

interface HomeReviewSectionProps {
  performances: Performance[];
  onSelectPerformance?: (performance: Performance) => void;
}

export default function HomeReviewSection({
  performances,
  onSelectPerformance,
}: HomeReviewSectionProps) {
  const { t, language } = useLanguage();

  const entrances = [
    {
      id: 'shows',
      title: t('reviewEntrance1Title'),
      desc: t('reviewEntrance1Desc'),
      href: '/audience',
      icon: Theater,
      badge: 'ARCHIVE / SHOWS',
      cta: language === 'en' ? 'Explore 2026 Shows' : '公演アーカイブを見る',
      color: '#E6007E',
      bgHover: 'hover:border-[#E6007E]',
    },
    {
      id: 'artists',
      title: t('reviewEntrance2Title'),
      desc: t('reviewEntrance2Desc'),
      href: '/artists',
      icon: Users,
      badge: 'ARTISTS 2026',
      cta: language === 'en' ? 'Meet the Artists' : '参加アーティスト一覧',
      color: '#7928ca',
      bgHover: 'hover:border-[#7928ca]',
    },
    {
      id: 'venues',
      title: t('reviewEntrance3Title'),
      desc: t('reviewEntrance3Desc'),
      href: '/venues',
      icon: MapPin,
      badge: 'VENUES 2026',
      cta: language === 'en' ? 'Discover Venues' : '開催会場一覧',
      color: '#0284c7',
      bgHover: 'hover:border-[#0284c7]',
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-100 text-[#E6007E] text-xs font-black uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>OSAKA FRINGE 2026 ARCHIVE</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
          {t('review2026Heading')}
        </h2>
        <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed">
          {t('review2026Body')}
        </p>
      </div>

      {/* 3 Main Entrance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
        {entrances.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.id}
              href={item.href}
              className={`group bg-white rounded-3xl p-7 sm:p-8 border-2 border-slate-100 ${item.bgHover} shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between space-y-6 cursor-pointer`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md"
                    style={{ backgroundColor: item.color }}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    {item.badge}
                  </span>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 group-hover:text-[#E6007E] transition-colors tracking-tight">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-2 text-xs sm:text-sm font-black text-[#E6007E] group-hover:translate-x-1 transition-transform">
                <span>{item.cta}</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Featured 2026 Performance Highlights */}
      {performances.length > 0 && (
        <div className="pt-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-pink-100 pb-4">
            <div className="space-y-1">
              <span className="text-xs font-black text-[#E6007E] tracking-wider uppercase">
                {language === 'en' ? 'PROGRAM ARCHIVE' : '2026年 開催プログラム'}
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                {language === 'en' ? 'Featured 2026 Performances' : '注目の公演アーカイブ'}
              </h3>
            </div>
            <Link
              href="/audience"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-black text-[#E6007E] hover:text-[#c4006b] bg-pink-50 hover:bg-pink-100/80 px-4 py-2 rounded-full transition-colors self-start sm:self-auto"
            >
              <span>{t('viewAllAudience')}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {performances.map((perf) => (
              <PerformanceCard
                key={perf.id}
                performance={perf}
                onSelect={onSelectPerformance}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
