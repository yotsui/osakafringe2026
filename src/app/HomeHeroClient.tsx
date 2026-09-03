'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { SiteInfo } from '@/types';
import { useLanguage } from '@/context/LanguageContext';
import BrandLogo from '@/components/common/BrandLogo';
import { SparkleIcon, ArrowRightIcon, CalendarIcon, MapPinIcon } from '@/components/common/CustomIcons';

interface HomeHeroClientProps {
  siteInfo: SiteInfo;
}

export default function HomeHeroClient({ siteInfo }: HomeHeroClientProps) {
  const { t, getText } = useLanguage();

  const period = getText(siteInfo.festivalPeriod, siteInfo.festivalPeriodEn);
  const location = getText(siteInfo.locationSummary, siteInfo.locationSummaryEn);

  return (
    <section className="relative overflow-hidden bg-[#E6007E] text-white">
      {/* Upper Hero Area: Spill Over Branding + Visual Poster + Key Info */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 pb-14 sm:pb-20 relative z-10">
        
        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
          
          {/* Left Column: Official Spill Over SVG Vector + Visual Artwork */}
          <div className="lg:col-span-7 space-y-6 flex flex-col items-center lg:items-start text-center lg:text-left">
            
            {/* Official Spill Over Vector Graphic */}
            <div className="w-full max-w-md sm:max-w-xl md:max-w-2xl px-2">
              <div className="relative w-full aspect-[510/174]">
                <Image
                  src="/images/spillover.svg"
                  alt="Spill Over - 文化芸術が街にあふれだす"
                  fill
                  priority
                  className="object-contain"
                />
              </div>
            </div>

            {/* Poster Main Artwork Container */}
            <div className="relative w-full max-w-lg aspect-square rounded-3xl overflow-hidden shadow-2xl bg-white group">
              <Image
                src="/images/osakafringe_visuals.webp"
                alt="Osaka Fringe 2026 Official Visual"
                fill
                priority
                className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              />
            </div>
          </div>

          {/* Right Column: Festival Identity, Dates & Main CTA */}
          <div className="lg:col-span-5 space-y-8 text-center lg:text-left flex flex-col items-center lg:items-start justify-center">
            
            {/* Tagline & Core Statement */}
            <div className="space-y-4">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight drop-shadow-sm">
                街の一角を、<br className="hidden sm:inline" />世界の舞台へ。
              </h2>
              
              <p className="text-base sm:text-lg text-white/90 font-medium leading-relaxed">
                劇場だけでなく街中のあらゆる場所を舞台に。プロ・アマ問わずアーティストが自由に参加するオープンアクセス型芸術祭。
              </p>
            </div>

            {/* Official Osaka Fringe Logo (White) */}
            <div className="w-full max-w-md">
              <div className="relative w-full aspect-[321.73/49.5] filter brightness-0 invert">
                <Image
                  src="/images/osakafringe04.svg"
                  alt="Osaka Fringe"
                  fill
                  priority
                  className="object-contain object-center lg:object-left"
                />
              </div>
            </div>

            {/* Official Date & Area Graphic Vector (date.svg) */}
            <div className="w-full max-w-md">
              <div className="relative w-full aspect-[440.57/147.26]">
                <Image
                  src="/images/date.svg"
                  alt="2026 10.8 THU - 11.8 SUN 南大阪エリア・阿倍野・天王寺・新世界・西成"
                  fill
                  priority
                  className="object-contain object-center lg:object-left"
                />
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="w-full flex flex-col sm:flex-row gap-3.5 pt-2">
              <Link
                href="/audience"
                className="flex-1 px-8 py-4.5 rounded-2xl bg-white hover:bg-[#FFF100] text-[#E6007E] hover:text-black font-black text-base shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2.5 cursor-pointer group"
              >
                <span>{t('heroOpenAudience')}</span>
                <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/venues"
                className="px-7 py-4.5 rounded-2xl bg-black/40 hover:bg-black/60 text-white font-bold text-base border border-white/30 backdrop-blur-md shadow-md hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2.5 cursor-pointer"
              >
                <span>{t('heroVenuesMap')}</span>
              </Link>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}