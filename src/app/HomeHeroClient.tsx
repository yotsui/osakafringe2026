'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { SiteInfo } from '@/types';
import { useLanguage } from '@/context/LanguageContext';
import { ArrowDown, Award, Calendar, CheckCircle2 } from 'lucide-react';

interface HomeHeroClientProps {
  siteInfo?: SiteInfo;
}

export default function HomeHeroClient({}: HomeHeroClientProps) {
  const { t, language } = useLanguage();

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#E6007E] via-[#d60075] to-[#c4006b] text-white">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 pb-14 sm:pb-20 relative z-10">
        
        {/* Main Grid: Left Column Text & Highlights, Right Column Visual Brand Archive */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* Left Column: Heading, Thank-you message, Announcement Cards, Buttons */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-8 text-center lg:text-left flex flex-col items-center lg:items-start">
            
            {/* Top Ended Status Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white text-xs sm:text-sm font-black tracking-wider uppercase shadow-sm">
              <CheckCircle2 className="w-4 h-4 text-[#FFF100]" />
              <span>{t('festivalEndedBadge')}</span>
              <span className="text-white/60">|</span>
              <span className="text-white/90 text-xs font-bold">2026.10.8 - 11.8</span>
            </div>

            {/* Main Thank-you Heading */}
            <div className="space-y-4">
              <h1 className="text-2xl sm:text-4xl lg:text-[2.6rem] font-black tracking-tight leading-snug drop-shadow-sm">
                {t('heroPostEventHeading')}
              </h1>
              <p className="text-sm sm:text-base text-white/95 font-medium leading-relaxed whitespace-pre-line max-w-2xl">
                {t('heroPostEventBody')}
              </p>
            </div>

            {/* 2 Announcement Highlights */}
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
              {/* Announcement 1: Awards */}
              <div className="bg-white/10 hover:bg-white/15 border border-white/25 rounded-2xl p-5 backdrop-blur-md transition-all shadow-sm flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#FFF100] text-slate-950 text-[11px] font-black uppercase tracking-wider">
                    <Award className="w-3.5 h-3.5" />
                    <span>AWARDS 2026</span>
                  </div>
                  <h2 className="text-lg font-black text-white leading-tight">
                    {t('heroPostEventAnnounce1Title')}
                  </h2>
                  <p className="text-xs sm:text-sm text-white/90 font-medium leading-relaxed">
                    {t('heroPostEventAnnounce1Desc')}
                  </p>
                </div>
                <div className="pt-1">
                  <Link
                    href="#awards"
                    className="inline-flex items-center gap-1.5 text-xs font-black text-[#FFF100] hover:underline"
                  >
                    <span>{t('heroBtnAwards')}</span>
                    <ArrowDown className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Announcement 2: Fringe 2027 */}
              <div className="bg-white/10 hover:bg-white/15 border border-white/25 rounded-2xl p-5 backdrop-blur-md transition-all shadow-sm flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white text-[#E6007E] text-[11px] font-black uppercase tracking-wider">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>NEXT FRINGE 2027</span>
                  </div>
                  <h2 className="text-base sm:text-lg font-black text-white leading-tight">
                    {t('heroPostEventAnnounce2Title')}
                  </h2>
                  <div className="text-xl sm:text-2xl font-black text-[#FFF100] tracking-tight py-0.5 drop-shadow-sm">
                    {t('heroPostEventAnnounce2Date')}
                  </div>
                  <p className="text-xs sm:text-sm text-white/90 font-medium leading-relaxed">
                    {t('heroPostEventAnnounce2Desc')}
                  </p>
                </div>
                <div className="pt-1">
                  <Link
                    href="#fringe2027"
                    className="inline-flex items-center gap-1.5 text-xs font-black text-[#FFF100] hover:underline"
                  >
                    <span>{t('heroBtn2027')}</span>
                    <ArrowDown className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="w-full flex flex-col sm:flex-row gap-3.5 pt-2">
              <Link
                href="#awards"
                className="flex-1 px-6 py-4 rounded-2xl bg-white hover:bg-[#FFF100] text-[#E6007E] hover:text-black font-black text-sm sm:text-base shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer group"
              >
                <Award className="w-5 h-5 shrink-0" />
                <span>{t('heroBtnAwards')}</span>
                <ArrowDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
              </Link>

              <Link
                href="#fringe2027"
                className="flex-1 px-6 py-4 rounded-2xl bg-black/40 hover:bg-black/60 text-white font-black text-sm sm:text-base border border-white/30 backdrop-blur-md shadow-md hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer group"
              >
                <Calendar className="w-5 h-5 shrink-0 text-[#FFF100]" />
                <span>{t('heroBtn2027')}</span>
                <ArrowDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
              </Link>
            </div>

          </div>

          {/* Right Column: Visual Artwork & Spill Over Branding with 2026 Archive note */}
          <div className="lg:col-span-5 space-y-6 flex flex-col items-center text-center">
            
            {/* Official Spill Over Vector Graphic */}
            <div className="w-full max-w-sm sm:max-w-md px-2">
              <div className="relative w-full aspect-[510/174]">
                <Image
                  src="/images/spillover.svg"
                  alt="Spill Over - 文化芸術が街にあふれだす"
                  fill
                  sizes="(max-width: 640px) 100vw, 448px"
                  priority
                  className="object-contain"
                />
              </div>
            </div>

            {/* Poster Visual with Archive Banner */}
            <div className="relative w-full max-w-sm aspect-square rounded-3xl overflow-hidden shadow-2xl bg-white group">
              <Image
                src="/images/osakafringe_visuals.webp"
                alt="Osaka Fringe 2026 Official Visual"
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 384px, 384px"
                priority
                className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 flex flex-col items-center text-center">
                <span className="text-[11px] font-black uppercase tracking-widest text-[#FFF100]">
                  OSAKA FRINGE 2026 ARCHIVE
                </span>
                <span className="text-xs font-bold text-white/90">
                  {language === 'en' ? '2026 Performances & Artists' : '2026年 開催公演・参加アーティスト'}
                </span>
              </div>
            </div>

            {/* Official Osaka Fringe Logo */}
            <div className="w-full max-w-xs">
              <div className="relative w-full aspect-[321.73/49.5] filter brightness-0 invert">
                <Image
                  src="/images/osakafringe04.svg"
                  alt="Osaka Fringe"
                  fill
                  sizes="(max-width: 640px) 100vw, 320px"
                  className="object-contain"
                />
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
