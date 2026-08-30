'use client';

import React from 'react';
import { Award } from '@/types';
import { useLanguage } from '@/context/LanguageContext';
import { Trophy, Sparkles } from 'lucide-react';

interface AwardsClientProps {
  awards: Award[];
}

export default function AwardsClient({ awards }: AwardsClientProps) {
  const { t, getText } = useLanguage();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Header */}
      <div className="text-center space-y-3">
        <span className="px-3 py-1 rounded-full bg-amber-950 border border-amber-600/50 text-amber-300 text-xs font-bold">
          {t('awardsPageBadge')}
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-white">{t('awardsPageTitle')}</h1>
        <p className="text-sm text-slate-400 max-w-xl mx-auto">
          {t('awardsPageSubtitle')}
        </p>
      </div>

      {/* Awards Info Grid */}
      <div className="bg-slate-900 border border-purple-900/40 rounded-3xl p-6 sm:p-10 space-y-8 shadow-2xl">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-400" />
          <span>{t('awardsOverview')}</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 bg-slate-950 rounded-2xl border border-amber-900/40 space-y-2">
            <h3 className="text-base font-bold text-amber-300">{t('grandPrixTitle')}</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {t('grandPrixDesc')}
            </p>
          </div>
          <div className="p-5 bg-slate-950 rounded-2xl border border-pink-900/40 space-y-2">
            <h3 className="text-base font-bold text-pink-300">{t('audienceChoiceTitle')}</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {t('audienceChoiceDesc')}
            </p>
          </div>
          <div className="p-5 bg-slate-950 rounded-2xl border border-purple-900/40 space-y-2">
            <h3 className="text-base font-bold text-purple-300">{t('innovationTitle')}</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {t('innovationDesc')}
            </p>
          </div>
        </div>

        {/* Coming Soon Notice when 0 past awards */}
        {awards.length === 0 && (
          <div className="p-6 bg-slate-950/80 rounded-2xl border border-amber-800/40 text-center space-y-2">
            <Sparkles className="w-6 h-6 text-amber-400 mx-auto animate-pulse" />
            <p className="text-sm font-bold text-amber-300">{t('awardsComingSoon')}</p>
          </div>
        )}
      </div>
    </div>
  );
}