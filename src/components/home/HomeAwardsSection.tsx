'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '@/context/LanguageContext';
import { FRINGE_AWARDS_2026, FringeAward } from '@/data/postEventData';
import { Award, Gift, CheckCircle, ArrowRight, User } from 'lucide-react';

interface HomeAwardsSectionProps {
  awards?: FringeAward[];
}

export default function HomeAwardsSection({
  awards = FRINGE_AWARDS_2026,
}: HomeAwardsSectionProps) {
  const { t, language } = useLanguage();

  return (
    <section id="awards" className="scroll-mt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-100 text-[#E6007E] text-xs font-black uppercase tracking-wider">
          <Award className="w-3.5 h-3.5" />
          <span>FRINGE AWARDS 2026</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
          {t('awardsSectionHeading')}
        </h2>
        <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed">
          {t('awardsSectionDesc')}
        </p>
      </div>

      {/* 4 Awards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
        {awards.map((award, index) => {
          const awardName = language === 'en' ? award.nameEn : award.name;
          const awardCategory = language === 'en' ? award.categoryEn : award.category;
          const awardTarget = language === 'en' ? award.targetEn : award.target;
          const awardSelection = language === 'en' ? award.selectionEn : award.selection;
          const awardPrize = language === 'en' ? award.prizeEn : award.prize;

          return (
            <div
              key={award.id}
              className="bg-white rounded-3xl p-7 sm:p-9 border-2 border-slate-100 shadow-sm hover:shadow-xl hover:border-pink-200 transition-all flex flex-col justify-between space-y-6 relative overflow-hidden"
            >
              {/* Top Accent Strip */}
              <div
                className="absolute top-0 inset-x-0 h-1.5"
                style={{ backgroundColor: award.color }}
              />

              <div className="space-y-5">
                {/* Header & Badges */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span
                      className="px-2.5 py-1 rounded-lg text-white text-[11px] font-black uppercase tracking-wider"
                      style={{ backgroundColor: award.color }}
                    >
                      {language === 'en' ? award.badgeEn : award.badge}
                    </span>
                    <span className="text-xs font-bold text-slate-400">
                      {awardCategory}
                    </span>
                  </div>
                  <span className="text-xs font-black text-slate-300">
                    0{index + 1}
                  </span>
                </div>

                {/* Award Title */}
                <div className="space-y-1">
                  <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    {awardName}
                  </h3>
                  {language === 'ja' && (
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      {award.nameEn}
                    </p>
                  )}
                </div>

                {/* Target & Criteria */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-3 text-xs sm:text-sm">
                  <div className="space-y-1">
                    <div className="text-[11px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5 text-[#E6007E]" />
                      <span>{t('awardsTargetLabel')}</span>
                    </div>
                    <p className="font-bold text-slate-800 leading-relaxed">
                      {awardTarget}
                    </p>
                  </div>

                  {awardSelection && (
                    <div className="space-y-1 pt-2 border-t border-slate-200/60">
                      <div className="text-[11px] font-black text-slate-500 uppercase tracking-wider">
                        {t('awardsSelectionLabel')}
                      </div>
                      <p className="font-medium text-slate-700">
                        {awardSelection}
                      </p>
                    </div>
                  )}
                </div>

                {/* Prize Info */}
                <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-pink-50/70 border border-pink-100 text-xs sm:text-sm">
                  <Gift className="w-4 h-4 text-[#E6007E] shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <span className="text-[11px] font-black text-[#E6007E] uppercase tracking-wider block">
                      {t('awardsPrizeLabel')}
                    </span>
                    <span className="font-bold text-slate-900">
                      {awardPrize}
                    </span>
                  </div>
                </div>

                {/* Winner Card Area (Gracefully renders if winner data is present) */}
                {award.winner ? (
                  <div className="mt-4 p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50/40 border border-amber-200 space-y-3">
                    <div className="text-[11px] font-black text-amber-800 uppercase tracking-wider">
                      WINNER / 受賞公演
                    </div>
                    <div className="flex items-center gap-3">
                      {award.winner.image && (
                        <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-slate-200">
                          <Image
                            src={award.winner.image}
                            alt={award.winner.performanceTitle || 'Winner'}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                      <div className="space-y-1 min-w-0">
                        <div className="font-black text-slate-900 text-base truncate">
                          {language === 'en'
                            ? award.winner.performanceTitleEn || award.winner.performanceTitle
                            : award.winner.performanceTitle}
                        </div>
                        <div className="text-xs font-bold text-slate-600 truncate flex items-center gap-1">
                          <User className="w-3 h-3 text-slate-400" />
                          <span>
                            {language === 'en'
                              ? award.winner.artistNameEn || award.winner.artistName
                              : award.winner.artistName}
                          </span>
                        </div>
                      </div>
                    </div>
                    {award.winner.citation && (
                      <p className="text-xs text-slate-700 leading-relaxed font-medium italic pt-1 border-t border-amber-200/60">
                        {language === 'en'
                          ? award.winner.citationEn || award.winner.citation
                          : award.winner.citation}
                      </p>
                    )}
                    {award.winner.performanceId && (
                      <Link
                        href={`/performances/${award.winner.performanceId}`}
                        className="inline-flex items-center gap-1 text-xs font-black text-amber-900 hover:underline pt-1"
                      >
                        <span>公演詳細を見る</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    )}
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
