'use client';

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { FRINGE_2027_SCHEDULE } from '@/data/postEventData';
import { Calendar, MapPin, Sparkles, Clock, Building2, Users, FileText, CheckCircle2 } from 'lucide-react';

export default function Home2027Section() {
  const { t, language } = useLanguage();

  const getTargetIcon = (targetType: string) => {
    switch (targetType) {
      case 'venue':
        return Building2;
      case 'artist_venue':
        return Users;
      case 'program':
        return FileText;
      case 'additional':
        return Clock;
      case 'festival':
        return Sparkles;
      default:
        return Calendar;
    }
  };

  const getTargetBadgeStyle = (targetType: string) => {
    switch (targetType) {
      case 'venue':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'artist_venue':
        return 'bg-pink-100 text-[#E6007E] border-pink-200';
      case 'program':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'additional':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'festival':
        return 'bg-[#FFF100] text-slate-950 border-amber-300 font-black';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <section id="fringe2027" className="scroll-mt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-100 text-[#E6007E] text-xs font-black uppercase tracking-wider">
          <Calendar className="w-3.5 h-3.5" />
          <span>NEXT EDITION</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
          {t('fringe2027Heading')}
        </h2>
        <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed">
          {language === 'en'
            ? 'Next year’s festival dates and participation timeline for venues, artists, and creators.'
            : '2027年の開催日程と、会場・アーティストの参加スケジュールをお知らせします。'}
        </p>
      </div>

      {/* Overview Cards: Dates & Locations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Date Card */}
        <div className="bg-gradient-to-br from-pink-500 to-[#E6007E] text-white rounded-3xl p-7 sm:p-9 shadow-lg shadow-pink-500/15 space-y-4">
          <div className="flex items-center gap-2 text-pink-200 text-xs font-black uppercase tracking-wider">
            <Calendar className="w-4 h-4" />
            <span>{t('fringe2027PeriodLabel')}</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black tracking-tight leading-snug">
            {t('fringe2027PeriodValue')}
          </div>
          <p className="text-xs sm:text-sm text-pink-100 font-medium leading-relaxed">
            {language === 'en'
              ? 'A month-long open access festival taking place in autumn 2027.'
              : '2027年秋、大阪の街じゅうを舞台にした1か月間のオープンアクセス型芸術祭。'}
          </p>
        </div>

        {/* Location Card */}
        <div className="bg-white rounded-3xl p-7 sm:p-9 border-2 border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-[#E6007E] text-xs font-black uppercase tracking-wider">
            <MapPin className="w-4 h-4" />
            <span>{t('fringe2027LocationLabel')}</span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug">
            {t('fringe2027LocationValue')}
          </div>
          <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
            {language === 'en'
              ? 'Any space can be a stage. Partner venues will be registered across Osaka.'
              : '既存の劇場から日常の空間まで。大阪市内全域で多様な会場とアーティストが繋がります。'}
          </p>
        </div>
      </div>

      {/* Participation Timeline Container */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border-2 border-slate-100 shadow-sm space-y-8">
        <div className="space-y-1 border-b border-slate-100 pb-4">
          <div className="text-xs font-black text-[#E6007E] uppercase tracking-wider">
            TIMELINE / SCHEDULE
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900">
            {t('fringe2027ScheduleHeading')}
          </h3>
        </div>

        {/* Timeline Items */}
        <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-2.5 sm:before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-pink-200">
          {FRINGE_2027_SCHEDULE.map((item, idx) => {
            const Icon = getTargetIcon(item.targetType);
            const badgeStyle = getTargetBadgeStyle(item.targetType);
            const dateStr = language === 'en' ? item.dateEn : item.date;
            const titleStr = language === 'en' ? item.titleEn : item.title;
            const descStr = language === 'en' ? item.descriptionEn : item.description;
            const targetStr = language === 'en' ? item.targetLabelEn : item.targetLabel;

            return (
              <div key={idx} className="relative group">
                {/* Timeline Dot */}
                <div
                  className={`absolute -left-[27px] sm:-left-[35px] top-1.5 w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center border-2 ${
                    item.isMainEvent
                      ? 'bg-[#E6007E] border-white shadow-md text-white'
                      : 'bg-white border-[#E6007E] text-[#E6007E]'
                  }`}
                >
                  <Icon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                </div>

                {/* Timeline Card */}
                <div
                  className={`p-5 sm:p-6 rounded-2xl border transition-all ${
                    item.isMainEvent
                      ? 'bg-gradient-to-br from-pink-50/80 via-white to-pink-50/40 border-pink-300 shadow-sm'
                      : 'bg-slate-50/70 hover:bg-white border-slate-100 hover:border-pink-200 shadow-2xs'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2.5 mb-2">
                    <span className="text-xs sm:text-sm font-black text-[#E6007E] tracking-tight">
                      {dateStr}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${badgeStyle}`}
                    >
                      {targetStr}
                    </span>
                  </div>

                  <h4 className="text-base sm:text-xl font-black text-slate-900 tracking-tight leading-snug mb-1">
                    {titleStr}
                  </h4>

                  <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                    {descStr}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Notice Note */}
        <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-xs sm:text-sm text-amber-900 font-medium leading-relaxed">
          {t('fringe2027Note')}
        </div>
      </div>
    </section>
  );
}
