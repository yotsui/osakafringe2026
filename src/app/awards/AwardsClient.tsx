'use client';

import React from 'react';
import { Award } from '@/types';
import { useLanguage } from '@/context/LanguageContext';
import { Trophy, Award as AwardIcon, Sparkles, Star, Compass, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface AwardsClientProps {
  awards: Award[];
}

export default function AwardsClient({ awards }: AwardsClientProps) {
  const { t } = useLanguage();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-50 border border-pink-200 text-pink-600 text-xs font-black uppercase tracking-wider">
          <Trophy className="w-3.5 h-3.5" />
          <span>{t('awardsPageBadge')}</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
          {t('awardsPageTitle')}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-xl mx-auto">
          {t('awardsPageSubtitle')}
        </p>
      </div>

      {/* Awards Showcase Categories */}
      <div className="space-y-6">
        <div className="text-center space-y-1">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            {t('awardsOverview')}
          </h2>
          <p className="text-xs text-slate-500 font-medium">3つの主要アワード部門</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Grand Prix */}
          <div className="relative rounded-3xl bg-white border border-pink-100 p-8 space-y-4 shadow-xs hover:shadow-lg transition-all">
            <div className="w-12 h-12 rounded-2xl bg-pink-50 border border-pink-200 flex items-center justify-center text-pink-600 shadow-xs">
              <Trophy className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-black text-slate-900">{t('grandPrixTitle')}</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                {t('grandPrixDesc')}
              </p>
            </div>
          </div>

          {/* Audience Choice */}
          <div className="relative rounded-3xl bg-white border border-pink-100 p-8 space-y-4 shadow-xs hover:shadow-lg transition-all">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600 shadow-xs">
              <Star className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-black text-slate-900">{t('audienceChoiceTitle')}</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                {t('audienceChoiceDesc')}
              </p>
            </div>
          </div>

          {/* Innovation */}
          <div className="relative rounded-3xl bg-white border border-pink-100 p-8 space-y-4 shadow-xs hover:shadow-lg transition-all">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shadow-xs">
              <Sparkles className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-black text-slate-900">{t('innovationTitle')}</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                {t('innovationDesc')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Coming Soon Notice */}
      <div className="rounded-3xl bg-slate-50 border border-pink-100 p-8 sm:p-12 text-center space-y-6">
        <div className="max-w-xl mx-auto space-y-3">
          <AwardIcon className="w-10 h-10 text-pink-600 mx-auto animate-bounce" />
          <h3 className="text-xl font-black text-slate-900">
            第1回 大阪文化万博フリンジアワード 審査準備中
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
            {t('awardsComingSoon')}
          </p>
        </div>
        <Link
          href="/audience"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-pink-600 hover:bg-pink-700 text-white font-black text-xs shadow-md transition-all"
        >
          <Compass className="w-4 h-4" />
          <span>Audience App で公演一覧を見る</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}