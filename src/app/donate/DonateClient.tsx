'use client';

import React from 'react';
import { SiteInfo } from '@/types';
import { useLanguage } from '@/context/LanguageContext';
import { Heart, Landmark, Sparkles, ShieldCheck } from 'lucide-react';

interface DonateClientProps {
  siteInfo: SiteInfo;
}

export default function DonateClient({ siteInfo }: DonateClientProps) {
  const { t, getText } = useLanguage();

  const title = getText(siteInfo.donationTitle, siteInfo.donationTitleEn);
  const text = getText(siteInfo.donationText, siteInfo.donationTextEn);
  const bankInfo = getText(siteInfo.donationBankInfo, siteInfo.donationBankInfoEn);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-50 border border-pink-200 text-[#E6007E] text-xs font-black uppercase tracking-wider">
          <Heart className="w-3.5 h-3.5" />
          <span>{t('donatePageBadge')}</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
          {title || t('donatePageTitle')}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-xl mx-auto">
          {t('donatePageSubtitle')}
        </p>
      </div>

      {/* Philosophy Card */}
      <div className="bg-gradient-to-r from-[#E6007E] via-rose-500 to-purple-600 rounded-3xl p-8 sm:p-12 text-white shadow-xl shadow-pink-500/15 space-y-6">
        <div className="max-w-3xl space-y-4">
          <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-black">
            MESSAGE
          </span>
          <h2 className="text-2xl sm:text-3xl font-black">
            {t('donateMessageHeader')}
          </h2>
          <p className="text-sm sm:text-base text-pink-100 leading-relaxed font-medium whitespace-pre-line">
            {text}
          </p>
        </div>
      </div>

      {/* Purpose of donations */}
      <div className="space-y-6">
        <div className="text-center space-y-1">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">{t('donatePurpose')}</h2>
          <p className="text-xs text-slate-500 font-medium">{t('donatePurposeSub')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-pink-100 rounded-3xl p-6 sm:p-8 space-y-3 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-pink-50 border border-pink-200 flex items-center justify-center text-[#E6007E]">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-slate-900">{t('impact1Title')}</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">{t('impact1Desc')}</p>
          </div>

          <div className="bg-white border border-purple-100 rounded-3xl p-6 sm:p-8 space-y-3 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-slate-900">{t('impact2Title')}</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">{t('impact2Desc')}</p>
          </div>
        </div>
      </div>

      {/* Bank Transfer Section */}
      <div className="space-y-6">
        <div className="text-center space-y-1">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">{t('donateMethods')}</h2>
          <p className="text-xs text-slate-500 font-medium">{t('bankTransferSub')}</p>
        </div>

        <div className="bg-slate-50 border border-pink-100 rounded-3xl p-8 sm:p-10 space-y-6 shadow-xs max-w-3xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#E6007E] text-white flex items-center justify-center shadow-sm">
              <Landmark className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">{t('bankTransferTitle')}</h3>
              <p className="text-xs text-slate-500">{t('bankTransferSub')}</p>
            </div>
          </div>

          <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 space-y-3 shadow-xs">
            <pre className="text-xs sm:text-sm font-bold text-slate-800 whitespace-pre-wrap font-mono leading-relaxed">
              {bankInfo || `金融機関名：大阪シティ信用金庫\n支店名：阿倍野支店\n口座種別：普通預金\n口座番号：8173108\n口座名義：オオサカブンカフリンジキコウセツリツジュンビシツ\n（大阪文化フリンジ機構設立準備室）`}
            </pre>
          </div>

          <p className="text-xs text-slate-500 font-medium leading-relaxed">
            {t('bankTransferNotice')}
          </p>
        </div>
      </div>
    </div>
  );
}