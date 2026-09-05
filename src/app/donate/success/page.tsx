'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { Heart, Sparkles, Home, Compass, CheckCircle } from 'lucide-react';

export default function DonateSuccessPage() {
  const { t } = useLanguage();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center space-y-10">
      {/* Celebration Icon */}
      <div className="relative inline-block">
        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-tr from-[#E6007E] to-rose-400 text-white flex items-center justify-center shadow-2xl shadow-pink-500/30 mx-auto animate-bounce-short">
          <Heart className="w-12 h-12 sm:w-14 sm:h-14 fill-white" />
        </div>
        <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md">
          <CheckCircle className="w-5 h-5" />
        </div>
      </div>

      {/* Title & Message */}
      <div className="space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-pink-50 border border-pink-200 text-[#E6007E] text-xs font-black uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{t('successBadge')}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          {t('successTitle')}
        </h1>
        <p className="text-sm sm:text-base text-slate-600 font-bold max-w-xl mx-auto">
          {t('successSubtitle')}
        </p>
      </div>

      {/* Description Box */}
      <div className="bg-gradient-to-b from-pink-50/50 to-white border border-pink-100 rounded-3xl p-8 sm:p-10 text-left space-y-6 shadow-sm">
        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
          {t('successDesc')}
        </p>

        <div className="p-4 rounded-2xl bg-white border border-pink-200/60 text-xs text-slate-500 space-y-1">
          <p className="font-bold text-slate-700">✉️ {t('successReceiptNote')}</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
        <Link
          href="/audience"
          className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#E6007E] hover:bg-pink-600 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-pink-500/25 transition-all transform active:scale-95"
        >
          <Compass className="w-4 h-4" />
          <span>{t('successExploreShows')}</span>
        </Link>
        <Link
          href="/"
          className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-sm flex items-center justify-center gap-2 transition-all"
        >
          <Home className="w-4 h-4" />
          <span>{t('successBackHome')}</span>
        </Link>
      </div>
    </div>
  );
}
